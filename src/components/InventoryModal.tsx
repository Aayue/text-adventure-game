import React from 'react';
import { Player } from '../types';
import { X, Sparkles, Flame, Shield, HeartPulse, AlertCircle } from 'lucide-react';
import { soundEffects } from '../utils/sound';
import { motion } from 'motion/react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onUsePotion: () => void;
  inCombat?: boolean;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  player,
  onUsePotion,
  inCombat = false,
}) => {
  if (!isOpen) return null;

  const potionCount = player.inventory['生命药水'] || 0;
  const isHpFull = player.hp >= player.max_hp;

  const handleUsePotionClick = () => {
    if (potionCount <= 0) return;
    if (isHpFull) {
      soundEffects.hitDamage();
      return;
    }
    soundEffects.heal();
    onUsePotion();
  };

  return (
    <div
      id="inventory-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        id="inventory-modal-panel"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0b101d] border border-cyan-500/50 rounded-xl p-5 shadow-2xl shadow-cyan-950/50 relative overflow-hidden"
      >
        {/* Top laser accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              SYS::INVENTORY
            </span>
            <h2 className="text-lg sm:text-xl font-tech font-bold text-slate-100 flex items-center gap-2">
              <span>随身数据背包</span>
              {inCombat && (
                <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                  战斗中使用消耗回合
                </span>
              )}
            </h2>
          </div>

          <button
            id="close-inventory-btn"
            type="button"
            onClick={() => {
              soundEffects.buttonClick();
              onClose();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inventory Item Grid */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {/* Item 1: 生命药水 */}
          <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-[#0a1815] to-slate-900/60 flex items-center justify-between gap-3 group hover:border-emerald-500/60 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-neon-emerald">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-tech font-bold text-emerald-200 text-base">
                    纳米生命药水
                  </span>
                  <span className="text-xs font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    x {potionCount}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono-term mt-1">
                  饮用后快速重组生物细胞，立即恢复至多 40 点生命值。
                </p>
                {isHpFull && potionCount > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-400/90 font-mono mt-1">
                    <AlertCircle className="w-3 h-3" />
                    当前生命已满，无需使用
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <button
                id="use-potion-modal-btn"
                type="button"
                disabled={potionCount <= 0 || isHpFull}
                onClick={handleUsePotionClick}
                className={`px-3 py-1.5 rounded-lg font-tech text-xs font-bold uppercase transition-all
                  ${
                    potionCount > 0 && !isHpFull
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-neon-emerald cursor-pointer active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
              >
                饮用药水
              </button>
            </div>
          </div>

          {/* Item 2: 燃烧的火把 */}
          {player.has_torch ? (
            <div className="p-3.5 rounded-lg border border-orange-500/40 bg-gradient-to-r from-orange-950/30 via-[#180f0a] to-slate-900/60 flex items-center justify-between gap-3 group">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-950/80 border border-orange-400/50 flex items-center justify-center text-orange-400 shrink-0 shadow-neon-amber">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-tech font-bold text-orange-200 text-base">
                      高热聚能火把
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">
                      [装备中]
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono-term mt-1">
                    提供地下城照明与潜行判定加成；战斗中可选择火把奇袭，造成 15 点灼烧伤害并致盲目标 1 回合。
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-orange-400/80 px-2 py-1 bg-orange-950/40 rounded border border-orange-500/30 shrink-0">
                战备常驻
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 opacity-50 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="font-tech font-semibold text-slate-400 text-sm">
                  [未持有] 洞穴火把
                </span>
                <p className="text-xs text-slate-600 font-mono-term mt-0.5">
                  可在洞穴入口处拾取并点燃，提供探路保障。
                </p>
              </div>
            </div>
          )}

          {/* Empty Hologram Slots */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[1, 2, 3].map((slot) => (
              <div
                key={`empty-slot-${slot}`}
                className="h-16 rounded-lg border border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center text-slate-600 text-[11px] font-mono"
              >
                <span>[ 空槽位 0{slot} ]</span>
                <span className="text-[9px] text-slate-700">EMPTY</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>当前负载: {potionCount + (player.has_torch ? 1 : 0)} / 5</span>
          <span className="text-cyan-400">ESC 或点击空白处关闭</span>
        </div>
      </motion.div>
    </div>
  );
};
