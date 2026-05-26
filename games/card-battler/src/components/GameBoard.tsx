/**
 * @file GameBoard.tsx
 * @description Renders player and enemy board zones.
 */
import React from 'react';
import { useCardStore } from '../store/cardStore';
import { Card } from './Card';
import { HealthBar } from '@ui/HealthBar';
import { NeonButton } from '@ui/NeonButton';
import { ManaBar } from './ManaBar';

export const GameBoard: React.FC = () => {
  const { 
    playerBoard, enemyBoard, 
    playerHp, enemyHp, 
    playerMana, playerMaxMana,
    currentTurn, endTurn,
    enemyHand, spectatorMode
  } = useCardStore();

  return (
    <div className="w-full h-full flex flex-col pt-4">
      {/* Enemy Hand (Spectator Reveal Zone) */}
      <div className="w-full flex justify-center gap-2 px-8 py-2 min-h-[90px] border-b border-border-glass bg-black/20 z-30">
        {enemyHand.map(card => {
          const cardToShow = spectatorMode ? { ...card, isFlipped: false } : card;
          return (
            <div key={card.instanceId} className="transform scale-75 origin-top transition-all duration-300">
              <Card card={cardToShow} location="hand" />
            </div>
          );
        })}
      </div>

      {/* Enemy Zone */}
      <div className="flex-1 flex flex-col justify-center items-center relative">
        <div className="absolute top-4 w-72">
          <HealthBar current={enemyHp} max={30} label="ENEMY HULL INTEGRITY" color="#ef4444" />
        </div>
        <div className="flex gap-4 min-h-[180px] w-full justify-center px-8 flex-wrap">
          {enemyBoard.map(card => (
            <Card key={card.instanceId} card={card} location="board" />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-neon-amber shadow-[0_0_8px_#f59e0b] opacity-50 my-2" />

      {/* Player Zone */}
      <div className="flex-1 flex flex-col justify-center items-center relative pb-32">
        <div className="flex gap-4 min-h-[180px] w-full justify-center px-8 flex-wrap">
          {playerBoard.map(card => (
            <Card key={card.instanceId} card={card} location="board" />
          ))}
        </div>
        
        <div className="absolute bottom-32 left-8 w-72">
          <HealthBar current={playerHp} max={30} label="PLAYER HULL INTEGRITY" color="#00f5ff" />
        </div>

        <div className="absolute bottom-32 right-8 flex flex-col items-end gap-6">
           <ManaBar current={playerMana} max={playerMaxMana} />
           <NeonButton 
             variant={currentTurn === 'player' && !spectatorMode ? 'primary' : 'ghost'} 
             onClick={endTurn}
             disabled={currentTurn !== 'player' || spectatorMode}
             className="w-full tracking-widest uppercase font-bold"
           >
             END TURN
           </NeonButton>
        </div>
      </div>
    </div>
  );
};
