import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';

interface SplineBackgroundProps {
  scene?: string;
  className?: string;
}

export const SplineBackground: React.FC<SplineBackgroundProps> = ({
  scene = 'https://prod.spline.design/YKu4USavi5Becmnd/scene.splinecode',
  className = '',
}) => {
  return (
    <div 
      className={`fixed inset-0 w-screen h-screen overflow-hidden spline-centered ${className}`} 
      style={{ 
        zIndex: -1,
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Suspense fallback={
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 animate-pulse" />
      }>
        <Spline
          scene={scene}
          style={{
            width: '100vw',
            height: '100vh',
            minWidth: '100vw',
            minHeight: '100vh',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(1.6)',
            transformOrigin: 'center center',
            objectFit: 'cover',
            zIndex: -1,
          }}
          onLoad={() => {
            console.log('🎨 Spline scene loaded successfully - Full screen');
          }}
          onError={(error) => {
            console.error('❌ Spline scene failed to load:', error);
          }}
        />
      </Suspense>
    </div>
  );
};

export default SplineBackground; 