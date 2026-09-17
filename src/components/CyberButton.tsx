import React from 'react';
import { soundEffects } from '../utils/sound';

interface CyberButtonProps {
  id?: string;
  keyNumber?: string;
  title: string;
  description?: string;
  badge?: string;
  onClick: () => void;
  variant?: 'cyan' | 'pink' | 'amber' | 'emerald' | 'danger';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  id,
  keyNumber,
  title,
  description,
  badge,
  onClick,
  variant = 'cyan',
  disabled = false,
  className = '',
  icon,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'pink':
        return {
          border: 'border-pink-500/50 hover:border-pink-400',
          bg: 'bg-gradient-to-r from-pink-950/40 via-[#130d1e] to-pink-950/20 hover:from-pink-900/60 hover:to-pink-950/40',
          glow: 'hover:shadow-neon-pink',
          text: 'text-pink-300 group-hover:text-pink-100',
          keyBadge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
          accent: 'bg-pink-500',
        };
      case 'amber':
        return {
          border: 'border-amber-500/50 hover:border-amber-400',
          bg: 'bg-gradient-to-r from-amber-950/40 via-[#18130a] to-amber-950/20 hover:from-amber-900/60 hover:to-amber-950/40',
          glow: 'hover:shadow-neon-amber',
          text: 'text-amber-300 group-hover:text-amber-100',
          keyBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accent: 'bg-amber-500',
        };
      case 'emerald':
        return {
          border: 'border-emerald-500/50 hover:border-emerald-400',
          bg: 'bg-gradient-to-r from-emerald-950/40 via-[#0a1813] to-emerald-950/20 hover:from-emerald-900/60 hover:to-emerald-950/40',
          glow: 'hover:shadow-neon-emerald',
          text: 'text-emerald-300 group-hover:text-emerald-100',
          keyBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          accent: 'bg-emerald-500',
        };
      case 'danger':
        return {
          border: 'border-red-500/50 hover:border-red-400',
          bg: 'bg-gradient-to-r from-red-950/40 via-[#1a0c0c] to-red-950/20 hover:from-red-900/60 hover:to-red-950/40',
          glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.45)]',
          text: 'text-red-300 group-hover:text-red-100',
          keyBadge: 'bg-red-500/20 text-red-300 border-red-500/40',
          accent: 'bg-red-500',
        };
      case 'cyan':
      default:
        return {
          border: 'border-cyan-500/50 hover:border-cyan-300',
          bg: 'bg-gradient-to-r from-cyan-950/40 via-[#0b1420] to-cyan-950/20 hover:from-cyan-900/60 hover:to-cyan-950/40',
          glow: 'hover:shadow-neon-cyan',
          text: 'text-cyan-300 group-hover:text-cyan-100',
          keyBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          accent: 'bg-cyan-400',
        };
    }
  };

  const v = getVariantStyles();

  const handleMouseEnter = () => {
    if (!disabled) {
      soundEffects.buttonHover();
    }
  };

  const handleClick = () => {
    if (!disabled) {
      soundEffects.buttonClick();
      onClick();
    }
  };

  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={`group relative w-full text-left p-3.5 sm:p-4 rounded-lg border transition-all duration-200 outline-none
        ${v.border} ${v.bg} ${v.glow}
        ${disabled ? 'opacity-40 cursor-not-allowed border-slate-700 bg-slate-900/30' : 'cursor-pointer active:scale-[0.99]'}
        ${className}`}
    >
      {/* Laser glow highlight bar on left border */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-r transition-all duration-200 ${v.accent} opacity-40 group-hover:opacity-100 group-hover:h-4/5`}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {keyNumber && (
            <span
              className={`shrink-0 px-2 py-0.5 text-xs font-mono font-bold rounded border ${v.keyBadge} transition-transform duration-200 group-hover:scale-105`}
            >
              [{keyNumber}]
            </span>
          )}

          {icon && <div className="shrink-0 mt-0.5 text-slate-300 group-hover:text-white transition-colors">{icon}</div>}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-tech text-base sm:text-lg font-semibold tracking-wide ${v.text} transition-colors`}>
                {title}
              </span>
              {badge && (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {badge}
                </span>
              )}
            </div>

            {description && (
              <p className="text-xs sm:text-sm text-slate-400 font-mono-term mt-0.5 leading-snug group-hover:text-slate-300 transition-colors">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right cyber corner arrow */}
        <div className="shrink-0 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200 text-sm font-mono">
          &gt;&gt;
        </div>
      </div>
    </button>
  );
};
