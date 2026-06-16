import { Beaker } from "lucide-react";
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
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          borderRadius: size === "sm" ? "6px" : size === "md" ? "8px" : "12px",
          color: "white",
          boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
          transition: 'transform 0.2s ease-in-out',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05) rotate(-5deg)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
      >
        <Beaker size={iconSizes[size]} strokeWidth={2.5} />
      </div>
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ 
            fontSize: textSizes[size], 
            fontWeight: 800, 
            letterSpacing: '-0.03em',
            background: 'linear-gradient(to right, #1e40af, #ea580c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1
          }}>
            School-Lab
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
