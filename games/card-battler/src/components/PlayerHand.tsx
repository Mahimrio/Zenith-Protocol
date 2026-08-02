/**
 * @file PlayerHand.tsx
 * @description Player's hand of cards. Desktop: fan arc. Mobile: horizontal scroll.
 * Lives at the bottom of the GameLayout — never absolute-positioned into the void.
 */
import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import type { CardInstance } from '../types';
import type { CardHandle } from './Card';
import { Card } from './Card';
import { useCardStore } from '../store/cardStore';
import { useIsMobile } from '@sdk/utils/device';

export const PlayerHand: React.FC = () => {
  const { playerHand, playerMana, currentTurn, playCard, spectatorMode, setDraggedCard } = useCardStore();
  const isMobile = useIsMobile();
  const cardRefs = useRef<(CardHandle | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);
  const hasInteracted = useRef(false);

  useEffect(() => {
    if (!isMobile || !scrollRef.current || hasInteracted.current) return;
    setShowArrows(true);
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        gsap.to(scrollRef.current.querySelectorAll('.scroll-arrow'), {
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
        });
      }
      setShowArrows(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isMobile, playerHand.length]);

  const handleInteraction = () => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      setShowArrows(false);
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 140;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const handlePlayCard = async (card: CardInstance, index: number) => {
    if (spectatorMode || currentTurn !== 'player' || playerMana < card.cost) {
      if (!spectatorMode) {
        const flash = document.createElement('div');
        flash.className = 'fixed inset-0 bg-red-500/20 pointer-events-none z-[100] transition-opacity duration-300';
        document.body.appendChild(flash);
        setTimeout(() => (flash.style.opacity = '0'), 50);
        setTimeout(() => flash.remove(), 300);
      }
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

  const handleDragPlay = async (card: CardInstance, index: number) => {
    if (spectatorMode || currentTurn !== 'player' || playerMana < card.cost) return;
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

  /* ── Mobile: horizontal scroll row ────────────────────────── */
  if (isMobile) {
    return (
      <div className="w-full px-3 pb-2 pt-1 bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent z-10">
        {showArrows && playerHand.length > 3 && (
          <>
            <button
              className="scroll-arrow absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-glass border border-border-glass flex items-center justify-center text-neon-cyan"
              onClick={() => scroll('left')}
            >
              ‹
            </button>
            <button
              className="scroll-arrow absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-glass border border-border-glass flex items-center justify-center text-neon-cyan"
              onClick={() => scroll('right')}
            >
              ›
            </button>
          </>
        )}
        <div
          ref={scrollRef}
          onScroll={handleInteraction}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {playerHand.map((card, index) => (
            <div
              key={card.instanceId}
              className="snap-center flex-shrink-0"
              onPointerDown={() => setDraggedCard(card.instanceId)}
              onPointerUp={() => setDraggedCard(null)}
              onPointerCancel={() => setDraggedCard(null)}
            >
              <Card
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                card={card}
                location="hand"
                isPlayable={!spectatorMode && currentTurn === 'player' && playerMana >= card.cost}
                onClick={() => handlePlayCard(card, index)}
                onDragPlay={() => handleDragPlay(card, index)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Desktop: fan layout ──────────────────────────────────── */
  return (
    <div className="w-full flex items-end justify-center perspective-[1200px] py-2 pb-3 z-10">
      <div className="relative flex items-end justify-center min-h-[180px]">
        {playerHand.map((card, index) => {
          const total = playerHand.length;
          const middle = (total - 1) / 2;
          const rotation = (index - middle) * 6;
          const yOffset = Math.abs(index - middle) * 6;
          const xOffset = (index - middle) * 70;

          return (
            <div
              key={card.instanceId}
              className="absolute transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${rotation}deg)`,
                zIndex: index,
                transformOrigin: 'bottom center',
              }}
              onPointerDown={() => setDraggedCard(card.instanceId)}
              onPointerUp={() => setDraggedCard(null)}
              onPointerCancel={() => setDraggedCard(null)}
              onPointerLeave={() => setDraggedCard(null)}
            >
              <Card
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                card={card}
                location="hand"
                isPlayable={!spectatorMode && currentTurn === 'player' && playerMana >= card.cost}
                onClick={() => handlePlayCard(card, index)}
                onDragPlay={() => handleDragPlay(card, index)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
