# ⌨️ SwiftKeys

A modern, professional typing trainer designed for developers. Master code patterns, improve speed, and track your progress with advanced metrics.

![SwiftKeys](https://img.shields.io/badge/SwiftKeys-v1.0.0-gold)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 🎯 **Mission-Based Learning**
- **Beginner**: Master QWERTY basics, numbers, and punctuation
- **Intermediate**: Real code snippets and patterns
- **Pro**: Complex algorithms, Regex, and Terminal commands
- **Randomized Exercises**: Never get bored with dynamic exercise selection

### 📊 **Pro-Level Analytics**
- **Real-time Metrics**: WPM, Raw WPM, Accuracy, and Consistency
- **Problem Keys**: Visual analysis of your most frequent errors
- **Visual Graphs**: Interactive Chart.js integration for progress tracking
- **Detailed History**: Session-by-session breakdown

### 🎨 **Modern UX/UI**
- **Developer-Centric Theme**: Dark mode optimized for long sessions
- **Instant Feedback**: Character-level validation
- **Smart Interface**: Minimalist design with focus mode
- **Responsive**: Works seamlessly on all devices

## 🚀 Getting Started

### Quick Start
No installation required. Just open `index.html` in your modern browser.

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/imsabbar/swiftkeys.git
   cd swiftkeys
   ```

2. **Serve the application**
   ```bash
   # Using Python
   python -m http.server 3000
   
   # Using Node.js
   npx serve .
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
swiftkeys/
├── index.html              # Entry point
├── LICENSE                 # MIT License
├── README.md               # Documentation
└── assets/
    ├── css/
    │   └── style.css       # Core styling
    ├── js/
    │   ├── app.js          # Main application logic
    │   ├── missions.js     # Mission data & manager
    │   ├── storage.js      # Persistence layer
    │   ├── charts.js       # Analytics visualization
    │   ├── sound.js        # Audio feedback
    │   ├── keyboard.js     # Virtual keyboard
    │   └── user.js         # User profile management
    └── data/
        └── missions.json   # Mission content
```

## 🎮 Keyboard Shortcuts

- `Tab` + `Enter`: Restart Test
- `Esc`: Command Palette (Coming Soon)
- `Ctrl` + `Shift` + `P`: Pause

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 imsabbar
