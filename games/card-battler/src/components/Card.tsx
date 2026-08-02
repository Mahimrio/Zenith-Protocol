/**
 * @file Card.tsx
 * @description Card component with full anatomy: cost gem, type icon, name, art block, description, rarity border.
 * Supports rarity-driven glow, Legendary animated shimmer, legendary gold particles, pointer-event drag-to-play.
 * Mount-time animation driven by `playAnimation` field: slideIn (player play) / flipIn (enemy play).
 */
import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';
import type { CardInstance, CardType, CardRarity } from '../types';
import { GlassCard } from '@ui/GlassCard';
import { LegendaryParticles } from './LegendaryParticles';

export interface CardProps {
  card: CardInstance;
  location: 'hand' | 'board' | 'deck';
  onClick?: () => void;
  isPlayable?: boolean;
  onDragPlay?: () => void;
}

export interface CardHandle {
  playCard: (targetPos: { x: number; y: number }) => Promise<void>;
  attackCard: () => Promise<void>;
  dieCard: () => Promise<void>;
  takeDamage: () => Promise<void>;
}

const TYPE_ICONS: Record<CardType, string> = {
  attack: '⚔',
  defense: '🛡',
  spell: '✦',
  utility: '◈',
};

const TYPE_LABELS: Record<CardType, string> = {
  attack: 'Attack',
  defense: 'Defense',
  spell: 'Spell',
  utility: 'Utility',
};

const TYPE_COLORS: Record<CardType, string> = {
  attack: '#ef4444',
  defense: '#3b82f6',
  spell: '#a855f7',
  utility: '#10b981',
};

const RARITY_BORDER: Record<CardRarity, string> = {
  common: 'rarity-common',
  rare: 'rarity-rare',
  epic: 'rarity-epic',
  legendary: 'rarity-legendary',
};

const SIZE_CLASSES = 'w-[88px] h-[132px] sm:w-[100px] sm:h-[150px] md:w-[120px] md:h-[180px]';

export const Card = forwardRef<CardHandle, CardProps>(({ card, location, onClick, isPlayable, onDragPlay }, ref) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);

  useEffect(() => {
    if (!cardRef.current) return;

    // Hand mount: slide up from below
    if (location === 'hand') {
      gsap.from(cardRef.current, {
        y: 80,
        opacity: 0,
        rotation: -8,
        duration: 0.45,
        ease: 'back.out(1.7)',
        clearProps: 'all',
      });
      return;
    }

    // Board mount — animation depends on playAnimation field
    if (location === 'board') {
      if (card.playAnimation === 'slideIn') {
        // Player play: slide down from above with bounce
        gsap.fromTo(
          cardRef.current,
          { y: -80, opacity: 0, scale: 0.6, rotationZ: -10 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotationZ: 0,
            duration: 0.55,
            ease: 'back.out(1.4)',
            clearProps: 'transform',
          }
        );
      } else if (card.playAnimation === 'flipIn' || card.isFlipped) {
        // Enemy play: rotateY from 180 (face-down) to 0 (face-up)
        gsap.fromTo(
          cardRef.current,
          { rotationY: 180, opacity: 0, scale: 0.8 },
          {
            rotationY: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            clearProps: 'transform',
          }
        );
      } else {
        // Default board mount: subtle fade-in
        gsap.from(cardRef.current, {
          opacity: 0,
          scale: 0.9,
          duration: 0.3,
          ease: 'power2.out',
          clearProps: 'all',
        });
      }
    }
  }, [location, card.instanceId]);

  useImperativeHandle(ref, () => ({
    playCard: async (targetPos) => {
      if (!cardRef.current) return;
      return new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(cardRef.current, { y: -40, scale: 1.2, duration: 0.2, zIndex: 100 })
          .to(cardRef.current, { x: targetPos.x, y: targetPos.y, duration: 0.3, ease: 'power2.inOut' })
          .to(cardRef.current, { scale: 1, duration: 0.2, clearProps: 'x,y,zIndex' });
      });
    },
    attackCard: async () => {
      if (!cardRef.current) return;
      return new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(cardRef.current, { x: '+=60', duration: 0.15, ease: 'power3.out', zIndex: 100 })
          .to(cardRef.current, { x: '-=60', duration: 0.2, ease: 'power2.in', clearProps: 'zIndex,x' });
      });
    },
    dieCard: async () => {
      if (!cardRef.current) return;
      return new Promise<void>((resolve) => {
        gsap.to(cardRef.current, {
          scale: 0,
          opacity: 0,
          rotation: 90,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: resolve,
        });
      });
    },
    takeDamage: async () => {
      if (!cardRef.current) return;
      return new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(cardRef.current, { x: -6, duration: 0.05 })
          .to(cardRef.current, { x: 6, duration: 0.05 })
          .to(cardRef.current, { x: -4, duration: 0.05 })
          .to(cardRef.current, { x: 0, duration: 0.05 });
        gsap.fromTo(
          cardRef.current,
          { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
          {
            boxShadow: '0 0 18px 4px rgba(239,68,68,0.7)',
            duration: 0.1,
            yoyo: true,
            repeat: 1,
          }
        );
      });
    },
  }));

  const handlePointerEnter = () => {
    if (location === 'hand' && cardRef.current && !isHovered.current) {
      isHovered.current = true;
      gsap.to(cardRef.current, { scale: 1.12, y: -28, duration: 0.2, ease: 'power2.out', zIndex: 50 });
    }
  };

  const handlePointerLeave = () => {
    if (location === 'hand' && cardRef.current && isHovered.current) {
      isHovered.current = false;
      gsap.to(cardRef.current, { scale: 1, y: 0, duration: 0.2, ease: 'power2.out', clearProps: 'zIndex' });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (location !== 'hand') return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
    isDragging.current = true;
    hasDragged.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    const deltaY = e.clientY - dragStartY.current;
    if (deltaY < -40) {
      hasDragged.current = true;
      gsap.to(cardRef.current, { y: deltaY, duration: 0.05, ease: 'none', zIndex: 100 });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (hasDragged.current && cardRef.current) {
      const deltaY = e.clientY - dragStartY.current;
      if (deltaY < -80) {
        onDragPlay?.();
        return;
      }
      gsap.to(cardRef.current, { y: 0, duration: 0.25, ease: 'power2.out', clearProps: 'zIndex' });
    }
  };

  // Flipped (face-down) state
  if (card.isFlipped) {
    return (
      <div className={`${SIZE_CLASSES} rounded-xl bg-glass border-2 border-neon-purple/50 flex items-center justify-center shadow-lg select-none`}>
        <div
          className="w-16 h-24 rounded border-2 border-neon-purple/50"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139,92,246,0.15) 10px, rgba(139,92,246,0.15) 20px)',
          }}
        />
      </div>
    );
  }

  const typeColor = TYPE_COLORS[card.type];
  const rarityClass = RARITY_BORDER[card.rarity];
  const isLegendary = card.rarity === 'legendary';
  const showPower = card.type !== 'spell' && card.type !== 'utility' && card.power > 0;

  return (
    <div
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={!hasDragged.current ? onClick : undefined}
      className={`${SIZE_CLASSES} cursor-pointer relative origin-bottom select-none touch-none ${
        isPlayable ? 'ring-2 ring-neon-cyan' : ''
      }`}
      style={{
        filter: isPlayable
          ? `drop-shadow(0 0 8px ${typeColor})`
          : location === 'hand' ? 'grayscale(0.3) brightness(0.85)' : 'none',
      }}
    >
      <GlassCard
        className={`w-full h-full flex flex-col overflow-hidden relative border-2 ${rarityClass} ${
          isLegendary ? 'legendary-shimmer' : ''
        }`}
      >
        {/* Type-color top bar */}
        <div
          className="h-1.5 w-full flex-shrink-0"
          style={{
            backgroundColor: typeColor,
            boxShadow: `0 0 6px ${typeColor}, 0 0 12px ${typeColor}80`,
          }}
        />

        {/* Cost gem + type icon row */}
        <div className="flex items-start justify-between px-1.5 pt-1.5">
          <div
            className="w-7 h-7 rounded-full bg-bg-primary border-2 flex items-center justify-center font-black text-sm"
            style={{
              borderColor: typeColor,
              color: typeColor,
              boxShadow: `0 0 6px ${typeColor}, inset 0 0 4px rgba(255,255,255,0.2)`,
            }}
          >
            {card.cost}
          </div>
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-base"
            style={{
              backgroundColor: `${typeColor}20`,
              color: typeColor,
              border: `1px solid ${typeColor}80`,
            }}
            title={TYPE_LABELS[card.type]}
          >
            {TYPE_ICONS[card.type]}
          </div>
        </div>

        {/* Name */}
        <div className="px-2 pt-1.5 pb-1 text-center">
          <h4 className="text-[11px] sm:text-xs font-black text-text-primary leading-tight uppercase tracking-wider line-clamp-2 min-h-[28px] flex items-center justify-center">
            {card.name}
          </h4>
          <span
            className="text-[8px] uppercase tracking-widest font-mono block mt-0.5"
            style={{ color: typeColor }}
          >
            {TYPE_LABELS[card.type]}
          </span>
        </div>

        {/* Art block (placeholder gradient) */}
        <div className="flex-1 mx-1.5 my-1 rounded-md flex items-center justify-center relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at center, ${typeColor}30 0%, transparent 70%), linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.4) 100%)`,
            border: `1px solid ${typeColor}40`,
          }}
        >
          <span
            className="text-4xl sm:text-5xl opacity-70"
            style={{
              color: typeColor,
              filter: `drop-shadow(0 0 8px ${typeColor})`,
            }}
            aria-hidden
          >
            {TYPE_ICONS[card.type]}
          </span>
        </div>

        {/* Effect + Power */}
        <div className="bg-black/50 px-1.5 py-1.5 border-t border-border-glass flex flex-col items-center gap-0.5">
          {card.effect && (
            <p className="text-[8px] text-center leading-tight text-text-muted line-clamp-2 min-h-[18px]">
              {card.effect}
            </p>
          )}
          {showPower && (
            <div
              className="font-black text-lg font-mono"
              style={{
                color: card.type === 'attack' ? '#f87171' : '#60a5fa',
                textShadow: `0 0 6px ${typeColor}`,
              }}
            >
              {card.power}
            </div>
          )}
        </div>

        {/* Rarity tag at bottom */}
        <div
          className="text-[7px] font-mono uppercase tracking-widest text-center py-0.5 border-t"
          style={{
            color: card.rarity === 'legendary' ? '#f59e0b' : card.rarity === 'epic' ? '#a78bfa' : card.rarity === 'rare' ? '#60a5fa' : '#9ca3af',
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          {card.rarity}
        </div>

        {/* Legendary floating gold sparks (canvas overlay) */}
        {isLegendary && <LegendaryParticles />}
      </GlassCard>
    </div>
  );
});
