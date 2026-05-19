/**
 * @file Card.tsx
 * @description GSAP-powered card component with pointer event support.
 * Touch drag-to-play: pointerdown records Y, pointermove translates upward,
 * pointerup triggers playCard if dragged > 80px.
 */
import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';
import type { CardInstance } from '../types';
import { GlassCard } from '@ui/GlassCard';

export interface CardProps {
  card: CardInstance;
  location: 'hand' | 'board' | 'deck';
  onClick?: () => void;
  isPlayable?: boolean;
  onDragPlay?: () => void;
}

export interface CardHandle {
  playCard: (targetPos: { x: number, y: number }) => Promise<void>;
  attackCard: () => Promise<void>;
  dieCard: () => Promise<void>;
}

export const Card = forwardRef<CardHandle, CardProps>(({ card, location, onClick, isPlayable, onDragPlay }, ref) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);

  useEffect(() => {
    if (location === 'hand' && cardRef.current) {
      gsap.from(cardRef.current, {
        y: 100,
        opacity: 0,
        rotation: -5,
        duration: 0.4,
        ease: "back.out(1.7)",
        clearProps: "all"
      });
    }
  }, [location, card.instanceId]);

  useImperativeHandle(ref, () => ({
    playCard: async (targetPos) => {
      if (!cardRef.current) return;
      return new Promise<void>(resolve => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(cardRef.current, { y: -40, scale: 1.2, duration: 0.2, zIndex: 100 })
          .to(cardRef.current, { x: targetPos.x, y: targetPos.y, duration: 0.3, ease: "power2.inOut" })
          .to(cardRef.current, { scale: 1, duration: 0.2, clearProps: "x,y,zIndex" });
      });
    },
    attackCard: async () => {
      if (!cardRef.current) return;
      return new Promise<void>(resolve => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(cardRef.current, { x: "+=60", duration: 0.15, ease: "power3.out", zIndex: 100 })
          .to(cardRef.current, { x: "-=60", duration: 0.2, ease: "power2.in", clearProps: "zIndex,x" });
      });
    },
    dieCard: async () => {
      if (!cardRef.current) return;
      return new Promise<void>(resolve => {
        gsap.to(cardRef.current, {
          scale: 0, opacity: 0, rotation: 15, duration: 0.35,
          onComplete: resolve
        });
      });
    }
  }));

  const handlePointerEnter = () => {
    if (location === 'hand' && cardRef.current && !isHovered.current) {
      isHovered.current = true;
      gsap.to(cardRef.current, { scale: 1.08, y: -20, duration: 0.2, ease: "power1.out", zIndex: 50 });
    }
  };

  const handlePointerLeave = () => {
    if (location === 'hand' && cardRef.current && isHovered.current) {
      isHovered.current = false;
      gsap.to(cardRef.current, { scale: 1, y: 0, duration: 0.2, ease: "power1.out", clearProps: "zIndex" });
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
      gsap.to(cardRef.current, { y: deltaY, duration: 0.05, ease: "none", zIndex: 100 });
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
      gsap.to(cardRef.current, { y: 0, duration: 0.25, ease: "power2.out", clearProps: "zIndex" });
    }
  };

  const typeColor = card.type === 'attack' ? 'bg-coral-500' : card.type === 'defense' ? 'bg-teal-500' : 'bg-purple-500';
  const typeShadow = card.type === 'attack' ? 'shadow-[0_0_8px_rgba(248,113,113,0.8)]' : card.type === 'defense' ? 'shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'shadow-[0_0_8px_rgba(168,85,247,0.8)]';

  if (card.isFlipped) {
    return (
      <div className="w-[120px] h-[180px] rounded-xl bg-glass border border-border-glass flex items-center justify-center shadow-lg">
        <div className="w-16 h-24 rounded border-2 border-neon-purple opacity-50 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(139,92,246,0.1)_10px,rgba(139,92,246,0.1)_20px)]" />
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={!hasDragged.current ? onClick : undefined}
      className={`w-[120px] h-[180px] cursor-pointer relative origin-bottom select-none touch-none ${isPlayable ? 'ring-2 ring-neon-cyan shadow-[0_0_15px_#00f5ff80] rounded-xl' : ''}`}
    >
      <GlassCard className={`w-full h-full flex flex-col overflow-hidden relative ${card.rarity === 'legendary' ? 'border-neon-amber border-2' : ''}`}>
        <div className={`h-2 w-full flex-shrink-0 ${typeColor} ${typeShadow}`} />

        <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center font-bold text-xs text-black shadow-[0_0_8px_#00f5ff]">
          {card.cost}
        </div>

        <div className="pt-5 px-2 text-center">
          <h4 className="text-sm font-bold text-text-primary leading-tight h-10 flex items-center justify-center">
            {card.name}
          </h4>
          <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-1">
            {card.type}
          </span>
        </div>

        <div className="mt-auto bg-black/40 p-2 flex flex-col items-center justify-center h-16 border-t border-border-glass">
          {card.effect ? (
            <p className="text-[9px] text-center leading-tight text-text-muted mb-1 line-clamp-2">
              {card.effect}
            </p>
          ) : null}
          <div className={`font-mono font-bold text-xl drop-shadow-md ${card.type === 'attack' ? 'text-coral-400' : 'text-teal-400'}`}>
            {card.power}
          </div>
        </div>

        {card.rarity === 'legendary' && (
          <div className="absolute inset-0 border-2 border-transparent rounded-xl pointer-events-none opacity-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.8), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
        )}
      </GlassCard>
      <style>{`
        .bg-coral-500 { background-color: #f87171; }
        .text-coral-400 { color: #f87171; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
});
