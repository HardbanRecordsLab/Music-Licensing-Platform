import React, { useState, useEffect, useRef } from "react";
import { AccessPage, Track, Playlist } from "../types.js";
import { getApiUrl, getWsUrl } from "../utils.js";
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Lock, Globe, Info, Music, Disc, RefreshCw, Send, AlertTriangle, MessageSquare, CheckCircle2
} from "lucide-react";

interface WhiteLabelPlayerProps {
  slug: string;
}

export function WhiteLabelPlayer({ slug }: WhiteLabelPlayerProps) {
  const [pageData, setPageData] = useState<AccessPage | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  
  // PIN state
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [pin, setPin] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [submittingPin, setSubmittingPin] = useState<boolean>(false);

  // Audio state
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // WebSocket notifications in white-label
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Fetch access page definition
  useEffect(() => {
    const fetchPageDefinition = async () => {
      try {
        setLoading(true);
        const res = await fetch(getApiUrl(`/api/published-page/${slug}`));
        const data = await res.json();
        
        if (data.error) {
          setErrorMsg(data.error);
        } else {
          setPageData(data.page);
          setIsLocked(data.requirePin);
          
          if (!data.requirePin) {
            // Bezpośrednia autoryzacja bez PINu
            await verifyPinAndLoad("");
          }
        }
      } catch (err) {
        setErrorMsg("Błąd krytyczny sieci. Serwer nie odpowiedział.");
      } finally {
        setLoading(false);
      }
    };
    fetchPageDefinition();
  }, [slug]);

  // Dynamic CSS injection for custom styles defined by admin
  useEffect(() => {
    if (pageData?.whiteLabelTheme?.customCss) {
      const styleId = `custom-white-label-style-${slug}`;
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      styleElement.innerHTML = pageData.whiteLabelTheme.customCss;
      
      return () => {
        styleElement?.remove();
      };
    }
  }, [pageData, slug]);

  // Connect WebSocket for push updates & broadcasts inside white-label player
  useEffect(() => {
    const wsUrl = getWsUrl();
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      // Zidentyfikuj jako terminal white label
      ws.send(JSON.stringify({
        type: "identify",
        userId: `wl_${slug}`,
        name: pageData?.name || `Portal ${slug}`,
        role: "white-label"
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "broadcast") {
          setNotification({
            title: data.payload.title,
            message: data.payload.message
          });
          // Auto-hide toast after 8 seconds
          setTimeout(() => {
            setNotification(null);
          }, 8000);
        }
      } catch (e) {
        console.error("Błąd dekodowania powiadomienia WS:", e);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [pageData, slug]);

  // Synchronize WS action ping
  const sendActivityToWS = (actionName: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const trackTitle = tracks[currentTrackIndex]?.title || "Brak";
      socketRef.current.send(JSON.stringify({
        type: "play_status",
        action: actionName,
        currentTrack: trackTitle
      }));
    }
  };

  // Verify PIN helper and load playlist
  const verifyPinAndLoad = async (enteredPin: string) => {
    try {
      setSubmittingPin(true);
      setPinError("");
      const res = await fetch(getApiUrl(`/api/published-page/${slug}/verify-pin`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: enteredPin })
      });
      const data = await res.json();
      
      if (data.error) {
        setPinError(data.error);
      } else {
        setPlaylist(data.playlist);
        setTracks(data.playlist.tracksList || []);
        setIsLocked(false);
        if (data.playlist.tracksList && data.playlist.tracksList.length > 0) {
          setCurrentTrackIndex(0);
        }
      }
    } catch (err) {
      setPinError("Krytyczny błąd połączenia z modułem autoryzacji");
    } finally {
      setSubmittingPin(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + val);
    }
  };

  const handleKeypadClear = () => {
    setPin("");
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin.length === 4) {
      verifyPinAndLoad(pin);
    } else {
      setPinError("PIN musi składać się z dokładnie 4 cyfr");
    }
  };

  // Audio controls
  const playTrack = async (index: number) => {
    if (index < 0 || index >= tracks.length) return;
    setCurrentTrackIndex(index);
    const track = tracks[index];

    try {
      const res = await fetch(getApiUrl(`/api/token`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: track.filename, userId: `wl_${slug}` })
      });
      const tkData = await res.json();
      
      if (audioRef.current && tkData.src) {
        audioRef.current.src = getApiUrl(tkData.src);
        audioRef.current.load();
        audioRef.current.volume = isMuted ? 0 : volume;

        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            // Log analytics track play on VPS
            fetch(getApiUrl(`/api/play`), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                trackId: track.id,
                playlistId: playlist?.id,
                userId: `wl_${slug}`
              })
            }).catch(e => console.error("Error logging play:", e));

            // Sync with Websocket list
            sendActivityToWS(`Słucha: ${track.title}`);
          })
          .catch(e => {
            console.log("Browser autoplay blocked:", e);
            setIsPlaying(false);
          });
      }
    } catch (e) {
      console.error("Błąd ładowania tokenu streamu:", e);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || currentTrackIndex === -1) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      sendActivityToWS("Pauza");
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          sendActivityToWS(`Słucha: ${tracks[currentTrackIndex]?.title}`);
        })
        .catch(() => setIsPlaying(false));
    }
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    playTrack(nextIdx);
  };

  const prevTrack = () => {
    const prevIdx = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    playTrack(prevIdx);
  };

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

  const handleAudioEnded = () => {
    nextTrack();
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  // Color mappings
  const accentColor = pageData?.whiteLabelTheme?.accentColor || "#f97316";
  const bgColor = pageData?.whiteLabelTheme?.bgColor || "#09090b";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white font-sans">
        <Disc className="h-10 w-10 text-orange-500 animate-spin" />
        <p className="mt-4 font-mono text-xs tracking-widest text-zinc-500 uppercase">Łączenie ze stacją dystrybucji...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white font-sans p-6 text-center">
        <div className="bg-red-950/20 border border-red-500/20 p-8 rounded-3xl max-w-md space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-extrabold uppercase tracking-wide text-red-400">Portal Niedostępny</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{errorMsg}</p>
          <div className="pt-2 font-mono text-[10px] text-zinc-650">BŁĄD: CODE_404_PAGE_INACTIVE_OR_REMOVED</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col justify-between p-4 sm:p-6 transition-colors duration-500 font-sans relative overflow-hidden" 
      style={{ backgroundColor: bgColor }}
    >
      {/* Dynamic background lighting elements */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-[100px] pointer-events-none"
        style={{ backgroundColor: accentColor }}
      ></div>

      {/* Dynamic style tag fallback */}
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* 🔔 LIVE WEBSOCKET TOAST NOTIFICATION */}
      {notification && (
        <div 
          className="fixed top-4 right-4 z-50 animate-bounce bg-[#15151b] border rounded-2xl p-4 shadow-2xl max-w-sm flex items-start gap-3 transition-all duration-300"
          style={{ borderColor: accentColor }}
        >
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="text-left text-xs text-white">
            <p className="font-extrabold uppercase tracking-wider">{notification.title}</p>
            <p className="text-zinc-400 mt-1 leading-normal">{notification.message}</p>
          </div>
        </div>
      )}

      {/* NAGŁÓWEK WHITE LABEL */}
      <header className="max-w-4xl w-full mx-auto flex justify-between items-center z-10 border-b border-zinc-900/60 pb-5">
        <div className="flex items-center gap-3">
          {pageData?.whiteLabelTheme?.logoUrl ? (
            <img 
              src={pageData.whiteLabelTheme.logoUrl} 
              alt="Logo" 
              referrerPolicy="no-referrer"
              className="h-10 w-auto rounded-xl object-contain b2b-logo" 
            />
          ) : (
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center">
              <Globe className="h-5 w-5" style={{ color: accentColor }} />
            </div>
          )}
          <div className="text-left">
            <h1 className="text-sm font-black text-white uppercase tracking-wider leading-none">{pageData?.whiteLabelTheme?.title || pageData?.name}</h1>
            <p className="text-[10.5px] text-zinc-400 mt-1 max-w-md line-clamp-1">{pageData?.whiteLabelTheme?.description || "Subskrypcja komercyjna"}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-zinc-900/40 px-3.5 py-1.5 rounded-full border border-zinc-900 font-mono text-[9px] text-zinc-500 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Połączenie audio: Zabezpieczone Direct</span>
        </div>
      </header>

      {/* GŁÓWNA SEKCJA */}
      <main className="flex-grow flex items-center justify-center max-w-4xl w-full mx-auto my-6 z-10">
        {isLocked ? (
          /* BLOKADA PINEM */
          <div className="bg-[#121318]/90 border border-zinc-900 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl backdrop-blur-md">
            <div className="text-center space-y-2">
              <div 
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-orange-500/10"
                style={{ color: accentColor }}
              >
                <Lock className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-base font-extrabold mt-4 text-white uppercase tracking-widest leading-none">Wprowadź Kod PIN placówki</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">Ta ścieżka dźwiękowa jest chroniona certyfikatem licencyjnym Hardban Records dla punktów partnerskich.</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="flex justify-center">
                <input 
                  type="text" 
                  readOnly 
                  maxLength={4}
                  value={pin}
                  className="bg-black border border-zinc-800 rounded-2xl w-48 py-3 text-center text-2xl font-black font-mono tracking-[0.6em] text-white focus:outline-none select-none"
                  placeholder="••••"
                  style={{ borderColor: pinError ? '#ef4444' : pin.length === 4 ? accentColor : '#27272a' }}
                />
              </div>

              {pinError && (
                <p className="text-xs text-red-500 text-center font-bold bg-red-950/10 border border-red-500/10 p-2.5 rounded-xl">{pinError}</p>
              )}

              {/* Dedykowany Numpad dla terminali dotykowych */}
              <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto text-white font-mono text-base font-bold">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 active:bg-zinc-950 transition flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="h-12 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-900 text-zinc-500 text-xs font-bold font-sans uppercase flex items-center justify-center select-none"
                >
                  Wyczyść
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress("0")}
                  className="h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 active:bg-zinc-950 transition flex items-center justify-center select-none"
                >
                  0
                </button>
                <button
                  type="submit"
                  disabled={submittingPin || pin.length !== 4}
                  className="h-12 rounded-xl text-white font-sans text-xs font-black uppercase flex items-center justify-center disabled:opacity-50 select-none transition"
                  style={{ backgroundColor: accentColor }}
                >
                  {submittingPin ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ODTWARZACZ WHITE-LABEL */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full items-stretch">
            {/* Lewa karta główna z odtwarzaczem */}
            <div className="md:col-span-3 bg-[#111216]/90 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl backdrop-blur-md b2b-player-card">
              
              {/* Sekcja graficzna */}
              <div className="text-center py-4 flex flex-col items-center">
                <div className="relative group">
                  <div 
                    className={`w-36 h-36 rounded-full overflow-hidden border-2 flex items-center justify-center bg-black/40 transition-transform duration-1000 ${isPlaying ? 'animate-spin [animation-duration:15s]' : ''}`}
                    style={{ borderColor: accentColor }}
                  >
                    {tracks[currentTrackIndex]?.cover ? (
                      <img 
                        src={tracks[currentTrackIndex].cover} 
                        alt="Disc icon" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Disc className="h-16 w-16 text-zinc-600" />
                    )}
                  </div>
                  <div 
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-8 w-8 text-white" /> : <Play className="h-8 w-8 text-white" />}
                  </div>
                </div>

                <div className="mt-5 space-y-1">
                  <h2 className="text-lg font-black text-white tracking-tight leading-none">
                    {tracks[currentTrackIndex]?.title || "Wybierz utwór"}
                  </h2>
                  <p className="text-xs font-black" style={{ color: accentColor }}>
                    {tracks[currentTrackIndex]?.artist || "Stacja Hardban CRM Core"}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono italic leading-none pt-1">
                    Album: {tracks[currentTrackIndex]?.album || "Nieznany"} | BPM: {tracks[currentTrackIndex]?.bpm || "--"}
                  </p>
                </div>
              </div>

              {/* Paski audio-fal visualizer mock */}
              <div className="h-8 flex gap-1 items-end justify-center px-4">
                {[...Array(24)].map((_, i) => {
                  const isActive = isPlaying;
                  const randomHeight = isActive ? Math.floor(Math.random() * 24) + 6 : 4;
                  return (
                    <div 
                      key={i} 
                      className="w-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        height: `${randomHeight}px`, 
                        backgroundColor: isPlaying && currentTrackIndex !== -1 ? accentColor : '#27272a',
                        opacity: isPlaying ? 0.8 : 0.3
                      }}
                    ></div>
                  );
                })}
              </div>

              {/* Progress bar i czas */}
              <div className="space-y-2">
                <div 
                  className="h-1.5 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={handleProgressBarClick}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-100"
                    style={{ 
                      width: `${(currentTime / (duration || 1)) * 100}%`,
                      backgroundColor: accentColor
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Kontrolery gry */}
              <div className="flex justify-between items-center bg-black/40 border border-zinc-950 p-4 rounded-2xl">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={toggleMute}
                    className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-zinc-200 transition-all active:scale-95"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input 
                    type="range" min={0} max={1} step={0.05}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={prevTrack}
                    className="p-2.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white transition active:scale-95"
                  >
                    <SkipBack className="h-4.5 w-4.5" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="p-4 rounded-2xl text-white transform hover:scale-105 active:scale-95 transition"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>
                  <button 
                    onClick={nextTrack}
                    className="p-2.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white transition active:scale-95"
                  >
                    <SkipForward className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="w-10"></div> {/* Spacer balance */}
              </div>

            </div>

            {/* Prawa karta z tracklistą */}
            <div className="md:col-span-2 bg-[#111216]/90 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-2xl backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3 text-left">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Playlista strefowa</h4>
                    <p className="text-[10px] text-zinc-500 leading-none">Łącznie {tracks.length} bezlicencyjnych ścieżek</p>
                  </div>
                  <span className="text-[10px] bg-orange-500/10 text-orange-400 font-mono px-2 py-0.5 rounded border border-orange-500/10">B2B CERT</span>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-80 pr-1 text-left">
                  {tracks.map((track, idx) => (
                    <div 
                      key={track.id} 
                      onClick={() => playTrack(idx)}
                      className={`px-3 py-2.5 rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition border ${
                        idx === currentTrackIndex 
                          ? 'bg-orange-500/5 text-white border-orange-500/20' 
                          : 'bg-black/30 text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-black/40 hover:border-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-mono text-zinc-650 w-4">{String(idx + 1).padStart(2, '0')}</span>
                        <div className="truncate">
                          <p className="text-xs font-bold truncate leading-snug">{track.title}</p>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold text-zinc-500 flex-shrink-0">
                        {formatTime(track.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informacja prawna o bezlicencyjności */}
              <div className="bg-zinc-900/40 p-3.5 rounded-2.5xl border border-zinc-950 font-sans text-left space-y-1">
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3 text-zinc-500" />
                  <p className="text-[9px] font-extrabold uppercase text-zinc-400 tracking-wider">Certyfikat Audio Zwolnienia</p>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-normal">Wszystkie utwory na tej playliście posiadają pełne licencjonowanie komercyjne Hardban i są zwolnione ze składek dla stowarzyszeń zbiorowego zarządzania prawami autorskimi.</p>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* STOPKA WHITE LABEL */}
      <footer className="max-w-4xl w-full mx-auto border-t border-zinc-900/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[9px] text-zinc-650 uppercase z-10">
        <span>Licencja: Gwarancja braku opłat autorskich</span>
        <span>Autoryzacja: HRL-WHITE-LABEL-PORTAL v2.0</span>
        <span>© Hardban Records Architecture Department</span>
      </footer>
    </div>
  );
}
