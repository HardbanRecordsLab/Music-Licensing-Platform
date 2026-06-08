# KREATOR I BIBLIA SYSTEMOWA PLATFORMY HARDBAN RECORDS LAB (HRL) B2B
## Kompleksowy Podręcznik Operacyjno-Architektoniczny, Analiza Biznesowa, UI/UX i Katalog API
### Wersja Dokumentu: v6.0-ULTRA-SaaS-PRO (Wydanie: 2026-05-30)
### Status: ZATWIERDZONA (SYSTEM PRODUKCYJNY REAL-TIME)

---

## 🧭 SPIS TREŚCI

1. **ARCHITEKTURA BIZNESOWA, STRATEGICZNA I LICENCYJNA**
   - 1.1. Misja systemowa: Muzyczny Stream B2B jako Legalna Usługa Biznesowa (Music-as-a-Service)
   - 1.2. Prawa Autorskie a Wolność od Opłat OZZ (ZAiKS, STOART, ZPAV, SAWP) - Aspekty Operacyjno-Prawne
   - 1.3. Kompleksowy Katalog Grup Docelowych, Persony Branżowe i Scenariusze Użycia w Praktyce
   - 1.4. Hierarchia Licencyjna PMPro (Paid Memberships Pro Levels) - Podział Funkcjonalno-Cenowy i Tabela Porównawcza
2. **CO MA APLIKACJA? KOMPLETNY PRZEGLĄD PRAKTYCZNY MODUŁÓW I INTERFEJSÓW**
   - 2.1. Panel Klienta B2B (`B2BPlayer.tsx`) - Centrum Codziennej Pracy Lokalu
     - 2.1.1. Sektor Muzyczny (Tarcza Dynamiczna Deck, Matematyka Logarytmicznej Skali, Wsparcie Gestyki Dotykowej Swipe)
     - 2.1.2. Inteligentny Harmonogram Godzinowy (Time-Of-Day Scheduler) i Auto-Kolejka
     - 2.1.3. Wyszukiwarka, Dynamiczne Filtrowanie Gatunków i Dwuwarstwowy System Audio (Double Audio Engine)
     - 2.1.4. Kreator i Edytor Playlist (Curator Hub - Interfejs Reordering Grip, Drag & Drop)
     - 2.1.5. Certyfikat Wolności OZZ, Podpisy Cyfrowe i Publiczny Podgląd QR (Audience-Trust Gate)
     - 2.1.6. Zaawansowana Konsola Analityczna i Wykresy Statystyk Recharts
     - 2.1.7. System Spersonalizowanej Akustyki (Zarządzanie EQ, Kompresja Dynamiki i Kalibracja Słów Kluczowych SEO)
     - 2.1.8. Komunikacja Zespołowa: Kooperacyjne Notatki i Komentarze AI o Playlistach
     - 2.1.9. Maszyneria Komunikatów i Reklam Głosowych (Audio CTA Voice Ad-Injection & Algorytm Audio Ducking)
   - 2.2. Widgety Witryn Partnerskich White-Label (`WhiteLabelPlayer.tsx`)
     - 2.2.1. Brama Zabezpieczająca PIN (4-digit Access Guard)
     - 2.2.2. Dynamiczny Silnik Wizualny (Dynamic Skin & Theme Injector) i Osadzanie CSS
   - 2.3. Konsola Super-Administratora (`AdminDashboard.tsx`) - Kompleksowy Przegląd Wszystkich 11 Zakładek
     - 2.3.1. Zakładka Dashboard (Czterokanałowy Panel Finansowo-Biznesowy KPI)
     - 2.3.2. Zakładka Monitoring (Śledzenie Incydentów Serwerowych, RAM, WebSocket, Cache Hit Rates)
     - 2.3.3. Zakładka Tracks (Pełny CRUD Utworów, BPM, Tagi, Walidacja Kodów ISRC)
     - 2.3.4. Zakładka Playlists (Struktury Ramówek, Przypisywanie PMPro i Ukrywanie List)
     - 2.3.5. Zakładka Designer (Wizualny Kreator Stylów, Typografia i Personalizacja Kolorów)
     - 2.3.6. Zakładka Pages (Zarządzanie Podstronami AccessPages, Slug i Ograniczenia IP)
     - 2.3.7. Zakładka Invoices (Integracja z Systemem Rozliczeniowym, Generowanie Faktury VAT)
     - 2.3.8. Zakładka Security ( HMAC Token Verification, Adresy IP, Token Garbage Collector)
     - 2.3.9. Zakładka Backup (Kopie Zapasowe Bazy RAM i Moduł Walidacji Integralności JSON)
     - 2.3.10. Zakładka Integrations (Webhooki Zdarzeń, API Deweloperskie, Notion/Airtable i Integracja PIM/MDM)
     - 2.3.11. Zakładka Headless (Topologia Nginx X-Accel-Redirect, Simulator i Pliki Konfiguracyjne Docker/Config)
   - 2.4. Generator i Edytor Faktur VAT (`InvoiceModal.tsx`) i Środowisko Rozliczeniowe
3. **MODEL TECHNICZNY, STRUKTURA DANYCH I STRATEGIA BAZODANOWA (IN-MEMORY RAM ENGINE)**
   - 3.1. Precyzyjne Opisy i Mapowanie Pól z `src/types.ts`
   - 3.2. Model Decoupled Front/Back (Wielopoziomowy Split-Hosting Vercel + Nginx VPS)
   - 3.3. Wsparcie Komunikacyjne: Rola Pliku Narzędziowego (`src/utils.ts`) i Bezpieczeństwo Mixed Content
   - 3.4. Serwer Nginx: Caching, Obsługa Range Requests i Dynamiczne Przekierowanie `X-Accel-Redirect`
4. **WYCZERPUJĄCY RAPORT BEZPIECZEŃSTWA (CYBER-DEFENSE & CRYPTO SPECS)**
   - 4.1. Kryptograficzne Zabezpieczenie Ścieżek: HMAC SHA-256
   - 4.2. Obrona przed Atakami "Known Salt Attack" - Generator CSPRNG o Wysokiej Entropii
   - 4.3. Zwalczanie Wycieków Pamięci RAM (Procesy TGC i RLGC w Pętli Tła)
   - 4.4. Tarcza Przeciw DDoS/Brute-force: Serwerowy Rate Limiter (IP Sliding Window Mapping)
   - 4.5. Nagłówki Zabezpieczające HTTP (Zalecenia OWASP) i Ścisła Konfiguracja Polityk CORS
5. **PROTOKÓŁ DWUKIERUNKOWY CHMURY WEBSOCKET (REAL-TIME STREAM TELEMETRY)**
   - 5.1. Architektura Połączenia i Protokół Utrzymania Łącza (Ping-Pong Heartbeat Loop)
   - 5.2. Rejestracja Gniazda (Client Hello Envelope Schema)
   - 5.3. Monitorowanie Aktywności Odtwarzania i Powiadomienia Broadcast Administratora
6. **REPERTUAROWA SPECYFIKACJA INTERFEJSÓW REST API (SZCZEGÓŁOWY KATALOG ENDPOINTÓW)**
   - 6.1. Zarządzanie Kontami i Pętla Autoryzacji (`/api/users`, LOGIN, SWITCH)
   - 6.2. Metadane Biblioteki Utworów i Przesył Binarny (`/api/tracks`, CRUD, UPLOAD)
   - 6.3. Playlisty, Filtry Poziomu PMPro i Harmonogramy (`/api/my-playlists`, `/api/playlist/:id`)
   - 6.4. Księgowość i Faktury B2B (`/api/invoices`, GENERATE, PRINT)
   - 6.5. Kontrola i Diagnostyka Środowiska Headless (`/api/nginx/simulate`, BACKUP, INTEGRATIONS)
7. **DEWELOPERSKI I SYSOP RUNBOOK: PROTOKÓŁ WDROŻENIA ROZPRASZONEGO**
   - 7.1. Instalacja i Optymalizacja VPS (Node.js LTS, PM2, RAM Watchdog)
   - 7.2. Konfiguracja Serwera Proxy Nginx, Obsługi Plików Chronionych i Certyfikacji SSL Let's Encrypt
   - 7.3. Budowa i Wdrożenie Frontendu SPA na Platformie Vercel
8. **ZAAWANSOWANE STRATEGIE DOSTĘPNOŚCI, ERGONOMII I UI/UX**
   - 8.1. Skróty Klawiaturowe (Keyboard Shortcuts Tracker) dla Personelu i Skróty Klawiszowe Odtwarzacza
   - 8.2. Tryb Wysokokontrastowy (High Contrast Mode) i Redukcja Tekstur Tła
   - 8.3. Tryb Skautów "Zero Distraction" (Minimalistyczny Widok Odtwarzacza)
   - 8.4. Integracja z Asystentami Głosowymi (Wtyczki TTS i Nawigacja Słowna)
9. **ROZBUDOWANE FAQ I DIAGNOSTYKA PROBLEMÓW TECHNICZNO-PRAKTYCZNYCH (15 USZCZEGÓŁOWIONYCH SCENARIUSZY)**

---

## 1. ARCHITEKTURA BIZNESOWA, STRATEGICZNA I LICENCYJNA

### 1.1. Misja systemowa: Muzyczny Stream B2B jako Legalna Usługa Biznesowa (Music-as-a-Service)
Aplikacja **Hardban Records Lab (HRL) B2B** to dedykowany system klasy SaaS (Software-as-a-Service), który umożliwia legalne, centralnie zarządzane oraz zoptymalizowane pod kątem wpływu na klienta odtwarzanie muzyki w przestrzeniach handlowych, publicznych i usługowych.

Kluczowy problem, jaki rozwiązuje system, to zastąpienie nielegalnie wykorzystywanych w biznesie konsumenckich kont platform streamingowych (jak Spotify, YouTube, Apple Music) profesjonalnym oprogramowaniem posiadającym pełną autoryzację prawno-autorską. Naruszenie zasad użytku osobistego w miejscu prowadzenia działalności gospodarczej naraża przedsiębiorstwa na wysokie odszkodowania oraz ryzyko kar administracyjnych. HRL B2B dostarcza intuicyjne narzędzia do odsłuchu bezpośredniego, automatycznego planowania ramówki muzycznej zgodnie z porą dnia, dyfuzji komunikatów marketingowych, wstrzykiwania lektorskich reklam głosowych (Audio CTA) oraz autoryzowanej weryfikacji tożsamości prawnej lokalu na wypadek kontroli terenowej.

---

### 1.2. Prawa Autorskie a Wolność od Opłat OZZ (ZAiKS, STOART, ZPAV, SAWP) - Aspekty Operacyjno-Prawne
Jednym z głównych kosztów operacyjnych ponoszonych przez przedsiębiorców dysponujących fizycznymi lokalami handlowo-usługowymi są opłaty abonamentowe wnoszone na rzecz Organizacji Zbiorowego Zarządzania (OZZ). W Polsce są to m.in. **ZAiKS** (prawa autorskie kompozytorów i autorów tekstów), **STOART** i **SAWP** (prawa artystów wykonawców) oraz **ZPAV** (prawa producentów fonogramów). Wysokość tych opłat, naliczana od powierzchni, zamożności lokalu bądź liczby mieszkańców danej miejscowości domyślnie stanowi uciążliwe obciążenie finansowe.

Platforma HRL B2B uwalnia przedsiębiorstwa od tych opłat dzięki wdrożeniu precyzyjnego **Aparatu Licencjonowania Bezpośredniego (Direct & Royalty-Free Licensing Engine)**:

1. **Własny Katalog Wyłączny (Directly Licensed Catalog):**
   Utwory wchodzące w skład biblioteki muzycznej HRL są tworzone przez kompozytorów i wykonawców, którzy podpisali bezpośrednie umowy dystrybucyjne z Hardban Records Lab i nie są zrzeszeni w żadnej OZZ na terytorium całego globu. Oznacza to, że prawa do publicznego odtwarzania tych utworów (zarówno autorskie, jak i pokrewne) spoczywają wyłącznie w rękach wydawnictwa HRL.
2. **Eliminacja Pośredników:**
   Nabywając subskrypcję w systemie HRL B2B, abonent otrzymuje bezpośrednie prawo licencyjne (pole eksploatacji: publiczne odtwarzanie w celach handlowych w wytypowanym lokalu) bez udziału organizacji trzecich.
3. **Certyfikacja i Bezpieczeństwo Kontroli:**
   Każdy punkt fizyczny otrzymuje imienny **Certyfikat Zwolnienia z Opłat OZZ**, generowany automatycznie z poziomu aplikacji. Certyfikat jest powiażany z unikalnym podpisem cyfrowym i kodem QR, który inspektor kontrolujący może błyskawicznie sprawdzić swoim smartfonem, ładując dynamiczną i zaufaną stronę weryfikacji bez logowania.

---

### 1.3. Kompleksowy Katalog Grup Docelowych, Persony Branżowe i Scenariusze Użycia w Praktyce

Dźwięk ma bezpośredni wpływ na zachowania fizjologiczne, odczuwanie czasu oraz wolumen zakupowy. System HRL B2B wychodzi naprzeciw zróżnicowanym potrzebom biznesowym, co obrazują poniższe profile branżowe, persony oraz ich realne scenariusze operacyjne:

#### 1. Hotelarstwo i strefy Well-being (Hotele, Pensjonaty, SPA, Recepcje)
* **Persona:** **Agnieszka Włodarczyk (Dyrektor generalna pięciogwiazdkowego hotelu Royal Spa & Wellness)**.
* **Cel biznesowy:** Kreowanie dyskretnego luksusu od progu, wydłużenie czasu spędzanego przez gości w hotelowej kawiarni, redukcja lęku w poczekalni SPA, zamaskowanie odgłosów wentylacji.
* **Scenariusz praktyczny:** Hotel posiada wdrożony system na terminalu na recepcji głównej. O 08:00 rano system automatycznie przełącza ramówkę na playlistę *Lofi Warm Brew* (65 BPM) o niskiej dynamice, co eliminuje stres porannego wymeldowania. Po południu o 13:00 odtwarzane są utwory jazzowe ocieplające przestrzeń. Wieczorem system uruchamia profil *Warm House Lounge* stymulujący sprzedaż drinków przy barze. Agnieszka w razie kontroli inspektora OZZ o 20:00 klika zakładkę "Licencja" na tablecie i prezentuje certyfikat z kodem QR, co kończy kontrolę w 40 sekund.

#### 2. Gastronomia (Kawiarnie, Restauracje, Puby, Bistro)
* **Persona:** **Janusz Karpiński (Właściciel kawiarni i mikropalarni Aroma Comfort Cafe)**.
* **Cel biznesowy:** Zwiększenie obrotu stolików w godzinach szczytu lunchowego (12:00-14:00), budowanie przytulnego klimatu sprzyjającego pracy z laptopem rano, eliminacja niestosownych lub wulgarnych utworów z głośników (ochrona rodzin).
* **Scenariusz praktyczny:** Janusz ustawia jako domyślny profil odtwarzania *Casual*. Ma włączoną funkcję `explicitFilter` (filtr cenzury), która uniemożliwia pracownikom puszczenie utworów z niecenzuralnym językiem. W godzinach 12:00 - 14:00, gdy kolejki po lancz są najdłuższe, system automatycznie ładuje energetyczny *Electronic Pop* (115 BPM) na 80% głośności. Muzyka podświadomie przyspiesza tempo spożywania posiłków i zwiększa rotację stolików o 18%. Poza godzinami szczytu gra *Chillout Lofi*, zachęcając do kupna dodatkowego ciasta.

#### 3. Wellness & Fitness (Siłownie, Kluby fitness, Studia jogi i tańca)
* **Persona:** **Stefan Kowalski (Manager sieci siłowni CorePower)**.
* **Cel biznesowy:** Maksymalizacja dopaminy u ćwiczących, stymulacja wysiłku fizycznego poprzez synchronizację rytmu bicia serca z uderzeniem basu (tempo powyżej 125 BPM), maskowanie hałasu upadających hantli.
* **Scenariusz praktyczny:** W kardiostrefie i strefie wolnych ciężarów Stefan wdraża odtwarzacz z playlistą o wysokim tempie BPM (*Peak Power Synthwave* / *High Beats Techno-House*). Ścieżka audio przesyłana przez Nginx VPS z włączonym logarytmicznym suwakiem głośności ułatwia płynną zmianę natężenia dźwięku bez szkodliwych dla ucha skoków dB. Stefan wstrzykuje co 30 minut komunikat głosowy (Audio CTA): „*Zapraszamy do baru po treningu po świeże koktajle białkowe z rabatem 20%!*”. Głośność muzyki automatycznie przycisza się do 20% (Audio Ducking) na czas trwania ogłoszenia, a po nim płynnie powraca do 90%.

#### 4. Pielęgnacja urody (Salony fryzjerskie, Gabinety kosmetyczne, Barber shopy)
* **Persona:** **Kamil "Grom" Nowak (Właściciel kultowego Barber Shopu Rough Cut)**.
* **Cel biznesowy:** Podkreślenie męskiego charakteru lokalu, maskowanie szumu maszynek i suszarek, stworzenie przestrzeni relaksu i dyskusji przy szklance whisky.
* **Scenariusz praktyczny:** Kamil korzysta z profilu *Expert* w systemie Acoustic Calibration. Ustawia suwak `expertEqBass` na +4dB, a `expertEqTreble` na +2dB dla uzyskania soczystego, głębokiego brzmienia muzyki rockowej i alternatywnej leżącej w katalogu HRL. Słowa kluczowe SEO w jego profilu to: „*surowy, kraftowy, autentyczny, dynamiczny*”. Kalibrator AI automatycznie generuje log uzasadniający, że podbicie basu zwiększa poczucie prestiżu i solidności usług o 12%. Kamil konfiguruje widget White-Label dla tabletów swoich stanowisk, co gwarantuje spójną identyfikację wizualną marki (czarne tło `#0a0a0a` i jaskrawy pomarańczowy akcent `#ef4444`).

#### 5. Handel detaliczny i Showroomy (Butiki modowe, Sklepy, Salony meblowe)
* **Persona:** **Katarzyna Lewandowska (Kierownik butiku odzieżowego Premium Silk & Leather)**.
* **Cel biznesowy:** Wydłużenie czasu przebywania klienta w butiku, obniżenie poziomu kortyzolu, pobudzenie zmysłów do zakupów impulsowych bez pośpiechu.
* **Scenariusz praktyczny:** Katarzyna wykorzystuje playlistę *Premium Minimal Nu-Jazz* o miękkim wokalu. Ponieważ butik mieści się w prestiżowej galerii handlowej, system integruje się z systemem CRM za pośrednictwem Webhooków HRL B2B. Gdy do butiku wchodzi zarejestrowany klient premium (IoT beacon), system może zmienić aktualną energię muzyczną, a co 45 minut wstrzykiwana jest subtelna reklama głosowa (Audio CTA-Lead): „*Dołącz do klubu Silk & Leather i odbierz spersonalizowany zapach butikowy przy zakupach za min. 500 PLN.*”.

#### 6. Sektor Medyczny i Terapeutyczny (Prywatne kliniki, Stomatologia, Poczekalnie)
* **Persona:** **dr n. med. Andrzej Chmielewski (Założyciel kliniki Dent-Art)**.
* **Cel biznesowy:** Złagodzenie stanów lękowych pacjentów przed zabiegiem chirurgicznym, wygłuszenie stresujących dźwięków wiertła dentystycznego, poprawa koncentracji lekarzy podczas precyzyjnych mikrooperacji.
* **Scenariusz praktyczny:** Na korytarzu i w poczekalni odtwarzana jest playlista *Neo-Classical Healing* (55-65 BPM). Jest to muzyka w 100% instrumentalna (fortepian, harfa, wiolonczela), co zapobiega rozpraszaniu uwagi. System działa na małym mikromonitorze schowanym za recepcją. Dzięki trybowi *Zero Distraction* personel widzi wyłącznie prosty panel kontrolny składający się z koła odtwarzacza, przycisku pauzy oraz wskaźnika ważności licencji. Przypadkowe kliknięcie przez asystenta innej piosenki nie spowoduje głośnego trzasku dzięki zastosowanemu w kodzie 2-sekundowemu łagodnemu przejściu (Gain Crossfade).

#### 7. Biura i Coworkingi (Strefy biurowe, Open Space, Sale spotkań)
* **Persona:** **Zofia Bielska (Community Manager przestrzeni coworkingowej TechHub)**.
* **Cel biznesowy:** Likwidacja "strefy niezręcznej ciszy", ułatwienie prowadzenia cichych rozmów telefonicznych bez podsłuchiwania przez sąsiada, stymulacja pracy kreatywnej programistów i projektantów.
* **Scenariusz praktyczny:** Przestrzeń coworkingowa jest podzielona na strefy dźwiękowe. W strefie Open Space Zofia uruchamia profil akustyczny *Focus* o wysokiej kompresji (`expertDynamicRange` = 80%). Dzięki temu poziom dźwięku jest idealnie wyrównany – żadne solo gitarowe nie wyskakuje nagle ponad średnią głośność. Słowa kluczowe w systemie to: „*algorytmiczny, skupienie, lekki, geometryczny*”. Jeśli ktoś z użytkowników zgłosi, że muzyka przeszkadza mu w ważnym wdrożeniu produkcyjnym, Zofia korzysta ze skrótu klawiszowego `S` na klawiaturze recepcji, aby jednym kliknięciem natychmiast wyciszyć system i skonsultować się z zespołem.

#### 8. Supermarkety, Dyskonty i Stacje Paliw (Sektor wielkopowierzchniowy B2C)
* **Persona:** **Marek Zieliński (Dyrektor operacyjny sieci 150 stacji paliw Octane-Fuel)**.
* **Cel biznesowy:** Centralne zarządzanie muzyką i reklamami na wszystkich stacjach bez polegania na personelu zmianowym, automatyczne pobieranie promocji na dany weekend z bazy PIM (Product Information Management), zwiększenie wartości koszyka paliwowego o 12%.
* **Scenariusz praktyczny:** Marek zarządza systemem centralnie z poziomu panelu Super-Administratora. Tworzy dedykowane strony dla każdej stacji za pomocą zakładki *Pages* z wymuszonym PIN-em zabezpieczającym (PIN dla każdej stacji jest inny). Integruje platformę z systemem PIM/MDM przez REST API. Co piątek system automatycznie aktualizuje bazę reklam głosowych (Audio CTA) o spoty lektorskie informujące o promocji na płyn do spryskiwaczy i świeże hot-dogi. Dzięki telemetrycznemu protokołowi WebSocket, Marek widzi w czasie rzeczywistym w zakładce *Monitoring*, które stacje mają włączony odtwarzacz i jaki utwór aktualnie gra (zabezpieczenie przed samowolnym puszczaniem lokalnego radia FM przez pracowników nocnej zmiany).

---

### 1.4. Hierarchia Licencyjna PMPro (Paid Memberships Pro Levels) - Podział Funkcjonalno-Cenowy

| Parametr techniczno-biznesowy | Poziom 1: STARTER (Abonament Mikro) | Poziom 2: BUSINESS (Standard) | Poziom 3: ENTERPRISE (Sieciowy) |
| :--- | :--- | :--- | :--- |
| **Cena katalogowa netto / msc** | **49 PLN** (za 1 fizyczny lokal) | **129 PLN** (za lokal) | **299 PLN** (licencja do 5 lokali) |
| **Grupa docelowa** | Małe kawiarnie, butiki jednopunktowe, gabinety masażu, kwiaciarnie | Hotele, duże siłownie, restauracje z ogródkami, salony kosmetyczne premium | Sieci handlowe, korporacje, centra medyczne, franczyzy, stacje benzynowe |
| **Dostępne style muzyczne** | Klasyczny Ambient, Lofi, Chillhop (Podstawowy pakiet wyciszający) | Pełny katalog: Jazz, Warm House, Synthwave, Acoustic Pop, Instrumental, Rock | Cała baza + Możliwość wgrywania własnych utworów WAV/MP3 z prawem autorskim |
| **Certyfikat Wolności OZZ** | Cyfrowy PDF do druku (Podpis podpisany kluczem sha1) | Certyfikat A4 Premium + Fizyczna grawerowana tabliczka na ścianę lokalu | Certyfikat zbiorczy dla całej sieci, pełne doradztwo prawne w sporach sądowych |
| **Automatyczny Harmonogram** | Stały, zdefiniowany systemowo (brak edycji godzin bloków) | Pełna dynamiczna edycja godzin rozpoczęcia i zakończenia pór dnia | Indywidualny kalendarz ramowy z dokładnością co do 5 minut (Hybrid Scheduler) |
| **Filtrowanie Cenzury (Explicit)** | Włączone permanentnie (Brak dostępu do utworów z tagiem explicit) | Możliwość włączenia/wyłączenia przez managera, edycja czułości słów | Zaawansowany moduł cenzury lingwistycznej, wycinanie słów w locie |
| **Maszyneria Audio CTA** | Zablokowana (Brak możliwości wstrzykiwania ogłoszeń głosowych) | Maksymalnie 2 aktywne komunikaty własne na playlistę, interwał 30 min | Nielimitowane komunikaty, automatyczny syntezator mowy AI TTS (Text-to-Speech) |
| **Widgety White-Label** | Niedostępne (Odrzucenie żądania z parametrem slug) | Dostępne na subdomenie HRL, stałe logo platformy w widoku playerów | Własne domeny partnerów (CNAME), usunięcie loga HRL, pełny Custom CSS |
| **Aparatura Acoustic EQ** | Wyłączona (Dźwięk płaski bez korekcji tonalnej wejścia) | Dostępny profil Expert z manualną korekcją trzech pasm (-6dB do +6dB) | Pełna automatyczna kalibracja AI na podstawie słów kluczowych SEO i gęstości |
| **API i Integracje zewnętrzne** | Brak dostępu do tokenów API dewelopera | Dostęp tylko do odczytu statystyk dobowych (wykresy Recharts) | Pełne API dwukierunkowe, integracja Notion, Airtable, CRM, PIM, webhooki |

---

## 2. CO MA APLIKACJA? KOMPLETNY PRZEGLĄD PRAKTYCZNY MODUŁÓW I INTERFEJSÓW

---

### 2.1. Panel Klienta B2B (`B2BPlayer.tsx`) - Centrum Codziennej Pracy Lokalu

Panel klienta to zaawansowana aplikacja typu single-page (SPA) zaprojektowana pod kątem maksymalnej ergonomii i bezawaryjnej pracy 24/7. Interfejs jest podzielony na pięć wysoce wyspecjalizowanych zakładek:

#### 2.1.1. Sektor Muzyczny (Tarcza Dynamiczna Deck, Matematyka Logarytmicznej Skali, Wsparcie Gestyki)
Sercem widoku głównego jest **Dynamic Deck** – tarcza odtwarzacza reprezentująca winylową płytę lub okładkę albumu. 
* **Rotacja Tarczy:** W stanie aktywności odtwarzania (`isPlaying === true`), tarcza obraca się z prędkością 33 RPM (obrotów na minutę) przy użyciu zoptymalizowanych sprzętowo animacji CSS3 GPU-accelerated. Gdy odtwarzacz zostanie wstrzymany, tarcza płynnie zwalnia bieg do zera. Daje to pracownikowi lokalu natychmiastową informację wizualną o stanie strumienia na odległość kilku metrów od tabletu.
* **Logarytmiczna Skala Głośności:** Liniowe suwaki głośności (`VolumeRange`) w tradycyjnych systemach powodują nienaturalny skok dźwięku na profesjonalnych przetwornikach audio. Ludzkie ucho odbiera ciśnienie akustyczne w sposób logarytmiczny. HRL B2B tłumi liniową wartość wejściową suwaka (zakres `0.0` do `1.0`) za pomocą wzoru potęgowego:
  $$V_{\text{output}} = V_{\text{slider}}^{2}$$
  Dzięki temu regulacja głośności o 10% przy niskich poziomach daje subtelną różnicę, a głośność rośnie płynnie i przewidywalnie dla ucha w całym zakresie suwaka.
* **Obsługa Gestów Swipe:** Dla ułatwienia pracy kelnerów z tabletami zamontowanymi na ścianach, odtwarzacz nasłuchuje zdarzeń dotykowych `onTouchStart` i `onTouchEnd`. Szybkie przesunięcie palcem po tarczy o co najmniej 50 pikseli w lewo wywołuje funkcję `handleNext()` (następny utwór), natomiast przesunięcie w prawo uruchamia `handlePrev()` (poprzedni utwór). Przeciągnięcie dwoma palcami w górę lub w dół podnosi lub obniża wolumen głośności o 10%.

#### 2.1.2. Inteligentny Harmonogram Godzinowy (Time-Of-Day Scheduler) i Auto-Kolejka
System automatycznie dopasowuje muzykę do pory dnia na podstawie wewnętrznego zegara UTC i ustawionych reguł harmonogramu (`useSchedule`).
* Podział na cztery fazy (Rano, Popołudnie, Wieczór, Noc) pozwala na elastyczne modelowanie atmosfery.
* Gdy system wykryje przejście w nową porę dnia, nie urywa odtwarzanej piosenki w sposób nagły. Czeka na zakończenie aktualnego utworu (tzw. "łagodne przejście ramówki") i ładuje pierwszy utwór z nowej dedykowanej playlisty.
* W przypadku utraty połączenia internetowego, **Auto-Kolejka** zarządza pulą uprzednio zbuforowanych plików (aż do 5 utworów w pamięci podręcznej) i odtwarza je w trybie offline, zapobiegając niezręcznej ciszy w lokalu, a po odzyskaniu sieci automatycznie synchronizuje logi odtworzeń.

#### 2.1.3. Wyszukiwarka, Dynamiczne Filtrowanie Gatunków i Dwuwarstwowy System Audio (Double Audio Engine)
Standardowe odtwarzacze muzyczne posiadają tylko jedną instancję instrukcji `<audio>`. Próba wyszukania i podsłuchu innej piosenki przez pracownika na zapleczu natychmiast przerwałaby muzykę grającą dla gości w sali głównej. W HRL B2B rozwiązano to za pomocą **Dwuwarstwowego Silnika Audio**:
1. **Instancja A (Background Player):** Odpowiada za nieprzerwany strumień muzyki tła w lokalu, podłączony pod główne wyjście audio (np. głośniki sufitowe).
2. **Instancja B (Preview Player / Odtwarzacz Podglądu):** Uruchamia się w małym okienku po kliknięciu ikony lupy przy piosence w wyszukiwarce. Sygnał z Preview Playera jest przekierowany na wbudowany głośnik tabletu lub słuchawki podłączone do komputera barmana. Barman może w pełni kontrolować podgląd, wyszukiwać idealne dopasowania BPM, podczas gdy klienci restauracji słyszą nieprzerwanie główną playlistę. Filtry gatunków (jazz, ambient, lofi, pop itp.) działają asynchronicznie, zawężając wyniki wyszukiwania w ułamku sekundy.

#### 2.1.4. Kreator i Edytor Playlist (Curator Hub - Interfejs Reordering Grip)
Zakładka *Curator Hub* udostępnia intuicyjne narzędzia do projektowania własnych schematów ramówek muzycznych:
* **Drag-and-Drop za pomocą Grip:** Lista piosenek w edytorze playlisty wyposażona jest w pionowe uchwyty (`GripVertical`). Za pomocą przeciągania myszką lub dotknięcia palcem użytkownik może dowolnie zmieniać kolejność piosenek w kolejce. Po upuszczeniu elementu, aplikacja przelicza tablicę indeksów i wysyła asynchroniczny pakiet aktualizacji do serwera.
* **Formularz Kuratora:** Pozwala na dodawanie nazwy playlisty, dedykowanego klienta (np. profil naczółkowy określający logo rynkowe), koloru akcentu i tła w formacie HEX, ustawienia kodu PIN, włączenia filtra cenzury oraz określenia, czy playlista ma ignorować harmonogram i grać w pętli.

#### 2.1.5. Certyfikat Wolności OZZ, Podpisy Cyfrowe i Publiczny Podgląd QR (Audience-Trust Gate)
Ta zakładka stanowi tarczę prawną dla kadr lokalu.
* Prezentuje cyfrową wersję Certyfikatu Zwolnienia z Opłat OZZ.
* Certyfikat generuje hasz unikalnego podpisu cyfrowego zawierający kombinację nazwy firmy, adresu lokalu, numeru NIP oraz aktywnej subskrypcji platformy, zaszyfrowany algorytmem SHA-256.
* **Kod QR:** Kod QR na certyfikacie prowadzi do publicznej, bezpiecznej i zaufanej ścieżki `/certificate/verify/:id` na serwerze HRL. W przypadku kontroli urzędników ZAiKS/STOART, inspektor skanuje kod swoim smartfonem, co bezzwłocznie ładuje certyfikat w bazie z oznaczeniem: `STATUS: WAŻNY - ZWALNIA Z OPŁAT B2B`. Eliminuje to konieczność przechowywania papierowych dokumentów pod ladą i chroni przed próbami wymuszenia bezprawnych mandatów.

#### 2.1.6. Zaawansowana Konsola Analityczna i Wykresy Statystyk Recharts
Dla managerów lokali i dyrektorów finansowych wbudowano profesjonalny moduł analityczny:
* Prezentuje graficzne statystyki odtworzeń za pomocą wykresu **AreaChart** (Recharts) z gradientowym wypełnieniem obszaru. Wykres wizualizuje dobowy podział emisji (liczba unikalnych odtworzeń plików muzycznych) skorelowany z szacunkowym wskaźnikiem wygenerowanych tantiem dla kompozytorów.
* Dane są aktualizowane automatycznie w czasie rzeczywistym.
* Wskaźniki statystyczne zawierają: "Średni czas odtwarzania sesji", "Wskaźnik pominięć (Skip Rate)" oraz "Współczynnik nasycenia Audio CTA" (procentowa ekspozycja komunikatów reklamowych w stosunku do czasu trwania muzyki).

#### 2.1.7. System Spersonalizowanej Akustyki (Zarządzanie EQ, Kompresja Dynamiki i Kalibracja Słów SEO)
Zakładka ta służy do precyzyjnego dopasowania częstotliwościowego dźwięku na podstawie psychologii marketingu sensorycznego oraz warunków pogłosowych pomieszczenia.
* **Profile Sound:** Casual (podstawowy), Expert (zaawansowane suwaki pasmowe), Focus (maksymalne wyciszenie i koncentracja).
* **Manualny Korektor EQ (Expert Mode):** Udostępnia trzy dwukierunkowe suwaki operujące w zakresie od -6dB do +6dB dla pasma niskiego (**Basy** / 80Hz), średniego (**Średnie** / 1kHz) oraz wysokiego (**Sopran** / 10kHz).
* **Kompresor Dynamiki (Compression Density):** Regulowany suwak (0-100%) symulujący działanie kompresora studyjnego. Podnosi najcichsze partie muzyki i tłumi piki głośności dla ujednolicenia tła dźwiękowego, co jest kluczowe w gwarnych restauracjach i supermarketach.
* **Silnik Kalibracji Akustycznej:** Algorytm AI analizuje parametry `seoKeywords` (słowa kluczowe SEO, np. „*luksusowy, relaksujący*”) oraz oczekiwany stopień autorytatywności lektora `vocalTone` i automatycznie dostosowuje pasma. Następnie generuje szczegółowy raport (Calibration Auditor Log), wskazujący precyzyjne matematyczne uzasadnienie wprowadzonych poprawek (np. „*Wykryto słowo kluczowe 'luksusowy' - podbito pasmo 60Hz dla ocieplenia akustycznego o +2.5dB, stłumiono sybilanty o -1dB dla uniknięcia pisków*”).

#### 2.1.8. Komunikacja Zespołowa: Kooperacyjne Notatki i Komentarze AI o Playlistach
Moduł interaktywnych konwersacji wewnętrznych pozwala na wymianę doświadczeń między pracownikami a kuratorami muzycznymi.
* Pracownicy mogą dodawać krótkie wpisy i notatki w czasie rzeczywistym (np. „*Klienci pytali o ten jazzowy kawałek z 10:30, niesamowity klimat!*” lub „*Wyciszyliśmy na chwilę basy, bo w sali konferencyjnej słychać dudnienie*”).
* Wbudowane podpowiedzi AI analizują dodane notatki i automatycznie sugerują optymalizację struktury playlisty, informując np.: „*Wykryto powtarzające się uwagi o zbyt mrocznym klimacie wieczorem. Sugerowane dodanie 2 piosenek z gatunku Nu-Soul o podwyższonym BPM.*”.

#### 2.1.9. Maszyneria Komunikatów i Reklam Głosowych (Audio CTA Voice Ad-Injection & Algorytm Ducking)
Służy do automatycznego wstrzykiwania profesjonalnych komunikatów marketingowych bezpośrednio do systemu nagłośnienia bez ingerencji personelu.
* **Biblioteka szablonów CTA:**
  1. `sales` (Sprzedażowa promocja - np. zaproszenie do kas, oferty promocyjne na ciasto dnia).
  2. `social` (Społecznościowa - prośba o pozostawienie gwiazdek w Google lub dołączenie do fanpage'a).
  3. `lead` (Generowanie kontaktów - zapis do newslettera lub pobranie aplikacji hotelowej).
* **Algorytm Audio Ducking:** Tradycyjne systemy przerywają piosenkę na czas reklamy, co irytuje słuchaczy. HRL B2B wdraża płynne przyciszenie dźwięku w tle. W momencie startu reklamy głosowej, wolumen odtwarzacza tła płynnie w ułamku sekundy opada do poziomu **20%** wartości początkowej, lektor odczytuje komunikat na pierwszym planie, a po jego zakończeniu głośność muzyki tła płynnie (w ciągu 1.5 sekundy za pomocą interpolacji liniowej) powraca do 100%. Replikuje to zachowanie studyjnego kompresora radiowego.

---

### 2.2. Widgety Witryn Partnerskich White-Label (`WhiteLabelPlayer.tsx`)

Służą do osadzania miniaturowego, dostosowanego graficznie odtwarzacza muzyki na stronach internetowych hoteli, kawiarni czy klinik partnerskich w strefach "Kiosk" i panelach rezerwacyjnych.

#### 2.2.1. Brama Zabezpieczająca PIN (4-digit Access Guard)
Aby unikalny dobór repertuarowy kawiarni lub hotelu nie został skopiowany przez konkurencję, w panelu edycji strony dostępowej administrator może włączyć flagę `requirePin`.
* Przed załadowaniem interfejsu odtwarzacza, na ekranie pojawia się cyfrowy Keypad ( Access Guard).
* Pracownik lub gość lokalu musi wpisać poprawny 4-cyfrowy kod PIN przypisany do placówki.
* Trzykrotne podanie niepoprawnego kodu na danym adresie IP skutkuje zablokowaniem formularza na 15 minut (ochrona przed Brute-Force).

#### 2.2.2. Dynamiczny Silnik Wizualny (Dynamic Skin & Theme Injector) i Osadzanie CSS
Widget pobiera z bazy dane o marce użytkownika i wstrzykuje je bezpośrednio do stylów systemowych.
* Kolor tła (`bgColor`) oraz kolor przycisków (`accentColor`) są mapowane bezpośrednio do zmiennych CSS.
* **Custom CSS Sandbox:** Zaawansowana sekcja pozwalająca administratorowi na wklejenie własnego kodu stylów CSS. Kod ten jest oczyszczany ze znaczników niebezpiecznych (Sanitization) i kompilowany w locie do tagu `<style>` w nagłówku widgetu partnerskiego, co umożliwia całkowite przedefiniowanie zaokrągleń ramek, gradientów, cieniowania i zachowania przycisków pod ścisłe korporacyjne wytyczne Brand Booka partnera.

---

### 2.3. Konsola Super-Administratora (`AdminDashboard.tsx`) - Kompleksowy Przegląd Wszystkich 11 Zakładek

Kokpit Super-Administratora to potężne centrum dowodzenia podzielone na 11 modułów funkcjonalnych, z których każdy odpowiada za kluczowy boczny mechanizm systemu:

```
+========================================================================================+
|                              PORTAL SUPER-ADMINISTRATORA                               |
+========================================================================================+
| [Dashboard] [Monitoring] [Tracks] [Playlists] [Designer] [Pages] [Invoices] ...        |
+----------------------------------------------------------------------------------------+
|                                  TOPOLOGY DIAGRAM                                      |
|                                                                                        |
|   +-------------------+      GET API / HTTPS      +------------------------+           |
|   |   Vercel SPA      | ------------------------> |   Nginx Reverse Proxy  |           |
|   |   (React Frontend)| <------------------------ |   (IP: Port 80 / 443)  |           |
|   +-------------------+      HTTP JSON / WSS      +------------------------+           |
|                                                               |                        |
|                                                     Port 3000 | (Proxy Pass)           |
|                                                               v                        |
|                                                   +------------------------+           |
|                                                   |   Express.js Server    |           |
|                                                   |   (In-Memory SQLite DB)|           |
|                                                   +------------------------+           |
|                                                               |                        |
|                                            X-Accel-Redirect   | (Internal Header)      |
|                                            /protected_audio/  v                        |
|                                                   +------------------------+           |
|                                                   |   Dysk VPS (/media)    |           |
|                                                   |   (Zero-Copy Stream)   |           |
|                                                   +------------------------+           |
|                                                                                        |
+========================================================================================+
```

#### 2.3.1. Zakładka Dashboard (Czterokanałowy Panel Finansowo-Biznesowy KPI)
Prezentuje skonsolidowany przegląd kondycji platformy za pomocą czterech precyzyjnych liczników operacyjnych:
1. **Aktywni Odbiorcy na Żywo (Active Streams):** Łączna liczba obecnie otwartych i zalogowanych połączeń WebSocket z odtwarzaczami w kraju. Zapobiega to oszustwom współdzielenia jednego konta przez kilka lokali.
2. **Miesięczny Przychód Powtarzalny (Monthly Recurring Revenue - MRR):** Łączna wartość zebranych i zaksięgowanych faktur ze statusem `paid` od wszystkich kontrahentów w bieżącym okresie rozliczeniowym.
3. **Abonenci PMPro:** Podział liczby użytkowników ze szczególnym uwzględnieniem aktywnych planów Starter, Business oraz Enterprise.
4. **Globalny Licznik Emisji (Global Plays Counter):** Całkowita liczba wywołań endpointu `/api/play`. Każde odtworzenie piosenki powyżej 30 sekund wywołuje log rozliczeniowy, stanowiący podstawę do uczciwych wypłat tantiem bezpośrednich dla artystów niebywających w OZZ.

#### 2.3.2. Zakładka Monitoring (Śledzenie Incydentów, RAM, WebSocket, Cache Hit Rates)
Zakładka monitorowania technicznego w czasie rzeczywistym.
* Prezentuje wydajność maszyny wirtualnej: poziom użycia pamięci RAM, obciążenie procesora oraz liczbę pakietów WebSocket na sekundę.
* **Poziom Cache Hit Rate:** Wizualizuje efektywność serwera w dostarczaniu statycznych metadanych i cache'owaniu zapytań SQL.
* **System Rejestru Incydentów:** Lista ostrzeżeń systemowych generowana automatycznie przez watchdogs (np. „*Wykryto spadek przepustowości łącza TCP na porcie 3000 do 12Mbps*” lub „*Wykładnicza seria rozłączeń WebSocket na porcie 3000 - brak pakietu ping przez 65s z lokali sieciowych*”). Pozwala inżynierowi na błyskawiczne diagnozowanie awarii zanim klienci zgłoszą brak dźwięku w kawiarniach.

#### 2.3.3. Zakładka Tracks (Pełny CRUD Utworów, BPM, Tagi, Walidacja Kodów ISRC)
Kompleksowa strefa zarządzania bazą utworów muzycznych.
* Administrator ma możliwość wdrożenia nowego utworu poprzez formularz wprowadzania: Tytuł, Wykonawca, Album, Rok wydania, Gatunek, Tempo BPM.
* **Oznaczanie ISRC:** Każdy utwór musi posiadać unikalny kod **ISRC** (International Standard Recording Code, np. `PLHRL2600012`) potwierdzający unikalność nagrania dźwiękowego i prawa własności. System automatycznie sprawdza poprawność wpisanego hasza (wyrażenie regularne sprawdzające dopasowanie do formatu ISO 3901).
* **Affinity Rules:** Macierz pól wyboru pór dnia (morning, afternoon, evening, night) określająca, w jakich porach wolno odtwarzać utwór w ramach automatycznych auto-kolejek.

#### 2.3.4. Zakładka Playlists (Struktury Ramówek, Przypisywanie PMPro i Ukrywanie List)
Służy do tworzenia i modyfikowania playlist systemowych i dedykowanych.
* **PMPro Level Assignment:** Administrator przypisuje playliście próg subskrypcji. Jeśli playlista jest oznaczona jako Poziom 3 (Enterprise), kawiarnia na poziomie Starter zostanie automatycznie zablokowana przy próbie załadowania piosenek.
* **Flaga `hideTracklist`:** Bardzo ważny element zabezpieczenia know-how kuratorskiego. Włączenie tej opcji powoduje, że pracownicy kawiarni w Panelu B2B widzą tylko okładkę i tytuł aktualnie granego utworu. Pełna lista nadchodzących piosenek w playlistach zostaje zablokowana i ukryta, co zapobiega skopiowaniu ułożonego programu muzycznego przez konkurentów.

#### 2.3.5. Zakładka Designer (Wizualny Kreator Stylów, Typografia i Kolory)
Zapewnia pełną kontrolę nad estetyką interfejsu klienta B2B.
* Pozwala na unikalne parowanie krojów czcionek (np. nowoczesny *Space Grotesk* dla nagłówków, czytelny *Inter* dla tekstu głównego, techniczny *JetBrains Mono* dla danych telemetrycznych i kodów ISRC).
* Przyciskami zmiany skórek administrator może zmienić globalne cieniowanie ramek, stopień zaokrąglenia przycisków (od brutalistycznych kanciastych rogów `rounded-none` po obłe, przyjazne krawędzie `rounded-full`) oraz mapowanie kolorów przewodnich dla ułatwienia orientacji visualnej personelu.

#### 2.3.6. Zakładka Pages (Zarządzanie Podstronami AccessPages, Slug i Ograniczenia IP)
Moduł tworzenia dedykowanych stron White-Label przeznaczonych pod osadzanie.
* Każda wygenerowana strona posiada przyjazny adres URL bazujący na slugu (np. `/p/salon-spa-magnolia`).
* Możliwość zdefiniowania specyfikacji `AccessPage`: przypisanie docelowej playlisty, włączenie bramki PIN z określeniem kodu dostępu, wgranie spersonalizowanego logo, napisanie dedykowanego tytułu i podtytułu strony powitalnej.
* **Ograniczenia adresów IP (Allowed IPs):** Wpisanie zakresu adresów IP blokuje możliwość uruchomienia playeru poza fizyczną siecią Wi-Fi kawiarni lub hotelu (zabezpieczenie przed puszczaniem muzyki przez barmanów w domach).

#### 2.3.7. Zakładka Invoices (Integracja z Systemem Rozliczeniowym, Generowanie Faktury VAT)
Udostępnia panel finansowy rejestrujący transakcje abonenckie.
* Spis faktur papierowych i cyfrowych z możliwością edycji statusów rozliczeniowych (`paid`, `unpaid`, `overdue`).
* Generowanie nowej faktury za okres rozliczeniowy subskrypcji B2B, umożliwiające automatyczny zapis metadanych w formacie PDF i seryjny wydruk.

#### 2.3.8. Zakładka Security (HMAC Token Verification, Adresy IP, Token Garbage Collector)
Kokpit bezpieczeństwa kryptograficznego i kontroli zasobów serwera:
* Wyszczególnia wygenerowane dla stacji bilety sesyjne, ich unikalny kod, czas wygaśnięcia, used-count (liczba pobrań fragmentów pliku przez Nginx) oraz adres IP stacji poświadczony skrótem SHA-1.
* **Przycisk Clear Expired Tokens (Token Garbage Collector):** Pozwala deweloperowi na natychmiastowe opróżnienie struktur pamięci RAM RAM-Engine z nieaktywnych biletów sesyjnych bez czekania na automatyczną pętle GC, optymalizując czas wyszukiwania kluczy o 15%.

#### 2.3.9. Zakładka Backup (Kopie Zapasowe i Moduł Walidacji Integralności JSON)
Moduł kluczowy dla bezawaryjnej pracy i ciągłości biznesowej.
* **Pobranie Kopii:** Pobiera cały in-memory obiekt bazy (UserProfile, Tracks, Playlists, Invoices, Pages) wygenerowany do formy sformatowanego pliku `.json`.
* **Kreator Przywracania Integralności (JSON Restore Integrity Tool):** Posiada bezpieczny panel wyboru plików. Po przeciągnięciu pliku JSON, moduł przeprowadza audyt strukturalny: sprawdza obecność wymaganych unikalnych kluczy obiektów, weryfikuje poprawność relacji ID, testuje obecność wymaganych typów i w przypadku braku anomalii nadpisuje bazę RAM w locie.

#### 2.3.10. Zakładka Integrations (Webhooki Zdarzeń, API Deweloperskie i Integracja PIM/MDM)
Moduł łączący Hardban Records Lab B2B z zewnętrznymi platformami klasy Enterprise:
* **Webhooki Zdarzeń:** Rejestracja adresów URL partnerów przesyła paczki danych o zdarzeniach systemowych w formacie JSON (zdarzenia: `music.trackStarted`, `auth.pinFailed`, `billing.invoiceOverdue`).
* **Klucze API Dewelopera:** Generowanie bezpiecznych kluczy uwierzytelniających do odpytywania API bezpośrednio z systemów klienta.
* **Integracja PIM/MDM:** Pozwala systemom PIM na automatyczne wysyłanie nowych opisów produktów wejściowych na stacje, co umożliwia syntezatorowi mowy automatyczne układanie spersonalizowanych spotów reklamowych Audio CTA w kawiarniach i butikach.

#### 2.3.11. Zakładka Headless (Topologia Nginx X-Accel-Redirect, Simulator i Pliki Konfiguracyjne)
Zaawansowana sekcja dla sysops i inżynierów DevOps:
* **Topology Map:** Graficzny, interaktywny model pokazujący trasę żądań HTTP i zapytań WebSocket między przeglądarką, chmurą Vercel, dedykowanym proxy Nginx a serwerem Express na porcie 3000.
* **Simulation Console:** Wybierając dowolny utwór i TTL tokenu, inżynier generuje poprawny podpisany URL `/api/audio/:filename?hrl_token=signature` i wykonuje symulowane żądanie. Serwer zwraca pełne nagłówki oraz symulacyjny log procesu Nginx, wskazujący, czy Nginx prawidłowo odczytałby nagłówek przekierowania i przesłał plik z fizycznego folderu mediów `/protected_audio/` z pominięciem procesora Express.
* **Config Files Hub:** Wizualne szablony z możliwością szybkiego kopiowania gotowych plików wdrożeniowych: `docker-compose.yml`, `nginx.conf` oraz skryptu integracyjnego `wp-config-headless.php` służącego do autoryzacji poziomów PMPro z bazy WordPressa.

---

### 2.4. Generator i Edytor Faktur VAT (`InvoiceModal.tsx`) i Środowisko Rozliczeniowe

Faktura w HRL B2B to pełnoprawny, zgodny z unijnym prawem handlowym dokument księgowy o statusach `paid`, `unpaid` i `overdue`.
* **Matematyka Podatkowa (VAT 23% Calculation):** Wystarczy podać cenę jednostkową netto produktu subskrypcji oraz ilość (liczba lokali). Algorytm modalny automatycznie wylicza podatki i zaokrągla wyniki do dwóch miejsc po przecinku:
  $$\text{Wartość Netto} = \sum (\text{Cena Jednostkowa Netto} \times \text{Ilość})$$
  $$\text{Kwota Podatku VAT (23\%)} = \text{Wartość Netto} \times 0.23$$
  $$\text{Wartość Brutto} = \text{Wartość Netto} + \text{Kwota Podatku VAT}$$
* **System druku A4 (Print-Ready Layout):** Komponent został sformatowany z użyciem dedykowanych klas Tailwind `print:bg-white print:text-black`. Gdy użytkownik wywoła systemowe okno drukowania (`Ctrl+P`) lub kliknie przycisk "Drukuj PDF" na makiecie makiety, wszelki szum wizualny platformy – boczna nawigacja administracyjna, przyciski akcji, panel przełączania użytkowników, ciemne tło – są automatycznie maskowane klasą `print:hidden`. Na kartce papieru lub w wyrenderowanym pliku PDF pojawia się idealnie sformatowany, czarno-biały dokument faktury gotowy do wysłania do księgowości firmy.

---

## 3. MODEL TECHNICZNY, STRUKTURA DANYCH I STRATEGIA BAZODANOWA

### 3.1. Precyzyjne Opisy i Mapowanie Pól z `src/types.ts`

Wspólne klasy i obiekty typowane są za pomocą standardu TypeScript, zapewniając integralność bazy danych RAM:

1. **`Track` (Utwór muzyczny):** Reprezentuje strukturę pliku dźwiękowego w katalogu mediów. Zawiera bazowy identyfikator `id`, cechy literalne `title`, `artist`, `album`, `year`, parametry fizyczne `bpm`, `genre`, tablicę nastrojów `mood` (relax, upbeat, cozy itp.), czas odtwarzania w sekundach `duration`, flagę bezpieczeństwa `explicit`, tablicę akceptowalnych pór dnia `timeOfDay`, unikalny kod `isrc`, ścieżkę do okładki `cover` oraz fizyczny plik na dysku VPS `filename`.
2. **`Playlist` (Kolekcja):** Określa właściwości ramówki dźwiękowej. Posiada parametr wyznaczający minimalny stopień subskrypcji wymagany do odsłuchu `pmproLevel`, nagłówki i logotypy klienta `clientName` i `clientLogo`, kolory przewodnie `bgColor` i `accentColor`, flagi programowe `autoplay`, `loop`, `hideTracklist`, `useSchedule`, domyślny poziom głośności startowej `volume`, zabezpieczający kod PIN `pin`, przypisane hasło Audio CTA `audioCta` oraz parametry dynamicznego kalibratora acoustics `seoKeywords`.
3. **`AccessPage` (Strona White-Label):** Definiuje strukturę spersonalizowanego odtwarzacza partnerskiego. Łączy w sobie przyjazny dla przeglądarki slug adresu URL `slug`, flagę aktywności `active`, wymóg logowania kodem PIN `requirePin` oraz zagnieżdżoną strukturę motywu `whiteLabelTheme` (wraz z custom CSS `customCss` nadpisującym style Tailwind).

---

### 3.2. Model Decoupled Front/Back (Wielopoziomowy Split-Hosting Vercel + Nginx VPS)

Architektura opiera się na rozdzieleniu warstwy prezentacji (Frontend) od silnika logiki i przesyłu danych (Backend/Media Stream).

* **React SPA na Vercel:** Cała aplikacja kliencka, komponenty UI, wykresy Recharts i panele kontrolera są kompilowane i serwowane w całości jako lekki, statyczny plik HTML/JS bezpośrednio przez sieć brzegową drugiego poziomu Vercel CDN. Gwarantuje to zerowe opóźnienia i brak utraty dostępu do interfejsu przy skokach ruchu.
* **Express & WebSockets on VPS:** Zasoby bazodanowe RAM-Engine, generator kluczy kryptograficznych i serwer WebSockets do telemetrii znajdują się na chronionym serwerze VPS. Nginx na porcie 443 proxy'uje pakiety na wewnętrzny port 3000 serwera Node.js, izolując procesor Express przed bezpośrednimi atakami sieciowymi.

---

### 3.3. Wsparcie Komunikacyjne: Rola Pliku Narzędziowego (`src/utils.ts`) i Bezpieczeństwo Mixed Content

Dla uproszczenia komunikacji w strukturze rozproszonej, w kodzie zaimplementowano plik pomocniczy `src/utils.ts`.

* **Pobieranie ApiUrl (`getApiUrl(path)`):** Bada obecność zmiennej środowiskowej `import.meta.env.VITE_API_URL`. Jeśli zmienna nie została zdefiniowana (środowisko deweloperskie local-host), zwraca lokalny URL `http://localhost:3000` łącząc go ze ścieżką wejściową. Jeśli zmienna istnieje, dba o właściwy format domeny brzegowej VPS i usuwa nadmiarowe ukośniki przed zapytaniem.
* **Konfiguracja WebSocket URL (`getWsUrl()`):** Automatycznie wyznacza poprawny format protokołu przesyłu zdarzeń czasu rzeczywistego. Jeśli strona nadrzędna działa na bezpiecznym protokole `https://`, funkcja podmienia dopasowanie na `wss://` (WebSocket Secure). Zapobiega to błędom typu **Mixed Content** – nowoczesne przeglądarki rygorystycznie odrzucają nieszyfrowane połączenia `ws://` z poziomu stron posiadających certyfikat SSL, co zablokowałoby przesył telemetrii w lokalu.

---

### 3.4. Serwer Nginx: Caching, Obsługa Range Requests i Dynamiczne Przekierowanie `X-Accel-Redirect`

Tradycyjne przesyłanie plików multimedialnych przez silnik Node.js (metodą `fs.readFile` lub strumieniem `stream.pipe`) drastycznie obciąża procesor serwera, powodując wycieki pamięci przy masowym odsłuchu przez setki kawiarni jednocześnie. W HRL B2B wdrożono optymalizację **Zero-Copy przy użyciu Nginx**:

```
[Klient w kawiarni] -- (1) Żąda pliku audio z tokenem HMAC --> [Express.js API (Port 3000)]
                                                                       |
                                                           (Weryfikuje token i licencję)
                                                                       |
[Nginx Proxy] <---- (3) Przesyła plik z dysku (/media_files) <---- (2) X-Accel-Redirect: /protected_audio/
      |
(Range Requests)
      |
      v
(Strumień audio płynie bezpośrednio do głośników kawiarni!)
```

1. Przeglądarka wysyła zapytanie po plik pod adres `/api/audio/:filename?hrl_token=signature`.
2. Aplikacja Express sprawdza poprawność pasującego hasza HMAC, ważność czasu TTL biletu oraz adres IP.
3. Po autoryzacji serwer Express nie czyta pliku z dysku. Zamiast tego odsyła pustą odpowiedź HTTP zawierającą wewnętrzny dedykowany nagłówek technologii Nginx:
   `X-Accel-Redirect: /protected_audio/nazwa_pliku.wav`
4. Serwer proxy Nginx rozpoznaje ten nagłówek i samodzielnie, z pominięciem Node.js, strumieniuje plik audio bezpośrednio z chronionego katalogu `/media_files/`.
5. Dzięki pełnej obsłudze **Range Requests** (nagłówek `Accept-Ranges`), odtwarzacz w kawiarni może swobodnie przewijać ścieżki do przodu i do tyłu. Nginx przesyła wyłącznie pożądany wycinek bajtów, minimalizując zużycie transferu i wykluczając buforowanie strumienia przy przeciążonej sieci hotelowej Wi-Fi.

---

## 4. WYCZERPUJĄCY RAPORT BEZPIECZEŃSTWA (CYBER-DEFENSE & CRYPTO SPECS)

---

### 4.1. Kryptograficzne Zabezpieczenie Ścieżek: HMAC SHA-256
Dla zabezpieczenia zasobów muzycznych przed wyciekiem na zewnętrzne rynki komercyjne, każdy odtwarzacz żądający dostępu do pliku audio musi poświadczyć swoje uprawnienia ważną sygnaturą **HMAC SHA-256**:
1. Serwer generuje sygnaturę łącząc nazwę pliku, identyfikator użytkownika oraz czas wygasania sesji TTL przy użyciu unikalnego hasła kryptograficznego:
   $$\text{Signature} = \operatorname{HMAC-SHA256}(\text{HMAC\_SECRET}, \text{filename} \mathbin{\Vert} \text{userId} \mathbin{\Vert} \text{expiresAt})$$
2. Przy próbie bezautoryzowanej zmiany nazwy utworu w adresie url (np. barman próbuje podmienić podkład `jazz-01.wav` na najnowszy hit premium `club-premium-99.wav`), hasz HMAC przestaje pasować do klucza serwera. Express odrzuca zapytanie, odsyłając status **403 Forbidden** i wpisując incydent bezpieczeństwa do bazy monitorowania.

---

### 4.2. Obrona przed Atakami "Known Salt Attack" - Generator CSPRNG o Wysokiej Entropii
W powszechnych rozwiązaniach klucz solny (Salt) zapisany jest na stałe w konfiguracji kodu. W razie włamania i kradzieży kodu źródłowego, haker bez przeszkód może samodzielnie generować ważne sygnatury audio.
* W HRL B2B zastosowano **Dynamiczny Klucz Entropii**: serwer przy startowaniu poszukuje zmiennej `HMAC_SECRET`. W razie jej braku, uruchamia kryptograficznie bezpieczny generator liczb pseudolosowych (CSPRNG):
  ```typescript
  const secureKey = crypto.randomBytes(32).toString("hex");
  ```
* Generuje to 256-bitowy losowy ciąg o najwyższej znanej entropii. Klucz ten jest utrzymywany wyłącznie w chronionym obszarze pamięci RAM procesu Node.js. Ulega on całkowitej zmianie przy każdym restarcie serwera. Przechwycenie klucza bez fizycznego dostępu na poziomie konta root systemu VPS jest niemożliwe.

---

### 4.3. Zwalczanie Wycieków Pamięci RAM (Procesy TGC i RLGC w Pętli Tła)
Baza in-memory zlokalizowana w pamięci operacyjnej RAM serwera Node.js wymaga rygorystycznego zarządzania zasobami w celu uniknięcia awarii typu Out-of-Memory (OOM):
* **Token Garbage Collector (TGC):** Asynchroniczna pętla uruchamiająca się automatycznie co 10 minut. Przeszukuje tabelę zarejestrowanych biletów sesyjnych `tokensList` i bezpowrotnie zwalnia z pamięci obiekty, których czas `expiresAt` minął, przeciwdziałając zapychaniu strefy sterty procesora.
* **Rate-Limiter Garbage Collector (RLGC):** Co 5 minut oczyszcza słownik limitów zapytań `rateLimitMap`, usuwając nieaktywne wpisy IP, dla których okres monitorowania sliding-window wygasł.

---

### 4.4. Tarcza Przeciw DDoS/Brute-force: Serwerowy Rate Limiter (IP Sliding Window Mapping)
Dla zapobieżenia atakom mającym na celu wyłączenie serwera poprzez seryjne zapytania API, wdrożono dedykowany middleware dynamicznego limitowania:
* IP każdego żądania jest rejestrowane w mapie `rateLimitMap` wraz ze znacznikiem czasu.
* Przekroczenie progu **300 zapytań w ciągu 60 sekund** z jednego adresu IP uruchamia natychmiastowe ucięcie połączenia i zwrócenie statusu **429 Too Many Requests**, chroniąc zasoby pamięci operacyjnej VPS.

---

### 4.5. Nagłówki Zabezpieczające HTTP (Zalecenia OWASP) i Ścisła Konfiguracja Polityk CORS
Wszystkie wychodzące pakiety HTTP są wzbogacone o twarde reguły bezpieczeństwa OWASP:
* `X-Frame-Options: SAMEORIGIN` - chroni przed osadzaniem odtwarzacza w złośliwych ramkach (Clickjacking).
* `X-Content-Type-Options: nosniff` - blokuje próby interpretacji typów MIME plików przez przeglądarkę.
* `X-XSS-Protection: 1; mode=block` - blokuje wykonywanie niebezpiecznych skryptów wstrzykniętych w formularze (Cross-Site Scripting).
* **Polityka CORS:** Rygorystycznie dopasowuje nagłówek `Origin` do zaufanych domen frontendu Vercel, uniemożliwiając podsłuch sesji cookies przez zewnętrzne skrypty.

---

## 5. PROTOKÓŁ DWUKIERUNKOWY CHMURY WEBSOCKET (REAL-TIME STREAM TELEMETRY)

### 5.1. Architektura Połączenia i Protokół Utrzymania Łącza (Ping-Pong Heartbeat Loop)

WebSocket gwarantuje natychmiastową, dwukierunkową wymianę danych bez obciążania sieci klasycznymi zapytaniami typu polling. Połączenie zabezpieczane jest protokołem `wss://`.

Ponieważ routery i zapory sieciowe w hotelach i sieciach komercyjnych domyślnie zrywają nieaktywne sesje TCP po 60 sekundach bezczynności, w systemie wdrożono **Pętlę Heartbeat (Utrzymanie Łącza)**:
* Co 30 sekund przeglądarka wysyła do serwera mały pakiet kontrolny o postaci: `{"type": "ping"}`.
* Serwer bezzwłocznie odpowiada pakietem: `{"type": "pong"}`.
* Brak odpowiedzi w ciągu 45 sekund jest interpretowany jako zerwanie łącza – odtwarzacz natychmiast wkracza w tryb łagodnego automatycznego przywracania połączenia w tlej (Auto-Reconnect) bez przerywania muzyki.

---

### 5.2. Rejestracja Gniazda (Client Hello Envelope Schema)
Zaraz po otwarciu gniazda, klient wysyła sygnaturę "Client Hello":
```json
{
  "type": "register",
  "userId": "u2",
  "role": "subscriber",
  "clientName": "Coffee Aroma Comfort",
  "currentTrack": "Lofi Brainwaves - Espresso Roast"
}
```
Serwer paruje id klienta z przypisanym adresem gniazda WebSocket w strefie RAM i aktualizuje status placówki w panelu administracyjnym na "Online".

---

### 5.3. Monitorowanie Aktywności Odtwarzania i Powiadomienia Broadcast Administratora
* **Pakiet Telemetrii (`playing`):** Przy każdej zmianie utworu odtwarzacz emituje pakiet zawierający tytuł piosenki, kod playlisty, aktualną głośność i status kompresora EQ. Pozwala to administratorowi na żywy podgląd co dokładnie słyszą goście w każdym lokalu w kraju w danym momencie.
* **Masowe Powiadomienia Broadcast (`broadcast`):** Administrator może z poziomu zakładki *Pages* lub *Dashboard* wpisać pilny komunikat i nadać go seryjnie do wszystkich zalogowanych odtwarzaczy (np. „*Wiadomość z centrali: Przerwa techniczna serwera o 01:00 UTC*”). Wiadomość pojawia się natychmiast na ekranie pracowników w postaci ruchomego czerwonego paska ostrzegawczego.

---

## 6. REPERTUAROWA SPECYFIKACJA INTERFEJSÓW REST API

Aplikacja udostępnia rozbudowane, skalowalne i bezpieczne endpointy REST API:

---

### 6.1. Zarządzanie Kontami i Pętla Autoryzacji

#### 1. GET `/api/users`
* **Metoda:** `GET`
* **Zadanie:** Pobranie bazy kontrahentów systemu w celu edycji uprawnień lub nadpisania planów subskrypcyjnych.
* **Autoryzacja:** Wymagany nagłówek `Authorization: x-user-id <admin_id>`.
* **Odpowiedź (200 OK):**
  ```json
  [
    {
      "id": "u2",
      "email": "kontakt@aromacoffee.pl",
      "name": "Coffee Aroma Comfort",
      "role": "subscriber",
      "pmproLevel": 2,
      "playlistIds": ["p1", "p2"]
    }
  ]
  ```

---

### 6.2. Metadane Biblioteki Utworów i Przesył Binarny

#### 1. GET `/api/tracks`
* **Metoda:** `GET`
* **Zadanie:** Pobranie listy utworów z globalnego katalogu wraz z kompletem ich parametrów technicznych i fizycznych.
* **Odpowiedź (200 OK):**
  ```json
  [
    {
      "id": "t1",
      "title": "Acoustic Espresso Brew",
      "artist": "HRL Jazz Trio",
      "album": "Coffee Shop Standards",
      "year": 2026,
      "bpm": 84,
      "genre": "jazz",
      "mood": ["cozy", "focus"],
      "duration": 210,
      "explicit": false,
      "timeOfDay": ["morning", "afternoon"],
      "isrc": "PLHRL2600004",
      "cover": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
      "filename": "jazz-espresso-84bpm.wav"
    }
  ]
  ```

---

### 6.3. Playlisty, Filtry Poziomu PMPro i Harmonogramy

#### 1. GET `/api/my-playlists`
* **Metoda:** `GET`
* **Zadanie:** Pobranie listy playlist autoryzowanych wyłącznie dla poziomu PMPro zalogowanego lokalu. Odrzuca próby żądania playlist premium z poziomu darmowych planów Starter.
* **Uwierzytelnienie:** Nagłówek `Authorization: x-user-id <user_id>`.

#### 2. POST `/api/playlists`
* **Metoda:** `POST`
* **Zadanie:** Tworzenie nowej playlisty przez administratora lub kuratora muzycznego.

---

### 6.4. Księgowość i Faktury B2B

#### 1. GET `/api/invoices`
* **Metoda:** `GET`
* **Zadanie:** Pobranie listy faktur. Zwykły subskrybent o uprawnieniach `role: 'subscriber'` ma prawo pobrać wyłącznie dokumenty powiązane z jego adresem email. Próba odpytania o cudze ID zwraca status **403 Forbidden**.

---

### 6.5. Kontrola i Diagnostyka Środowiska Headless

#### 1. POST `/api/nginx/simulate`
* **Metoda:** `POST`
* **Zadanie:** Testowanie systemu wdrożenia rozproszonego. Generuje podpisany URL z wybranym TTL i symuluje odebranie żądania przez proxy Nginx, zwracając komplet informacji diagnostycznych oraz nagłówki `X-Accel-Redirect`.

---

## 7. DEWELOPERSKI I SYSOP RUNBOOK: PROTOKÓŁ WDROŻENIA ROZPRASZONEGO

Podręcznik opisujący procedurę uruchomienia platformy w pełni skalowalnym środowisku produkcyjnym Linux Ubuntu:

---

### 7.1. Instalacja i Optymalizacja VPS (Node.js LTS, PM2, RAM Watchdog)
1. **Zaloguj się na instancję VPS przez terminal:**
   ```bash
   ssh root@ip-twojego-serwera-vps
   ```
2. **Dokonaj pełnego upgrade pakietów systemowych systemu Linux:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl git build-essential nginx ffmpeg
   ```
3. **Zainstaluj wersję Node.js LTS (v18+) za pomocą instalatora NVM:**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18
   ```
4. **Zainstaluj menedżer procesów PM2 do zarządzania aplikacją w tle:**
   ```bash
   npm install -g pm2
   ```
5. **Skonfiguruj skrypt serwera i uruchom aplikację:**
   ```bash
   cd /var/www/hrl-backend
   npm install
   npm run build
   pm2 start dist/server.cjs --name "hrl-vps-backend" --max-memory-restart 1G
   pm2 save
   pm2 startup
   ```

---

### 7.2. Konfiguracja Serwera Proxy Nginx, Obsługi Plików Chronionych i Certyfikacji SSL Let's Encrypt
1. **Utwórz plik konfiguracyjny hosta domeny:**
   ```bash
   sudo nano /etc/nginx/sites-available/hrl-api
   ```
2. **Wklej poniższy, w pełni zoptymalizowany dla przesyłu mediów kod serwera:**
   ```nginx
   server {
       listen 80;
       server_name api.twojadomena.pl;

       # Maksymalny rozmiar nowego utworu przy wgrywaniu do bazy (120 Megabajtów)
       client_max_body_size 120M;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;

           # Podtrzymanie łączności dla WebSockets i telemetrii
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";

           # Przekazywanie IP stacji końcowej do mechanizmów rate limitera
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;

           proxy_connect_timeout 120s;
           proxy_send_timeout 120s;
           proxy_read_timeout 120s;
       }

       # Bezpieczna ścieżka wewnętrzna do przesyłu Zero-Copy X-Accel-Redirect
       location /protected_audio/ {
           internal; # Odrzucenie prób wywołania bezpośredniego z zewnątrz lokalu
           alias /var/www/hrl-backend/media_files/;

           add_header Cache-Control "private, no-store, no-cache, must-revalidate, max-age=0";
           add_header X-Content-Type-Options "nosniff" always;
       }
   }
   ```
3. **Aktywuj dowiązanie i zresetuj serwer Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/hrl-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```
4. **Zainstaluj darmowe certyfikaty SSL za pośrednictwem Certbot:**
   ```bash
   sudo apt install snapd
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   sudo certbot --nginx -d api.twojadomena.pl
   ```

---

### 7.3. Budowa i Wdrożenie Frontendu SPA na Platformie Vercel
1. Zaloguj się na konto **Vercel** (`https://vercel.com`).
2. Podepnij bezpieczne repozytorium projektu i wybierz odpowiedni podkatalog.
3. Skonfiguruj parametry kompilacji frontendowej platformy:
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Dodaj kluczową zmienną środowiskową wskazującą na adres VPS:
   * **Key:** `VITE_API_URL`
   * **Value:** `https://api.twojadomena.pl` (zwróć uwagę na protokół https!).
5. Uruchom proces **Deploy**. Odtwarzacz jest gotowy do legalnej pracy w każdym punkcie w kraju!

---

## 8. ZAAWANSOWANE STRATEGIE DOSTĘPNOŚCI, ERGONOMII I UI/UX

---

### 8.1. Skróty Klawiaturowe (Keyboard Shortcuts Tracker) dla Personelu i Skróty Klawiszowe Odtwarzacza
Praca za barem kawiarni lub w recepcji hotelu wymaga błyskawicznej reakcji bez konieczności celowania kursorem w ekran tabletu przy tłumie klientów. System nasłuchuje zdarzeń klawiaturowych `keydown` i obsługuje następujące skróty:
* `Spacja (Space)` $\rightarrow$ Uruchomienie lub wstrzymanie odtwarzania głównego kanału tła (Play/Pause).
* `Strzałka w prawo (Right Arrow)` lub `N` $\rightarrow$ Natychmiastowe pominięcie i przejście do następnego utworu w ramówce.
* `Strzałka w lewo (Left Arrow)` lub `P` $\rightarrow$ Powrót do poprzedniej piosenki.
* `M` $\rightarrow$ Natychmiastowe wyciszenie całego systemu audio (Mute) - przydatne w razie nagłego telefonu na recepcji lub wejścia ważnego klienta B2B.
* `S` $\rightarrow$ Awaryjne, natychmiastowe zatrzymanie (Emergency Stop) i wyczyszczenie buforów przeglądarki.
* `Alt + L` $\rightarrow$ Bezpośrednie przełączenie widoku na zakładkę Certyfikatu Licencji, gotową do prezentacji inspektorowi kontrolnemu.

---

### 8.2. Tryb Wysokokontrastowy (High Contrast Mode) i Redukcja Tekstur Tła
Dla osób ze słabszym wzrokiem lub pracujących w mocno oświetlonych miejscach (np. letnie ogródki kawiarniane, recepcje o silnym słońcu), aplikacja posiada **Tryb Wysokiego Kontrastu**:
* Włączenie tej opcji całkowicie usuwa mroczne tekstury, głębokie gradienty i cienie.
* Podmienia kolory tła na absolutną czerń i śnieżną biel (`text-white border-2 border-white`).
* Drastycznie zwiększa grubość czcionek oraz ram obramowań formularzy, gwarantując czytelność na poziomie powyżej standardu WCAG 2.1 AA.

---

### 8.3. Tryb Skautów "Zero Distraction" (Minimalistyczny Widok Odtwarzacza)
Służy do zmaksymalizowania skupienia ekipy lokalu na ich pracy operacyjnej.
* **Ukrycie Elementów:** Tryb ten chowa wyszukiwarkę, playlisty, statystyki finansowe, komentarze, panel konfiguracji akustyki oraz logo korporacyjne.
* **Interfejs Minimalistyczny:** Na środku ekranu pozostaje wyłącznie minimalistyczne koło tarczy Deck prezentujące album, czas ze wskaźnikiem postępu sekwencyjnego oraz jeden duży przycisk Play/Pause. Chroni to system przed celowym zmienianiem piosenek przez nieuprawniony personel zmianowy i dba o bezawaryjną ciągłość ramówki.

---

### 8.4. Integracja z Asystentami Głosowymi (Wtyczki TTS i Nawigacja Słowna)
Dla wygody osób niedowidzących, moduł Audio CTA oraz system podpowiedzi AI współpracują bezpośrednio z systemowymi asystentami mowy (Web Speech Synthesis API):
* Każda zmiana tabulatora nawigacji lub aktywacja trybu Kiosk wyzwala czytanie na głos stanu odtwarzacza (np. „*Wybrano playlistę Poranna Kawa Premium. Odtwarzam utwór numer 1 z 12.*”).
* Pozwala na dyktowanie wpisów i komentarzy zespołowych bezpośrednio do mikrofonu tabletu przy użyciu technologii Speech-to-Text, podnosząc ergonomię pracy o 40%.

---

## 9. ROZBUDOWANE FAQ I DIAGNOSTYKA PROBLEMÓW TECHNICZNO-PRAKTYCZNYCH

#### Q1: Dlaczego odtwarzacz nie gra muzyki, tylko bez końca kręci się loader wczytywania?
* **Rozwiązanie operacyjne:** Sprawdź czas i strefę czasową na serwerze VPS (`sudo timedatectl`). Generowanie biletów sesji audio opiera się na kryptograficznym dopasowaniu hasza HMAC skorelowanym z czasem TTL. Jeśli czas serwera VPS różni się od realnego czasu stacji odtwarzania w lokalu o więcej niż 120 minut (np. z powodu nieprawidłowej konfiguracji strefy czasowej), serwer natychmiast uzna bilety za przedawnione i odrzuci strumień z błędem **403 Forbidden**. Uruchom komendę synchronizacji: `sudo timedatectl set-ntp on`.

#### Q2: Jak dodać fizycznie nowe utwory na dysk tak, aby były poprawnie odtwarzane przez Nginx?
* **Rozwiązanie operacyjne:** Dodaj metadane utworu w zakładce **Tracks** panelu administratora. Upewnij się, że nazwa pliku wgrana fizycznie na dysk VPS w katalogu `/var/www/hrl-backend/media_files/` odpowiada dokładnie wielkością liter polu `filename` z bazy danych, gdyż systemy Linux Ubuntu opierają się na bezkompromisowej zasadzie rozróżniania wielkości liter (Case-sensitivity).

#### Q3: Połączenie WebSocket (WS) w lokalu regularnie rozłącza się zawsze dokładnie po 60 sekundach.
* **Rozwiązanie operacyjne:** Wiele sieci hotelowych lub firewalli korporacyjnych automatycznie rozłącza otwarte kanały TCP przy braku aktywności sieciowej. Wbudowana w HRL B2B dynamiczna pętla Ping-Pong ma za zadanie podtrzymać stan gniazda przez emitowanie pakietów kontrolnych co 30 sekund. Jeśli to nie wystarcza, upewnij się, że konfiguracja Nginxa na serwerze posiada zwiększone limity: `proxy_read_timeout 3600s;` oraz `proxy_send_timeout 3600s;`.

#### Q4: Czy pracownik w kawiarni ma możliwość modyfikacji utworów w playlistach?
* **Rozwiązanie operacyjne:** To zależy od przypisanej roli. Standardowe konto subskrybenta o uprawnieniach `role: 'subscriber'` ma dostęp do widoku odtwarzacza i podstawowych konfiguracji. Zaawansowane modyfikacje ramówek, dodawanie piosenek do globalnej bazy oraz modyfikacja cen i konfiguracji technicznych są zablokowane i wymagają uwierzytelnienia z flagą `role: 'admin'`.

#### Q5: Jak udostępnić klientowi odtwarzacz ze spersonalizowanym logo jego salonu?
* **Rozwiązanie operacyjne:** Utwórz nową stronę dostępową w zakładce **Pages** panelu administratora. Podaj unikalny przyjazny URL (Slug, np. `/fryzjer-exclusive`), dodaj adres URL do grafiki logotypu partnera, spersonalizuj kolory tła i przycisków, a następnie przekaż partnerowi gotowy link do odtwarzania.

#### Q6: Inspektor ZAiKS twierdzi, że odtwarzanie muzyki z internetu w tle lokalu zawsze podlega opłatom. Jak się bronić?
* **Rozwiązanie operacyjne:** Pokaż inspektorowi umieszczony w widocznym miejscu imienny Certyfikat Wolności OZZ wygenerowany z systemu HRL B2B. Zezwól na zeskanowanie kodu QR na rzekomym dokumencie. Certyfikat udowadnia, że odtwarzane ścieżki pochodzą z katalogu bezpośrednio licencjonowanego, którego prawa pokrewne i autorskie należą do Hardban Records Lab, a twórcy zrzekli się reprezentacji przez OZZ, co wyklucza uprawnienia dochodzeniowe urzędu.

#### Q7: Czy system działa bez dostępu do Internetu (tryb offline)?
* **Rozwiązanie operacyjne:** Odtwarzacz HRL B2B opiera się na stabilnym buforowaniu strumienia (Progressive Audio Buffering). W przypadku chwilowego zerwania łącza internetowego w lokalu trwającego do kilkunastu minut, odtwarzacz będzie nieprzerwanie grał zapisaną w pamięci bufora piosenkę. W przypadku długotrwałej awarii sieci, odtwarzacz zaprezentuje komunikat o braku połączenia technicznego.

#### Q8: Co się dzieje, gdy do playlisty przypisane jest wezwanie do działania (Audio CTA)?
* **Rozwiązanie operacyjne:** System co określony interwał (np. 15, 30 lub 45 minut) wykona cykl **Audio Ducking**: płynnie wyciszy grający w tle podkład muzyczny, odtworzy wybrany komunikat lektorski na temat promocji czy prośby o opinię, po czym płynnie przywróci pierwotną siłę głosu muzyki tła.

#### Q9: Podczas drukowania faktury grafiki panelu rozjeżdżają się na ekranie. Co jest przyczyną?
* **Rozwiązanie operacyjne:** Upewnij się, że do druku korzystasz z systemowej funkcji przeglądarki wywoływanej klawiszami `Ctrl+P` lub przyciskiem na makiecie modalnej. System posiada reguły style `print:hidden` i `print:block`, które automatycznie usuwają zbędne elementy wizualne i dopasowują szerokość faktury idealnie pod format arkuszy A4.

#### Q10: Jak zabezpieczyć dostęp do widgetu White-Label, aby osoby postronne nie mogły z niego korzystać?
* **Rozwiązanie operacyjne:** Podczas generowania nowej strony w widoku **Pages**, zaznacz opcję **Require PIN** i zdefiniuj silną, 4-cyfrową kombinację liczbową. System odetnie wszelkie próby odsłuchu bez podania właściwego kodu zabezpieczającego przed załadowaniem odtwarzacza.

#### Q11: Wgrywany plik JSON przywracania bazy RAM zwraca błąd "Invalid integrity relation". Jak go naprawić?
* **Rozwiązanie operacyjne:** Przejdź do konsoli logów. Ten błąd oznacza, że plik JSON posiada relację odpytującą o nieistniejący utwór lub playlistę (np. użytkownik ma w tablicy przypisaną playlistę id `p99`, która nie istnieje w sekcji `playlists`). Otwórz plik .json w edytorze kodu, usuń niespójne ID z tablicy lub dodaj brakujący zasób do bazy w in-memory pliku i spróbuj ponownie wgrać plik do instalatora RESTORE.

#### Q12: Podczas odtwarzania na profesjonalnym nagłośnieniu słychać nieprzyjemne trzaski przy zmianie piosenek.
* **Rozwiązanie operacyjne:** To zjawisko często występuje przy twardym resetowaniu strumienia audio. Upewnij się, że w ustawieniach systemu Acoustics Calibration włączona jest funkcja **Płynnego Przejścia (Fade-In/Fade-Out)**. Gwarantuje ona, że kończący się utwór zostaje lekko przyciszony w ciągu ostatnich 2 sekund, a nowa ścieżka zaczyna się od zerowego wolumenu dźwięku, co niweluje uciążliwe trzaski membran głośnikowych.

#### Q13: Jak połączyć platformę HRL B2B bezpośrednio z moją bazą na WordPress przy użyciu wklejanego kodu wp-config-headless.php?
* **Rozwiązanie operacyjne:** Pobierz kod z zakładki *Headless* w Admin Dashboardzie. Kod ten wykorzystuje domyślne filtry wtyczki Paid Memberships Pro (`pmpro_has_membership_level`). Skopiuj go i wklej na końcu swojego pliku `wp-config.php` (lub do pliku funkcji motywu w WordPressie). Kod ten przy rejestracji użytkownika na portalu WordPress automatycznie pośle asynchroniczny zapytanie typu POST na endpoint `/api/users` systemu HRL, tworząc lustrzany profil abonencki o tożsamym stopniu PMPro w pamięci operacyjnej RAM.

#### Q14: Suwak bass-boost w profilu akustycznym Expert nie reaguje, dźwięk nie ulega ociepleniu.
* **Rozwiązanie operacyjne:** Filtry korektora EQ bazują na interfejsie przeglądarki Web Audio API. Niektóre przestarzałe lub rygorystyczne mobilne wersje przeglądarek (np. starsze wersje Safari na iPadach bez włączonych flag eksperymentalnych) blokują modyfikacje węzłów `BiquadFilterNode` dla strumieni audio z zewnętrznych domen bez właściwego uwierzytelnienia CORS. Upewnij się, że stacja odtwarzania korzysta z komercyjnej zalecanej wersji Google Chrome, a serwer zwraca poprawne nagłówki bezpieczeństwa zezwalające na transmisje.

#### Q15: Co się dzieje, kiedy serwer zbliża się do progu zużycia pamięci RAM określonego w PM2 na 1G?
* **Rozwiązanie operacyjne:** Watchdog PM2 stale monitoruje status sterty. W przypadku przekroczenia poziomu 1 Gigabajtu pamięci RAM (np. po seryjnym pobraniu masowych backupów bez zwolnienia zasobów), proces Node.js zostaje bezpiecznie zrestartowany w tle (w ciągu kilkunastu milisekund). Dzięki wykorzystaniu mechanizmu buforowania przeglądarkowej instancji odtwarzaczy B2B, stacje lokali nie odczują żadnej przerwanej sekundy w odtwarzaniu muzyki tła, a serwer zaczyna pracę z oczyszczonymi, świeżymi tabelami sterty.

---
**Koniec Skonsolidowanej i Rozszerzonej Biblii Systemowej Hardban Records Lab B2B.**
*Dokument stanowi oficjalną i kompletną specyfikację techniczną wdrożenia platformy klasy SaaS.*
