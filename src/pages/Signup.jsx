import { Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthCard, Field, FormError } from './Login.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (form.name.trim().length < 2 || !form.email.includes('@') || form.password.length < 6) {
      setError('Add your name, a valid email, and a password with at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Save colleges, compare options, and keep your research organized.">
      <form onSubmit={submit} className="grid gap-4">
        {error && <FormError message={error} />}
        <Field icon={User} label="Full name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
        <Field icon={Lock} label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
        <button type="submit" disabled={isSubmitting} className="button-primary">{isSubmitting ? 'Creating account...' : 'Sign up'}</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">Already have an account? <Link to="/auth/login" className="font-semibold text-brand-700 dark:text-brand-100">Login</Link></p>
    </AuthCard>
  );
}
