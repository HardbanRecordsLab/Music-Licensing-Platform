import { useState, useEffect } from "react";
import { UserProfile, Playlist } from "./types.js";
import { AdminDashboard } from "./components/AdminDashboard.js";
import { B2BPlayer } from "./components/B2BPlayer.js";
import { WhiteLabelPlayer } from "./components/WhiteLabelPlayer.js";
import { getApiUrl } from "./utils.js";
import { Shield, Disc, LogIn, LogOut } from "lucide-react";

const demoAccounts = [
  { name: "Administrator HRL", email: "admin@hrl.pl", password: "adminpass" },
  { name: "Kawiarnia Aroma", email: "aroma@b2b.pl", password: "subscriberpass" },
  { name: "Trendsetter Boutique", email: "trendsetter@b2b.pl", password: "subscriberpass" },
  { name: "Titan Gym", email: "titan@b2b.pl", password: "subscriberpass" },
  { name: "Hotel VIP", email: "vip@b2b.pl", password: "subscriberpass" }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>(demoAccounts[0].email);
  const [password, setPassword] = useState<string>(demoAccounts[0].password);
  const [loginError, setLoginError] = useState<string>("");

  const [slug] = useState<string | null>(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    return params.get("slug");
  });

  const saveToken = (token: string) => {
    setAuthToken(token);
    localStorage.setItem("hrl_auth_token", token);
  };

  const clearAuth = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setMyPlaylists([]);
    localStorage.removeItem("hrl_auth_token");
  };

  const fetchMe = async (token: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/auth/me`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCurrentUser(data);
      setLoginError("");
    } catch (e) {
      console.error("Błąd uwierzytelnienia:", e);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("hrl_auth_token");
    if (token) {
      fetchMe(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/auth/login`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Błąd logowania");
        setIsLoading(false);
        return;
      }
      saveToken(data.token);
      setCurrentUser(data.user);
      setLoginError("");
    } catch (err) {
      console.error(err);
      setLoginError("Nie udało się zalogować. Sprawdź połączenie.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyPlaylists = async (token: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/my-playlists`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setMyPlaylists(data);
    } catch (e) {
      console.error("Błąd pobierania playlist użytkownika:", e);
      setMyPlaylists([]);
    }
  };

  useEffect(() => {
    if (authToken && currentUser) {
      fetchMyPlaylists(authToken);
    }
  }, [authToken, currentUser]);

  if (slug) {
    return <WhiteLabelPlayer slug={slug} />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen bg-[#070505] items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Disc className="h-10 w-10 text-red-500 animate-spin" />
          <p className="font-mono text-xs tracking-widest text-gray-500 font-bold uppercase">Wczytywanie serwisu Commercial Music Licensing Platform...</p>
        </div>
      </div>
    );
  }

  if (!authToken || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/95 p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HRL Platform Login</h1>
              <p className="text-sm text-zinc-400">Zaloguj się przez JWT/Bearer, aby korzystać z bezpiecznego API.</p>
            </div>
            <LogIn className="h-8 w-8 text-orange-500" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-zinc-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-zinc-500">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                required
              />
            </div>

            {loginError ? <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{loginError}</div> : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
            >
              Zaloguj się
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
            Widok demo oparty jest na JWT/Bearer auth. Po zalogowaniu wszystkie żądania będą wysyłane z nagłówkiem <code className="rounded bg-zinc-800 px-1 py-0.5">Authorization: Bearer ...</code>.
          </div>

          <div className="mt-6 text-sm text-zinc-500">
            Dostępne konta demo:
            <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-400">
              {demoAccounts.map((account) => (
                <li key={account.email}>{account.name} — {account.email}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed top-0 left-0 w-full bg-zinc-950 border-b border-zinc-900 px-4 py-2 flex items-center justify-between z-[100]">
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-orange-500" />
          <span className="text-white text-xs font-bold uppercase tracking-wider font-mono">Zalogowany jako {currentUser.name}</span>
        </div>
        <button
          onClick={clearAuth}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:border-orange-500"
        >
          <LogOut className="h-4 w-4 text-orange-500" /> Wyloguj
        </button>
      </div>

      <div className="fade-in animate-duration-500 pt-16">
        {currentUser.role === 'admin' ? (
          <AdminDashboard currentUserId={currentUser.id} authToken={authToken} />
        ) : (
          <B2BPlayer currentUserId={currentUser.id} authToken={authToken} playlists={myPlaylists} />
        )}
      </div>
    </div>
  );
}
