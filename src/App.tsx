import { useState, useEffect } from "react";
import { UserProfile, Playlist } from "./types.js";
import { AdminDashboard } from "./components/AdminDashboard.js";
import { B2BPlayer } from "./components/B2BPlayer.js";
import { WhiteLabelPlayer } from "./components/WhiteLabelPlayer.js";
import { getApiUrl } from "./utils.js";
import { 
  Users, Music, Shield, LogOut, Disc, LogIn, ExternalLink, RefreshCw 
} from "lucide-react";

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/users`));
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setUsers(data);
      
      const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
      const queryUserId = params.get("sim_user");
      
      if (data.length > 0) {
        if (queryUserId) {
          const match = data.find((u: any) => u.id === queryUserId);
          if (match) {
            setCurrentUser(match);
            return;
          }
        }
        
        // Domyślny login na start (Kawiarnia Aroma - u2)
        const aroma = data.find((u: any) => u.id === 'u2') || data[0];
        setCurrentUser(aroma);
      }
    } catch (e) {
      console.error("Błąd pobierania użytkowników:", e);
    }
  };

  const fetchMyPlaylists = async (userId: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/my-playlists`), {
        headers: { 'Authorization': `x-user-id ${userId}` }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (!data.error) {
        setMyPlaylists(data);
      }
    } catch (e) {
      console.error("Błąd pobierania playlist użytkownika:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchUsers();
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchMyPlaylists(currentUser.id);
    }
  }, [currentUser]);

  const handleSwitchUser = (userId: string) => {
    const match = users.find(u => u.id === userId);
    if (match) {
      setCurrentUser(match);
    }
  };

  const [slug] = useState<string | null>(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    return params.get("slug");
  });

  if (slug) {
    return <WhiteLabelPlayer slug={slug} />;
  }

  if (isLoading || !currentUser) {
    return (
      <div className="flex h-screen w-screen bg-[#070505] items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Disc className="h-10 w-10 text-red-500 animate-spin" />
          <p className="font-mono text-xs tracking-widest text-gray-500 font-bold uppercase">Wczytywanie serwisu Commercial Music Licensing Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">

      {/* SYMULATOR LOGOWANIA / PRZEŁĄCZANIE UŻYTKOWNIKÓW */}
      <div className="fixed top-0 left-0 w-full bg-zinc-950 border-b border-zinc-900 px-4 py-2 flex items-center justify-between z-[100]">
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-orange-500" />
          <span className="text-white text-xs font-bold uppercase tracking-wider font-mono">Symulator Sesji</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest hidden sm:inline">Zalogowany jako:</span>
          <select 
            value={currentUser.id} 
            onChange={(e) => handleSwitchUser(e.target.value)}
            className="bg-black border border-zinc-800 text-xs text-white px-2 py-1 rounded font-mono focus:outline-none focus:border-orange-500"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* GŁÓWNA STRUKTURA SERWISU */}
      <div className="fade-in animate-duration-500 pt-10">
        {currentUser.role === 'admin' ? (
          /* Widok ADMIN PANEL HRL (v2.0 dashboard) */
          <AdminDashboard currentUserId={currentUser.id} />
        ) : (
          /* Widok KLIENT PLAYER WHITE-LABEL */
          <B2BPlayer 
            currentUserId={currentUser.id} 
            playlists={myPlaylists} 
          />
        )}
      </div>

    </div>
  );
}
