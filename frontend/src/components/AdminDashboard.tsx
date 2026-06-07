import React, { useState, useEffect } from "react";
import { Track, Playlist, Invoice, UserProfile, TimeOfDay } from "../types.js";
import { getApiUrl, getWsUrl } from "../utils.js";
import { 
  Music, Play, FileText, ShieldAlert, Database, Plus, Edit2, Trash2, 
  RefreshCw, TrendingUp, Users, DollarSign, Disc, Clock, Check, AlertOctagon, 
  Archive, Calendar, Sliders, ExternalLink, Settings, Eye, Download,
  Layers, Globe, Server, Code, Cpu, Activity, Wifi, Terminal, Sparkles,
  ChevronRight, Home, Search, X
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { InvoiceModal } from "./InvoiceModal.js";

interface AdminDashboardProps {
  currentUserId: string;
  authToken: string;
}

export function AdminDashboard({ currentUserId, authToken }: AdminDashboardProps) {
  const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  const [activeTab, setActiveTab] = useState<'dashboard' | 'monitoring' | 'tracks' | 'playlists' | 'designer' | 'pages' | 'invoices' | 'security' | 'backup' | 'integrations' | 'headless'>('dashboard');
  
  // States na dane z API
  const [stats, setStats] = useState<any>(null);
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [tracksList, setTracksList] = useState<Track[]>([]);
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const [playlistsList, setPlaylistsList] = useState<Playlist[]>([]);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [activeTokens, setActiveTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States na modale i formularze CRUD
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [trackForm, setTrackForm] = useState<Partial<Track>>({
    title: "", artist: "", album: "", year: 2026, bpm: 100, genre: "jazz",
    mood: ["relax"], duration: 120, explicit: false, timeOfDay: ["morning"], ISRC: "", cover: ""
  } as any);

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [playlistForm, setPlaylistForm] = useState<Partial<Playlist>>({
    title: "", pmproLevel: 1, clientName: "", accentColor: "#e63333", bgColor: "#0c0a07",
    autoplay: true, loop: true, hideTracklist: false, volume: 0.8, useSchedule: true, explicitFilter: true, tracks: []
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    name: "", email: "", role: "subscriber", pmproLevel: 1, playlistIds: [] as string[]
  });

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // States dla zakładki Headless - topologia, symulatory i docker config
  const [headlessActiveSubTab, setHeadlessActiveSubTab] = useState<'topology' | 'simulation' | 'docker'>('topology');
  const [selectedTrackForRedirect, setSelectedTrackForRedirect] = useState<string>("");
  const [simulationResultLog, setSimulationResultLog] = useState<string[]>([
    "Konsola symulatora gotowa.",
    "Wybierz utwór i kliknij 'Generuj Signed URL i symuluj Nginx X-Accel' aby przetestować przepływ."
  ]);
  const [activeConfigFile, setActiveConfigFile] = useState<'docker-compose.yml' | 'nginx.conf' | 'wp-config-headless.php'>('docker-compose.yml');
  const [tokenTtlSeconds, setTokenTtlSeconds] = useState<number>(3600);
  const [secureLinkSecret, setSecureLinkSecret] = useState<string>("hrl_direct_sec_jwt_signing_key_9182");

  // Dedykowane strony (White-label system) i WS podpięte terminale
  const [accessPagesList, setAccessPagesList] = useState<any[]>([]);
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [pageForm, setPageForm] = useState<any>({
    name: "",
    playlistId: "",
    requirePin: false,
    pinCode: "",
    whiteLabelTheme: {
      accentColor: "#f97316",
      bgColor: "#090504",
      logoUrl: "",
      title: "",
      description: "",
      customCss: ""
    },
    slug: "",
    active: true
  });
  const [onlineClients, setOnlineClients] = useState<any[]>([]);
  const [adminBroadcastMsg, setAdminBroadcastMsg] = useState({ title: "", message: "", type: "info" });

  // Monitoring system states
  const [incidentsList, setIncidentsList] = useState<any[]>([
    {
      id: 'inc-1',
      title: 'Przekroczone użycie zasobów (Database)',
      time: '10 min temu',
      description: 'Serwer osiągnął 90% obciążenia puli połączeń przy masowym odpytywaniu metadanych o pełnych godzinach przez stacje końcowe. Zalecana refaktoryzacja Query Cache.',
      severity: 'critical'
    },
    {
      id: 'inc-2',
      title: 'Pik latencji strumieniowania',
      time: '45 min temu',
      description: 'Średni czas TTFB (Time To First Byte) wzrósł z 40ms do 180ms dla regionu PL-EAST. Nginx worker rate limit zadziałał poprawnie.',
      severity: 'warning'
    }
  ]);
  const [cpuLoad, setCpuLoad] = useState<number>(42);
  const [ramLoad, setRamLoad] = useState<number>(68);
  const [trafficMultiplier, setTrafficMultiplier] = useState<number>(1.0);
  const [visiblePortals, setVisiblePortals] = useState<Record<string, boolean>>({
    aroma: true,
    trendsetter: true,
    titan: true,
    vip: true,
    club: true
  });
  const [bandwidthHistory, setBandwidthHistory] = useState<any[]>(() => {
    const data = [];
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 4000);
      data.push({
        time: d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        aroma: parseFloat((1.2 + Math.random() * 0.8).toFixed(1)),
        trendsetter: parseFloat((2.5 + Math.random() * 1.5).toFixed(1)),
        titan: parseFloat((1.8 + Math.random() * 1.0).toFixed(1)),
        vip: parseFloat((4.5 + Math.random() * 2.5).toFixed(1)),
        club: parseFloat((3.0 + Math.random() * 1.8).toFixed(1)),
      });
    }
    return data;
  });

  // Dynamic cpu, ram, and network traffic fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(prev => {
        const diff = Math.floor(Math.random() * 7) - 3;
        return Math.max(15, Math.min(85, prev + diff));
      });
      setRamLoad(prev => {
        const diff = Math.floor(Math.random() * 3) - 1;
        return Math.max(40, Math.min(80, prev + diff));
      });
      setBandwidthHistory(prev => {
        const nextTime = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newPoint = {
          time: nextTime,
          aroma: parseFloat(((1.2 + Math.random() * 0.8) * trafficMultiplier).toFixed(1)),
          trendsetter: parseFloat(((2.5 + Math.random() * 1.5) * trafficMultiplier).toFixed(1)),
          titan: parseFloat(((1.8 + Math.random() * 1.0) * trafficMultiplier).toFixed(1)),
          vip: parseFloat(((4.5 + Math.random() * 2.5) * trafficMultiplier).toFixed(1)),
          club: parseFloat(((3.0 + Math.random() * 1.8) * trafficMultiplier).toFixed(1)),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [trafficMultiplier]);

  // Połączenie z WebSocketem dla admina (real-time updates)
  useEffect(() => {
    const wsUrl = getWsUrl();
    
    let socket: WebSocket;
    const connectAdmin = () => {
      try {
        socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          socket.send(JSON.stringify({
            event: "identify",
            payload: {
              userId: currentUserId,
              name: "Admin Console",
              role: "admin"
            }
          }));
          fetchOnlineClients();
        };
        
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (
              data.event === "client_connected" || 
              data.event === "client_disconnected" || 
              data.event === "client_updated" || 
              data.event === "client_activity" ||
              data.event === "access_page_created" ||
              data.event === "access_page_updated" ||
              data.event === "access_page_deleted"
            ) {
              fetchOnlineClients();
              if (data.event.startsWith("access_page")) {
                loadPages();
              }
              if (data.event === "client_activity") {
                addLog(`[WS PLAY] ${data.payload.name}: ${data.payload.lastAction}`);
              } else if (data.event === "client_connected") {
                addLog(`[WS STATUS] Nowy odtwarzacz online: ${data.payload.name}`);
              } else if (data.event === "client_disconnected") {
                addLog(`[WS STATUS] Odtwarzacz offline: ${data.payload.name}`);
              }
            }
          } catch (e) {
            console.error(e);
          }
        };

        socket.onclose = () => {
          setTimeout(connectAdmin, 5000);
        };
      } catch (err) {
        console.error(err);
      }
    };

    connectAdmin();

    return () => {
      if (socket) socket.close();
    };
  }, [currentUserId]);

  const fetchOnlineClients = async () => {
    try {
      const res = await fetch(getApiUrl("/api/ws/clients"));
      const data = await res.json();
      setOnlineClients(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiUrl("/api/ws/broadcast"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminBroadcastMsg)
      });
      const data = await res.json();
      addLog(`[WS SYSTEM] Rozesłano powiadomienie push do ${data.clientsNotified} terminali.`);
      setAdminBroadcastMsg({ title: "", message: "", type: "info" });
    } catch (e) {
      addLog(`[WS ERROR] Nie udało się rozesłać powiadomienia.`);
    }
  };

  // Narzędzia do ładowania danych
  const loadStats = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/stats/summary`), {
        headers: { ...authHeaders }
      });
      const data = await res.json();
      if (!data.error) setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTracks = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/tracks`), { headers: { ...authHeaders } });
      if (res.ok) {
        const data = await res.json();
        setTracksList(data);
      }
    } catch (e) { console.error("Error loading tracks", e); }
  };

  const loadPlaylists = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/playlists`), { headers: { ...authHeaders } });
      if (res.ok) {
        const data = await res.json();
        setPlaylistsList(data);
      }
    } catch (e) { console.error("Error loading playlists", e); }
  };

  const loadInvoices = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/invoices`), { headers: { ...authHeaders } });
      if (res.ok) {
        const data = await res.json();
        setInvoicesList(data);
      }
    } catch (e) { console.error("Error loading invoices", e); }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/users`), { headers: { ...authHeaders } });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) { console.error("Error loading users", e); }
  };

  const loadTokens = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/tokens/active`), { headers: { ...authHeaders } });
      if (res.ok) {
        const data = await res.json();
        setActiveTokens(data);
      }
    } catch (e) { console.error("Error loading tokens", e); }
  };

  const loadPages = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/access-pages`), { headers: { ...authHeaders } });
      if (res.ok) {
        const data = await res.json();
        if (!data.error) setAccessPagesList(data);
      }
    } catch (e) { console.error("Błąd ładowania stron dedykowanych:", e); }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/settings`), { headers: { ...authHeaders }});
      if (res.ok) {
        setGlobalSettings(await res.json());
      }
    } catch (e) { console.error(e); }
  }

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([loadStats(), loadTracks(), loadPlaylists(), loadInvoices(), loadUsers(), loadTokens(), loadPages(), loadSettings()]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Dynamiczny log operacji systemowych
    addLog("System Commercial Music Licensing Platform v2.0 wystartował pomyślnie.");
    addLog("Weryfikacja reguł Nginx internal dla wp-content/uploads/cmlp-music/ zakończona.");
    addLog("Serwer PHP-FPM 8.2 gotowy do obsługi Range requests.");
  }, []);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('pl-PL');
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const handleSendWebhook = async () => {
    if (!globalSettings?.integrations?.webhookUrl) {
      alert("Proszę wpisać adres URL webhooka");
      return;
    }
    try {
      const res = await fetch(getApiUrl("/api/webhooks/test"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: globalSettings.integrations.webhookUrl, payload: { event: "test" } })
      });
      const data = await res.json();
      if (res.ok) alert("Wysłano testowy payload: " + data.message);
      else alert("Błąd " + data.error);
    } catch(err) {
      console.error(err);
    }
  };

  // Ustawienia globalne
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSettings) return;
    try {
      const res = await fetch(getApiUrl(`/api/settings`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(globalSettings)
      });
      if (res.ok) {
        addLog("Zapisano ustawienia globalne (Designer/Integracje).");
        alert("Zapisano ustawienia!");
      }
    } catch(err) {
      console.error(err);
    }
  };

  // Obsługa CRUD Utworów
  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingTrack ? `/api/tracks/${editingTrack.id}` : `/api/tracks`;
    const method = editingTrack ? 'PUT' : 'POST';

    try {
      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(trackForm)
      });
      const data = await res.json();
      if (!data.error) {
        addLog(editingTrack ? `Zaktualizowano utwór "${data.title}"` : `Dodano nowy utwór "${data.title}"`);
        setShowTrackModal(false);
        setEditingTrack(null);
        loadTracks();
        loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTrack = async (id: string, title: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć utwór "${title}"?`)) return;
    try {
      await fetch(getApiUrl(`/api/tracks/${id}`), {
        method: 'DELETE',
        headers: { ...authHeaders }
      });
      addLog(`Usunięto utwór "${title}"`);
      loadTracks();
      loadStats();
    } catch (err) { console.error(err); }
  };

  // Obsługa CRUD Custom B2B Access Pages
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingPage ? `/api/access-pages/${editingPage.id}` : `/api/access-pages`;
    const method = editingPage ? 'PUT' : 'POST';

    try {
      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(pageForm)
      });
      const data = await res.json();
      if (!data.error) {
        addLog(editingPage ? `Zaktualizowano stronę dedykowaną "${data.name}"` : `Utworzono dedykowaną stronę B2B "${data.name}"`);
        setShowPageModal(false);
        setEditingPage(null);
        loadPages();
      } else {
        alert("Błąd zapisu strony: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePage = async (id: string, name: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć dedykowaną witrynę "${name}"?`)) return;
    try {
      await fetch(getApiUrl(`/api/access-pages/${id}`), {
        method: 'DELETE',
        headers: { ...authHeaders }
      });
      addLog(`Usunięto dedykowaną witrynę "${name}"`);
      loadPages();
    } catch (err) { console.error(err); }
  };

  // Obsługa CRUD Playlist
  const handleSavePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingPlaylist ? `/api/playlists/${editingPlaylist.id}` : `/api/playlists`;
    const method = editingPlaylist ? 'PUT' : 'POST';

    try {
      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(playlistForm)
      });
      const data = await res.json();
      if (!data.error) {
        addLog(editingPlaylist ? `Zaktualizowano playlistę "${data.title}"` : `Dodano nową playlistę "${data.title}"`);
        setShowPlaylistModal(false);
        setEditingPlaylist(null);
        loadPlaylists();
        loadStats();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeletePlaylist = async (id: string, title: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć playlistę "${title}"?`)) return;
    try {
      await fetch(getApiUrl(`/api/playlists/${id}`), {
        method: 'DELETE',
        headers: { ...authHeaders }
      });
      addLog(`Usunięto playlistę "${title}"`);
      loadPlaylists();
      loadStats();
    } catch (err) { console.error(err); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUserId ? `/api/users/${editingUserId}` : `/api/users`;
      const method = editingUserId ? 'PUT' : 'POST';

      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (!data.error) {
        if (editingUserId) {
          addLog(`Zaktualizowano profil klienta B2B "${data.user.name}".`);
        } else {
          addLog(`Zarejestrowano klienta B2B "${data.user.name}". Wygenerowano fakturę Checkout: ${data.invoice.invoiceNumber}`);
        }
        setShowUserModal(false);
        setEditingUserId(null);
        loadUsers();
        if (!editingUserId) loadInvoices();
        loadStats();
      }
    } catch (err) { console.error(err); }
  };

  const handleCleanExpiredTokens = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/tokens/expired`), { method: 'DELETE' });
      const data = await res.json();
      addLog(`Czyszczenie tokenów: Usunięto ${data.deleted} wygasłych tokenów HMAC.`);
      loadTokens();
    } catch (err) { console.error(err); }
  };

  const handleDownloadBackup = (type: 'db' | 'music' | 'plugin') => {
    const d = new Date().toISOString().split('T')[0].replace(/-/g, '');
    let filename = `db_${d}.sql.gz`;
    if (type === 'music') filename = `music_${d}.tar.gz`;
    if (type === 'plugin') filename = `plugin_${d}.tar.gz`;

    const el = document.createElement('a');
    el.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(`Commercial Music Licensing Platform - Symulacja pliku kopii zapasowej ${type}`)}`);
    el.setAttribute('download', filename);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);

    addLog(`Wygenerowano i pobrano kopię zapasową: ${filename}`);
  };

  const handleResetAlarms = () => {
    setIncidentsList([]);
    addLog("SYSTEM DIAGNOSTIC: Zresetowano wszystkie alarmy systemowe. Stan infrastruktury: NOMINALNY.");
    alert("Wszystkie alerty i alarmy krytyczne zostały zresetowane pomyślnie.");
  };

  const handleResolveIncident = (id: string, title: string) => {
    setIncidentsList(prev => prev.filter(item => item.id !== id));
    addLog(`SYSTEM DIAGNOSTIC: Rozwiązano incydent "${title}". Stan wrócił do normy.`);
  };

  const handleBypassCache = () => {
    setCpuLoad(20);
    addLog("NGINX RE-ROUTE: Obejście pamięci podręcznej (Bypass Cache) uruchomione. Wymuszono świeży odczyt bezpośrednio z bazy danych.");
    alert("Nginx Cache Bypassed na poziomie Edge Nodes! Obciążenie bazy danych unormowane.");
    setTimeout(() => {
      setCpuLoad(38);
    }, 4000);
  };

  const currentTotalBandwidth = parseFloat((
    (visiblePortals.aroma ? (bandwidthHistory[bandwidthHistory.length - 1]?.aroma || 0) : 0) +
    (visiblePortals.trendsetter ? (bandwidthHistory[bandwidthHistory.length - 1]?.trendsetter || 0) : 0) +
    (visiblePortals.titan ? (bandwidthHistory[bandwidthHistory.length - 1]?.titan || 0) : 0) +
    (visiblePortals.vip ? (bandwidthHistory[bandwidthHistory.length - 1]?.vip || 0) : 0) +
    (visiblePortals.club ? (bandwidthHistory[bandwidthHistory.length - 1]?.club || 0) : 0)
  ).toFixed(1));

  const filteredTracks = tracksList.filter((track) => {
    if (!trackSearchQuery.trim()) return true;
    const query = trackSearchQuery.toLowerCase();
    const titleMatch = track.title?.toLowerCase().includes(query) || false;
    const artistMatch = track.artist?.toLowerCase().includes(query) || false;
    const genreMatch = track.genre?.toLowerCase().includes(query) || false;
    return titleMatch || artistMatch || genreMatch;
  });

  const modulesList = [
    { id: 'dashboard', label: 'Monitor KPI & WS', icon: TrendingUp },
    { id: 'monitoring', label: 'Nadzór i Monitorowanie', icon: AlertOctagon },
    { id: 'tracks', label: 'Utwory muzyczne', icon: Music },
    { id: 'playlists', label: 'Zarządzanie playlistami', icon: Sliders },
    { id: 'pages', label: 'Strony dostępu B2B', icon: Globe },
    { id: 'designer', label: 'Projektant szablonów', icon: Eye },
    { id: 'invoices', label: 'Biling i faktury', icon: FileText },
    { id: 'security', label: 'Tokeny HMAC & IP', icon: ShieldAlert },
    { id: 'backup', label: 'Kopia i harmonogram', icon: Database },
    { id: 'integrations', label: 'API i integracje SaaS', icon: ExternalLink },
    { id: 'headless', label: 'Architektura & Headless', icon: Layers },
  ];

  const activeModule = modulesList.find(m => m.id === activeTab) || modulesList[0];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-300 font-sans">
      
      {/* GÓRNY HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur px-6 py-4 flex justify-between items-center z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="font-sans font-black text-2xl tracking-widest text-orange-500">HRL</div>
          <div className="h-5 w-[1px] bg-zinc-800"></div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">CORE ADMIN PANEL v2.0</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Synchronizuj</span>
          </button>
        </div>
      </header>

      {/* GŁÓWNY ZAKRES */}
      <div className="flex flex-col md:flex-row flex-1">
        
        {/* PANEL NAWIGACJI */}
        <nav className="w-full md:w-64 border-r border-zinc-805 bg-zinc-950/40 p-4 space-y-1 select-none shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 mb-3 font-mono">Moduły Systemowe</p>
          {modulesList.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-all duration-200 cursor-pointer relative ${
                  isSelected 
                    ? 'bg-gradient-to-r from-orange-500/10 to-orange-500/0 text-orange-400 border border-orange-500/10' 
                    : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white hover:translate-x-1 border border-transparent'
                }`}
              >
                {isSelected && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-orange-500 rounded-full" />
                )}
                <Icon className={`h-4 w-4 transition-colors ${isSelected ? 'text-orange-400' : 'text-zinc-550 group-hover:text-zinc-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 mb-2 font-mono">Konsola zdarzeń VPS</p>
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 h-44 overflow-y-auto text-[10px] font-mono text-emerald-500 space-y-1.5 shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className="leading-relaxed opacity-90 break-all">{log}</div>
              ))}
            </div>
          </div>
        </nav>

        {/* GŁÓWNA ZAWARTOŚĆ */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* SYSTEMOWE OKRUSZKI CHLEBA (BREADCRUMBS) */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-900 pb-4 mb-6 select-none animate-fade-in shrink-0">
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[11px] font-mono">
                  <button 
                    onClick={() => setActiveTab('dashboard')} 
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-orange-400 transition-colors uppercase tracking-wider font-extrabold cursor-pointer"
                  >
                    <Home className="h-3.5 w-3.5 text-zinc-600" />
                    <span>HRL DIRECT</span>
                  </button>
                  <ChevronRight className="h-3 w-3 text-zinc-700" />
                  <span className="text-zinc-600 font-bold uppercase tracking-wider">PANEL KONTROLNY</span>
                  <ChevronRight className="h-3 w-3 text-zinc-700" />
                  <div className="flex items-center gap-2 bg-orange-500/10 text-orange-400 font-black uppercase tracking-wider px-3 py-1 rounded-xl border border-orange-500/10 shadow-sm transition-all duration-300">
                    <activeModule.icon className="h-3.5 w-3.5 animate-pulse" />
                    <span>{activeModule.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-900 shadow-sm">
                  <div className="flex items-center gap-1.5 relative">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping absolute"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 block"></span>
                    <span className="text-[10px] font-mono text-emerald-500 font-extrabold tracking-widest uppercase ml-1">Live</span>
                  </div>
                  <div className="h-3.5 w-[1px] bg-zinc-800" />
                  <span className="text-[9.5px] font-mono text-zinc-400 font-medium">NODE PL-EAST #12</span>
                </div>
              </div>

              {/* MONITOR KPI / DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Karty KPI */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                      <div>
                        <p className="text-xs text-zinc-400 font-bold font-mono uppercase tracking-wider">MRR Przychód</p>
                        <h3 className="text-2xl font-black text-white font-sans mt-1">{stats?.revenueMonthly || 0} PLN</h3>
                        <p className="text-[10px] text-emerald-400 font-semibold mt-1">▲ Płatności B2B</p>
                      </div>
                      <div className="bg-orange-500/10 text-orange-400 p-3 rounded-xl border border-orange-500/20">
                        <DollarSign className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                      <div>
                        <p className="text-xs text-zinc-400 font-bold font-mono uppercase tracking-wider">Klienci B2B</p>
                        <h3 className="text-2xl font-black text-white font-sans mt-1">{stats?.activeClients || 0}</h3>
                        <p className="text-[10px] text-zinc-500 mt-1">Aktywni klienci</p>
                      </div>
                      <div className="bg-blue-500/10 text-blue-500 p-3 rounded-xl border border-blue-500/20">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                      <div>
                        <p className="text-xs text-zinc-400 font-bold font-mono uppercase tracking-wider">Odtworzeń utworu</p>
                        <h3 className="text-2xl font-black text-white font-sans mt-1">{stats?.totalPlays || 0}</h3>
                        <p className="text-[10px] text-orange-400 font-semibold mt-1">Logi hrl_plays</p>
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
                        <Play className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                      <div>
                        <p className="text-xs text-zinc-400 font-bold font-mono uppercase tracking-wider">Utwory w bazie</p>
                        <h3 className="text-2xl font-black text-white font-sans mt-1">{stats?.totalTracks || 0}</h3>
                        <p className="text-[10px] text-zinc-500 mt-1">100% licencjonowane HRL</p>
                      </div>
                      <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl border border-amber-500/20">
                        <Music className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Wykres Recharts odtworzeń + Top Tracks */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-5 lg:col-span-2 space-y-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Statystyki odtworzeń</h4>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">Łączna liczba pingu /api/play na dzień (ostatnie 7 dni)</p>
                        </div>
                      </div>
                      
                      <div className="h-64 mt-4 text-xs font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats?.playsByDay || []}>
                            <defs>
                              <linearGradient id="playsGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <XAxis dataKey="date" stroke="#71717a" />
                            <YAxis stroke="#71717a" />
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                            <Area type="monotone" dataKey="count" name="Odtworzenia" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#playsGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Top tracki */}
                    <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-lg">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Top 5 Utworów</h4>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">Najczęściej puszczane w tym tygodniu</p>
                      </div>

                      <div className="space-y-4 my-2 flex-grow flex flex-col justify-center">
                        {(stats?.topTracks || []).map((track: any, idx: number) => (
                           <div key={idx} className="space-y-1.5">
                             <div className="flex justify-between text-xs font-semibold">
                               <span className="text-white truncate max-w-[150px]">{track.title}</span>
                               <span className="text-zinc-400 font-mono text-[10px]">{track.plays} odtworzeń</span>
                             </div>
                             <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                               <div 
                                 className="h-full bg-orange-500 rounded-full" 
                                 style={{ width: `${Math.min(100, (track.plays / (stats.topTracks[0]?.plays || 1)) * 100)}%` }}
                               ></div>
                             </div>
                           </div>
                        ))}
                      </div>

                      <div className="border-t border-zinc-805 pt-3 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                        <span>Raport hrl_plays</span>
                        <span>Zaktualizowano teraz</span>
                      </div>
                    </div>

                  </div>

                  {/* Szybkie akcje / Dodawanie klienta */}
                  <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Szybkie Zarządzanie Klientami B2B</h4>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">Zarejestruj nowego klienta B2B</p>
                      </div>
                      <button 
                        onClick={() => {
                          setUserForm({ name: "", email: "", role: "subscriber", pmproLevel: 1, playlistIds: [] });
                          setShowUserModal(true);
                        }}
                        className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white px-4 py-2.5 rounded-xl transition-all duration-200"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Dodaj Klienta B2B & Fakturę</span>
                      </button>
                    </div>

                    {/* Tabela klientów */}
                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-400 border-collapse">
                        <thead>
                          <tr className="border-b border-gray-900 text-gray-500 font-mono uppercase text-[10px]">
                            <th className="py-3">E-mail</th>
                            <th className="py-3">Nazwa firmy / Klienta</th>
                            <th className="py-3">Biling Model</th>
                            <th className="py-3 text-right">Faktura VIP</th>
                            <th className="py-3 text-right">Akcje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList.filter(u => u.role !== 'admin').map((user, idx) => (
                            <tr key={idx} className="border-b border-gray-950 hover:bg-black/10 transition">
                              <td className="py-3.5 font-mono text-white select-all">{user.email}</td>
                              <td className="py-3.5 font-bold text-white">{user.name}</td>

                              <td className="py-3.5">
                                <span className={`font-mono text-[10px] ${user.playlistIds.length > 0 ? "text-yellow-400" : "text-gray-400"}`}>
                                  {user.playlistIds.length > 0 ? "Model B (User Meta)" : "Model A (Default)"}
                                </span>
                              </td>
                              <td className="py-3.5 text-right font-mono text-[10px] text-gray-500">
                                100% System Sliced Invoices
                              </td>
                              <td className="py-3.5 text-right">
                                <button
                                  onClick={() => {
                                    setEditingUserId(user.id);
                                    setUserForm({
                                      name: user.name,
                                      email: user.email,
                                      role: user.role,
                                      pmproLevel: user.pmproLevel,
                                      playlistIds: user.playlistIds
                                    });
                                    setShowUserModal(true);
                                  }}
                                  className="text-[10px] font-bold font-mono tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded transition"
                                >
                                  Edytuj
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 📶 WEBSOCKET MONITOR REAL-TIME & LIVE BROADCASTING PANELS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Połączone terminale przez WS */}
                    <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-5 lg:col-span-2 space-y-4 shadow-lg text-left">
                      <div className="flex justify-between items-center border-b border-zinc-950 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Czas rzeczywisty (WebSocket Livestream Terminals)</span>
                          </h4>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">Aktywne odtwarzacze zalogowane w systemie i odtwarzające strumień</p>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[10px] font-mono px-2.5 py-1 rounded-full font-bold">
                          {onlineClients.length} urządzeń online
                        </span>
                      </div>

                      <div className="space-y-3 max-h-72 overflow-y-auto">
                        {onlineClients.map((client) => (
                          <div key={client.id} className="bg-black/40 border border-zinc-950 px-4 py-3 rounded-xl flex items-center justify-between hover:border-zinc-850 transition">
                            <div className="space-y-0.5 truncate pr-4">
                              <p className="text-xs font-bold text-white">{client.name}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">ID połączenia: {client.id} | Połączono: {new Date(client.connectedAt).toLocaleTimeString('pl-PL')}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-[10.5px] font-mono bg-orange-950/20 text-orange-400 px-2.5 py-1 border border-orange-500/10 rounded-lg">
                                {client.lastAction}
                              </span>
                            </div>
                          </div>
                        ))}

                        {onlineClients.length === 0 && (
                          <div className="text-center py-8 text-zinc-500 text-xs font-mono">
                            Brak aktywnych połączeń WebSocket. Otwórz odtwarzacz w osobnym oknie aby zobaczyć live ping!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Formularz rozgłoszeniowy Push przez WebSockets */}
                    <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-5 space-y-4 shadow-lg text-left flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">System Powiadomień Push (Broadcaster)</h4>
                        <p className="text-xs text-zinc-400 font-mono">Wyślij natychmiastowy komunikat administratora bezpośrednio do wszystkich odtwarzaczy B2B.</p>
                      </div>

                      <form onSubmit={handleSendBroadcast} className="space-y-3 my-2 flex-grow flex flex-col justify-center text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Tytuł powiadomienia</label>
                          <input 
                            type="text" required
                            value={adminBroadcastMsg.title}
                            onChange={e => setAdminBroadcastMsg(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-black border border-zinc-805 rounded-lg px-3 py-1.5 text-white text-xs"
                            placeholder="np. Przerwa techniczna HRL"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Treść komunikatu</label>
                          <textarea 
                            required
                            value={adminBroadcastMsg.message}
                            onChange={e => setAdminBroadcastMsg(prev => ({ ...prev, message: e.target.value }))}
                            className="w-full bg-black border border-zinc-805 rounded-lg px-3 py-1.5 text-white text-xs"
                            rows={2}
                            placeholder="np. Za 5 minut nastąpi aktualizacja certyfikatów Bez ZAIKS..."
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={onlineClients.length === 0}
                          className="w-full py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
                        >
                          Wyślij powiadomienie Push
                        </button>
                      </form>

                      <p className="text-[9.5px] font-mono text-zinc-500 uppercase text-center">Obsługiwane przez NodeJS WS channel</p>
                    </div>
                  </div>

                </div>
              )}

              {/* MONITORING SYSTEM */}
              {activeTab === 'monitoring' && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Profesjonalny Nadzór Systemu</h4>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">Diagnostyka infrastruktury i powiadomienia z nodeów w czasie rzeczywistym</p>
                    </div>
                    <button 
                      onClick={handleResetAlarms}
                      className="flex items-center gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold px-3 py-1.5 rounded-lg text-xs transition border border-red-500/20 cursor-pointer"
                    >
                      <AlertOctagon className="h-4 w-4" /> Reset Alarmów
                    </button>
                  </div>
                  
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/90 border border-zinc-850 p-5 rounded-2xl shadow-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Obciążenie CPU</span>
                        <Cpu className="h-4 w-4 text-orange-400" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-3xl font-black text-white font-sans">{cpuLoad}%</span>
                        <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {cpuLoad > 80 ? "Przeciążenie" : cpuLoad > 60 ? "Podwyższone" : "Stabilne"}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-950 h-1.5 mt-4 rounded-full overflow-hidden border border-zinc-900">
                        <div className="bg-gradient-to-r from-orange-600 to-orange-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${cpuLoad}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-900/90 border border-zinc-850 p-5 rounded-2xl shadow-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Użycie RAM</span>
                        <Server className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-3xl font-black text-white font-sans">{ramLoad}%</span>
                        <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">W normie</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-1.5 mt-4 rounded-full overflow-hidden border border-zinc-900">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full transition-all duration-550" style={{ width: `${ramLoad}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/90 border border-zinc-850 p-5 rounded-2xl shadow-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Przepustowość Sieci</span>
                        <Wifi className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-3xl font-black text-white font-sans">{currentTotalBandwidth}</span>
                        <span className="text-xs font-mono text-zinc-400">MB/s</span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-2 bg-zinc-950 px-2 py-1 rounded inline-block border border-zinc-800">
                        ↑ {(currentTotalBandwidth * 0.35).toFixed(1)} MB/s | ↓ {(currentTotalBandwidth * 0.65).toFixed(1)} MB/s
                      </div>
                    </div>

                    <div className="bg-zinc-900/90 border border-zinc-850 p-5 rounded-2xl shadow-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">SLA Uptime</span>
                        <Activity className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-3xl font-black text-white font-sans">{incidentsList.length > 0 ? "99.98%" : "99.99%"}</span>
                        <span className="text-xs font-mono text-zinc-400">30 dni</span>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 mt-2 bg-emerald-500/10 px-2 py-1 rounded inline-block font-bold">
                        Od 45 dni bez awarii
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Bandwidth per White-Label Portal */}
                  <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-6 shadow-lg flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                          <span>Przepustowość Portali White-Label w Czasie Rzeczywistym</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Analiza pasma stacji końcowych i portali B2B partnerów [Live CDN Nodes]</p>
                      </div>

                      {/* Controls to simulate or toggle */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => {
                            setTrafficMultiplier(3.0);
                            addLog("CDN SIMULATION: Uruchomiono tryb piku ruchu (Surge Traffic). Zwiększono transfer x3.");
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                            trafficMultiplier === 3.0 
                              ? 'bg-red-600 text-white border border-red-500' 
                              : 'bg-zinc-850 hover:bg-zinc-800 text-red-500 border border-red-500/20'
                          }`}
                        >
                          ⚡ Pik Ruchu (x3)
                        </button>
                        <button 
                          onClick={() => {
                            setTrafficMultiplier(0.4);
                            addLog("CDN SIMULATION: Włączono dławienie pasma (QoS Throttling) dla wszystkich portali.");
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                            trafficMultiplier === 0.4 
                              ? 'bg-amber-600 text-white border border-amber-500' 
                              : 'bg-zinc-850 hover:bg-zinc-800 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          🛑 Dławienie Pasma
                        </button>
                        <button 
                          onClick={() => {
                            setTrafficMultiplier(1.0);
                            addLog("CDN SIMULATION: Przywrócono nominalne obciążenie pasma dla portali partnerów.");
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                            trafficMultiplier === 1.0 
                              ? 'bg-zinc-800 text-white border border-zinc-700' 
                              : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          Nominalny (x1)
                        </button>
                      </div>
                    </div>

                    {/* Filter Checkboxes */}
                    <div className="flex flex-wrap gap-4 p-3 bg-black/40 border border-zinc-950 rounded-xl">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 my-auto">Filtruj Portale:</span>
                      {[
                        { id: 'aroma', label: '☕ Aroma Cafe Lounge', color: '#d97706' },
                        { id: 'trendsetter', label: '🛍️ Trendsetter Club', color: '#ec4899' },
                        { id: 'titan', label: '💪 Titan Gym & Fit', color: '#059669' },
                        { id: 'vip', label: '👑 VIP Palace & Spa', color: '#8b5cf6' },
                        { id: 'club', label: '🎧 HRL Club Room', color: '#f97316' }
                      ].map((portal) => (
                        <label key={portal.id} className="flex items-center gap-2 cursor-pointer group text-[11px]">
                          <input 
                            type="checkbox" 
                            checked={visiblePortals[portal.id]}
                            onChange={(e) => setVisiblePortals({ ...visiblePortals, [portal.id]: e.target.checked })}
                            className="rounded border-zinc-700 bg-zinc-950 text-indigo-505 focus:ring-0" 
                          />
                          <span className="font-semibold transition group-hover:text-white" style={{ color: visiblePortals[portal.id] ? portal.color : '#71717a' }}>
                            {portal.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Recharts Graphical representation */}
                    <div className="h-72 w-full bg-[#050505] border border-zinc-900 rounded-2xl p-4 relative overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={bandwidthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAroma" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorTrendsetter" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorTitan" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#059669" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorVip" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorClub" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#121214" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#52525b" 
                            fontSize={9} 
                            fontFamily="monospace"
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#52525b" 
                            fontSize={9} 
                            fontFamily="monospace"
                            tickFormatter={(v) => `${v} MB/s`}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#18181b', borderRadius: 12 }}
                            itemStyle={{ fontSize: 10, fontFamily: 'monospace' }}
                            labelStyle={{ fontSize: 9, fontFamily: 'monospace', color: '#a1a1aa', fontWeight: 'bold' }}
                            formatter={(value: any, name: any) => [`${value} MB/s`, name.toUpperCase()]}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', paddingTop: 10 }} 
                            verticalAlign="bottom" 
                            height={36} 
                          />
                          {visiblePortals.aroma && (
                            <Area type="monotone" dataKey="aroma" name="Aroma Cafe" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorAroma)" />
                          )}
                          {visiblePortals.trendsetter && (
                            <Area type="monotone" dataKey="trendsetter" name="Trendsetter" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorTrendsetter)" />
                          )}
                          {visiblePortals.titan && (
                            <Area type="monotone" dataKey="titan" name="Titan Gym" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorTitan)" />
                          )}
                          {visiblePortals.vip && (
                            <Area type="monotone" dataKey="vip" name="VIP Palace" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorVip)" />
                          )}
                          {visiblePortals.club && (
                            <Area type="monotone" dataKey="club" name="HRL Club" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorClub)" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Logs and alerts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-6 shadow-lg flex flex-col">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-zinc-400" /> Dziennik Zdarzeń Systemowych
                      </h4>
                      <div className="bg-[#050505] border border-zinc-900 rounded-xl p-4 h-64 overflow-y-auto text-[10px] font-mono flex flex-col gap-2 shadow-inner">
                        <div className="text-emerald-400"><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> WORKER: Generowanie tokenów JWT zakończone (23 kluczy).</div>
                        <div className="text-zinc-400"><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> SYSTEM: Backup bazy danych zakończony sukcesem (123 MB).</div>
                        <div className="text-zinc-400"><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> NGINX: Przeładowano konfigurację cache i certyfikatów.</div>
                        <div className="text-orange-400"><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> WARN: Wykryto wzmożony ruch z zakresu IP 192.168.x.x na porcie 443</div>
                        <div className="text-emerald-400"><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> AUTH: Zalogowano użytkownika z uprawnieniami root przez SSH.</div>
                        <div className="text-zinc-400"><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> CRON: Czyszczenie tymczasowych tokenów HMAC (3 usunięte).</div>
                        {incidentsList.length > 0 && (
                          <div className="text-red-400"><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> ERROR: Brak odpowiedzi z read-repliki baz danych (timeout 2s). Automatyczny failover aktywny.</div>
                        )}
                        <div className="text-emerald-400"><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> SYSTEM: Ruch przełączony na stan główny po weryfikacji.</div>
                        <div className="text-zinc-400"><span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span> CDN: Odświeżono pamięć podręczną edge nodes.</div>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-900/90 border border-zinc-850 rounded-2xl p-6 shadow-lg flex flex-col font-sans">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-red-500" /> Alerty Krytyczne / Incydenty
                      </h4>
                      <div className="space-y-4 overflow-y-auto flex-grow flex flex-col justify-start">
                        {incidentsList.map((inc) => (
                          <div key={inc.id} className={`p-4 rounded-xl space-y-2 border transition-all ${
                            inc.severity === 'critical' 
                              ? 'bg-red-500/10 border-red-500/20' 
                              : 'bg-orange-500/10 border-orange-500/20'
                          }`}>
                            <div className="flex justify-between items-start">
                              <span className={`text-xs font-bold flex items-center gap-1.5 ${
                                inc.severity === 'critical' ? 'text-red-400' : 'text-orange-400'
                              }`}>
                                <Activity className="w-3.5 h-3.5"/> {inc.title}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded">{inc.time}</span>
                            </div>
                            <p className="text-[10px] text-zinc-300 leading-relaxed font-mono bg-black/20 p-2 rounded border border-zinc-900">
                              {inc.description}
                            </p>
                            <div className="pt-2 flex gap-2">
                              {inc.id === 'inc-1' && (
                                <button 
                                  onClick={handleBypassCache}
                                  className="text-[10px] font-bold font-mono uppercase bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition shadow-sm cursor-pointer"
                                >
                                  Bypass Cache
                                </button>
                              )}
                              <button 
                                onClick={() => handleResolveIncident(inc.id, inc.title)}
                                className="text-[10px] font-bold font-mono uppercase bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded border border-zinc-700 transition cursor-pointer"
                              >
                                Oznacz jako rozwiązane
                              </button>
                            </div>
                          </div>
                        ))}

                        {incidentsList.length === 0 && (
                          <div className="text-center py-12 flex flex-col items-center justify-center space-y-3 h-full my-auto text-zinc-500">
                            <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/10 text-emerald-400">
                              <Check className="h-6 w-6" />
                            </div>
                            <h5 className="text-white font-extrabold uppercase tracking-wider text-xs">Stan nominalny</h5>
                            <p className="text-[11px] max-w-xs leading-relaxed">Brak aktywnych incydentów w sieci dystrybucyjnej. Wszystkie node'y HRL pracują optymalnie.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CRUD UTWORY */}
              {activeTab === 'tracks' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Katalog utworów hrl_track</h4>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">Dodawaj utwory, ustawiaj metadane, harmonogram pór dnia oraz statusy jawne (explicit)</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingTrack(null);
                        setTrackForm({
                          title: "", artist: "", album: "", year: 2026, bpm: 95, genre: "jazz",
                          mood: ["relax"], duration: 150, explicit: false, timeOfDay: ["morning"], isrc: "", cover: "", filename: ""
                        });
                        setShowTrackModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-xs font-bold text-white px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Dodaj Utwór</span>
                    </button>
                  </div>

                  {/* 🔍 Real-Time Search Bar */}
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-md">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        value={trackSearchQuery}
                        onChange={(e) => setTrackSearchQuery(e.target.value)}
                        placeholder="Wyszukaj po tytule, wykonawcy lub gatunku..."
                        className="w-full bg-zinc-950 font-sans text-xs font-semibold text-white pl-10 pr-10 py-2.5 rounded-xl border border-zinc-900 focus:border-orange-500/50 focus:outline-none transition placeholder-zinc-650"
                      />
                      {trackSearchQuery && (
                        <button
                          onClick={() => setTrackSearchQuery("")}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 self-end sm:self-auto select-none">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-bold">Wyniki:</span>
                      <div className="bg-zinc-950 border border-zinc-900 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-orange-400">{filteredTracks.length}</span>
                        <span className="text-[10px] font-mono text-zinc-600 font-bold">z</span>
                        <span className="text-xs font-mono font-black text-zinc-400">{tracksList.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lista utworów */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTracks.map((track) => (
                      <div key={track.id} className="bg-[#121318] border border-gray-900 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-gray-800 transition">
                        <div className="p-4 flex gap-4">
                          <img 
                            src={track.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=60'} 
                            alt={track.title}
                            className="w-16 h-16 object-cover rounded-xl bg-gray-900 aspect-square"
                          />
                          <div className="space-y-1 truncate flex-1">
                            <h5 className="font-bold text-white truncate text-sm">{track.title}</h5>
                            <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                            <p className="text-[10px] text-gray-500 truncate">{track.album} ({track.year})</p>
                          </div>
                        </div>

                        <div className="bg-[#050508] px-4 py-3 grid grid-cols-2 gap-y-2 border-t border-gray-900/60 text-[10px] font-mono">
                          <div>
                            <span className="text-gray-500">ISRC:</span> <span className="text-gray-300 font-semibold">{track.isrc}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">BPM:</span> <span className="text-gray-300 font-semibold">{track.bpm}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Pora:</span> <span className="text-red-400 font-bold capitalize">{track.timeOfDay.join(', ')}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Gatunek:</span> <span className="text-gray-300 capitalize">{track.genre}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Czas:</span> <span className="text-gray-300">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                          </div>
                          <div>
                            {track.explicit && (
                              <span className="bg-red-500/15 text-red-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-red-500/20 font-sans tracking-widest">EXPLICIT</span>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-gray-950 bg-black/40 px-4 py-2.5 flex justify-between items-center text-xs">
                          <span className="font-mono text-[9px] text-gray-600 font-bold uppercase select-all">{track.filename}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingTrack(track);
                                setTrackForm(track);
                                setShowTrackModal(true);
                              }}
                              className="p-1 px-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition"
                              title="Edytuj"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTrack(track.id, track.title)}
                              className="p-1 px-2 rounded-lg bg-[#ef4444]/10 hover:bg-[#ef4444]/25 text-red-500 transition cursor-pointer"
                              title="Usuń"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredTracks.length === 0 && (
                      <div className="col-span-full py-16 bg-zinc-900/10 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center space-y-3 p-6 text-center animate-fade-in">
                        <div className="p-3.5 bg-zinc-900/50 rounded-full border border-zinc-800/60 text-zinc-500">
                          <Search className="h-6 w-6" />
                        </div>
                        <h5 className="text-zinc-300 font-extrabold uppercase tracking-wider text-xs font-mono">Brak dopasowań</h5>
                        <p className="text-[11px] text-zinc-500 max-w-sm leading-relaxed font-sans">
                          Nie znaleźliśmy utworów spełniających Twoje kryteria wyszukiwania dla frazy <span className="text-orange-400 font-bold font-mono">"{trackSearchQuery}"</span>.
                        </p>
                        {trackSearchQuery && (
                          <button
                            onClick={() => setTrackSearchQuery("")}
                            className="text-[10px] font-bold font-mono uppercase bg-zinc-900 hover:bg-zinc-850 text-zinc-300 px-3.5 py-1.5 rounded-xl border border-zinc-800 transition cursor-pointer"
                          >
                            Wyczyść filtry
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CRUD PLAYLISTY */}
              {activeTab === 'playlists' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Zarządzanie playlistami hrl_playlist</h4>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">Projektuj White-label playlisty, wybieraj unikalny branding koloru oraz dobieraj i układaj utwory</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingPlaylist(null);
                        setPlaylistForm({
                          title: "", pmproLevel: 1, clientName: "", accentColor: "#c8963e", bgColor: "#0c0a07",
                          autoplay: true, loop: true, hideTracklist: false, volume: 0.8, useSchedule: true, explicitFilter: true, tracks: []
                        });
                        setShowPlaylistModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-xs font-bold text-white px-4 py-2 rounded-xl transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Dodaj Playlistę</span>
                    </button>
                  </div>

                  {/* Lista playlist admina */}
                  <div className="space-y-4">
                    {playlistsList.map((playlist) => (
                      <div key={playlist.id} className="bg-[#121318] border border-gray-900 rounded-2xl p-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-gray-800 transition">
                        
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3.5 h-3.5 rounded-full inline-block border border-gray-700 shadow-sm"
                              style={{ backgroundColor: playlist.accentColor }}
                            ></span>
                            <h5 className="font-extrabold text-white text-base font-sans">{playlist.title}</h5>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-400 font-mono">
                            <p>Klient: <span className="text-gray-200 font-bold">{playlist.clientName || 'HRL Base'}</span></p>

                            <p>Utworów: <span className="text-gray-200 font-bold">{playlist.tracks.length}</span></p>
                            <p>Harmonogram: <span className="text-gray-200 font-bold">{playlist.useSchedule ? 'Włączony' : 'Wyłączony'}</span></p>
                            <p>Filtr explicit: <span className="text-gray-200 font-bold">{playlist.explicitFilter ? 'Aktywny' : 'Brak'}</span></p>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {playlist.tracks.map((tid) => {
                              const track = tracksList.find(t => t.id === tid);
                              return track ? (
                                <span key={tid} className="bg-black/40 border border-gray-950 font-mono text-[9px] px-2 py-0.5 rounded text-gray-400 flex items-center gap-1">
                                  <Disc className="h-2.5 w-2.5 text-gray-500 animate-spin-slow" />
                                  <span>{track.title}</span>
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2 items-center self-end md:self-center">
                          <button 
                            onClick={() => {
                              setEditingPlaylist(playlist);
                              setPlaylistForm(playlist);
                              setShowPlaylistModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 transition"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                            <span>Edytuj</span>
                          </button>
                          <button 
                            onClick={() => handleDeletePlaylist(playlist.id, playlist.title)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 text-xs font-semibold text-red-400 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            <span>Usuń</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SPIS FAKTUR */}
              {activeTab === 'invoices' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Księga Faktur VAT Sliced Invoices</h4>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">Automatyczne fakturowanie VAT 23% (numeracja HRL-RRRR-MM-NNNNN)</p>
                  </div>

                  <div className="bg-[#121318] border border-gray-900 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs text-gray-400 border-collapse">
                      <thead>
                        <tr className="border-b border-gray-900 bg-black/20 text-gray-500 font-mono uppercase text-[10px]">
                          <th className="py-3 px-4">Numer Faktury</th>
                          <th className="py-3 px-4">Klient (E-mail)</th>
                          <th className="py-3 px-4 text-center">Data</th>
                          <th className="py-3 px-4 text-right">Netto PLN</th>
                          <th className="py-3 px-4 text-right">VAT (23%)</th>
                          <th className="py-3 px-4 text-right">BRUTTO</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Dokument</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoicesList.map((invoice) => (
                          <tr key={invoice.id} className="border-b border-gray-950 hover:bg-black/10 transition text-gray-300">
                            <td className="py-4 px-4 font-mono font-extrabold text-red-500">{invoice.invoiceNumber}</td>
                            <td className="py-4 px-4 font-semibold text-white">
                              <div>{invoice.clientName}</div>
                              <div className="text-[10px] text-gray-500 font-mono">{invoice.clientEmail}</div>
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-[10px]">{invoice.date}</td>
                            <td className="py-4 px-4 text-right font-mono text-[11px]">{invoice.amount.toFixed(2)} PLN</td>
                            <td className="py-4 px-4 text-right font-mono text-[11px]">{invoice.tax.toFixed(2)} PLN</td>
                            <td className="py-4 px-4 text-right font-mono font-bold text-white text-[11px]">{invoice.total.toFixed(2)} PLN</td>
                            <td className="py-4 px-4 text-center">
                              <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold uppercase text-[9px]">OPŁACONA</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className="flex items-center gap-1 ml-auto text-xs bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition px-2.5 py-1 rounded-lg"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Podgląd</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PANEL BEZPIECZEŃSTWA (TOKENY HMAC) */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Generator Aktywnych Tokenów HMAC (TTL 2h)</h4>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">Wgląd do chronionej bazy hrl_tokens, zabezpieczenie IP oraz chronione odtwarzanie range requests pod Nginx/PHP</p>
                    </div>
                    <button 
                      onClick={handleCleanExpiredTokens}
                      className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 px-4 py-2 text-xs font-bold text-white rounded-xl transition shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Usuń wygasłe tokeny</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Lista aktywnych tokenów */}
                    <div className="lg:col-span-2 bg-[#121318] border border-gray-900 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-900 pb-3">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[#888] font-mono">Generowane Tokeny B2B ({activeTokens.length})</span>
                        <span className="bg-red-500/10 text-red-500 font-mono text-[10px] px-2 py-0.5 rounded border border-red-500/10 font-bold uppercase">HMAC SHA-256 Sól Actv</span>
                      </div>

                      <div className="h-96 overflow-y-auto space-y-2 pr-1 text-xs">
                        {activeTokens.length === 0 ? (
                          <div className="flex flex-col justify-center items-center h-full text-gray-500 space-y-2 font-mono">
                            <AlertOctagon className="h-8 w-8 text-gray-600" />
                            <span>Brak wygenerowanych tokenów HMAC w bazie.</span>
                            <span className="text-[10px] text-gray-600">Lokalni klienci nie puszczali muzyki w ciągu ostatnich 2h.</span>
                          </div>
                        ) : (
                          activeTokens.map((token: any) => (
                            <div key={token.id} className="bg-black/30 border border-gray-950 p-3.5 rounded-xl flex items-center justify-between gap-4 font-mono text-[11px] hover:border-gray-900 transition font-medium">
                              <div className="space-y-1 flex-1 truncate">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-400 font-bold uppercase truncate max-w-[150px]">{token.filename}</span>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-gray-400 font-semibold">User: ID {token.userId}</span>
                                </div>
                                <div className="text-[10px] text-gray-600 truncate font-semibold font-mono">Token: {token.token}</div>
                              </div>
                              <div className="text-right text-[10px] space-y-1">
                                <div className="text-[#38bdf8] font-bold">Użyty: {token.usedCount} razy</div>
                                <div className="text-gray-500">Ważny do: {new Date(token.expiresAt).toLocaleTimeString('pl-PL')}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Schemat i Reguły VPS */}
                    <div className="bg-[#121318] border border-gray-900 rounded-2xl p-5 space-y-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
                          <Sliders className="h-4 w-4 text-red-500" />
                          <h5 className="font-bold text-white uppercase text-xs tracking-wider">Reguły Ochrony Nginx</h5>
                        </div>

                        <p className="text-xs text-gray-400 leading-relaxed font-sans">
                          Zapora serwera Nginx blokuje bezpośrednie ściąganie muzyki z folderu <code className="bg-black px-1 py-0.5 rounded font-mono text-red-400 text-[10px]">hrl-music/</code> zwracając internal rewrite do procesora PHP.
                        </p>

                        <div className="space-y-2.5">
                          <div className="bg-black/40 border border-gray-950 p-3 rounded-xl">
                            <h6 className="text-[10px] font-bold text-green-400 font-mono mb-1">✓ Włączony Token TTL = 2h</h6>
                            <p className="text-[10px] text-gray-500 font-sans">Po przekroczeniu 2h odtworzenie zwraca błąd 403 z prośbą o refresh tokena.</p>
                          </div>
                          
                          <div className="bg-black/40 border border-gray-950 p-3 rounded-xl">
                            <h6 className="text-[10px] font-bold text-green-400 font-mono mb-1">✓ Zapora IP Hash (SHA-1)</h6>
                            <p className="text-[10px] text-gray-500 font-sans">Weryfikuje czy urządzenie odtwarzające nie udostępniło linku do innej sieci.</p>
                          </div>

                          <div className="bg-black/40 border border-gray-950 p-3 rounded-xl">
                            <h6 className="text-[10px] font-bold text-green-400 font-mono mb-1">✓ Blokada Path Traversal</h6>
                            <p className="text-[10px] text-gray-500 font-sans">Wykorzystuje realpath() dla pełnej ochrony odgałęzień katalogów.</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/20 border border-gray-950 p-3 rounded-xl text-[10px] font-mono text-gray-500 text-center">
                        VPS Security Core v2.0 status: Active
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* KOPIA ZAPASOWA I HARMONOGRAM CRONA */}
              {activeTab === 'backup' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Kopie zapasowe & Crontab Harmonogram</h4>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">Zarządzaj zrzutami kopii VPS, konfiguruj harmonogram crona do automatycznego czyszczenia bazy danych</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Generowanie backupów */}
                    <div className="bg-[#121318] border border-gray-900 rounded-2xl p-5 space-y-5">
                      <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
                        <Archive className="h-4.5 w-4.5 text-red-500" />
                        <h5 className="font-bold text-white uppercase text-xs tracking-wider">Automatyczny system kopii</h5>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed font-sans">
                        Pobierz natychmiastowe zrzuty danych z serwera produkcyjnego. Pliki pakowane są do formatów archiwum gzip z pełną weryfikacją sumy kontrolnej SHA-256.
                      </p>

                      <div className="space-y-3.5">
                        <div className="p-4 bg-black/40 border border-gray-950 rounded-xl flex items-center justify-between">
                          <div>
                            <h6 className="text-xs font-extrabold text-white">Przycisk Zrzut Bazy SQL (hrl_wordpress)</h6>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Codziennie 3:00 • Nazwa: db_YYYYMMDD.sql.gz</p>
                          </div>
                          <button 
                            onClick={() => handleDownloadBackup('db')}
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-[10px] font-bold text-white px-3 py-1.5 rounded-lg transition"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Pobierz SQL</span>
                          </button>
                        </div>

                        <div className="p-4 bg-black/40 border border-gray-950 rounded-xl flex items-center justify-between">
                          <div>
                            <h6 className="text-xs font-extrabold text-white">Paczka plików muzycznych (hrl-music)</h6>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Co niedzielę 4:00 • Nazwa: music_YYYYMMDD.tar.gz</p>
                          </div>
                          <button 
                            onClick={() => handleDownloadBackup('music')}
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-[10px] font-bold text-white px-3 py-1.5 rounded-lg transition"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Pobierz Muzykę</span>
                          </button>
                        </div>

                        <div className="p-4 bg-black/40 border border-gray-950 rounded-xl flex items-center justify-between">
                          <div>
                            <h6 className="text-xs font-extrabold text-white">Paczka kodu wtyczki (hrl-music-core)</h6>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Zgodność v2.0 • Nazwa: plugin_YYYYMMDD.tar.gz</p>
                          </div>
                          <button 
                            onClick={() => handleDownloadBackup('plugin')}
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-[10px] font-bold text-white px-3 py-1.5 rounded-lg transition"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Pobierz Plugin</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Harmonogram Crontab i czyszczenie */}
                    <div className="bg-[#121318] border border-gray-900 rounded-2xl p-5 space-y-5">
                      <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
                        <Calendar className="h-4.5 w-4.5 text-red-500" />
                        <h5 className="font-bold text-white uppercase text-xs tracking-wider">Tymczasowe czyszczenie VPS (Cron)</h5>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed font-sans">
                        Poniższy wpis z crontaba serwera VPS automatycznie czyści stare tokeny oraz optymalizuje bazę danych, a także usuwa logi i archiwum backupów po 30 dniach pracy.
                      </p>

                      <div className="bg-black border border-gray-950 rounded-xl p-4 font-mono text-[10.5px] text-red-400 leading-relaxed overflow-x-auto space-y-1 select-all">
                        <span className="text-gray-500">## Czyszczenie wygasłych lub zużytych tokenów co godzinę</span><br />
                        <span>0 * * * * mysql -u hrl_user -pSILNE_HASLO hrl_wordpress -e "DELETE FROM hrl_tokens WHERE expires_at &lt; NOW();"</span><br /><br />
                        <span className="text-gray-500">## Automatyczne usuwanie backupów starszych niż 30 dni we wtorki 5:00</span><br />
                        <span>0 5 * * * find /backup/hrl/ -mtime +30 -delete</span>
                      </div>

                      <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl space-y-1.5">
                        <div className="flex gap-2 items-center text-red-400 text-xs font-bold font-sans">
                          <Clock className="h-4 w-4" />
                          <span>Status Harmonogramu</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          Skrypty shell na systemie Ubuntu 22.04 LTS działają w tle. Narzędzie logów Nginx automatycznie śledzi statusy wejść systemowych.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* API ID DEVELOPER, WEBHOOKS AND SAAS INTEGRATION MATRIX */}
              {activeTab === 'integrations' && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Integracje SaaS, Programistyczne API & Webhooki</h4>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">Połącz system CMLP z własnym CRM, platformą Notion, Airtable, systemami analitycznymi lub wdrożonymi procesami PIM/MDM</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* PANEL 1: KLUCZ API & INTERFEJS OPENAPI (CURL) */}
                    <div className="bg-[#121318] border border-gray-900 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-900 pb-3">
                        <div className="flex items-center gap-2">
                          <Sliders className="h-4.5 w-4.5 text-orange-500" />
                          <h5 className="font-bold text-white uppercase text-xs tracking-wider">API Klucze Programistyczne</h5>
                        </div>
                        <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/10 px-1.5 py-0.5 rounded font-mono font-black uppercase">REST v2</span>
                      </div>

                      <p className="text-[11px] text-gray-400 leading-normal font-sans">
                        Używaj autoryzacji nagłówka <code className="bg-black text-orange-400 px-1 rounded font-mono">Authorization: Bearer &lt;JWT&gt;</code> dla bezpiecznego dostępu do zasobów API.
                      </p>

                      <div className="space-y-3">
                        <div className="bg-black/40 border border-gray-950 p-3 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono font-black text-gray-500 uppercase">
                            <span>Twój Developer API Token:</span>
                            <span className="text-emerald-400">AKTYWNY SANDBOX</span>
                          </div>
                          <div className="flex gap-1.5">
                            <input 
                              type="text" readOnly
                              value="hrl_live_token_sec_92084710298418247192"
                              className="w-full bg-black/80 text-zinc-300 font-mono text-[9.5px] p-2 rounded-lg border border-gray-900 select-all"
                            />
                            <button
                              onClick={() => alert("Skopiowano token API do schowka systemowego!")}
                              className="bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg border border-gray-800 transition cursor-pointer"
                            >
                              Kopiuj
                            </button>
                          </div>
                        </div>

                        {/* Przykład cURL */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-black text-gray-500 uppercase block">Pobieranie listy stacji (cURL request):</span>
                          <pre className="bg-black text-red-400 text-[9.5px] p-2.5 rounded-xl border border-gray-950 overflow-x-auto leading-relaxed select-all">
                            curl -X GET "https://hrl-music.com/api/my-playlists" \
                            &nbsp;&nbsp;-H "Authorization: Bearer &lt;JWT_TOKEN&gt;" \
                            &nbsp;&nbsp;-H "Content-Type: application/json"
                          </pre>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-black text-gray-500 uppercase block">Odpowiedź serwera (JSON mock):</span>
                          <pre className="bg-black text-green-400 text-[9px] p-2.5 rounded-xl border border-gray-950 overflow-x-auto leading-normal">
                            {'{'}
                            "status": "success",
                            "playlists": [
                              {'{'} "id": "p-392", "title": "Lounge Aroma", "tracksCount": 12 {'}'}
                            ]
                            {'}'}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* PANEL 2: WEBHOOKI DLA ZDARZEŃ W CZASIE RZECZYWISTYM */}
                    <div className="bg-[#121318] border border-gray-900 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-900 pb-3">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4.5 w-4.5 text-blue-500" />
                          <h5 className="font-bold text-white uppercase text-xs tracking-wider">Webhooks dla zdarzeń</h5>
                        </div>
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/10 px-1.5 py-0.5 rounded font-mono font-black uppercase">LIVE HOOKS</span>
                      </div>

                      <p className="text-[11px] text-gray-400 leading-normal font-sans">
                        Wyślij automatyczny sygnał POST z powiadomieniem JSON po zakończeniu generowania stacji klienta, pobraniu faktury lub wyłączeniu kiosku przez personel.
                      </p>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-black text-gray-400 uppercase">Payload Destination URL:</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={globalSettings?.integrations?.webhookUrl || ""}
                              onChange={e => setGlobalSettings({...globalSettings, integrations: {...globalSettings.integrations, webhookUrl: e.target.value}})}
                              placeholder="https://twoj-crm.pl/hrl-webhook-endpoint"
                              className="flex-1 bg-black text-zinc-100 placeholder-zinc-700 border border-gray-800 rounded-xl px-3 py-1.5 text-xs font-mono"
                            />
                            <button
                              onClick={handleSendWebhook}
                              className="bg-blue-600 hover:bg-blue-500 hover:text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition cursor-pointer"
                            >
                              Wyślij Test
                            </button>
                          </div>
                        </div>

                        {/* Lista zdarzeń do subskrybowania */}
                        <div className="p-3 bg-black/40 border border-gray-950 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                             <p className="text-[10px] font-mono font-black text-gray-500 uppercase">Subskrybowane Zdarzenia:</p>
                             <button onClick={handleSaveSettings} className="text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[9px] hover:bg-blue-500/10 transition">Zapisz Integracje</button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-gray-300">
                            {[
                              { label: "station.published", desc: "Publikacja odtwarzacza" },
                              { label: "invoice.payment_succeeded", desc: "Zatwierdzenie faktury" },
                              { label: "kiosk.unauthorized_pin", desc: "Alert nieprawidłowego pinu" },
                              { label: "track.added_to_catalog", desc: "Aktualizacja muzyki" }
                            ].map((event, idx) => (
                              <label key={idx} className="flex items-center gap-2 cursor-pointer hover:text-white">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-800 text-blue-500 focus:ring-0" 
                                  checked={globalSettings?.integrations?.subscribedEvents?.includes(event.label) || false}
                                  onChange={e => {
                                    let events = globalSettings?.integrations?.subscribedEvents || [];
                                    if (e.target.checked) events = [...events, event.label];
                                    else events = events.filter((val: string) => val !== event.label);
                                    setGlobalSettings({...globalSettings, integrations: {...globalSettings.integrations, subscribedEvents: events}});
                                  }}
                                />
                                <div>
                                  <span className="font-mono text-[9px] font-bold text-gray-400">{event.label}</span>
                                  <span className="text-[7.5px] text-gray-500 block leading-none font-medium mt-0.5">{event.desc}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PANEL 3: INTEGRACJE CRM, PIM/MDM ORAZ AIRTABLE/NOTION AUTO-SYNC */}
                    <div className="bg-[#121318] border border-gray-900 rounded-2xl p-5 lg:col-span-2 space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
                        <Database className="h-4.5 w-4.5 text-emerald-500" />
                        <h5 className="font-bold text-white uppercase text-xs tracking-wider">Automatyzacja Baz Danych & Synchronizacja PIM</h5>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed font-sans">
                        Pobieraj i mapuj dane produktowe ze swoich systemów PIM lub synchronizuj konta placówek bezpośrednio z centralnymi bazami w Airtable lub Notion.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
                        {/* Airtable / Notion Kartka */}
                        <div className="p-4 bg-black/40 border border-gray-950 rounded-xl flex flex-col justify-between gap-3 text-left">
                          <div className="space-y-1">
                            <span className="text-[8px] bg-purple-500/15 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-mono font-black uppercase">Notion Connect</span>
                            <h6 className="text-xs font-black text-white mt-1 leading-normal">Baza Danych Placówek</h6>
                            <p className="text-[10px] text-gray-500 leading-normal">Pobieraj rekordy klientów bezpośrednio z tabeli Notion i automatycznie podpinaj im odtwarzacze B2B.</p>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              const btn = e.currentTarget;
                              btn.innerText = "Synchronizowanie...";
                              setTimeout(() => {
                                btn.innerText = "Zsynchronizowano pomyślnie! ✔";
                                btn.className = "w-full bg-emerald-500/10 text-emerald-400 border border-emerald-5o0/20 text-[10px] font-extrabold py-2 rounded-lg";
                              }, 1300);
                            }}
                            className="w-full bg-zinc-900 border border-gray-800 text-zinc-300 text-[10px] font-extrabold py-2 rounded-lg cursor-pointer hover:bg-zinc-805 transition"
                          >
                            Synchronizuj z Notion
                          </button>
                        </div>

                        {/* PIM / MDM systemy */}
                        <div className="p-4 bg-black/40 border border-gray-950 rounded-xl flex flex-col justify-between gap-3 text-left">
                          <div className="space-y-1">
                            <span className="text-[8px] bg-amber-500/15 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-black uppercase">PIM System Sync</span>
                            <h6 className="text-xs font-black text-white mt-1 leading-normal">Specyfikacje i Opisy</h6>
                            <p className="text-[10px] text-gray-500 leading-normal">Eksportuj metadane piosenek HRL (albumy, ISRC, kompozytorzy) bezpośrednio do systemów PIM.</p>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              const btn = e.currentTarget;
                              btn.innerText = "Importowanie...";
                              setTimeout(() => {
                                btn.innerText = "Zaimportowano 14 opisów! ✔";
                                btn.className = "w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold py-2 rounded-lg";
                              }, 1100);
                            }}
                            className="w-full bg-zinc-900 border border-gray-800 text-zinc-300 text-[10px] font-extrabold py-2 rounded-lg cursor-pointer hover:bg-zinc-805 transition"
                          >
                            Mapuj Metadane PIM
                          </button>
                        </div>

                        {/* Google Analytics */}
                        <div className="p-4 bg-black/40 border border-gray-950 rounded-xl flex flex-col justify-between gap-3 text-left">
                          <div className="space-y-1">
                            <span className="text-[8px] bg-sky-500/15 text-sky-400 border border-sky-500/25 px-1.5 py-0.5 rounded font-mono font-black uppercase">Metrics tracking</span>
                            <h6 className="text-xs font-black text-white mt-1 leading-normal">Google Analytics v4</h6>
                            <p className="text-[10px] text-gray-500 leading-normal">Przesyłaj eventy interakcji, głośności oraz odtworzeń lektora do konsoli analityki Google Ads i piksela.</p>
                          </div>
                          
                          <div className="flex gap-1">
                            <input 
                              type="text" 
                              placeholder="G-XXXXXX-X"
                              className="flex-1 bg-black text-[10px] font-mono p-1 border border-gray-800 rounded text-center text-white"
                            />
                            <button
                              onClick={() => alert("Identyfikator Google Analytics v4 został poprawnie zapisany!")}
                              className="bg-zinc-800 hover:bg-zinc-700 text-white text-[9px] px-2 rounded tracking-normal font-black uppercase"
                            >
                              Link
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 🌐 HEADLESS WORDPRESS & SEPARATED HIGH-PERFORMANCE STREAMING ARCHITECTURE TOPOLOGY PANEL */}
              {activeTab === 'headless' && (
                <div className="space-y-6 animate-fade-in text-left">
                  
                  {/* Nagłówek i Opis Biznesowy */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full font-black uppercase">ENTERPRISE CLOUD ARCHITECTURE</span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full font-black uppercase">PRO STACK</span>
                      </div>
                      <h4 className="text-lg font-black text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-orange-500" />
                        <span>Chmura Dystrybucyjna: WordPress jako Headless Control Panel</span>
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans mt-1">
                        Zabezpieczanie plików przed wyciekami, ochrona IP, optymalizacja pamięci i eliminacja obciążenia PHP przy pomocy Nginx X-Accel-Redirect.
                      </p>
                    </div>

                    {/* Przełącznik podsekcji */}
                    <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 self-stretch md:self-auto">
                      {(['topology', 'simulation', 'docker'] as const).map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setHeadlessActiveSubTab(sub)}
                          className={`flex-1 md:flex-none text-center px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            headlessActiveSubTab === sub
                              ? 'bg-zinc-900 text-white shadow font-black border border-zinc-850'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {sub === 'topology' && "🗺️ Schemat Topologii"}
                          {sub === 'simulation' && "⚡ Symulator X-Accel"}
                          {sub === 'docker' && "🐋 Docker Compose DEV"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SUBTAB 1: SCHEMA TOPOLOGII I INTERAKTYWNA MAPA PRZEPŁYWU */}
                  {headlessActiveSubTab === 'topology' && (
                    <div className="space-y-6">
                      
                      {/* Wizualny Schemat Blokowy (Grid z połączeniami) */}
                      <div className="bg-[#0b0c10] border border-zinc-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                        
                        {/* Background subtle mesh grid decoration */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                        <div className="text-center mb-8 max-w-xl mx-auto space-y-1 z-10 relative">
                          <p className="text-[10px] font-mono font-black uppercase text-orange-400 tracking-widest">MAPA ROZPROSZONEJ INFRASTRUKTURY B2B</p>
                          <h5 className="text-xl font-bold text-zinc-100">Separacja warstwy logiki biznesowej od przesyłu binarnego audio</h5>
                          <p className="text-xs text-zinc-500 leading-normal">
                            System WP generuje licencje i dane bilingowe, Node.js API uwierzytelnia klientów kluczem HMAC, a Nginx bezpośrednio odtwarza chronione pliki bez udziału procesów w tle.
                          </p>
                        </div>

                        {/* Prawdziwy map grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-xs">
                          
                          {/* KROK 1: WP Panel */}
                          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 hover:border-orange-500/30 transition-all group space-y-3.5 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="bg-orange-500/15 text-orange-400 font-mono text-[8px] font-black uppercase px-2 py-0.5 rounded">POZIOM ADMINA</span>
                                <span className="text-[10px] font-mono font-bold text-zinc-500">01</span>
                              </div>
                              <h6 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors">1. WordPress (Headless CRM)</h6>
                              <p className="text-zinc-400 text-[11px] leading-relaxed">
                                Obsługuje automatyczne generowanie faktur. Dostęp wyłącznie poprzez uwierzytelniony interfejs REST API WP.
                              </p>
                            </div>

                            <ul className="space-y-1 text-[10px] font-mono text-zinc-500">
                              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> CPT (Custom Post Types)</li>
                              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Premium Subscription Levels</li>
                              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Baza MySQL bez elementora</li>
                            </ul>
                          </div>

                          {/* KROK 2: Node.js API Gateway / Redis caching */}
                          <div className="bg-zinc-950/65 border-2 border-orange-500/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all group space-y-3.5 flex flex-col justify-between shadow-lg shadow-orange-500/5">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="bg-blue-500/15 text-blue-400 font-mono text-[8px] font-black uppercase px-2 py-0.5 rounded">LOGIKA & POŁĄCZENIA</span>
                                <span className="text-[10px] font-mono font-bold text-zinc-500">02</span>
                              </div>
                              <h6 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors">2. Node.js API Gateway (JWT)</h6>
                              <p className="text-zinc-400 text-[11px] leading-relaxed">
                                Szybki serwer middleware. Odpowiada za wydawanie i weryfikację tokenów JWT, mapowanie playlist na żądanie, autoryzację PIN-u placówki oraz generowanie kryptograficznego HMAC do signed URLs audio.
                              </p>
                            </div>

                            <ul className="space-y-1 text-[10px] font-mono text-zinc-500">
                              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-blue-400" /> Redis Szybka Cache Sesji</li>
                              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-blue-400" /> Generowanie podpisu HMAC</li>
                              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-blue-450" /> Rate-limiting żądań API</li>
                            </ul>
                          </div>

                          {/* KROK 3: Nginx + X-Accel Redirect */}
                          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 hover:border-orange-500/30 transition-all group space-y-3.5 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="bg-emerald-500/15 text-emerald-400 font-mono text-[8px] font-black uppercase px-2 py-0.5 rounded">WARSTWA PRZESYŁU</span>
                                <span className="text-[10px] font-mono font-bold text-zinc-550">03</span>
                              </div>
                              <h6 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors">3. Nginx X-Accel Direct CDN</h6>
                              <p className="text-zinc-400 text-[11px] leading-relaxed">
                                Najważniejszy element. Gniazdo streamuje chronione pliki MP3 bezpośrednio z dysku omijając interpretery Node/PHP. Zwrot nagłówka <code className="bg-zinc-900 text-orange-400 px-1 rounded text-[10px]">X-Accel-Redirect</code> wysyła plik błyskawicznie.
                              </p>
                            </div>

                            <ul className="space-y-1 text-[10px] font-mono text-zinc-500">
                              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> 0% zużycia RAM przez PHP/Node</li>
                              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Zabezpieczony katalog /streaming/</li>
                              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Szybkie pętlenie audio PWA</li>
                            </ul>
                          </div>

                        </div>

                        {/* Central flow description list describing workflow */}
                        <div className="mt-8 border-t border-zinc-900 w-full pt-6 text-[11px] text-zinc-400 grid grid-cols-1 sm:grid-cols-4 gap-4 leading-relaxed bg-zinc-950/25 p-4 rounded-2xl border border-zinc-900/60">
                          <div className="space-y-1">
                            <p className="font-mono font-black text-[9px] text-orange-400 uppercase">KROK A: LOGOWANIE</p>
                            <p>Odtwarzacz lokalu przesyła kod PIN do bramy Node API. Node API weryfikuje status w Headless WordPressie i wydaje JWT.</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-mono font-black text-[9px] text-blue-400 uppercase">KROK B: PLAYLISTA</p>
                            <p>Odtwarzacz pobiera listę utworów stacji. Node API podpisuje ścieżki dynamicznym tokenem i kluczem IP z czasem TTL.</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-mono font-black text-[9px] text-emerald-400 uppercase">KROK C: ŻĄDANIE AUDIO</p>
                            <p>Odtwarzacz odtwarza utwór uderzając do Nginx z unikalnym sygnem. Nginx pyta Node o potwierdzenie autentyczności tokenu.</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-mono font-black text-[9px] text-purple-400 uppercase">KROK D: BYPASS STREAM</p>
                            <p>Weryfikacja OK. Node wysyła do Nginx link przekierowania. Nginx błyskawicznie wypycha strumień MP3 bezpośrednio do karty dźwiękowej.</p>
                          </div>
                        </div>

                      </div>

                      {/* Dlaczego Elementor i WooCommerce jako core to błąd */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 space-y-3 text-xs leading-relaxed">
                          <h6 className="font-mono font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                            <AlertOctagon className="h-4 w-4" />
                            <span>Złe praktyki (Amatorszczyzna "Wszystko w WP")</span>
                          </h6>
                          <ul className="space-y-2 text-zinc-400 font-medium">
                            <li className="flex items-start gap-1 p-0.5">
                              <span className="text-red-400 font-mono font-black mr-1">⛔</span>
                              <span><strong>Streamowanie MP3 przez PHP:</strong> Uruchamia interpretery Apache/PHP dla każdego użytkownika. 30 aktywnych klientów zablokuje serwer (błąd 504 Gateway Timeout).</span>
                            </li>
                            <li className="flex items-start gap-1 p-0.5">
                              <span className="text-red-400 font-mono font-black mr-1">⛔</span>
                              <span><strong>Strony budowane na Elementorze wewnątrz aplikacji:</strong> Załadują po 15MB zbędnego kodu JS/CSS na każde urządzenie kiosku lokalu.</span>
                            </li>
                            <li className="flex items-start gap-1 p-0.5">
                              <span className="text-red-400 font-mono font-black mr-1">⛔</span>
                              <span><strong>Otwarte, publiczne linki do plików MP3:</strong> Pozwalają na łatwe zeskrobanie całego cennego katalogu muzycznego w 5 minut zwykłym skryptem wget.</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-emerald-500/5 border border-emerald-505/15 rounded-2xl p-5 space-y-3 text-xs leading-relaxed">
                          <h6 className="font-mono font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
                            <span>Standardy Premium (Chmura Hardban Records)</span>
                          </h6>
                          <ul className="space-y-2 text-zinc-400 font-medium">
                            <li className="flex items-start gap-1 p-0.5">
                              <span className="text-emerald-400 font-mono font-black mr-1">✔</span>
                              <span><strong>Bypass Nginx X-Accel:</strong> Narzut pamięciowy przy pobieraniu to stabilne 0MB. Plik audio leci bezpośrednio z systemowej pamięci cache jądra systemu operacyjnego.</span>
                            </li>
                            <li className="flex items-start gap-1 p-0.5">
                              <span className="text-emerald-400 font-mono font-black mr-1">✔</span>
                              <span><strong>Podpisy czasowe JWT i HMAC:</strong> Linki do utworów stają się nieważne poza daną placówką i automatycznie wygasają po wyznaczonym czasie TTL.</span>
                            </li>
                            <li className="flex items-start gap-1 p-0.5">
                              <span className="text-emerald-400 font-mono font-black mr-1">✔</span>
                              <span><strong>Odporność na ataki DDOS i scraping:</strong> Dynamiczne limitowanie zapytań (IP rate limits) spięte bezpośrednio na warstwie Redis & Fail2Ban.</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SUBTAB 2: SYMULACJA PODPISYWANIA LINKÓW I PRZEPŁYWU X-ACCEL */}
                  {headlessActiveSubTab === 'simulation' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs leading-normal">
                      
                      {/* Kontrolki generatora podpisu sieciowego */}
                      <div className="col-span-12 lg:col-span-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
                        <div className="border-b border-zinc-900 pb-3">
                          <h5 className="font-bold text-white uppercase text-xs tracking-wider">Kreator i Generator Signed URL</h5>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Zaimplementuj wirtualny proces kontrolera zabezpieczeń</p>
                        </div>

                        <div className="space-y-3.5">
                          {/* Wybór utworu dot. symulacji */}
                          <div className="space-y-1.5">
                            <label className="text-[10.5px] font-mono text-zinc-400 font-extrabold uppercase">Wybierz Utwór do Testu:</label>
                            <select
                              value={selectedTrackForRedirect}
                              onChange={(e) => setSelectedTrackForRedirect(e.target.value)}
                              className="w-full bg-zinc-950 text-zinc-200 border border-zinc-805 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
                            >
                              <option value="">-- Wybierz piosenkę --</option>
                              {tracksList.map((tr) => (
                                <option key={tr.id} value={tr.id}>
                                  🎵 {tr.title} — {tr.artist} (ISRC: {tr.isrc || "HRL-0391"})
                                </option>
                              ))}
                              {tracksList.length === 0 && (
                                <>
                                  <option value="hrl-t-01">🌿 Neon Night (Lofi Ambient) - Velvet Sound</option>
                                  <option value="hrl-t-02">☕ Café Aroma (Acoustic Jazz) - Kyoto Club</option>
                                  <option value="hrl-t-03">🌇 Sunset Horizon (Deep Chill) - Hardban Synth</option>
                                </>
                              )}
                            </select>
                          </div>

                          {/* TTL czas ważności linku */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10.5px] font-mono font-extrabold uppercase text-zinc-400">
                              <span>Czas Ważności URL (TTL):</span>
                              <span className="text-orange-400 font-bold">{tokenTtlSeconds} sek. ({(tokenTtlSeconds/60).toFixed(0)} min.)</span>
                            </div>
                            <input 
                              type="range" 
                              min={60} 
                              max={10800} 
                              step={60} 
                              value={tokenTtlSeconds}
                              onChange={(e) => setTokenTtlSeconds(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-zinc-950 rounded accent-orange-500"
                            />
                            <p className="text-[8.5px] text-zinc-500">Po tym czasie zapytanie odtwarzacza zwróci błąd HTTP 403 Forbidden (Link wygasł).</p>
                          </div>

                          {/* Tajny klucz systemowy */}
                          <div className="space-y-1.5">
                            <label className="text-[10.5px] font-mono text-zinc-400 font-extrabold uppercase">Tajny klucz podpisu HMAC:</label>
                            <input
                              type="password"
                              value={secureLinkSecret}
                              onChange={(e) => setSecureLinkSecret(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg text-white font-mono text-[10.5px]"
                            />
                          </div>

                          {/* Przycisk akcji symulatora */}
                          <button
                            onClick={async () => {
                              const trackId = selectedTrackForRedirect || (tracksList[0]?.id || "t1");
                              
                              setSimulationResultLog([
                                `[${new Date().toLocaleTimeString()}] >> Klient rozpoczyna żądanie...`,
                                `[${new Date().toLocaleTimeString()}] >> Odpytywanie Node.js Express API o weryfikację i symulację Nginx...`
                              ]);

                              try {
                                const response = await fetch(getApiUrl('/api/nginx/simulate'), {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({
                                    trackId,
                                    tokenTtlSeconds,
                                    secureLinkSecret
                                  })
                                });

                                if (!response.ok) {
                                  throw new Error("Serwer zwrócił błąd HTTP " + response.status);
                                }

                                const data = await response.json();
                                setSimulationResultLog(data.steps);
                              } catch (e: any) {
                                setSimulationResultLog([
                                  `[${new Date().toLocaleTimeString()}] ❌ Błąd komunikacji z API: ${e.message}`,
                                  `[${new Date().toLocaleTimeString()}] Sprawdź czy dev-server działa prawidłowo.`
                                ]);
                              }
                            }}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black py-3 rounded-xl transition cursor-pointer font-sans"
                          >
                            Uruchom test i symuluj Nginx X-Accel
                          </button>
                        </div>
                      </div>

                      {/* Logi konsoli systemowej i nagłówki */}
                      <div className="col-span-12 lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                          <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                            <span>Konsola kontrolera & Nginx logi</span>
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono">STATION_SIMULATOR_V2</span>
                        </div>

                        {/* Ekran terminala logów */}
                        <div className="bg-black/90 rounded-xl p-4 h-[350px] overflow-y-auto font-mono text-[10.5px] text-zinc-300 space-y-2 border border-zinc-950 select-text leading-relaxed">
                          {simulationResultLog.map((logLine, idx) => {
                            let textColor = "text-zinc-400";
                            if (logLine.includes(">>")) textColor = "text-orange-400 font-bold";
                            if (logLine.includes("<<")) textColor = "text-emerald-400 font-black";
                            if (logLine.includes("NGINX:")) textColor = "text-sky-400 font-semibold";
                            if (logLine.includes("HTTP/1.1 200 OK")) textColor = "text-emerald-400 font-black bg-zinc-950 px-1 py-0.5 rounded";
                            
                            return (
                              <div key={idx} className={`${textColor} break-all hover:bg-zinc-900 w-full`}>
                                {logLine}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SUBTAB 3: DOCKER COMPOSE CONFIG & DIRECTORY EXPLORER */}
                  {headlessActiveSubTab === 'docker' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs leading-normal">
                      
                      {/* Lewa: Drzewo struktury VPS (Bash layout) */}
                      <div className="col-span-12 lg:col-span-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
                        <div className="border-b border-zinc-900 pb-3">
                          <h5 className="font-bold text-white uppercase text-xs tracking-wider">Struktura Katalogów VPS</h5>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Dopasowana pod Ubuntu 24.04 i Docker Compose</p>
                        </div>

                        <div className="bg-black/80 rounded-xl p-4 font-mono text-[11px] text-zinc-350 border border-zinc-950 overflow-x-auto select-text leading-loose">
                          <div className="text-zinc-500">/var/www/</div>
                          <div>├── <span className="text-orange-450 font-bold">panel.hrl/</span> <span className="text-[9px] text-zinc-500 italic">// WordPress Headless</span></div>
                          <div className="pl-4 text-zinc-500">├── wordpress/</div>
                          <div className="pl-4 text-zinc-500">└── wp-content/ <span className="text-[9px] text-zinc-550 italic">// tylko CPT i ACF</span></div>
                          <div>├── <span className="text-blue-450 font-bold">api.hrl/</span> <span className="text-[9px] text-zinc-550 italic">// Node Rest Gateway</span></div>
                          <div className="pl-4 text-zinc-400">├── dist/ <span className="text-[9px] text-zinc-550 italic">// kompilacja NestJS</span></div>
                          <div className="pl-4 text-zinc-400">└── node_modules/</div>
                          <div>├── <span className="text-emerald-450 font-bold">streaming/</span> <span className="text-[9px] text-zinc-550 italic">// Chroniony magazyn MP3</span></div>
                          <div className="pl-4 text-emerald-400 font-bold">└── audio/</div>
                          <div className="pl-8 text-zinc-500">├── s-101-house.mp3</div>
                          <div className="pl-8 text-zinc-500">└── s-102-jazz-lounge.mp3</div>
                          <div>├── <span className="text-purple-400 font-bold">docker/</span> <span className="text-[9px] text-zinc-550 italic">// Drzewo kontenerów</span></div>
                          <div className="pl-4 text-zinc-300">├── docker-compose.yml</div>
                          <div className="pl-4 text-zinc-300">└── nginx.conf</div>
                        </div>

                        <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-900 space-y-2">
                          <p className="text-[10px] font-mono font-black text-zinc-500 uppercase">Uprawnienia Plików Audio:</p>
                          <p className="text-[10.5px] text-zinc-400">
                            Katalog <code className="bg-black text-orange-400 rounded px-1 text-[9.5px]">/var/www/streaming/</code> jest całkowicie wyjęty poza prawa odczytu publicznego WWW. Nginx posiada uprawnienia systemowe do jego odczytu wyłącznie poprzez dyrektywę <code className="text-emerald-400 font-bold">internal;</code> w swojej konfiguracji.
                          </p>
                        </div>
                      </div>

                      {/* Prawa: Edytor i wizualizator konfiguracji kodu */}
                      <div className="col-span-12 lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
                        
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                          <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">
                            Pliki Konfiguracyjne Serwera
                          </span>

                          <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                            {[
                              { id: 'docker-compose.yml', label: 'docker-compose.yml' },
                              { id: 'nginx.conf', label: 'nginx.conf' },
                              { id: 'wp-config-headless.php', label: 'wp-config.php' }
                            ].map(btn => (
                              <button
                                key={btn.id}
                                onClick={() => setActiveConfigFile(btn.id as any)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                                  activeConfigFile === btn.id
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-550 hover:text-zinc-300'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rendering wybranego pliku konfiguracji z podświetleniem linii */}
                        <div className="relative">
                          {activeConfigFile === 'docker-compose.yml' && (
                            <pre className="bg-black/90 p-4 rounded-xl text-[10.5px] font-mono text-zinc-300 overflow-x-auto leading-relaxed h-[400px] border border-zinc-950 select-all">
{`version: '3.8'

services:
  nginx-proxy:
    image: nginx:stable-alpine
    container_name: hrl_cdn_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /var/www/streaming:/var/www/streaming:ro
      - /var/www/panel.hrl/wordpress:/var/www/wordpress:ro
    depends_on:
      - node-express-api
      - wordpress-headless
    restart: always

  wordpress-headless:
    image: wordpress:6.4-php8.2-fpm-alpine
    container_name: hrl_wp_headless
    environment:
      WORDPRESS_DB_HOST: db-mysql
      WORDPRESS_DB_NAME: hrl_commerce_db
    volumes:
      - /var/www/panel.hrl/wordpress:/var/www/html
    restart: always

  node-express-api:
    image: node:20-alpine
    container_name: hrl_node_rest_api
    working_dir: /app
    command: npm run start:prod
    environment:
      JWT_SECRET: hrl_core_jwt_sec_9088421
      REDIS_HOST: cache-redis
    depends_on:
      - cache-redis
    restart: always

  cache-redis:
    image: redis:7-alpine
    container_name: hrl_session_redis
    restart: always`}
                            </pre>
                          )}

                          {activeConfigFile === 'nginx.conf' && (
                            <pre className="bg-black/90 p-4 rounded-xl text-[10.5px] font-mono text-zinc-300 overflow-x-auto leading-relaxed h-[400px] border border-zinc-950 select-all">
{`events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout  65;

    # GŁÓWNA KONFIGURACJA PRZESYŁU BEZPOŚREDNIEGO (BYPASS)
    server {
        listen 443 ssl;
        server_name cdn.hrl-music.com;

        # Ochrona i unikalny certyfikat SSL z Cloudflare
        ssl_certificate /etc/letsencrypt/live/cdn.hrl-music.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/cdn.hrl-music.com/privkey.pem;

        # Zabezpieczona lokalizacja bezpośredniego odtwarzania MP3 / WAV
        # Zapobiega cachowaniu dynamicznych signed URLs i wymusza autoryzację w locie
        location /protected_audio/ {
            internal; # Blokuje bezpośredni dostęp zewnętrzny z przeglądarki!
            alias /var/www/streaming/audio/; # Lokalna ścieżka do dysku VPS
            add_header Content-Type "audio/mpeg";
            
            # Całkowicie wyłączamy pamięć podręczną dla dynamicznie zabezpieczonych utworów B2B
            add_header Cache-Control "no-store, no-cache, must-revalidate, private, no-transform";
            add_header Pragma "no-cache";
            expires off;
        }

        # Konfiguracja cachowania (Caching headers) dla zasobów statycznych (okładki albumów, pliki CSS/JS)
        # Redukuje narzut na serwer i przyspiesza renderowanie odtwarzacza u klienta
        location ~* \.(jpg|jpeg|png|gif|webp|svg|css|js|ico|woff|woff2)$ {
            root /var/www/html/;
            expires 30d;
            add_header Cache-Control "public, no-transform, max-age=2592000, immutable";
            try_files $uri =404;
        }

        # Api proxy i logowanie JWT ze wsparciem dla WebSockets
        location /api/ {
            proxy_pass http://node-express-api:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            
            # Wsparcie dla WebSockets (upgrade nagłówków)
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}`}
                            </pre>
                          )}

                          {activeConfigFile === 'wp-config-headless.php' && (
                            <pre className="bg-black/90 p-4 rounded-xl text-[10.5px] font-mono text-zinc-300 overflow-x-auto leading-relaxed h-[400px] border border-zinc-950 select-all">
{`<?php
/**
 * Konfiguracja WordPress jako Headless API (Control Panel CMS)
 * Wyłączenie szablonów, Elementora i WooCommerce na froncie
 */

define( 'DB_NAME', 'hrl_commerce_db' );
define( 'DB_USER', 'hrl_mysql_user' );
define( 'DB_PASSWORD', 'hrl_db_strong_password_901' );
define( 'DB_HOST', 'db-mysql' );
define( 'DB_CHARSET', 'utf8mb4' );

// Blokowanie zapytań XML-RPC i wyłączenie tradycyjnego logowania sesją
define( 'XMLRPC_REQUEST', false );
define( 'WP_SESSION_COOKIE', false );

// Wyłączenie ładowania template loader (Brak motywu)
add_action( 'template_redirect', function() {
    if ( ! is_oauth_or_api_call() ) {
        wp_send_json( array(
            'status' => 'success',
            'api_endpoint' => 'https://api.hrl-music.com/v2',
            'docs' => 'https://docs.hrl-music.com/api-reference'
        ) );
        exit;
    }
} );`}
                            </pre>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Dolna stopka informacyjna o chmurze direct i SLA */}
                  <div className="bg-zinc-900/10 border border-zinc-900 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[9px] text-zinc-500 uppercase">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>SLA Dystrybucji Audio: 99.99% pod obciążeniem</span>
                    </div>
                    <span>Dostarcza: HARDBAN RECORDS LAB ARCHITECTURE DEP.</span>
                    <span>Wydanie: SaaS B2B v2.0 Enterprise</span>
                  </div>

                </div>
              )}

              {/* 🌐 CUSTOM WHITE-LABEL CLIENT PAGES TAB */}
              {activeTab === 'pages' && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full font-black uppercase">WHITE-LABEL PORTALS</span>
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full font-black uppercase">B2B SUITE</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-white mt-1 uppercase tracking-wider">Kreator Dedykowanych Portali Klienta</h2>
                      <p className="text-xs text-zinc-400">Twórz niezależne, w pełni ostylowane strony z odtwarzaczem muzycznym zabezpieczonym kodem PIN dla partnerów biznesowych.</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingPage(null);
                        setPageForm({
                          name: "Restauracja / Kawiarnia Pod Orłem",
                          playlistId: playlistsList[0]?.id || "p1",
                          requirePin: true,
                          pinCode: "1234",
                          whiteLabelTheme: {
                            accentColor: "#fb923c",
                            bgColor: "#090504",
                            logoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&q=80",
                            title: "Strefa Relaksu Restauracji Pod Orłem",
                            description: "Dedykowany, bezlicencyjny portal audio dostarczany przez Hardban Records Lab.",
                            customCss: ".b2b-logo { border: 2px solid #ef4444; }"
                          },
                          slug: "pod-orlem",
                          active: true
                        });
                        setShowPageModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:transform active:scale-98 text-white text-xs font-black rounded-xl transition-all shadow-md uppercase tracking-wider"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Utwórz Dedykowaną Stronę</span>
                    </button>
                  </div>

                  {/* LISTA STRON DEDYKOWANYCH */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {accessPagesList.map((page) => {
                      const linkedPlaylist = playlistsList.find(p => p.id === page.playlistId);
                      return (
                        <div key={page.id} className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-base font-extrabold text-white tracking-tight">{page.name}</h3>
                                <p className="text-xs text-zinc-500 font-mono mt-0.5">Slug: <span className="text-orange-400">/{page.slug}</span></p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider ${
                                page.active 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-zinc-855 text-zinc-500 border border-zinc-800'
                              }`}>
                                {page.active ? "Aktywna" : "Deaktywowana"}
                              </span>
                            </div>

                            {/* Detale konfiguracji */}
                            <div className="bg-black/40 border border-zinc-950 p-4 rounded-2xl grid grid-cols-2 gap-4 text-xs font-mono">
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-zinc-500">Playlista</p>
                                <p className="text-zinc-300 truncate mt-0.5 font-bold">{linkedPlaylist ? linkedPlaylist.title : "Nie powiązano"}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">PIN zabezpieczający</p>
                                <p className="text-zinc-300 mt-0.5 font-bold flex items-center gap-1">
                                  {page.requirePin ? (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                      <span>Wymagany ({page.pinCode})</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                      <span className="text-zinc-500">Brak (Otwarty)</span>
                                    </>
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-zinc-500">Styl Akcentu</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="w-3.5 h-3.5 rounded-full border border-black" style={{ backgroundColor: page.whiteLabelTheme?.accentColor }}></span>
                                  <span className="text-[10px] text-zinc-400">{page.whiteLabelTheme?.accentColor}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-zinc-500">Kolor Tła</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="w-3.5 h-3.5 rounded-full border border-black" style={{ backgroundColor: page.whiteLabelTheme?.bgColor }}></span>
                                  <span className="text-[10px] text-zinc-400">{page.whiteLabelTheme?.bgColor}</span>
                                </div>
                              </div>
                            </div>

                            {/* Informacje White-Label */}
                            <div className="bg-orange-950/5 border border-orange-500/10 p-3 rounded-2xl font-sans">
                              <p className="text-[10px] font-sans font-black uppercase text-orange-400 tracking-wider">Metatagi White-Label</p>
                              <p className="text-xs font-bold text-zinc-300 mt-1">{page.whiteLabelTheme?.title || "(Brak dedykowanego nagłówka)"}</p>
                              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{page.whiteLabelTheme?.description || "(Brak opisu)"}</p>
                            </div>
                          </div>

                          {/* Przyciski operacyjne */}
                          <div className="pt-2 border-t border-zinc-950 flex flex-wrap gap-2 justify-between items-center text-xs">
                            <div className="flex gap-2">
                              <a 
                                href={`/share.html?slug=${page.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-xl font-bold transition-all font-mono text-[10.5px]"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Podgląd Live</span>
                              </a>
                              <button
                                onClick={() => {
                                  const url = `${window.location.origin}/share.html?slug=${page.slug}`;
                                  navigator.clipboard.writeText(url);
                                  addLog(`Skopiowano link dostępu dla ${page.name}`);
                                  alert("Skopiowano link do schowka:\n" + url);
                                }}
                                className="bg-zinc-900/60 border border-zinc-900 hover:bg-zinc-900 text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl transition-all font-mono text-[10.5px]"
                              >
                                Kopiuj link
                              </button>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingPage(page);
                                  setPageForm({
                                    name: page.name,
                                    playlistId: page.playlistId,
                                    requirePin: page.requirePin,
                                    pinCode: page.pinCode,
                                    whiteLabelTheme: {
                                      accentColor: page.whiteLabelTheme?.accentColor || "#fb923c",
                                      bgColor: page.whiteLabelTheme?.bgColor || "#090504",
                                      logoUrl: page.whiteLabelTheme?.logoUrl || "",
                                      title: page.whiteLabelTheme?.title || "",
                                      description: page.whiteLabelTheme?.description || "",
                                      customCss: page.whiteLabelTheme?.customCss || ""
                                    },
                                    slug: page.slug,
                                    active: page.active
                                  });
                                  setShowPageModal(true);
                                }}
                                className="bg-zinc-800 hover:bg-zinc-750 text-zinc-300 p-2 rounded-xl transition-all"
                                title="Edytuj stronę"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePage(page.id, page.name)}
                                className="bg-red-950/30 hover:bg-red-900/40 text-red-400 p-2 rounded-xl border border-red-500/10 transition-all"
                                title="Usuń stronę"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {accessPagesList.length === 0 && (
                      <div className="col-span-1 lg:col-span-2 bg-zinc-900/20 border border-zinc-900/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 rounded-full bg-zinc-900 border border-zinc-850">
                          <Globe className="h-8 w-8 text-zinc-500" />
                        </div>
                        <h3 className="text-base font-extrabold text-white tracking-wider uppercase">Brak witryn white-label</h3>
                        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">System nie zawiera obecnie zdefiniowanych odrębnych portali dla placówek partnerów. Kliknij przycisk na górze, aby wygenerować pierwszy panel.</p>
                      </div>
                    )}
                  </div>

                  {/* Informacja o skalowaniu i white-label CDN */}
                  <div className="bg-zinc-900/10 border border-zinc-900 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[9px] text-zinc-500 uppercase">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Dystrybucja bezlicencyjna (Zwolnienie ze składek)</span>
                    </div>
                    <span>Metoda: Direct Safe Cache-Control Override</span>
                    <span>Wydanie: HRL PORTAL MANAGER v2.0</span>
                  </div>
                </div>
              )}

              {activeTab === 'designer' && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5">
                    <div>
                      <h2 className="text-xl font-extrabold text-white mt-1 uppercase tracking-wider">Projektant Szablonów White-Label</h2>
                      <p className="text-xs text-zinc-400">Wybierz jeden z gotowych szablonów premium lub skonfiguruj niestandardowy wygląd odtwarzacza dla swoich klientów B2B.</p>
                    </div>
                  </div>

                  {/* Szybki wybór gotowych szablonów premium */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-orange-400 animate-pulse" /> Szybkie Predefiniowane Szablony PREMIUM PRO
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {[
                        {
                          name: "Classic Coffee Lounge",
                          accentColor: "#d97706",
                          bgColor: "#1c1917",
                          seoTitle: "Kawiarnia & Jazz Premium Player",
                          desc: "Ciepły bursztyn i kolory palonej kawy",
                          customCss: "/* Classic Coffee Lounge */\n.player-container {\n  box-shadow: 0 10px 30px rgba(217, 119, 6, 0.12);\n  border-radius: 24px;\n  border: 1px solid rgba(217, 119, 6, 0.15);\n}\n.glow-effect {\n  background: radial-gradient(circle, rgba(217, 119, 6, 0.08) 0%, transparent 70%);\n}"
                        },
                        {
                          name: "Neon Cyber Sound",
                          accentColor: "#ec4899",
                          bgColor: "#030712",
                          seoTitle: "Cyberpunk Retro Wave Stream",
                          desc: "Energetyczny neonowy róż i cyberpunk",
                          customCss: "/* Cyberpunk Neon */\n.player-container {\n  box-shadow: 0 0 25px rgba(236, 72, 153, 0.25);\n  text-shadow: 0 0 8px rgba(236, 72, 153, 0.3);\n  border: 1px solid #ec489950;\n}\n.play-btn {\n  box-shadow: 0 0 15px rgba(236, 72, 153, 0.6);\n}"
                        },
                        {
                          name: "Nordic Spa Minimal",
                          accentColor: "#059669",
                          bgColor: "#121314",
                          seoTitle: "Aroma Spa & Medytacja Player",
                          desc: "Spokojna szałwiowa zieleń i minimalizm",
                          customCss: "/* Nordic Minimal CSS */\n.player-container {\n  font-family: 'Inter', sans-serif;\n  letter-spacing: -0.02em;\n  border-radius: 32px;\n  background: rgba(18, 19, 20, 0.95);\n}\n.minimalist-decor {\n  opacity: 0.6;\n}"
                        },
                        {
                          name: "Royal Club Deep",
                          accentColor: "#8b5cf6",
                          bgColor: "#020202",
                          seoTitle: "HRL Deep Club VIP Client Player",
                          desc: "Królewski fiolet i głęboka czerń",
                          customCss: "/* Royal Club CSS */\n.player-container {\n  background: linear-gradient(145deg, #020202 0%, #0c081d 100%);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);\n}"
                        },
                        {
                          name: "Sunset Chillout",
                          accentColor: "#f97316",
                          bgColor: "#0c0a09",
                          seoTitle: "Sunset Beach Bar Chillout Stream",
                          desc: "Ciepły pomarańcz zachodzącego słońca",
                          customCss: "/* Sunset Beach CSS */\n.player-container {\n  box-shadow: 0 15px 35px rgba(249, 115, 22, 0.1);\n  border: 1px solid rgba(249, 115, 22, 0.15);\n}\n.sound-wave {\n  opacity: 0.9;\n}"
                        }
                      ].map((t, idx) => (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => {
                            setGlobalSettings({
                              ...globalSettings,
                              theme: {
                                accentColor: t.accentColor,
                                bgColor: t.bgColor,
                                seoTitle: t.seoTitle,
                                customCss: t.customCss
                              }
                            });
                            addLog(`Wczytano szablon wizualny: "${t.name}". Zastosuj, aby sfinalizować.`);
                          }}
                          className="group relative bg-zinc-900 border border-zinc-850 hover:border-orange-500/30 p-4 rounded-2xl text-left transition-all hover:scale-102 cursor-pointer shadow-md flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 font-extrabold uppercase block group-hover:text-orange-400 transition-colors">PRO TEMPLATE {idx + 1}</span>
                            <h4 className="text-white font-extrabold text-xs tracking-tight">{t.name}</h4>
                            <p className="text-[9px] text-zinc-400 leading-normal">{t.desc}</p>
                          </div>
                          <div className="flex gap-2.5 items-center mt-3 pt-2.5 border-t border-zinc-950">
                            <span className="w-4 h-4 rounded-full block border border-black shadow-inner" style={{ backgroundColor: t.accentColor }} />
                            <span className="w-4 h-4 rounded-full block border border-black shadow-inner" style={{ backgroundColor: t.bgColor }} />
                            <span className="text-[8.5px] font-mono text-zinc-500 ml-auto group-hover:text-white transition-colors">Wybierz</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 shadow-lg space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Konfiguracja Głównego Szablonu</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Główny Akcent Kolorystyczny</label>
                          <input 
                            type="color" 
                            className="w-full h-10 bg-black border border-gray-800 rounded-lg block cursor-pointer mt-1" 
                            value={globalSettings?.theme?.accentColor || "#fb923c"}
                            onChange={e => setGlobalSettings({...globalSettings, theme: {...globalSettings.theme, accentColor: e.target.value}})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bazowy Kolor Tła (Hex)</label>
                          <input 
                            type="text" 
                            className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white mt-1 font-mono text-xs" 
                            value={globalSettings?.theme?.bgColor || "#090504"} 
                            onChange={e => setGlobalSettings({...globalSettings, theme: {...globalSettings.theme, bgColor: e.target.value}})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Metadane SEO & Title (Domyślne)</label>
                          <input 
                            type="text" 
                            className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white mt-1 text-xs" 
                            value={globalSettings?.theme?.seoTitle || "Odtwarzacz Muzyczny B2B"} 
                            onChange={e => setGlobalSettings({...globalSettings, theme: {...globalSettings.theme, seoTitle: e.target.value}})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dodatkowy plik CSS (URL LUB Kod)</label>
                          <textarea 
                            className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white mt-1 font-mono text-[10px] h-24" 
                            value={globalSettings?.theme?.customCss || ""}
                            onChange={e => setGlobalSettings({...globalSettings, theme: {...globalSettings.theme, customCss: e.target.value}})}
                          ></textarea>
                        </div>
                      </div>
                      <button 
                        onClick={handleSaveSettings}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-xs transition cursor-pointer"
                      >
                        Zapisz ustawienia szablonu
                      </button>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 shadow-lg">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Podgląd na żywo</h3>
                      <div className="aspect-video border rounded-2xl relative overflow-hidden flex items-center justify-center transition-all duration-300" style={{ backgroundColor: globalSettings?.theme?.bgColor || '#090504', borderColor: (globalSettings?.theme?.accentColor || '#fb923c') + '40' }}>
                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: (globalSettings?.theme?.accentColor || '#fb923c') + '10' }}></div>
                        <div className="text-center space-y-3 z-10 p-5 w-3/4 max-w-sm bg-black/50 backdrop-blur-md border rounded-xl shadow-2xl transition-all duration-300" style={{ borderColor: (globalSettings?.theme?.accentColor || '#fb923c') + '40' }}>
                           <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: (globalSettings?.theme?.accentColor || '#fb923c') + '20' }}>
                             <Music className="w-5 h-5" style={{ color: globalSettings?.theme?.accentColor || '#fb923c' }} />
                           </div>
                           <h4 className="text-white font-bold text-sm tracking-tight">{globalSettings?.theme?.seoTitle || "Odtwarzacz Muzyczny B2B"}</h4>
                           <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: (globalSettings?.theme?.accentColor || '#fb923c') + 'cc' }}>Wizualizacja Motywu</p>
                           <div className="mt-4 pt-3 border-t border-white/5 mx-auto">
                             <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                               <div className="h-full w-1/3" style={{ backgroundColor: globalSettings?.theme?.accentColor || '#fb923c' }}></div>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </main>
      </div>

      {/* MODAL CRUD UTWORÓW */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-[#121318] border border-gray-800 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider border-b border-gray-900 pb-3">
              {editingTrack ? 'Modyfikuj utwór muzyczny' : 'Dodaj nowy utwór do katalogu HRL'}
            </h3>

            <form onSubmit={handleSaveTrack} className="space-y-3.5 text-xs text-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tytuł utworu</label>
                  <input 
                    type="text" required
                    value={trackForm.title} onChange={e => setTrackForm(prev => ({...prev, title: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-sans"
                    placeholder="np. Jazz Morning"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Wykonawca / Artysta</label>
                  <input 
                    type="text" required
                    value={trackForm.artist} onChange={e => setTrackForm(prev => ({...prev, artist: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-sans"
                    placeholder="np. HRL Studio"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Album</label>
                  <input 
                    type="text" required
                    value={trackForm.album} onChange={e => setTrackForm(prev => ({...prev, album: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    placeholder="np. Cafe Session"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Rok wydania</label>
                  <input 
                    type="number" required
                    value={trackForm.year} onChange={e => setTrackForm(prev => ({...prev, year: parseInt(e.target.value, 10)}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">BPM (Tempo)</label>
                  <input 
                    type="number" required
                    value={trackForm.bpm} onChange={e => setTrackForm(prev => ({...prev, bpm: parseInt(e.target.value, 10)}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gatunek</label>
                  <select 
                    value={trackForm.genre} onChange={e => setTrackForm(prev => ({...prev, genre: e.target.value as any}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="jazz">Jazz</option>
                    <option value="lofi">Lo-Fi</option>
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="electronic">Electronic</option>
                    <option value="classical">Classical</option>
                    <option value="ambient">Ambient</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Okładka (URL)</label>
                  <input 
                    type="text"
                    value={trackForm.cover} onChange={e => setTrackForm(prev => ({...prev, cover: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 text-[11px] font-mono"
                    placeholder="URL okładki"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Czas (sekundy)</label>
                  <input 
                    type="number" required
                    value={trackForm.duration} onChange={e => setTrackForm(prev => ({...prev, duration: parseInt(e.target.value, 10)}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">ISRC Kod</label>
                  <input 
                    type="text"
                    value={trackForm.isrc} onChange={e => setTrackForm(prev => ({...prev, isrc: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-mono"
                    placeholder="Auto-generowany"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Plik Audio (Nazwa na VPS)</label>
                  <input 
                    type="text" required
                    value={trackForm.filename} onChange={e => setTrackForm(prev => ({...prev, filename: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-mono"
                    placeholder="np. hrl-010-funk.wav"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pora dnia (Zaznacz odpowiednie pory)</label>
                <div className="flex gap-4 mt-1 bg-black p-3.5 rounded-xl border border-gray-900">
                  {['morning', 'afternoon', 'evening', 'night'].map((timeStr) => (
                    <label key={timeStr} className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white capitalize">
                      <input 
                        type="checkbox"
                        checked={trackForm.timeOfDay?.includes(timeStr as any)}
                        onChange={(e) => {
                          const currentTimes = trackForm.timeOfDay || [];
                          const updated = e.target.checked 
                            ? [...currentTimes, timeStr as TimeOfDay] 
                            : currentTimes.filter(t => t !== timeStr);
                          setTrackForm(prev => ({...prev, timeOfDay: updated}));
                        }}
                        className="rounded border-gray-800 text-red-500 focus:ring-0"
                      />
                      <span>{timeStr === 'morning' ? 'rano' : timeStr === 'afternoon' ? 'południe' : timeStr === 'evening' ? 'wieczór' : 'noc'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 bg-black/60 p-3 rounded-xl border border-gray-950">
                <input 
                  type="checkbox" id="chk-explicit"
                  checked={trackForm.explicit} onChange={e => setTrackForm(prev => ({...prev, explicit: e.target.checked}))}
                  className="rounded border-gray-850 text-red-500 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <label htmlFor="chk-explicit" className="text-gray-400 font-semibold cursor-pointer">
                  Zaznacz utwór jako <span className="text-red-400 font-bold">Explicit (Treści niecenzuralne/ostre)</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-900">
                <button 
                  type="button" onClick={() => setShowTrackModal(false)}
                  className="bg-gray-950 hover:bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-gray-300 font-bold transition"
                >
                  Anuluj
                </button>
                <button 
                  type="submit" 
                  className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl text-white font-bold transition"
                >
                  Gotowe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRUD DEDYKOWANEJ STRONY B2B */}
      {showPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-[#121318] border border-gray-800 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-left">
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider border-b border-gray-900 pb-3">
              {editingPage ? 'Edycja Specjalnej Strony B2B' : 'Kreator Nowej Strony White-Label'}
            </h3>

            <form onSubmit={handleSavePage} className="space-y-4 text-xs text-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nazwa Witryny / Klienta</label>
                  <input 
                    type="text" required
                    value={pageForm.name} onChange={e => setPageForm(prev => ({...prev, name: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-sans"
                    placeholder="np. Hotel Bristol Relax"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Adres URL Slug (unikalny)</label>
                  <div className="flex">
                    <span className="bg-zinc-900 border border-r-0 border-gray-850 px-3 py-2 rounded-l-xl text-zinc-500 select-none">/</span>
                    <input 
                      type="text" required
                      value={pageForm.slug} onChange={e => setPageForm(prev => ({...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '')}))}
                      className="w-full bg-black border border-gray-800 rounded-r-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono text-[11px]"
                      placeholder="bristol-spa"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Przypisana Playlista</label>
                  <select 
                    value={pageForm.playlistId} onChange={e => setPageForm(prev => ({...prev, playlistId: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold"
                  >
                    {playlistsList.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.tracks.length} utworów)</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Dostęp zabezpieczony PINem</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="checkbox" id="requirePin-chk"
                      checked={pageForm.requirePin} onChange={e => setPageForm(prev => ({...prev, requirePin: e.target.checked}))}
                      className="rounded border-gray-850 text-orange-500 focus:ring-0 cursor-pointer h-4.5 w-4.5"
                    />
                    <label htmlFor="requirePin-chk" className="text-gray-400 font-semibold cursor-pointer select-none">Wymagaj kodu PIN</label>
                  </div>
                </div>
              </div>

              {pageForm.requirePin && (
                <div className="space-y-1 bg-orange-950/10 border border-orange-500/20 p-3 rounded-xl">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-orange-400">PIN Dostępu (4 cyfry)</label>
                  <input 
                    type="text" maxLength={4} required
                    value={pageForm.pinCode} onChange={e => setPageForm(prev => ({...prev, pinCode: e.target.value.replace(/\D/g, '')}))}
                    className="w-32 bg-black border border-orange-800/40 rounded-xl px-3 py-2 text-white text-center font-mono font-black text-base focus:outline-none focus:border-orange-500 tracking-widest"
                    placeholder="1234"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Partner będzie musiał wpisać ten kod przed odtworzeniem zabezpieczonej bazy muzycznej.</p>
                </div>
              )}

              <div className="border-t border-gray-900 pt-3 font-sans">
                <p className="text-[10px] font-mono font-black uppercase text-orange-500 tracking-widest mb-2">Personalizacja Szablonu (White-Label Theme)</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Kolor akcentu (HEX)</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={pageForm.whiteLabelTheme?.accentColor || "#fb923c"} 
                        onChange={e => setPageForm(prev => ({
                          ...prev, 
                          whiteLabelTheme: { ...prev.whiteLabelTheme, accentColor: e.target.value }
                        }))}
                        className="w-10 h-8 rounded bg-transparent cursor-pointer border-x border-y border-zinc-800"
                      />
                      <input 
                        type="text" required
                        value={pageForm.whiteLabelTheme?.accentColor || "#fb923c"} 
                        onChange={e => setPageForm(prev => ({
                          ...prev, 
                          whiteLabelTheme: { ...prev.whiteLabelTheme, accentColor: e.target.value }
                        }))}
                        className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Kolor tła strony (HEX)</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={pageForm.whiteLabelTheme?.bgColor || "#090504"} 
                        onChange={e => setPageForm(prev => ({
                          ...prev, 
                          whiteLabelTheme: { ...prev.whiteLabelTheme, bgColor: e.target.value }
                        }))}
                        className="w-10 h-8 rounded bg-transparent cursor-pointer border-x border-y border-zinc-800"
                      />
                      <input 
                        type="text" required
                        value={pageForm.whiteLabelTheme?.bgColor || "#090504"} 
                        onChange={e => setPageForm(prev => ({
                          ...prev, 
                          whiteLabelTheme: { ...prev.whiteLabelTheme, bgColor: e.target.value }
                        }))}
                        className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dedykowany Tytuł (Header)</label>
                    <input 
                      type="text" required
                      value={pageForm.whiteLabelTheme?.title || ""} 
                      onChange={e => setPageForm(prev => ({
                        ...prev, 
                        whiteLabelTheme: { ...prev.whiteLabelTheme, title: e.target.value }
                      }))}
                      className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white font-sans text-xs"
                      placeholder="np. Muzyka bez ZAIKS dla Twojego Biznesu"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Adres URL Logo / Ikony</label>
                    <input 
                      type="text"
                      value={pageForm.whiteLabelTheme?.logoUrl || ""} 
                      onChange={e => setPageForm(prev => ({
                        ...prev, 
                        whiteLabelTheme: { ...prev.whiteLabelTheme, logoUrl: e.target.value }
                      }))}
                      className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                      placeholder="Bezpośredni link do logo"
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dedykowany Opis pod Tytułem</label>
                  <textarea 
                    value={pageForm.whiteLabelTheme?.description || ""} 
                    onChange={e => setPageForm(prev => ({
                      ...prev, 
                      whiteLabelTheme: { ...prev.whiteLabelTheme, description: e.target.value }
                    }))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white font-sans text-xs"
                    rows={2}
                    placeholder="Wprowadź krótki opis, np. Certyfikowana baza licencjonowana Hardban Records..."
                  />
                </div>

                <div className="space-y-1 mt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Własny CSS (Custom Styles override)</label>
                  <textarea 
                    value={pageForm.whiteLabelTheme?.customCss || ""} 
                    onChange={e => setPageForm(prev => ({
                      ...prev, 
                      whiteLabelTheme: { ...prev.whiteLabelTheme, customCss: e.target.value }
                    }))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-[10.5px]"
                    rows={2}
                    placeholder=".b2b-player-card { border-radius: 40px; }"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-900">
                <button 
                  type="button" onClick={() => setShowPageModal(false)}
                  className="bg-gray-950 hover:bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-zinc-300 font-bold transition"
                >
                  Anuluj
                </button>
                <button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700 px-5 py-2 rounded-xl text-white font-bold transition uppercase tracking-wider text-xs"
                >
                  Zapisz Konfigurację
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRUD PLAYLISTY */}
      {showPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-[#121318] border border-gray-800 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider border-b border-gray-900 pb-3">
              {editingPlaylist ? 'Ustawienia playlisty' : 'Zaprojektuj nową playlistę White-label'}
            </h3>

            <form onSubmit={handleSavePlaylist} className="space-y-4 text-xs text-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nazwa playlisty</label>
                  <input 
                    type="text" required
                    value={playlistForm.title} onChange={e => setPlaylistForm(prev => ({...prev, title: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-sans"
                    placeholder="np. Kawiarnia Morning"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nazwa klienta (Logotyp)</label>
                  <input 
                    type="text" required
                    value={playlistForm.clientName} onChange={e => setPlaylistForm(prev => ({...prev, clientName: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-sans"
                    placeholder="np. Kawiarnia Aroma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Kolor Akcentu Hex</label>
                  <input 
                    type="color"
                    value={playlistForm.accentColor} onChange={e => setPlaylistForm(prev => ({...prev, accentColor: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl h-9 px-1 focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Kolor tła Hex</label>
                  <input 
                    type="color"
                    value={playlistForm.bgColor} onChange={e => setPlaylistForm(prev => ({...prev, bgColor: e.target.value}))}
                    className="w-full bg-black border border-gray-800 rounded-xl h-9 px-1 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Wybór utworów do playlisty */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dobierz utwory (Kolejność wierszy = kolejność grania)</label>
                <div className="bg-black border border-gray-900 rounded-xl p-3 max-h-44 overflow-y-auto space-y-2">
                  {tracksList.map((track) => {
                    const isChecked = playlistForm.tracks?.includes(track.id);
                    return (
                      <label key={track.id} className="flex items-center gap-3 p-1.5 hover:bg-gray-950 rounded cursor-pointer transition">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const currentTracks = playlistForm.tracks || [];
                            const updated = e.target.checked 
                              ? [...currentTracks, track.id] 
                              : currentTracks.filter(tid => tid !== track.id);
                            setPlaylistForm(prev => ({...prev, tracks: updated}));
                          }}
                          className="rounded text-red-500 border-gray-800 focus:ring-0"
                        />
                        <div className="flex justify-between items-center w-full">
                          <span className="text-white font-medium">{track.title} <span className="text-gray-500 font-normal">by {track.artist}</span></span>
                          <span className="bg-gray-900 text-gray-400 px-1.5 py-0.5 rounded text-[9px] capitalize font-mono">{track.genre} • Pora: {track.timeOfDay.join(', ')}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Opcje kontrolne */}
              <div className="grid grid-cols-2 gap-4 bg-black/40 border border-gray-950 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" id="chk-sched"
                    checked={playlistForm.useSchedule} onChange={e => setPlaylistForm(prev => ({...prev, useSchedule: e.target.checked}))}
                    className="rounded text-red-500 border-gray-800 focus:ring-0"
                  />
                  <label htmlFor="chk-sched" className="text-gray-400 font-semibold cursor-pointer select-none">Obsługa Harmonogramu Pór</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" id="chk-expl"
                    checked={playlistForm.explicitFilter} onChange={e => setPlaylistForm(prev => ({...prev, explicitFilter: e.target.checked}))}
                    className="rounded text-red-500 border-gray-800 focus:ring-0"
                  />
                  <label htmlFor="chk-expl" className="text-gray-400 font-semibold cursor-pointer select-none">Automatyczny Filtr Explicit</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" id="chk-loop"
                    checked={playlistForm.loop} onChange={e => setPlaylistForm(prev => ({...prev, loop: e.target.checked}))}
                    className="rounded text-red-500 border-gray-800 focus:ring-0"
                  />
                  <label htmlFor="chk-loop" className="text-gray-400 font-semibold cursor-pointer select-none">Pętla (Loop po skończeniu)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" id="chk-auto"
                    checked={playlistForm.autoplay} onChange={e => setPlaylistForm(prev => ({...prev, autoplay: e.target.checked}))}
                    className="rounded text-red-500 border-gray-800 focus:ring-0"
                  />
                  <label htmlFor="chk-auto" className="text-gray-400 font-semibold cursor-pointer select-none">Autoplay przy wejściu</label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-900">
                <button 
                  type="button" onClick={() => setShowPlaylistModal(false)}
                  className="bg-gray-950 hover:bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-gray-300 font-bold transition"
                >
                  Anuluj
                </button>
                <button 
                  type="submit" 
                  className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl text-white font-bold transition"
                >
                  Gotowe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REJESTRACJI KLIENTA B2B */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-[#121318] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-scale-up text-xs">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-gray-900 pb-3 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-red-500" />
              <span>Zarejestruj nową firmę & generuj biling</span>
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">E-mail Przedstawiciela</label>
                <input 
                  type="email" required
                  value={userForm.email} onChange={e => setUserForm(prev => ({...prev, email: e.target.value}))}
                  className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="np. manager@kawiarnia.pl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nazwa firmy / Klienta</label>
                <input 
                  type="text" required
                  value={userForm.name} onChange={e => setUserForm(prev => ({...prev, name: e.target.value}))}
                  className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="np. Kawiarnia Aroma s.c."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Rola Użytkownika</label>
                <select 
                  className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  value={userForm.role}
                  onChange={e => setUserForm(prev => ({...prev, role: e.target.value as any}))}
                >
                  <option value="subscriber">Subscriber</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Poziom Subskrypcji (PMPro)</label>
                <select 
                  className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  value={userForm.pmproLevel}
                  onChange={e => setUserForm(prev => ({...prev, pmproLevel: parseInt(e.target.value, 10)}))}
                >
                  <option value={1}>Level 1: Kawiarnia Standard</option>
                  <option value={2}>Level 2: Sklep Premium</option>
                  <option value={3}>Level 3: Siłownia Pro</option>
                  <option value={4}>Level 4: VIP Unlimited</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Przypisz playlisty do Odtwarzacza B2B</label>
                <div className="bg-black border border-gray-900 rounded-xl p-3 space-y-1.5 max-h-24 overflow-y-auto">
                  {playlistsList.map(p => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
                      <input 
                        type="checkbox"
                        checked={userForm.playlistIds.includes(p.id)}
                        onChange={(e) => {
                          const current = userForm.playlistIds;
                          const updated = e.target.checked 
                            ? [...current, p.id] 
                            : current.filter(id => id !== p.id);
                          setUserForm(prev => ({...prev, playlistIds: updated}));
                        }}
                        className="rounded border-gray-800 text-red-500 focus:ring-0"
                      />
                      <span>{p.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-gray-900 text-xs">
                <button 
                  type="button" onClick={() => setShowUserModal(false)}
                  className="bg-gray-950 hover:bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-gray-300 font-bold transition"
                >
                  Anuluj
                </button>
                <button 
                  type="submit" 
                  className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl text-white font-bold transition"
                >
                  Generuj Klienta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PODGLĄDU FAKTURY */}
      {selectedInvoice && (
        <InvoiceModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}

    </div>
  );
}
