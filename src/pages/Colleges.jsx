import { Grid2X2, List, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import { EmptyState, ErrorState, LoadingGrid } from '../components/StateBlocks.jsx';
import { getColleges } from '../services/collegeService';

const initialFilters = { location: '', course: '', fees: '' };

export default function Colleges() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    course: searchParams.get('course') || '',
    fees: searchParams.get('fees') || '',
  });
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], totalPages: 1, source: 'api' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(() => ({ search, ...filters, page, limit: 9 }), [search, filters, page]);

  useEffect(() => {
    const next = {};
    Object.entries({ search, ...filters }).forEach(([key, value]) => {
      if (value) next[key] = value;
    });
    setSearchParams(next, { replace: true });
  }, [search, filters, setSearchParams]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    getColleges(params)
      .then((data) => {
        if (!active) return;
        setResult(data);
        if (data.warning) setError(`Using local fallback data because the API is unavailable: ${data.warning}`);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [params]);

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearch('');
    setPage(1);
  };

  return (
    <section className="container-page py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100">College search</p>
          <h1 className="mt-1 text-3xl font-bold">Find your strongest-fit colleges</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Filter by location, budget, and course while keeping placement and rating context visible.</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          <button type="button" onClick={() => setView('grid')} className={`rounded-md p-2 ${view === 'grid' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100' : 'text-slate-500'}`} aria-label="Grid view"><Grid2X2 size={18} /></button>
          <button type="button" onClick={() => setView('list')} className={`rounded-md p-2 ${view === 'list' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100' : 'text-slate-500'}`} aria-label="List view"><List size={18} /></button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <FilterPanel filters={filters} onChange={(next) => { setFilters(next); setPage(1); }} onReset={resetFilters} />
        <div className="space-y-4">
          <div className="card flex items-center gap-3 p-3">
            <Search className="text-slate-400" size={18} />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="h-10 flex-1 bg-transparent text-sm outline-none" placeholder="Search by college name" />
          </div>
          {error && <ErrorState message={error} />}
          {isLoading ? <LoadingGrid /> : result.items.length === 0 ? (
            <EmptyState title="No colleges matched" message="Try removing a filter or searching with a broader course or location." />
          ) : (
            <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-4'}>
              {result.items.map((college) => <CollegeCard key={college.id} college={college} />)}
            </div>
          )}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="button-secondary">Previous</button>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Page {page} of {result.totalPages}</span>
              <button type="button" disabled={page === result.totalPages} onClick={() => setPage((value) => value + 1)} className="button-secondary">Next</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
