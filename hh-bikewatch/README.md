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
- **🌓 Dark Mode**: Smooth theme switching with custom map styling
- **📊 Live Statistics**: Real-time hazard analytics dashboard
- **🚴 Route Planner**: Find the safest or fastest route
  - Color-coded safety segments (green/yellow/red)
  - Click segments for safety information
  - Toggle between Safest and Fastest routes
  - Adjustable risk tolerance slider
- **✨ Animations**: Ripple effects when adding hazards
- **🔔 Toast Notifications**: Success feedback for all actions

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - The app comes with demo data for presentation

## 💻 How to Use

1. **View Hazards**: Open the map to see all reported hazards in Hamburg
2. **Report New Hazard**:
   - Click "Report Hazard" button
   - Select hazard type from dropdown
   - Click on the map where the hazard is located
3. **Plan Safe Route**:
   - Click the Navigation icon (🧭) in header
   - Click start point on map
   - Click destination on map
   - Toggle between Safest/Fastest route
   - Adjust risk tolerance slider (1-5)
   - Click route segments to see safety info
4. **View Statistics**: Click bar chart icon for real-time analytics
5. **Dark Mode**: Click moon/sun icon to toggle theme
6. **Reset Demo**: Use "Reset Demo" button to restore sample data

## 🛠️ Tech Stack
- **React + Vite**: Fast development and build
- **Leaflet**: Interactive maps
- **Tailwind CSS**: Responsive styling
- **Local Storage**: Client-side data persistence

## 📱 Mobile Support
The app is fully responsive and optimized for mobile devices, allowing cyclists to report hazards while on the go.

## 🎥 Demo Data
The app includes 10 realistic hazards across Hamburg districts:
- **Accident Hotspot** near Hauptbahnhof (3 injuries this month)
- **Daily truck blockages** at Rathausmarkt (7-10am)
- **Weekend taxi queues** in bike lane near Reeperbahn
- **Construction detours** with specific end dates
- **Blind corners** with detailed safety warnings
- All hazards include time-specific details and severity levels

## 🏃 Performance
- Loads in < 2 seconds
- No backend required
- Works offline after first load
- Instant hazard reporting

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