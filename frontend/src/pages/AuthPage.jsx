import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, ArrowRight, Lock, BarChart2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import FormInput from '../components/FormInput';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', confirmPassword: '', role: 'customer' });
  const [errors, setErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginForm.email) errs.email = 'Email is required';
    if (!loginForm.password) errs.password = 'Password is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.error || 'Invalid email or password', 'error');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!registerForm.email) errs.reg_email = 'Email is required';
    if (!registerForm.password) errs.reg_password = 'Password is required';
    if (registerForm.password !== registerForm.confirmPassword) errs.reg_confirm = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(registerForm.email, registerForm.password, registerForm.role);
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.error || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-primary-900 flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <Shield size={28} className="text-white" />
          <span className="text-white font-semibold text-xl">NexusBank</span>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">Secure. Smart.<br />Simple.</h1>
            <p className="text-blue-200 mt-4 text-base leading-relaxed">Professional banking management designed for the modern financial institution.</p>
          </div>

          <div className="relative">
            <div className="w-64 h-64 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-lg ${i % 3 === 0 ? 'bg-blue-400/30' : i % 3 === 1 ? 'bg-white/20' : 'bg-blue-300/20'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { icon: Lock, text: '256-bit Encryption' },
            { icon: BarChart2, text: 'Real-time Analytics' },
            { icon: Zap, text: 'Razorpay Secured' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <Icon size={12} className="text-blue-200" />
              <span className="text-blue-100 text-xs font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Shield size={22} className="text-primary-600" />
            <span className="font-semibold text-primary-900 text-lg">NexusBank</span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {tab === 'login' ? 'Sign in to your account to continue.' : 'Get started with NexusBank today.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
            {[['login', 'Sign In'], ['register', 'Create Account']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => { setTab(id); setErrors({}); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                  tab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <FormInput
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                error={errors.email}
              />
              <div className="relative">
                <FormInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  error={errors.password}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg" icon={ArrowRight} iconPosition="right">
                Sign In
              </Button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <FormInput label="Email address" type="email" placeholder="you@example.com"
                value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})}
                error={errors.reg_email} />
              <FormInput label="Password" type="password" placeholder="Create a password"
                value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})}
                error={errors.reg_password} />
              <FormInput label="Confirm password" type="password" placeholder="Repeat your password"
                value={registerForm.confirmPassword} onChange={e => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                error={errors.reg_confirm} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Account role</label>
                <select
                  value={registerForm.role}
                  onChange={e => setRegisterForm({...registerForm, role: e.target.value})}
                  className="h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="teller">Bank Teller</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg" icon={ArrowRight} iconPosition="right">
                Create Account
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
