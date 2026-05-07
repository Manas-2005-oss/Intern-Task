from __future__ import annotations

PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 64
# bcrypt accepts only up to 72 bytes; longer input can error or truncate depending on backend.
BCRYPT_MAX_BYTES = 72


def validate_password_for_bcrypt(password: str) -> str:
    """
    Centralized password validation for all layers (schema + service).
    Raises ValueError with user-safe messages on invalid input.
    """
    if len(password) < PASSWORD_MIN_LENGTH:
        raise ValueError(f"Password must be at least {PASSWORD_MIN_LENGTH} characters long.")
    if len(password) > PASSWORD_MAX_LENGTH:
        raise ValueError(f"Password must be at most {PASSWORD_MAX_LENGTH} characters long.")
    if len(password.encode("utf-8")) > BCRYPT_MAX_BYTES:
        raise ValueError(
            "Password is too long when UTF-8 encoded. Use fewer characters or avoid multi-byte symbols."
        )
    return password

