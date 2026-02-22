import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  LogOut,
  ChevronDown,
  ShoppingCart,
  Users,
  BarChart2,
  Package,
  User,
} from 'lucide-react';
import { logout, getSession } from '../services/authService';
import type { LoginResponse } from '../interfaces/IAuth';

type UserInfo = LoginResponse['user'];

/* ─── helper ─── */
const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

/* ─── Stat card data (static, no dynamic Tailwind) ─── */
const STATS = [
  {
    icon: ShoppingCart,
    label: 'הזמנות היום',
    value: '24',
    bg: 'bg-blue-100',
    fg: 'text-blue-600',
  },
  {
    icon: Users,
    label: 'לקוחות פעילים',
    value: '1,284',
    bg: 'bg-green-100',
    fg: 'text-green-600',
  },
  {
    icon: Package,
    label: 'מוצרים במלאי',
    value: '342',
    bg: 'bg-yellow-100',
    fg: 'text-yellow-600',
  },
  {
    icon: BarChart2,
    label: 'הכנסות החודש',
    value: '₪45,231',
    bg: 'bg-purple-100',
    fg: 'text-purple-600',
  },
];

/* ─── Role badge label ─── */
const roleLabel: Record<string, string> = {
  admin: 'מנהל',
  manager: 'מנהל',
  user: 'משתמש',
};

/* ================================================================
   HomePage
   ================================================================ */
const HomePage = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  /* Load session on mount */
  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  /* ============================================================
     NOT LOGGED IN — Landing page
     ============================================================ */
  if (!user) {
    return (
      <div
        className="h-screen w-screen overflow-x-hidden bg-gradient-to-br from-[#0f172a] via-[#1e2a4a] to-[#0f172a] flex flex-col"
        dir="rtl"
      >
        {/* Header bar */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-900/40">
              <Monitor size={22} className="text-white" />
            </div>
            <span className="text-white text-lg sm:text-xl font-bold tracking-wide">TechStore</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="border-2 border-blue-500 text-blue-500 bg-white px-4 sm:px-5 py-2 rounded-lg font-semibold text-sm sm:text-base
                       transition-all hover:bg-blue-50 active:scale-95"
          >
            כניסה למערכת
          </button>
        </header>

        {/* Hero — fills remaining space */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6 overflow-y-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-2xl shadow-2xl shadow-blue-900/60 mb-6">
            <Monitor size={32} className="text-white sm:hidden" />
            <Monitor size={40} className="text-white hidden sm:block" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            ברוכים הבאים ל-TechStore
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-xl mb-8 px-2">
            מערכת ניהול חכמה למוצרי טכנולוגיה. נהל מלאי, לקוחות והזמנות ממקום אחד.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="border-2 border-blue-500 text-blue-500 bg-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold
                       transition-all hover:bg-blue-50 hover:scale-105 active:scale-95
                       shadow-lg shadow-blue-900/30"
          >
            התחבר למערכת
          </button>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 sm:mt-14 w-full max-w-3xl px-2">
            {[
              { icon: Package, title: 'ניהול מלאי', desc: 'עקוב אחר מוצרים וכמויות בזמן אמת' },
              { icon: Users, title: 'ניהול לקוחות', desc: 'נהל פרטי לקוחות והיסטוריית הזמנות' },
              { icon: BarChart2, title: 'דוחות ונתונים', desc: 'קבל תמונת מצב מקיפה על הביצועים' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/10 backdrop-blur rounded-xl p-5 text-center border border-white/20
                           hover:bg-white/15 transition-colors"
              >
                <Icon size={28} className="text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">{title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </main>

        <footer className="text-center py-3 text-gray-600 text-xs shrink-0">
          TechStore © {new Date().getFullYear()} · כל הזכויות שמורות
        </footer>
      </div>
    );
  }

  /* ============================================================
     LOGGED IN — Dashboard home
     ============================================================ */
  return (
    <div className="h-screen w-screen overflow-x-hidden bg-gray-50 flex flex-col" dir="rtl">
      {/* ── Top Header ── */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm shrink-0 z-40">
        {/* Right: Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow">
            <Monitor size={22} className="text-white" />
          </div>
          <div>
            <span className="text-gray-900 text-lg font-bold">TechStore</span>
            <span className="text-gray-400 text-xs block leading-none mt-0.5">מערכת ניהול</span>
          </div>
        </div>

        {/* Left: User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {getInitials(user.name)}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {roleLabel[user.role] ?? user.role}
                  </span>
                </div>
              </div>

              {/* Profile row */}
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <User size={16} className="text-gray-400" />
                הפרופיל שלי
              </button>

              {/* Logout */}
              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  יציאה מהמערכת
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            שלום, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">ברוך הבא למערכת הניהול. הנה סקירה קצרה:</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-10">
          {STATS.map(({ icon: Icon, label, value, bg, fg }) => (
            <div
              key={label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-2.5 rounded-lg ${bg} mb-3`}>
                <Icon size={20} className={fg} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">פעולות מהירות</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { icon: Package, label: 'הוסף מוצר' },
              { icon: Users, label: 'לקוח חדש' },
              { icon: ShoppingCart, label: 'הזמנה חדשה' },
              { icon: BarChart2, label: 'הפק דוח' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700
                           text-gray-700 border border-gray-200 hover:border-blue-200
                           px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all"
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};

export default HomePage;
