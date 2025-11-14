// Game Configuration - Base configuration for future games

// Game constants - can be customized for your specific game
export const GAME_CONFIG = {
  // Add your game-specific constants here
  MAX_HEARTS: 3,

  // Timings (in milliseconds)
  FEEDBACK_DURATION: 1000,
  STATE_TRANSITION_DELAY: 500,
};

// Default game state - customize based on your game needs
export function createInitialGameState() {
  return {
    gameStartTime: null,
    totalPausedTime: 0,
    lastPauseTime: null,
    isPaused: false,
    // Add additional game state properties here
  };
}
