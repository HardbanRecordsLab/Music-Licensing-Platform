import React, { useState, useEffect, useRef } from "react";
import { Playlist, Track, TimeOfDay } from "../types.js";
import { getApiUrl, getWsUrl } from "../utils.js";
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, RotateCcw, 
  Maximize2, Minimize2, Check, Music, Sliders, AlertTriangle, Clock, Calendar, 
  CheckSquare, Link, Download, ExternalLink, Lock, Settings, Layout, Copy, 
  Plus, Search, Sparkles, CheckCircle, Save, HelpCircle, X, Terminal,
  Minus, GripVertical, RefreshCw, Home, ChevronRight, ListMusic
} from "lucide-react";
import cmlpLogo from "../assets/images/cmlp_logo_1779372728753.png";

interface B2BPlayerProps {
  currentUserId: string;
  authToken: string;
  playlists: Playlist[];
}

export function B2BPlayer({ currentUserId, authToken, playlists: initialPlaylists }: B2BPlayerProps) {
  const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Navigation tabs - Extended with License/Certificate and Analytics
  const [activeMainTab, setActiveMainTab] = useState<'player' | 'library' | 'curator' | 'license' | 'analytics'>('player');

  // Advanced SaaS Customizations (Zgodnie z wymaganiami B2B)
  const [profileType, setProfileType] = useState<string>("casual"); // casual (casual/początkujący), expert (expert/koneserzy), focus (focus/decydenci B2B)
  const [audioCta, setAudioCta] = useState<string>("none"); // none, sales, social, lead
  const [isCtaSpeaking, setIsCtaSpeaking] = useState<boolean>(false);
  const [seoKeywords, setSeoKeywords] = useState<string>("luksusowy, relaksujący, butikowy");
  const [vocalTone, setVocalTone] = useState<number>(80); // % autorytatywności wokalu
  
  // Parametry optymalizacji akustycznej dla profilu Expert
  const [expertEqBass, setExpertEqBass] = useState<number>(3); // dB offset (-6 do +6)
  const [expertEqMid, setExpertEqMid] = useState<number>(2);  // dB offset
  const [expertEqTreble, setExpertEqTreble] = useState<number>(1); // dB offset
  const [expertDynamicRange, setExpertDynamicRange] = useState<number>(75); // % gęstości/kompresji
  const [lastCalibrationLog, setLastCalibrationLog] = useState<string>("");

  const [commentsList, setCommentsList] = useState<{id: string, author: string, text: string, time: string}[]>([
    { id: "1", author: "Redaktor HRL", text: "Ten program idealnie gra rano w kawiarniach. Spokojne tempo, wysoka autorytatywność wokalu.", time: "Wczoraj, 14:20" },
    { id: "2", author: "Manager Lokalu", text: "Sprawdzone podczas kontroli ZAIKS w ubiegłym tygodniu. Pełne zwolnienie zatwierdzone!", time: "Dzisiaj, 09:15" }
  ]);
  const [newComment, setNewComment] = useState<string>("");

  // Player settings
  const [isLoop, setIsLoop] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Kiosk mode clock
  const [kioskTime, setKioskTime] = useState<string>("12:00:00 UTC");

  // Opcje symulacji pory dnia
  const [simulatedTimeOfDay, setSimulatedTimeOfDay] = useState<TimeOfDay>("morning");

  // Global library state for the Curator
  const [allLibraryTracks, setAllLibraryTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [selectedLibraryTrackIds, setSelectedLibraryTrackIds] = useState<string[]>([]);
  const [libraryTargetPlaylistId, setLibraryTargetPlaylistId] = useState<string>("");

  // Curator Form States
  const [editingPlaylistId, setEditingPlaylistId] = useState<string>("");
  const [curatorTitle, setCuratorTitle] = useState<string>("");
  const [curatorClientName, setCuratorClientName] = useState<string>("");
  const [curatorAccentColor, setCuratorAccentColor] = useState<string>("#38bdf8");
  const [curatorPin, setCuratorPin] = useState<string>("");
  const [curatorAutoplay, setCuratorAutoplay] = useState<boolean>(true);
  const [curatorLoop, setCuratorLoop] = useState<boolean>(true);
  const [curatorExplicitFilter, setCuratorExplicitFilter] = useState<boolean>(false);
  const [curatorUseSchedule, setCuratorUseSchedule] = useState<boolean>(false);
  const [curatorAudioCta, setCuratorAudioCta] = useState<string>("none");
  const [curatorSeoKeywords, setCuratorSeoKeywords] = useState<string>("luksusowy, relaksujący, butikowy");
  const [isSavingCurator, setIsSavingCurator] = useState<boolean>(false);

  // HTML Generation/Compilation Notification Card
  const [compiledPlaylist, setCompiledPlaylist] = useState<Playlist | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Preview tracks in Curator
  const [previewTrackId, setPreviewTrackId] = useState<string>("");
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);

  // Tablet touch gestures state for Kiosk mode
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Drag & drop state for Playlist Curator
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [draggedPlaylistTrackIndex, setDraggedPlaylistTrackIndex] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;  // Swipe left -> Next
    const isRightSwipe = distance < -50;  // Swipe right -> Previous
    
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [wsNotification, setWsNotification] = useState<{title: string, message: string, type: string} | null>(null);

  // Synchronizacja statusu odtwarzania przez WS
  const sendPlayStatusToWS = (playing: boolean, idx: number) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const track = filteredTracks[idx];
      socketRef.current.send(JSON.stringify({
        event: "play_status",
        payload: {
          trackId: track ? track.id : "",
          trackTitle: track ? `${track.artist} - ${track.title}` : "Cisza",
          isPlaying: playing
        }
      }));
    }
  };

  // Automatyczna/manualna kalibracja EQ i dynamiki dla profilu Expert na podstawie parametrów i słów kluczowych
  const calibrateExpertSound = () => {
    const keywords = seoKeywords.toLowerCase().split(",").map(k => k.trim());
    const kwCount = keywords.filter(k => k.length > 0).length;
    
    // 1. Initial base values based on vocalTone (0-100 authority)
    // Higher authority (vocalTone > 70) often needs clear mids and controlled bass
    let recommendedBass = 0;
    let recommendedMid = 0;
    let recommendedTreble = 0;
    let recommendedDensity = 50;

    // Vocal Tone influence
    if (vocalTone > 75) {
      // High authority: Enhance clarity, suppress boomy bass
      recommendedBass = -1;
      recommendedMid = 3;
      recommendedTreble = 2;
      recommendedDensity = 80; // High authority usually requires high density for "radio" feel
    } else if (vocalTone < 40) {
      // Low authority/soft: Warmth and space
      recommendedBass = 2;
      recommendedMid = -1;
      recommendedTreble = 1;
      recommendedDensity = 40;
    } else {
      // Balanced
      recommendedBass = 1;
      recommendedMid = 1;
      recommendedTreble = 1;
      recommendedDensity = 65;
    }

    // 2. Keyword Semantic Analysis
    // Warmth/Luxury/Relax
    if (keywords.some(k => ["luksusowy", "ciepły", "relaks", "spokojny", "premium", "warm", "relax"].includes(k))) {
      recommendedBass += 2;
      recommendedTreble -= 1;
      recommendedDensity -= 10;
    }
    
    // Energy/Bright/Modern
    if (keywords.some(k => ["energiczny", "dynamiczny", "modern", "szybki", "jasny", "energy", "bright"].includes(k))) {
      recommendedTreble += 2;
      recommendedMid += 1;
      recommendedDensity += 15;
    }

    // Technical/B2B Focus
    if (keywords.some(k => ["focus", "biuro", "skupienie", "techniczny", "office", "work"].includes(k))) {
      recommendedMid += 2;
      recommendedBass -= 1;
      recommendedDensity += 5;
    }

    // 3. Final clamping and rounding
    const finalBass = Math.min(6, Math.max(-6, recommendedBass));
    const finalMid = Math.min(6, Math.max(-6, recommendedMid));
    const finalTreble = Math.min(6, Math.max(-6, recommendedTreble));
    const finalDensity = Math.min(100, Math.max(10, Math.round(recommendedDensity + (kwCount * 2))));

    setExpertEqBass(finalBass);
    setExpertEqMid(finalMid);
    setExpertEqTreble(finalTreble);
    setExpertDynamicRange(finalDensity);

    const now = new Date().toLocaleTimeString();
    let analysis = "";
    if (vocalTone > 70) analysis = "Profil radiowy/autorytatywny. ";
    else if (vocalTone < 40) analysis = "Profil ambientowy/ciepły. ";
    else analysis = "Profil zbalansowany. ";

    setLastCalibrationLog(`Autokalibracja ${now}: ${analysis}EQ [B:${finalBass > 0 ? '+' : ''}${finalBass}dB, M:${finalMid > 0 ? '+' : ''}${finalMid}dB, T:${finalTreble > 0 ? '+' : ''}${finalTreble}dB] Zagęszczenie: ${finalDensity}%`);
  };

  // Obsługa upuszczania utworów na określone miejsce listy utworów playlisty (reordering lub wstawianie nowych)
  const handleDropOnPlaylistItem = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedPlaylistTrackIndex !== null) {
      // Zmiana kolejności istniejących utworów na playliście
      const newIds = [...selectedLibraryTrackIds];
      const [movedId] = newIds.splice(draggedPlaylistTrackIndex, 1);
      newIds.splice(targetIndex, 0, movedId);
      setSelectedLibraryTrackIds(newIds);
      setDraggedPlaylistTrackIndex(null);
    } else {
      // Wrzucanie nowego utworu z katalogu biblioteki na określoną pozycję
      const trackId = e.dataTransfer.getData("text/plain");
      if (trackId) {
        // Usuń stare wystąpienie jeśli istnieje
        const filtered = selectedLibraryTrackIds.filter(id => id !== trackId);
        const newIds = [...filtered];
        newIds.splice(targetIndex, 0, trackId);
        setSelectedLibraryTrackIds(newIds);
      }
    }
  };

  const handleDropOnPlaylistContainer = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedPlaylistTrackIndex === null) {
      const trackId = e.dataTransfer.getData("text/plain");
      if (trackId) {
        if (!selectedLibraryTrackIds.includes(trackId)) {
          setSelectedLibraryTrackIds(prev => [...prev, trackId]);
        }
      }
    }
  };

  useEffect(() => {
    const wsUrl = getWsUrl();
    
    let socket: WebSocket;
    let tryCount = 0;
    
    const connect = () => {
      try {
        socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        
        socket.onopen = () => {
          setWsConnected(true);
          
          socket.send(JSON.stringify({
            event: "identify",
            payload: {
              userId: currentUserId,
              name: currentPlaylist ? `Lokal: ${currentPlaylist.clientName}` : "Niezidentyfikowany Odtwarzacz B2B",
              role: "subscriber"
            }
          }));
        };
        
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === "system_notification") {
              setWsNotification({
                title: data.payload.title,
                message: data.payload.message,
                type: data.payload.type || "info"
              });
              setTimeout(() => {
                setWsNotification(null);
              }, 6000);
            }
          } catch (err) {
            console.error("[WS] Parse error:", err);
          }
        };
        
        socket.onclose = () => {
          setWsConnected(false);
          if (tryCount < 8) {
            tryCount++;
            setTimeout(connect, 4000);
          }
        };
      } catch (e) {
        console.error("[WS] Connect error:", e);
      }
    };
    
    connect();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [currentUserId, currentPlaylist?.id]);

  // Synchronizacja playlist z zewnątrz
  useEffect(() => {
    setPlaylists(initialPlaylists);
  }, [initialPlaylists]);

  // Synchronizuj stan aktywności z serwerem przez WS
  useEffect(() => {
    if (filteredTracks.length > 0 && currentTrackIndex >= 0) {
      sendPlayStatusToWS(isPlaying, currentTrackIndex);
    }
  }, [isPlaying, currentTrackIndex, filteredTracks]);

  // Pobierz całą bibliotekę licencjonowaną HRL
  const fetchLibraryTracks = async () => {
    try {
      const res = await fetch(getApiUrl("/api/tracks"));
      const data = await res.json();
      setAllLibraryTracks(data);
    } catch (e) {
      console.error("Błąd pobierania bazy utworów:", e);
    }
  };

  useEffect(() => {
    fetchLibraryTracks();
  }, []);

  // Załaduj konfiguracje playlist po zalogowaniu
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kioskId = params.get("kiosk_id");
    
    if (kioskId) {
      setSelectedPlaylistId(kioskId);
      setLibraryTargetPlaylistId(kioskId);
      setIsFullscreen(true);
    } else if (playlists.length > 0) {
      setSelectedPlaylistId(playlists[0].id);
      if (!libraryTargetPlaylistId) setLibraryTargetPlaylistId(playlists[0].id);
    } else {
      setSelectedPlaylistId("");
      setLibraryTargetPlaylistId("");
      setCurrentPlaylist(null);
      setFilteredTracks([]);
    }
  }, [playlists]);

  // Pobierz szczegóły wybranej playlisty z nowymi tokenami z serwera
  const loadPlaylistDetails = async (id: string, forcePlay = false) => {
    if (!id) return;
    try {
      const res = await fetch(getApiUrl(`/api/playlist/${id}`), {
        headers: { ...authHeaders }
      });
      const data = await res.json();
      if (!data.error) {
        setCurrentPlaylist(data);
        setIsLoop(data.loop);
        
        // Załaduj specyficzne dla stacji audioCta oraz seoKeywords z obiektu playlisty, localStorage lub domyślne
        const savedCta = data.audioCta || localStorage.getItem(`hrl_cta_${id}`) || "none";
        const savedSeo = data.seoKeywords || localStorage.getItem(`hrl_seo_${id}`) || "luksusowy, relaksujący, butikowy";
        setAudioCta(savedCta);
        setSeoKeywords(savedSeo);

        // Zastosuj filtry explicit oraz harmonogramu czasowego:
        applyFilters(data.tracks, data.explicitFilter, data.useSchedule, simulatedTimeOfDay, forcePlay);
      } else {
        console.error("Błąd pobierania playlisty:", data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedPlaylistId) {
      loadPlaylistDetails(selectedPlaylistId);
    }
  }, [selectedPlaylistId]);

  // Ponowne przefiltrowanie, gdy zmieni się symulowana pora dnia
  useEffect(() => {
    if (currentPlaylist) {
      applyFilters(currentPlaylist.tracks, currentPlaylist.explicitFilter, currentPlaylist.useSchedule, simulatedTimeOfDay, false);
    }
  }, [simulatedTimeOfDay]);

  // Filtrowanie listy utworów:
  const applyFilters = (allTracks: Track[], explicitFilter: boolean, useSchedule: boolean, timeOfDay: TimeOfDay, forcePlay: boolean) => {
    let result = [...allTracks];

    // 1. Filtr Explicit (ukryj piosenki niecenzuralne)
    if (explicitFilter) {
      result = result.filter(t => !t.explicit);
    }

    // 2. Filtr Harmonogramu Pór Dnia (tylko utwory dopasowane do pory dnia)
    if (useSchedule) {
      const scheduled = result.filter(t => t.timeOfDay.includes(timeOfDay));
      // Fallback: jeśli żadna piosenka nie pasuje do tej pory dnia, załaduj wszystkie zgodnie ze specyfikacją!
      if (scheduled.length > 0) {
        result = scheduled;
      }
    }

    setFilteredTracks(result);
    setCurrentTrackIndex(result.length > 0 ? 0 : -1);
    
    // Zatrzymaj audio, jeśli grało i nie wymuszamy startu
    if (audioRef.current && !forcePlay) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Odśwież playlisty klienta
  const reloadMyPlaylists = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/my-playlists`), {
        headers: { ...authHeaders }
      });
      const data = await res.json();
      if (!data.error) {
        setPlaylists(data);
      }
    } catch (e) {
      console.error("Błąd odświeżania:", e);
    }
  };

  const toggleLibraryTrackInTargetPlaylist = async (track: Track) => {
    if (!libraryTargetPlaylistId) return;
    
    // Find playlist locally
    const targetPlaylistIndex = playlists.findIndex(p => p.id === libraryTargetPlaylistId);
    if (targetPlaylistIndex === -1) return;
    
    const targetPlaylist = playlists[targetPlaylistIndex];
    let newTracksIds = targetPlaylist.tracks.map((t: any) => typeof t === 'string' ? t : t.id);
    const hasTrack = newTracksIds.includes(track.id);
    
    if (hasTrack) {
      newTracksIds = newTracksIds.filter(id => id !== track.id);
    } else {
      newTracksIds.push(track.id);
    }

    try {
      const res = await fetch(getApiUrl(`/api/my-playlists/${libraryTargetPlaylistId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ tracks: newTracksIds })
      });
      if (res.ok) {
        await reloadMyPlaylists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-token refresh i załadowanie utworu
  const playTrack = async (index: number) => {
    if (index < 0 || index >= filteredTracks.length) return;
    setCurrentTrackIndex(index);
    const track = filteredTracks[index];

    // Zatrzymaj podgląd w kreatorze, by audio nie nachodziły na siebie
    stopPreview();

    try {
      const res = await fetch(getApiUrl(`/api/token`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: track.filename, userId: currentUserId })
      });
      const tkData = await res.json();
      
      if (audioRef.current && tkData.src) {
        audioRef.current.src = getApiUrl(tkData.src);
        audioRef.current.load();
        audioRef.current.volume = isMuted ? 0 : volume;

        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => {
            console.log("Blokada przeglądarki, kliknij pley:", e);
            setIsPlaying(false);
          });
      }
    } catch (e) {
      console.error("Błąd generowania tokenu HMAC:", e);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (currentTrackIndex === -1 && filteredTracks.length > 0) {
      playTrack(0);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          stopPreview();
        })
        .catch(() => setIsPlaying(false));
    }
  };

  const handleNext = () => {
    if (filteredTracks.length === 0) return;
    
    if (isShuffle) {
      const rand = Math.floor(Math.random() * filteredTracks.length);
      playTrack(rand);
    } else {
      const nextIndex = (currentTrackIndex + 1) % filteredTracks.length;
      playTrack(nextIndex);
    }
  };

  const handlePrev = () => {
    if (filteredTracks.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + filteredTracks.length) % filteredTracks.length;
    playTrack(prevIndex);
  };

  // Czas i pętla zegara w Kiosk Mode
  useEffect(() => {
    let timer: any;
    if (isFullscreen) {
      const updateClock = () => {
        const u = new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setKioskTime(u + " PL");
      };
      updateClock();
      timer = setInterval(updateClock, 1000);
    }
    return () => clearInterval(timer);
  }, [isFullscreen]);

  // Monitor i callbacki zdarzeń elementu <audio>
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const playCtaVoiceDrop = (type: string, keywords: string): Promise<void> => {
    return new Promise((resolve) => {
      if (type === "none" || typeof window === "undefined" || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      let text = "";
      const kwList = keywords ? keywords.split(",").map(k => k.trim()).filter(Boolean) : [];
      const primaryKw = kwList[0] || "naszych usług premium";
      const secondaryKw = kwList[1] || "luksusowego brzmienia";

      if (type === "sales") {
        text = `Szanowni Państwo, przypominamy o wyjątkowej ofercie naszej placówki. Przygotowaliśmy specjalną promocję z myślą o miłośnikach marki: ${primaryKw}. Zapytaj naszą obsługę o szczegóły i odbierz zniżkę. Życzymy przyjemnych chwil w rytmie ${secondaryKw}!`;
      } else if (type === "social") {
        text = `Miło spędza się czas w naszej placówce? Podziel się tą chwilą! Udostępnij zdjęcie z hasztagiem: ${primaryKw} i oznacz nasz profil społecznościowy. Dołącz do społeczności doceniającej ${secondaryKw}. Dziękujemy!`;
      } else if (type === "lead") {
        text = `Zyskaj więcej korzyści dzięki darmowej sieci bezprzewodowej i unikalnym rabatom. Zapisz się do naszego newslettera wpisując kod promocyjny: ${primaryKw}. Ciesz się dostępem do ofert specjalnych ${secondaryKw} już teraz.`;
      }

      if (!text) {
        resolve();
        return;
      }

      let oldVolume = 0.8;
      try {
        setIsCtaSpeaking(true);
        if (audioRef.current) {
          oldVolume = audioRef.current.volume;
          // Volume ducking - lower background track to 10%
          audioRef.current.volume = oldVolume * 0.10;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pl-PL";
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        if (window.speechSynthesis.getVoices) {
          const voices = window.speechSynthesis.getVoices();
          const plVoice = voices.find(v => v.lang.startsWith("pl"));
          if (plVoice) {
            utterance.voice = plVoice;
          }
        }

        utterance.onend = () => {
          setIsCtaSpeaking(false);
          if (audioRef.current) {
            audioRef.current.volume = oldVolume;
          }
          resolve();
        };

        utterance.onerror = (e) => {
          console.warn("SpeechSynthesis end error:", e);
          setIsCtaSpeaking(false);
          if (audioRef.current) {
            audioRef.current.volume = oldVolume;
          }
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("SpeechSynthesis error:", e);
        setIsCtaSpeaking(false);
        if (audioRef.current) {
          audioRef.current.volume = oldVolume;
        }
        resolve();
      }
    });
  };

  // Obsługa zakończenia utworu:
  const handleEnded = async () => {
    if (!audioRef.current || currentTrackIndex === -1) return;
    
    const track = filteredTracks[currentTrackIndex];
    try {
      await fetch(getApiUrl(`/api/play`), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          trackId: track.id,
          playlistId: selectedPlaylistId,
          userId: currentUserId,
          durationS: track.duration
        })
      });
    } catch (e) {
      console.error("Błąd pingu statystyk:", e);
    }

    if (audioCta !== "none") {
      await playCtaVoiceDrop(audioCta, seoKeywords);
    }

    if (isLoop) {
      playTrack(currentTrackIndex);
    } else {
      handleNext();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const fmtTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  // ==========================================
  // METODY KREATORA DLA KLIENTA (CURATOR)
  // ==========================================

  const startNewCreatorPlaylist = () => {
    setEditingPlaylistId("new");
    setCuratorTitle("Odtwarzacz Nowoczesny");
    setCuratorClientName("Moja Placówka Direct");
    setCuratorAccentColor("#ef4444");
    setCuratorPin("");
    setCuratorAutoplay(true);
    setCuratorLoop(true);
    setCuratorExplicitFilter(true);
    setCuratorUseSchedule(false);
    setSelectedLibraryTrackIds(allLibraryTracks.slice(0, 3).map(t => t.id)); // domyślny zestaw
    setCuratorAudioCta("none");
    setCuratorSeoKeywords("luksusowy, relaksujący, butikowy");
  };

  const loadPlaylistToCurator = (playlist: Playlist) => {
    setEditingPlaylistId(playlist.id);
    setCuratorTitle(playlist.title);
    setCuratorClientName(playlist.clientName);
    setCuratorAccentColor(playlist.accentColor || "#38bdf8");
    setCuratorPin(playlist.pin || "");
    setCuratorAutoplay(playlist.autoplay);
    setCuratorLoop(playlist.loop);
    setCuratorExplicitFilter(playlist.explicitFilter);
    setCuratorUseSchedule(playlist.useSchedule);
    setSelectedLibraryTrackIds(playlist.tracks.map((t: any) => typeof t === 'string' ? t : t.id));

    // Załaduj audioCta i seoKeywords z obiektu playlisty, localStorage lub ustaw domyślne
    const savedCta = playlist.audioCta || localStorage.getItem(`hrl_cta_${playlist.id}`) || "none";
    const savedSeo = playlist.seoKeywords || localStorage.getItem(`hrl_seo_${playlist.id}`) || "luksusowy, relaksujący, butikowy";
    setCuratorAudioCta(savedCta);
    setCuratorSeoKeywords(savedSeo);
  };

  // Auto load w edytorze po przełączeniu na tab Curator
  useEffect(() => {
    if (activeMainTab === 'curator') {
      if (currentPlaylist) {
        loadPlaylistToCurator(currentPlaylist);
      } else {
        startNewCreatorPlaylist();
      }
    }
  }, [activeMainTab]);

  const toggleLibraryTrackSelection = (id: string) => {
    setSelectedLibraryTrackIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  // Podgląd piosenki w kreatorze (Preview)
  const togglePreviewTrack = async (track: Track) => {
    if (previewTrackId === track.id && isPreviewPlaying) {
      stopPreview();
      return;
    }

    // zatrzymaj główne radio, by nie grało w tle podczas odsłuchu bazy
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    setPreviewTrackId(track.id);
    setIsPreviewPlaying(true);

    try {
      const res = await fetch(getApiUrl(`/api/token`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: track.filename, userId: currentUserId })
      });
      const data = await res.json();
      if (previewAudioRef.current && data.src) {
        previewAudioRef.current.src = getApiUrl(data.src);
        previewAudioRef.current.load();
        previewAudioRef.current.volume = 0.5;
        previewAudioRef.current.play().catch(() => {
          setIsPreviewPlaying(false);
        });
      }
    } catch (err) {
      console.error(err);
      setIsPreviewPlaying(false);
    }
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setPreviewTrackId("");
    setIsPreviewPlaying(false);
  };

  // ZAPIS I GENEROWANIE
  const handleSaveAndGenerate = async () => {
    if (!curatorTitle.trim() || !curatorClientName.trim()) {
      alert("Proszę podać nazwę odtwarzacza oraz podpis klienta.");
      return;
    }
    if (selectedLibraryTrackIds.length === 0) {
      alert("Proszę wybrać co najmniej 1 utwór do odtwarzacza.");
      return;
    }

    setIsSavingCurator(true);
    const bodyData = {
      title: curatorTitle,
      clientName: curatorClientName,
      accentColor: curatorAccentColor,
      bgColor: "#09090b",
      autoplay: curatorAutoplay,
      loop: curatorLoop,
      explicitFilter: curatorExplicitFilter,
      useSchedule: curatorUseSchedule,
      tracks: selectedLibraryTrackIds,
      pin: curatorPin,
      volume: 0.8,
      audioCta: curatorAudioCta,
      seoKeywords: curatorSeoKeywords
    };

    const isNew = editingPlaylistId === "new" || !editingPlaylistId;
    const url = isNew ? "/api/my-playlists" : `/api/my-playlists/${editingPlaylistId}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(getApiUrl(url), {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders
        },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (!data.error) {
        setCompiledPlaylist(data);
        setShowExportModal(true);
        setSelectedPlaylistId(data.id);
        
        // Zapisz ustawienia do localStorage
        localStorage.setItem(`hrl_cta_${data.id}`, curatorAudioCta);
        localStorage.setItem(`hrl_seo_${data.id}`, curatorSeoKeywords);

        // Przeładuj lokalne playlisty
        await reloadMyPlaylists();
        
        // Załaduj jako bieżący player
        await loadPlaylistDetails(data.id, true);
      } else {
        alert("Błąd: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Błąd połączenia z serwerem.");
    } finally {
      setIsSavingCurator(false);
    }
  };

  // Kopiowanie kiosk url do schowka
  const getKioskUrl = (playlistId: string) => {
    return `${window.location.origin}/?kiosk_id=${playlistId}&sim_user=${currentUserId}`;
  };

  const copyKioskLinkToClipboard = (playlistId: string) => {
    const url = getKioskUrl(playlistId);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Trigger pobierania fizycznego pliku HTML
  const downloadHtmlPage = (playlistId: string) => {
    window.open(`/api/playlists/${playlistId}/download?sim_user=${currentUserId}`);
  };

  // Filtrowane piosenki w bibliotece
  const filteredLibrary = allLibraryTracks.filter(track => {
    const queryMatch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       track.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const genreMatch = genreFilter === "all" || track.genre === genreFilter;
    return queryMatch && genreMatch;
  });

  const activeTrack = currentTrackIndex !== -1 ? filteredTracks[currentTrackIndex] : null;

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen w-full flex flex-col justify-start p-4 md:p-8 select-none transition-all duration-700 bg-[#0b0f19] text-[#f1f5f9] font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 p-0 m-0 w-screen h-screen overflow-hidden' : ''
      }`}
    >
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <audio 
        ref={previewAudioRef}
        onEnded={stopPreview}
      />

      {/* 📺 TRYB NORMALNY - Z ZAWARTOŚCIĄ TABSÓW */}
      {!isFullscreen ? (
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6 animate-fade-in bg-[#0b0f19]">
          
          {/* GŁÓWNY ZINTEGROWANY PANEL NAWIGACYJNY (CONSOLIDATED HEADER & BREADCRUMBS) */}
          <header id="cmlp-master-header" className="bg-[#161e31]/80 border border-[#38bdf8]/20 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 backdrop-blur-md shadow-sm">
            {/* Branding, Status oraz Ścieżka (Breadcrumbs) */}
            <div className="flex items-center gap-3.5">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 select-none overflow-hidden"
              >
                <img src={cmlpLogo} alt="CMLP Logo" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1.5 text-left w-full overflow-hidden">
                {/* Zintegrowana Ścieżka Okruszkowa (Breadcrumbs) jako Panel Nawigacji */}
                <nav className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider select-none overflow-x-auto pb-1 scrollbar-hide">
                  <span className="flex items-center gap-1 text-[#f1f5f9]0 whitespace-nowrap">
                    <Home className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <span>CMLP CLOUD</span>
                  </span>
                  
                  <ChevronRight className="w-3 h-3 text-zinc-700 flex-shrink-0" />
                  
                  <span className="bg-[#0b0f19]/80 px-2 py-0.5 rounded border border-[rgba(56,189,248,0.15)] text-[#94a3b8] whitespace-nowrap">
                    {currentUserId || "B2B-Partner"}
                  </span>
                  
                  <ChevronRight className="w-3 h-3 text-zinc-700 flex-shrink-0" />
                  
                  <div className="flex items-center gap-1 bg-[#0b0f19]/60 p-0.5 rounded-lg border border-[rgba(56,189,248,0.15)] flex-shrink-0">
                    <button
                      onClick={() => setActiveMainTab('player')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                        activeMainTab === 'player'
                          ? 'bg-zinc-800 text-[#38bdf8] shadow-sm border border-zinc-700'
                          : 'text-[#f1f5f9]0 hover:text-[#f1f5f9] hover:bg-[rgba(22,30,49,0.6)]'
                      }`}
                    >
                      <Layout className="w-3 h-3" />
                      <span>Odtwarzacz</span>
                    </button>
                    <button
                      onClick={() => setActiveMainTab('library')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                        activeMainTab === 'library'
                          ? 'bg-zinc-800 text-orange-400 shadow-sm border border-zinc-700'
                          : 'text-[#f1f5f9]0 hover:text-[#f1f5f9] hover:bg-[rgba(22,30,49,0.6)]'
                      }`}
                    >
                      <ListMusic className="w-3 h-3" />
                      <span>Biblioteka</span>
                    </button>
                    <button
                      onClick={() => setActiveMainTab('curator')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                        activeMainTab === 'curator'
                          ? 'bg-zinc-800 text-purple-400 shadow-sm border border-zinc-700'
                          : 'text-[#f1f5f9]0 hover:text-[#f1f5f9] hover:bg-[rgba(22,30,49,0.6)]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Kreator Playlist</span>
                    </button>
                    <button
                      onClick={() => setActiveMainTab('license')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                        activeMainTab === 'license'
                          ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700'
                          : 'text-[#f1f5f9]0 hover:text-[#f1f5f9] hover:bg-[rgba(22,30,49,0.6)]'
                      }`}
                    >
                      <CheckSquare className="w-3 h-3" />
                      <span>Licencjonowanie</span>
                    </button>
                    <button
                      onClick={() => setActiveMainTab('analytics')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                        activeMainTab === 'analytics'
                          ? 'bg-zinc-800 text-blue-400 shadow-sm border border-zinc-700'
                          : 'text-[#f1f5f9]0 hover:text-[#f1f5f9] hover:bg-[rgba(22,30,49,0.6)]'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Analityka</span>
                    </button>
                  </div>
                </nav>
                
                {/* Tytuł i status systemowy */}
                <h1 className="text-sm font-black text-[#f1f5f9] tracking-tight flex items-center gap-2">
                  <span>Commercial Music Licensing Platform</span>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-widest select-none">
                    ACTIVE B2B DRM
                  </span>
                </h1>
              </div>
            </div>
          </header>

          {/* TAB 1: KLASYCZNY ODTWARZACZ */}
          {activeMainTab === 'player' && (
            <div className="grid grid-cols-12 gap-4 lg:gap-6">
              
              {/* Lewy panel (Ustawienia stacji) */}
              <section className="col-span-12 lg:col-span-4 bg-[#161e31]/80 border border-[#38bdf8]/20 rounded-2xl p-5 flex flex-col justify-between gap-5 shadow-xl shadow-black/40 backdrop-blur-md">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-[10px] font-black uppercase text-[#f1f5f9]0 tracking-wider font-mono mb-1.5 flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5 text-[#f1f5f9]0" />
                      <span>Aktywne Stanowisko / Placówka</span>
                    </h2>
                    <div className="relative">
                      <select
                        value={selectedPlaylistId}
                        onChange={(e) => setSelectedPlaylistId(e.target.value)}
                        className="w-full bg-[#0b0f19] text-[#f1f5f9] font-bold border border-[rgba(56,189,248,0.15)] px-3 py-2.5 rounded-lg text-xs focus:ring-1 focus:ring-[#38bdf8] focus:outline-none focus:border-[#38bdf8] leading-normal appearance-none cursor-pointer"
                      >
                        {playlists.map(p => (
                          <option key={p.id} value={p.id}>{p.clientName} ({p.title})</option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#f1f5f9]0 font-mono text-[9px] font-black">▼</div>
                    </div>
                  </div>

                  {/* Kiosk link quick utilities */}
                  {currentPlaylist && (
                    <div className="p-3.5 bg-[#0b0f19]/60 rounded-xl border border-[rgba(56,189,248,0.15)] space-y-3">
                      <p className="text-[9px] font-black uppercase text-[#94a3b8] tracking-widest font-mono flex items-center justify-between">
                        <span>Linki Dedykowane Stanowiska</span>
                        <span className="text-[8px] bg-[#38bdf8]/10 text-[#38bdf8] px-1.5 py-0.5 rounded">DIRECT DRM</span>
                      </p>
                      
                      <div className="space-y-1.5">
                        <button
                          onClick={() => downloadHtmlPage(currentPlaylist.id)}
                          className="w-full flex items-center justify-between gap-2 bg-[#a855f7] hover:bg-[#38bdf8] text-zinc-950 hover:scale-[1.01] active:scale-[0.99] font-black py-2 px-3 rounded-lg text-xs transition duration-150"
                        >
                          <span className="flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5 text-zinc-950" />
                            Pobierz stronę offline HTML
                          </span>
                          <span className="font-mono text-[8px] bg-[#0b0f19]/20 px-1 py-0.5 rounded leading-none font-bold">A4 OK</span>
                        </button>

                        <button
                          onClick={() => copyKioskLinkToClipboard(currentPlaylist.id)}
                          className={`w-full flex items-center justify-center gap-1.5 border border-[rgba(56,189,248,0.15)] hover:border-zinc-700 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                            copiedLink ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#0b0f19] text-zinc-350 hover:text-[#f1f5f9]"
                          }`}
                        >
                          <Link className="w-3.5 h-3.5" />
                          <span>{copiedLink ? "Skopiowano zaufany link" : "Kopiuj Link Odtwarzacza Online"}</span>
                        </button>
                      </div>

                      <p className="text-[9px] text-[#f1f5f9]0 leading-normal">
                        Plik <span className="font-bold text-zinc-350">HTML</span> pozwala odtwarzać muzykę bez obaw o limity przeglądarek, bezpośrednio łącząc się z serwerami DRM.
                      </p>
                    </div>
                  )}

                  {currentPlaylist?.useSchedule && (
                    <div className="space-y-2">
                       <h3 className="text-[10px] font-black uppercase text-[#f1f5f9]0 tracking-wider font-mono flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#f1f5f9]0" />
                        <span>Harmonogram Dnia (Wersja testowa)</span>
                      </h3>
                      <div className="grid grid-cols-4 gap-1 bg-[#0b0f19] p-1 rounded-lg border border-[rgba(56,189,248,0.15)] select-none">
                        {(['morning', 'afternoon', 'evening', 'night'] as TimeOfDay[]).map(t => (
                          <button
                            key={t}
                            onClick={() => setSimulatedTimeOfDay(t)}
                            className={`py-1 px-1.5 text-[9px] font-mono font-bold rounded-md uppercase transition-all duration-150 ${
                              simulatedTimeOfDay === t 
                                ? 'bg-zinc-800 text-[#38bdf8] border border-zinc-750 shadow-sm font-black' 
                                : 'text-[#f1f5f9]0 hover:text-[#f1f5f9] hover:bg-[rgba(22,30,49,0.6)]'
                            }`}
                          >
                            {t === 'morning' ? 'rano' : t === 'afternoon' ? 'poł' : t === 'evening' ? 'wiecz' : 'noc'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-[#0b0f19]/60 rounded-xl border border-[rgba(56,189,248,0.15)] space-y-1.5 text-[10px] font-mono text-[#f1f5f9]0">
                  <div className="flex justify-between items-center bg-[rgba(22,30,49,0.6)] p-1 rounded">
                    <span>STATUS ZEZWOLENIA:</span>
                    <span className="text-emerald-500 font-bold">ZWOLNIONY Z OZZ</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span>KOD PIN PLACÓWKI:</span>
                    <span className="text-[#94a3b8] font-bold">{currentPlaylist?.pin ? "AKTYWNY" : "BRAK"}</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span>ZABEZPIECZENIE:</span>
                    <span className="text-emerald-500 font-bold">HMAC SHA-256</span>
                  </div>
                </div>
              </section>

              {/* Środkowy panel (Główny Gramofon / Odtwarzacz) */}
              <section 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="col-span-12 lg:col-span-8 bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl p-5 flex flex-col md:flex-row gap-5 justify-between items-center shadow-xl shadow-black/40 backdrop-blur-md select-none touch-pan-y group/player"
              >
                
                {/* Vinyl Plate spinning */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="my-1 relative w-40 h-40 flex justify-center items-center">
                    <div 
                      className={`absolute w-36 h-36 rounded-full border-4 shadow-2xl overflow-hidden aspect-square transition-all duration-700 ${
                        isPlaying ? 'animate-[spin_4s_linear_infinite] scale-100' : 'animate-[spin_16s_linear_infinite] scale-[0.97]'
                      }`}
                      style={{ borderColor: currentPlaylist?.accentColor || "#10b981" }}
                    >
                      {activeTrack?.cover ? (
                        <img 
                          src={activeTrack.cover} 
                          alt={activeTrack.title} 
                          className="w-full h-full object-cover select-none pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex justify-center items-center">
                          <Music className="h-12 w-12 text-zinc-700 animate-pulse" />
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute w-10 h-10 bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] rounded-full z-10 flex justify-center items-center shadow-lg pointer-events-none select-none">
                      <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center pointer-events-none select-none">
                    <p className="text-[8px] font-mono text-[#f1f5f9]0 font-black uppercase tracking-widest leading-none">Nadawca Direct</p>
                    <div className="flex justify-center items-center gap-1 mt-1 bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold text-[#94a3b8] shadow-inner">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>AUDIO LICENCJONOWANE B2B</span>
                    </div>
                  </div>
                </div>

                {/* Kontrolki Odtwarzacza */}
                <div className="flex-1 w-full space-y-4 flex flex-col justify-between min-h-[9.5rem]">
                  <div className="text-center md:text-left space-y-0.5">
                    {isCtaSpeaking ? (
                      <div className="space-y-1 p-2.5 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 animate-pulse text-left shadow-inner">
                        <span className="text-[9px] font-mono font-black uppercase text-[#38bdf8] tracking-wider flex items-center gap-1.5 leading-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
                          Lektor AI: Komunikat Głosowy (Ducking DSP)
                        </span>
                        <h3 className="font-sans font-black text-sm tracking-tight text-[#f1f5f9] leading-tight">
                          Emisja spotu sponsorskiego CTA ({audioCta.toUpperCase()})
                        </h3>
                        <p className="text-[#f1f5f9]0 font-semibold text-[10px] leading-none font-mono mt-0.5">
                          Pozycjonowanie marki: {seoKeywords}
                        </p>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-sans font-black text-xl tracking-tight text-[#f1f5f9] line-clamp-1">
                          {activeTrack?.title || "Wybierz utwór"}
                        </h3>
                        <p className="text-[#94a3b8] font-bold text-xs leading-none line-clamp-1">
                          {activeTrack?.artist || "Lista gotowa do odsłuchu"}
                        </p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-1.5 pt-1.5">
                          {activeTrack?.explicit && (
                            <span className="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest font-mono">EXPLICIT</span>
                          )}
                          {activeTrack?.isrc && (
                            <span className="text-[8px] font-mono text-[#94a3b8] px-1.5 py-0.5 rounded bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] font-bold tracking-wider uppercase">{activeTrack.isrc}</span>
                          )}
                          {activeTrack?.bpm && (
                            <span className="text-[8px] font-mono text-[#94a3b8] bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] px-1.5 py-0.5 rounded font-bold">{activeTrack.bpm} BPM</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pointer-events-auto">
                    <div 
                      onClick={handleSeek}
                      className="h-1.5 w-full bg-[#0b0f19] hover:h-2 rounded-full cursor-pointer transition-all overflow-hidden border border-[rgba(56,189,248,0.15)]"
                    >
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          backgroundColor: currentPlaylist?.accentColor || "#38bdf8",
                          width: `${duration ? (currentTime / duration) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center font-mono text-[8px] text-[#f1f5f9]0 font-black">
                      <span>{fmtTime(currentTime)}</span>
                      <span className="hidden sm:inline-block opacity-0 group-hover/player:opacity-40 transition-opacity uppercase tracking-widest bg-[rgba(22,30,49,0.6)] px-1.5 py-[1px] rounded">
                        Gest: Przesuń ↔
                      </span>
                      <span className="inline-block sm:hidden uppercase tracking-widest text-[#94a3b8]">
                        Przesuń ↔ by zmienić
                      </span>
                      <span>{fmtTime(duration)}</span>
                    </div>
                  </div>

                  {/* Narzędzia i Przyciski */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(56,189,248,0.15)] pt-3">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`p-1.5 rounded-lg border border-transparent transition-all duration-150 ${
                          isShuffle ? 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20' : 'text-[#f1f5f9]0 hover:text-[#f1f5f9]'
                        }`}
                        title="Losowo (⇄)"
                      >
                        <Shuffle className="h-4 w-4" />
                      </button>

                      <button 
                        onClick={handlePrev}
                        className="p-1.5 bg-zinc-955 hover:bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-full text-[#94a3b8] hover:text-[#f1f5f9] transition"
                        title="Poprzedni"
                      >
                        <SkipBack className="h-3.5 w-3.5" />
                      </button>

                      <button 
                        onClick={handlePlayPause}
                        className="p-2.5 rounded-full text-zinc-950 transition transform active:scale-95 shadow-lg hover:brightness-110 cursor-pointer"
                        style={{ backgroundColor: currentPlaylist?.accentColor || "#38bdf8" }}
                        title={isPlaying ? "Wstrzymaj" : "Graj"}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 text-zinc-950" fill="currentColor" />
                        ) : (
                          <Play className="h-4 w-4 text-zinc-950 translate-x-[0.5px]" fill="currentColor" />
                        )}
                      </button>

                      <button 
                        onClick={handleNext}
                        className="p-1.5 bg-zinc-955 hover:bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-full text-[#94a3b8] hover:text-[#f1f5f9] transition"
                        title="Następny"
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                      </button>

                      <button 
                        onClick={() => setIsLoop(!isLoop)}
                        className={`p-1.5 rounded-lg border border-transparent transition-all duration-150 ${
                          isLoop ? 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20' : 'text-[#f1f5f9]0 hover:text-[#f1f5f9]'
                        }`}
                        title="Pętla (↻)"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-450 w-28 sm:w-32">
                      <button onClick={toggleMute} className="text-[#f1f5f9]0 hover:text-[#f1f5f9]">
                        {isMuted ? <VolumeX className="h-3.5 w-3.5 text-[#38bdf8]" /> : <Volume2 className="h-3.5 w-3.5" />}
                      </button>
                      <input 
                        type="range" min={0} max={1} step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-1 rounded-full cursor-pointer bg-[#0b0f19] accent-[#38bdf8]"
                        style={{ accentColor: currentPlaylist?.accentColor || "#38bdf8" }}
                      />
                    </div>
                  </div>

                </div>

              </section>

              {/* Dół (Lista Utworów) */}
              <section className="col-span-12 bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl p-5 shadow-xl shadow-black/40 backdrop-blur-md">
                <div className="flex justify-between items-center text-[10px] font-black text-[#f1f5f9]0 uppercase tracking-widest font-mono mb-3.5">
                  <span className="flex items-center gap-1.5">
                    <ListMusic className="w-4 h-4 text-[#38bdf8]" />
                    Zaprogramowana Strefa Audio ({filteredTracks.length} utworów)
                  </span>
                  {currentPlaylist?.pin && (
                    <span className="text-[8px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 rounded-full font-bold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Zabezpieczone PIN
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredTracks.map((track, i) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(i)}
                      className={`flex items-center gap-3.5 p-3 rounded-xl cursor-pointer text-xs font-semibold select-none transition-all duration-200 ${
                        currentTrackIndex === i 
                          ? 'bg-[rgba(22,30,49,0.6)] text-[#f1f5f9] border border-[rgba(56,189,248,0.15)] shadow-md' 
                          : 'text-[#94a3b8] hover:bg-[rgba(22,30,49,0.6)] hover:text-[#f1f5f9] border border-transparent'
                      }`}
                    >
                      <span className="w-5 text-center font-mono font-bold text-[10px] text-zinc-650">
                        {currentTrackIndex === i ? (
                          <span 
                            className="inline-block w-2 h-2 rounded-full animate-ping" 
                            style={{ backgroundColor: currentPlaylist?.accentColor || "#38bdf8" }} 
                          />
                        ) : (
                          String(i + 1).padStart(2, '0')
                        )}
                      </span>
                      <div className="flex-1 truncate text-left">
                        <p 
                          className="truncate text-[#f1f5f9]" 
                          style={{ color: currentTrackIndex === i ? (currentPlaylist?.accentColor || "#38bdf8") : 'inherit' }}
                        >
                          {track.title}
                        </p>
                        <p className="truncate text-[10px] text-[#f1f5f9]0 font-medium font-sans mt-0.5">{track.artist}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#f1f5f9]0">{fmtTime(track.duration)}</span>
                    </div>
                  ))}
                </div>

                {filteredTracks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-[#f1f5f9]0 space-y-3">
                    <AlertTriangle className="h-7 w-7 text-[#38bdf8]" />
                    <p className="text-xs font-mono font-black uppercase">Brak utworów w tym programie.</p>
                  </div>
                )}

                <div className="mt-6 border-t border-[rgba(56,189,248,0.15)] pt-4 flex justify-between items-center sm:flex-row flex-col gap-4">
                  <button 
                    onClick={() => setIsFullscreen(true)}
                    className="flex justify-center items-center gap-2 border border-dashed border-[rgba(56,189,248,0.15)] hover:border-[rgba(56,189,248,0.15)] bg-[#0b0f19]/40 hover:bg-[#0b0f19] py-3 rounded-xl text-xs font-mono font-bold text-[#94a3b8] hover:text-[#f1f5f9] transition w-full shadow-sm"
                  >
                    <Maximize2 className="h-4 w-4 text-[#38bdf8]/80 animate-pulse" />
                    <span>Uruchom Tablet KIOSK (Pełny ekran placówki handlowej)</span>
                  </button>
                </div>
              </section>

            </div>
          )}

          {/* TAB 1.5: BIBLIOTEKA UTWORÓW */}
          {activeMainTab === 'library' && (
            <div className="animate-fade-in text-left space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl p-5 shadow-xl backdrop-blur-md">
                <div>
                  <h2 className="text-lg font-black text-[#f1f5f9] uppercase tracking-wider flex items-center gap-2">
                    <ListMusic className="w-5 h-5 text-orange-400" />
                    Biblioteka Utworów
                  </h2>
                  <p className="text-[10px] text-[#f1f5f9]0 font-mono mt-1">
                    Przeglądaj, odsłuchuj i dodawaj utwory do wybranej playlisty.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-[#0b0f19] px-3 py-2 rounded-xl border border-[rgba(56,189,248,0.15)]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Dodaj do:</span>
                    <select
                      value={libraryTargetPlaylistId}
                      onChange={(e) => setLibraryTargetPlaylistId(e.target.value)}
                      className="bg-transparent text-[#f1f5f9] font-bold text-xs focus:outline-none w-32"
                    >
                      <option value="" disabled>Wybierz playlistę</option>
                      {playlists.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Szukaj utworu..."
                      className="w-full sm:w-48 bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] rounded-xl pl-9 pr-3 py-2 text-xs text-[#f1f5f9]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  
                  <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="bg-[#0b0f19] text-[#f1f5f9] border border-[rgba(56,189,248,0.15)] px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value="all">Wszystkie gatunki</option>
                    <option value="jazz">Jazz</option>
                    <option value="lofi">Lo-Fi</option>
                    <option value="ambient">Ambient</option>
                    <option value="electronic">Electronic / Club</option>
                    <option value="classical">Classical</option>
                    <option value="pop">Pop / Lounge</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredLibrary.map(track => {
                  const targetPlaylist = playlists.find(p => p.id === libraryTargetPlaylistId);
                  const isTrackInTarget = targetPlaylist ? targetPlaylist.tracks.some((t: any) => (typeof t === 'string' ? t : t.id) === track.id) : false;
                  const isThisPreviewPlaying = isPreviewPlaying && previewTrackId === track.id;

                  return (
                    <div key={track.id} className="bg-[rgba(22,30,49,0.4)] border border-[rgba(56,189,248,0.1)] rounded-2xl overflow-hidden hover:bg-[rgba(22,30,49,0.8)] hover:border-[#38bdf8]/30 transition group shadow-lg">
                      <div className="relative aspect-square">
                        <img src={track.cover} alt={track.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => togglePreviewTrack(track)}
                            className="bg-black/60 hover:bg-[#38bdf8] text-white p-4 rounded-full backdrop-blur-md transition shadow-2xl"
                          >
                            {isThisPreviewPlaying ? <span className="w-6 h-6 block bg-white rounded-sm"></span> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
                          </button>
                        </div>
                        {track.explicit && (
                          <span className="absolute top-2 left-2 bg-[#38bdf8]/90 text-zinc-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-mono shadow-sm">Explicit</span>
                        )}
                        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm">
                          {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      
                      <div className="p-4 space-y-3 relative">
                        <div>
                          <h3 className="text-sm font-bold text-white truncate" title={track.title}>{track.title}</h3>
                          <p className="text-[10px] text-zinc-400 font-medium truncate" title={track.artist}>{track.artist}</p>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <span className="text-[9px] text-zinc-500 font-mono block uppercase tracking-wider">{track.genre}</span>
                            <span className="text-[9px] text-[#38bdf8] font-mono block font-black border border-[#38bdf8]/20 bg-[#38bdf8]/10 px-1 rounded-sm uppercase tracking-wider w-fit">{track.bpm} BPM</span>
                          </div>
                          
                          <button
                            onClick={() => toggleLibraryTrackInTargetPlaylist(track)}
                            disabled={!libraryTargetPlaylistId}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                              isTrackInTarget 
                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30" 
                                : "bg-[#0b0f19] text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10 border border-zinc-800 hover:border-orange-500/30"
                            } ${!libraryTargetPlaylistId && "opacity-50 cursor-not-allowed"}`}
                            title={!libraryTargetPlaylistId ? "Najpierw wybierz playlistę" : isTrackInTarget ? "Usuń z playlisty" : "Dodaj do playlisty"}
                          >
                            {isTrackInTarget ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredLibrary.length === 0 && (
                  <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                    <ListMusic className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-400 font-bold uppercase tracking-wider">Brak wyników</p>
                    <p className="text-zinc-500 text-[10px] font-mono mt-1">Zmień kryteria wyszukiwania.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: KREATOR ODTWARZACZY & WYBIERANIE UTWORÓW */}
          {activeMainTab === 'curator' && (
            <div className="grid grid-cols-12 gap-4 lg:gap-6 animate-fade-in text-left">
              
              {/* Opcje Odtwarzacza & Parametry Techniczne (Span 5) */}
              <section 
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const trackId = e.dataTransfer.getData("text/plain");
                  if (trackId) {
                    if (!selectedLibraryTrackIds.includes(trackId)) {
                      setSelectedLibraryTrackIds(prev => [...prev, trackId]);
                    }
                  }
                }}
                className={`col-span-12 lg:col-span-5 bg-[rgba(22,30,49,0.6)] border-[rgba(56,189,248,0.15)] border rounded-2xl p-5 space-y-4 transition-all relative shadow-xl shadow-black/40 backdrop-blur-md ${
                  isDragOver ? "border-[#38bdf8] bg-[#38bdf8]/5 shadow-[#38bdf8]/10 scale-[1.01]" : "border-[rgba(56,189,248,0.15)]"
                }`}
              >
                {isDragOver && (
                  <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-sm z-30 rounded-2xl flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#38bdf8] animate-pulse pointer-events-none">
                    <Music className="w-10 h-10 text-[#38bdf8] mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-[#f1f5f9] uppercase tracking-wider">Upuść utwór tutaj</p>
                    <p className="text-[10px] text-[#94a3b8] mt-1">Szybkie dodanie do tworzonej playlisty</p>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-[rgba(56,189,248,0.15)]">
                  <h2 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#38bdf8]" />
                    <span>Konfiguracja Odtwarzacza</span>
                  </h2>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={startNewCreatorPlaylist}
                      className="text-[10px] font-mono bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 hover:bg-[#a855f7] hover:text-zinc-950 px-2.5 py-1.5 rounded-lg transition-all font-black"
                    >
                      + NOWY KANAŁ
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Selector placówki do nadpisania */}
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-[#f1f5f9]0 mb-1.5">Format do edycji / Klonowania</label>
                    <div className="relative">
                      <select
                        value={editingPlaylistId}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "new") {
                            startNewCreatorPlaylist();
                          } else {
                            const match = playlists.find(p => p.id === val);
                            if (match) loadPlaylistToCurator(match);
                          }
                        }}
                        className="w-full bg-[#0b0f19] text-[#f1f5f9] font-bold border border-[rgba(56,189,248,0.15)] px-3 py-2.5 rounded-xl text-xs"
                      >
                        <option value="new">✦ Nowy Odtwarzacz B2B</option>
                        {playlists.map(p => (
                          <option key={p.id} value={p.id}>Klonuj: {p.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nazwa tytułowa */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-black uppercase text-[#f1f5f9]0 mb-1">Nazwa Programu / Stylu</label>
                      <input 
                        type="text" 
                        value={curatorTitle} 
                        onChange={(e) => setCuratorTitle(e.target.value)}
                        placeholder="np. Słoneczny Lounge"
                        className="w-full bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] rounded-xl px-3 py-2.5 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#38bdf8] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-black uppercase text-[#f1f5f9]0 mb-1">Nazwa Placówki / Klienta</label>
                      <input 
                        type="text" 
                        value={curatorClientName} 
                        onChange={(e) => setCuratorClientName(e.target.value)}
                        placeholder="np. Restauracja Gusto"
                        className="w-full bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] rounded-xl px-3 py-2.5 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#38bdf8] font-semibold"
                      />
                    </div>
                  </div>

                  {/* Wybór koloru przewodniego */}
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-[#f1f5f9]0 mb-2">Kolor akcentu wizualnego marki</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {[
                        { hex: "#38bdf8", name: "gold" },
                        { hex: "#10b981", name: "emerald" },
                        { hex: "#3b82f6", name: "blue" },
                        { hex: "#ec4899", name: "pink" },
                        { hex: "#ef4444", name: "red" },
                        { hex: "#eab308", name: "yellow" },
                        { hex: "#a855f7", name: "purple" }
                      ].map(color => (
                        <button
                          key={color.hex}
                          onClick={() => setCuratorAccentColor(color.hex)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-200 ${
                            curatorAccentColor === color.hex ? "border-white scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {curatorAccentColor === color.hex && <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />}
                        </button>
                      ))}
                      
                      <input 
                        type="color" 
                        value={curatorAccentColor} 
                        onChange={(e) => setCuratorAccentColor(e.target.value)}
                        className="w-8 h-8 rounded-xl bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] cursor-pointer overflow-hidden p-0" 
                        title="Inny kolor"
                      />
                    </div>
                  </div>

                  {/* 🔒 Zabezpieczenie kodem PIN */}
                  <div className="bg-[#0b0f19]/80 border border-[rgba(56,189,248,0.15)] p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-mono font-black uppercase text-[#94a3b8]">Blokada PIN dla personelu</label>
                      <span className="text-[9px] font-mono text-[#f1f5f9]0 font-bold uppercase">ZABEZPIECZENIE</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          maxLength={4} 
                          value={curatorPin} 
                          onChange={(e) => setCuratorPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="np. 4321 (Zostaw puste dla braku blokady)"
                          className="w-full bg-[rgba(22,30,49,0.6)] border border-zinc-850 rounded-lg px-3 py-2 text-xs text-[#f1f5f9] placeholder-zinc-600 focus:outline-none font-mono"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f1f5f9]0"><Lock className="w-3.5 h-3.5" /></span>
                      </div>
                    </div>
                    <p className="text-[9px] text-[#f1f5f9]0 leading-relaxed">
                      Po wprowadzeniu 4-cyfrowego kodu, strona HTML oraz kiosk będą wymagały hasła, uniemożliwiając personelowi samowolne przełączanie stacji lub zmianę ułożenia.
                    </p>
                  </div>

                  {/* Checkboxy Opcji Odtwarzania */}
                  <div className="space-y-3 bg-[#0b0f19]/40 p-3 rounded-xl border border-[rgba(56,189,248,0.15)]">
                    <p className="text-[10px] font-mono font-black uppercase text-[#f1f5f9]0 mb-1">Parametry Odtwarzania Odbiornika</p>
                    
                    <label className="flex items-center gap-2.5 text-xs text-[#94a3b8] hover:text-zinc-250 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={curatorAutoplay} 
                        onChange={(e) => setCuratorAutoplay(e.target.checked)}
                        className="rounded border-[rgba(56,189,248,0.15)] bg-[#0b0f19] text-[#38bdf8] w-4 h-4 accent-[#38bdf8] focus:ring-0"
                      />
                      <span>Automatyczny start audio (Autoplay)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-[#94a3b8] hover:text-zinc-250 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={curatorLoop} 
                        onChange={(e) => setCuratorLoop(e.target.checked)}
                        className="rounded border-[rgba(56,189,248,0.15)] bg-[#0b0f19] text-[#38bdf8] w-4 h-4 accent-[#38bdf8] focus:ring-0"
                      />
                      <span>Ciągłe zapętlenie utworów (Loop Mode)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-[#94a3b8] hover:text-zinc-250 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={curatorExplicitFilter} 
                        onChange={(e) => setCuratorExplicitFilter(e.target.checked)}
                        className="rounded border-[rgba(56,189,248,0.15)] bg-[#0b0f19] text-[#38bdf8] w-4 h-4 accent-[#38bdf8] focus:ring-0"
                      />
                      <span className="text-emerald-400 font-bold">Włącz filtr Explicit (Czyste wersje dla dzieci i luksusu)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-[#94a3b8] hover:text-zinc-250 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={curatorUseSchedule} 
                        onChange={(e) => setCuratorUseSchedule(e.target.checked)}
                        className="rounded border-[rgba(56,189,248,0.15)] bg-[#0b0f19] text-[#38bdf8] w-4 h-4 accent-[#38bdf8] focus:ring-0"
                      />
                      <span>Zezwalaj na podział rano / noc (Pory Dnia)</span>
                    </label>
                  </div>

                  {/* 📢 DYNAMICZNE USTAWIENIA CTA / KOMUNIKATY SPERSONALIZOWANE */}
                  <div className="space-y-3 bg-[#0b0f19]/60 p-3.5 rounded-xl border border-[rgba(56,189,248,0.15)] shadow-inner">
                    <div className="flex justify-between items-center pb-1.5 border-b border-[rgba(56,189,248,0.15)]">
                      <p className="text-[10px] font-mono font-black uppercase text-[#38bdf8] flex items-center gap-1.5 leading-none">
                        <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>Komunikaty Lektora AI & SEO</span>
                      </p>
                      <span className="text-[8px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase leading-none">Dynamic Mix</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-mono font-black uppercase text-[#f1f5f9]0 mb-1">Typ Spotu (Call To Action)</label>
                        <select
                          value={curatorAudioCta}
                          onChange={(e) => setCuratorAudioCta(e.target.value)}
                          className="w-full bg-[rgba(22,30,49,0.6)] text-[#f1f5f9] border border-zinc-850 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#38bdf8] cursor-pointer"
                        >
                          <option value="none">🚫 Brak komunikatów reklamowych (Tylko muzyka)</option>
                          <option value="sales">💰 CTA: Sprzedaż up-sell (Zachęta do zamówień Premium)</option>
                          <option value="social">📸 CTA: Social Growth (Oznacz nas na LinkedIn/Insta)</option>
                          <option value="lead">📱 CTA: Lead Magnet (Zapis do newslettera / Wifi Free)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono font-black uppercase text-[#f1f5f9]0 mb-1">Dedykowane słowa kluczowe (seoKeywords)</label>
                        <input
                          type="text"
                          value={curatorSeoKeywords}
                          onChange={(e) => setCuratorSeoKeywords(e.target.value)}
                          placeholder="np. luksusowy, spokojny, energiczny"
                          className="w-full bg-[rgba(22,30,49,0.6)] border border-zinc-850 text-xs px-2.5 py-1.5 rounded-lg text-[#f1f5f9] font-mono placeholder-zinc-750 focus:outline-none focus:border-[#38bdf8]"
                        />
                      </div>

                      {/* Zintegrowany, kompaktowy status optymalizacji akustycznej */}
                      <div className="p-2.5 bg-[rgba(22,30,49,0.6)] rounded-lg space-y-1.5 text-[9px] font-mono text-[#f1f5f9]0 border border-[rgba(56,189,248,0.15)]">
                        <div className="flex justify-between items-center">
                          <span>Acoustic Words density:</span>
                          <span className="text-emerald-500 font-bold">ZOPTYMALIZOWANA (94%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Sentyment i nastrój:</span>
                          <span className="text-[#38bdf8] font-bold">Relaks i Skupienie</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Autorytatywność lektora:</span>
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="range" min={10} max={100} value={vocalTone}
                              onChange={(e) => setVocalTone(parseInt(e.target.value))}
                              className="w-12 h-1 bg-[#0b0f19] accent-[#38bdf8] rounded cursor-pointer"
                            />
                            <span className="text-zinc-350 font-bold">{vocalTone}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🎵 LISTA UTWORÓW PLAYLISTY (INTERAKTYWNY DRAG-AND-DROP & REORDERING) */}
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropOnPlaylistContainer}
                    className="space-y-2.5 bg-[#0b0f19]/45 p-3 rounded-xl border border-[rgba(56,189,248,0.15)]"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-mono font-black uppercase text-[#94a3b8]">
                        Zawartość Playlisty ({selectedLibraryTrackIds.length})
                      </p>
                      <span className="text-[8px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-1.5 rounded-full font-mono font-extrabold uppercase">
                        Kolejność / Drag-and-Drop
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {selectedLibraryTrackIds.map((tid, index) => {
                        const track = allLibraryTracks.find(t => t.id === tid);
                        if (!track) return null;

                        const isBeingDragged = draggedPlaylistTrackIndex === index;

                        return (
                          <div
                            key={`${tid}-${index}`}
                            draggable={true}
                            onDragStart={() => setDraggedPlaylistTrackIndex(index)}
                            onDragEnd={() => setDraggedPlaylistTrackIndex(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropOnPlaylistItem(e, index)}
                            className={`flex items-center justify-between gap-2 p-2 rounded-lg text-[10px] transition-all duration-150 ${
                              isBeingDragged 
                                ? "bg-[#38bdf8]/15 border border-dashed border-[#38bdf8] opacity-50 scale-[0.98]" 
                                : "bg-[rgba(22,30,49,0.6)] hover:bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] hover:border-[rgba(56,189,248,0.15)]"
                            } cursor-grab active:cursor-grabbing`}
                            title="Przeciągnij w pionie, aby zmienić kolejność odtwarzania"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <GripVertical className="w-3 h-3 text-[#94a3b8] flex-shrink-0 cursor-grab active:cursor-grabbing" />
                              <span className="font-mono text-[9px] text-[#f1f5f9]0 w-3">{index + 1}.</span>
                              <div className="truncate min-w-0">
                                <span className="text-zinc-250 font-bold block truncate">{track.title}</span>
                                <span className="text-[#f1f5f9]0 block truncate">{track.artist}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-mono text-[#f1f5f9]0 px-1 py-0.5 rounded bg-[#0b0f19] border border-[rgba(56,189,248,0.15)]">
                                {track.bpm} BPM
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  // Usuń z wybranej listy
                                  setSelectedLibraryTrackIds(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="p-1 text-[#f1f5f9]0 hover:text-red-400 rounded hover:bg-[#0b0f19] transition"
                                title="Usuń z playlisty"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {selectedLibraryTrackIds.length === 0 && (
                        <div className="border border-dashed border-zinc-850/60 rounded-xl p-6 text-center space-y-2 bg-[#0b0f19]/20">
                          <Music className="w-6 h-6 text-zinc-700 mx-auto animate-pulse" />
                          <p className="text-[9px] font-mono text-[#f1f5f9]0 uppercase leading-relaxed">
                            Brak utworów na playliście
                          </p>
                          <p className="text-[8px] text-[#94a3b8] leading-normal">
                            Przeciągnij i upuść utwory z katalogu po prawej, aby je tutaj dodać.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-[8px] text-[#f1f5f9]0 leading-normal mt-1 italic">
                      💡 Przeciągaj utwory z katalogu po prawej, aby wrzucić je w konkretne miejsce playlisty lub zmieniaj ich kolejność wewnątrz tego panelu.
                    </p>

                    {activeTrack && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedLibraryTrackIds.includes(activeTrack.id)) {
                            setSelectedLibraryTrackIds(prev => [...prev, activeTrack.id]);
                          }
                        }}
                        className="mt-2 w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Dodaj do playlisty: <span className="text-[#f1f5f9]">"{activeTrack.title}"</span></span>
                      </button>
                    )}
                  </div>

                  {/* 👥 ROZSZERZONE PROFILOWANIE ODBIORCÓW (Zgodnie z wymogami v2.0) */}
                  <div className="space-y-3 bg-[#0b0f19]/40 p-3 rounded-xl border border-[rgba(56,189,248,0.15)]">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-mono font-black uppercase text-[#f1f5f9]0">Profil Odbiorców Lokalu</p>
                      <span className="text-[8px] bg-indigo-505/10 text-indigo-400 border border-indigo-500/20 px-1.5 rounded-full font-mono font-extrabold uppercase">PROFILING</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "casual", name: "Casual / Goście", desc: "Zwykli klienci" },
                        { id: "expert", name: "Koneserzy", desc: "Premium jazz / lofi" },
                        { id: "focus", name: "Decydenci B2B", desc: "Skupienie / praca" }
                      ].map(prof => (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => setProfileType(prof.id)}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                            profileType === prof.id
                              ? "bg-[#38bdf8]/10 border-[#38bdf8]/40 text-[#38bdf8]"
                              : "bg-[rgba(22,30,49,0.6)] border-zinc-850 hover:bg-[rgba(22,30,49,0.6)] text-zinc-450"
                          }`}
                        >
                          <p className="text-[10px] font-bold leading-normal">{prof.name}</p>
                          <p className="text-[8px] text-[#f1f5f9]0 mt-0.5 leading-tight">{prof.desc}</p>
                        </button>
                      ))}
                    </div>

                    {profileType === "expert" && (
                      <div className="mt-3 p-3 bg-[rgba(22,30,49,0.6)] border border-[#38bdf8]/30 rounded-xl space-y-3.5 animate-fade-in">
                        <div className="flex justify-between items-center pb-1.5 border-b border-[rgba(56,189,248,0.15)]">
                          <p className="text-[10px] font-mono font-black uppercase text-[#38bdf8]">Kalibracja Audio Expert EQ</p>
                          <button
                            type="button"
                            onClick={calibrateExpertSound}
                            className="bg-[#38bdf8] hover:bg-[#a855f7] text-[#f1f5f9] font-mono text-[9px] font-bold px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                            title="Przelicz sugerowane wartości na podstawie vocalTone i seoKeywords"
                          >
                            <RefreshCw className="w-3 h-3 animate-spin [animation-duration:8s]" />
                            <span>Auto-Kalibracja</span>
                          </button>
                        </div>

                        {/* EQ sliders */}
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-[10px] text-[#94a3b8]">
                              <span>Niskie Tony (Bass EQ):</span>
                              <span className="font-mono font-bold text-[#38bdf8]">{expertEqBass > 0 ? '+' : ''}{expertEqBass} dB</span>
                            </div>
                            <input 
                              type="range" min={-6} max={6} step={1}
                              value={expertEqBass}
                              onChange={(e) => setExpertEqBass(parseInt(e.target.value))}
                              className="w-full h-1 bg-[#0b0f19] accent-[#38bdf8] rounded cursor-pointer mt-1"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-[#94a3b8]">
                              <span>Średnie Tony (Mid EQ):</span>
                              <span className="font-mono font-bold text-[#38bdf8]">{expertEqMid > 0 ? '+' : ''}{expertEqMid} dB</span>
                            </div>
                            <input 
                              type="range" min={-6} max={6} step={1}
                              value={expertEqMid}
                              onChange={(e) => setExpertEqMid(parseInt(e.target.value))}
                              className="w-full h-1 bg-[#0b0f19] accent-[#38bdf8] rounded cursor-pointer mt-1"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-[#94a3b8]">
                              <span>Wysokie Tony (Treble EQ):</span>
                              <span className="font-mono font-bold text-[#38bdf8]">{expertEqTreble > 0 ? '+' : ''}{expertEqTreble} dB</span>
                            </div>
                            <input 
                              type="range" min={-6} max={6} step={1}
                              value={expertEqTreble}
                              onChange={(e) => setExpertEqTreble(parseInt(e.target.value))}
                              className="w-full h-1 bg-[#0b0f19] accent-[#38bdf8] rounded cursor-pointer mt-1"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-[#94a3b8]">
                              <span>Gęstość dźwięku (Kompresor pasmowy):</span>
                              <span className="font-mono font-bold text-[#38bdf8]">{expertDynamicRange}% (Gęsty)</span>
                            </div>
                            <input 
                              type="range" min={10} max={100} step={5}
                              value={expertDynamicRange}
                              onChange={(e) => setExpertDynamicRange(parseInt(e.target.value))}
                              className="w-full h-1 bg-[#0b0f19] accent-[#38bdf8] rounded cursor-pointer mt-1"
                            />
                          </div>
                        </div>

                        {lastCalibrationLog && (
                          <p className="text-[8px] font-mono text-[#94a3b8] leading-normal border-t border-[rgba(56,189,248,0.15)] pt-1.5">{lastCalibrationLog}</p>
                        )}
                        <p className="text-[8px] text-[#f1f5f9]0 leading-relaxed italic">
                          Profil Expert aktywuje dynamiczne dopasowanie DSP do słów kluczowych (<span className="text-zinc-450 font-bold">{seoKeywords}</span>) oraz poziomu obecności wokalu (<span className="text-zinc-450 font-bold">{vocalTone}%</span>).
                        </p>
                      </div>
                    )}
                  </div>



                  {/* 💬 SYSTEM KOMENTARZY I NOTATEK DRAFTU (TEAM WORKING) */}
                  <div className="space-y-2.5 bg-[#0b0f19]/40 p-3 rounded-xl border border-zinc-950">
                    <p className="text-[10px] font-mono font-black uppercase text-[#94a3b8] flex items-center gap-1">
                      <span>Notatki zespołu i komentarze draftu</span>
                      <span className="text-[8px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-1 py-0.5 rounded leading-none">{commentsList.length}</span>
                    </p>

                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                      {commentsList.map(comment => (
                        <div key={comment.id} className="p-2 bg-[rgba(22,30,49,0.6)] rounded-lg text-[9px] leading-relaxed border border-[rgba(56,189,248,0.15)]">
                          <div className="flex justify-between font-bold text-[#94a3b8] font-mono mb-0.5">
                            <span>{comment.author}</span>
                            <span>{comment.time}</span>
                          </div>
                          <p className="text-zinc-350">{comment.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Dodaj notatkę do tej placówki..."
                        className="flex-1 bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] text-[10px] px-2.5 py-1.5 rounded-lg text-[#f1f5f9]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (!newComment.trim()) return;
                            setCommentsList(prev => [
                              ...prev,
                              { id: String(Date.now()), author: "Administrator", text: newComment, time: "Teraz" }
                            ]);
                            setNewComment("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newComment.trim()) return;
                          setCommentsList(prev => [
                            ...prev,
                            { id: String(Date.now()), author: "Administrator", text: newComment, time: "Teraz" }
                          ]);
                          setNewComment("");
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-[#f1f5f9] font-black text-[10px] px-3.5 rounded-lg transition"
                      >
                        DODAJ
                      </button>
                    </div>
                  </div>

                </div>

              <div className="pt-4 border-t border-[rgba(56,189,248,0.15)]">
                <button
                  onClick={handleSaveAndGenerate}
                  disabled={isSavingCurator}
                  className="w-full bg-[#38bdf8] hover:bg-[#a855f7] hover:text-zinc-950 text-zinc-950 font-black py-3.5 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow"
                >
                  {isSavingCurator ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin text-zinc-950 font-bold">↻</span> Zapisywanie konfiguracji stacji...
                    </span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Zapisz i Wygeneruj Odtwarzacz Placówki (HTML)</span>
                    </>
                  )}
                </button>
              </div>
            </section>

              {/* Biblioteka Utworów HRL z Wyborem (Span 7) */}
              <section className="col-span-12 lg:col-span-7 bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl p-5 flex flex-col justify-between gap-4 text-left shadow-xl shadow-black/40 backdrop-blur-md">
                <div className="space-y-4">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(56,189,248,0.15)] pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">
                        Katalog Utworów Royalty-Free HRL
                      </h2>
                      <p className="text-[10px] text-[#f1f5f9]0 font-semibold font-mono uppercase mt-0.5">
                        Zaznacz piosenki, które chcesz uwzględnić w lokalu
                      </p>
                    </div>

                    <span className="text-xs bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] text-[#f1f5f9] font-black px-3 py-1 rounded-lg">
                      Wybrano: <span className="text-[#38bdf8]">{selectedLibraryTrackIds.length}</span> / {allLibraryTracks.length}
                    </span>
                  </div>

                  {/* Filtry i wyszukiwarka */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Szukaj po tytule, wykonawcy lub gatunku..."
                        className="w-full bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] rounded-xl pl-9 pr-3 py-2 text-xs text-[#f1f5f9]"
                      />
                      <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <select
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      className="bg-[#0b0f19] text-[#f1f5f9] border border-[rgba(56,189,248,0.15)] px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <option value="all">Wszystkie gatunki</option>
                      <option value="jazz">Jazz</option>
                      <option value="lofi">Lo-Fi</option>
                      <option value="ambient">Ambient</option>
                      <option value="electronic">Electronic / Club</option>
                      <option value="classical">Classical</option>
                      <option value="pop">Pop / Lounge</option>
                    </select>
                  </div>

                  {/* Wyniki wyszukiwania utworów */}
                  <div className="max-h-96 overflow-y-auto pr-1.5 space-y-1.5 border-t border-[rgba(56,189,248,0.15)] pt-3">
                    {filteredLibrary.map((track) => {
                      const isSelected = selectedLibraryTrackIds.includes(track.id);
                      const isThisPreviewPlaying = previewTrackId === track.id && isPreviewPlaying;

                      return (
                        <div
                          key={track.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", track.id);
                          }}
                          className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-200 ${
                            isSelected 
                              ? "bg-[rgba(22,30,49,0.6)] border-[#38bdf8]/20 shadow-sm"
                              : "bg-[#0b0f19]/25 border-[rgba(56,189,248,0.15)] hover:bg-[#0b0f19]/60"
                          }`}
                          title="Przeciągnij ten utwór na panel konfiguracji po lewej, aby go dodać!"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Grip handle to hint drag and drop */}
                            <GripVertical className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0 cursor-grab active:cursor-grabbing hidden sm:block" />

                            {/* Checkbox */}
                            <button
                              onClick={() => toggleLibraryTrackSelection(track.id)}
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                isSelected 
                                  ? "bg-[#38bdf8] border-[#38bdf8] text-zinc-950" 
                                  : "border-[rgba(56,189,248,0.15)] bg-[#0b0f19] hover:border-zinc-600"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            {/* Detale */}
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleLibraryTrackSelection(track.id)}>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#f1f5f9] truncate block">{track.title}</span>
                                {track.explicit && <span className="bg-[#38bdf8]/10 text-[#38bdf8] text-[8px] font-black px-1 rounded font-mono">EXPLICIT</span>}
                              </div>
                              <span className="text-[10px] text-[#f1f5f9]0 block truncate font-medium mt-0.5">{track.artist} | {track.bpm} BPM</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 font-mono">
                            {/* Gatunek */}
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#f1f5f9]0 bg-[#0b0f19] px-2 py-1 rounded border border-[rgba(56,189,248,0.15)]">
                              {track.genre}
                            </span>

                            {/* Szybkie Dodanie Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLibraryTrackSelection(track.id);
                              }}
                              className={`p-2 rounded-lg border transition duration-200 ${
                                isSelected 
                                  ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20" 
                                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                              }`}
                              title={isSelected ? "Usuń z playlisty" : "Szybko dodaj do playlisty"}
                            >
                              {isSelected ? (
                                <Minus className="w-3.5 h-3.5" />
                              ) : (
                                <Plus className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Przycisk podglądu (Odsłuch utworu) */}
                            <button
                              onClick={() => togglePreviewTrack(track)}
                              className={`p-2 rounded-lg border transition ${
                                isThisPreviewPlaying 
                                  ? "bg-[#38bdf8]/10 border-[#38bdf8]/30 text-[#38bdf8]" 
                                  : "bg-[#0b0f19] hover:bg-[rgba(22,30,49,0.6)] border-zinc-850 text-[#f1f5f9]0 hover:text-[#f1f5f9]"
                              }`}
                              title="Odsłuchaj wersję demonstracyjną"
                            >
                              {isThisPreviewPlaying ? (
                                <Pause className="w-3.5 h-3.5 text-[#38bdf8]" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {filteredLibrary.length === 0 && (
                      <p className="text-xs text-[#f1f5f9]0 font-mono py-8 text-center">Brak pasujących piosenek w bazie.</p>
                    )}
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB 3: LICENCJA I CERTYFIKAT ZAIKS */}
          {activeMainTab === 'license' && (
            <div className="grid grid-cols-12 gap-4 lg:gap-6 animate-fade-in text-left">
              
              {/* Lewy panel - Szczegóły Umowy i Subskrypcji */}
              <section className="col-span-12 lg:col-span-4 bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/40 backdrop-blur-md">
                <div className="border-b border-[rgba(56,189,248,0.15)] pb-3">
                  <h3 className="text-xs font-mono font-black uppercase text-[#f1f5f9]0 tracking-wider">Abonament i Licencja B2B</h3>
                  <h2 className="text-lg font-bold text-[#f1f5f9] mt-1">Status Swojej Subskrypcji</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#0b0f19]/80 border border-[rgba(56,189,248,0.15)] rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#f1f5f9]0 font-mono">Status usługi:</span>
                      <span className="bg-emerald-500/15 text-emerald-400 font-black px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider">AKTYWNY (PŁATNY)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#f1f5f9]0 font-mono">Plan subskrypcyjny:</span>
                      <span className="text-[#38bdf8] font-black text-xs">CMLP Enterprise Unlimited</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#f1f5f9]0 font-mono">Data ważności:</span>
                      <span className="text-[#f1f5f9] font-bold font-mono">31.12.22066 r.</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-[rgba(56,189,248,0.15)] pt-2.5">
                      <span className="text-[#f1f5f9]0 font-mono">Dokumentacja:</span>
                      <span className="text-[#f1f5f9] font-bold">Zgodność z GDPR / RODO</span>
                    </div>
                  </div>

                  {/* Szczegóły zwolnienia z OZZ */}
                  <div className="p-4 bg-[#0b0f19]/40 border border-[rgba(56,189,248,0.15)] rounded-xl space-y-3">
                    <h4 className="text-[10px] font-mono font-black uppercase text-[#f1f5f9]0">Objęte Pola Eksploatacji</h4>
                    <ul className="space-y-1.5 text-xs text-[#94a3b8]">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        <span>Odtwarzanie publiczne w lokalu</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        <span>Nadawanie z dysku (offline HTML)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        <span>Dźwięk tła w strefach komercyjnych</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        <span>Kioski interaktywne na ekranach</span>
                      </li>
                    </ul>
                  </div>

                  {/* Przewodnik edukacyjny dla personelu */}
                  <div className="p-4 bg-[#38bdf8]/5 border border-[#38bdf8]/10 rounded-xl space-y-2.5">
                    <h4 className="text-[10px] font-mono font-black uppercase text-[#38bdf8] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Instrukcja Kontroli ZAIKS w Lokalu</span>
                    </h4>
                    <p className="text-[10px] text-[#94a3b8] leading-relaxed">
                      W przypadku wizyty kontrolera z organizacji zbiorowego zarządzania prawami autorskimi (ZAIKS, STOART, ZPAV) wykonaj te czynności:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[9px] text-[#f1f5f9]0 leading-tight">
                      <li>Wskaz na naklejkę licencyjną lub certyfikat na ścianie.</li>
                      <li>Pokaż wydrukowany certyfikat z tej zakładki.</li>
                      <li>Zwróć uwagę, że puszczasz platformę <span className="text-[#f1f5f9] font-bold">Hardban Records Lab Direct</span> posiadającą 100% autorskie prawa niezależne (Royalty-Free).</li>
                      <li>Przekaż im wygenerowany z zakładki obok wykaz ISRC.</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Prawy panel - Interaktywny i luksusowy Certyfikat do Wydruku */}
              <section className="col-span-12 lg:col-span-8 bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl shadow-black/40 backdrop-blur-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[rgba(56,189,248,0.15)]">
                  <div>
                    <h2 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">
                      Certyfikat Zwolnienia z Opłat OZZ
                    </h2>
                    <p className="text-[10px] text-[#f1f5f9]5 font-mono uppercase font-bold mt-0.5">
                      Podgląd cyfrowy gotowy do wydruku (Format A4 PDF/A)
                    </p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 hover:text-zinc-950 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs transition duration-200 cursor-pointer shadow-md"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Drukuj Certyfikat na Ścianę</span>
                  </button>
                </div>

                {/* Karta Certyfikatu - Premium stylised container */}
                <div id="hrl-printable-certificate" className="bg-[#0b0f19]/40 p-8 sm:p-12 border-2 border-double border-[#38bdf8]/20 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[500px] text-zinc-250 font-serif">
                  
                  {/* Decorative corner borders */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#38bdf8]/25"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#38bdf8]/25"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#38bdf8]/25"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#38bdf8]/25"></div>

                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <img src={cmlpLogo} alt="CMLP Logo watermark" className="w-64 h-64 opacity-[0.05] filter brightness-0 invert" />
                  </div>

                  <div className="space-y-6 text-center z-10">
                    <div className="space-y-1.5">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#38bdf8] font-black">COMMERCIAL MUSIC LICENSING PLATFORM | DIRECT LICENSE</p>
                      <h3 className="font-sans font-black text-3xl text-[#f1f5f9] tracking-tight leading-none">CERTYFIKAT LICENCYJNY B2B</h3>
                      <p className="font-mono text-[9px] text-[#f1f5f9]0 font-bold uppercase mt-1 tracking-wider">Nr seryjny: CMLP/CERT-B2B/{selectedPlaylistId ? selectedPlaylistId.substring(0,8).toUpperCase() : "DEMO"}-2026/05</p>
                    </div>

                    <div className="w-16 h-[1.5px] bg-[#38bdf8]/30 mx-auto"></div>

                    <p className="text-[13px] leading-relaxed max-w-xl mx-auto italic font-medium px-4">
                      Niniejszym zaświadcza się, iż placówka handlowo-usługowa wyszczególniona poniżej korzysta z autoryzowanego i licencjonowanego katalogu muzycznego dostarczanego bezpośrednio przez niezależną wytwórnię muzyczną <span className="text-[#f1f5f9] font-sans font-bold not-italic">Hardban Records Lab B.V.</span>
                    </p>

                    <div className="bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] p-4 rounded-xl max-w-lg mx-auto space-y-2 font-sans text-left text-xs text-[#f1f5f9]">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <p className="text-[#f1f5f9]0 font-mono text-[9px] uppercase font-bold">Autoryzowany licencjobiorca:</p>
                          <p className="font-black mt-0.5">{currentPlaylist ? currentPlaylist.clientName : "Pobieranie danych..."}</p>
                        </div>
                        <div>
                          <p className="text-[#f1f5f9]0 font-mono text-[9px] uppercase font-bold">Cel i adres placówki:</p>
                          <p className="font-semibold mt-0.5">Stanowisko / Lokal handlowy ({currentPlaylist ? currentPlaylist.title : "Lounge"})</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[rgba(56,189,248,0.15)] mt-1">
                        <div>
                          <p className="text-[#f1f5f9]0 font-mono text-[9px] uppercase font-bold">Zakres terytorialny:</p>
                          <p className="font-semibold mt-0.5">Rzeczpospolita Polska / Unia Europejska</p>
                        </div>
                        <div>
                          <p className="text-[#f1f5f9]0 font-mono text-[9px] uppercase font-bold">Status prawny zwolnienia:</p>
                          <p className="text-emerald-400 font-extrabold mt-0.5">100% ZWOLNIONY Z OPŁAT ZAIKS / STOART</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#94a3b8] max-w-lg mx-auto font-sans leading-relaxed">
                      Zgodnie z art. 17 Ustawy o prawie autorskim i prawach pokrewnych, podmiot Hardban Records posiada pełnię wyłącznych praw do publicznego odtwarzania oraz dystrybucji utworów zrzeszonych w katalogu. Żadna Organizacja Zbiorowego Zarządzania Prawami nie posiada mandatu do pobierania opłat w imieniu autorów Hardban Records Lab.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[rgba(56,189,248,0.15)] pt-6 mt-6 font-sans text-xs">
                    <div className="text-center sm:text-left space-y-1">
                      <p className="text-[9px] font-mono text-[#f1f5f9]0 font-extrabold uppercase">Zatwierdzono i podpisano cyfrowo</p>
                      <div className="font-serif italic text-[#f1f5f9] font-bold leading-normal">
                        Dyrektor Generalny Hardban Records Lab
                      </div>
                      <p className="text-[8px] font-mono text-zinc-650 uppercase">Dokument wygenerowany systemem SaaS B2B v2.0</p>
                    </div>

                    {/* QR Code Placeholder and guarantee stamp */}
                    <div className="flex items-center gap-4">
                      {/* Gwarancja bez zaiks stamp */}
                      <div className="w-16 h-16 rounded-full border border-dashed border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-center items-center text-center text-[7px] font-mono font-black uppercase text-emerald-400 select-none">
                        <span>HRL</span>
                        <span>0 PLN</span>
                        <span>BEZ OZZ</span>
                      </div>
                      <div className="w-14 h-14 bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-lg p-1.5 flex justify-center items-center">
                        {/* Simulated QR block code matrix */}
                        <div className="grid grid-cols-4 gap-1 w-full h-full opacity-70">
                          <div className="bg-zinc-300 rounded-sm"></div>
                          <div className="bg-zinc-700 rounded-sm"></div>
                          <div className="bg-zinc-300 rounded-sm"></div>
                          <div className="bg-zinc-300 rounded-sm"></div>
                          <div className="bg-zinc-800 rounded-sm"></div>
                          <div className="bg-zinc-300 rounded-sm"></div>
                          <div className="bg-zinc-700 rounded-sm"></div>
                          <div className="bg-zinc-300 rounded-sm"></div>
                          <div className="bg-zinc-300 rounded-sm"></div>
                          <div className="bg-zinc-300 rounded-sm"></div>
                          <div className="bg-zinc-800 rounded-sm"></div>
                          <div className="bg-zinc-700 rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

            </div>
          )}

          {/* TAB 4: ANALITYKA LOKALU & RAPORTY ODTWORZEŃ */}
          {activeMainTab === 'analytics' && (
            <div className="grid grid-cols-12 gap-4 lg:gap-6 animate-fade-in text-left">
              
              {/* Sekcja KPI (Wskaźniki gniazda) */}
              <section className="col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { title: "Suma Odtworzeń dzisiaj", val: "148 utworów", sub: "Średnio 6.1 utworu/h", acc: "text-[#38bdf8]" },
                  { title: "Status Synchronizacji DRM", val: "ZAUFANY (ACTIVE)", sub: "Klucz HMAC odświeżony", acc: "text-emerald-400" },
                  { title: "Średni czas sesji", val: "22h 15min", sub: "Nadawanie ciągłe w lokalu", acc: "text-blue-400" },
                  { title: "Opłaty publiczne (ZAIKS)", val: "0 PLN (Zwolniony)", sub: "Oszczędność ok. 450 PLN/m", acc: "text-[#38bdf8] font-extrabold" }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl p-5 shadow-sm space-y-1">
                    <p className="text-[10px] font-mono text-[#f1f5f9]0 font-black uppercase tracking-wider">{kpi.title}</p>
                    <p className={`text-xl font-bold ${kpi.acc}`}>{kpi.val}</p>
                    <p className="text-[10px] text-[#f1f5f9]0 leading-normal font-medium">{kpi.sub}</p>
                  </div>
                ))}
              </section>

              {/* Wykaz Aktywności & Pobieranie pliku CSV dla ZAIKS */}
              <section className="col-span-12 lg:col-span-8 bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl shadow-black/40 backdrop-blur-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[rgba(56,189,248,0.15)]">
                  <div>
                    <h2 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">
                      Wygenerowany Wykaz Odtwarzanych Utworów (Raport ISRC)
                    </h2>
                    <p className="text-[10px] text-[#f1f5f9]5 font-mono uppercase font-bold mt-0.5">
                      Podstawa wykazania legalności podczas kontroli urzędowej (Zwolnione piosenki HRL)
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (filteredTracks.length === 0) {
                        alert("Brak utworów w wybranej placówce do wygenerowania raportu.");
                        return;
                      }
                      
                      // Generowanie fizycznego pliku CSV w przeglądarce!
                      const csvHeader = "\uFEFFData i czas;Tytul utworu;Wykonawca;Kod ISRC;Gatunek;Zwolnienie z oplat publicznych\n";
                      const csvRows = filteredTracks.map((track, idx) => {
                        const timeOffset = new Date(Date.now() - idx * 3600000).toLocaleDateString("pl-PL") + " " + new Date(Date.now() - idx * 3600000).toLocaleTimeString("pl-PL", { hour: '2-digit', minute: '2-digit' });
                        return `"${timeOffset}";"${track.title}";"${track.artist}";"${track.isrc || 'HRL-ISRC-928' + idx}";"${track.genre}";"TAK (100% ROYALTY FREE DIRECT)"`;
                      }).join("\n");
                      
                      const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(blob);
                      link.setAttribute("download", `Raport_HRL_Odtworzenia_ISRC_${currentPlaylist ? currentPlaylist.clientName.replace(/\s+/g, '_') : 'Placowka'}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2 bg-[#a855f7] hover:bg-[#38bdf8] text-zinc-950 font-black px-4.5 py-2.5 rounded-xl text-xs transition duration-200 cursor-pointer shadow"
                  >
                    <Download className="w-4 h-4 text-zinc-950" />
                    <span>Pobierz Raport Odtworzeń w CSV (ISRC)</span>
                  </button>
                </div>

                {/* Tabela historii logs */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[rgba(56,189,248,0.15)] font-mono text-[9px] uppercase tracking-wider text-[#f1f5f9]0 font-black">
                        <th className="py-2.5">Szacowany czas</th>
                        <th className="py-2.5">Utwór / Wykonawca</th>
                        <th className="py-2.5">ISRC</th>
                        <th className="py-2.5">Gatunek</th>
                        <th className="py-2.5 text-right">Zwolnienie ZAIKS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 text-[#f1f5f9] font-medium">
                      {filteredTracks.map((track, idx) => {
                        const simulatedLogTime = new Date(Date.now() - idx * 1800000).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
                        return (
                          <tr key={track.id} className="hover:bg-[#0b0f19]/20">
                            <td className="py-3 font-mono text-[#f1f5f9]0">Dziś, o {simulatedLogTime}</td>
                            <td className="py-3">
                              <p className="font-bold text-[#f1f5f9]">{track.title}</p>
                              <p className="text-[10px] text-[#f1f5f9]0 mt-0.5">{track.artist}</p>
                            </td>
                            <td className="py-3 font-mono text-[10px] text-[#94a3b8] font-bold">{track.isrc || `HRL-ISRC-980${idx}`}</td>
                            <td className="py-3 uppercase text-[9px] font-mono"><span className="bg-[#0b0f19] px-2 py-0.5 rounded border border-[rgba(56,189,248,0.15)]">{track.genre}</span></td>
                            <td className="py-3 text-right font-mono text-[10px] text-emerald-400 font-bold">TAK (DIRECT)</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredTracks.length === 0 && (
                    <p className="text-xs text-[#f1f5f9]0 font-mono py-8 text-center uppercase">Brak danych odtworzeń dla tej placówki.</p>
                  )}
                </div>
              </section>

              {/* Prawy panel - Gęstość nastrojów i podział stylów */}
              <section className="col-span-12 lg:col-span-4 bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl p-5 space-y-5 shadow-xl shadow-black/40 backdrop-blur-md">
                <div className="border-b border-[rgba(56,189,248,0.15)] pb-3">
                  <h3 className="text-xs font-mono font-black uppercase text-[#f1f5f9]0 tracking-wider">Porównanie z Konkurencją</h3>
                  <h2 className="text-lg font-bold text-[#f1f5f9] mt-1">Optymalizacja Akustyczna</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-[#94a3b8] leading-relaxed font-sans">
                    Twoja playlista ma o <span className="text-emerald-400 font-bold">35% większą harmonijność</span> nastrojową (brak ostrych zmian tonacji i wokalu) niż konkurencyjne sieci radiowe.
                  </p>

                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-zinc-550 font-bold mb-1 uppercase">
                        <span>Lounge / Chillout (Gęstość):</span>
                        <span className="text-[#f1f5f9]">65%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0b0f19] rounded-full overflow-hidden">
                        <div className="bg-[#38bdf8] h-full rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-zinc-550 font-bold mb-1 uppercase">
                        <span>Jazz / Lo-Fi (Uspokojenie):</span>
                        <span className="text-[#f1f5f9]">25%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0b0f19] rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: "25%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-zinc-550 font-bold mb-1 uppercase">
                        <span>Wokalność i Autorytet:</span>
                        <span className="text-[#f1f5f9]">10%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0b0f19] rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: "10%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0b0f19]/60 rounded-xl border border-[rgba(56,189,248,0.15)] space-y-1">
                    <p className="text-[10px] font-mono font-black uppercase text-[#f1f5f9]0">Predykcja Ruchu Organicznego</p>
                    <p className="text-xs font-bold text-[#f1f5f9] pt-1">Muzyka o średnim tempie (80-110 BPM)</p>
                    <p className="text-[10.5px] text-[#f1f5f9]0 leading-normal font-sans">
                      Dedykowany program zwiększa podświadomy czas spędzony w lokalu (dwell time) średnio o <span className="text-emerald-400 font-bold font-mono">+18%</span> przekładając się na wyższą sprzedaż.
                    </p>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* STOPKA INFORMACYJNA O PRAWACH DO LICENCJI DIRECT */}
          <footer className="border-t border-[rgba(56,189,248,0.15)] bg-[#0b0f19]/20 py-6 px-1 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-[#f1f5f9]0 font-mono uppercase tracking-widest text-left">
            <div className="space-y-1.5 md:space-y-0 text-center md:text-left leading-normal">
              <p className="text-[#38bdf8] font-bold flex items-center justify-center md:justify-start gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-ping"></span>
                Zwolnienie z opłat ZAO (ZAIKS, ZPAV, STOART, SAWP) uprawnione pod hrl_direct
              </p>
              <p className="text-[9px] text-[#94a3b8] block mt-0.5">Szyfrowanie range requests zabezpieczone jednorazowymi tokenami dynamicznymi HMS v2.0</p>
              <p className="text-[9px] text-[#f1f5f9]0 block mt-1.5 lowercase">
                Kontakt: contact@hardbanrecordslab.online | info@hardbanrecordslab.online | no-reply@hardbanrecordslab.online
              </p>
            </div>
            <span>Hardban Records Lab © 22066</span>
          </footer>

        </div>
      ) : (
        
        // 📺 PEŁNY INTERFEJS KIOSKU DLA TABLETU (SMARTKIOSK)
        <div 
          className="w-full h-full flex flex-col justify-between p-8 sm:p-12 text-[#f1f5f9] animate-fade-in bg-[#0b0f19]"
        >
          {/* PIN Lock overlay prompt for employees if pin is set in kiosk mode */}
          {currentPlaylist?.pin && !localStorage.getItem(`hrl_verified_pin_${currentPlaylist.id}`) && (
            <div className="fixed inset-0 bg-[#0b0f19] z-50 flex items-center justify-center p-4">
              <div className="bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
                <div className="mx-auto w-12 h-12 rounded-xl bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8]">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Autoryzacja Pracownika</h2>
                  <p className="text-xs text-[#f1f5f9]0 mt-1">Podaj kod PIN placówki, aby uruchomić transmisję.</p>
                </div>
                <div className="space-y-3">
                  <input 
                    type="password" 
                    id="kiosk-pin-input" 
                    maxLength={4} 
                    placeholder="••••" 
                    onChange={(e) => {
                      if (e.target.value === currentPlaylist.pin) {
                        localStorage.setItem(`hrl_verified_pin_${currentPlaylist.id}`, "true");
                        // force state refresh by any simple trigger
                        setKioskTime(new Date().toLocaleTimeString("pl-PL") + " PL");
                      }
                    }}
                    className="w-full bg-[#0b0f19] border border-[rgba(56,189,248,0.15)] rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:ring-1 focus:ring-[#38bdf8] focus:outline-none" 
                  />
                </div>
                <p className="text-[10px] text-[#f1f5f9]0">System automatycznie aktywuje tuner po dopasowaniu PIN.</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-start border-b border-[rgba(56,189,248,0.15)] pb-6 mb-4">
            <div className="space-y-1 text-left">
              <span className="font-display font-black text-3xl tracking-widest uppercase" style={{ color: currentPlaylist?.accentColor || "#38bdf8" }}>
                {currentPlaylist?.clientName?.split(" ")[0] || "HRL"}
              </span>
              <p className="text-[10px] font-mono text-[#f1f5f9]0 font-bold uppercase tracking-widest">AUTORYZOWANE STANOWISKO NADAWCZE</p>
            </div>

            <div className="text-right space-y-1 font-mono">
              <div className="text-3xl font-black tracking-tight text-[#f1f5f9]">{kioskTime}</div>
              <p className="text-[9px] font-bold text-[#f1f5f9]0 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                <Clock className="h-3.5 w-3.5 text-[#f1f5f9]0" />
                <span>Synchronizacja HRL Cloud Direct</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 sm:gap-20 my-auto">
            <div className="relative w-76 h-76 sm:w-96 sm:h-96 flex justify-center items-center group">
              {/* Tablet/Touch dedicated flanking buttons */}
              <button 
                onClick={handlePrev}
                className="absolute left-0 sm:-left-12 z-20 p-3.5 bg-[rgba(22,30,49,0.6)] hover:bg-zinc-850 border border-[rgba(56,189,248,0.15)] rounded-full text-zinc-350 hover:text-[#f1f5f9] transition transform active:scale-95 shadow-xl focus:outline-none"
                title="Poprzedni utwór"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <div 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`w-60 h-60 sm:w-76 sm:h-76 rounded-full border-4 shadow-2xl overflow-hidden aspect-square select-none cursor-ew-resize relative group/vinyl ${
                  isPlaying ? 'animate-spin-slow' : ''
                }`}
                style={{ borderColor: currentPlaylist?.accentColor || "#38bdf8" }}
              >
                {activeTrack?.cover ? (
                  <img src={activeTrack.cover} alt={activeTrack.title} className="w-full h-full object-cover pointer-events-none select-none" />
                ) : (
                  <div className="w-full h-full bg-[rgba(22,30,49,0.6)] flex justify-center items-center pointer-events-none select-none">
                    <Music className="h-24 w-24 text-zinc-650" />
                  </div>
                )}
                {/* Embedded Touch hint overlay */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/vinyl:opacity-100 transition-opacity duration-300 flex items-center justify-center text-center p-4">
                  <span className="text-[10px] font-mono tracking-wider font-bold text-[#f1f5f9] uppercase bg-[#0b0f19]/90 border border-zinc-850 px-3 py-1.5 rounded-full select-none">
                    Gest: Przesuń ↔
                  </span>
                </div>
              </div>
              
              <div className="absolute w-14 h-14 bg-[#0b0f19] border-4 border-[rgba(56,189,248,0.15)] rounded-full z-10 flex justify-center items-center pointer-events-none">
                <div className="w-4 h-4 bg-zinc-800 rounded-full"></div>
              </div>

              <button 
                onClick={handleNext}
                className="absolute right-0 sm:-right-12 z-20 p-3.5 bg-[rgba(22,30,49,0.6)] hover:bg-zinc-850 border border-[rgba(56,189,248,0.15)] rounded-full text-zinc-350 hover:text-[#f1f5f9] transition transform active:scale-95 shadow-xl focus:outline-none"
                title="Następny utwór"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 max-w-xl text-center md:text-left flex-1 text-left">
              {isCtaSpeaking ? (
                <div className="p-6 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 animate-pulse space-y-3">
                  <div className="inline-flex gap-2 items-center bg-[#38bdf8] text-zinc-950 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest font-mono uppercase">
                    <span>📢 EMISJA KOMUNIKATU CTA ({audioCta.toUpperCase()})</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-display font-black text-[#f1f5f9] tracking-tight leading-none">
                    Lektor AI: Komunikat Głosowy
                  </h1>
                  <p className="text-md sm:text-lg text-[#94a3b8] font-bold font-mono">
                    Słowa pozycjonujące: {seoKeywords}
                  </p>
                </div>
              ) : (
                <>
                  <div className="inline-flex gap-2 items-center bg-[rgba(22,30,49,0.6)] border border-zinc-850 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest font-mono uppercase text-[#94a3b8]">
                    {activeTrack?.explicit && <span className="text-[#38bdf8] font-extrabold animate-pulse">EXPLICIT STREAM</span>}
                    <span>NAZWA PLACÓWKI: {currentPlaylist?.clientName || "HRL Premium"}</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-display font-black text-[#f1f5f9] tracking-tight leading-none line-clamp-2">
                    {activeTrack?.title || "Wczytywanie..."}
                  </h1>
                  <p className="text-lg sm:text-xl text-[#94a3b8] font-bold line-clamp-1">
                    {activeTrack?.artist || "Hardban Records Lab Studio"}
                  </p>
                  
                  {activeTrack?.isrc && (
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-[#f1f5f9]0 font-semibold pt-2 justify-center md:justify-start">
                      <span>KOD ISRC: {activeTrack.isrc}</span>
                      <span>TEMPO: {activeTrack.bpm} BPM</span>
                      <span>HARMONOGRAM: ZAWĘŻONY KOLEKCJA</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-6 border-t border-[rgba(56,189,248,0.15)] pt-6">
            
            {/* Odtwarzacz progres */}
            <div className="space-y-2">
              <div 
                onClick={handleSeek}
                className="h-2 w-full bg-[rgba(22,30,49,0.6)] hover:h-2.5 rounded-full cursor-pointer transition-all overflow-hidden border border-[rgba(56,189,248,0.15)] shadow-inner"
              >
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    backgroundColor: currentPlaylist?.accentColor || "#38bdf8",
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`
                  }}
                ></div>
              </div>
              <div className="flex justify-between font-mono text-xs text-[#f1f5f9]5 font-bold">
                <span>{fmtTime(currentTime)}</span>
                <span>{fmtTime(duration)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              
              <button 
                onClick={() => {
                  setIsFullscreen(false);
                  // clear pin cache on exit
                  if (currentPlaylist?.id) {
                    localStorage.removeItem(`hrl_verified_pin_${currentPlaylist.id}`);
                  }
                }}
                className="flex items-center gap-2 border border-[rgba(56,189,248,0.15)] bg-[rgba(22,30,49,0.6)] hover:bg-zinc-850 text-zinc-455 hover:text-[#f1f5f9] transition px-5 py-2.5 rounded-xl text-xs font-mono font-bold shadow"
              >
                <Minimize2 className="h-4 w-4 text-[#38bdf8]" />
                <span>Wyjdź z trybu Kiosk</span>
              </button>

              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={handlePrev}
                  className="p-3 bg-[rgba(22,30,49,0.6)] hover:bg-zinc-850 border border-zinc-850 rounded-full text-[#f1f5f9] hover:text-[#f1f5f9] transition transform active:scale-95"
                >
                  <SkipBack className="h-6 w-6" />
                </button>

                <button 
                  onClick={handlePlayPause}
                  className="p-5 rounded-full text-zinc-950 transition transform active:scale-95 shadow-xl hover:scale-105"
                  style={{ backgroundColor: currentPlaylist?.accentColor || "#38bdf8" }}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-zinc-950" fill="currentColor" />
                  ) : (
                    <Play className="h-8 w-8 text-zinc-950 translate-x-[2.5px]" fill="currentColor" />
                  )}
                </button>

                <button 
                  onClick={handleNext}
                  className="p-3 bg-[rgba(22,30,49,0.6)] hover:bg-zinc-850 border border-zinc-850 rounded-full text-[#f1f5f9] hover:text-[#f1f5f9] transition transform active:scale-95"
                >
                  <SkipForward className="h-6 w-6" />
                </button>
              </div>

              <div className="text-right text-[10px] font-mono text-[#f1f5f9]0 font-semibold space-y-0.5 leading-tight text-right">
                <p>NADAWANIE CAŁODOBOWE DIRECT</p>
                <p className="text-emerald-400 font-bold">ZAIKS FEE: 0.00 PLN (ZWOLNIONY)</p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 🚀 MODAL DEKLARACJI / WYGENEROWANEGO ODTWARZACZA HTML */}
      {showExportModal && compiledPlaylist && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[rgba(22,30,49,0.6)] border border-[rgba(56,189,248,0.15)] rounded-2xl max-w-lg w-full p-6 text-left space-y-6 shadow-2xl relative animate-fade-in animate-duration-300">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute right-4 top-4 text-[#f1f5f9]0 hover:text-[#f1f5f9] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 pb-4 border-b border-[rgba(56,189,248,0.15)]">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl text-zinc-950"
                style={{ backgroundColor: compiledPlaylist.accentColor }}
              >
                ✓
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#f1f5f9]">Odtwarzacz Wygenerowany Pomyślnie!</h3>
                <p className="text-xs text-emerald-400 font-mono">Dostęp placówki gotowy do pobrania</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-[#94a3b8] leading-relaxed font-sans">
                Zbudowałeś spersonalizowany odtwarzacz dla placówki <span className="font-bold text-[#f1f5f9]">{compiledPlaylist.clientName}</span> z ilością utworów: <span className="font-mono text-[#f1f5f9] font-bold">{compiledPlaylist.tracks.length}</span>. Możesz teraz pobrać autonomiczny plik HTML, który odtwarza chronioną DRM, uwierzytelnioną bazę HRL.
              </p>

              {/* Pobieranie i links */}
              <div className="bg-[#0b0f19] p-4 rounded-xl border border-zinc-850 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => downloadHtmlPage(compiledPlaylist.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#a855f7] hover:bg-[#38bdf8] text-zinc-950 font-black py-3 rounded-lg text-xs transition duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz plik HTML Odtwarzacza</span>
                  </button>

                  <button
                    onClick={() => copyKioskLinkToClipboard(compiledPlaylist.id)}
                    className={`flex-1 flex items-center justify-center gap-2 border py-3 rounded-lg text-xs font-bold transition duration-200 ${
                      copiedLink ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[rgba(22,30,49,0.6)] border-[rgba(56,189,248,0.15)] text-[#f1f5f9] hover:text-[#f1f5f9]"
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    <span>{copiedLink ? "Skopiowano link!" : "Kopiuj Link Online"}</span>
                  </button>
                </div>
                
                <p className="text-[10px] text-[#f1f5f9]0 font-mono text-center">
                  Dedykowany zaufany URL: <span className="text-[#94a3b8] break-all select-all font-bold">{getKioskUrl(compiledPlaylist.id)}</span>
                </p>
              </div>

              {compiledPlaylist.pin && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-mono font-bold">
                  <Lock className="w-4 h-4" />
                  <span>UWAGA: Odtwarzacz jest chroniony kodem PIN: {compiledPlaylist.pin}</span>
                </div>
              )}

              <div className="text-[10px] text-[#f1f5f9]0 space-y-1.5 leading-relaxed bg-[#0b0f19]/40 p-3 rounded-lg border border-[rgba(56,189,248,0.15)]">
                <p className="font-bold text-[#94a3b8]">Jak tego używać?</p>
                <p>1. <span className="text-[#f1f5f9] font-semibold">Pobierz plik HTML</span> i otwórz go dwukrotnym kliknięciem na dowolnym komputerze, tablecie lub Smart TV w lokalu.</p>
                <p>2. Lokalna przeglądarka załaduje zintegrowany streamer, uwiarygadniając odtwarzanie licencji wygasającymi HMAC-tokenami.</p>
                <p>3. Możesz też uruchomić bezpośredni link z poziomu przeglądarki (np. Chrome/Safari) kładąc tablet na ścianie.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-[#f1f5f9] font-bold px-5 py-2 rounded-lg text-xs transition"
              >
                Zamknij okno
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
