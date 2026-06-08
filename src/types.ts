export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  bpm: number;
  genre: string;
  mood: string[];
  duration: number; // sekundy
  explicit: boolean;
  timeOfDay: TimeOfDay[]; // rano, popołudnie, wieczór, noc
  isrc?: string;
  cover?: string;
  filename: string;
  copyrightLabel?: string;
  licenseTerms?: string;
}

export interface Playlist {
  id: string;
  title: string;
  pmproLevel: number; // ID poziomu PMPro
  clientName: string;
  clientLogo?: string;
  accentColor: string;
  bgColor: string;
  autoplay: boolean;
  loop: boolean;
  hideTracklist: boolean;
  volume: number;
  useSchedule: boolean;
  explicitFilter: boolean;
  tracks: string[]; // tablica ID utworów
  pin?: string; // PIN dla placówki klienta
  audioCta?: string;
  seoKeywords?: string;
}

export interface PlayLog {
  id: string;
  trackId: string;
  playlistId: string;
  userId: string;
  playedAt: string;
  durationS: number;
}

export interface AccessToken {
  id: string;
  token: string;
  userId: string;
  filename: string;
  expiresAt: string;
  usedCount: number;
  ipHash: string;
}

export interface InvoiceItem {
  description: string;
  qty: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // np. HRL-2026-05-00001
  clientName: string;
  clientEmail: string;
  date: string;
  amount: number;
  tax: number; // 23% VAT
  total: number;
  status: 'paid' | 'unpaid' | 'overdue';
  items: InvoiceItem[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'subscriber';
  pmproLevel: number;
  playlistIds: string[]; // bezpośrednie ID z meta użytkownika (Model B)
}

export interface AccessPage {
  id: string;
  name: string;
  playlistId: string;
  requirePin: boolean;
  pinCode?: string;
  whiteLabelTheme: {
    accentColor: string;
    bgColor: string;
    logoUrl?: string;
    title: string;
    description: string;
    customCss?: string;
  };
  slug: string;
  active: boolean;
  allowedIps?: string[];
  expiresAt?: string;
}
