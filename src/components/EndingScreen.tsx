import React, { useEffect } from 'react';
import { Player, SceneType } from '../types';
import { Trophy, Skull, ShieldCheck, RotateCcw, Award, Heart, Coins, Flame, Backpack } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface EndingScreenProps {
  scene: SceneType;
  player: Player;
  onRestart: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({ scene, player, onRestart }) => {
  const potionLeft = player.inventory['生命药水'] || 0;
  const score = player.gold + player.hp + potionLeft * 20;

  let rank = '幸运的生还者 (B)';
  let rankGrade = 'B';
  let rankColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';

  if (score >= 160) {
    rank = '传说级探险家 (S)';
    rankGrade = 'S';
    rankColor = 'text-yellow-400 border-yellow-500/50 bg-yellow-950/40 shadow-neon-amber';
  } else if (score >= 120) {
    rank = '英勇的地牢征服者 (A)';
    rankGrade = 'A';
    rankColor = 'text-pink-400 border-pink-500/50 bg-pink-950/40 shadow-neon-pink';
  }

  useEffect(() => {
    if (scene === 'exit') {
      soundEffects.victory();
    } else if (scene === 'game_over') {
      soundEffects.defeat();
    }
  }, [scene]);

  return (
    <div
      id="ending-screen-card"
      className="max-w-2xl mx-auto my-auto p-6 sm:p-8 bg-[#0b101c]/95 border border-cyan-500/40 rounded-xl shadow-2xl relative overflow-hidden backdrop-blur-md"
    >
      {/* Top laser border */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          scene === 'exit'
            ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400'
            : scene === 'game_over'
            ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-800'
            : 'bg-gradient-to-r from-slate-500 via-blue-400 to-slate-500'
        }`}
      />

      {/* Header icon and title */}
      <div className="text-center space-y-3 mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto">
          {scene === 'exit' && (
            <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-400 flex items-center justify-center text-amber-400 shadow-neon-amber">
              <Trophy className="w-8 h-8" />
            </div>
          )}
          {scene === 'game_over' && (
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <Skull className="w-8 h-8 animate-pulse" />
            </div>
          )}
          {scene === 'retreat' && (
            <div className="w-16 h-16 rounded-2xl bg-blue-950/60 border border-blue-400 flex items-center justify-center text-blue-300">
              <ShieldCheck className="w-8 h-8" />
            </div>
          )}
        </div>

        <h2 className="font-tech text-3xl sm:text-4xl font-extrabold text-white tracking-wider">
          {scene === 'exit' && '曙光破晓 · 探险凯旋'}
          {scene === 'game_over' && '生命熄灭 · GAME OVER'}
          {scene === 'retreat' && '安全撤退 · 任务终止'}
        </h2>

        <p className="font-mono-term text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
          {scene === 'exit' &&
            `曙光洒在你的脸庞上，恭喜你，${player.name}！你成功战胜险境，逃出了神秘洞穴！`}
          {scene === 'game_over' &&
            `你的眼前逐渐陷入无尽的深黑，生命之火彻底熄灭……勇者 ${player.name} 遗憾陨落在地牢深处。`}
          {scene === 'retreat' &&
            `你衡量再三，决定安全第一，退出了危机四伏的洞穴。`}
        </p>
      </div>

      {/* Summary Score Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 mb-6 space-y-4">
        <div className="text-xs font-mono uppercase text-cyan-400 border-b border-slate-800 pb-2 flex justify-between items-center">
          <span>【最终通关战况结算】</span>
          <span>PROTOCOL_END::0x9F</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Heart className="w-3 h-3 text-cyan-400" />
              剩余生命
            </span>
            <div className="font-tech text-lg font-bold text-slate-100 mt-0.5">
              {player.hp} <span className="text-xs text-slate-500">/ {player.max_hp}</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              斩获金币
            </span>
            <div className="font-tech text-lg font-bold text-amber-300 mt-0.5">
              {player.gold} <span className="text-xs text-slate-500">Credits</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Backpack className="w-3 h-3 text-emerald-400" />
              结余药水
            </span>
            <div className="font-tech text-lg font-bold text-emerald-300 mt-0.5">
              {potionLeft} <span className="text-xs text-slate-500">瓶</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              火把状态
            </span>
            <div className="font-tech text-sm font-bold text-orange-300 mt-1">
              {player.has_torch ? '持有 (带出)' : '未携带'}
            </div>
          </div>
        </div>

        {/* Rank Rating if exit */}
        {scene === 'exit' && (
          <div className={`p-4 rounded-lg border flex items-center justify-between gap-4 ${rankColor}`}>
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 shrink-0" />
              <div>
                <span className="text-xs font-mono uppercase tracking-wider block opacity-80">
                  综合探险成就评级
                </span>
                <span className="font-tech text-lg font-bold">
                  {rank}
                </span>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-2xl font-black font-cyber">{rankGrade}</div>
              <div className="text-[10px] opacity-70">综合积分: {score}</div>
            </div>
          </div>
        )}
      </div>

      {/* Restart Button */}
      <button
        id="restart-game-btn"
        type="button"
        onClick={() => {
          soundEffects.buttonClick();
          onRestart();
        }}
        onMouseEnter={() => soundEffects.buttonHover()}
        className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-tech font-bold text-base tracking-wider shadow-neon-cyan flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
      >
        <RotateCcw className="w-5 h-5" />
        <span>重 新 启 动 探 险 (REBOOT)</span>
      </button>
    </div>
  );
};
