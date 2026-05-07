from __future__ import annotations

import argparse
import asyncio
import copy
import json
import os
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv


DEFAULT_MIN_COLLEGES = 15


def infer_db_name(mongo_url: str, mongo_db_name: Optional[str]) -> str:
    parsed = urlparse(mongo_url)
    db_from_url = (parsed.path or "").lstrip("/")
    if db_from_url:
        return db_from_url
    if mongo_db_name:
        return mongo_db_name
    raise RuntimeError("MongoDB database name missing. Provide MONGO_DB_NAME or include /<db> in MONGO_URL.")


def load_fallback_colleges(repo_root: Path) -> List[Dict[str, Any]]:
    proc = subprocess.run(
        [
            "node",
            "--input-type=module",
            "-e",
            (
                "import { fallbackColleges } from './src/data/fallbackColleges.js';"
                "process.stdout.write(JSON.stringify(fallbackColleges));"
            ),
        ],
        cwd=str(repo_root),
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            "Failed to load fallbackColleges.js via Node import.\n"
            f"Exit code: {proc.returncode}\n"
            f"stderr: {proc.stderr.strip()}"
        )
    payload = json.loads(proc.stdout)
    if not isinstance(payload, list):
        raise RuntimeError("fallbackColleges export is not an array.")
    return payload


def normalize_college(college: Dict[str, Any]) -> Dict[str, Any]:
    out = copy.deepcopy(college)
    out["id"] = str(out.get("id"))

    placements = out.get("placements") or {}
    if "placementRate" not in out and "placementRate" in placements:
        out["placementRate"] = placements.get("placementRate")

    if "image" not in out and out.get("coverImage"):
        out["image"] = out.get("coverImage")

    if "overview" not in out and out.get("description"):
        out["overview"] = out.get("description")

    return out


def ensure_minimum_colleges(colleges: List[Dict[str, Any]], minimum: int) -> List[Dict[str, Any]]:
    """
    If frontend mock data has fewer than `minimum` colleges, derive additional
    deterministic records from existing data so seed output always meets minimum.
    """
    if len(colleges) >= minimum:
        return colleges

    extended = copy.deepcopy(colleges)
    seed_idx = 0
    while len(extended) < minimum:
        base = copy.deepcopy(colleges[seed_idx % len(colleges)])
        next_id = str(len(extended) + 1)
        base["id"] = next_id
        base["slug"] = f"{base.get('slug', 'college')}-alt-{next_id}"
        base["name"] = f"{base.get('name', 'College')} (Alt {next_id})"
        extended.append(base)
        seed_idx += 1
    return extended


def build_upserts(colleges: List[Dict[str, Any]]) -> List[UpdateOne]:
    ops: List[UpdateOne] = []
    for c in colleges:
        college_id = str(c.get("id") or "").strip()
        if not college_id:
            continue
        ops.append(UpdateOne({"id": college_id}, {"$set": c}, upsert=True))
    return ops


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed CampusIQ colleges from frontend fallback data.")
    parser.add_argument("--driver", choices=["motor", "pymongo"], default="motor", help="MongoDB driver mode")
    parser.add_argument("--min-colleges", type=int, default=DEFAULT_MIN_COLLEGES, help="Minimum number of colleges to seed")
    parser.add_argument("--drop-first", action="store_true", help="Drop colleges collection before seeding")
    return parser.parse_args()


async def seed_with_motor(mongo_url: str, db_name: str, colleges: List[Dict[str, Any]], drop_first: bool) -> None:
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    col = db["colleges"]

    if drop_first:
        await col.drop()

    await col.create_index("id", unique=True)
    ops = build_upserts(colleges)
    if not ops:
        raise RuntimeError("No valid college records with `id` found.")

    result = await col.bulk_write(ops, ordered=False)
    upserted = len(result.upserted_ids) if result.upserted_ids else 0
    print(f"[motor] Seeded colleges. matched={result.matched_count} modified={result.modified_count} upserted={upserted}")
    client.close()


def seed_with_pymongo(mongo_url: str, db_name: str, colleges: List[Dict[str, Any]], drop_first: bool) -> None:
    client = MongoClient(mongo_url)
    db = client[db_name]
    col = db["colleges"]

    if drop_first:
        col.drop()

    col.create_index("id", unique=True)
    ops = build_upserts(colleges)
    if not ops:
        raise RuntimeError("No valid college records with `id` found.")

    result = col.bulk_write(ops, ordered=False)
    upserted = len(result.upserted_ids) if result.upserted_ids else 0
    print(f"[pymongo] Seeded colleges. matched={result.matched_count} modified={result.modified_count} upserted={upserted}")
    client.close()


def main() -> None:
    args = parse_args()
    repo_root = Path(__file__).resolve().parents[2]
    backend_root = repo_root / "backend"

    # Load env vars for script execution without requiring manual export.
    # Priority: current environment > backend/.env > repo/.env
    load_dotenv(backend_root / ".env", override=False)
    load_dotenv(repo_root / ".env", override=False)

    mongo_url = os.getenv("MONGO_URL")
    if not mongo_url:
        raise RuntimeError("Missing MONGO_URL environment variable. Add it to backend/.env or export it before running.")

    mongo_db_name = os.getenv("SEED_MONGO_DB_NAME") or os.getenv("MONGO_DB_NAME")
    db_name = infer_db_name(mongo_url, mongo_db_name)

    colleges = load_fallback_colleges(repo_root)
    colleges = [normalize_college(c) for c in colleges]
    colleges = ensure_minimum_colleges(colleges, args.min_colleges)

    if len(colleges) < args.min_colleges:
        raise RuntimeError(f"Expected at least {args.min_colleges} colleges to seed; found {len(colleges)}.")

    print(f"Loaded {len(colleges)} colleges from frontend data. Seeding db={db_name} via {args.driver}...")
    if args.driver == "motor":
        asyncio.run(seed_with_motor(mongo_url, db_name, colleges, args.drop_first))
    else:
        seed_with_pymongo(mongo_url, db_name, colleges, args.drop_first)


if __name__ == "__main__":
    main()

