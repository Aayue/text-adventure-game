import React, { useState } from 'react';
import { Shield, Sparkles, Terminal, Play, Heart, Coins, Backpack } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface IntroScreenProps {
  onStart: (playerName: string) => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  const [name, setName] = useState<string>('冒险家');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.buttonClick();
    onStart(name.trim() || '冒险家');
  };

  return (
    <div
      id="intro-screen-container"
      className="max-w-2xl mx-auto my-auto p-6 bg-[#0c101d]/90 border border-cyan-500/40 rounded-xl shadow-2xl shadow-cyan-950/60 backdrop-blur-md relative overflow-hidden"
    >
      {/* Laser header edge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-cyan-400 to-emerald-400" />

      {/* Cyber title */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-mono uppercase tracking-widest">
          <Terminal className="w-3.5 h-3.5" />
          <span>CYBER DUNGEON PROTOCOL v2.4</span>
        </div>

        <h1 className="font-tech text-3xl sm:text-4xl font-extrabold text-white tracking-wide text-glow-cyan">
          《地牢暗影探险》
        </h1>
        <p className="font-mono-term text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          幽暗的地底都市裂缝深处，埋藏着古老秘宝与异变生灵。请初始化你的探险家身份，接入神经探险网络。
        </p>
      </div>

      {/* Starting Stats Preview Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 mb-6 grid grid-cols-3 gap-3 text-center">
        <div className="p-2 rounded bg-slate-950/50 border border-cyan-500/20">
          <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-mono mb-1">
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span>初始机能</span>
          </div>
          <span className="font-mono font-bold text-slate-200 text-sm">100 / 100 HP</span>
        </div>

        <div className="p-2 rounded bg-slate-950/50 border border-amber-500/20">
          <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-mono mb-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>初始信用点</span>
          </div>
          <span className="font-mono font-bold text-slate-200 text-sm">20 Credits</span>
        </div>

        <div className="p-2 rounded bg-slate-950/50 border border-emerald-500/20">
          <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-mono mb-1">
            <Backpack className="w-3.5 h-3.5 text-emerald-400" />
            <span>标配物资</span>
          </div>
          <span className="font-mono font-bold text-slate-200 text-sm">药水 x 2 瓶</span>
        </div>
      </div>

      {/* Player Name Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="player-name-input"
            className="block text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1.5"
          >
            [ 输入你的勇者代号 / 冒险家姓名 ]
          </label>
          <div className="relative">
            <input
              id="player-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="默认: 冒险家"
              maxLength={18}
              className="w-full bg-[#080d17] border border-cyan-500/50 rounded-lg px-4 py-3 text-slate-100 font-tech text-lg focus:outline-none focus:border-cyan-300 focus:shadow-neon-cyan transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
              CALL-SIGN
            </span>
          </div>
        </div>

        <button
          id="start-expedition-btn"
          type="submit"
          onMouseEnter={() => soundEffects.buttonHover()}
          className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-tech font-bold text-lg tracking-wider shadow-neon-cyan flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>启 动 探 险 协 议 (ENTER)</span>
        </button>
      </form>
    </div>
  );
};
