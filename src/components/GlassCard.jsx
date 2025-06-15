import React from 'react';

export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`glass-card ${className}`} style={{
      background: 'rgba(17, 19, 21, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
    }}>
      {children}
    </div>
  );
} 