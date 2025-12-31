# Particle Flow Squash

A real-time interactive 3D particle system built with React, Three.js, and MediaPipe. The application uses webcam-based hand tracking to control particle effects through gestures, overlaid on the live camera feed.

## ✨ Features

### Gesture Control

- **Hand Tracking**: Uses MediaPipe HandLandmarker for real-time detection.
- **Open Hand**: Expands and disperses particles.
- **Closed Fist**: Contracts and focuses particles.
- **ILY 🤟**: Shows "I Love You [Name]".
- **Middle Finger 🖕**: Morphs particles into a schematic Hand Pattern.
- **Peace ✌️**: Forms a Heart shape.
- **Interactive Movement**: Moving your hand controls the rotation of the 3D system.

### 3D Particle System

- **High Performance**: Renders 15,000+ particles using custom `ShaderMaterial`.
- **Morphing Patterns**: Seamlessly transitions between Sphere, Cube, Spiral, Chaos (Random), Ring, Wave, Heart, and Text.
- **Dynamic Visuals**: Reacts to gestures with scaling, pulsing, and noise effects.

### Modern UI

- **Pattern Selector**: Switch between 6 geometric formations via a sleek modal.
- **Color Picker**: Real-time color tone adjustment.
- **Camera View**: Toggle between Fullscreen Immersive mode and Picture-in-Picture (PiP).
- **Customization**: Input a custom name for the ILY gesture.

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **3D**: React Three Fiber (R3F) + Three.js + GLSL Shaders
- **Vision**: MediaPipe Tasks Vision
- **State**: Zustand
- **Styling**: Tailwind CSS + Lucide React icons

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A webcam

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/particle-flow-squash.git
   cd particle-flow-squash
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173` (or the URL shown in terminal).

### Build for Production

```bash
npm run build
```

## 🎮 Controls

| Gesture                         | Effect                          |
| :------------------------------ | :------------------------------ |
| **Open Hand**                   | Expand Particles                |
| **Fist**                        | Contract Particles              |
| **Index + Middle (Peace)**      | Heart Shape ❤️                  |
| **Thumb + Index + Pinky (ILY)** | "I Love You" Text               |
| **Middle Finger**               | "Middle Finger" Hand Pattern 🖕 |

## 📂 Architecture

- **`src/components/ParticleSystem.tsx`**: Core 3D logic, custom shaders, and geometry generation.
- **`src/components/HandTracker.tsx`**: Webcam handling and MediaPipe inference loop.
- **`src/components/UI.tsx`**: Overlay interface for controls.
- **`src/store/useStore.ts`**: Global state management (Zustand).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Credits

Made by **Nawfal**

---

_Note: This application requires webcam access to function._
