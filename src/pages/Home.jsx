import { ArrowRight, BarChart3, BookmarkCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { LoadingGrid } from '../components/StateBlocks.jsx';
import { getColleges } from '../services/collegeService';

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getColleges({ limit: 3 }).then((result) => {
      if (active) setFeatured(result.items.slice(0, 3));
    }).finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = (event) => {
    event.preventDefault();
    navigate(`/colleges${query ? `?search=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <>
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-100">
              <Sparkles size={16} /> College decisions with signal, not noise
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover, compare, and shortlist colleges in one decision workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              CampusIQ combines search, filters, placement signals, fee context, ratings, and saved colleges so students can move from scattered research to a confident decision.
            </p>
            <div className="mt-8 max-w-2xl">
              <SearchBar value={query} onChange={setQuery} onSubmit={onSubmit} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
              {['Engineering', 'MBA', 'BBA', 'Computer Science'].map((item) => (
                <button key={item} type="button" onClick={() => navigate(`/colleges?course=${item}`)} className="rounded-lg border border-slate-200 px-3 py-2 font-medium hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:hover:text-brand-100">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="grid content-center gap-4">
            {[
              { icon: BarChart3, label: 'Decision score', value: '92%', detail: 'High placement fit' },
              { icon: BookmarkCheck, label: 'Shortlist health', value: '8/10', detail: 'Balanced by fees and location' },
              { icon: Sparkles, label: 'Smart insight', value: '3', detail: 'Comparable colleges found' },
            ].map((metric) => (
              <div key={metric.label} className="card flex items-center gap-4 p-5">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100">
                  <metric.icon size={22} />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <p className="max-w-32 text-sm text-slate-600 dark:text-slate-300">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100">Featured colleges</p>
            <h2 className="mt-1 text-2xl font-bold">Strong starting points</h2>
          </div>
          <Link to="/colleges" className="button-secondary">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {isLoading ? <LoadingGrid /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((college) => <CollegeCard key={college.id} college={college} />)}
          </div>
        )}
      </section>
    </>
  );
}
