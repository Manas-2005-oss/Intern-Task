import { AlertCircle, Inbox } from 'lucide-react';

export function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="card h-80 animate-pulse overflow-hidden">
          <div className="h-32 bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="card flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <Inbox className="text-slate-400" size={36} />
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
      <span className="flex items-center gap-2"><AlertCircle size={16} /> {message}</span>
    </div>
  );
}
