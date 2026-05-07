import { ArrowLeft, Bookmark, IndianRupee, MapPin, Star, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../components/StateBlocks.jsx';
import { useSavedColleges } from '../context/SavedCollegesContext.jsx';
import { getCollegeById } from '../services/collegeService';
import { formatCurrency, formatPercent, safeText } from '../utils/formatters';

const tabs = ['Overview', 'Courses', 'Placements', 'Reviews'];

export default function CollegeDetail() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const { isSaved, toggleSaved } = useSavedColleges();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    getCollegeById(id)
      .then((data) => active && setCollege(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <section className="container-page py-8">
        <div className="card h-96 animate-pulse" />
      </section>
    );
  }

  if (error || !college) {
    return (
      <section className="container-page py-8">
        <ErrorState message={error || 'Invalid college ID'} />
        <Link to="/colleges" className="button-secondary mt-4"><ArrowLeft size={16} /> Back to colleges</Link>
      </section>
    );
  }

  const saved = isSaved(college.id);

  return (
    <section className="container-page py-8">
      <Link to="/colleges" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-100">
        <ArrowLeft size={16} /> Back to search
      </Link>
      {college.warning && <div className="mb-4"><ErrorState message={`Using fallback detail data: ${college.warning}`} /></div>}

      <div className="card overflow-hidden">
        <div className="bg-slate-900 px-5 py-8 text-white sm:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-100">{college.type} {college.accreditation && `- ${college.accreditation}`}</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{college.name}</h1>
              <p className="mt-3 flex items-center gap-2 text-slate-300"><MapPin size={18} /> {college.location}{college.state ? `, ${college.state}` : ''}</p>
            </div>
            <button type="button" onClick={() => toggleSaved(college)} className="button-primary w-full bg-white text-slate-950 hover:bg-slate-100 sm:w-fit">
              <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save college'}
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:grid-cols-3">
          <Metric icon={Star} label="Rating" value={college.rating ?? 'N/A'} />
          <Metric icon={IndianRupee} label="Average fees" value={formatCurrency(college.fees)} />
          <Metric icon={TrendingUp} label="Placement rate" value={formatPercent(college.placementRate)} />
        </div>

        <div className="border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex gap-2 overflow-x-auto py-3">
            {tabs.map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {activeTab === 'Overview' && <p className="max-w-3xl leading-7 text-slate-600 dark:text-slate-300">{safeText(college.overview)}</p>}
          {activeTab === 'Courses' && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(college.courses.length ? college.courses : ['Courses pending']).map((course) => (
                <div key={course} className="rounded-lg border border-slate-200 p-4 font-semibold dark:border-slate-800">{course}</div>
              ))}
            </div>
          )}
          {activeTab === 'Placements' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Metric icon={TrendingUp} label="Placement rate" value={formatPercent(college.placementRate)} />
              <Metric icon={IndianRupee} label="Typical annual fees" value={formatCurrency(college.fees)} />
            </div>
          )}
          {activeTab === 'Reviews' && (
            <div className="grid gap-3">
              {(college.reviews.length ? college.reviews : [{ author: 'CampusIQ', text: 'Student reviews are not available yet.', rating: 'N/A' }]).map((review, index) => (
                <div key={`${review.author}-${index}`} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{review.author}</p>
                    <span className="text-sm font-semibold text-amber-600">{review.rating}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Icon size={16} /> {label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}
