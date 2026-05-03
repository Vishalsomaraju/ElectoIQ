import { useState, useCallback } from "react";
import { logger } from "../../utils/logger";
import { useAuthContext } from "../../context/AuthContext";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "../../utils/helpers";

export function AuthButton({ compact = false }) {
  const { user, loading, signInWithGoogle, logout } = useAuthContext();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = useCallback(async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      logger.warn("[Navbar] Google login error:", err);
    } finally {
      setSigningIn(false);
    }
  }, [signInWithGoogle]);

  if (loading)
    return (
      <div
        className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse"
        aria-label="Loading auth state"
      />
    );

  if (user) {
    const isAnon = user.isAnonymous;
    return (
      <div
        className={cn(
          "flex items-center gap-2",
          compact && "flex-row-reverse justify-end",
        )}
      >
        {/* Avatar */}
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? "User avatar"}
            className="w-8 h-8 rounded-full ring-2 ring-india-saffron object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-india-saffron to-india-green flex items-center justify-center text-white text-xs font-bold">
            {isAnon ? "?" : (user.displayName?.charAt(0) ?? "?")}
          </div>
        )}
        {!isAnon && !compact && (
          <span className="text-sm text-slate-700 dark:text-white/70 max-w-[100px] truncate">
            {user.displayName}
          </span>
        )}
        <button
          onClick={logout}
          aria-label="Sign out"
          className="p-1.5 rounded-lg text-slate-500 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={signingIn}
      className={cn(
        "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "bg-india-saffron hover:bg-[#e8891f] text-white shadow-lg shadow-orange-900/30",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        compact && "w-full justify-center",
      )}
      aria-label="Sign in with Google"
    >
      {signingIn ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      {compact ? "Sign in with Google" : "Sign In"}
    </button>
  );
}
