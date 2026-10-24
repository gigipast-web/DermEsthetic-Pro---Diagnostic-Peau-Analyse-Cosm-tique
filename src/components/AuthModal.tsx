import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Award,
  MapPin,
} from 'lucide-react';
import { PractitionerUser } from '../types';
import {
  registerUser,
  loginUser,
  loginAsDemo,
  getRegisteredUsers,
  ESTHETICIAN_ROLES,
} from '../services/authService';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onSuccess: (user: PractitionerUser) => void;
  canDismiss?: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<Props> = ({
  onSuccess,
  canDismiss = false,
  onClose,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [role, setRole] = useState(ESTHETICIAN_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const registeredUsers = getRegisteredUsers();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!acceptTerms) {
      setErrorMessage(t.auth.errTerms);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t.auth.errPasswordMatch);
      return;
    }

    const finalRole = role === 'Autre rôle personnalisé...' ? customRole || 'Praticienne' : role;

    const result = registerUser({
      fullName,
      email,
      password,
      role: finalRole,
      instituteName,
      phone,
      city,
    });

    if (result.success && result.user) {
      setSuccessMessage(t.auth.successRegister);
      setTimeout(() => {
        onSuccess(result.user!);
      }, 400);
    } else {
      setErrorMessage(result.error || t.auth.errGenericRegister);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = loginUser(loginEmail, loginPassword);
    if (result.success && result.user) {
      setSuccessMessage(`${t.auth.welcomeBack}, ${result.user.fullName} !`);
      setTimeout(() => {
        onSuccess(result.user!);
      }, 350);
    } else {
      setErrorMessage(result.error || t.auth.errInvalidCredentials);
    }
  };

  const handleQuickDemo = () => {
    const demo = loginAsDemo();
    setSuccessMessage(t.auth.demoSuccess);
    setTimeout(() => {
      onSuccess(demo);
    }, 200);
  };

  const handleSelectExistingUser = (user: PractitionerUser) => {
    const result = loginUser(user.email);
    if (result.success && result.user) {
      onSuccess(result.user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200/90 flex flex-col md:flex-row my-auto">
        {/* Left Side: Brand Identity & Highlights */}
        <div className="md:w-5/12 bg-gradient-to-br from-rose-950 via-rose-900 to-stone-900 p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-6 h-6 text-rose-300" />
                </div>
                <div>
                  <h1 className="font-serif font-bold text-2xl tracking-tight text-white">
                    {t.auth.brandTitle}{' '}
                    <span className="text-rose-300 font-sans text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-white/10 ml-1">
                      {t.auth.brandBadge}
                    </span>
                  </h1>
                  <p className="text-xs text-rose-200/90 font-medium">{t.auth.brandSubtitle}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-stone-200/90 leading-relaxed mb-6 font-light">
              {t.auth.brandDesc}
            </p>

            {/* Key Pillars */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-white/10 shrink-0 text-rose-300 mt-0.5">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="block text-white font-medium">{t.auth.pillar1Title}</strong>
                  <span className="text-stone-300 text-[11px]">{t.auth.pillar1Desc}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-white/10 shrink-0 text-rose-300 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="block text-white font-medium">{t.auth.pillar2Title}</strong>
                  <span className="text-stone-300 text-[11px]">{t.auth.pillar2Desc}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-white/10 shrink-0 text-rose-300 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="block text-white font-medium">{t.auth.pillar3Title}</strong>
                  <span className="text-stone-300 text-[11px]">{t.auth.pillar3Desc}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Button */}
          <div className="mt-8 pt-6 border-t border-white/15">
            <p className="text-[11px] text-stone-300 mb-2">{t.auth.demoPrompt}</p>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
            >
              <span>{t.auth.demoBtn}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="md:w-7/12 p-6 sm:p-8 bg-white flex flex-col justify-between">
          <div>
            {/* Top Switcher: Inscription / Connexion & Language Selector */}
            <div className="flex items-center justify-between gap-2 mb-6">
              <div className="p-1 bg-stone-100 rounded-2xl flex items-center w-full max-w-xs border border-stone-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-rose-950 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t.auth.tabRegister}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-rose-950 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t.auth.tabLogin}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Multilingual Selector in Auth Modal */}
                <LanguageSelector variant="modal" showLabel={false} />

                {canDismiss && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-stone-400 hover:text-stone-700 font-medium px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    {t.common.close} ✕
                  </button>
                )}
              </div>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {t.auth.fullNameLabel} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t.auth.fullNamePlaceholder}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 focus:ring-1 focus:ring-rose-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {t.auth.instituteLabel} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={instituteName}
                        onChange={(e) => setInstituteName(e.target.value)}
                        placeholder={t.auth.institutePlaceholder}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 focus:ring-1 focus:ring-rose-800 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {t.auth.roleLabel}
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none transition-all cursor-pointer"
                    >
                      {ESTHETICIAN_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                      <option value="Autre rôle personnalisé...">Autre qualification...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {t.auth.cityLabel}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t.auth.cityPlaceholder}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {role === 'Autre rôle personnalisé...' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {t.auth.customRolePlaceholder}
                    </label>
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="Ex: Naturo-Esthéticienne & Dermo-Praticienne"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {t.auth.emailLabel} <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.auth.emailPlaceholder}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {t.auth.passwordLabel} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="5 caractères min."
                        className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {t.auth.confirmPasswordLabel} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t.auth.confirmPasswordPlaceholder}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Consent checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-[11px] text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 rounded border-stone-300 text-rose-800 focus:ring-rose-800"
                    />
                    <span>
                      {t.auth.acceptTermsPrefix}{' '}
                      <a href="/privacy" target="_blank" className="text-rose-900 underline font-medium">
                        {t.auth.acceptTermsLink}
                      </a>
                      .
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-rose-950 hover:bg-rose-900 active:bg-rose-950 text-white rounded-xl text-xs font-bold tracking-wide uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Sparkles className="w-4 h-4 text-rose-300" />
                  <span>{t.auth.btnRegister}</span>
                </button>
              </form>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {t.auth.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={t.auth.emailPlaceholder}
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-stone-700">
                      {t.auth.passwordLabel}
                    </label>
                    <span className="text-[10px] text-stone-400">
                      (Mode démo : mot de passe optionnel)
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={t.auth.passwordPlaceholder}
                      className="w-full pl-9 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-rose-950 hover:bg-rose-900 active:bg-rose-950 text-white rounded-xl text-xs font-bold tracking-wide uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-rose-300" />
                  <span>{t.auth.btnLogin}</span>
                </button>

                {/* Existing accounts on device */}
                {registeredUsers.length > 0 && (
                  <div className="pt-4 border-t border-stone-100">
                    <p className="text-[11px] font-semibold text-stone-500 mb-2">
                      {t.auth.quickReconnect}
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {registeredUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectExistingUser(u)}
                          className="w-full px-3 py-2 bg-stone-50 hover:bg-rose-50/60 border border-stone-200 rounded-xl text-left text-xs flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-rose-950 text-rose-100 font-bold text-[10px] flex items-center justify-center">
                              {u.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-stone-900 group-hover:text-rose-950">
                                {u.fullName}
                              </div>
                              <div className="text-[10px] text-stone-500">{u.instituteName}</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-rose-800 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            {t.auth.tabLogin} →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Bottom Security Note */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Chiffrement local & Secret d'institut
            </span>
            <a href="/privacy" target="_blank" className="hover:text-stone-700 underline">
              {t.auth.acceptTermsLink}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
