import React, { useState } from 'react';
import {
  X,
  User,
  Key,
  ShieldCheck,
  Copy,
  Download,
  Check,
  AlertCircle,
  Sparkles,
  HelpCircle,
  LogOut,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { persistence } from '../storage/persistence';
import { PlayerStats } from '../game/types';
import { audio } from '../game/audio';

interface ProfileModalProps {
  currentUsername: string | null;
  stats: PlayerStats;
  onProfileUpdated: (newUsername: string | null) => void;
  onClose: () => void;
  isInitialAuth?: boolean;
  onProceedAfterAuth?: () => void;
}

const SECURITY_QUESTIONS = [
  'What is your favorite Gujarati snack? (e.g. Khaman, Fafda, Khandvi)',
  'What was the name of your first childhood pet?',
  'What is your favorite spice or tadka ingredient? (e.g. Mustard, Curry Leaves)',
  'In which city were you born?',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUsername,
  stats,
  onProfileUpdated,
  onClose,
  isInitialAuth = false,
  onProceedAfterAuth,
}) => {
  type AuthMode = 'login_or_register' | 'forgot_pin';
  const [authMode, setAuthMode] = useState<AuthMode>('login_or_register');

  // Login / Register Form State
  const [username, setUsername] = useState(currentUsername || '');
  const [pin, setPin] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showRegisterFields, setShowRegisterFields] = useState(false);

  // Forgot PIN Form State
  const [forgotUsername, setForgotUsername] = useState(currentUsername || '');
  const [discoveredQuestion, setDiscoveredQuestion] = useState<string | null>(null);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [newPin, setNewPin] = useState('');

  // Status & Notifications
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [registeredRecoveryKey, setRegisteredRecoveryKey] = useState<string | null>(null);
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const handleRegisterOrLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const result = persistence.registerOrLogin(
      username,
      pin,
      securityQuestion,
      securityAnswer
    );

    if (result.success) {
      audio.playAchievement();
      setMessage({ text: result.message, isError: false });
      if (result.recoveryKey) {
        setRegisteredRecoveryKey(result.recoveryKey);
      }
      onProfileUpdated(persistence.getActiveUsername());
      if (onProceedAfterAuth) {
        setTimeout(() => {
          onClose();
          onProceedAfterAuth();
        }, 1200);
      }
    } else {
      audio.playMove();
      setMessage({ text: result.message, isError: true });
    }
  };

  const handleLookupSecurityQuestion = () => {
    if (!forgotUsername.trim()) {
      setMessage({ text: 'Please enter your username first.', isError: true });
      return;
    }
    const q = persistence.getSecurityQuestion(forgotUsername);
    if (q) {
      setDiscoveredQuestion(q);
      setMessage({ text: `Question located for Chef ${forgotUsername}!`, isError: false });
    } else {
      setMessage({
        text: `No registered chef found with username '${forgotUsername}'. Check spelling or register.`,
        isError: true,
      });
    }
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const result = persistence.resetPin(forgotUsername, recoveryInput, newPin);
    if (result.success) {
      audio.playAchievement();
      setMessage({ text: result.message, isError: false });
      onProfileUpdated(persistence.getActiveUsername());
      setAuthMode('login_or_register');
      setPin(newPin);
      setUsername(forgotUsername);
      if (onProceedAfterAuth) {
        setTimeout(() => {
          onClose();
          onProceedAfterAuth();
        }, 1200);
      }
    } else {
      audio.playMove();
      setMessage({ text: result.message, isError: true });
    }
  };

  const handleLogout = () => {
    persistence.logout();
    onProfileUpdated(null);
    setUsername('');
    setPin('');
    setMessage({ text: 'Logged out successfully. You can now sign in with another chef profile.', isError: false });
  };

  const handleCopySyncCode = () => {
    const code = persistence.exportAccountCode();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      audio.playAchievement();
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyRecoveryKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(true);
      audio.playAchievement();
      setTimeout(() => setCopiedKey(false), 2500);
    });
  };

  const handleImportSave = (e: React.FormEvent) => {
    e.preventDefault();
    const result = persistence.importAccountCode(importCode);
    if (result.success) {
      audio.playAchievement();
      setMessage({ text: result.message, isError: false });
      onProfileUpdated(persistence.getActiveUsername());
      setShowImport(false);
    } else {
      setMessage({ text: result.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="w-full max-w-md bg-slatebg-card border border-slatebg-border rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slatebg-border mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-dhokla-golden" />
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
              {isInitialAuth && !currentUsername ? 'WELCOME! SIGN IN TO PLAY' : 'CHEF ACCOUNT & SYNC'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* First time prompt banner if not logged in */}
        {!currentUsername && isInitialAuth && (
          <div className="p-3 rounded-xl bg-dhokla-500/10 border border-dhokla-500/30 text-xs font-bold text-dhokla-golden mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-dhokla-golden" />
            <span>Claim your unique Chef Name & 4-Digit PIN to save your level progress and high scores!</span>
          </div>
        )}

        {/* Status Notification */}
        {message && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 ${
              message.isError
                ? 'bg-red-950/60 border border-red-700 text-red-200'
                : 'bg-curry-leaf/60 border border-curry-light text-curry-lime'
            }`}
          >
            {message.isError ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Check className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Current Active Account Status */}
        {currentUsername ? (
          <div className="p-3.5 rounded-xl bg-slatebg-darkest/70 border border-slatebg-border flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Currently Logged In As
              </span>
              <span className="text-base font-black text-dhokla-golden">Chef {currentUsername}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-2.5 py-1 rounded-lg bg-slatebg-card hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-slatebg-border text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slatebg-darkest/50 border border-slatebg-border/60 mb-4 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">No Chef Profile Logged In</span>
            <span className="text-[10px] text-dhokla-golden font-bold uppercase tracking-wider">Guest Mode</span>
          </div>
        )}

        {/* Main Form View: Login / Register OR Forgot PIN */}
        {authMode === 'login_or_register' ? (
          <form onSubmit={handleRegisterOrLogin} className="flex flex-col gap-3 mb-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Chef Username (Unique)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. DhoklaMaster, SpiceKing"
                  className="w-full bg-slate-900 border border-slatebg-border rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-dhokla-500 pl-9"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Unique across players. Protected by your secret 4-digit PIN.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  4-Digit Secret PIN
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot_pin');
                    setForgotUsername(username);
                    setMessage(null);
                  }}
                  className="text-[11px] font-bold text-dhokla-golden hover:underline"
                >
                  Forgot PIN?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full bg-slate-900 border border-slatebg-border rounded-xl px-3 py-2 text-sm font-mono font-bold text-dhokla-golden focus:outline-none focus:border-dhokla-500 pl-9"
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            {/* Optional Registration Recovery details toggle */}
            {!currentUsername && (
              <div className="pt-2 border-t border-slatebg-border/60">
                <button
                  type="button"
                  onClick={() => setShowRegisterFields(!showRegisterFields)}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center justify-between w-full py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                    <span>Security Question for PIN Recovery</span>
                  </span>
                  <span className="text-[10px] text-dhokla-golden">
                    {showRegisterFields ? 'Hide' : 'Set Question (Recommended)'}
                  </span>
                </button>

                {showRegisterFields && (
                  <div className="flex flex-col gap-2 mt-2 p-2.5 rounded-xl bg-slatebg-darkest/70 border border-slatebg-border/80">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Choose Secret Question
                      </label>
                      <select
                        value={securityQuestion}
                        onChange={e => setSecurityQuestion(e.target.value)}
                        className="w-full bg-slate-900 border border-slatebg-border rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        {SECURITY_QUESTIONS.map((q, idx) => (
                          <option key={idx} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Your Secret Answer
                      </label>
                      <input
                        type="text"
                        value={securityAnswer}
                        onChange={e => setSecurityAnswer(e.target.value)}
                        placeholder="e.g. Khaman"
                        className="w-full bg-slate-900 border border-slatebg-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-dhokla-golden hover:bg-dhokla-400 active:scale-98 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-dhokla-500/20 transition-all mt-1"
            >
              <ShieldCheck className="w-4 h-4 fill-slate-950" />
              <span>{currentUsername ? 'SWITCH CHEF / RE-AUTHENTICATE' : 'CLAIM NAME & START PLAYING'}</span>
            </button>
          </form>
        ) : (
          /* Forgot PIN Recovery Form */
          <form onSubmit={handleResetPin} className="flex flex-col gap-3 mb-4">
            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/50 text-xs text-sky-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-sky-400 mt-0.5" />
              <span>
                Enter your username to retrieve your security question or enter your 8-character Secret Recovery Key!
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Your Chef Username
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={forgotUsername}
                  onChange={e => {
                    setForgotUsername(e.target.value);
                    setDiscoveredQuestion(null);
                  }}
                  placeholder="Enter your username"
                  className="flex-1 bg-slate-900 border border-slatebg-border rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-dhokla-500"
                />
                <button
                  type="button"
                  onClick={handleLookupSecurityQuestion}
                  className="px-3 py-2 rounded-xl bg-slatebg-darkest hover:bg-slate-800 border border-slatebg-border text-xs font-bold text-dhokla-golden"
                >
                  Find Question
                </button>
              </div>
            </div>

            {discoveredQuestion && (
              <div className="p-2.5 rounded-xl bg-slatebg-darkest border border-slatebg-border text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                  Your Security Question:
                </span>
                <span className="text-slate-200 font-bold">{discoveredQuestion}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Secret Answer OR 8-Char Recovery Key
              </label>
              <input
                type="text"
                required
                value={recoveryInput}
                onChange={e => setRecoveryInput(e.target.value)}
                placeholder="e.g. Khaman OR CHEF-XXXX"
                className="w-full bg-slate-900 border border-slatebg-border rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-dhokla-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Enter New 4-Digit PIN
              </label>
              <input
                type="password"
                required
                maxLength={6}
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="e.g. 5678"
                className="w-full bg-slate-900 border border-slatebg-border rounded-xl px-3 py-2 text-sm font-mono font-bold text-dhokla-golden focus:outline-none focus:border-dhokla-500"
              />
            </div>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login_or_register');
                  setMessage(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slatebg-darkest hover:bg-slate-800 border border-slatebg-border text-slate-300 text-xs font-bold"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-xl bg-curry-light hover:bg-curry-lime text-slate-950 font-black text-xs shadow-md"
              >
                RESET PIN & LOG IN
              </button>
            </div>
          </form>
        )}

        {/* Display Recovery Key upon registration */}
        {registeredRecoveryKey && (
          <div className="p-3.5 rounded-xl bg-curry-leaf/30 border border-curry-light mb-4 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-curry-lime uppercase tracking-wider">
              YOUR SECRET RECOVERY KEY:
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-black text-white">{registeredRecoveryKey}</span>
              <button
                type="button"
                onClick={() => handleCopyRecoveryKey(registeredRecoveryKey)}
                className="px-2 py-1 rounded bg-black/50 text-[10px] font-bold text-curry-lime border border-curry-light/40 flex items-center gap-1"
              >
                {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <span className="text-[9px] text-slate-300">
              Save or screenshot this key! You can use it to reset your PIN if you ever forget it.
            </span>
          </div>
        )}

        {/* Cross-Device Cloud Sync Section */}
        <div className="pt-3 border-t border-slatebg-border flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Copy className="w-4 h-4 text-saffron" />
            <span>Cross-Device Cloud Sync (100% Free)</span>
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopySyncCode}
              className="py-2 px-3 rounded-xl bg-slatebg-darkest hover:bg-slate-800 border border-slatebg-border text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-curry-lime" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED!' : 'Copy Save Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImport(!showImport)}
              className="py-2 px-3 rounded-xl bg-slatebg-darkest hover:bg-slate-800 border border-slatebg-border text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import to Device</span>
            </button>
          </div>

          {showImport && (
            <form onSubmit={handleImportSave} className="mt-2 flex flex-col gap-2">
              <textarea
                rows={2}
                required
                value={importCode}
                onChange={e => setImportCode(e.target.value)}
                placeholder="Paste your Dhoklaris save code here..."
                className="w-full bg-slate-900 border border-slatebg-border rounded-xl p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-saffron"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-saffron hover:bg-saffron-glow text-slate-950 font-black text-xs shadow-md"
              >
                RESTORE ACCOUNT TO THIS DEVICE
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
