import React, { useState, useEffect } from 'react';
import { useStore, gestureState } from '../store/useStore';
import type { PatternType } from '../store/useStore';
import { Maximize, Minimize, Palette, Box, Circle, Activity, Shuffle, Heart, Type, Eye, EyeOff, ExternalLink, Skull, PictureInPicture2 } from 'lucide-react';
import clsx from 'clsx';

const UI: React.FC = () => {
  const { pattern, setPattern, color, setColor, customName, setCustomName, isCameraMinimized, toggleCameraMinimized } = useStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string>('none');
  const [isVisible, setIsVisible] = useState(true);
  const [showPatternModal, setShowPatternModal] = useState(false);

  // Poll gesture state for UI feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setDetectedGesture(gestureState.type);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const patterns: { id: PatternType; icon: React.ReactNode; label: string }[] = [
    { id: 'sphere', icon: <Circle size={18} />, label: 'Sphere' },
    { id: 'cube', icon: <Box size={18} />, label: 'Cube' },
    { id: 'spiral', icon: <Activity size={18} />, label: 'Spiral' },
    { id: 'ring', icon: <Circle size={18} className="border-2 border-current rounded-full p-0.5" />, label: 'Ring' },
    { id: 'wave', icon: <Activity size={18} className="transform rotate-90" />, label: 'Wave' },
    { id: 'random', icon: <Shuffle size={18} />, label: 'Chaos' },
  ];

  const colors = [
    '#00ffff', '#ff00ff', '#ffff00', '#ff3333', '#33ff33', '#ffffff',
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-50">
      {/* Header & Toggles */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className={clsx("transition-opacity duration-500", isVisible ? "opacity-100" : "opacity-0")}>
          <h1 className="text-2xl font-bold text-white tracking-tighter">
            PARTICLE FLOW <span className="text-cyan-400">SQUASH</span>
          </h1>
          <p className="text-white/60 text-xs mt-1">Gesture Controlled System</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors text-white"
            title={isVisible ? "Hide UI" : "Show UI"}
          >
            {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
          <button
            onClick={toggleCameraMinimized}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors text-white"
            title={isCameraMinimized ? "Maximize Camera" : "Minimize Camera"}
          >
            {isCameraMinimized ? <Maximize size={20} /> : <PictureInPicture2 size={20} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors text-white"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      {/* Gesture Feedback - Always Visible */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500 opacity-100">
        {detectedGesture !== 'none' && (
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 animate-fade-in">
            {detectedGesture === 'heart' && <Heart className="text-red-500 fill-red-500" size={16} />}
             {detectedGesture === 'victory' && <Type className="text-yellow-400" size={16} />}
            {detectedGesture === 'middle_finger' && <Skull className="text-gray-400" size={16} />}
            <span className="text-white text-sm font-medium uppercase tracking-wider">
              {detectedGesture === 'heart' ? 'Heart (Peace)' : 
               detectedGesture === 'victory' ? 'ILY Sign Detected' : 
               detectedGesture === 'middle_finger' ? 'Message' :
               detectedGesture}
            </span>
          </div>
        )}
      </div>

      {/* Pattern Modal */}
      {showPatternModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowPatternModal(false)}>
            <div className="bg-black/80 p-6 rounded-2xl border border-white/10 max-w-sm w-full mx-4 shadow-2xl transform scale-100 animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-lg">Select Pattern</h3>
                    <button onClick={() => setShowPatternModal(false)} className="text-white/60 hover:text-white"><EyeOff size={18}/></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {patterns.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => { setPattern(p.id); setShowPatternModal(false); }}
                        className={clsx(
                        "flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all border",
                        pattern === p.id
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border-transparent"
                        )}
                    >
                        {p.icon}
                        <span>{p.label}</span>
                    </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Controls */}
      <div className={clsx(
        "flex flex-col gap-4 pointer-events-auto max-w-xs transition-all duration-500 transform",
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0 pointer-events-none"
      )}>
        
        {/* Custom Name Input */}
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
          <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Special Name</h3>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Enter name..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <p className="text-white/40 text-[10px] mt-2">
            Show "Victory" (Peace) gesture to display this name.
          </p>
        </div>

        {/* Pattern Selector Button */}
        <button 
            onClick={() => setShowPatternModal(true)}
            className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/5 transition-all text-left"
        >
          <div>
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Current Pattern</h3>
            <div className="text-cyan-400 font-medium flex items-center gap-2">
                {patterns.find(p => p.id === pattern)?.label || pattern}
            </div>
          </div>
          <ExternalLink size={16} className="text-white/40" />
        </button>

        {/* Color Picker */}
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={14} className="text-white/80" />
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider">Color Tone</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={clsx(
                  "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                  color === c ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}40` }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-0 p-0"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-cyan-900/20 backdrop-blur-md p-4 rounded-xl border border-cyan-500/20">
          <p className="text-cyan-200 text-xs leading-relaxed">
            <span className="font-bold">Gestures:</span>
            <br/>• <span className="font-bold">🤟 (ILY):</span> Show Name
            <br/>• <span className="font-bold">🖕:</span> Show "Message"
            <br/>• <span className="font-bold">✌️ (Peace):</span> Show Heart
            <br/>• <span className="font-bold">Open/Close:</span> Expand/Contract
          </p>
        </div>

      </div>

      {/* Badge (Now hideable) */}
      <div className={clsx(
        "absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <a 
          href="https://www.nawfal.site" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-all group"
        >
          <span className="text-white/60 text-xs group-hover:text-white transition-colors">Made by</span>
          <span className="text-cyan-400 text-xs font-bold group-hover:text-cyan-300 transition-colors">Nawfal</span>
          <ExternalLink size={10} className="text-white/40 group-hover:text-white/80" />
        </a>
      </div>
    </div>
  );
};

export default UI;
