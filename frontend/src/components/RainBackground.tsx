import React from "react";

export function RainBackground() {
  // Generate 80 raindrops (increased for prominence) with random positions and delays
  const drops = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${0.3 + Math.random() * 0.3}s`, // Faster fall for more intensity
    opacity: 0.2 + Math.random() * 0.4, // More visible
    width: Math.random() > 0.8 ? "2px" : "1px", // Varying thickness
  }));

  return (
    <div className="storm-container">
      {/* Dynamic Cloud Layer */}
      <div className="clouds"></div>
      
      {/* Lightning Flash Effect */}
      <div className="lightning"></div>
      
      {/* Rain Drops */}
      <div className="rain-layer">
        {drops.map((drop) => (
          <div
            key={drop.id}
            className="drop prominent"
            style={{
              left: drop.left,
              width: drop.width,
              animationDelay: drop.animationDelay,
              animationDuration: drop.animationDuration,
              opacity: drop.opacity,
            }}
          />
        ))}
      </div>
      
      {/* Vignette for mood */}
      <div className="storm-vignette"></div>
    </div>
  );
}
