import { Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/StateBlocks.jsx';
import { useSavedColleges } from '../context/SavedCollegesContext.jsx';
import { getColleges } from '../services/collegeService';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function Compare() {
  const { savedColleges } = useSavedColleges();
  const [allColleges, setAllColleges] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => savedColleges.slice(0, 3).map((college) => college.id));

  useEffect(() => {
    getColleges({ limit: 30 }).then((result) => setAllColleges(result.items));
  }, []);

  const selected = useMemo(() => allColleges.filter((college) => selectedIds.includes(college.id)), [allColleges, selectedIds]);

  const addCollege = (id) => {
    if (!id || selectedIds.includes(id) || selectedIds.length >= 3) return;
    setSelectedIds([...selectedIds, id]);
  };

  const rows = [
    ['Location', (college) => college.location],
    ['Fees', (college) => formatCurrency(college.fees)],
    ['Placement %', (college) => formatPercent(college.placementRate)],
    ['Rating', (college) => college.rating ?? 'N/A'],
    ['Courses', (college) => college.courses.slice(0, 4).join(', ') || 'Pending'],
  ];

  return (
    <section className="container-page py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100">Decision table</p>
        <h1 className="mt-1 text-3xl font-bold">Compare colleges side by side</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Pick up to three colleges and evaluate fees, placements, ratings, location, and course breadth without losing context.</p>
      </div>

      <div className="sticky top-16 z-30 mb-5 rounded-lg border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select className="input" onChange={(event) => { addCollege(event.target.value); event.target.value = ''; }} defaultValue="">
            <option value="">Add college to compare</option>
            {allColleges.filter((college) => !selectedIds.includes(college.id)).map((college) => (
              <option key={college.id} value={college.id}>{college.name}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {selected.map((college) => (
              <span key={college.id} className="inline-flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-100">
                {college.name}
                <button type="button" onClick={() => setSelectedIds(selectedIds.filter((id) => id !== college.id))} aria-label={`Remove ${college.name}`}>
                  <X size={15} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {selected.length === 0 ? (
        <EmptyState title="No colleges selected" message="Add colleges from the dropdown or save colleges while browsing to build a comparison." action={<span className="button-secondary"><Plus size={16} /> Add up to three</span>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="w-44 p-4 text-sm font-bold text-slate-500 dark:text-slate-400">Decision factor</th>
                {selected.map((college) => (
                  <th key={college.id} className="p-4 align-top">
                    <p className="text-lg font-bold">{college.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{college.type}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, getter]) => (
                <tr key={label} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="p-4 text-sm font-bold text-slate-500 dark:text-slate-400">{label}</td>
                  {selected.map((college) => (
                    <td key={`${college.id}-${label}`} className="p-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{getter(college)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
