import { Bookmark, IndianRupee, MapPin, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSavedColleges } from '../context/SavedCollegesContext.jsx';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function CollegeCard({ college }) {
  const { isSaved, toggleSaved } = useSavedColleges();
  const saved = isSaved(college.id);

  return (
    <article className="card flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-card">
      <div className="h-32 bg-slate-200 dark:bg-slate-800">
        {college.image ? (
          <img src={college.image} alt={college.logo} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#0e7490,#f97316)] text-lg font-bold text-white">
            {college.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100">{college.type}</p>
            <Link to={`/colleges/${college.id}`} className="mt-1 block text-lg font-bold leading-snug hover:text-brand-700 dark:hover:text-brand-100">
              {college.name}
            </Link>
          </div>
          <button type="button" onClick={() => toggleSaved(college)} className={`rounded-lg border p-2 transition ${saved ? 'border-signal-500 bg-signal-500 text-white' : 'border-slate-200 text-slate-500 hover:text-brand-700 dark:border-slate-700'}`} aria-label="Save college">
            <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-2"><MapPin size={16} /> {college.location.city}, {college.location.state}</span>
          <span className="flex items-center gap-2"><IndianRupee size={16} />  ₹{formatCurrency(college.fees.min)} - ₹{formatCurrency(college.fees.max)}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-100">
            <Star size={14} fill="currentColor" /> {college.rating ?? 'N/A'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100">
            <TrendingUp size={14} /> {formatPercent(college.placements?.placementRate || 0)} placed
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
  {college.courses.slice(0, 3).map((course) => (
    <span
      key={course.id}
      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
    >
      {course.name}
    </span>
  ))}
</div>
      </div>
    </article>
  );
}
