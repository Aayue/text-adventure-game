import React, { useState, useEffect } from 'react';
import { Player, Enemy, ActionChoice } from '../types';
import { CyberButton } from './CyberButton';
import { soundEffects } from '../utils/sound';
import {
  Sword,
  Shield,
  Sparkles,
  Flame,
  Footprints,
  EyeOff,
  Skull,
  Crosshair,
  HeartPulse,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CombatArenaProps {
  player: Player;
  enemy: Enemy;
  turnRound: number;
  onAttack: () => void;
  onDefend: () => void;
  onUseItem: () => void;
  onFlee: () => void;
  isProcessing: boolean;
  combatLog: string[];
}

export const CombatArena: React.FC<CombatArenaProps> = ({
  player,
  enemy,
  turnRound,
  onAttack,
  onDefend,
  onUseItem,
  onFlee,
  isProcessing,
  combatLog,
}) => {
  const enemyHpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.max_hp) * 100));
  const playerHpPercent = Math.max(0, Math.min(100, (player.hp / player.max_hp) * 100));

  return (
    <div
      id="combat-arena"
      className="w-full bg-gradient-to-b from-[#130e1a]/90 via-[#0d101d]/90 to-[#07090e]/95 border border-pink-500/40 rounded-xl p-4 sm:p-6 shadow-2xl shadow-pink-950/40 relative overflow-hidden"
    >
      {/* Top red alert stripe */}
      <div className="flex items-center justify-between border-b border-pink-500/30 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
          </span>
          <span className="font-mono text-xs text-pink-400 uppercase tracking-wider font-bold">
            COMBAT ENGAGED // 回合制战术对决
          </span>
        </div>

        <div className="px-3 py-0.5 rounded bg-pink-950/70 border border-pink-500/50 text-pink-300 text-xs font-mono font-bold">
          第 {turnRound} 回合
        </div>
      </div>

      {/* Versus Grid: Player vs Enemy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Player Combat Card */}
        <div className="bg-slate-900/80 border border-cyan-500/40 rounded-lg p-4 relative shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-400/60 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">
                YOU
              </div>
              <div>
                <span className="text-xs font-mono text-cyan-400">操作体</span>
                <h4 className="font-tech text-base font-bold text-white leading-none">
                  {player.name}
                </h4>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-sm font-bold text-cyan-300">{player.hp}</span>
              <span className="text-xs text-slate-500"> / {player.max_hp} HP</span>
            </div>
          </div>

          {/* Player HP Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 p-0.5 border border-slate-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
              animate={{ width: `${playerHpPercent}%` }}
              transition={{ type: 'spring', damping: 20 }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>基础攻强: 18~25 (35%暴击)</span>
            <span>药水储备: {player.inventory['生命药水'] || 0}</span>
          </div>
        </div>

        {/* Enemy Combat Card */}
        <div className="bg-slate-900/80 border border-pink-500/40 rounded-lg p-4 relative shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-pink-950 border border-pink-400/60 flex items-center justify-center text-pink-300 font-mono font-bold text-xs">
                FOE
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-pink-400">敌对生物</span>
                  {enemy.is_blinded && (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/60 animate-pulse">
                      <EyeOff className="w-3 h-3" /> 致盲中 (下回无法攻击)
                    </span>
                  )}
                </div>
                <h4 className="font-tech text-base font-bold text-pink-200 leading-none">
                  {enemy.name}
                </h4>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-sm font-bold text-pink-400">{enemy.hp}</span>
              <span className="text-xs text-slate-500"> / {enemy.max_hp} HP</span>
            </div>
          </div>

          {/* Enemy HP Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 p-0.5 border border-slate-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-red-500"
              animate={{ width: `${enemyHpPercent}%` }}
              transition={{ type: 'spring', damping: 20 }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>攻击输出: 10~18 点</span>
            <span className={enemy.is_blinded ? 'text-amber-400 font-bold' : 'text-slate-500'}>
              状态: {enemy.is_blinded ? '失明紊乱' : '狂暴警戒'}
            </span>
          </div>
        </div>
      </div>

      {/* Combat Action Controls */}
      <div className="mb-4">
        <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>战术行动指令 (键盘 1-4 或点击执行)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CyberButton
            id="combat-attack-btn"
            keyNumber="1"
            title="挥剑攻击"
            description="近战斩击造成 18~25 伤害，35% 几率触发 1.6 倍暴击重创"
            variant="cyan"
            icon={<Sword className="w-4 h-4 text-cyan-400" />}
            onClick={onAttack}
            disabled={isProcessing}
          />

          <CyberButton
            id="combat-defend-btn"
            keyNumber="2"
            title="举盾格挡"
            description="减免本回合 60% 伤害，并必定反震敌人 5~10 点反击伤害"
            variant="emerald"
            icon={<Shield className="w-4 h-4 text-emerald-400" />}
            onClick={onDefend}
            disabled={isProcessing}
          />

          <CyberButton
            id="combat-item-btn"
            keyNumber="3"
            title="使用道具"
            description={
              player.has_torch
                ? `生命药水(+40HP) 或 火把奇袭(15火焰伤害+致盲1回合)`
                : `生命药水恢复 40 点生命值 (剩余 ${player.inventory['生命药水'] || 0} 瓶)`
            }
            variant="amber"
            icon={<Sparkles className="w-4 h-4 text-amber-400" />}
            onClick={onUseItem}
            disabled={isProcessing}
          />

          <CyberButton
            id="combat-flee-btn"
            keyNumber="4"
            title="尝试逃跑"
            description="掷骰进行敏捷检定 (50% 成功率)，失败将承受敌人攻击"
            variant="pink"
            icon={<Footprints className="w-4 h-4 text-pink-400" />}
            onClick={onFlee}
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Combat Log Box */}
      <div className="bg-[#080c14] border border-slate-800 rounded-lg p-3 max-h-36 overflow-y-auto font-mono-term text-xs space-y-1.5">
        <div className="text-slate-500 border-b border-slate-800/80 pb-1 text-[10px] uppercase">
          &gt; COMBAT TELEMETRY LOG
        </div>
        {combatLog.slice(-5).map((log, idx) => (
          <div
            key={`log-${idx}`}
            className={`leading-relaxed ${
              log.includes('暴击')
                ? 'text-yellow-300 font-bold'
                : log.includes('受') || log.includes('创伤') || log.includes('反击回合')
                ? 'text-rose-400'
                : log.includes('恢复') || log.includes('药水')
                ? 'text-emerald-300'
                : log.includes('火把') || log.includes('致盲')
                ? 'text-amber-300'
                : 'text-slate-300'
            }`}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
