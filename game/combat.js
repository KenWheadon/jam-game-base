// Game Template - Base game logic for future games

import { audioManager } from "./audio-manager.js";
import { GameOverScreen } from "./game-over-screen.js";

// Game state
let gameState = {
  gameStartTime: null,
  totalPausedTime: 0,
  lastPauseTime: null,
  isPaused: false,
};

// Game over screen manager
let gameOverScreen = null;

// Track if event listeners have been initialized
let eventListenersInitialized = false;

// Helper function to add both click and touch event listeners
function addTouchAndClickListener(element, handler) {
  let touchHandled = false;

  element.addEventListener("touchstart", () => {
    touchHandled = true;
  });

  element.addEventListener("touchend", (e) => {
    if (touchHandled) {
      e.preventDefault();
      handler(e);
      setTimeout(() => {
        touchHandled = false;
      }, 500);
    }
  });

  element.addEventListener("click", (e) => {
    if (!touchHandled) {
      handler(e);
    }
  });
}

// Cache DOM elements
const elements = {
  pause: document.getElementById("pause"),
  message: document.getElementById("message"),
  winBtn: document.getElementById("win-btn"),
  loseBtn: document.getElementById("lose-btn"),
  pauseOverlay: document.getElementById("pause-overlay"),
  pauseResumeBtn: document.getElementById("pause-resume-btn"),
  pauseQuitBtn: document.getElementById("pause-quit-btn"),
};

// Initialize game
export function initGame() {
  // Reset game state
  gameState = {
    gameStartTime: Date.now(),
    totalPausedTime: 0,
    lastPauseTime: null,
    isPaused: false,
  };

  // Initialize game over screen
  if (!gameOverScreen) {
    gameOverScreen = new GameOverScreen();
    gameOverScreen.onRestart(restartGame);
    gameOverScreen.onMainMenu(quitToMainMenu);
  }

  // Clear any messages
  elements.message.textContent = "";

  // Only initialize event listeners once to prevent duplicates
  if (!eventListenersInitialized) {
    addTouchAndClickListener(elements.pause, () => {
      audioManager.playSoundEffect("btnClick");
      togglePause();
    });

    addTouchAndClickListener(elements.winBtn, () => {
      audioManager.playSoundEffect("btnClick");
      handleWin();
    });

    addTouchAndClickListener(elements.loseBtn, () => {
      audioManager.playSoundEffect("btnClick");
      handleLose();
    });

    // Pause popup buttons
    addTouchAndClickListener(elements.pauseResumeBtn, () => {
      audioManager.playSoundEffect("btnClick");
      togglePause();
    });

    addTouchAndClickListener(elements.pauseQuitBtn, () => {
      audioManager.playSoundEffect("btnClick");
      quitToMainMenu();
    });

    // Add hover sound effects to all buttons
    [
      elements.pause,
      elements.winBtn,
      elements.loseBtn,
      elements.pauseResumeBtn,
      elements.pauseQuitBtn,
    ].forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        audioManager.playSoundEffect("btnHover");
      });
    });

    eventListenersInitialized = true;
  }

  // Start game audio
  audioManager.play("combat");

  // Activate colorful background for game
  document.body.classList.add("combat-active");
}

// Calculate total game time (excluding paused time)
function calculateTotalGameTime() {
  const endTime = Date.now();
  const totalElapsed = endTime - gameState.gameStartTime;
  const activeTime = totalElapsed - gameState.totalPausedTime;
  return activeTime / 1000; // Convert to seconds
}

// Format time for display
function formatTimeForDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${minutes}:${secs.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(2, "0")}`;
}

// Handle Win
function handleWin() {
  const totalGameTime = calculateTotalGameTime();

  elements.message.textContent = "You Win!";
  elements.message.style.color = "#0f0";

  // Play victory sound
  audioManager.playSoundEffect("roboFinalDeath");

  // Show victory screen after a brief delay
  const timeText = formatTimeForDisplay(totalGameTime);
  setTimeout(() => {
    gameOverScreen.showVictory(timeText, false, totalGameTime);
  }, 1000);
}

// Handle Lose
function handleLose() {
  elements.message.textContent = "You Lose!";
  elements.message.style.color = "#f00";

  // Play defeat sound
  audioManager.playSoundEffect("playerDamage");

  // Show defeat screen after a brief delay
  setTimeout(() => {
    gameOverScreen.showDefeat(1);
  }, 1000);
}

// Toggle pause
function togglePause() {
  gameState.isPaused = !gameState.isPaused;

  if (gameState.isPaused) {
    // Track when pause started
    gameState.lastPauseTime = Date.now();
    elements.pauseOverlay.classList.add("show");
  } else {
    // Add paused time to total when resuming
    if (gameState.lastPauseTime) {
      gameState.totalPausedTime += Date.now() - gameState.lastPauseTime;
      gameState.lastPauseTime = null;
    }
    elements.pauseOverlay.classList.remove("show");
  }
}

// Restart game
function restartGame() {
  elements.pauseOverlay.classList.remove("show");

  // Hide game over screens
  if (gameOverScreen) {
    gameOverScreen.hide();
  }

  // Restart game audio
  audioManager.play("combat");

  // Reinitialize game
  initGame();
}

// Quit to main menu
function quitToMainMenu() {
  // Hide game over screens
  if (gameOverScreen) {
    gameOverScreen.hide();
  }

  // Hide pause overlay
  elements.pauseOverlay.classList.remove("show");
  gameState.isPaused = false;
  elements.pause.style.display = "none";

  // Hide game elements and show title screen
  document.getElementById("game").style.display = "none";
  const titleScreen = document.getElementById("title-screen");
  titleScreen.style.display = "block";

  // Re-import and re-initialize the title screen to reset its state
  import("./title-screen.js").then((titleScreenModule) => {
    titleScreenModule.resetTitleScreen();
    titleScreenModule.initTitleScreen();
  });

  // Ensure game music stops and title music starts
  audioManager.play("titleIntro");
}
