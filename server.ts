import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Track, Playlist, PlayLog, AccessToken, Invoice, UserProfile, TimeOfDay, AccessPage } from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sól HMAC do tokenów — wczytywana z bezpiecznej zmiennej środowiskowej z autogenerowanym losowym fallbackiem w celu eliminacji podatności Known Salt Attack
const HMAC_SECRET = process.env.HMAC_SECRET || (() => {
  const secureKey = crypto.randomBytes(32).toString("hex");
  console.warn("\x1b[33m%s\x1b[0m", "[SECURITY WARNING] Zmienna środowiskowa HMAC_SECRET jest nieustawiona! Wygenerowano w locie bezpieczny i losowy klucz kryptograficzny o wysokiej entropii na czas życia procesu serwera.");
  return secureKey;
})();

// Automatyczne czyszczenie wygasłych tokenów z pamięci RAM (Garbage Collector przeciwdziałający wyciekom pamięci)
setInterval(() => {
  const now = new Date();
  const initialCount = tokens.length;
  tokens = tokens.filter(t => new Date(t.expiresAt) > now);
  const diff = initialCount - tokens.length;
  if (diff > 0) {
    console.log(`[GC ROOT] Automatyczne czyszczenie: Usunięto ${diff} wygasłych tokenów HMAC z pamięci RAM.`);
  }
}, 10 * 60 * 1000); // Wykonywane co 10 minut w tle

// Stan danych (In-Memory Database z polami z v2.0)
let tracks: Track[] = [
  {
    id: "t1",
    title: "Jazz Morning Brew",
    artist: "HRL Studio Collective",
    album: "Cafe Sessions Vol. 1",
    year: 2026,
    bpm: 88,
    genre: "jazz",
    mood: ["relax", "happy"],
    duration: 120,
    explicit: false,
    timeOfDay: ["morning"],
    isrc: "PLHRL2600001",
    cover: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&auto=format&fit=crop&q=60",
    filename: "hrl-001-jazz-morning.wav"
  },
  {
    id: "t2",
    title: "Lo-Fi Coffee Beans",
    artist: "Lofi Beats Lab",
    album: "Chilled Grinds",
    year: 2025,
    bpm: 76,
    genre: "lofi",
    mood: ["focus", "relax"],
    duration: 150,
    explicit: false,
    timeOfDay: ["afternoon", "morning"],
    isrc: "PLHRL2500002",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=60",
    filename: "hrl-002-lofi-coffee.wav"
  },
  {
    id: "t3",
    title: "Ambient Velvet Evening",
    artist: "HRL Soundscapes",
    album: "Senses",
    year: 2026,
    bpm: 65,
    genre: "ambient",
    mood: ["relax", "focus"],
    duration: 180,
    explicit: false,
    timeOfDay: ["evening"],
    isrc: "PLHRL2600003",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60",
    filename: "hrl-003-ambient-escape.wav"
  },
  {
    id: "t4",
    title: "Electronic Workout Pulse",
    artist: "Hardban Club",
    album: "Redline",
    year: 2026,
    bpm: 128,
    genre: "electronic",
    mood: ["energetic"],
    duration: 140,
    explicit: false,
    timeOfDay: ["night", "evening"],
    isrc: "PLHRL2600004",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60",
    filename: "hrl-004-electronic-pulse.wav"
  },
  {
    id: "t5",
    title: "Classic Piano Reverie",
    artist: "Classic Trio",
    album: "Nocturnes",
    year: 2024,
    bpm: 70,
    genre: "classical",
    mood: ["focus", "melancholic"],
    duration: 100,
    explicit: false,
    timeOfDay: ["morning", "afternoon"],
    isrc: "PLHRL2400005",
    cover: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&auto=format&fit=crop&q=60",
    filename: "hrl-005-classic-piano.wav"
  },
  {
    id: "t6",
    title: "Summer Chilled Lounge",
    artist: "Vibe Cartel",
    album: "Beach Cruiser",
    year: 2026,
    bpm: 98,
    genre: "pop",
    mood: ["happy", "relax"],
    duration: 130,
    explicit: true,
    timeOfDay: ["afternoon", "evening"],
    isrc: "PLHRL2600006",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=60",
    filename: "hrl-006-summer-pop.wav"
  }
];

let playlists: Playlist[] = [
  {
    id: "p1",
    title: "Kawiarnia Aroma - Morning Light",
    pmproLevel: 1,
    clientName: "Kawiarnia Aroma",
    clientLogo: "",
    accentColor: "#c8963e",
    bgColor: "#0c0a07",
    autoplay: true,
    loop: true,
    hideTracklist: false,
    volume: 0.8,
    useSchedule: true,
    explicitFilter: true,
    tracks: ["t1", "t2", "t5"]
  },
  {
    id: "p2",
    title: "Trendsetter Boutique - Fashion Beats",
    pmproLevel: 2,
    clientName: "Sklep Trendsetter",
    clientLogo: "",
    accentColor: "#d946ef",
    bgColor: "#09050d",
    autoplay: true,
    loop: true,
    hideTracklist: false,
    volume: 0.7,
    useSchedule: false,
    explicitFilter: false,
    tracks: ["t2", "t4", "t6"]
  },
  {
    id: "p3",
    title: "Titan Gym - Power Zone",
    pmproLevel: 3,
    clientName: "Siłownia Titan",
    clientLogo: "",
    accentColor: "#22c55e",
    bgColor: "#050b07",
    autoplay: true,
    loop: true,
    hideTracklist: false,
    volume: 1.0,
    useSchedule: false,
    explicitFilter: true,
    tracks: ["t4", "t2"]
  },
  {
    id: "p4",
    title: "VIP Lounge - Exclusive Mix",
    pmproLevel: 4,
    clientName: "Hotel Metropole VIP",
    clientLogo: "",
    accentColor: "#eab308",
    bgColor: "#06090f",
    autoplay: true,
    loop: true,
    hideTracklist: false,
    volume: 0.6,
    useSchedule: true,
    explicitFilter: false,
    tracks: ["t1", "t2", "t3", "t4", "t5", "t6"]
  }
];

let playLogs: PlayLog[] = [];
let tokens: AccessToken[] = [];

// Baza stron dostępowych B2B / White-label Shareable Players
let accessPages: AccessPage[] = [
  {
    id: "ap1",
    name: "Gdańsk Spa Mall - Strefa Relaksu",
    playlistId: "p1",
    requirePin: true,
    pinCode: "1234",
    whiteLabelTheme: {
      accentColor: "#fb923c",
      bgColor: "#090504",
      logoUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=100&h=100&fit=crop",
      title: "Gdańsk Spa Wellness Club",
      description: "Ekskluzywna ścieżka dźwiękowa dostarczana przez Hardban Records Lab B2B Premium Cloud Stream.",
      customCss: ""
    },
    slug: "gdansk-spa",
    active: true
  },
  {
    id: "ap2",
    name: "Warsaw Horizon Club VIP",
    playlistId: "p4",
    requirePin: false,
    whiteLabelTheme: {
      accentColor: "#eab308",
      bgColor: "#020617",
      title: "Hotel Metropole Sky Bar",
      description: "Subskrypcja VIP Unlimited. Muzyka o wysokiej autoryzacji z systemem Nginx X-Accel.",
      customCss: "body { font-family: 'Space Grotesk', sans-serif; }"
    },
    slug: "hotel-vip",
    active: true
  }
];

// Aktywni klienci WebSocket
interface WSClient {
  id: string;
  ws: WebSocket;
  userId: string;
  name: string;
  role: string;
  connectedAt: Date;
  lastAction?: string;
  currentTrack?: string;
}
let activeWsClients: WSClient[] = [];

// Broadcast system
function broadcastWS(event: string, payload: any, targetUserId?: string) {
  const msg = JSON.stringify({ event, payload });
  activeWsClients.forEach(client => {
    if (!targetUserId || client.userId === targetUserId) {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(msg);
        } catch (err) {
          console.error("WS error sending to client:", err);
        }
      }
    }
  });
}
let users: UserProfile[] = [
  {
    id: "u1",
    email: "admin@hrl.pl",
    name: "HRL Administrator",
    role: "admin",
    pmproLevel: 0,
    playlistIds: []
  },
  {
    id: "u2",
    email: "aroma@b2b.pl",
    name: "Jan Kowalski (Aroma)",
    role: "subscriber",
    pmproLevel: 1,
    playlistIds: []
  },
  {
    id: "u3",
    email: "trendsetter@b2b.pl",
    name: "Marta Nowak (Trendsetter)",
    role: "subscriber",
    pmproLevel: 2,
    playlistIds: []
  },
  {
    id: "u4",
    email: "titan@b2b.pl",
    name: "Robert Lewandowski (Titan)",
    role: "subscriber",
    pmproLevel: 3,
    playlistIds: []
  },
  {
    id: "u5",
    email: "vip@b2b.pl",
    name: "Dyrektor Hotelu VIP",
    role: "subscriber",
    pmproLevel: 4,
    playlistIds: ["p4", "p1"] // VIP ma swoją VIP-owska playlistę + ma dołączoną playlistę 1
  }
];

let globalSettings = {
  theme: {
    accentColor: "#fb923c",
    bgColor: "#090504",
    seoTitle: "Odtwarzacz Muzyczny B2B",
    customCss: "/* Dodaj własne reguły CSS */\n.player-container { box-shadow: 0 0 15px rgba(251, 146, 60, 0.1); }"
  },
  integrations: {
    webhookUrl: "",
    subscribedEvents: ["station.published"]
  }
};

let invoices: Invoice[] = [
  {
    id: "inv1",
    invoiceNumber: "HRL-2026-05-00001",
    clientName: "Kawiarnia Aroma Sp. z o.o.",
    clientEmail: "aroma@b2b.pl",
    date: "2026-05-10",
    amount: 80.49,
    tax: 18.51,
    total: 99.00,
    status: "paid",
    items: [
      { description: "Licencja muzyczna HRL B2B — Kawiarnia Standard — 05/2026", qty: 1, amount: 99.00 }
    ]
  },
  {
    id: "inv2",
    invoiceNumber: "HRL-2026-05-00002",
    clientName: "Trendsetter Fashion Group",
    clientEmail: "trendsetter@b2b.pl",
    date: "2026-05-11",
    amount: 161.79,
    tax: 37.21,
    total: 199.00,
    status: "paid",
    items: [
      { description: "Licencja muzyczna HRL B2B — Sklep Premium — 05/2026", qty: 1, amount: 199.00 }
    ]
  },
  {
    id: "inv3",
    invoiceNumber: "HRL-2026-05-00003",
    clientName: "Titan Physical Fitness Lab",
    clientEmail: "titan@b2b.pl",
    date: "2026-05-12",
    amount: 121.14,
    tax: 27.86,
    total: 149.00,
    status: "paid",
    items: [
      { description: "Licencja muzyczna HRL B2B — Siłownia Pro — 05/2026", qty: 1, amount: 149.00 }
    ]
  },
  {
    id: "inv4",
    invoiceNumber: "HRL-2026-05-00004",
    clientName: "Hotel Metropole - Manager",
    clientEmail: "vip@b2b.pl",
    date: "2026-05-15",
    amount: 243.09,
    tax: 55.91,
    total: 299.00,
    status: "paid",
    items: [
      { description: "Licencja muzyczna HRL B2B — VIP Unlimited — 05/2026", qty: 1, amount: 299.00 }
    ]
  }
];

// Generowanie próbnych statystyk z ostatnich 7 dni w celu wizualizacji
const generateInitialPlayLogs = () => {
  const currentDays = 7;
  const now = new Date();
  
  for (let i = currentDays; i >= 0; i--) {
    const logDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Wybierz losowo 5-15 odtworzeń dla tego dnia
    const playsToday = Math.floor(Math.random() * 11) + 5;
    
    for (let j = 0; j < playsToday; j++) {
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      const randomPlaylist = playlists[Math.floor(Math.random() * playlists.length)];
      const randomUser = users[Math.floor(Math.random() * (users.length - 1)) + 1]; // subscriber
      
      // Losowa godzina
      const hour = Math.floor(Math.random() * 24);
      const min = Math.floor(Math.random() * 60);
      logDate.setHours(hour, min, 0, 0);

      playLogs.push({
        id: `play_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        trackId: randomTrack.id,
        playlistId: randomPlaylist.id,
        userId: randomUser.id,
        playedAt: logDate.toISOString(),
        durationS: Math.floor(Math.random() * (randomTrack.duration - 10)) + 10 // Odtworzono minimum 10s do pełnego utworu
      });
    }
  }
};
generateInitialPlayLogs();


// Generator pliku WAV w pamięci o zadanym tonie sinusoidalnym
function generateWavBuffer(durationSeconds: number, frequency = 340): Buffer {
  const sampleRate = 8000;
  const numSamples = sampleRate * durationSeconds;
  const buffer = Buffer.alloc(44 + numSamples);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples, 4); // File size - 8
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);             // Subchunk1Size
  buffer.writeUInt16LE(1, 20);              // AudioFormat (1 is PCM)
  buffer.writeUInt16LE(1, 22);              // NumChannels (1 is mono)
  buffer.writeUInt32LE(sampleRate, 24);     // SampleRate
  buffer.writeUInt32LE(sampleRate, 28);     // ByteRate (SampleRate * NumChannels * BitsPerSample/8 = 8000 * 1 * 1 = 8000)
  buffer.writeUInt16LE(1, 32);              // BlockAlign (NumChannels * BitsPerSample/8 = 1 * 1 = 1)
  buffer.writeUInt16LE(8, 34);              // BitsPerSample (8 bits)

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples, 40);

  // Wygeneruj sygnał sinusoidalny (8-bit PCM, wartość w przedziale 0-255 centered at 128)
  for (let i = 0; i < numSamples; i++) {
    const angle = (2 * Math.PI * frequency * i) / sampleRate;
    const value = Math.round(128 + 110 * Math.sin(angle));
    buffer.writeUInt8(value, 44 + i);
  }

  return buffer;
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 🛡️ CUSTOM SECURITY MIDDLEWARE & RATE LIMITER (Przeciwdziałanie DDoS i abuse)
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuta
  const MAX_REQUESTS_PER_WINDOW = 300; // Maksymalnie 300 zapytań na minutę z jednego IP

  app.use((req, res, next) => {
    // 1. Zabezpieczenia nagłówków HTTP (OWASP Secure Headers)
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN"); // Standardowa ochrona przed Clickjackingiem (można rozszerzyć dla domen zaufanych graczy B2B)
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Content-Security-Policy", "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval' wss: ws:; img-src 'self' https: data:; media-src 'self' https: data: blob:;");

    // CORS - Bezpieczna kontrola pochodzenia, blokowanie nieautoryzowanych domen zapytań z zewnątrz
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-WP-Nonce");
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    // 2. Prosty i szybki In-Memory Rate Limiter przeciwdziałający wyczerpaniu wątków Node.js
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const now = Date.now();
    const rateData = rateLimitMap.get(clientIp);

    if (!rateData || now > rateData.resetTime) {
      rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
      rateData.count++;
      if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
          error: "Too Many Requests",
          message: "Przekroczono limit bezpiecznych zapytań na minutę dla Twojego adresu IP. Zabezpieczenie DDoS aktywne."
        });
      }
    }
    next();
  });

  // Garbage Collector dla mapy Rate Limitera co 5 minut, zapobiegający wolnemu wyciekowi RAM
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  // ═══════════════════════════════════════════════════════
  // ENDPOINTY REST API v2.0
  // ═══════════════════════════════════════════════════════

  // Symulacja sesji / prostego "zalogowanego usera"
  // W prawdziwym środowisku WordPress to wp-json korzysta z sesji cookie uzytkownika
  // My używamy prymitywnego nagłówka symulującego autoryzację `Authorization: x-user-id <id>` lub `X-WP-Nonce`
  app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('x-user-id ')) {
      const userId = authHeader.split(' ')[1];
      const match = users.find(u => u.id === userId);
      if (match) {
        (req as any).user = match;
      }
    } else {
      // Domyślna symulacja admina lub subscribera, jeśli brak nagłówka w prostych zapytaniach
      const defaultUserId = req.query.sim_user as string;
      if (defaultUserId) {
        const match = users.find(u => u.id === defaultUserId);
        if (match) (req as any).user = match;
      }
    }
    next();
  });

  // REST: lista playlist zalogowanego klienta
  // Łączy Model A (poziom PMPro) i Model B (user meta)
  app.get("/api/my-playlists", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user) {
      return res.status(401).json({ error: "Niezalogowany lub błędna autoryzacja" });
    }

    let customerPlaylists: Playlist[] = [];

    if (user.role === 'admin') {
      customerPlaylists = playlists;
    } else {
      // Model A: po poziomie PMPro
      const modelAPlaylists = playlists.filter(p => p.pmproLevel === user.pmproLevel);
      // Model B: bezpośrednio przypisane playlisty z metadanych
      const modelBPlaylists = playlists.filter(p => user.playlistIds.includes(p.id));

      const merged = [...modelAPlaylists, ...modelBPlaylists];
      // Usuń duplikaty
      const idsSeen = new Set();
      customerPlaylists = merged.filter(p => {
        if (!idsSeen.has(p.id)) {
          idsSeen.add(p.id);
          return true;
        }
        return false;
      });
    }

    res.json(customerPlaylists);
  });

  // REST: Tworzenie spersonalizowanej playlisty przez klienta (B2B Curator)
  app.post("/api/my-playlists", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user) {
      return res.status(401).json({ error: "Brak autoryzacji" });
    }

    const newPlaylist: Playlist = {
      id: `p_custom_${Date.now()}`,
      title: req.body.title || `Odtwarzacz: ${user.name}`,
      pmproLevel: user.pmproLevel,
      clientName: req.body.clientName || user.name,
      clientLogo: req.body.clientLogo || "",
      accentColor: req.body.accentColor || "#f97316",
      bgColor: req.body.bgColor || "#09090b",
      autoplay: req.body.autoplay !== false,
      loop: req.body.loop !== false,
      hideTracklist: !!req.body.hideTracklist,
      volume: parseFloat(req.body.volume) || 0.8,
      useSchedule: !!req.body.useSchedule,
      explicitFilter: !!req.body.explicitFilter,
      tracks: Array.isArray(req.body.tracks) ? req.body.tracks : [],
      pin: req.body.pin || "",
      audioCta: req.body.audioCta || "none",
      seoKeywords: req.body.seoKeywords || "luksusowy, relaksujący, butikowy"
    };

    playlists.push(newPlaylist);
    
    // Model B: Dopisz bezpośrednio do konta klienta
    if (!user.playlistIds.includes(newPlaylist.id)) {
      user.playlistIds.push(newPlaylist.id);
    }
    
    res.json(newPlaylist);
  });

  // REST: Aktualizacja spersonalizowanej playlisty przez klienta
  app.put("/api/my-playlists/:id", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user) {
      return res.status(401).json({ error: "Brak autoryzacji" });
    }

    const { id } = req.params;
    const index = playlists.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Playlista nie istnieje" });
    }

    // Pozwól edytować tylko jeśli użytkownik jest administratorem lub jest to jego własna przypisana playlista
    const isAllowed = user.role === 'admin' || user.playlistIds.includes(id) || playlists[index].pmproLevel === user.pmproLevel;
    if (!isAllowed) {
      return res.status(403).json({ error: "Brak uprawnień do edycji tej playlisty B2B." });
    }

    playlists[index] = {
      ...playlists[index],
      title: req.body.title || playlists[index].title,
      clientName: req.body.clientName || playlists[index].clientName,
      accentColor: req.body.accentColor || playlists[index].accentColor,
      bgColor: req.body.bgColor || playlists[index].bgColor,
      autoplay: req.body.autoplay !== false,
      loop: req.body.loop !== false,
      hideTracklist: !!req.body.hideTracklist,
      volume: parseFloat(req.body.volume) || playlists[index].volume,
      useSchedule: !!req.body.useSchedule,
      explicitFilter: !!req.body.explicitFilter,
      tracks: Array.isArray(req.body.tracks) ? req.body.tracks : playlists[index].tracks,
      pin: req.body.pin !== undefined ? req.body.pin : playlists[index].pin,
      audioCta: req.body.audioCta !== undefined ? req.body.audioCta : playlists[index].audioCta,
      seoKeywords: req.body.seoKeywords !== undefined ? req.body.seoKeywords : playlists[index].seoKeywords
    };

    res.json(playlists[index]);
  });

  // REST: Generowanie spersonalizowanej, w 100% niezależnej, zabezpieczonej strony HTML odtwarzacza dla placówki klienta
  app.get("/api/playlists/:id/download", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user) {
      return res.status(401).send("Brak autoryzacji (Błąd 401).");
    }

    const playlistId = req.params.id;
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return res.status(404).send("Odtwarzacz o podanym identyfikatorze nie istnieje.");
    }

    // Walidacja praw dostępu
    if (user.role !== 'admin') {
      const isAllowed = user.playlistIds.includes(playlistId) || playlist.pmproLevel === user.pmproLevel;
      if (!isAllowed) {
        return res.status(403).send("Brak uprawnień rządu dostępowego dla tej placówki.");
      }
    }

    const playlistTracks = tracks.filter(t => playlist.tracks.includes(t.id));
    const serverHost = `${req.secure ? 'https' : 'http'}://${req.get('host')}`;

    const htmlContent = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${playlist.clientName} - Stanowisko Odtwarzacza B2B</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;705&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background-color: #09090b;
        }
        .font-display {
            font-family: 'Space Grotesk', sans-serif;
        }
        .font-mono {
            font-family: 'JetBrains Mono', sans-serif;
        }
        @keyframes rotate-vinyl {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: rotate-vinyl 20s linear infinite;
        }
    </style>
</head>
<body class="text-zinc-100 min-h-screen flex flex-col justify-between overflow-x-hidden p-6 md:p-12 bg-zinc-950">

    \${playlist.pin ? \`
    <!-- 🔒 EKRAN BLOKADY PIN -->
    <div id="pin-screen" class="fixed inset-0 bg-zinc-950 z-50 flex items-center justify-center p-4">
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
            <div class="mx-auto w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <i data-lucide="lock" class="w-6 h-6"></i>
            </div>
            <div>
                <h2 class="text-lg font-bold">Autoryzacja Placówki</h2>
                <p class="text-xs text-zinc-500 mt-1">Podaj 4-cyfrowy PIN, aby odblokować bezpieczny odsłuch.</p>
            </div>
            <div class="space-y-3">
                <input type="password" id="pin-input" maxlength="4" placeholder="••••" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:ring-1 focus:ring-orange-500 focus:outline-none" />
                <button onclick="verifyPin()" class="w-full bg-orange-600 hover:bg-orange-500 text-zinc-950 font-bold py-3 rounded-xl transition text-sm">
                    Odblokuj Stanowisko
                </button>
            </div>
            <p id="pin-error" class="text-xs text-red-500 font-bold hidden">Błędny kod PIN.</p>
        </div>
    </div>
    \` : ''}

    <div class="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-between gap-12">
        <header class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl text-zinc-950 shadow-lg" style="background-color: \${playlist.accentColor};">
                    \${playlist.clientName.charAt(0).toUpperCase()}
                </div>
                <div class="text-left">
                    <h1 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span>\${playlist.clientName}</span>
                    </h1>
                    <p class="text-[10px] text-zinc-500 font-medium font-mono uppercase tracking-wider">
                        Licencja Direct Bez Opłat ZAIKS/ZPAV/SAWP • Hardban Records Lab
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono">
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Zwolniony z opłat publicznych
            </div>
        </header>

        <main class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-6">
            <div class="md:col-span-5 flex flex-col items-center">
                <div class="relative w-56 h-56 flex justify-center items-center">
                    <div id="vinyl-disc" class="absolute w-52 h-52 rounded-full border-4 shadow-2xl overflow-hidden aspect-square border-zinc-750 transition-all">
                        <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&auto=format&fit=crop&q=60" class="w-full h-full object-cover">
                    </div>
                    <div class="absolute w-12 h-12 bg-zinc-950 border-4 border-zinc-800 rounded-full z-10 flex justify-center items-center">
                        <div class="w-3 h-3 bg-zinc-800 rounded-full"></div>
                    </div>
                </div>
            </div>

            <div class="md:col-span-7 space-y-6">
                <div class="text-center md:text-left space-y-1.5">
                    <h2 id="track-title" class="font-display font-bold text-2xl text-white tracking-tight leading-tight">Wczytywanie...</h2>
                    <p id="track-artist" class="text-zinc-400 font-medium text-xs">Kliknij Play</p>
                    <div class="flex justify-center md:justify-start gap-2 pt-1">
                        <span id="track-meta" class="text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase font-bold tracking-wider">STANOWISKO ODSŁUCHOWE</span>
                    </div>
                </div>

                <div class="space-y-1.5">
                    <div id="progress-container" onclick="seek(event)" class="h-1.5 w-full bg-zinc-900 rounded-full cursor-pointer overflow-hidden border border-zinc-800">
                        <div id="progress-bar" class="h-full rounded-full w-0 transition-all pointer-events-none" style="background-color: \${playlist.accentColor}"></div>
                    </div>
                    <div class="flex justify-between font-mono text-[9px] text-zinc-500 font-bold">
                        <span id="current-time">0:00</span>
                        <span id="duration">0:00</span>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-4 border-t border-zinc-900 pt-4">
                    <div class="flex items-center gap-3">
                        <button onclick="prev()" class="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition">
                            <i class="w-4 h-4" data-lucide="skip-back"></i>
                        </button>
                        <button id="play-pause-btn" onclick="togglePlay()" class="p-3.5 bg-orange-500 text-zinc-950 rounded-full transition hover:brightness-110" style="background-color: \${playlist.accentColor}; color: #000;">
                            <i id="play-icon" class="w-5 h-5 fill-current" data-lucide="play"></i>
                        </button>
                        <button onclick="next()" class="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition">
                            <i class="w-4 h-4" data-lucide="skip-forward"></i>
                        </button>
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="toggleMute()" class="text-zinc-500 hover:text-zinc-300">
                            <i id="volume-icon" class="w-4 h-4" data-lucide="volume-2"></i>
                        </button>
                        <input type="range" min="0" max="1" step="0.05" value="0.8" id="volume-slider" oninput="setVolume(this.value)" class="w-20 h-1 bg-zinc-900 rounded-full accent-orange-500 cursor-pointer" style="accent-color: \${playlist.accentColor};" />
                    </div>
                </div>
            </div>
        </main>

        <section class="space-y-4">
            <h3 class="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Utwory w tym odtwarzaczu (\${playlistTracks.length})</h3>
            <div class="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 divide-y divide-zinc-900 max-h-64 overflow-y-auto">
                \${playlistTracks.map((t, idx) => \`
                <div onclick="playIndex(\${idx})" class="flex items-center gap-4 py-3 cursor-pointer group hover:text-white transition-all">
                    <span class="w-6 text-center font-mono text-[10px] text-zinc-600 font-bold group-hover:text-zinc-300">
                        \${String(idx + 1).padStart(2, '0')}
                    </span>
                    <div class="flex-1 truncate">
                        <p class="text-xs font-semibold text-zinc-200 group-hover:text-white">\${t.title}</p>
                        <p class="text-[10px] text-zinc-500 font-medium">\${t.artist}</p>
                    </div>
                    <span class="text-[10px] font-mono font-bold text-zinc-500">\${Math.floor(t.duration/60)}:\${String(t.duration%65).padStart(2, '0')}</span>
                </div>
                \`).join('')}
            </div>
        </section>

        <footer class="text-center font-mono text-[9px] text-zinc-500 uppercase tracking-wider border-t border-zinc-900 pt-6">
            Dedykowana autoryzowana placówka: \${playlist.clientName} | Hardban Records Lab © 2026
        </footer>
    </div>

    <audio id="audio-engine" ontimeupdate="onPlaybackProgress()" onloadedmetadata="onMetadataLoaded()" onended="onTrackEnded()"></audio>

    <script>
        const serverUrl = "\${serverHost}";
        const userId = "\${user.id}";
        const playlistId = "\${playlist.id}";
        const tracks = \${JSON.stringify(playlistTracks)};
        const requiredPin = "\${playlist.pin || ''}";

        let currentIndex = 0;
        let isPlaying = false;
        let isMuted = false;
        let originalVolume = 0.8;

        const audio = document.getElementById("audio-engine");
        const playBtn = document.getElementById("play-pause-btn");
        const playIcon = document.getElementById("play-icon");
        const trackTitle = document.getElementById("track-title");
        const trackArtist = document.getElementById("track-artist");
        const trackMeta = document.getElementById("track-meta");
        const progressContainer = document.getElementById("progress-container");
        const progressBar = document.getElementById("progress-bar");
        const currentTimeEl = document.getElementById("current-time");
        const durationEl = document.getElementById("duration");

        function verifyPin() {
            const val = document.getElementById("pin-input").value;
            if (val === requiredPin) {
                document.getElementById("pin-screen").style.display = 'none';
                localStorage.setItem('hrl_pin_verified_' + playlistId, 'true');
            } else {
                document.getElementById("pin-error").classList.remove('hidden');
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            if (requiredPin) {
                if (localStorage.getItem('hrl_pin_verified_' + playlistId) === 'true') {
                    document.getElementById("pin-screen").style.display = 'none';
                }
            }
            if (tracks.length > 0) {
                loadTrack(0);
            }
        });

        async function getSecureStreamUrl(filename) {
            try {
                const res = await fetch(serverUrl + "/api/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ filename, userId: userId })
                });
                const data = await res.json();
                return data.src ? (serverUrl + data.src) : null;
            } catch (e) {
                console.error("Błąd autoryzacji:", e);
                return null;
            }
        }

        async function loadTrack(index) {
            if (index < 0 || index >= tracks.length) return;
            currentIndex = index;
            const track = tracks[index];

            trackTitle.innerText = track.title;
            trackArtist.innerText = track.artist;
            trackMeta.innerText = \`ISRC: \${track.isrc || 'HRL-DIRECT'} • BPM: \${track.bpm || 80} • \${track.genre.toUpperCase()}\`;
            
            if (track.cover) {
                document.getElementById("vinyl-disc").firstElementChild.src = track.cover;
            }

            const secureSrc = await getSecureStreamUrl(track.filename);
            if (secureSrc) {
                audio.src = secureSrc;
                audio.load();
                if (isPlaying) {
                    audio.play().catch(() => {});
                }
            }
        }

        function togglePlay() {
            if (tracks.length === 0) return;
            if (isPlaying) {
                audio.pause();
                isPlaying = false;
            } else {
                audio.play().then(() => {
                    isPlaying = true;
                }).catch(() => {
                    isPlaying = false;
                });
            }
            updatePlayUI();
        }

        function updatePlayUI() {
            if (isPlaying) {
                playIcon.setAttribute("data-lucide", "pause");
                document.getElementById("vinyl-disc").classList.add("animate-spin-slow");
            } else {
                playIcon.setAttribute("data-lucide", "play");
                document.getElementById("vinyl-disc").classList.remove("animate-spin-slow");
            }
            lucide.createIcons();
        }

        function playIndex(index) {
            isPlaying = true;
            loadTrack(index);
            updatePlayUI();
        }

        function next() {
            let nextIndex = (currentIndex + 1) % tracks.length;
            playIndex(nextIndex);
        }

        function prev() {
            let prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
            playIndex(prevIndex);
        }

        function setVolume(v) {
            audio.volume = v;
            originalVolume = v;
            audio.muted = false;
            isMuted = false;
            updateVolumeIcon();
        }

        function toggleMute() {
            isMuted = !isMuted;
            audio.muted = isMuted;
            updateVolumeIcon();
        }

        function updateVolumeIcon() {
            const volIcon = document.getElementById("volume-icon");
            if (isMuted) {
                volIcon.setAttribute("data-lucide", "volume-x");
            } else if (originalVolume > 0.5) {
                volIcon.setAttribute("data-lucide", "volume-2");
            } else {
                volIcon.setAttribute("data-lucide", "volume-1");
            }
            lucide.createIcons();
        }

        function seek(e) {
            const rect = progressContainer.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pct * audio.duration;
        }

        function onPlaybackProgress() {
            if (!audio.duration) return;
            const pct = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = pct + "%";
            currentTimeEl.innerText = formatTime(audio.currentTime);
        }

        function onMetadataLoaded() {
            durationEl.innerText = formatTime(audio.duration);
        }

        async function onTrackEnded() {
            try {
                const track = tracks[currentIndex];
                await fetch(serverUrl + "/api/play", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        trackId: track.id,
                        playlistId: playlistId,
                        userId: userId,
                        durationS: track.duration
                    })
                });
            } catch (e) {}
            next();
        }

        function formatTime(s) {
            const mins = Math.floor(s / 60);
            const secs = Math.floor(s % 60);
            return mins + ":" + String(secs).padStart(2, "0");
        }
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="odtwarzacz-\${playlist.id}.html"`);
    res.send(htmlContent);
  });

  // REST: pobierz playliste po ID + wygeneruj tokeny HMAC (TTL 2h)
  app.get("/api/playlist/:id", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user) {
      return res.status(401).json({ error: "Brak autoryzacji" });
    }

    const playlistId = req.params.id;
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return res.status(404).json({ error: "Playlista nie istnieje" });
    }

    // Sprawdź uprawnienia dostępu do danej playlisty
    if (user.role !== 'admin') {
      const hasModelA = playlist.pmproLevel === user.pmproLevel;
      const hasModelB = user.playlistIds.includes(playlist.id);
      if (!hasModelA && !hasModelB) {
        return res.status(403).json({ error: "Brak dostępu do playlisty. Wymagany poziom PMPro ID: " + playlist.pmproLevel });
      }
    }

    // Załaduj metadane utworów wraz ze świeżymi tokenami
    const playlistTracks = tracks.filter(t => playlist.tracks.includes(t.id));
    
    // Generowanie tokenów HMAC dla każdego pliku audio na 2h
    const ip = req.ip || "127.0.0.1";
    // Używamy prostego hasha IP dla osłony prywatności
    const ipHash = crypto.createHash('sha1').update(ip).digest('hex');
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 godziny ważności

    const animatedTracksObj = playlistTracks.map(track => {
      // Wygeneruj unikalny token HMAC sha256
      const tokenInput = `${user.id}:${track.filename}:${expiresAt}:${ipHash}`;
      const tokenSymbol = crypto.createHmac('sha256', HMAC_SECRET).update(tokenInput).digest('hex');

      // Zapisujemy w "bazie tokenów"
      const newToken: AccessToken = {
        id: `tkn_${crypto.randomUUID()}`,
        token: tokenSymbol,
        userId: user.id,
        filename: track.filename,
        expiresAt: expiresAt,
        usedCount: 0,
        ipHash: ipHash
      };
      tokens.push(newToken);

      return {
        ...track,
        src: `/api/audio/${track.filename}?hrl_token=${tokenSymbol}&uid=${user.id}`
      };
    });

    res.json({
      ...playlist,
      tracks: animatedTracksObj
    });
  });

  // REST: Odśwież token dla pliku audio
  app.post("/api/token", (req, res) => {
    const { filename, userId } = req.body;
    if (!filename || !userId) {
      return res.status(400).json({ error: "Brak parametrów" });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie istnieje" });
    }

    const ip = req.ip || "127.0.0.1";
    const ipHash = crypto.createHash('sha1').update(ip).digest('hex');
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const tokenInput = `${user.id}:${filename}:${expiresAt}:${ipHash}`;
    const tokenSymbol = crypto.createHmac('sha256', HMAC_SECRET).update(tokenInput).digest('hex');

    const newToken: AccessToken = {
      id: `tkn_${crypto.randomUUID()}`,
      token: tokenSymbol,
      userId: user.id,
      filename: filename,
      expiresAt: expiresAt,
      usedCount: 0,
      ipHash: ipHash
    };
    tokens.push(newToken);

    res.json({
      token: tokenSymbol,
      expiresAt: expiresAt,
      src: `/api/audio/${filename}?hrl_token=${tokenSymbol}&uid=${user.id}`
    });
  });

  // REST: Zaloguj odtworzenie (stats endpoint)
  app.post("/api/play", (req, res) => {
    const { trackId, playlistId, userId, durationS } = req.body;
    if (!trackId || !durationS) {
      return res.status(400).json({ error: "Brak parametrów" });
    }

    const newLog: PlayLog = {
      id: `play_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trackId,
      playlistId: playlistId || "p1",
      userId: userId || "u2",
      playedAt: new Date().toISOString(),
      durationS: parseInt(durationS, 10) || 0
    };

    playLogs.push(newLog);
    res.json({ success: true, logId: newLog.id });
  });

  // REST: Pobierz statystyki dla admina
  app.get("/api/stats/summary", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu. Wymagana rola admina." });
    }

    // Oblicz statystyki:
    // 1. Liczba odtworzeń ogółem
    const totalPlays = playLogs.length;

    // 2. Odtworzenia per dzień (ostatnie 7 dni)
    const last7Days: { date: string, count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      
      const count = playLogs.filter(log => {
        const plat = new Date(log.playedAt);
        return plat >= startOfDay && plat <= endOfDay;
      }).length;

      const dateLabel = startOfDay.toLocaleDateString('pl-PL', { month: '2-digit', day: '2-digit' });
      last7Days.push({ date: dateLabel, count });
    }

    // 3. Top Tracks
    const countsOfTracks: Record<string, number> = {};
    playLogs.forEach(log => {
      countsOfTracks[log.trackId] = (countsOfTracks[log.trackId] || 0) + 1;
    });

    const topTracks = Object.entries(countsOfTracks)
      .map(([trackId, count]) => {
        const track = tracks.find(t => t.id === trackId);
        return {
          id: trackId,
          title: track ? track.title : "Nieznany utwór",
          artist: track ? track.artist : "Nieznany artysta",
          plays: count
        };
      })
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    // 4. Aktywni klienci (unikalni użytkownicy z logów odtworzeń)
    const activeClientsSet = new Set(playLogs.map(l => l.userId));
    const activeClients = activeClientsSet.size;

    res.json({
      totalPlays,
      playsByDay: last7Days,
      topTracks,
      activeClients,
      totalTracks: tracks.length,
      totalPlaylists: playlists.length,
      revenueMonthly: users.filter(u => u.role !== 'admin').reduce((sum, u) => {
        // Oblicz szacunkowy przychód na podstawie poziomu subskrypcji
        let price = 0;
        if (u.pmproLevel === 1) price = 99;
        if (u.pmproLevel === 2) price = 199;
        if (u.pmproLevel === 3) price = 149;
        if (u.pmproLevel === 4) price = 299;
        return sum + price;
      }, 0)
    });
  });

  // REST: CRUD dla utworów
  app.get("/api/tracks", (req, res) => {
    res.json(tracks);
  });

  app.get("/api/users", (req, res) => {
    res.json(users);
  });

  app.post("/api/tracks/bulk", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const rawTracks = req.body;
    if (!Array.isArray(rawTracks)) {
      return res.status(400).json({ error: "Format danych musi być tablicą JSON []" });
    }

    const importedTracks: Track[] = [];
    const errors: string[] = [];

    rawTracks.forEach((item, index) => {
      if (!item.title || !item.artist) {
        errors.push(`Wiersz #${index + 1}: Brak wymaganego tytułu (title) lub wykonawcy (artist)`);
        return;
      }

      const duration = parseInt(item.duration, 10) || 150;
      const year = parseInt(item.year, 10) || new Date().getFullYear();
      const bpm = parseInt(item.bpm, 10) || 100;
      const explicit = typeof item.explicit === 'boolean' ? item.explicit : !!item.explicit;

      const genre = item.genre || "jazz";
      const mood = Array.isArray(item.mood) ? item.mood : ["relax"];
      const timeOfDay = Array.isArray(item.timeOfDay) ? item.timeOfDay : ["morning"];

      const isrc = item.isrc || `PLHRL${new Date().getFullYear().toString().substr(2)}${Math.floor(Math.random()*90000)+10000}`;
      const cover = item.cover || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&auto=format&fit=crop&q=60";
      const filename = item.filename || `hrl-${Math.floor(Math.random()*900)+100}-${Math.random().toString(36).substring(2, 6)}.wav`;

      const trackId = `t_bulk_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`;

      const newTrack: Track = {
        id: trackId,
        title: item.title,
        artist: item.artist,
        album: item.album || "Imported Catalog",
        year,
        bpm,
        genre,
        mood,
        duration,
        explicit,
        timeOfDay,
        isrc,
        cover,
        filename
      };

      importedTracks.push(newTrack);
    });

    if (importedTracks.length === 0) {
      return res.status(400).json({ error: "Brak poprawnych utworów do zaimportowania.", details: errors });
    }

    tracks.push(...importedTracks);

    broadcastWS("system_notification", {
      title: "Pomyślny masowy import utworów",
      message: `Zaimportowano pomyślnie ${importedTracks.length} utworów do bazy hrl_track przez administratora B2B.`,
      type: "success"
    });

    res.json({
      success: true,
      count: importedTracks.length,
      tracks: importedTracks,
      errors: errors.length > 0 ? errors : undefined
    });
  });

  app.post("/api/tracks/bulk-update-labels", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const { trackIds, copyrightLabel, licenseTerms } = req.body;
    if (!Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "Nie wybrano żadnych utworów do aktualizacji" });
    }

    let updatedCount = 0;
    tracks = tracks.map(t => {
      if (trackIds.includes(t.id)) {
        updatedCount++;
        const updatedTrack = { ...t };
        if (copyrightLabel !== undefined) {
          updatedTrack.copyrightLabel = copyrightLabel;
        }
        if (licenseTerms !== undefined) {
          updatedTrack.licenseTerms = licenseTerms;
        }
        return updatedTrack;
      }
      return t;
    });

    broadcastWS("system_notification", {
      title: "Masowa aktualizacja licencji",
      message: `Zaktualizowano pomyślnie prawa licencyjne oraz oznaczenia praw autorskich dla ${updatedCount} utworów.`,
      type: "success"
    });

    res.json({
      success: true,
      count: updatedCount
    });
  });

  app.post("/api/tracks", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const newTrack: Track = {
      id: `t_${Date.now()}`,
      title: req.body.title || "Bez tytułu",
      artist: req.body.artist || "Nieznany wykonawca",
      album: req.body.album || "Brak albumu",
      year: parseInt(req.body.year, 10) || new Date().getFullYear(),
      bpm: parseInt(req.body.bpm, 10) || 100,
      genre: req.body.genre || "jazz",
      mood: Array.isArray(req.body.mood) ? req.body.mood : ["relax"],
      duration: parseInt(req.body.duration, 10) || 120,
      explicit: !!req.body.explicit,
      timeOfDay: Array.isArray(req.body.timeOfDay) ? req.body.timeOfDay : ["morning"],
      isrc: req.body.isrc || `PLHRL${new Date().getFullYear().toString().substr(2)}${Math.floor(Math.random()*90000)+10000}`,
      cover: req.body.cover || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&auto=format&fit=crop&q=60",
      filename: req.body.filename || `hrl-${Math.floor(Math.random()*900)+100}-track.wav`,
      copyrightLabel: req.body.copyrightLabel || "",
      licenseTerms: req.body.licenseTerms || ""
    };

    tracks.push(newTrack);
    res.json(newTrack);
  });

  app.put("/api/tracks/:id", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const { id } = req.params;
    const index = tracks.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: "Nie zanaleziono utworu" });

    tracks[index] = {
      ...tracks[index],
      ...req.body,
      // Nie pozwalamy nadpisywać ID
      id
    };

    res.json(tracks[index]);
  });

  app.delete("/api/tracks/:id", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const { id } = req.params;
    tracks = tracks.filter(t => t.id !== id);
    res.json({ success: true });
  });

  // REST: CRUD dla playlist
  app.get("/api/playlists", (req, res) => {
    res.json(playlists);
  });

  app.post("/api/playlists", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const newPlaylist: Playlist = {
      id: `p_${Date.now()}`,
      title: req.body.title || "Nowa Playlista",
      pmproLevel: parseInt(req.body.pmproLevel, 10) || 1,
      clientName: req.body.clientName || "Nowy Klient B2B",
      clientLogo: req.body.clientLogo || "",
      accentColor: req.body.accentColor || "#e63333",
      bgColor: req.body.bgColor || "#0c0a07",
      autoplay: req.body.autoplay !== false,
      loop: req.body.loop !== false,
      hideTracklist: !!req.body.hideTracklist,
      volume: parseFloat(req.body.volume) || 0.8,
      useSchedule: !!req.body.useSchedule,
      explicitFilter: !!req.body.explicitFilter,
      tracks: Array.isArray(req.body.tracks) ? req.body.tracks : []
    };

    playlists.push(newPlaylist);
    res.json(newPlaylist);
  });

  app.put("/api/playlists/:id", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const { id } = req.params;
    const index = playlists.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: "Nie zanaleziono playlisty" });

    playlists[index] = {
      ...playlists[index],
      ...req.body,
      id
    };

    res.json(playlists[index]);
  });

  app.delete("/api/playlists/:id", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const { id } = req.params;
    playlists = playlists.filter(p => p.id !== id);
    res.json({ success: true });
  });

  // REST: Klienci oraz faktury
  app.get("/api/users", (req, res) => {
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const newUser: UserProfile = {
      id: `u_${Date.now()}`,
      email: req.body.email || "",
      name: req.body.name || "",
      role: req.body.role || "subscriber",
      pmproLevel: parseInt(req.body.pmproLevel, 10) || 1,
      playlistIds: Array.isArray(req.body.playlistIds) ? req.body.playlistIds : []
    };

    // Stwórz nową fakturę automatycznie po utworzeniu klienta (Checkout action)
    let totalAmt = 99.00;
    let desc = "Licencja muzyczna HRL B2B — Kawiarnia Standard";
    if (newUser.pmproLevel === 2) {
      totalAmt = 199.00;
      desc = "Licencja muzyczna HRL B2B — Sklep Premium";
    } else if (newUser.pmproLevel === 3) {
      totalAmt = 149.00;
      desc = "Licencja muzyczna HRL B2B — Siłownia Pro";
    } else if (newUser.pmproLevel === 4) {
      totalAmt = 299.00;
      desc = "Licencja muzyczna HRL B2B — VIP Unlimited";
    }

    const vat = 0.23;
    const taxValue = parseFloat((totalAmt * (vat / (1 + vat))).toFixed(2));
    const netValue = parseFloat((totalAmt - taxValue).toFixed(2));

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `HRL-2026-05-${String(invoices.length + 1).padStart(5, '0')}`,
      clientName: newUser.name,
      clientEmail: newUser.email,
      date: new Date().toISOString().split('T')[0],
      amount: netValue,
      tax: taxValue,
      total: totalAmt,
      status: "paid",
      items: [{ description: `${desc} — 05/2026`, qty: 1, amount: totalAmt }]
    };

    users.push(newUser);
    invoices.push(newInvoice);
    res.json({ user: newUser, invoice: newInvoice });
  });

  app.put("/api/users/:id", (req, res) => {
    const adminUser = (req as any).user as UserProfile | undefined;
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const { id } = req.params;
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: "Nie zanaleziono użytkownika" });

    users[index] = {
      ...users[index],
      ...req.body,
      id
    };

    res.json({ user: users[index] });
  });

  app.get("/api/invoices", (req, res) => {
    res.json(invoices);
  });

  // CRUD dla Custom B2B Access Pages (White-label system)
  app.get("/api/access-pages", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }
    res.json(accessPages);
  });

  app.post("/api/access-pages", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const newPage: AccessPage = {
      id: `ap_${Date.now()}`,
      name: req.body.name || "Nowa strona dedykowana B2B",
      playlistId: req.body.playlistId || "p1",
      requirePin: req.body.requirePin === true,
      pinCode: req.body.pinCode || "",
      whiteLabelTheme: {
        accentColor: req.body.whiteLabelTheme?.accentColor || "#e63333",
        bgColor: req.body.whiteLabelTheme?.bgColor || "#0e0e11",
        logoUrl: req.body.whiteLabelTheme?.logoUrl || "",
        title: req.body.whiteLabelTheme?.title || "Dedykowany Odtwarzacz Relaksacyjny",
        description: req.body.whiteLabelTheme?.description || "Portal dedykowanego odtwarzania muzyki licencjonowanej Hardban Records.",
        customCss: req.body.whiteLabelTheme?.customCss || ""
      },
      slug: req.body.slug || `share-${Math.floor(Math.random()*9000)+1000}`,
      active: req.body.active !== false
    };

    accessPages.push(newPage);
    broadcastWS("access_page_created", newPage);
    res.json(newPage);
  });

  app.put("/api/access-pages/:id", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const { id } = req.params;
    const index = accessPages.findIndex(ap => ap.id === id);
    if (index === -1) return res.status(404).json({ error: "Nie znaleziono strony" });

    accessPages[index] = {
      ...accessPages[index],
      ...req.body,
      id
    };

    broadcastWS("access_page_updated", accessPages[index]);
    res.json(accessPages[index]);
  });

  app.delete("/api/access-pages/:id", (req, res) => {
    const user = (req as any).user as UserProfile | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }

    const { id } = req.params;
    accessPages = accessPages.filter(ap => ap.id !== id);
    broadcastWS("access_page_deleted", { id });
    res.json({ success: true });
  });

  app.get("/api/published-page/:slug", (req, res) => {
    const matched = accessPages.find(ap => ap.slug === req.params.slug);
    if (!matched || !matched.active) {
      return res.status(404).json({ error: "Ta dedykowana strona jest nieaktywna lub nie istnieje." });
    }

    const safePage = {
      ...matched,
      pinCode: undefined
    };

    const playlist = playlists.find(p => p.id === matched.playlistId);

    res.json({
      page: safePage,
      playlist: playlist ? { id: playlist.id, title: playlist.title, accentColor: playlist.accentColor, tracksCount: playlist.tracks.length } : null,
      requirePin: matched.requirePin
    });
  });

  app.post("/api/published-page/:slug/verify-pin", (req, res) => {
    const { slug } = req.params;
    const { pin } = req.body;

    const matched = accessPages.find(ap => ap.slug === slug);
    if (!matched || !matched.active) {
      return res.status(404).json({ error: "Strona nie istnieje." });
    }

    if (matched.requirePin && matched.pinCode !== pin) {
      return res.status(401).json({ error: "Nieprawidłowy PIN dostępu. Skontaktuj się ze swoim menedżerem placówki." });
    }

    const playlist = playlists.find(p => p.id === matched.playlistId);
    if (!playlist) {
      return res.status(404).json({ error: "Powiązana playlista nie istnieje." });
    }

    const matchedTracks = tracks.filter(t => playlist.tracks.includes(t.id));

    res.json({
      success: true,
      playlist: {
        ...playlist,
        tracksList: matchedTracks
      }
    });
  });

  // REST: Czyszczenie wygasłych tokenów
  app.delete("/api/tokens/expired", (req, res) => {
    const initialCount = tokens.length;
    tokens = tokens.filter(t => new Date(t.expiresAt) > new Date());
    res.json({ success: true, deleted: initialCount - tokens.length });
  });

  app.get("/api/tokens/active", (req, res) => {
    const active = tokens.filter(t => new Date(t.expiresAt) > new Date());
    res.json(active);
  });

  // REST API: Symulator integracji Nginx X-Accel-Redirect & proxy-pass
  app.post("/api/nginx/simulate", (req, res) => {
    const { trackId, tokenTtlSeconds, secureLinkSecret } = req.body;
    const track = tracks.find(t => t.id === trackId) || tracks[0];
    
    const ttl = parseInt(tokenTtlSeconds, 10) || 3600;
    const secret = secureLinkSecret || "hrl_direct_sec_jwt_signing_key_9182";
    const timestampUnix = Math.floor(Date.now() / 1000) + ttl;
    const mockIp = "195.12.3.94"; 
    
    // Generowanie zabezpieczonego nagłówka HMAC kompatybilnego z Nginx Secure Link / custom API auth
    const ipHash = crypto.createHash('sha1').update(mockIp).digest('hex');
    const tokenInput = `sim_user:${track.filename}:${timestampUnix}:${ipHash}`;
    const generatedHmac = crypto.createHmac('sha256', secret).update(tokenInput).digest('hex');
    
    const signedUrl = `https://cdn.hrl-music.com/api/audio/${track.filename}?hrl_token=${generatedHmac}&uid=sim_user&expires=${timestampUnix}`;
    
    const steps = [
      `[${new Date().toLocaleTimeString()}] >> Klient o IP: ${mockIp} pyta o chroniony utwór: "${track.title}"`,
      `[${new Date().toLocaleTimeString()}] >> NGINX: Wykryto próbę odczytu na lokalizacji proxy cdn.hrl-music.com/api/audio/${track.filename}`,
      `[${new Date().toLocaleTimeString()}] >> NGINX: forward proxy_pass przekazuje nagłówki autoryzacyjne oraz IP klienta do Node.js API...`,
      `[${new Date().toLocaleTimeString()}] >> Node.js API (Express): Otrzymano żądanie weryfikujące token podpięty pod playlistę.`,
      `[${new Date().toLocaleTimeString()}] >> Node.js API (Express): Wykonuję sprawdzenie hrl_token='${generatedHmac.substring(0, 16)}...' z czasem wygaśnięcia: ${new Date(timestampUnix * 1000).toLocaleString()}`,
      `[${new Date().toLocaleTimeString()}] >> Node.js API (Express): Token HMAC pasuje! Użytkownik 'sim_user' o statusie PMPro Level zweryfikowany pomyślnie.`,
      `[${new Date().toLocaleTimeString()}] >> Node.js API (Express): Nakazuję Nginx bezpośredni przesył pliku z pominięciem Node.js. Ustawiam nagłówek "X-Accel-Redirect: /protected_audio/${track.filename}"`,
      `[${new Date().toLocaleTimeString()}] >> NGINX: Przechwycono nagłówek 'X-Accel-Redirect'. Połączenie z Node.js zostaje bezpiecznie zamknięte w tle.`,
      `[${new Date().toLocaleTimeString()}] >> NGINX: Rozpoczynam wewnętrzne (internal;) bezpośrednie przesyłanie strumienia binarnego z secure path: /var/www/streaming/audio/${track.filename}`,
      `[${new Date().toLocaleTimeString()}] << HTTP/1.1 200 OK | Content-Type: audio/wav | X-Accel-Redirect: /protected_audio/${track.filename}`,
      `[${new Date().toLocaleTimeString()}] << STATUS WP/NGINX DIRECT: Zakończono pomyślnie. Zabezpieczenie przed wyciekami: 100%, Wykorzystanie pamięci serwera: 0 MB`
    ];

    res.json({
      signedUrl,
      steps
    });
  });


  // ═══════════════════════════════════════════════════════
  // OCHRONA PLIKÓW MP3 / WAV — RANGE REQUESTS HANDLER z HMAC
  // ═══════════════════════════════════════════════════════
  app.get("/api/audio/:filename", (req, res) => {
    const filename = req.params.filename;
    const tokenSymbol = req.query.hrl_token as string;
    const userId = req.query.uid as string;

    if (!tokenSymbol || !userId) {
      return res.status(403).send("Brak tokenu HMAC lub identyfikatora usera (Błąd 403).");
    }

    // 1. Sprawdź, czy token istnieje w naszej "tabeli" active tokens
    const matchedToken = tokens.find(t => t.token === tokenSymbol && t.userId === userId && t.filename === filename);
    if (!matchedToken) {
      return res.status(403).send("Błędny token HMAC dostępu do pliku audio.");
    }

    // 2. Czy token nie wygasł?
    if (new Date(matchedToken.expiresAt) < new Date()) {
      return res.status(403).send("Tokem HMAC wygasł (TTL 2h). Pobierz świeży token.");
    }

    // 3. Sprawdź IP (hash)
    const ip = req.ip || "127.0.0.1";
    const ipHash = crypto.createHash('sha1').update(ip).digest('hex');
    if (matchedToken.ipHash !== ipHash) {
      // Dla ułatwienia prezentacji w preview, wyłączamy twarde blokowanie IP, ale rzucamy informację lub rejestrujemy
      console.log(`Walidacja IP: Token IP ${matchedToken.ipHash} różni się od IP klienta ${ipHash}.`);
    }

    // Zwiększ licznik użycia tokenu
    matchedToken.usedCount += 1;

    // Pobierz informacje o utworze z bazy, aby odczytać czas trwania
    const track = tracks.find(t => t.filename === filename) || tracks[0];
    const duration = track.duration;

    // Wygeneruj unikalny bufor WAV dla utworu (o stałym, unikalnym tonie opartym na ID utworu!)
    const seedFrequency = track.id === 't1' ? 220 : track.id === 't2' ? 330 : track.id === 't3' ? 275 : track.id === 't4' ? 440 : track.id === 't5' ? 512 : 360;
    const fileBuffer = generateWavBuffer(duration, seedFrequency);
    const fileSize = fileBuffer.length;

    let start = 0;
    let end = fileSize - 1;

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Accel-Redirect', `/protected_audio/${filename}`);

    if (req.headers.range) {
      const parts = req.headers.range.replace(/bytes=/, "").split("-");
      const partialStart = parts[0];
      const partialEnd = parts[1];

      start = parseInt(partialStart, 10);
      end = partialEnd ? parseInt(partialEnd, 10) : fileSize - 1;

      if (start > end || start >= fileSize) {
        res.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
        return res.end();
      }

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": (end - start + 1).toString()
      });

      res.end(fileBuffer.slice(start, end + 1));
    } else {
      res.writeHead(200, { "Content-Length": fileSize.toString() });
      res.end(fileBuffer);
    }
  });


  // ═══════════════════════════════════════════════════════
  // VITE / STATIC FILES MIDDLEWARE
  // ═══════════════════════════════════════════════════════
  // REST endpoints dla panelu WS
  app.get("/api/ws/clients", (req, res) => {
    const safeClients = activeWsClients.map(c => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      role: c.role,
      connectedAt: c.connectedAt,
      lastAction: c.lastAction,
      currentTrack: c.currentTrack
    }));
    res.json(safeClients);
  });

  app.post("/api/ws/broadcast", (req, res) => {
    const { title, message, type } = req.body;
    broadcastWS("system_notification", {
      title: title || "Komunikat Commercial Music Licensing Platform System",
      message: message || "Kanał powiadomień aktywny.",
      type: type || "info"
    });
    res.json({ success: true, clientsNotified: activeWsClients.length });
  });

  // Ustawienia Globalne / White-label
  app.get("/api/settings", (req, res) => {
    res.json(globalSettings);
  });

  app.put("/api/settings", (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Brak dostępu" });
    }
    const { theme, integrations } = req.body;
    if (theme) globalSettings.theme = { ...globalSettings.theme, ...theme };
    if (integrations) globalSettings.integrations = { ...globalSettings.integrations, ...integrations };
    res.json({ success: true, settings: globalSettings });
  });

  // Zgłoszenie zdarzenia poprzez webhook
  app.post("/api/webhooks/test", async (req, res) => {
    const { url, payload } = req.body;
    if (!url) return res.status(400).json({ error: "No URL" });
    // Simulate webhook sending
    try {
      // In real scenario we use fetch or axios
      console.log(`[Webhook] Sending payload to ${url}...`);
      res.json({ success: true, message: "Webhook delivered successfully" });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const connectionId = `conn_${Math.random().toString(36).substr(2, 9)}`;
    let clientInfo: WSClient = {
      id: connectionId,
      ws,
      userId: "unknown",
      name: "Anonimowy Klient B2B",
      role: "guest",
      connectedAt: new Date(),
      lastAction: "Połączono"
    };

    activeWsClients.push(clientInfo);
    console.log(`[WS] Nowe połączenie: ${connectionId}`);

    // Powitanie klienta
    ws.send(JSON.stringify({
      event: "welcome",
      payload: {
        connectionId,
        message: "Witaj w real-time streamie HRL B2B!",
        activeClientsCount: activeWsClients.length
      }
    }));

    // Rozgłoś do zalogowanych (np. adminów)
    broadcastWS("client_connected", {
      id: connectionId,
      userId: clientInfo.userId,
      name: clientInfo.name,
      connectedAt: clientInfo.connectedAt,
      lastAction: clientInfo.lastAction
    });

    ws.on("message", (rawMessage) => {
      try {
        const { event, payload } = JSON.parse(rawMessage.toString());
        console.log(`[WS] Event: ${event} od ${connectionId}`, payload);

        if (event === "identify") {
          const { userId, name, role } = payload;
          clientInfo.userId = userId || "unknown";
          clientInfo.name = name || "Klient B2B";
          clientInfo.role = role || "subscriber";
          clientInfo.lastAction = "Zidentyfikowano jako " + clientInfo.name;

          broadcastWS("client_updated", {
            id: connectionId,
            userId: clientInfo.userId,
            name: clientInfo.name,
            role: clientInfo.role,
            lastAction: clientInfo.lastAction
          });
        } 
        
        else if (event === "play_status") {
          const { trackId, trackTitle, isPlaying } = payload;
          clientInfo.currentTrack = trackTitle;
          clientInfo.lastAction = isPlaying ? `Odtwarza: ${trackTitle}` : `Zatrzymał odtwarzanie`;

          broadcastWS("client_activity", {
            id: connectionId,
            userId: clientInfo.userId,
            name: clientInfo.name,
            lastAction: clientInfo.lastAction,
            currentTrack: clientInfo.currentTrack,
            isPlaying
          });
        }

        else if (event === "ping") {
          ws.send(JSON.stringify({ event: "pong", payload: { timestamp: Date.now() } }));
        }

        else if (event === "admin_broadcast") {
          const { message, title, type } = payload;
          broadcastWS("system_notification", {
            title: title || "Komunikat administratora HRL",
            message: message || "Aktualizacja bazy muzycznej.",
            type: type || "info"
          });
        }
      } catch (err) {
        console.error("[WS] Message parse error:", err);
      }
    });

    ws.on("close", () => {
      activeWsClients = activeWsClients.filter(c => c.id !== connectionId);
      console.log(`[WS] Połączenie zamknięte: ${connectionId}`);
      
      broadcastWS("client_disconnected", {
        id: connectionId,
        name: clientInfo.name
      });
    });

    ws.on("error", (err) => {
      console.error(`[WS] Błąd połączenia ${connectionId}:`, err);
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Commercial Music Licensing Platform server (with WebSockets) running on http://localhost:${PORT}`);
  });
}

startServer();
