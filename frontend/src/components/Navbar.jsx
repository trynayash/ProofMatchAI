import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield, History, BarChart3, LogOut, Menu, X } from '@/components/icons';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/verify', label: 'Verify', icon: Shield },
    { to: '/history', label: 'History', icon: History },
    { to: '/admin', label: 'Dashboard', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/verify" className="flex items-center gap-2 text-[var(--color-text-primary)] no-underline">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-accent)]">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">ProofMatch</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium no-underline transition-colors ${
                isActive(to)
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-2">
            {user?.picture ? (
              <img src={user.picture} alt="" className="h-6 w-6 rounded-full" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-xs font-medium">
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <span className="text-xs text-[var(--color-text-secondary)]">{user?.name || user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] cursor-pointer bg-transparent border-none"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center sm:hidden bg-transparent border-none cursor-pointer text-[var(--color-text-primary)]"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-[var(--color-border)] bg-white px-4 pb-4 pt-2 sm:hidden animate-fade-in">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm no-underline transition-colors ${
                isActive(to)
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="mt-2 border-t border-[var(--color-border)] pt-2">
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--color-text-muted)] bg-transparent border-none cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
