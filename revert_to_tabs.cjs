const fs = require('fs');

const path = 'src/pages/storefront/Account.jsx';
let content = fs.readFileSync(path, 'utf8');

// First, restore authMode state if it doesn't exist
if (!content.includes("const [authMode, setAuthMode]")) {
  content = content.replace(
    "const [loginMethod, setLoginMethod] = useState('email');",
    "const [authMode, setAuthMode] = useState('login');\n  const [loginMethod, setLoginMethod] = useState('email');"
  );
}

const startTag = '{!isAuthenticated ? (';
const endTag = ') : (\n          /* ── AUTHENTICATED: Premium Luxury Dashboard ── */';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries.");
  process.exit(1);
}

const newBlock = `{!isAuthenticated ? (
          /* ── NOT AUTHENTICATED: Centered Form with Tabs ── */
          <div className="max-w-md mx-auto bg-transparent mb-20 mt-10">
            {error && (
              <div className="bg-red-50 border-l-4 border-danger text-danger p-4 text-sm mb-6 font-medium rounded-none flex items-start gap-3 shadow-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-emerald-500 text-emerald-700 p-4 text-sm mb-6 font-medium rounded-none flex items-start gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {showForgotPassword ? (
              /* ────── MOT DE PASSE OUBLIÉ ────── */
              <div className="bg-white p-8 md:p-12 rounded-none shadow-sm border border-neutral-200 animate-fade-in">
                {!forgotSent ? (
                  <form onSubmit={handleForgotPassword} className="text-left">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4 uppercase tracking-wider">
                      {locale === 'en' ? 'Forgot password?' : 'Mot de passe oublié ?'}
                    </h2>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                      {locale === 'en'
                        ? 'Enter your e-mail address and we\\'ll send you a link to reset your password.'
                        : 'Saisissez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.'}
                    </p>
                    <div className="flex flex-col gap-2 mb-6">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.email_address}</label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        className="w-full py-3.5 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 rounded-none transition-all placeholder-neutral-400 font-light focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-primary hover:bg-neutral-850 text-white py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (locale === 'en' ? 'Send reset link' : 'Envoyer le lien')}
                    </button>
                    <div className="text-center mt-6">
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(false); setForgotSent(false); setError(''); }}
                        className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-all cursor-pointer bg-transparent border-none inline-flex items-center gap-1.5"
                      >
                        {c.back_to_login}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center animate-fade-in flex flex-col items-center py-4">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4 uppercase tracking-wider">
                      {locale === 'en' ? 'Check your inbox' : 'Vérifiez votre boîte mail'}
                    </h2>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                      {locale === 'en'
                        ? <>We\\'ve sent a reset link to <strong className="text-neutral-700 font-semibold">{forgotEmail}</strong>.</>  
                        : <>Nous avons envoyé un lien de réinitialisation à <strong className="text-neutral-700 font-semibold">{forgotEmail}</strong>.</>}
                    </p>
                    <div className="flex flex-col gap-3 w-full mt-4">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loginLoading}
                        className="w-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none bg-white cursor-pointer flex items-center justify-center gap-2"
                      >
                        {loginLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        {locale === 'en' ? 'Resend link' : 'Renvoyer le lien'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(false); setForgotSent(false); setError(''); setSuccess(''); }}
                        className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer"
                      >
                        {c.back_to_login}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : otpStep ? (
              /* ── OTP VERIFICATION SCREEN ── */
              <div className="bg-white p-8 md:p-12 rounded-none shadow-sm border border-neutral-200 animate-fade-in">
                <form onSubmit={handleVerifyOtp} className="space-y-5 text-left">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 uppercase tracking-wider">
                    {locale === 'en' ? 'Verification' : 'Vérification OTP'}
                  </h2>
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-none text-xs text-neutral-600 leading-relaxed font-light">
                    {locale === 'en' 
                      ? \`We sent a validation OTP code to the number \${otpPhone}.\` 
                      : \`Un code OTP a été envoyé au numéro \${otpPhone}.\`}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'OTP Code' : 'Code OTP'}</label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full py-3.5 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 rounded-none transition-all text-center tracking-[0.5em] font-bold outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.password}</label>
                    <input
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full py-3.5 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 rounded-none transition-all outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-primary hover:bg-neutral-850 text-white py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (locale === 'en' ? 'Verify and Create Account' : 'Vérifier et créer le compte')}
                  </button>
                </form>
              </div>
            ) : (
              /* ── MAIN FORM CONTAINER ── */
              <div className="bg-white p-6 md:p-10 border border-neutral-200 rounded-none shadow-sm flex flex-col">
                
                {/* TABS SWITCHER */}
                <div className="flex gap-2 mb-8 border-b border-neutral-200 pb-4">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={\`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer relative \${
                      authMode === 'login' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
                    }\`}
                  >
                    {locale === 'en' ? 'Sign In' : 'Connexion'}
                    {authMode === 'login' && (
                      <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-neutral-900"></span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={\`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer relative \${
                      authMode === 'register' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
                    }\`}
                  >
                    {locale === 'en' ? 'Register' : 'Créer un compte'}
                    {authMode === 'register' && (
                      <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-neutral-900"></span>
                    )}
                  </button>
                </div>

                {authMode === 'login' ? (
                  /* --- LOGIN TAB --- */
                  <div className="animate-fade-in">
                    {/* Method Switcher Login */}
                    <div className="flex gap-2 mb-6">
                      <button
                        type="button"
                        onClick={() => setLoginMethod('email')}
                        className={\`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer border \${
                          loginMethod === 'email' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-transparent text-neutral-600 hover:bg-neutral-50'
                        }\`}
                      >
                        E-mail
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMethod('phone')}
                        className={\`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer border \${
                          loginMethod === 'phone' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-transparent text-neutral-600 hover:bg-neutral-50'
                        }\`}
                      >
                        {locale === 'en' ? 'Phone' : 'Téléphone'}
                      </button>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                      {loginMethod === 'email' ? (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.email_address}</label>
                          <input
                            type="email"
                            required
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="nom@exemple.com"
                            className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'Country' : 'Pays'}</label>
                            <select
                              value={registerCountry}
                              onChange={(e) => setRegisterCountry(e.target.value)}
                              className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                            >
                              <option value="CI">Côte d’Ivoire (+225)</option>
                              <option value="TG">Togo (+228)</option>
                              <option value="BJ">Bénin (+229)</option>
                              <option value="SN">Sénégal (+221)</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'Phone Number' : 'Numéro de Téléphone'}</label>
                            <input
                              type="tel"
                              required
                              value={loginPhone}
                              onChange={(e) => setLoginPhone(e.target.value)}
                              placeholder={registerCountry === 'TG' ? '90 00 00 00' : '07 00 00 00 00'}
                              className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.password}</label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-all cursor-pointer bg-transparent border-none p-0 underline underline-offset-2"
                          >
                            {c.forgot_password_q}
                          </button>
                        </div>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 mt-6 cursor-pointer"
                      >
                        {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (locale === 'en' ? 'Sign In' : 'Se connecter')}
                      </button>
                    </form>

                    {/* Social Logins Section */}
                    <div className="mt-8 space-y-4">
                      <div className="relative flex items-center">
                        <div className="flex-grow border-t border-neutral-200"></div>
                        <span className="flex-shrink mx-4 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                          {locale === 'en' ? 'OR' : 'OU'}
                        </span>
                        <div className="flex-grow border-t border-neutral-200"></div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={handleSocialGoogle}
                          className="flex items-center justify-center gap-3 py-3 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer bg-white"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                          </svg>
                          {locale === 'en' ? 'Continue with Google' : 'Continuer avec Google'}
                        </button>
                        <button
                          type="button"
                          onClick={handleSocialFacebook}
                          className="flex items-center justify-center gap-3 py-3 border border-neutral-200 hover:bg-[#1877F2]/5 hover:border-[#1877F2] text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer bg-white"
                        >
                          <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          {locale === 'en' ? 'Continue with Facebook' : 'Continuer avec Facebook'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* --- REGISTER TAB --- */
                  <div className="animate-fade-in">
                    {/* Method Switcher Register */}
                    <div className="flex gap-2 mb-6">
                      <button
                        type="button"
                        onClick={() => setRegisterMethod('email')}
                        className={\`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer border \${
                          registerMethod === 'email' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }\`}
                      >
                        E-mail
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterMethod('phone')}
                        className={\`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer border \${
                          registerMethod === 'phone' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }\`}
                      >
                        {locale === 'en' ? 'Phone' : 'Téléphone'}
                      </button>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'Full Name' : 'Nom Complet'}</label>
                        <input
                          type="text"
                          required
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'Country' : 'Pays'}</label>
                        <select
                          value={registerCountry}
                          onChange={(e) => setRegisterCountry(e.target.value)}
                          className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                        >
                          <option value="CI">Côte d’Ivoire (+225)</option>
                          <option value="TG">Togo (+228)</option>
                          <option value="BJ">Bénin (+229)</option>
                          <option value="SN">Sénégal (+221)</option>
                        </select>
                      </div>

                      {registerMethod === 'email' ? (
                        <>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.email_address}</label>
                            <input
                              type="email"
                              required
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              placeholder="nom@exemple.com"
                              className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.password}</label>
                            <input
                              type="password"
                              required
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'Phone Number' : 'Numéro de Téléphone'}</label>
                          <input
                            type="tel"
                            required
                            value={registerPhone}
                            onChange={(e) => setRegisterPhone(e.target.value)}
                            placeholder={registerCountry === 'TG' ? '90 00 00 00' : '07 00 00 00 00'}
                            className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                          />
                        </div>
                      )}

                      <div className="pt-2">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" className="mt-1 accent-primary w-3 h-3" required />
                          <span className="text-[10px] text-neutral-500 leading-tight">
                            J'accepte les <a href="/privacy-policy" className="underline hover:text-neutral-800">Conditions d'Utilisation</a> et la <a href="/privacy-policy" className="underline hover:text-neutral-800">Politique de Confidentialité</a>.
                          </span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 mt-4 cursor-pointer"
                      >
                        {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (registerMethod === 'phone' ? (locale === 'en' ? 'Send OTP SMS' : 'Recevoir le code OTP') : (locale === 'en' ? 'Create Account' : 'Créer un compte'))}
                      </button>
                    </form>
                  </div>
                )}

              </div>
            )}
          </div>
`;

content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
fs.writeFileSync(path, content, 'utf8');
console.log("Successfully reverted to tabs.");
