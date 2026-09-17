import React from 'react';
import { SceneType } from '../types';
import { Shield, Sparkles, AlertTriangle, Terminal, Compass } from 'lucide-react';

interface SceneIllustrationProps {
  scene: SceneType;
  inCombat?: boolean;
  enemyBlinded?: boolean;
  hasTorch?: boolean;
}

const SCENE_IMAGES: Record<string, { url: string; title: string; subtitle: string }> = {
  intro: {
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    title: 'ZONE::GATEWAY',
    subtitle: 'CYBERPUNK UNDERGROUND TERMINAL',
  },
  cave_entrance: {
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    title: 'ZONE::CAVE_ENTRANCE',
    subtitle: 'SUBTERRANEAN ACCESS NODE // 幽暗洞穴入口',
  },
  hallway: {
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    title: 'ZONE::CORRIDOR_DEPTH',
    subtitle: 'ABANDONED MECHA HALLWAY // 地牢石砖长廊',
  },
  combat: {
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    title: 'TARGET::GOBLIN_PATROL',
    subtitle: 'HOSTILE BIO-THREAT ENGAGED // 巡逻敌对生物',
  },
  exit: {
    url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1200&auto=format&fit=crop',
    title: 'ZONE::DAWN_HORIZON',
    subtitle: 'NEO-SHANGHAI DAWN // 地表晨曦与曙光',
  },
  game_over: {
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop',
    title: 'SYSTEM::TERMINATED',
    subtitle: 'SIGNAL COLLAPSE // 生命体征彻底熄灭',
  },
  retreat: {
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop',
    title: 'SYSTEM::TACTICAL_RETREAT',
    subtitle: 'SAFE HARBOR SAFEWAY // 安全撤离',
  },
};

export const SceneIllustration: React.FC<SceneIllustrationProps> = ({
  scene,
  inCombat = false,
  enemyBlinded = false,
  hasTorch = false,
}) => {
  const currentKey = inCombat ? 'combat' : scene;
  const info = SCENE_IMAGES[currentKey] || SCENE_IMAGES['cave_entrance'];

  return (
    <div
      id="scene-illustration-frame"
      className="relative w-full h-44 sm:h-56 md:h-64 rounded-xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-black group select-none"
    >
      {/* Background Graphic */}
      <img
        src={info.url}
        alt={info.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center brightness-75 contrast-125 saturate-125 transition-transform duration-700 group-hover:scale-105"
      />

      {/* Cyber gradient and scanline overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

      {/* Corner laser brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Top HUD telemetry tags */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-cyan-500/40 text-cyan-300">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>{info.title}</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700 text-slate-300">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span>{info.subtitle}</span>
        </div>
      </div>

      {/* Bottom Status indicators */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-2">
          {hasTorch && (
            <span className="px-2 py-0.5 rounded bg-orange-950/80 border border-orange-500/60 text-orange-300 text-[10px]">
              🔥 光源范围有效
            </span>
          )}
          {enemyBlinded && (
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-amber-300 text-[10px]">
              ⚡ 目标视觉已致盲
            </span>
          )}
        </div>

        <div className="text-[10px] text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded font-mono">
          CAMERA_FEED::LIVE [3000P]
        </div>
      </div>
    </div>
  );
};
