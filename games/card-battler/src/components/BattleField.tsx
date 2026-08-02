/**
 * @file BattleField.tsx
 * @description Center zone — neon grid background, two board rows (enemy + player) divided by a glowing line.
 * Player board slots glow with `drop-zone-active` when a draggable player card is being held.
 */
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useCardStore } from '../store/cardStore';
import { Card } from './Card';
import type { CardInstance } from '../types';

const MAX_BOARD_SLOTS = 5;

interface BoardRowProps {
  cards: CardInstance[];
  side: 'player' | 'enemy';
  isPlayerTurn: boolean;
  isDropTarget: boolean;
}

const BoardRow: React.FC<BoardRowProps> = ({ cards, side, isPlayerTurn, isDropTarget }) => {
  const slots = Array.from({ length: MAX_BOARD_SLOTS });
  return (
    <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 px-2 sm:px-4 min-h-0">
      {slots.map((_, i) => {
        const card = cards[i];
        const isEmpty = !card;
        const isPlayerEmpty = isEmpty && side === 'player';
        const isHoverable = isPlayerEmpty && isPlayerTurn;
        return (
          <div
            key={i}
            className={`w-[80px] h-[120px] sm:w-[92px] sm:h-[138px] md:w-[108px] md:h-[162px] rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
              isDropTarget && isPlayerEmpty
                ? 'drop-zone-active border-solid'
                : isEmpty
                  ? `border-dashed border-border-glass/40 ${isHoverable ? 'hover:border-neon-cyan/40 hover:bg-neon-cyan/5' : ''}`
                  : 'border-transparent'
            }`}
          >
            {card ? (
              <Card card={card} location="board" />
            ) : (
              <span className={`text-[10px] font-mono transition-colors ${
                isDropTarget && isPlayerEmpty ? 'text-neon-cyan' : 'text-text-muted/30'
              }`}>
                {isDropTarget && isPlayerEmpty ? '▼' : i + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const BattleField: React.FC = () => {
  const { enemyBoard, playerBoard, currentTurn, playerHand, draggedCardId } = useCardStore();
  const dividerRef = useRef<HTMLDivElement>(null);

  // Determine if the currently-dragged card is a valid drop target (non-spell, non-utility, playable type)
  const draggedCard = draggedCardId
    ? playerHand.find((c) => c.instanceId === draggedCardId) ?? null
    : null;
  const isValidDrop = !!draggedCard && draggedCard.type !== 'spell' && draggedCard.type !== 'utility';

  useEffect(() => {
    if (dividerRef.current) {
      gsap.fromTo(
        dividerRef.current,
        { opacity: 0.3, scaleX: 0.5 },
        {
          opacity: 0.7,
          scaleX: 1,
          duration: 1.2,
          ease: 'power2.out',
          yoyo: true,
          repeat: -1,
        }
      );
    }
  }, []);

  return (
    <div className="relative w-full flex-1 min-h-0 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 battlefield-grid" />
      {/* Vignette */}
      <div className="absolute inset-0 battlefield-vignette pointer-events-none" />

      {/* Boards */}
      <div className="relative w-full h-full flex flex-col">
        <BoardRow
          cards={enemyBoard}
          side="enemy"
          isPlayerTurn={currentTurn === 'player'}
          isDropTarget={false}
        />

        {/* Glowing divider */}
        <div className="relative h-px mx-8 my-1">
          <div
            ref={dividerRef}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-amber to-transparent shadow-[0_0_12px_#f59e0b]"
          />
        </div>

        <BoardRow
          cards={playerBoard}
          side="player"
          isPlayerTurn={currentTurn === 'player'}
          isDropTarget={isValidDrop && currentTurn === 'player'}
        />
      </div>
    </div>
  );
};
