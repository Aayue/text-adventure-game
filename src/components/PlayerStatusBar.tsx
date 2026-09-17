import React from 'react';
import { Player } from '../types';
import { Heart, Coins, Flame, Backpack, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlayerStatusBarProps {
  player: Player;
  onOpenInventory: () => void;
  hpDelta?: number | null; // recent damage or heal for float animation
}

export const PlayerStatusBar: React.FC<PlayerStatusBarProps> = ({
  player,
  onOpenInventory,
  hpDelta,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.max_hp) * 100));
  const isLowHp = player.hp <= 30 && player.hp > 0;
  const potionCount = player.inventory['生命药水'] || 0;

  // HP Bar color gradient based on health
  const getHpGradient = () => {
    if (hpPercent > 60) return 'from-emerald-500 via-cyan-400 to-cyan-500 shadow-neon-emerald';
    if (hpPercent > 25) return 'from-amber-500 via-orange-400 to-yellow-500 shadow-neon-amber';
    return 'from-red-600 via-rose-500 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse';
  };

  return (
    <div
      id="player-status-hud"
      className="w-full bg-[#0b101b]/95 border-b border-cyan-500/30 backdrop-blur-md p-3 sm:p-4 sticky top-0 z-40 shadow-lg"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Player Call-sign & Class */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded border border-cyan-400/60 bg-gradient-to-br from-cyan-950/80 to-slate-900 flex items-center justify-center font-cyber font-bold text-cyan-300 text-sm shadow-neon-cyan">
              {player.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
                [ PROTOCOL ID ]
              </span>
              {isLowHp && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/60 animate-pulse">
                  <ShieldAlert className="w-3 h-3" /> 危险预警
                </span>
              )}
            </div>
            <div className="font-tech text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>{player.name}</span>
              <span className="text-xs font-mono text-slate-400">#NET-RUNNER</span>
            </div>
          </div>
        </div>

        {/* Center: Animated Health Bar */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Heart
                className={`w-3.5 h-3.5 ${
                  isLowHp ? 'text-red-500 animate-bounce' : 'text-cyan-400'
                }`}
              />
              <span>生命机能 (HP)</span>
            </span>

            <div className="relative flex items-center gap-1 font-bold">
              <span
                className={`text-sm ${
                  isLowHp ? 'text-red-400' : 'text-cyan-300'
                }`}
              >
                {player.hp}
              </span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{player.max_hp}</span>

              {/* Floating damage or heal indicator */}
              <AnimatePresence>
                {hpDelta !== undefined && hpDelta !== null && hpDelta !== 0 && (
                  <motion.span
                    key={`delta-${hpDelta}-${Date.now()}`}
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -16, scale: 1.1 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.8 }}
                    className={`absolute -top-4 right-0 font-bold text-xs ${
                      hpDelta > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {hpDelta > 0 ? `+${hpDelta}` : `${hpDelta}`}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress track */}
          <div className="h-3 w-full bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-700/60 relative">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${getHpGradient()}`}
              initial={{ width: '100%' }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            />
            {/* Cyber tick marks */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-2 opacity-30">
              <div className="w-px h-full bg-white" />
              <div className="w-px h-full bg-white" />
              <div className="w-px h-full bg-white" />
            </div>
          </div>
        </div>

        {/* Right: Gold, Torch status, Inventory button */}
        <div className="flex items-center gap-3 sm:gap-4 self-end md:self-center">
          {/* Gold Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-amber-500/40 text-amber-300 shadow-sm">
            <Coins className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-amber-400/80 leading-none">
                CREDITS
              </span>
              <span className="font-mono font-bold text-sm text-amber-200">
                {player.gold}
              </span>
            </div>
          </div>

          {/* Torch Equipped Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              player.has_torch
                ? 'bg-orange-950/50 border-orange-500/60 text-orange-300 shadow-neon-amber'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
            title={
              player.has_torch
                ? '【火把】已装备：洞穴照明 / 长廊潜行优势 / 战斗可致盲'
                : '火把：未装备'
            }
          >
            <Flame
              className={`w-4 h-4 ${
                player.has_torch
                  ? 'text-orange-400 animate-pulse'
                  : 'text-slate-600'
              }`}
            />
            <span className="hidden sm:inline font-tech">
              {player.has_torch ? '火把点亮' : '无火把'}
            </span>
          </div>

          {/* Inventory Button with notification badge */}
          <button
            id="open-inventory-btn"
            type="button"
            onClick={onOpenInventory}
            className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/50 hover:border-cyan-300 hover:shadow-neon-cyan transition-all text-xs font-mono cursor-pointer active:scale-95"
          >
            <Backpack className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="font-tech text-cyan-200">背包栏</span>

            {/* Potion counter pill */}
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-[10px] text-cyan-300 font-bold">
              {potionCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
