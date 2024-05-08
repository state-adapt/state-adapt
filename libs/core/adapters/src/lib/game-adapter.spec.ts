import { createAdapter, joinAdapters } from '@state-adapt/core';
import { stringAdapter } from './string.adapter';
import {
  EntityState,
  createEntityAdapter,
  createEntityState,
} from './create-entity-adapter.function';
import { numberAdapter } from './number.adapter';

type Pin = any;

export const pointsAdapter = createAdapter<number>()({
  update: (score, fallenPins: Pin[]) =>
    fallenPins.length === 1 ? fallenPins[0] : fallenPins.length,
});

export const missesStreakAdapter = createAdapter<number>()({
  update: (streak, fallenPins: Pin[]) => (fallenPins.length > 0 ? 0 : streak + 1),
});

type Score = {
  currentMissesStreak: number;
  points: number;
};

const emptyScore: Readonly<Score> = Object.freeze({
  currentMissesStreak: 0,
  points: 0,
});

export const scoreAdapter = joinAdapters<Score>()({
  currentMissesStreak: missesStreakAdapter,
  points: pointsAdapter,
})({
  addFallenPins: {
    points: pointsAdapter.update,
    currentMissesStreak: missesStreakAdapter.update,
  },
})();

//

type Player = {
  id: string;
  name: string;
  score: Score;
};

export const playerAdapter = joinAdapters<Player>()({
  id: createAdapter<string>()({}),
  name: stringAdapter,
  score: scoreAdapter,
})({
  hasWon: (state: Player) => state.score.points === 50,
})();

type PlayerId = 'id';

export const playerEntityAdapter = createEntityAdapter<Player, PlayerId>()(
  playerAdapter,
  { filters: ['hasWon'] },
);

//

type GameState = {
  players: EntityState<Player, PlayerId>;
  currentPlayerIndex: number;
};

export const initialState: Readonly<GameState> = {
  players: createEntityState<Player, PlayerId, GameState['players']>(),
  currentPlayerIndex: 0,
};

export const gameAdapter = joinAdapters<GameState>()({
  players: playerEntityAdapter,
  currentPlayerIndex: numberAdapter,
})({
  nextPlayerIndex: s => (s.currentPlayerIndex + 1) % s.playersAll.length,
  currentPlayer: s => s.playersAll[s.currentPlayerIndex],
  winner: (s): Player | null => s.playersHasWon[0] || null,
})();

describe('BowlingAdapter', () => {
  it('should work', () => {
    const state = gameAdapter.setPlayersAll(
      initialState,
      [
        { id: '1', name: 'John', score: emptyScore },
        { id: '2', name: 'Jane', score: emptyScore },
      ],
      initialState,
    );

    const fallenPins = [1, 3, 4];
    const newState = gameAdapter.addPlayersOneScoreFallenPins(
      state,
      ['1', fallenPins],
      initialState,
    );

    expect(newState.players.entities['1'].score.points).toBe(3);
  });
});
