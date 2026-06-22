import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

export function Logo({ size = "md", showText = true, className = "", subtitle }: LogoProps) {
  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 32,
  };

  const iconContainers = {
    sm: "28px",
    md: "36px",
    lg: "48px",
  };

  const textSizes = {
    sm: "16px",
    md: "20px",
    lg: "28px",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ userSelect: "none" }}>
      <div 
        style={{ 
          width: iconContainers[size],
          height: iconContainers[size],
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'transparent',
          borderRadius: "50%",
          overflow: "hidden",
          border: "none",
          transition: 'transform 0.2s ease-in-out',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img 
          src="/logo.jpg" 
          alt="EAC Logo" 
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: "2px" }} 
        />
      </div>
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ 
            fontSize: textSizes[size], 
            fontWeight: 800, 
            letterSpacing: '-0.03em',
            background: 'linear-gradient(to right, #1e40af, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1
          }}>
            Escola EAC
          </div>
          {subtitle && size !== "sm" && (
            <div style={{ 
              fontSize: size === "lg" ? "13px" : "11px", 
              color: "var(--text-faint)", 
              fontWeight: 500, 
              letterSpacing: '0.02em', 
              textTransform: "uppercase",
              marginTop: "2px"
            }}>
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
