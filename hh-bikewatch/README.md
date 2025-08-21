# HH-BikeWatch 🚴 - Hamburg Cycling Safety Map

A visual tool for Hamburg cyclists to report and avoid dangerous areas, making cycling safer for everyone.

🏆 **Hackathon Ready**: Complete 1-hour MVP with polished UI and demo data!

## 🎯 Problem Statement
More than half of Hamburg cyclists feel unsafe or stressed due to blocked lanes, dangerous intersections, and unclear routes. HH-BikeWatch provides a community-driven solution to identify and share hazard information.

## ✨ Features

### Core Features (MVP)
- **Welcome Screen**: Professional onboarding with feature overview
- **Interactive Map**: Real-time map of Hamburg with hazard markers
- **Report Hazards**: One-click reporting with animated feedback
- **Hazard Types**: 
  - 🚫 Blocked Lanes (red) - e.g., delivery trucks, parked cars
  - ⚠️ Dangerous Crossings (orange) - accident hotspots, blind corners
  - 🚧 Construction Sites (yellow) - temporary detours, blocked paths
  - ❓ Unclear Routes (blue) - missing signage, confusing lanes
- **Persistent Storage**: All reports saved locally
- **Mobile Responsive**: Optimized touch interface for cyclists on-the-go

### 🎯 Advanced Features (Wow Factor!)
- **🌓 Dark Mode**: 
  - Smooth theme switching with persistence
  - Custom map tile filtering for night visibility
  - Consistent dark UI across all components
- **📊 Live Statistics Dashboard**: 
  - Real-time hazard count and breakdown
  - Today's reports tracker
  - Most common hazard type analysis
  - Sliding panel animation
- **🚴 Smart Route Planner**: 
  - **Safest Route**: Actively avoids high-risk areas with detours
  - **Fastest Route**: Direct path regardless of hazards
  - Color-coded segments (green/yellow/red)
  - Interactive tooltips on route segments
  - Risk tolerance slider (1-5 scale)
  - Demo route button for quick testing
  - Clear & Cancel options
- **✨ Professional UI Polish**:
  - Ripple animations on new hazards
  - Smooth hover effects with lift animations
  - Shadow effects on buttons and panels
  - Backdrop blur on overlays
  - Gradient backgrounds and transitions
- **🔔 Smart Notifications**: 
  - Success toasts for all actions
  - Route calculation feedback
  - Hazard avoidance alerts

## 🚀 Quick Start

1. **Navigate to Project Directory**
   ```bash
   cd hh-bikewatch
   ```

2. **Install Dependencies** (if not already installed)
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - Welcome screen will appear on first load
   - Click "Start Exploring →" to begin
   - 10 realistic demo hazards are pre-loaded

## 💻 How to Use

### First Time
1. **Welcome Screen** appears with feature overview
2. Click **"Start Exploring →"** to begin
3. 10 demo hazards are already loaded on the map

### Viewing Hazards
- Click any hazard marker to see details
- Red = High risk, Orange = Medium, Blue = Low
- Popup shows specific danger and time info

### Reporting New Hazards
1. Click **"⚠ Report Hazard"** button (turns red)
2. Select hazard type from dropdown
3. Click on map where danger exists
4. See ripple animation confirming report
5. Success toast appears

### Planning Safe Routes
1. Click **Navigation icon** (🧭) in header
2. Route panel slides in from left
3. Either:
   - Click **"Demo Route"** for instant example
   - Or click start → then destination on map
4. Toggle **Safest/Fastest** to see route change
5. Adjust **Risk Level** slider (1-5)
6. Click colored segments for safety details
7. Use **Clear** to reset or **Cancel** to exit

### Additional Features
- **📊 Statistics**: Click bar chart for live data
- **🌓 Dark Mode**: Click moon/sun for night theme
- **📱 Mobile**: Fully touch-optimized
- **Reset Demo**: Restore original hazards if needed

## 🛠️ Tech Stack
- **React + Vite**: Fast development and build
- **Leaflet**: Interactive maps
- **Tailwind CSS**: Responsive styling
- **Local Storage**: Client-side data persistence

## 📱 Mobile Support
The app is fully responsive and optimized for mobile devices, allowing cyclists to report hazards while on the go.

## 🎥 Demo Data & Resources

### Pre-loaded Hazards
The app includes 10 realistic hazards strategically placed across Hamburg:

**High Severity (Red)**
- 📍 **Hauptbahnhof**: Accident hotspot - 3 cyclist injuries this month
- 📍 **Rathausmarkt**: Daily delivery truck blockages (7-10am)
- 📍 **St. Pauli**: Weekend taxi queues in bike lane near Reeperbahn
- 📍 **HafenCity**: Construction vehicles blocking entire bike path
- 📍 **Neustadt**: No traffic light for bikes - 4 lanes to cross

**Medium Severity (Orange/Yellow)**
- 📍 **Schanzenviertel**: Construction until Dec 2024, narrow detour
- 📍 **Eppendorf**: Blind corner at parking garage exit
- 📍 **Barmbek**: U-Bahn construction, gravel path detour

**Low Severity (Blue)**
- 📍 **Rotherbaum**: Confusing 3-way split with no signage
- 📍 **Hoheluft**: Worn-off bike lane markings

### Demo Resources
- **Demo Script**: See `DEMO-SCRIPT.md` for 1-minute video guide
- **Run Instructions**: See parent directory `RUN-INSTRUCTIONS.md`
- **Reset Option**: "Reset Demo" button restores original hazards

## 🏃 Performance & UX
- **Lightning Fast**: Loads in < 2 seconds
- **No Backend**: Everything runs locally
- **Offline Ready**: Works after first load
- **Instant Actions**: Real-time hazard reporting
- **Smooth Animations**: 60fps transitions
- **Responsive**: Adapts to any screen size

## 👥 Target Users
- Daily bike commuters in Hamburg
- Casual cyclists looking for safe routes
- City planners gathering cycling safety data

## 🔮 Future Enhancements (Nice-to-Have)
- Filter hazards by type or date
- GPS location for nearby hazards
- Route planning avoiding hazards
- Community voting on hazard severity
- Integration with city infrastructure planning

## 📄 License
Created for Hamburg Hackathon - Make Hamburg Great Again (Cycling Safety)