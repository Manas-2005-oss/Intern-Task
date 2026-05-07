import { GraduationCap } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600">
            <GraduationCap size={22} />
          </span>
          CampusIQ
        </Link>
        <div className="max-w-md">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Decision intelligence</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Shortlist smarter, compare faster, choose with confidence.</h1>
          <p className="mt-5 text-slate-300">A JWT-ready account layer for saved colleges, decision notes, and personalized recommendations.</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <Outlet />
      </section>
    </main>
  );
}
