import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/api/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP state
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  // Countdown timer for OTP expiration/resend
  useEffect(() => {
    if (otpExpiresIn <= 0) return;
    const timer = setInterval(() => {
      setOtpExpiresIn((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpExpiresIn]);

  // Step 1: Submit email & password
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data?.requires_otp) {
        setRequiresOtp(true);
        setMaskedEmail(res.data.email || email);
        setOtpExpiresIn(res.data.expires_in || 600);
      } else if (res.success && res.data?.token) {
        // Direct login if OTP was bypassed by backend (fallback)
        localStorage.setItem('auth_token', res.data.token);
        window.location.href = '/admin/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants administrateur incorrects.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP code
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.verifyOtp(email, otpCode);
      if (res.success && res.data?.token) {
        window.location.href = '/admin/dashboard';
      } else {
        throw new Error(res.message || "Code OTP incorrect.");
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Code de vérification invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await authService.sendOtp(email, password);
      if (res.success) {
        setOtpExpiresIn(res.data?.expires_in || 600);
        setError('Un nouveau code OTP a été envoyé.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de renvoyer le code. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-neutral-200 rounded-none shadow-sm">
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Logo HA-KAVOD 97"
            className="w-28 h-28 object-contain mb-4"
          />
          <h2 className="text-center text-3xl font-extrabold text-neutral-900 tracking-tight">
            Administration
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-500 font-medium">
            {requiresOtp ? 'Vérification double facteur' : 'Accédez à la console de gestion Ha-kavod 97'}
          </p>
        </div>

        {error && (
          <div className={`border text-xs font-semibold p-3.5 rounded-none text-left ${
            error.includes('envoyé') ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {error}
          </div>
        )}

        {!requiresOtp ? (
          // FORMULAIRE DE CONNEXION IDENTIFIANTS
          <form className="mt-8 space-y-6 text-left" onSubmit={handleCredentialsSubmit}>
            <div className="flex flex-col gap-4">
              <Input
                label="Adresse e-mail"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@boutique.ci"
              />
              <Input
                label="Mot de passe"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <Button type="submit" variant="primary" size="full" disabled={loading}>
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </div>

          </form>
        ) : (
          // FORMULAIRE DE CONNEXION CODE OTP
          <form className="mt-8 space-y-6 text-left" onSubmit={handleOtpSubmit}>
            <div className="flex flex-col gap-4">
              <div className="text-xs text-neutral-500 leading-normal">
                Saisissez le code à 6 chiffres envoyé à l'adresse <strong>{maskedEmail}</strong>.
              </div>
              <Input
                label="Code de vérification (OTP)"
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="000000"
                className="text-center tracking-[0.5em] text-lg font-bold"
              />
              {otpExpiresIn > 0 && (
                <div className="text-[10px] text-neutral-400 text-right">
                  Expire dans {Math.floor(otpExpiresIn / 60)}m {otpExpiresIn % 60}s
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button type="submit" variant="primary" size="full" disabled={loading || otpCode.length < 6}>
                {loading ? 'Validation en cours...' : 'Valider le code'}
              </Button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || otpExpiresIn > 540} // Renvoyer après 60s max
                className="text-xs text-neutral-500 hover:text-accent font-semibold underline text-center block w-full py-1 disabled:opacity-50"
              >
                Renvoyer le code
              </button>

              <button
                type="button"
                onClick={() => setRequiresOtp(false)}
                className="text-xs text-neutral-400 hover:text-neutral-600 font-semibold text-center block w-full py-1"
              >
                Retour
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

