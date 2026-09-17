/**
 * Cyber Dungeon Protocol - Web Text Adventure
 * Based on Python dungeon adventure logic and storyline.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player, Enemy, SceneType, ActionChoice, FloatingNotification } from './types';
import { PlayerStatusBar } from './components/PlayerStatusBar';
import { TypewriterText } from './components/TypewriterText';
import { CyberButton } from './components/CyberButton';
import { CombatArena } from './components/CombatArena';
import { CombatItemMenu } from './components/CombatItemMenu';
import { InventoryModal } from './components/InventoryModal';
import { SceneIllustration } from './components/SceneIllustration';
import { IntroScreen } from './components/IntroScreen';
import { EndingScreen } from './components/EndingScreen';
import { soundEffects, setSoundMuted, getSoundMuted } from './utils/sound';
import {
  Volume2,
  VolumeX,
  Tv,
  RotateCcw,
  Flame,
  Shield,
  Footprints,
  LogOut,
  DoorOpen,
  ArrowLeft,
  Backpack,
  Sword,
  Sparkles,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_PLAYER: Player = {
  name: '冒险家',
  hp: 100,
  max_hp: 100,
  gold: 20,
  has_torch: false,
  inventory: {
    '生命药水': 2,
  },
};

export default function App() {
  // --- Game Core States ---
  const [scene, setScene] = useState<SceneType>('intro');
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER);
  const [chestLooted, setChestLooted] = useState<boolean>(false);
  const [goblinAlive, setGoblinAlive] = useState<boolean>(true);
  const [caveExplored, setCaveExplored] = useState<boolean>(false);

  // --- Narrative & Typewriter States ---
  const [currentNarrative, setCurrentNarrative] = useState<string>('');
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(false);
  const [storyHistory, setStoryHistory] = useState<string[]>([]);

  // --- Combat Engine States ---
  const [inCombat, setInCombat] = useState<boolean>(false);
  const [combatEnemy, setCombatEnemy] = useState<Enemy>({
    name: '巡逻哥布林',
    hp: 65,
    max_hp: 65,
    atk_min: 10,
    atk_max: 18,
    is_blinded: false,
  });
  const [combatRound, setCombatRound] = useState<number>(1);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [showCombatItemMenu, setShowCombatItemMenu] = useState<boolean>(false);
  const [isCombatProcessing, setIsCombatProcessing] = useState<boolean>(false);

  // --- UI & Preferences ---
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isMuted, setIsMutedState] = useState<boolean>(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [hpDelta, setHpDelta] = useState<number | null>(null);
  const [floatingNotes, setFloatingNotes] = useState<FloatingNotification[]>([]);

  // Utility to push narrative with typewriter
  const setNarrative = useCallback((text: string) => {
    setCurrentNarrative(text);
    setIsTypingComplete(false);
    setStoryHistory((prev) => [...prev, text]);
  }, []);

  // Show floating notifications
  const pushNotification = (text: string, type: 'damage' | 'heal' | 'gold' | 'item' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setFloatingNotes((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setFloatingNotes((prev) => prev.filter((item) => item.id !== id));
    }, 2500);
  };

  // Sound toggle handler
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMutedState(nextMute);
    setSoundMuted(nextMute);
  };

  // --- Game Lifecycle Handlers ---
  const handleStartGame = (playerName: string) => {
    const newPlayer: Player = {
      ...INITIAL_PLAYER,
      name: playerName,
    };
    setPlayer(newPlayer);
    setChestLooted(false);
    setGoblinAlive(true);
    setCaveExplored(false);
    setCombatRound(1);
    setCombatLog([]);
    setStoryHistory([]);

    setScene('cave_entrance');
    setNarrative(
      `你好，${playerName}！你站在潮湿幽暗的地下城入口，传说深处埋藏着古老的秘宝与危机。\n\n【场景：洞穴入口】四周漆黑一片，唯有石缝中渗透出的冷风在呼啸。`
    );
  };

  const handleRestart = () => {
    setScene('intro');
    setPlayer(INITIAL_PLAYER);
    setChestLooted(false);
    setGoblinAlive(true);
    setCaveExplored(false);
  };

  // --- Potion Consumption ---
  const handleUsePotion = () => {
    const potionCount = player.inventory['生命药水'] || 0;
    if (potionCount <= 0) {
      pushNotification('背包中没有可用的生命药水！', 'info');
      return;
    }
    if (player.hp >= player.max_hp) {
      pushNotification('生命值已满，无需饮用药水！', 'info');
      return;
    }

    const healAmount = Math.min(40, player.max_hp - player.hp);
    const newHp = player.hp + healAmount;

    setPlayer((prev) => ({
      ...prev,
      hp: newHp,
      inventory: {
        ...prev.inventory,
        '生命药水': prev.inventory['生命药水'] - 1,
      },
    }));

    setHpDelta(healAmount);
    setTimeout(() => setHpDelta(null), 1200);
    soundEffects.heal();
    pushNotification(`饮用药水，恢复 +${healAmount} HP`, 'heal');

    const msg = `你咕咚咕咚喝下了生命药水，浑身暖流涌动……恢复了 ${healAmount} 点生命！当前生命: ${newHp}/${player.max_hp}`;

    if (inCombat) {
      setCombatLog((prev) => [...prev, msg]);
      setIsInventoryOpen(false);
      setShowCombatItemMenu(false);
      // Potion in combat consumes turn -> enemy acts!
      handleEnemyTurn(newHp, combatEnemy);
    } else {
      setNarrative(msg);
      setIsInventoryOpen(false);
    }
  };

  // --- Scene 1: Cave Entrance Actions ---
  const handleCaveEntrancePickTorch = () => {
    soundEffects.flame();
    setPlayer((prev) => ({ ...prev, has_torch: true }));
    setCaveExplored(true);
    pushNotification('获得随身装备：【燃烧的火把】', 'item');

    const nextText =
      '你拾起火把并将其引燃。温暖而明亮的火光驱散了黑暗，视野豁然开朗！\n获得道具：【火把】已加入随身装备。\n\n【场景：地牢长廊】石砖通道向前方延伸。\n在通道拐角处，一只沉睡的巡逻哥布林正趴在一个镶金宝箱上打鼾。';
    setScene('hallway');
    setNarrative(nextText);
  };

  const handleCaveEntranceDarkEnter = () => {
    soundEffects.hitDamage();
    setPlayer((prev) => ({ ...prev, has_torch: false }));
    setCaveExplored(true);

    const dmg = Math.floor(Math.random() * (15 - 8 + 1)) + 8; // 8 - 15 damage
    const nextHp = player.hp - dmg;

    setPlayer((prev) => ({ ...prev, hp: Math.max(0, nextHp) }));
    setHpDelta(-dmg);
    setTimeout(() => setHpDelta(null), 1200);
    pushNotification(`摸黑跌倒，受到 -${dmg} 点擦碰伤害！`, 'damage');

    if (nextHp <= 0) {
      setScene('game_over');
      setNarrative(
        `你摸黑深入黑暗，冷不防被脚下的碎石绊倒，受到了 ${dmg} 点致命创伤！\n你的眼前逐渐陷入无尽的深黑，生命之火彻底熄灭……`
      );
      return;
    }

    const nextText = `你摸黑深入黑暗，冷不防被脚下的碎石绊倒，受到了 ${dmg} 点擦碰伤害！\n当前剩余生命值: ${nextHp}/${player.max_hp}\n\n【场景：地牢长廊】石砖通道向前方延伸。\n在通道拐角处，一只沉睡的巡逻哥布林正趴在一个镶金宝箱上打鼾。`;
    setScene('hallway');
    setNarrative(nextText);
  };

  const handleCaveEntranceRetreat = () => {
    soundEffects.buttonClick();
    setScene('retreat');
    setNarrative('你衡量再三，决定安全第一，退出了危机四伏的洞穴。');
  };

  // --- Scene 2: Hallway Actions ---
  const handleHallwaySneakSteal = () => {
    soundEffects.buttonClick();
    const roll = Math.floor(Math.random() * 10) + 1; // 1-10
    const successThreshold = player.has_torch ? 3 : 6;
    const isSuccess = roll >= successThreshold;

    if (isSuccess) {
      soundEffects.loot();
      const lootGold = Math.floor(Math.random() * (60 - 35 + 1)) + 35; // 35-60
      setChestLooted(true);
      setPlayer((prev) => ({
        ...prev,
        gold: prev.gold + lootGold,
        inventory: {
          ...prev.inventory,
          '生命药水': (prev.inventory['生命药水'] || 0) + 1,
        },
      }));
      pushNotification(`潜行盗窃成功！金币 +${lootGold}，生命药水 +1`, 'gold');

      const torchText = player.has_torch
        ? '火把照亮了地面，你精准避开了所有干枯的树枝与松动石块……\n'
        : '黑暗中你摸索着前进，每一步都充满未知……\n';

      setNarrative(
        `${torchText}【潜行成功！】你悄无声息地开启了宝箱，获得金币 +${lootGold} 以及一瓶【生命药水】！\n哥布林依然在呼呼大睡，通往地下城出口的石门已在眼前！`
      );
    } else {
      soundEffects.hitDamage();
      const failMsg =
        '【咔嚓！】你失误踩到了脆裂的兽骨！哥布林猛然惊醒，双眼通红地抓起了武器！';
      pushNotification('潜行失误！惊醒守卫，强制进入战斗！', 'damage');
      startCombat(false, failMsg);
    }
  };

  const handleHallwaySneakAttack = () => {
    soundEffects.slash();
    const sneakMsg = '你屏住呼吸，悄悄绕到哥布林身后发起致命背刺……';
    startCombat(true, sneakMsg);
  };

  const handleHallwayGoBackEntrance = () => {
    soundEffects.buttonClick();
    setScene('cave_entrance');
    setNarrative(
      '你悄步退回到了洞穴入口。\n【场景：洞穴入口】四周漆黑一片，唯有石缝中渗透出的冷风在呼啸。'
    );
  };

  const handleHallwayExitDungeon = () => {
    soundEffects.victory();
    setScene('exit');
    setNarrative(
      `曙光洒在你的脸庞上，恭喜你，${player.name}！你成功战胜险境，逃出了神秘洞穴！`
    );
  };

  // --- Combat Encounter Engine ---
  const startCombat = (sneakAttack: boolean, introText: string) => {
    const freshEnemy: Enemy = {
      name: '巡逻哥布林',
      hp: 65,
      max_hp: 65,
      atk_min: 10,
      atk_max: 18,
      is_blinded: false,
    };

    setCombatRound(1);
    setShowCombatItemMenu(false);
    setIsCombatProcessing(false);

    const initialLogs: string[] = [
      introText,
      `【进入战斗】尖锐的嘶吼声响起，${freshEnemy.name} 挥动带刺骨棒扑了过来！`,
    ];

    if (sneakAttack) {
      soundEffects.crit();
      const sneakDmg = Math.floor(Math.random() * (30 - 22 + 1)) + 22; // 22-30
      freshEnemy.hp -= sneakDmg;
      initialLogs.push(
        `【先发制人】你借着阴影发起突袭，武器正中敌人后背！造成了 ${sneakDmg} 点致命偷袭伤害！`
      );

      // Check if one-shot sneak kill
      if (freshEnemy.hp <= 0) {
        soundEffects.loot();
        const lootGold = Math.floor(Math.random() * (45 - 25 + 1)) + 25; // 25-45
        setPlayer((prev) => ({ ...prev, gold: prev.gold + lootGold }));
        setGoblinAlive(false);
        setChestLooted(true);
        pushNotification(`偷袭斩杀！战利品金币 +${lootGold}`, 'gold');

        initialLogs.push(
          `${freshEnemy.name} 甚至没看清攻击者是谁，便哀嚎着瘫倒在地！\n战利品结算：搜刮获得金币 +${lootGold}！`
        );

        setNarrative(initialLogs.join('\n'));
        setScene('hallway');
        return;
      }
    }

    setCombatEnemy(freshEnemy);
    setCombatLog(initialLogs);
    setInCombat(true);
    setScene('combat');
    setNarrative(initialLogs.join('\n'));
  };

  // Player Actions in Combat:
  // 1. Attack
  const handleCombatAttack = () => {
    if (isCombatProcessing || combatEnemy.hp <= 0 || player.hp <= 0) return;
    setIsCombatProcessing(true);

    const baseAtk = Math.floor(Math.random() * (25 - 18 + 1)) + 18;
    const isCrit = Math.random() > 0.65;
    let dealtDmg = baseAtk;
    let attackText = '';

    if (isCrit) {
      soundEffects.crit();
      dealtDmg = Math.floor(baseAtk * 1.6);
      attackText = `【暴击！】你窥见敌人破绽，全力斩出一记重击！造成了 ${dealtDmg} 点巨额伤害！`;
      pushNotification(`暴击！对敌人造成 ${dealtDmg} 伤害`, 'damage');
    } else {
      soundEffects.slash();
      attackText = `你敏捷地上前挥砍，对 ${combatEnemy.name} 造成了 ${dealtDmg} 点伤害。`;
      pushNotification(`挥砍造成 ${dealtDmg} 伤害`, 'damage');
    }

    const nextEnemyHp = Math.max(0, combatEnemy.hp - dealtDmg);
    const updatedEnemy: Enemy = { ...combatEnemy, hp: nextEnemyHp };
    setCombatEnemy(updatedEnemy);
    setCombatLog((prev) => [...prev, attackText]);

    // Check enemy defeat
    if (nextEnemyHp <= 0) {
      handleCombatVictory();
      return;
    }

    // Enemy's Turn
    handleEnemyTurn(player.hp, updatedEnemy, false);
  };

  // 2. Defend
  const handleCombatDefend = () => {
    if (isCombatProcessing || combatEnemy.hp <= 0 || player.hp <= 0) return;
    setIsCombatProcessing(true);
    soundEffects.shield();

    const defendText =
      '你稳住重心，双手握紧武器与盾牌架在身前，做好了防守反击的准备！';
    setCombatLog((prev) => [...prev, defendText]);
    pushNotification('架起盾牌，准备防守反击', 'info');

    // Enemy acts with defense applied
    handleEnemyTurn(player.hp, combatEnemy, true);
  };

  // 3. Torch Attack in Combat
  const handleCombatTorchAttack = () => {
    if (isCombatProcessing || combatEnemy.hp <= 0 || player.hp <= 0) return;
    setIsCombatProcessing(true);
    soundEffects.flame();

    const torchDmg = 15;
    const nextEnemyHp = Math.max(0, combatEnemy.hp - torchDmg);
    const updatedEnemy: Enemy = {
      ...combatEnemy,
      hp: nextEnemyHp,
      is_blinded: true,
    };

    setCombatEnemy(updatedEnemy);
    setShowCombatItemMenu(false);

    const torchText = `你挥舞烈焰熊熊的火把扫向敌人！造成 ${torchDmg} 点灼烧伤害！\n${combatEnemy.name} 被烈火燎伤眼睛，陷入【盲目恐慌】状态，下回合无法正常攻击！`;
    setCombatLog((prev) => [...prev, torchText]);
    pushNotification(`火把灼烧 ${torchDmg} 点伤害，敌人致盲！`, 'item');

    if (nextEnemyHp <= 0) {
      handleCombatVictory();
      return;
    }

    // Enemy acts while blinded
    handleEnemyTurn(player.hp, updatedEnemy, false);
  };

  // 4. Flee in Combat
  const handleCombatFlee = () => {
    if (isCombatProcessing || combatEnemy.hp <= 0 || player.hp <= 0) return;
    setIsCombatProcessing(true);
    soundEffects.buttonClick();

    const fleeRoll = Math.floor(Math.random() * 10) + 1;
    if (fleeRoll >= 5) {
      soundEffects.buttonClick();
      setInCombat(false);
      setIsCombatProcessing(false);
      setScene('cave_entrance');
      pushNotification('敏捷检定成功！成功逃脱', 'info');
      setNarrative(
        '你向后投掷碎石干扰敌人视线，借机灵巧地脱离了战斗，撤回走廊深处退到了洞穴入口！'
      );
    } else {
      soundEffects.hitDamage();
      const failText =
        '你试图转身逃跑，却被狡猾的哥布林封堵了去路，逃跑失败！';
      setCombatLog((prev) => [...prev, failText]);
      pushNotification('逃跑失败！遭到截击', 'damage');
      handleEnemyTurn(player.hp, combatEnemy, false);
    }
  };

  // Enemy counterattack turn execution
  const handleEnemyTurn = (
    currentPlayerHp: number,
    currentEnemy: Enemy,
    isDefending: boolean = false
  ) => {
    setTimeout(() => {
      // Check if enemy blinded
      if (currentEnemy.is_blinded) {
        soundEffects.slash();
        const blindText = `>> ${currentEnemy.name} 的反击回合：\n${currentEnemy.name} 捂着被火烧痛的双眼胡乱挥棒，完全挥空了！`;
        setCombatLog((prev) => [...prev, blindText]);
        setCombatEnemy((prev) => ({ ...prev, is_blinded: false }));
        setCombatRound((prev) => prev + 1);
        setIsCombatProcessing(false);
        return;
      }

      // Normal attack
      const enemyRawDmg =
        Math.floor(
          Math.random() * (currentEnemy.atk_max - currentEnemy.atk_min + 1)
        ) + currentEnemy.atk_min;

      if (isDefending) {
        soundEffects.shield();
        const absorbedDmg = Math.floor(enemyRawDmg * 0.4);
        const counterDmg = Math.floor(Math.random() * (10 - 5 + 1)) + 5;

        const finalPlayerHp = Math.max(0, currentPlayerHp - absorbedDmg);
        const finalEnemyHp = Math.max(0, currentEnemy.hp - counterDmg);

        setPlayer((prev) => ({ ...prev, hp: finalPlayerHp }));
        setHpDelta(-absorbedDmg);
        setTimeout(() => setHpDelta(null), 1000);

        setCombatEnemy((prev) => ({ ...prev, hp: finalEnemyHp }));

        const defendResultText = `>> ${currentEnemy.name} 的反击回合：\n盾牌防御成功！骨棒重重击在盾面上，伤害被削减至仅有 ${absorbedDmg} 点！\n【防守反击】盾牌反震波及哥布林，造成了 ${counterDmg} 点反击伤害！`;
        setCombatLog((prev) => [...prev, defendResultText]);
        pushNotification(`防御生效 (-${absorbedDmg}HP), 盾击反伤 ${counterDmg}`, 'damage');

        if (finalEnemyHp <= 0) {
          soundEffects.victory();
          setCombatLog((prev) => [
            ...prev,
            `${currentEnemy.name} 被强大的反震力撞晕致死！`,
          ]);
          handleCombatVictory();
          return;
        }

        if (finalPlayerHp <= 0) {
          handlePlayerDeath();
          return;
        }
      } else {
        soundEffects.hitDamage();
        const finalPlayerHp = Math.max(0, currentPlayerHp - enemyRawDmg);
        setPlayer((prev) => ({ ...prev, hp: finalPlayerHp }));
        setHpDelta(-enemyRawDmg);
        setTimeout(() => setHpDelta(null), 1000);

        const hitText = `>> ${currentEnemy.name} 的反击回合：\n${currentEnemy.name} 嘶叫着扑击过来，重重砸中你，造成了 ${enemyRawDmg} 点伤害！`;
        setCombatLog((prev) => [...prev, hitText]);
        pushNotification(`遭受骨棒重击 -${enemyRawDmg} HP`, 'damage');

        if (finalPlayerHp <= 0) {
          handlePlayerDeath();
          return;
        }
      }

      setCombatRound((prev) => prev + 1);
      setIsCombatProcessing(false);
    }, 600);
  };

  // Combat victory loot and state update
  const handleCombatVictory = () => {
    soundEffects.victory();
    setGoblinAlive(false);
    setInCombat(false);
    setIsCombatProcessing(false);

    const lootGold = Math.floor(Math.random() * (50 - 30 + 1)) + 30; // 30-50
    let bonusPotion = false;
    if (Math.random() >= 0.4) {
      bonusPotion = true;
    }

    let extraChestGold = 0;
    if (!chestLooted) {
      extraChestGold = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
      setChestLooted(true);
    }

    setPlayer((prev) => ({
      ...prev,
      gold: prev.gold + lootGold + extraChestGold,
      inventory: {
        ...prev.inventory,
        '生命药水': (prev.inventory['生命药水'] || 0) + (bonusPotion ? 1 : 0),
      },
    }));

    const victoryLines = [
      '【战斗大捷】巡逻哥布林 伤势过重，惨嚎一声倒在血泊中！',
      `战利品结算：从敌人身上搜刮到 ${lootGold} 枚金币！`,
    ];

    if (bonusPotion) {
      victoryLines.push('意外收获：你还在哥布林的腰包中翻出了一瓶【生命药水】！');
    }

    if (extraChestGold > 0) {
      victoryLines.push(`战后你顺手开启了守卫身后的宝箱，额外斩获金币 +${extraChestGold}！`);
    }

    victoryLines.push(
      '\n走廊中已没有敌人阻拦，前方的厚重石门通向地牢出口。'
    );

    pushNotification(`战斗胜利！金币 +${lootGold + extraChestGold}`, 'gold');
    setScene('hallway');
    setNarrative(victoryLines.join('\n'));
  };

  // Player Death
  const handlePlayerDeath = () => {
    soundEffects.defeat();
    setInCombat(false);
    setIsCombatProcessing(false);
    setScene('game_over');
    setNarrative(
      `你遭受了致命创伤，体力不支倒了下去……\n你的眼前逐渐陷入无尽的深黑，生命之火彻底熄灭……\n【Game Over】勇者 ${player.name} 遗憾陨落在地牢深处。`
    );
  };

  // --- Keyboard Shortcuts (1-4, ESC) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsInventoryOpen(false);
        setShowCombatItemMenu(false);
        return;
      }

      // Ignore shortcut inputs if modal is open or inside text input
      if (
        isInventoryOpen ||
        document.activeElement?.tagName === 'INPUT' ||
        scene === 'intro' ||
        scene === 'exit' ||
        scene === 'game_over' ||
        scene === 'retreat'
      ) {
        return;
      }

      if (scene === 'combat') {
        if (showCombatItemMenu) {
          if (e.key === '1') handleUsePotion();
          if (e.key === '2' && player.has_torch) handleCombatTorchAttack();
          if (e.key === '3') setShowCombatItemMenu(false);
        } else {
          if (e.key === '1') handleCombatAttack();
          if (e.key === '2') handleCombatDefend();
          if (e.key === '3') setShowCombatItemMenu(true);
          if (e.key === '4') handleCombatFlee();
        }
        return;
      }

      if (scene === 'cave_entrance') {
        if (e.key === '1') handleCaveEntrancePickTorch();
        if (e.key === '2') handleCaveEntranceDarkEnter();
        if (e.key === '3') setIsInventoryOpen(true);
        if (e.key === '4') handleCaveEntranceRetreat();
      } else if (scene === 'hallway') {
        if (goblinAlive && !chestLooted) {
          if (e.key === '1') handleHallwaySneakSteal();
          if (e.key === '2') handleHallwaySneakAttack();
          if (e.key === '3') handleHallwayGoBackEntrance();
          if (e.key === '4') setIsInventoryOpen(true);
        } else {
          if (e.key === '1') handleHallwayExitDungeon();
          if (e.key === '2') handleHallwayGoBackEntrance();
          if (e.key === '3') setIsInventoryOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    scene,
    inCombat,
    showCombatItemMenu,
    isInventoryOpen,
    goblinAlive,
    chestLooted,
    player,
    isCombatProcessing,
  ]);

  return (
    <div className={`min-h-screen bg-[#07090e] text-slate-100 flex flex-col relative ${scanlinesEnabled ? 'scanlines' : ''}`}>
      {/* Top Cyber Command Header Bar */}
      <header className="bg-[#0a0d16] border-b border-cyan-500/20 px-4 py-2.5 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-2 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-tech font-bold tracking-wider text-sm text-white">
            CYBER DUNGEON PROTOCOL
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">暗影地牢探险：赛博纪元</span>
        </div>

        {/* Global Controls: Sound, CRT Scanlines, Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title={isMuted ? '开启音效' : '静音'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{isMuted ? '静音' : '音效开'}</span>
          </button>

          <button
            type="button"
            onClick={() => setScanlinesEnabled(!scanlinesEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              scanlinesEnabled
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="切换 CRT 扫描线复古滤镜"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CRT扫描线</span>
          </button>

          {scene !== 'intro' && (
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-pink-500 text-slate-400 hover:text-pink-300 transition-colors cursor-pointer"
              title="重新开始游戏"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">重置</span>
            </button>
          )}
        </div>
      </header>

      {/* Persistent Animated HUD (Shown once game started) */}
      {scene !== 'intro' && (
        <PlayerStatusBar
          player={player}
          onOpenInventory={() => {
            soundEffects.buttonClick();
            setIsInventoryOpen(true);
          }}
          hpDelta={hpDelta}
        />
      )}

      {/* Floating Notifications Alert Layer */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {floatingNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              className={`px-3.5 py-2 rounded-lg font-mono text-xs shadow-lg backdrop-blur-md border ${
                note.type === 'damage'
                  ? 'bg-red-950/80 border-red-500/80 text-red-200'
                  : note.type === 'heal'
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200'
                  : note.type === 'gold'
                  ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
                  : 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200'
              }`}
            >
              {note.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Game Stage Viewport */}
      <main className="flex-1 flex flex-col justify-center p-3 sm:p-6 max-w-5xl mx-auto w-full">
        {/* VIEW 1: INTRO / NAME SELECTION */}
        {scene === 'intro' && <IntroScreen onStart={handleStartGame} />}

        {/* VIEW 2 & 3: SCENE EXPLORATION (CAVE ENTRANCE / HALLWAY) */}
        {(scene === 'cave_entrance' || scene === 'hallway') && (
          <div className="space-y-4 sm:space-y-6">
            {/* Thematic Visual Stage */}
            <SceneIllustration
              scene={scene}
              inCombat={false}
              hasTorch={player.has_torch}
            />

            {/* Narrative Terminal with Typewriter Animation */}
            <div className="bg-[#0b101c]/95 border border-cyan-500/40 rounded-xl p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3 text-xs font-mono text-cyan-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  &gt; NARRATIVE_LOG // 探险日志实况
                </span>
                <span className="text-slate-500 text-[11px]">CLICK TEXT TO FAST-FORWARD</span>
              </div>

              <TypewriterText
                text={currentNarrative}
                speed={16}
                enableAudio={!isMuted}
                onComplete={() => setIsTypingComplete(true)}
              />
            </div>

            {/* Action Option Buttons with Cyberpunk Glow & Hotkeys */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 px-1 flex justify-between">
                <span>[ 请选择你的行动指令 (键盘 1~4) ]</span>
                <span className="text-cyan-400">ACTIONS READY</span>
              </div>

              {/* Cave Entrance Choices */}
              {scene === 'cave_entrance' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <CyberButton
                    id="cave-take-torch-btn"
                    keyNumber="1"
                    title="点燃入口旁的火把并稳步进入"
                    description="获得随身装备【火把】，驱散黑暗，照亮长廊并获得战斗致盲能力"
                    variant="amber"
                    icon={<Flame className="w-4 h-4 text-amber-400" />}
                    onClick={handleCaveEntrancePickTorch}
                  />

                  <CyberButton
                    id="cave-enter-dark-btn"
                    keyNumber="2"
                    title="摸黑轻装直接潜入"
                    description="不携带火把直接摸黑潜行，需承受 8~15 点磕碰擦伤危险"
                    variant="pink"
                    icon={<Footprints className="w-4 h-4 text-pink-400" />}
                    onClick={handleCaveEntranceDarkEnter}
                  />

                  <CyberButton
                    id="cave-check-inventory-btn"
                    keyNumber="3"
                    title="查看当前状态与背包"
                    description="检视健康状况、随身物资装备并可使用恢复药剂"
                    variant="cyan"
                    icon={<Backpack className="w-4 h-4 text-cyan-400" />}
                    onClick={() => {
                      soundEffects.buttonClick();
                      setIsInventoryOpen(true);
                    }}
                  />

                  <CyberButton
                    id="cave-retreat-btn"
                    keyNumber="4"
                    title="离开此地 (安全撤退，结束游戏)"
                    description="衡量再三，安全第一，安全撤离洞穴终止本次探险"
                    variant="danger"
                    icon={<LogOut className="w-4 h-4 text-red-400" />}
                    onClick={handleCaveEntranceRetreat}
                  />
                </div>
              )}

              {/* Hallway Choices */}
              {scene === 'hallway' && goblinAlive && !chestLooted && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <CyberButton
                    id="hallway-sneak-steal-btn"
                    keyNumber="1"
                    title="悄悄潜行盗取宝箱"
                    description={
                      player.has_torch
                        ? '火把照明避开杂音 (70% 成功率)，成功获取 35~60 金币与药水'
                        : '摸黑潜行风险极高 (50% 成功率)，失败将强制惊醒哥布林'
                    }
                    variant="amber"
                    icon={<Sparkles className="w-4 h-4 text-amber-400" />}
                    onClick={handleHallwaySneakSteal}
                  />

                  <CyberButton
                    id="hallway-sneak-attack-btn"
                    keyNumber="2"
                    title="拔出利刃发起偷袭"
                    description="借由阴影近身发起致命突袭，造成 22~30 点额外偷袭爆发伤害"
                    variant="cyan"
                    icon={<Sword className="w-4 h-4 text-cyan-400" />}
                    onClick={handleHallwaySneakAttack}
                  />

                  <CyberButton
                    id="hallway-back-entrance-btn"
                    keyNumber="3"
                    title="原路退回洞穴入口"
                    description="放缓步伐，原路悄悄退回到入口安全地带"
                    variant="pink"
                    icon={<ArrowLeft className="w-4 h-4 text-pink-400" />}
                    onClick={handleHallwayGoBackEntrance}
                  />

                  <CyberButton
                    id="hallway-check-inventory-btn"
                    keyNumber="4"
                    title="查看状态或使用背包道具"
                    description="检视健康状况、随身物资装备并可使用恢复药剂"
                    variant="emerald"
                    icon={<Backpack className="w-4 h-4 text-emerald-400" />}
                    onClick={() => {
                      soundEffects.buttonClick();
                      setIsInventoryOpen(true);
                    }}
                  />
                </div>
              )}

              {/* Hallway Choices (After goblin defeated or chest looted) */}
              {scene === 'hallway' && (!goblinAlive || chestLooted) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <CyberButton
                    id="hallway-exit-dungeon-btn"
                    keyNumber="1"
                    title="穿过石门前往出口"
                    description="推开厚重的远古石门，前往通向地表的出口凯旋撤离"
                    variant="emerald"
                    icon={<DoorOpen className="w-4 h-4 text-emerald-400" />}
                    onClick={handleHallwayExitDungeon}
                  />

                  <CyberButton
                    id="hallway-back-scout-btn"
                    keyNumber="2"
                    title="退回入口打探"
                    description="返回洞穴入口区域复查环境"
                    variant="cyan"
                    icon={<ArrowLeft className="w-4 h-4 text-cyan-400" />}
                    onClick={handleHallwayGoBackEntrance}
                  />

                  <CyberButton
                    id="hallway-check-items-btn"
                    keyNumber="3"
                    title="查看状态或使用背包道具"
                    description="检视健康状况、随身物资装备并可使用恢复药剂"
                    variant="amber"
                    icon={<Backpack className="w-4 h-4 text-amber-400" />}
                    onClick={() => {
                      soundEffects.buttonClick();
                      setIsInventoryOpen(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: COMBAT SYSTEM */}
        {scene === 'combat' && (
          <div className="space-y-4 sm:space-y-6">
            <SceneIllustration
              scene="combat"
              inCombat={true}
              enemyBlinded={combatEnemy.is_blinded}
              hasTorch={player.has_torch}
            />

            {showCombatItemMenu ? (
              <CombatItemMenu
                player={player}
                onUsePotion={handleUsePotion}
                onTorchAttack={handleCombatTorchAttack}
                onCancel={() => setShowCombatItemMenu(false)}
              />
            ) : (
              <CombatArena
                player={player}
                enemy={combatEnemy}
                turnRound={combatRound}
                onAttack={handleCombatAttack}
                onDefend={handleCombatDefend}
                onUseItem={() => setShowCombatItemMenu(true)}
                onFlee={handleCombatFlee}
                isProcessing={isCombatProcessing}
                combatLog={combatLog}
              />
            )}
          </div>
        )}

        {/* VIEW 5, 6, 7: ENDING SCREENS (VICTORY / GAME OVER / RETREAT) */}
        {(scene === 'exit' || scene === 'game_over' || scene === 'retreat') && (
          <EndingScreen
            scene={scene}
            player={player}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        player={player}
        onUsePotion={handleUsePotion}
        inCombat={inCombat}
      />
    </div>
  );
}
