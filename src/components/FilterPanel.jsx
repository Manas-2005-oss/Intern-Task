import { SlidersHorizontal } from 'lucide-react';

export default function FilterPanel({ filters, onChange, onReset }) {
  const update = (event) => {
    onChange({ ...filters, [event.target.name]: event.target.value });
  };

  return (
    <aside className="card p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold"><SlidersHorizontal size={16} /> Filters</h2>
        <button type="button" onClick={onReset} className="text-sm font-semibold text-brand-700 dark:text-brand-100">Reset</button>
      </div>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1.5 text-sm font-medium">
          Location
          <input name="location" value={filters.location} onChange={update} className="input" placeholder="City or state" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Course
          <input name="course" value={filters.course} onChange={update} className="input" placeholder="CSE, MBA, BBA" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Max annual fees
          <select name="fees" value={filters.fees} onChange={update} className="input">
            <option value="">Any budget</option>
            <option value="200000">Under 2L</option>
            <option value="350000">Under 3.5L</option>
            <option value="600000">Under 6L</option>
          </select>
        </label>
      </div>
    </aside>
  );
}
