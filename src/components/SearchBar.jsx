import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search colleges, courses, locations' }) {
  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 rounded-lg border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
      <div className="flex flex-1 items-center gap-2 px-2">
        <Search className="text-slate-400" size={20} />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full bg-transparent text-sm outline-none" placeholder={placeholder} />
      </div>
      <button type="submit" className="button-primary">Search</button>
    </form>
  );
}
