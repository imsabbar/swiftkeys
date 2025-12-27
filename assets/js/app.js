/**
 * SwiftKeys - Professional Typing Trainer
 * Copyright (c) 2025 imsabbar
 * Licensed under MIT License
 */

/** Application State Configuration */
let currentTest = {
  type: 'time',
  value: 60,
  punctuation: false,
  numbers: false,
  text: '',
  startTime: null,
  endTime: null,
  isActive: false,
  isFinished: false,
  currentIndex: 0,
  errors: [],
  wpmHistory: [],
  rawWpmHistory: []
};

let typingStats = {
  correctChars: 0,
  incorrectChars: 0,
  totalChars: 0,
  keystrokes: 0,
  wpm: 0,
  rawWpm: 0,
  accuracy: 100,
  consistency: 100,
  timeElapsed: 0
};

let elements = {};
let testWords = [];
let updateInterval = null;
let originalMainHTML = ''; // Store original HTML structure
let customTextBuffer = '';

// Managers
let missionManager = null;
let soundManager = null;
let virtualKeyboard = null;

// Boot application
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize Core Services
    missionManager = new MissionManager();
    soundManager = new SoundManager();
    
    // Setup UI & Bindings
    initializeElements();
    originalMainHTML = elements.mainContainer.innerHTML;
    
    setupEventListeners();
    setupKeyboardShortcuts();
    
    // Start Application
    generateTest();
    focusTypingArea();
    
    // User Session
    const user = getCurrentUser();
    updateSignInButton(user);
    
  } catch (error) {
    console.error('Initialization failed:', error);
  }
});

function initializeElements() {
  elements = {
    mainContainer: document.getElementById('main-container'),
    testConfig: document.getElementById('test-config'),
    typingArea: document.getElementById('typing-area'),
    resultsArea: document.getElementById('results-area'),
    configBtns: document.querySelectorAll('.config-btn'),
    valueBtns: document.querySelectorAll('.value-btn'),
    signInBtn: document.getElementById('sign-in-btn')
  };

  // Initialize Virtual Keyboard
  if (typeof VirtualKeyboard !== 'undefined') {
    virtualKeyboard = new VirtualKeyboard('virtual-keyboard');
  }
}

function setupEventListeners() {
  setupConfigEventListeners();

  // Navigation
  const navTest = document.getElementById('nav-test');
  const navMissions = document.getElementById('nav-missions');
  const navLeaderboard = document.getElementById('nav-leaderboard');
  const navAccount = document.getElementById('nav-account');
  const navSettings = document.getElementById('nav-settings');
  
  if (navTest) navTest.addEventListener('click', () => showTest());
  if (navMissions) navMissions.addEventListener('click', () => showMissions());
  if (navLeaderboard) navLeaderboard.addEventListener('click', () => showLeaderboard());
  if (navAccount) navAccount.addEventListener('click', () => showAccount());
  if (navSettings) navSettings.addEventListener('click', () => showSettings());
  
  // Sound Toggle
  const navSound = document.getElementById('nav-sound');
  if (navSound) {
    navSound.addEventListener('click', () => {
      const enabled = soundManager.toggle();
      if (enabled) {
        navSound.style.color = 'var(--accent-primary)';
        // Optional: Play a sound to confirm
        soundManager.playClick();
      } else {
        navSound.style.color = '';
      }
    });
  }

  // Keyboard Toggle
  const navKeyboard = document.getElementById('nav-keyboard');
  if (navKeyboard) {
    navKeyboard.addEventListener('click', () => {
      const keyboard = document.getElementById('virtual-keyboard');
      if (keyboard) {
        keyboard.classList.toggle('hidden');
        const isVisible = !keyboard.classList.contains('hidden');
        if (isVisible) {
          navKeyboard.style.color = 'var(--accent-primary)';
        } else {
          navKeyboard.style.color = '';
        }
      }
    });
  }
  
  // Sign in button
  if (elements.signInBtn) {
    elements.signInBtn.addEventListener('click', () => handleSignIn());
  }
}

function setupConfigEventListeners() {
  // Config buttons
  elements.configBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Handle Language Buttons
      if (btn.parentElement.parentElement.id === 'language-config') {
        const langBtns = document.querySelectorAll('#language-config .config-btn');
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTest.language = btn.dataset.lang;
        // Optionally regenerate test if in a mode that uses language
        return;
      }

      elements.configBtns.forEach(b => {
        if (b.parentElement.parentElement.id !== 'language-config') {
          b.classList.remove('active');
        }
      });
      btn.classList.add('active');
      currentTest.type = btn.dataset.type;
      
      // Show/Hide Language Config based on type
      const langConfig = document.getElementById('language-config');
      if (currentTest.type === 'custom') { // or other modes that support language
         // logic to show/hide if needed
      }

      updateValueButtons();
      
      if (currentTest.type === 'custom') {
        const modal = document.getElementById('custom-text-modal');
        if (modal) {
            modal.classList.remove('hidden');
            const textarea = document.getElementById('custom-text-input');
            if (textarea) textarea.focus();
            
            // Handle modal buttons
            const cancelBtn = document.getElementById('cancel-custom-text');
            const startBtn = document.getElementById('start-custom-text');
            
            const closeModal = () => {
                modal.classList.add('hidden');
            };
            
            cancelBtn.onclick = closeModal;
            
            startBtn.onclick = () => {
                const text = textarea.value.trim();
                if (text) {
                    currentTest.text = text;
                    modal.classList.add('hidden');
                    generateTest(); // This will pick up 'custom' type and use the text
                }
            };
            return; // Don't generate test yet
        }
      }
      
      generateTest();
    });
  });

  // Value buttons
  elements.valueBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.valueBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTest.value = parseInt(btn.dataset.value);
      generateTest();
    });
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Tab + Enter to restart
    if (e.key === 'Tab') {
      e.preventDefault();
      restartTest();
      return;
    }
    
    // Enter to restart
    if (e.key === 'Enter' && !currentTest.isActive) {
      e.preventDefault();
      restartTest();
      return;
    }
    
    // Escape for command line
    if (e.key === 'Escape') {
      e.preventDefault();
      // TODO: Implement command line
      return;
    }
    
    // Handle Space (prevent scrolling)
    if (currentTest.isActive && e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      handleTyping(e);
      return;
    }

    // Prevent unwanted keys during typing
    if (currentTest.isActive && (e.key === 'Tab' || e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      return;
    }
  });

  // Global typing handler
  document.addEventListener('keypress', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (currentTest.isFinished) return;
    
    handleTyping(e);
  });

  // Handle backspace
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && currentTest.isActive && !currentTest.isFinished) {
      e.preventDefault();
      handleBackspace();
    }
  });
}

function updateValueButtons() {
  const configValues = document.getElementById('config-values');
  let values = [];
  
  switch(currentTest.type) {
    case 'time':
      values = [15, 30, 60, 120];
      break;
    case 'words':
      values = [10, 25, 50, 100];
      break;
    case 'quote':
    case 'zen':
    case 'custom':
      values = [];
      break;
    default:
      values = [15, 30, 60, 120];
  }
  
  configValues.innerHTML = values.map(value => 
    `<button class="value-btn ${value === currentTest.value ? 'active' : ''}" data-value="${value}">${value}</button>`
  ).join('');
  
  // Re-attach event listeners
  document.querySelectorAll('.value-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.value-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTest.value = parseInt(btn.dataset.value);
      generateTest();
    });
  });
}

function generateTest() {
  resetTest();
  
  switch(currentTest.type) {
    case 'mission':
      // Don't override mission text - it's already set in startMission
      break;
    case 'time':
    case 'words':
      currentTest.text = generateRandomText();
      break;
    case 'quote':
      currentTest.text = getRandomQuote();
      break;
    case 'zen':
      currentTest.text = generateZenText();
      break;
    case 'custom':
      currentTest.text = getCustomText();
      break;
    default:
      currentTest.text = generateRandomText();
  }
  
  renderTypingArea();
  updateStats();
}

function generateRandomText() {
  // Get word list based on current settings
  let wordList = getBaseWordList();
  
  if (currentTest.numbers) {
    wordList = [...wordList, ...getNumberWords()];
  }
  
  // Generate appropriate amount of text based on test type and duration
  let targetWordCount;
  if (currentTest.type === 'words') {
    targetWordCount = currentTest.value;
  } else if (currentTest.type === 'time') {
    // Estimate words needed based on average typing speed and time
    const estimatedWPM = 40; // Average typing speed
    targetWordCount = Math.max(50, Math.ceil(estimatedWPM * (currentTest.value / 60) * 1.5));
  } else {
    targetWordCount = 100;
  }
  
  let words = [];
  
  for (let i = 0; i < targetWordCount; i++) {
    let word = wordList[Math.floor(Math.random() * wordList.length)];
    
    if (currentTest.punctuation && Math.random() < 0.1) {
      const punctuation = ['.', ',', '!', '?', ';', ':'];
      word += punctuation[Math.floor(Math.random() * punctuation.length)];
    }
    
    words.push(word);
  }
  
  return words.join(' ');
}

function getBaseWordList() {
  return [
    'the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it',
    'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i',
    'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word',
    'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said',
    'there', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up',
    'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
    'would', 'make', 'like', 'into', 'him', 'time', 'has', 'two', 'more', 'very',
    'after', 'words', 'here', 'just', 'first', 'any', 'my', 'new', 'such', 'because',
    'function', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'break', 'continue', 'true', 'false', 'null', 'undefined',
    'class', 'extends', 'import', 'export', 'from', 'async', 'await', 'try', 'catch'
  ];
}

function getNumberWords() {
  return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '10', '100', '1000'];
}

function getRandomQuote() {
  const quotes = [
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    "Innovation distinguishes between a leader and a follower.",
    "Your time is limited, so don't waste it living someone else's life.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It is during our darkest moments that we must focus to see the light."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function generateZenText() {
  // Simplified zen-like text without punctuation
  const words = getBaseWordList().filter(word => word.length > 2);
  return words.slice(0, 50).join(' ');
}

function getCustomText() {
  if (customTextBuffer && customTextBuffer.length > 0) {
    return customTextBuffer;
  }
  return "Type your custom text here. This feature allows you to practice with your own content.";
}

function renderTypingArea() {
  const html = `
    ${currentTest.type === 'time' || currentTest.type === 'mission' ? `
      <div class="timer-display" id="timer-display">
        <div class="timer-value">${currentTest.value}</div>
        <div class="timer-label">seconds remaining</div>
      </div>
    ` : ''}
    <div class="typing-text" id="typing-text" tabindex="0">
      ${currentTest.text.split('').map((char, index) => 
        `<span class="typing-char" data-index="${index}">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('')}
    </div>
    <div class="live-stats" id="live-stats">
      <div class="stat-item">
        <div class="stat-value" id="wpm-display">0</div>
        <div class="stat-label">wpm</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="accuracy-display">100<span class="stat-unit">%</span></div>
        <div class="stat-label">acc</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="time-display">${currentTest.value}</div>
        <div class="stat-label">${currentTest.type === 'time' ? 'time' : 'words'}</div>
      </div>
    </div>
    <div class="chart-container" id="realtime-chart-container" style="height: 150px; margin-top: 2rem;">
      <canvas id="realtime-chart"></canvas>
    </div>
  `;
  
  elements.typingArea.innerHTML = html;
  
  // Initialize real-time chart
  setTimeout(() => {
    createRealtimeChart('realtime-chart');
  }, 100);
  
  // Add cursor to first character
  updateCursor();
  
  // Initial stats update to ensure timer displays correctly
  updateLiveStats();
  
  // Focus typing area - wait for DOM to be ready
  setTimeout(() => {
    const typingText = document.getElementById('typing-text');
    if (typingText) {
      typingText.addEventListener('click', focusTypingArea);
      focusTypingArea();
    } else {
      console.error('typing-text element not found');
    }
  }, 50);
}

function updateCursor() {
  document.querySelectorAll('.typing-char').forEach(char => {
    char.classList.remove('cursor');
  });
  
  const currentChar = document.querySelector(`[data-index="${currentTest.currentIndex}"]`);
  if (currentChar) {
    currentChar.classList.add('cursor');
  }
}

function handleTyping(e) {
  if (currentTest.isFinished) return;
  
  // Check if we've reached the end of the text
  if (currentTest.currentIndex >= currentTest.text.length) {
    finishTest();
    return;
  }
  
  const char = e.key;
  const expectedChar = currentTest.text[currentTest.currentIndex];
  
  if (!currentTest.isActive && !currentTest.startTime) {
    startTest();
  }
  
  if (char === expectedChar) {
    markCharacterCorrect(currentTest.currentIndex);
    typingStats.correctChars++;
    soundManager.playClick();
  } else {
    markCharacterIncorrect(currentTest.currentIndex, char);
    typingStats.incorrectChars++;
    currentTest.errors.push({
      index: currentTest.currentIndex,
      expected: expectedChar,
      typed: char,
      timestamp: Date.now() - currentTest.startTime
    });
    soundManager.playError();
  }
  
  typingStats.totalChars++;
  typingStats.keystrokes++;
  currentTest.currentIndex++;
  updateCursor();
  updateStats();
  checkTestCompletion();
}

function handleBackspace() {
  if (currentTest.currentIndex > 0) {
    currentTest.currentIndex--;
    const charElement = document.querySelector(`[data-index="${currentTest.currentIndex}"]`);
    if (charElement) {
      charElement.classList.remove('correct', 'incorrect', 'extra');
    }
    
    // Adjust stats
    const lastChar = currentTest.text[currentTest.currentIndex];
    if (charElement && charElement.classList.contains('correct')) {
      typingStats.correctChars--;
    } else {
      typingStats.incorrectChars--;
    }
    typingStats.totalChars = Math.max(0, typingStats.totalChars - 1);
    
    updateCursor();
    updateStats();
  }
}

function markCharacterCorrect(index) {
  const charElement = document.querySelector(`[data-index="${index}"]`);
  if (charElement) {
    charElement.classList.add('correct');
    charElement.classList.remove('incorrect', 'extra');
  }
}

function markCharacterIncorrect(index, typedChar) {
  const charElement = document.querySelector(`[data-index="${index}"]`);
  if (charElement) {
    charElement.classList.add('incorrect');
    charElement.classList.remove('correct', 'extra');
  }
}

function startTest() {
  currentTest.startTime = Date.now();
  currentTest.isActive = true;
  
  // Start live updates
  updateInterval = setInterval(() => {
    if (currentTest.isActive && !currentTest.isFinished) {
      updateStats();
      
      // Check time limit
      if (currentTest.type === 'time') {
        const elapsed = (Date.now() - currentTest.startTime) / 1000;
        if (elapsed >= currentTest.value) {
          finishTest();
        }
      }
    }
  }, 100);
}

function updateStats() {
  const timeElapsed = currentTest.startTime ? (Date.now() - currentTest.startTime) / 1000 : 0;
  typingStats.timeElapsed = timeElapsed;
  
  if (timeElapsed > 0) {
    // WPM calculation (correct characters / 5 / minutes)
    const minutes = timeElapsed / 60;
    typingStats.wpm = Math.round((typingStats.correctChars / 5) / minutes) || 0;
    
    // Raw WPM (all keystrokes / 5 / minutes)
    typingStats.rawWpm = Math.round((typingStats.keystrokes / 5) / minutes) || 0;
    
    // Accuracy (Correct / Total Keystrokes)
    typingStats.accuracy = typingStats.keystrokes > 0 
      ? Math.round((typingStats.correctChars / typingStats.keystrokes) * 100) 
      : 100;
    
    // Store WPM history for consistency calculation
    if (typingStats.wpm > 0) {
      currentTest.wpmHistory.push(typingStats.wpm);
      currentTest.rawWpmHistory.push(typingStats.rawWpm);
      
      // Update real-time chart
      updateRealtimeChart(timeElapsed, typingStats.wpm, typingStats.rawWpm);
      
      // Calculate consistency (based on WPM variance)
      if (currentTest.wpmHistory.length >= 3) {
        const mean = currentTest.wpmHistory.reduce((a, b) => a + b) / currentTest.wpmHistory.length;
        const variance = currentTest.wpmHistory.reduce((acc, wpm) => acc + Math.pow(wpm - mean, 2), 0) / currentTest.wpmHistory.length;
        const stdDev = Math.sqrt(variance);
        typingStats.consistency = Math.max(0, Math.round(100 - (stdDev / mean * 100))) || 100;
      }
    }
  }
  
  // Update UI
  updateLiveStats();
}

function updateLiveStats() {
  const wpmDisplay = document.getElementById('wpm-display');
  const accuracyDisplay = document.getElementById('accuracy-display');
  const timeDisplay = document.getElementById('time-display');
  const timerDisplay = document.getElementById('timer-display');
  const timerValue = timerDisplay?.querySelector('.timer-value');
  
  if (wpmDisplay) wpmDisplay.textContent = typingStats.wpm;
  if (accuracyDisplay) accuracyDisplay.innerHTML = `${typingStats.accuracy}<span class="stat-unit">%</span>`;
  
  if (timeDisplay) {
    if (currentTest.type === 'time') {
      const remaining = Math.max(0, currentTest.value - typingStats.timeElapsed);
      timeDisplay.textContent = Math.ceil(remaining);
      
      // Update prominent timer display
      if (timerValue) {
        timerValue.textContent = Math.ceil(remaining);
        timerValue.className = 'timer-value';
        if (remaining <= 10) {
          timerValue.classList.add('warning');
        }
        if (remaining <= 5) {
          timerValue.classList.remove('warning');
          timerValue.classList.add('critical');
        }
      }
      
      // Change color when time is running low
      if (remaining <= 5) {
        timeDisplay.style.color = 'var(--error)';
      } else {
        timeDisplay.style.color = 'var(--accent-primary)';
      }
    } else if (currentTest.type === 'words') {
      const wordsTyped = Math.floor(typingStats.correctChars / 5); // More accurate word count
      const remaining = Math.max(0, currentTest.value - wordsTyped);
      timeDisplay.textContent = remaining;
    } else if (currentTest.type === 'mission') {
      // For missions, show remaining time like a time test
      const remaining = Math.max(0, currentTest.value - typingStats.timeElapsed);
      timeDisplay.textContent = Math.ceil(remaining);
      
      // Update prominent timer display
      if (timerValue) {
        timerValue.textContent = Math.ceil(remaining);
        timerValue.className = 'timer-value';
        if (remaining <= 10) {
          timerValue.classList.add('warning');
        }
        if (remaining <= 5) {
          timerValue.classList.remove('warning');
          timerValue.classList.add('critical');
        }
      }
      
      if (remaining <= 5) {
        timeDisplay.style.color = 'var(--error)';
      } else {
        timeDisplay.style.color = 'var(--accent-primary)';
      }
    } else {
      // For quote, zen, custom - just show elapsed time or hide
      timeDisplay.textContent = Math.ceil(typingStats.timeElapsed);
    }
  }
}

function checkTestCompletion() {
  let shouldFinish = false;
  
  if (currentTest.type === 'words') {
    // Calculate words typed based on characters per word (avg 5 chars per word)
    const wordsTyped = Math.floor(typingStats.correctChars / 5);
    if (wordsTyped >= currentTest.value) shouldFinish = true;
  } else if (currentTest.type === 'time') {
    // Handled in updateStats interval
  } else {
    // For quotes, zen, custom - check if reached end
    if (currentTest.currentIndex >= currentTest.text.length) {
      shouldFinish = true;
    }
  }
  
  if (shouldFinish) {
    finishTest();
  }
}

function finishTest() {
  currentTest.isActive = false;
  currentTest.isFinished = true;
  currentTest.endTime = Date.now();
  
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  
  // Final stats calculation
  updateStats();
  
  // Save result
  saveTestResult();
  
  // Show results
  showResults();
}

function showResults() {
  const testDuration = (currentTest.endTime - currentTest.startTime) / 1000;
  const charStats = calculateCharacterStats();
  
  // Calculate Problem Keys
  const missedKeys = {};
  currentTest.errors.forEach(err => {
    let key = err.expected;
    if (key === ' ') key = 'Space';
    if (!missedKeys[key]) missedKeys[key] = 0;
    missedKeys[key]++;
  });
  
  const topMissedKeys = Object.entries(missedKeys)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Format character stats: "100/2/0/1"
  const charStatsStr = `${charStats.correct}/${charStats.incorrect}/${charStats.extra}/${charStats.missed}`;
  
  // Determine Next Action Button
  let nextActionBtn = `
    <button class="action-btn primary" onclick="restartTest()">
      <span class="btn-icon">🚀</span>
      next test
    </button>
  `;

  if (currentTest.type === 'mission') {
      const currentMissionId = currentTest.missionData.mission.id;
      
      // Find current mission index to determine next mission
      // This handles non-sequential IDs and sorting order
      const allMissions = missionManager.missions;
      const currentIndex = allMissions.findIndex(m => m.id === currentMissionId);
      const nextMission = currentIndex !== -1 && currentIndex < allMissions.length - 1 
        ? allMissions[currentIndex + 1] 
        : null;
      
      if (nextMission) {
        nextActionBtn = `
            <button class="action-btn" onclick="restartTest()">
              <span class="btn-icon">↺</span>
              retry
            </button>
            <button class="action-btn primary" onclick="startMission(${nextMission.id})">
              <span class="btn-icon">⏭</span>
              next mission
            </button>
        `;
      } else {
         nextActionBtn = `
            <button class="action-btn" onclick="restartTest()">
              <span class="btn-icon">↺</span>
              retry
            </button>
            <button class="action-btn primary" onclick="showMissions()">
              <span class="btn-icon">📜</span>
              back to missions
            </button>
        `;
      }
      
      // Mark as completed
      markMissionCompleted(currentMissionId);
  }
  
  const html = `
    <div class="results-container fade-in">
      <!-- 1. Hero Stats (Big WPM & Acc) -->
      <div class="results-hero">
        <div class="hero-stat">
          <div class="stat-value">${Math.round(typingStats.wpm) || 0}</div>
          <div class="stat-label">wpm</div>
        </div>
        <div class="hero-stat secondary">
          <div class="stat-value">${Math.round(typingStats.accuracy) || 0}%</div>
          <div class="stat-label">acc</div>
        </div>
      </div>

      <!-- 2. Main Chart (Performance Over Time) -->
      <div class="results-chart-main">
        <canvas id="wpm-history-chart"></canvas>
      </div>
      
      <!-- 3. Detailed Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">type</div>
          <div class="stat-info">
            <div class="stat-value">${currentTest.type}</div>
            <div class="stat-label">test type</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">raw</div>
          <div class="stat-info">
            <div class="stat-value">${typingStats.rawWpm}</div>
            <div class="stat-label">raw wpm</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">chars</div>
          <div class="stat-info">
            <div class="stat-value" style="font-size: 1.2rem">${charStatsStr}</div>
            <div class="stat-label">correct/incorrect/extra/missed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">cons</div>
          <div class="stat-info">
            <div class="stat-value">${typingStats.consistency}%</div>
            <div class="stat-label">consistency</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">time</div>
          <div class="stat-info">
            <div class="stat-value">${testDuration.toFixed(0)}s</div>
            <div class="stat-label">time</div>
          </div>
        </div>
         <div class="stat-card wide">
          <div class="stat-icon" style="color: var(--error); background: rgba(255, 71, 87, 0.1);">⚠</div>
          <div class="stat-info" style="width: 100%;">
            <div class="stat-label" style="margin-bottom: 0.5rem;">Problem Keys</div>
            <div style="display: flex; gap: 0.8rem;">
              ${topMissedKeys.length > 0 ? topMissedKeys.map(([key, count]) => `
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <span style="font-family: var(--font-mono); font-size: 1.2rem; color: var(--text-primary); background: var(--bg-tertiary); padding: 2px 8px; border-radius: 4px;">${key}</span>
                  <span style="font-size: 0.75rem; color: var(--error); margin-top: 2px;">${count}</span>
                </div>
              `).join('') : '<span style="color: var(--text-muted); font-size: 0.9rem;">Perfect! No errors.</span>'}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 4. Actions -->
      <div class="result-actions" style="justify-content: center;">
        ${nextActionBtn}
      </div>
    </div>
  `;
  
  elements.resultsArea.innerHTML = html;
  elements.resultsArea.classList.remove('hidden');
  elements.typingArea.classList.add('hidden');
  elements.testConfig.classList.add('hidden');
  
  // Create the single main chart
  setTimeout(() => {
    createResultsCharts(charStats, testDuration);
  }, 50);
}

function createResultsCharts(charStats, testDuration) {
  const ctx = document.getElementById('wpm-history-chart');
  if (!ctx || currentTest.wpmHistory.length < 2) return;

  // Calculate time labels
  const timeLabels = currentTest.wpmHistory.map((_, i) => 
    Math.round((i + 1) * (testDuration / currentTest.wpmHistory.length))
  );

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: 'WPM',
          data: currentTest.wpmHistory,
          borderColor: '#e2b714',
          backgroundColor: 'rgba(226, 183, 20, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 6
        },
        {
          label: 'Raw',
          data: currentTest.wpmHistory.map(w => w + 5), // Rough estimate for visual context if raw history not tracked perfectly
          borderColor: '#555',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1a1a',
          titleColor: '#888',
          bodyColor: '#e2b714',
          titleFont: { family: 'JetBrains Mono' },
          bodyFont: { family: 'JetBrains Mono', size: 14, weight: 'bold' },
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          intersect: false,
          mode: 'index',
          callbacks: {
            title: (items) => `Time: ${items[0].label}s`,
            label: (item) => `${item.dataset.label}: ${item.parsed.y}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#666', font: { family: 'JetBrains Mono' } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#666', font: { family: 'JetBrains Mono' } }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

function calculateCharacterStats() {
  let correct = 0, incorrect = 0, extra = 0, missed = 0;
  
  document.querySelectorAll('.typing-char').forEach((char, index) => {
    if (index < currentTest.currentIndex) {
      if (char.classList.contains('correct')) {
        correct++;
      } else if (char.classList.contains('incorrect')) {
        incorrect++;
      } else if (char.classList.contains('extra')) {
        extra++;
      }
    } else if (index < currentTest.text.length) {
      missed++;
    }
  });
  
  return { correct, incorrect, extra, missed };
}

function saveTestResult() {
  const result = {
    wpm: typingStats.wpm,
    rawWpm: typingStats.rawWpm,
    accuracy: typingStats.accuracy,
    consistency: typingStats.consistency,
    testType: currentTest.type,
    testValue: currentTest.value,
    duration: (currentTest.endTime - currentTest.startTime) / 1000,
    errors: currentTest.errors.length,
    timestamp: new Date().toISOString()
  };
  
  // Save to localStorage
  let history = JSON.parse(localStorage.getItem('typingdev_history') || '[]');
  history.push(result);
  
  // Keep only last 100 results
  if (history.length > 100) {
    history = history.slice(-100);
  }
  
  localStorage.setItem('typingdev_history', JSON.stringify(history));
}

function restartTest() {
  resetTest();
  generateTest();
  focusTypingArea();
}

function resetTest() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  
  // Clear real-time chart
  clearRealtimeChart();
  
  currentTest = {
    ...currentTest,
    startTime: null,
    endTime: null,
    isActive: false,
    isFinished: false,
    currentIndex: 0,
    errors: [],
    wpmHistory: [],
    rawWpmHistory: []
  };
  
  typingStats = {
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    keystrokes: 0,
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    consistency: 100,
    timeElapsed: 0
  };
  
  elements.resultsArea.classList.add('hidden');
  elements.typingArea.classList.remove('hidden');
  elements.testConfig.classList.remove('hidden');
}

function focusTypingArea() {
  const typingText = document.getElementById('typing-text');
  if (typingText) {
    typingText.focus();
    typingText.classList.add('focused');
  }
}

// Navigation Functions
function showTest() {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.removeAttribute('data-active'));
  document.getElementById('nav-test').setAttribute('data-active', 'true');
  
  // Restore original HTML structure if it was changed
  if (elements.mainContainer.innerHTML !== originalMainHTML) {
    elements.mainContainer.innerHTML = originalMainHTML;
    
    // Re-initialize element references
    elements.testConfig = document.getElementById('test-config');
    elements.typingArea = document.getElementById('typing-area');
    elements.resultsArea = document.getElementById('results-area');
    elements.configBtns = document.querySelectorAll('.config-btn');
    elements.valueBtns = document.querySelectorAll('.value-btn');
    
    // Re-setup event listeners for config and value buttons
    setupConfigEventListeners();
  }
  
  // Show test UI elements
  elements.typingArea.classList.remove('hidden');
  elements.resultsArea.classList.add('hidden');
  elements.testConfig.classList.remove('hidden');
  
  // Only generate test if not already set (e.g., from mission)
  if (!currentTest.text || currentTest.type === 'time' || currentTest.type === 'words') {
    resetTest();
    generateTest();
  } else {
    // For missions, wait a bit for UI to be ready, then render
    setTimeout(() => {
      renderTypingArea();
      updateStats();
    }, 100);
  }
}

async function showMissions() {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.removeAttribute('data-active'));
  document.getElementById('nav-missions').setAttribute('data-active', 'true');
  
  // Show missions interface
  elements.typingArea.classList.add('hidden');
  elements.resultsArea.classList.add('hidden');
  elements.testConfig.classList.add('hidden');
  
  // Load missions if needed
  if (missionManager.missions.length === 0) {
     elements.mainContainer.innerHTML = '<div class="fade-in" style="text-align: center; margin-top: 5rem;">Loading missions...</div>';
     await missionManager.loadMissions();
  }

  const html = `
    <div class="fade-in">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h1 style="color: var(--accent-primary); font-size: 2.5rem; margin-bottom: 1rem;">
          📝 Typing Missions
        </h1>
        <p style="color: var(--text-secondary); font-size: 1.1rem;">
          Structured learning paths to improve your typing skills
        </p>
        
        <!-- Mission Language Filter -->
        <div class="config-group" style="justify-content: center; margin-top: 1rem;">
             <button class="config-btn active" onclick="filterMissions('all', this)">All</button>
             <button class="config-btn" onclick="filterMissions('python', this)">Python</button>
             <button class="config-btn" onclick="filterMissions('javascript', this)">JS</button>
             <button class="config-btn" onclick="filterMissions('cpp', this)">C++</button>
             <button class="config-btn" onclick="filterMissions('bash', this)">Bash</button>
        </div>
      </div>
      
      <div id="missions-grid-container" class="missions-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto;">
        ${renderMissionCategories()}
      </div>
    </div>
  `;
  
  elements.mainContainer.innerHTML = html;
  attachMissionListeners();
}

window.filterMissions = (lang, btn) => {
    document.querySelectorAll('.config-group .config-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const container = document.getElementById('missions-grid-container');
    if (container) {
        container.innerHTML = renderMissionCategories(lang);
        attachMissionListeners();
    }
};

function attachMissionListeners() {
  setTimeout(() => {
    const missionCards = document.querySelectorAll('.mission-card');
    
    missionCards.forEach(card => {
      const missionId = parseInt(card.dataset.missionId);
      
      card.addEventListener('click', () => {
        startMission(missionId);
      });
      
      // Add hover effect
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--accent-primary)';
        card.style.transform = 'translateY(-2px)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'var(--border)';
        card.style.transform = 'translateY(0)';
      });
    });
    
    document.getElementById('back-to-test')?.addEventListener('click', showTest);
  }, 100);
}

function renderMissionCategories(language = 'all') {
  const missions = missionManager.getMissionsByLanguage(language);
  
  const categories = [
    {
      title: '🌱 Beginner',
      description: 'Master the basics of touch typing',
      missions: missions.filter(m => m.level === 'beginner'),
      color: '#00d4aa'
    },
    {
      title: '🚀 Intermediate', 
      description: 'Practice with real code snippets',
      missions: missions.filter(m => m.level === 'intermediate'),
      color: '#e2b714'
    },
    {
      title: '⚡ Pro',
      description: 'Advanced typing challenges',
      missions: missions.filter(m => m.level === 'pro'),
      color: '#ff4757'
    }
  ];
  
  // Filter out empty categories
  const activeCategories = categories.filter(c => c.missions.length > 0);
  
  if (activeCategories.length === 0) {
      return `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No missions found for this language.</div>`;
  }

  return activeCategories.map(category => `
    <div class="mission-category" style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 2rem;">
      <h3 style="color: ${category.color}; margin-bottom: 0.5rem; font-size: 1.3rem;">
        ${category.title}
      </h3>
      <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 0.9rem;">
        ${category.description}
      </p>
      
      <div class="mission-list" style="display: flex; flex-direction: column; gap: 1rem;">
        ${category.missions.map(mission => `
          <div class="mission-card" data-mission-id="${mission.id}" style="
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            cursor: pointer;
            transition: var(--transition-normal);
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <h4 style="color: var(--text-primary); margin: 0; font-size: 1rem;">
                ${getCompletedMissions().includes(mission.id) ? '✅' : '📝'} ${mission.name}
              </h4>
              <span style="color: var(--text-muted); font-size: 0.8rem;">
                ${mission.time}s
              </span>
            </div>
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.85rem; line-height: 1.4;">
              ${mission.description}
            </p>
             <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                <span style="font-size: 0.7rem; padding: 2px 6px; background: rgba(255,255,255,0.1); border-radius: 4px;">${mission.language || 'general'}</span>
            </div>
            <div style="margin-top: 0.75rem; color: var(--text-muted); font-size: 0.75rem;">
              ${mission.exercises.length} exercises
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('') + `
    <div style="grid-column: 1 / -1; text-align: center; margin-top: 2rem;">
      <button class="action-btn" id="back-to-test">
        ← Back to Test
      </button>
    </div>
  `;
}

function getCompletedMissions() {
  const saved = localStorage.getItem('typingdev_missions');
  return saved ? JSON.parse(saved) : [];
}

function markMissionCompleted(missionId) {
  const completed = getCompletedMissions();
  if (!completed.includes(missionId)) {
    completed.push(missionId);
    localStorage.setItem('typingdev_missions', JSON.stringify(completed));
  }
}

function startMission(missionId) {
  const mission = missionManager.missions.find(m => m.id === missionId);
  
  if (!mission) {
    console.error('Mission not found for ID:', missionId);
    return;
  }
  
  // Randomize exercise selection
  const randomIndex = Math.floor(Math.random() * mission.exercises.length);
  currentTest.type = 'mission';
  currentTest.text = mission.exercises[randomIndex]; // Start with random exercise
  currentTest.value = mission.time;
  currentTest.missionData = {
    mission: mission,
    currentExercise: randomIndex,
    totalExercises: mission.exercises.length
  };
  
  // Show test interface
  showTest();
}

function showAccount() {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.removeAttribute('data-active'));
  document.getElementById('nav-account').setAttribute('data-active', 'true');
  
  elements.typingArea.classList.add('hidden');
  elements.resultsArea.classList.add('hidden');
  elements.testConfig.classList.add('hidden');
  
  const user = getCurrentUser();
  const history = getTestHistory();
  const stats = calculateUserStats(history);
  
  const html = `
    <div class="fade-in">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h1 style="color: var(--accent-primary); font-size: 2.5rem; margin-bottom: 1rem;">
          👤 Account
        </h1>
      </div>
      
      ${user ? renderLoggedInAccount(user, stats, history) : renderLoginForm()}
    </div>
  `;
  
  elements.mainContainer.innerHTML = html;
  
  // Add event listeners
  setTimeout(() => {
    if (!user) {
      document.getElementById('login-form')?.addEventListener('submit', handleLogin);
      document.getElementById('guest-login')?.addEventListener('click', loginAsGuest);
    } else {
      document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
      document.getElementById('clear-data-btn')?.addEventListener('click', clearUserData);
      
      // Create progress chart if history exists
      if (history.length > 0) {
        createProgressChart('user-progress-chart', history.slice(-20));
      }
    }
    
    document.getElementById('back-to-test')?.addEventListener('click', showTest);
  }, 100);
}

function renderLoginForm() {
  return `
    <div style="max-width: 400px; margin: 0 auto; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 2rem;">
      <h3 style="color: var(--text-primary); margin-bottom: 1rem; text-align: center;">
        Sign in to save your progress
      </h3>
      <p style="color: var(--text-secondary); margin-bottom: 2rem; text-align: center; font-size: 0.9rem;">
        Track your typing progress, save your results, and compete with others!
      </p>
      
      <form id="login-form" style="display: flex; flex-direction: column; gap: 1rem;">
        <input 
          type="text" 
          id="username" 
          placeholder="Enter username" 
          required
          style="
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            color: var(--text-primary);
            padding: 0.75rem;
            border-radius: 6px;
            font-size: 1rem;
            outline: none;
          "
        />
        <button type="submit" class="action-btn primary" style="width: 100%;">
          Sign In
        </button>
      </form>
      
      <div style="text-align: center; margin: 1rem 0; color: var(--text-muted);">
        or
      </div>
      
      <button id="guest-login" class="action-btn" style="width: 100%;">
        Continue as Guest
      </button>
      
      <div style="margin-top: 2rem; text-align: center;">
        <button class="action-btn" id="back-to-test">
          ← Back to Test
        </button>
      </div>
    </div>
  `;
}

function renderLoggedInAccount(user, stats, history) {
  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="
              width: 60px; 
              height: 60px; 
              background: var(--accent-primary); 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 1.5rem;
              color: var(--bg-primary);
              font-weight: bold;
            ">
              ${user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style="color: var(--text-primary); margin: 0;">${user.username}</h2>
              <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">
                Member since ${new Date(user.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button id="logout-btn" class="action-btn" style="background: var(--error);">
            Sign Out
          </button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          <div class="stat-card">
            <div class="stat-value" style="color: var(--accent-primary);">${stats.averageWpm}</div>
            <div class="stat-label">Average WPM</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--success);">${stats.bestWpm}</div>
            <div class="stat-label">Best WPM</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--accent-primary);">${stats.averageAccuracy}%</div>
            <div class="stat-label">Average Accuracy</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--text-primary);">${stats.totalTests}</div>
            <div class="stat-label">Tests Completed</div>
          </div>
        </div>
      </div>
      
      ${history.length > 0 ? `
        <div class="chart-container" style="margin-bottom: 2rem;">
          <div class="chart-title">Your Progress Over Time</div>
          <canvas id="user-progress-chart" style="height: 300px;"></canvas>
        </div>
      ` : `
        <div style="text-align: center; padding: 3rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
          <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">No typing history yet</h3>
          <p style="color: var(--text-secondary);">Complete some tests to see your progress!</p>
        </div>
      `}
      
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <button class="action-btn" id="back-to-test">
          ← Back to Test
        </button>
        <button class="action-btn" id="clear-data-btn" style="background: var(--error);">
          Clear All Data
        </button>
      </div>
    </div>
  `;
}

function getCurrentUser() {
  const userData = localStorage.getItem('typingdev_user');
  return userData ? JSON.parse(userData) : null;
}

function getTestHistory() {
  const history = localStorage.getItem('typingdev_history');
  return history ? JSON.parse(history) : [];
}

function calculateUserStats(history) {
  if (history.length === 0) {
    return {
      averageWpm: 0,
      bestWpm: 0,
      averageAccuracy: 0,
      totalTests: 0
    };
  }
  
  const wpmSum = history.reduce((sum, test) => sum + test.wpm, 0);
  const accuracySum = history.reduce((sum, test) => sum + test.accuracy, 0);
  
  return {
    averageWpm: Math.round(wpmSum / history.length),
    bestWpm: Math.max(...history.map(test => test.wpm)),
    averageAccuracy: Math.round(accuracySum / history.length),
    totalTests: history.length
  };
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  
  if (!username) return;
  
  const user = {
    username: username,
    joinDate: new Date().toISOString(),
    isGuest: false
  };
  
  localStorage.setItem('typingdev_user', JSON.stringify(user));
  
  // Update sign-in button
  updateSignInButton(user);
  
  // Refresh account view
  showAccount();
}

function loginAsGuest() {
  const user = {
    username: 'Guest',
    joinDate: new Date().toISOString(),
    isGuest: true
  };
  
  localStorage.setItem('typingdev_user', JSON.stringify(user));
  
  // Update sign-in button
  updateSignInButton(user);
  
  // Go back to test
  showTest();
}

function handleLogout() {
  localStorage.removeItem('typingdev_user');
  
  // Update sign-in button
  updateSignInButton(null);
  
  // Refresh account view
  showAccount();
}

function clearUserData() {
  if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
    localStorage.removeItem('typingdev_history');
    localStorage.removeItem('typingdev_missions');
    
    // Refresh account view
    showAccount();
  }
}

function updateSignInButton(user) {
  const signInBtn = document.getElementById('sign-in-btn');
  if (signInBtn) {
    if (user) {
      signInBtn.innerHTML = `
        <span class="crown-icon">👤</span>
        <span>${user.username}</span>
      `;
      signInBtn.onclick = () => showAccount();
    } else {
      signInBtn.innerHTML = `
        <span class="crown-icon">👑</span>
        <span>sign in to save your result</span>
      `;
      signInBtn.onclick = () => showAccount();
    }
  }
}

function showDetailedResults() {
  // TODO: Implement detailed results view
  alert('Detailed results coming soon!');
}

function showLeaderboard() {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.removeAttribute('data-active'));
  document.getElementById('nav-leaderboard').setAttribute('data-active', 'true');
  
  elements.typingArea.classList.add('hidden');
  elements.resultsArea.classList.add('hidden');
  elements.testConfig.classList.add('hidden');
  
  const html = `
    <div class="fade-in">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h1 style="color: var(--accent-primary); font-size: 2.5rem; margin-bottom: 1rem;">
          🏆 Leaderboard
        </h1>
        <p style="color: var(--text-secondary); font-size: 1.1rem;">
          Compete with other typists around the world
        </p>
      </div>
      
      <div class="leaderboard-placeholder">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🚧</div>
        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Coming Soon!</h3>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          Global leaderboards and competitions are in development
        </p>
        <button class="action-btn" onclick="showTest()">
          ← Back to Test
        </button>
      </div>
    </div>
  `;
  
  elements.mainContainer.innerHTML = html;
}

function showSettings() {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.removeAttribute('data-active'));
  document.getElementById('nav-settings').setAttribute('data-active', 'true');
  
  elements.typingArea.classList.add('hidden');
  elements.resultsArea.classList.add('hidden');
  elements.testConfig.classList.add('hidden');
  
  const html = `
    <div class="fade-in">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h1 style="color: var(--accent-primary); font-size: 2.5rem; margin-bottom: 1rem;">
          ⚙️ Settings
        </h1>
        <p style="color: var(--text-secondary); font-size: 1.1rem;">
          Customize your typing experience
        </p>
      </div>
      
      <div class="settings-placeholder">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🔧</div>
        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Settings Panel</h3>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          Theme customization, font size, and other preferences will be available here
        </p>
        <button class="action-btn" onclick="showTest()">
          ← Back to Test
        </button>
      </div>
    </div>
  `;
  
  elements.mainContainer.innerHTML = html;
}

function handleSignIn() {
  showAccount();
}

function startQuickTest() {
  // Set up a quick typing test
  currentTest.type = 'time';
  currentTest.value = 60;
  currentTest.text = generateRandomText();
  
  // Show test interface and start
  showTest();
  resetTest();
}


