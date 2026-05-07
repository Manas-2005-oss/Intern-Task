import { Link } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard.jsx';
import { EmptyState } from '../components/StateBlocks.jsx';
import { useSavedColleges } from '../context/SavedCollegesContext.jsx';

export default function SavedColleges() {
  const { savedColleges } = useSavedColleges();

  return (
    <section className="container-page py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100">Wishlist</p>
        <h1 className="mt-1 text-3xl font-bold">Saved colleges</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Your shortlist stays available across sessions on this device and is ready for backend sync.</p>
      </div>
      {savedColleges.length === 0 ? (
        <EmptyState
          title="No saved colleges yet"
          message="Save colleges from search or detail pages to build a focused shortlist."
          action={<Link to="/colleges" className="button-primary">Browse colleges</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedColleges.map((college) => <CollegeCard key={college.id} college={college} />)}
        </div>
      )}
    </section>
  );
}
