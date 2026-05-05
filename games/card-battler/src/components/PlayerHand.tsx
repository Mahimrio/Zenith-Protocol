/**
 * @file PlayerHand.tsx
 * @description Renders hand cards with a fan layout.
 */
import React, { useRef } from 'react';
import { CardInstance } from '../types';
import { Card, CardHandle } from './Card';
import { useCardStore } from '../store/cardStore';

export const PlayerHand: React.FC = () => {
  const { playerHand, playerMana, currentTurn, playCard } = useCardStore();
  const cardRefs = useRef<(CardHandle | null)[]>([]);

  const handlePlayCard = async (card: CardInstance, index: number) => {
    if (currentTurn !== 'player' || playerMana < card.cost) {
      const flash = document.createElement('div');
      flash.className = 'fixed inset-0 bg-red-500/20 pointer-events-none z-[100] transition-opacity duration-300';
      document.body.appendChild(flash);
      setTimeout(() => flash.style.opacity = '0', 50);
      setTimeout(() => flash.remove(), 300);
      return;
    }

    const handle = cardRefs.current[index];
    if (handle) {
      await handle.playCard({ x: 0, y: -200 });
    }
    
    try {
      playCard(card.instanceId);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end justify-center perspective-[1000px] z-20">
      {playerHand.map((card, index) => {
        const total = playerHand.length;
        const middle = (total - 1) / 2;
        const rotation = (index - middle) * 8; // degrees
        const yOffset = Math.abs(index - middle) * 10;
        
        return (
          <div 
            key={card.instanceId} 
            className="transition-transform duration-300 ease-out"
            style={{
              transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
              marginLeft: index === 0 ? 0 : '-40px',
              zIndex: index
            }}
          >
            <Card 
              ref={(el) => cardRefs.current[index] = el}
              card={card} 
              location="hand" 
              isPlayable={currentTurn === 'player' && playerMana >= card.cost}
              onClick={() => handlePlayCard(card, index)}
            />
          </div>
        );
      })}
    </div>
  );
};
