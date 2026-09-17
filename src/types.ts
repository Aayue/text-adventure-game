export type SceneType =
  | 'intro'
  | 'cave_entrance'
  | 'hallway'
  | 'combat'
  | 'exit'
  | 'game_over'
  | 'retreat';

export interface Player {
  name: string;
  hp: number;
  max_hp: number;
  gold: number;
  has_torch: boolean;
  inventory: {
    [itemName: string]: number;
  };
}

export interface Enemy {
  name: string;
  hp: number;
  max_hp: number;
  atk_min: number;
  atk_max: number;
  is_blinded: boolean;
}

export type LogType =
  | 'narrative'
  | 'action'
  | 'combat'
  | 'critical'
  | 'damage'
  | 'heal'
  | 'loot'
  | 'system'
  | 'warning'
  | 'victory';

export interface GameLog {
  id: string;
  text: string;
  type: LogType;
  timestamp: number;
}

export interface ActionChoice {
  id: string;
  keyNumber: string; // e.g. "1", "2", "3", "4"
  title: string;
  description?: string;
  badge?: string;
  action: () => void;
  variant?: 'cyan' | 'pink' | 'amber' | 'emerald' | 'danger';
  disabled?: boolean;
}

export interface FloatingNotification {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'gold' | 'item' | 'info';
}
