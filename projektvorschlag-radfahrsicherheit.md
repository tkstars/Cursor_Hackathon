# Hamburg Radfahrsicherheit - Projektvorschlag

## 🚴 Projektname: "HH-BikeWatch" - Interaktive Gefahrenkarte für Hamburgs Radfahrer

## 📋 Projektbeschreibung
Eine interaktive Web-App, die Radfahrern in Hamburg hilft, Gefahrenstellen zu melden und zu vermeiden. Nutzer können auf einer Karte Gefahrenpunkte sehen, neue Gefahren melden und sichere Alternativrouten finden.

## 🎯 Zielgruppe
- Radfahrer in Hamburg
- Pendler, die täglich mit dem Rad fahren
- Gelegenheitsradfahrer, die sichere Routen suchen

## 💡 Kernfunktionalität
Eine einfache, mobile-optimierte Kartenanwendung mit:
- Anzeige von Gefahrenstellen auf einer Hamburg-Karte
- Quick-Report-Funktion zum Melden neuer Gefahren
- Farbcodierte Gefahrenstufen (rot = hoch, gelb = mittel, grün = niedrig)

## 🔧 Tech-Stack (Schnelle Umsetzung in 60 Min)
- **Frontend**: React + Vite (schneller Setup)
- **Styling**: Tailwind CSS (schnelles, responsives Design)
- **Karte**: Leaflet.js (kostenlos, einfach zu integrieren)
- **Daten**: Local Storage (keine Backend-Komplexität)
- **Icons**: Lucide React (moderne Icon-Bibliothek)

## 📌 Feature-Liste

### Must-Have (MVP - 45 Minuten)
1. **Interaktive Karte von Hamburg**
   - OpenStreetMap Integration mit Leaflet
   - Zoom und Pan-Funktionalität
   - Mobile-responsive

2. **Gefahrenstellen anzeigen**
   - Pins auf der Karte für verschiedene Gefahrentypen
   - Farbcodierung nach Schweregrad
   - Click auf Pin zeigt Details

3. **Neue Gefahren melden**
   - Ein-Klick-Meldung auf Kartenposition
   - Dropdown für Gefahrentyp (Baustelle, parkende Autos, gefährliche Kreuzung)
   - Automatisches Speichern im Local Storage

4. **Basis-UI**
   - Header mit App-Name
   - Legende für Gefahrentypen
   - Mobile-first Design

### Nice-to-Have (Optional - 15 Minuten)
1. **Filter-Funktion**
   - Nach Gefahrentyp filtern
   - Nach Datum filtern (letzte 7/30 Tage)

2. **Meine Position**
   - GPS-basierte Standortanzeige
   - Gefahren im Umkreis von 500m hervorheben

3. **Statistik-Dashboard**
   - Anzahl gemeldeter Gefahren
   - Häufigste Gefahrentypen
   - Gefährlichste Stadtteile

4. **Export/Share**
   - Link zu spezifischer Gefahrenstelle teilen
   - Screenshot der aktuellen Kartenansicht

## ⏱️ Zeitplan (60 Minuten)

### Phase 1: Setup & Grundgerüst (10 Min)
- **0-5 Min**: Projekt-Setup (Vite + React)
- **5-10 Min**: Tailwind CSS + Leaflet installieren & konfigurieren

### Phase 2: Kern-Features (30 Min)
- **10-20 Min**: Karte implementieren & Hamburg zentrieren
- **20-25 Min**: Gefahrenstellen-Datenstruktur & Anzeige auf Karte
- **25-35 Min**: Melde-Funktion implementieren
- **35-40 Min**: Local Storage Integration

### Phase 3: UI & Polish (10 Min)
- **40-45 Min**: Responsive Design & Mobile-Optimierung
- **45-50 Min**: Legende, Header, bessere Farben

### Phase 4: Testing & Finalisierung (10 Min)
- **50-55 Min**: Browser-Testing (Desktop & Mobile)
- **55-58 Min**: Letzte Bugfixes
- **58-60 Min**: Demo-Daten hinzufügen für Video

### Buffer/Demo-Video (Nach Hackathon)
- README aktualisieren
- Demo-Video aufnehmen

## 🚀 Implementierungsdetails

### Datenstruktur (Local Storage)
```javascript
{
  hazards: [
    {
      id: "unique-id",
      lat: 53.5511,
      lng: 9.9937,
      type: "blocked_lane", // oder "dangerous_crossing", "construction"
      severity: "high", // oder "medium", "low"
      description: "Parkende Autos blockieren Radweg",
      timestamp: "2024-01-20T10:30:00"
    }
  ]
}
```

### Gefahrentypen
1. **Blockierte Radwege** (blocked_lane)
   - Farbe: Rot
   - Icon: 🚫

2. **Gefährliche Kreuzungen** (dangerous_crossing)
   - Farbe: Orange
   - Icon: ⚠️

3. **Baustellen** (construction)
   - Farbe: Gelb
   - Icon: 🚧

4. **Unklare Wegführung** (unclear_route)
   - Farbe: Blau
   - Icon: ❓

## 🎨 UI/UX Konzept
- **Hauptfarbe**: Hamburg-Blau (#0066CC)
- **Gefahrenfarben**: Rot (hoch), Orange (mittel), Gelb (niedrig)
- **Mobile-first**: Große Touch-Targets, einfache Navigation
- **Minimalistisch**: Fokus auf Karte, wenig Ablenkung

## 📈 Erfolgsmetriken (für Präsentation)
- Anzahl möglicher Gefahrenmeldungen pro Minute
- Ladezeit der Karte < 2 Sekunden
- Funktioniert auf Mobile & Desktop
- Intuitive Bedienung ohne Anleitung

## 🏁 MVP-Definition
Das Minimum Viable Product muss folgendes können:
1. Karte von Hamburg anzeigen
2. Mindestens 5 Demo-Gefahrenstellen anzeigen
3. Neue Gefahrenstelle durch Klick auf Karte hinzufügen
4. Daten bleiben nach Reload erhalten (Local Storage)

---

**Hinweis**: Dieser Plan ist auf maximale Geschwindigkeit und Einfachheit optimiert. Keine Zeit mit komplexen Features oder Backend verschwenden - Fokus auf funktionierende, visuelle Demo!
