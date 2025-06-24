import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Roadmap = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true); // Default sound is ON

  // Accurate static versions based on actual Git history and achievements
  const staticVersions = [
    {
      version: 'V1',
      title: 'Project Foundation & Strategy Documentation',
      date: '2025-06-12',
      details: `🚀 **Project Foundation: Initial ZmartBot Strategy & Documentation Setup**
• Initial commit with complete ZmartBot trading strategy documentation
• Comprehensive PDF documentation: Cryptometer API reference, RiskMetric methodology, KuCoin integration guide
• Position management formulas and historical trades data structure
• Basic dashboard UI components and project structure
• All core strategy documents and reference materials established` 
    },
    {
      version: 'V2',
      title: 'Complete Authentication & Admin Management System',
      date: '2025-06-22',
      details: `🔐 **Major Authentication & Admin Management: Fully Tested & Stable**
• Complete user authentication system with secure login/logout flows
• Admin user management with role-based access control (admin/superadmin)
• Password reset functionality with email notifications (tested and working)
• Comprehensive admin settings panel with user management capabilities
• Session management with CSRF protection and secure cookie handling
• Extensive testing suite: 15+ test files covering all authentication flows
• Frontend/backend improvements with polished UI and responsive design
• All flows tested and stable - previous version preserved in Git history` 
    },
    {
      version: 'V3',
      title: 'API Management & Version Control System',
      date: '2025-06-23',
      details: `📊 **Complete API Management & Version Control: Production Ready**
• KuCoin API integration with live price feeds and real-time data
• API key management system with secure storage and validation
• Complete admin management system with user roles and permissions
• Version control automation with Git tag integration
• Roadmap UI with dynamic version cards and expandable details
• Comprehensive documentation system with automated updates
• Startup guides and version automation scripts for deployment
• Database management and API testing suite (20+ test files)
• All systems tested and production-ready` 
    },
    {
      version: 'V4',
      title: 'Roadmap Automation & UI Polish',
      date: '2025-06-24',
      details: `🎯 **Roadmap Automation & Professional UI Polish: Complete**
• Automated roadmap system with Git integration for version tracking
• Professional dark theme UI with green accent (#00FF94) design system
• Enhanced Roadmap component with expandable version cards and detailed explanations
• Super Admin version restore functionality in Settings tab
• Backend API enhancements with detailed version information
• Responsive sidebar navigation with active state indicators
• Complete version management system with restore capabilities
• All UI components polished and professional-grade
• Full integration of version control with user interface` 
    },
  ];

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        console.log('Fetching roadmap versions...');
        const response = await axios.get('http://localhost:5001/api/roadmap-versions', {
          withCredentials: true
        });
        console.log('Roadmap API response:', response.data);
        
        // Debug output for troubleshooting
        window._roadmapVersions = response.data.versions;
        
        if (response.data.success && response.data.versions) {
          // Use API data with fallback to static data for details
          const enhancedVersions = response.data.versions.map((v, i) => ({
            ...v,
            details: v.details || staticVersions[i]?.details || 'No details available.'
          }));
          setVersions(enhancedVersions);
        } else {
          console.log('Using static versions as fallback');
          setVersions(staticVersions);
        }
      } catch (err) {
        console.error('Error fetching roadmap versions:', err);
        setError('Failed to load roadmap data');
        // Fallback to static data
        setVersions(staticVersions);
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, []);

  // Helper to enforce max 8-word title
  function shortTitle(title) {
    return title.split(' ').slice(0, 8).join(' ') + (title.split(' ').length > 8 ? '…' : '');
  }

  // Helper to parse details into lines, remove markdown, and clean up
  function parseDetails(details) {
    if (!details) return [];
    let lines = details
      .replace(/\*\*/g, '')
      .replace(/^\s*[-•]+\s*/gm, '')
      .split(/\n|\r|•/)
      .map(l => l.trim())
      .filter(l => l && l.length > 0);
    if (lines[0] && lines[0].match(/^[\w\s\d:]+[:：]?$/)) lines = lines.slice(1);
    return lines;
  }

  // Steam Blast sound effect for wagon clicks
  const playSteamBlastSound = () => {
    try {
      // Create audio element with the Steam Blast sound file
      const audio = new Audio('/Tone Glow Libraries - Steam Train - Steam Blast.wav');
      
      // Set volume and play
      audio.volume = 0.6; // Adjust volume to 60% for steam blast
      audio.play().then(() => {
        console.log('💨 Steam blast sound played!');
      }).catch(err => {
        console.log('Steam blast audio play failed:', err);
        // Fallback to simple beep if file fails
        playSteamBlastFallback();
      });
    } catch (err) {
      console.log('Steam blast audio creation failed:', err);
      // Fallback to simple beep
      playSteamBlastFallback();
    }
  };

  // Fallback sound for steam blast
  const playSteamBlastFallback = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Steam blast-like sound (lower frequency, shorter duration)
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.6);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
      
      console.log('💨 Fallback steam blast sound played!');
    } catch (fallbackErr) {
      console.log('Steam blast fallback audio also failed:', fallbackErr);
    }
  };

  // Handler for expanding/collapsing details
  function handleExpand(idx) {
    // Play steam blast sound when wagon is clicked (if sound is enabled)
    if (soundEnabled) {
      playSteamBlastSound();
    }
    setExpanded(expanded === idx ? null : idx);
  }

  // Locomotive sound effect using the actual train whistle audio file
  const playLocomotiveSound = () => {
    try {
      // Create audio element with the actual train whistle file
      const audio = new Audio('/InspectorJ - On The Way - Steam Train Whistle Blowing.wav');
      
      // Set volume and play
      audio.volume = 0.7; // Adjust volume to 70%
      audio.play().then(() => {
        console.log('🚂 Real train whistle sound played!');
      }).catch(err => {
        console.log('Audio play failed:', err);
        // Fallback to Web Audio API if file fails
        playFallbackSound();
      });
    } catch (err) {
      console.log('Audio creation failed:', err);
      // Fallback to Web Audio API
      playFallbackSound();
    }
  };

  // Fallback sound using Web Audio API
  const playFallbackSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.6);
      oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.9);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 1.2);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 1.5);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.0);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2.0);
      
      console.log('🚂 Fallback train whistle sound played!');
    } catch (fallbackErr) {
      console.log('Fallback audio also failed:', fallbackErr);
    }
  };

  // Handler for locomotive click
  const handleLocomotiveClick = () => {
    if (soundEnabled) {
      playLocomotiveSound();
    }
    // Collapse all expanded details
    setExpanded(null);
  };

  // Handler for sound toggle
  const handleSoundToggle = (e) => {
    e.stopPropagation(); // Prevent triggering locomotive click
    setSoundEnabled(!soundEnabled);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Project Roadmap</h1>
              <p className="text-gray-300">Track our progress and future milestones</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-lg">🚀</span>
            </div>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-300">Loading roadmap...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Project Roadmap</h1>
              <p className="text-gray-300">Track our progress and future milestones</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-lg">🚀</span>
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
            <p className="text-gray-400 text-sm mt-2">Using fallback data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Project Roadmap</h1>
            <p className="text-gray-300">Track our progress and future milestones</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-lg">🚀</span>
          </div>
        </div>
      </div>

      {/* Train with Locomotive */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
        <div className="flex items-center space-x-0 relative mb-8">
          {/* Train line with gradient */}
          <div className="absolute left-0 right-0 top-1/2 h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 z-0 rounded-full shadow-lg" style={{transform: 'translateY(-50%)'}} />
          
          {/* Locomotive with enhanced styling and click handler */}
          <div className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={handleLocomotiveClick}>
            <div className="w-40 h-32 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-2xl flex items-center justify-center text-white font-bold text-6xl border-4 border-red-800 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-red-500/50 relative">
              🚂
              {/* Sound toggle icon */}
              <button 
                onClick={handleSoundToggle}
                className="absolute top-2 right-2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                title={soundEnabled ? "Sound ON - Click to turn OFF" : "Sound OFF - Click to turn ON"}
              >
                {soundEnabled ? (
                  <span className="text-white text-sm">🔊</span>
                ) : (
                  <span className="text-white text-sm">🔇</span>
                )}
              </button>
            </div>
            <div className="flex space-x-2 mt-2">
              <div className="w-4 h-4 bg-gray-700 rounded-full shadow-inner" />
              <div className="w-4 h-4 bg-gray-700 rounded-full shadow-inner" />
              <div className="w-4 h-4 bg-gray-700 rounded-full shadow-inner" />
            </div>
            <div className="absolute right-[-12px] top-1/2 w-6 h-2 bg-gradient-to-r from-gray-500 to-gray-400 z-20 rounded-r-full" style={{transform: 'translateY(-50%)'}} />
          </div>

          {/* Wagons with enhanced hover effects */}
          {versions.map((v, idx) => (
            <div key={v.version} className="relative z-10 flex flex-col items-center cursor-pointer group" onClick={() => handleExpand(idx)}>
              <div className={`w-24 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-2xl flex items-center justify-center text-white font-bold text-xl border-4 border-blue-700 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-500/50 ${expanded === idx ? 'ring-4 ring-blue-300 ring-opacity-50 scale-110' : ''}`}>
                {v.version}
              </div>
              <div className="flex space-x-2 mt-2">
                <div className="w-4 h-4 bg-gray-700 rounded-full shadow-inner" />
                <div className="w-4 h-4 bg-gray-700 rounded-full shadow-inner" />
              </div>
              {idx < versions.length - 1 && (
                <div className="absolute right-[-12px] top-1/2 w-6 h-2 bg-gradient-to-r from-gray-500 to-gray-400 z-20 rounded-r-full" style={{transform: 'translateY(-50%)'}} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Version Cards with enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {versions.map((v, idx) => (
          <div 
            key={v.version} 
            className={`bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 ${expanded === idx ? 'ring-4 ring-blue-300 ring-opacity-50 scale-105' : ''}`} 
            onClick={() => handleExpand(idx)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {v.version}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-base leading-tight">{shortTitle(v.title)}</h4>
                <p className="text-gray-400 text-xs mt-1">{v.date}</p>
              </div>
            </div>
            
            {expanded === idx ? (
              <div className="mt-4 space-y-2 animate-fadeIn">
                {parseDetails(v.details).map((line, i) => (
                  <div key={i} className="text-gray-300 text-sm leading-relaxed flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span className="flex-1">{line}</span>
                  </div>
                ))}
              </div>
            ) : (
              <button className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold shadow-lg transform transition-all duration-200 hover:scale-105">
                View Details
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add some custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Roadmap; 