import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Monitor, Loader2 } from 'lucide-react';
import { login, saveSession } from '../services/authService';
import type { LoginRequest } from '../interfaces/IAuth';

const LoginPage = () => {
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError('נא למלא את כל השדות');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await login(form);
      saveSession(data);
      navigate('/');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'אימייל או סיסמה שגויים');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || !form.email || !form.password;

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <Monitor size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">TechStore</h1>
          <p className="text-gray-500 mt-1 text-sm">מערכת ניהול</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow border border-gray-100 px-8 py-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">כניסה לחשבון</h2>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כתובת אימייל
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                disabled={isLoading}
                className={`
                  block w-full rounded-md border shadow-sm py-2 px-3
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                  disabled:bg-gray-50 disabled:text-gray-500
                  ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
                `}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                סיסמה
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="הכנס סיסמה"
                  disabled={isLoading}
                  className={`
                    block w-full rounded-md border shadow-sm py-2 px-3 pl-10
                    focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                    disabled:bg-gray-50 disabled:text-gray-500
                    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="rounded-md p-3 border bg-red-50 border-red-200 text-red-800 text-sm flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              onClick={isDisabled ? (e) => e.preventDefault() : undefined}
              style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
              className={`
                w-full inline-flex items-center justify-center rounded-lg font-semibold
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                px-4 py-2.5 text-base
                ${isDisabled
                  ? 'opacity-40 cursor-not-allowed pointer-events-none'
                  : 'hover:brightness-110 active:brightness-90 shadow-md hover:shadow-lg'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="ml-2 animate-spin" />
                  מתחבר...
                </>
              ) : (
                'כניסה'
              )}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          TechStore © {new Date().getFullYear()} · כל הזכויות שמורות
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
