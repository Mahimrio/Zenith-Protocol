/**
 * @file cardStore.ts
 * @description Zustand store for Card Battler state.
 * Integrates playSfx for draw, play, attack, victory, and defeat sounds.
 */
import { create } from 'zustand';
import type { CardDefinition, CardInstance } from '../types';
import { allCards, getRandomDeck } from '../cardDatabase';
import { GameStatus } from '@sdk/types';
import { playSfx } from '@sdk/store/soundStore';

interface CardState {
  allCards: CardDefinition[];
  playerDeck: CardInstance[];
  playerHand: CardInstance[];
  playerBoard: CardInstance[];
  playerHp: number;
  playerMana: number;
  playerMaxMana: number;
  
  enemyDeck: CardInstance[];
  enemyHand: CardInstance[];
  enemyBoard: CardInstance[];
  enemyHp: number;
  enemyMana: number;
  enemyMaxMana: number;
  
  currentTurn: 'player' | 'enemy';
  turnNumber: number;
  gameStatus: GameStatus;
  
  score: number;
  cardsPlayed: number;
  turnsSurvived: number;

  startGame: () => void;
  drawCard: (target?: 'player' | 'enemy', amount?: number) => void;
  playCard: (instanceId: string, targetId?: string) => boolean;
  endTurn: () => void;
  enemyTakeTurn: () => void;
  takeDamage: (target: 'player' | 'enemy', amount: number) => void;
  cleanup: () => void;
}

const generateInstances = (deck: CardDefinition[]): CardInstance[] => 
  deck.map(c => ({ ...c, instanceId: Math.random().toString(36).slice(2, 11) }));

let turnTimeout: ReturnType<typeof setTimeout> | null = null;

export const useCardStore = create<CardState>((set, get) => ({
  allCards,
  playerDeck: [],
  playerHand: [],
  playerBoard: [],
  playerHp: 30,
  playerMana: 1,
  playerMaxMana: 1,
  
  enemyDeck: [],
  enemyHand: [],
  enemyBoard: [],
  enemyHp: 30,
  enemyMana: 1,
  enemyMaxMana: 1,
  
  currentTurn: 'player',
  turnNumber: 1,
  gameStatus: GameStatus.IDLE,

  score: 0,
  cardsPlayed: 0,
  turnsSurvived: 0,

  startGame: () => {
    set({
      gameStatus: GameStatus.PLAYING,
      playerDeck: generateInstances(getRandomDeck(30)),
      playerHand: [],
      playerBoard: [],
      playerHp: 30,
      playerMana: 1,
      playerMaxMana: 1,
      
      enemyDeck: generateInstances(getRandomDeck(30)),
      enemyHand: [],
      enemyBoard: [],
      enemyHp: 30,
      
      currentTurn: 'player',
      turnNumber: 1,
      score: 0,
      cardsPlayed: 0,
      turnsSurvived: 0
    });
    get().drawCard('player', 4);
    get().drawCard('enemy', 4);
  },

  drawCard: (target = 'player', amount = 1) => set(state => {
    const isPlayer = target === 'player';
    const deck = isPlayer ? state.playerDeck : state.enemyDeck;
    const hand = isPlayer ? state.playerHand : state.enemyHand;
    
    if (deck.length === 0) return state;
    
    const drawn = deck.slice(0, amount);
    const remainingDeck = deck.slice(amount);
    const newHand = [...hand, ...drawn].slice(0, 7);

    // SFX: card draw sound for player draws
    if (isPlayer) playSfx('/sounds/card/draw.mp3');
    
    if (isPlayer) {
      return { playerDeck: remainingDeck, playerHand: newHand };
    } else {
      return { enemyDeck: remainingDeck, enemyHand: newHand.map(c => ({ ...c, isFlipped: true })) };
    }
  }),

  playCard: (instanceId, _targetId) => {
    const state = get();
    if (state.currentTurn !== 'player') return false;
    
    const cardIndex = state.playerHand.findIndex(c => c.instanceId === instanceId);
    if (cardIndex === -1) return false;
    const card = state.playerHand[cardIndex];
    
    if (state.playerMana < card.cost) {
      return false;
    }

    // SFX: card play sound
    playSfx('/sounds/card/play.mp3');
    
    set(s => {
      const newHand = [...s.playerHand];
      newHand.splice(cardIndex, 1);
      
      let newBoard = [...s.playerBoard];
      if (card.type !== 'spell' && newBoard.length < 5) {
        newBoard.push(card);
      }
      
      return {
        playerHand: newHand,
        playerBoard: newBoard,
        playerMana: s.playerMana - card.cost,
        cardsPlayed: s.cardsPlayed + 1,
        score: s.score + card.cost * 10
      };
    });

    if (card.type === 'attack' || card.type === 'spell') {
       playSfx('/sounds/card/attack.mp3');
       get().takeDamage('enemy', card.power);
    }
    return true;
  },

  endTurn: () => {
    const state = get();
    if (state.currentTurn !== 'player') return;

    if (turnTimeout) clearTimeout(turnTimeout);

    set(s => ({
      currentTurn: 'enemy',
      enemyMaxMana: Math.min(10, s.enemyMaxMana + 1),
      enemyMana: Math.min(10, s.enemyMaxMana + 1),
      turnsSurvived: s.turnsSurvived + 1
    }));
    
    turnTimeout = setTimeout(() => {
      get().enemyTakeTurn();
    }, 1500);
  },

  enemyTakeTurn: () => {
    set(s => ({ currentTurn: 'enemy', enemyHand: s.enemyHand.map(c => ({...c, isFlipped: false})) }));
    
    const affordable = get().enemyHand.filter(c => c.cost <= get().enemyMaxMana);
    if (affordable.length > 0) {
      affordable.sort((a, b) => b.cost - a.cost);
      const toPlay = affordable[0];
      
      set(s => {
        const newHand = s.enemyHand.filter(c => c.instanceId !== toPlay.instanceId);
        const newBoard = s.enemyBoard.length < 5 && toPlay.type !== 'spell' 
          ? [...s.enemyBoard, toPlay] 
          : s.enemyBoard;
        
        return { 
          enemyHand: newHand, 
          enemyBoard: newBoard,
          enemyMana: s.enemyMana - toPlay.cost 
        };
      });
      
      if (toPlay.type === 'attack' || toPlay.type === 'spell') {
         playSfx('/sounds/card/attack.mp3');
         get().takeDamage('player', toPlay.power);
      }
    }
    
    if (turnTimeout) clearTimeout(turnTimeout);
    turnTimeout = setTimeout(() => {
      set(s => ({
        currentTurn: 'player',
        playerMaxMana: Math.min(10, s.playerMaxMana + 1),
        playerMana: Math.min(10, s.playerMaxMana + 1),
        turnNumber: s.turnNumber + 1
      }));
      get().drawCard('player', 1);
      get().drawCard('enemy', 1);
    }, 2000);
  },

  takeDamage: (target, amount) => {
    set(s => {
      if (target === 'player') {
        const hp = Math.max(0, s.playerHp - amount);
        return { playerHp: hp, gameStatus: hp === 0 ? GameStatus.GAME_OVER : s.gameStatus };
      } else {
        const hp = Math.max(0, s.enemyHp - amount);
        return { enemyHp: hp, gameStatus: hp === 0 ? GameStatus.GAME_OVER : s.gameStatus };
      }
    });

    // SFX: victory/defeat on GAME_OVER
    const afterState = get();
    if (afterState.gameStatus === GameStatus.GAME_OVER) {
      if (target === 'enemy') {
        playSfx('/sounds/card/victory.mp3');
      } else {
        playSfx('/sounds/card/defeat.mp3');
      }
    }
  },

  cleanup: () => {
    if (turnTimeout) {
      clearTimeout(turnTimeout);
      turnTimeout = null;
    }
  }
}));
