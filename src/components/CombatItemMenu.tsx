import React from 'react';
import { Player } from '../types';
import { HeartPulse, Flame, ArrowLeft, AlertCircle } from 'lucide-react';
import { CyberButton } from './CyberButton';

interface CombatItemMenuProps {
  player: Player;
  onUsePotion: () => void;
  onTorchAttack: () => void;
  onCancel: () => void;
}

export const CombatItemMenu: React.FC<CombatItemMenuProps> = ({
  player,
  onUsePotion,
  onTorchAttack,
  onCancel,
}) => {
  const potionCount = player.inventory['生命药水'] || 0;
  const isHpFull = player.hp >= player.max_hp;

  return (
    <div
      id="combat-item-menu"
      className="bg-[#0b101c] border border-amber-500/50 rounded-lg p-4 shadow-xl space-y-3"
    >
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
        <span className="font-tech text-amber-300 font-bold text-base flex items-center gap-2">
          <span>--- 请选择要使用的战备道具 ---</span>
        </span>
        <span className="text-xs font-mono text-slate-400">行动将消耗当前回合</span>
      </div>

      <div className="space-y-2">
        {/* Potion choice */}
        {potionCount > 0 ? (
          <CyberButton
            id="combat-use-potion-btn"
            keyNumber="1"
            title={`生命药水 (剩余 ${potionCount} 瓶)`}
            description={
              isHpFull
                ? '你的生命值已处于饱满状态，无需饮用药水！'
                : '饮用后迅速恢复至多 40 点生命值'
            }
            variant="emerald"
            icon={<HeartPulse className="w-4 h-4 text-emerald-400" />}
            onClick={onUsePotion}
            disabled={isHpFull}
          />
        ) : (
          <div className="p-3 rounded border border-slate-800 bg-slate-900/50 text-slate-500 text-xs font-mono">
            背包中已无生命药水
          </div>
        )}

        {/* Torch attack choice */}
        {player.has_torch && (
          <CyberButton
            id="combat-use-torch-btn"
            keyNumber="2"
            title="火把奇袭"
            description="挥动烈焰火把突袭，造成 15 点灼烧伤害，并致盲敌人 1 回合"
            variant="amber"
            icon={<Flame className="w-4 h-4 text-amber-400" />}
            onClick={onTorchAttack}
          />
        )}

        {/* Cancel button */}
        <CyberButton
          id="combat-cancel-item-btn"
          keyNumber="3"
          title="取消返回"
          description="保留当前回合，返回战斗主指令菜单"
          variant="pink"
          icon={<ArrowLeft className="w-4 h-4 text-pink-400" />}
          onClick={onCancel}
        />
      </div>
    </div>
  );
};
