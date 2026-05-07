import { AlertCircle, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email.includes('@') || form.password.length < 6) {
      setError('Enter a valid email and a password with at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to continue your shortlist and comparisons.">
      <form onSubmit={submit} className="grid gap-4">
        {error && <FormError message={error} />}
        <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
        <Field icon={Lock} label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
        <button type="submit" disabled={isSubmitting} className="button-primary">{isSubmitting ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">New to CampusIQ? <Link to="/auth/signup" className="font-semibold text-brand-700 dark:text-brand-100">Create account</Link></p>
    </AuthCard>
  );
}

export function AuthCard({ title, subtitle, children }) {
  return (
    <div className="card w-full max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function Field({ icon: Icon, label, type = 'text', value, onChange }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {label}
      <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
        <Icon size={17} className="text-slate-400" />
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 flex-1 bg-transparent text-sm outline-none" />
      </span>
    </label>
  );
}

export function FormError({ message }) {
  return <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-100"><AlertCircle size={16} /> {message}</p>;
}
