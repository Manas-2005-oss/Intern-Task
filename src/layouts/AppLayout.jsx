import { Bookmark, GraduationCap, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useSavedColleges } from '../context/SavedCollegesContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Discover' },
  { to: '/colleges', label: 'Colleges' },
  { to: '/compare', label: 'Compare' },
  { to: '/saved', label: 'Saved' },
];

export default function AppLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { savedColleges } = useSavedColleges();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
              <GraduationCap size={20} />
            </span>
            <span className="text-lg">CampusIQ</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/colleges" className="button-secondary py-2">
              <Search size={16} />
              Search
            </Link>
            <Link to="/saved" className="button-secondary relative py-2" aria-label="Saved colleges">
              <Bookmark size={16} />
              {savedColleges.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-signal-500 px-1 text-xs text-white">
                  {savedColleges.length}
                </span>
              )}
            </Link>
            <button type="button" onClick={toggleTheme} className="button-secondary px-3 py-2" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Hi, {user.name}
                </span>

                <button
                  type="button"
                  onClick={logout}
                  className="button-primary bg-red-500 hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth/login" className="button-primary py-2">
                Login
              </Link>
            )}
          </div>

          <button type="button" className="button-secondary px-3 py-2 md:hidden" onClick={() => setIsOpen((value) => !value)} aria-label="Toggle menu">
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {isOpen && (
          <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <div className="grid gap-2">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900">
                  {link.label}
                </NavLink>
              ))}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={toggleTheme} className="button-secondary flex-1">
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  Theme
                </button>
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="button-primary flex-1 bg-red-500 hover:bg-red-600"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/auth/login"
                    className="button-primary flex-1"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
