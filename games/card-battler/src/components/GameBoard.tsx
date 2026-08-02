/**
 * @file GameBoard.tsx
 * @description Composes the 4 vertical zones: EnemyArea → BattleField → PlayerHUD → PlayerHand.
 * Lives inside GameLayout's content area. No absolute positioning here — pure flex column.
 */
import React from 'react';
import { EnemyArea } from './EnemyArea';
import { BattleField } from './BattleField';
import { PlayerHUD } from './PlayerHUD';
import { PlayerHand } from './PlayerHand';

export const GameBoard: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col bg-bg-primary overflow-hidden">
      <EnemyArea />
      <BattleField />
      <PlayerHUD />
      <PlayerHand />
    </div>
  );
};
