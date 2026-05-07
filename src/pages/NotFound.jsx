import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container-page flex min-h-screen items-center justify-center py-10">
      <div className="card max-w-md p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">This route does not exist or the college link is no longer valid.</p>
        <Link to="/" className="button-primary mt-6">Go home</Link>
      </div>
    </section>
  );
}
