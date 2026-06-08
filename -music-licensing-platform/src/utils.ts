/**
 * Pomocnicze funkcje dla wieloplatformowej budowy (Frontend Vercel / Netlify + Backend VPS)
 */

/**
 * Zwraca pełny URL dla określonej ścieżki API.
 * Obsługuje dynamiczne zmienne w Vite (np. VITE_API_URL) z automatycznym fallbackiem do relatywnych ścieżek.
 */
export function getApiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_URL;
  if (!baseUrl) {
    return path;
  }
  
  // Oczyszczamy z nakładających się ukośników
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
}

/**
 * Dynamicznie generuje URL dla połączeń WebSocket w zależności od hostingu.
 * Współpracuje ze zdefiniowaną zmienną VITE_API_URL i automatycznie konwertuje protokoły.
 */
export function getWsUrl(): string {
  const customBaseUrl = import.meta.env.VITE_API_URL;
  
  if (customBaseUrl) {
    // Rozszyfruj protokół i utwórz bezpieczny websocket URL
    try {
      const url = new URL(customBaseUrl);
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${url.host}/`;
    } catch (e) {
      // Prosta podmiana w przypadku braku pełnego URI
      let formatted = customBaseUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
      if (!formatted.startsWith('ws:') && !formatted.startsWith('wss:')) {
        // Jeśli podano samą domenę, dopasuj do obecnego protokołu
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        formatted = `${protocol}//${formatted}`;
      }
      return formatted.endsWith('/') ? formatted : `${formatted}/`;
    }
  }

  // Domyślna ścieżka przy monolitycznym hostingu (Frontend + Backend na jednej maszynie)
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/`;
}
