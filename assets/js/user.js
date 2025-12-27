/**
 * User Profile & Motivation
 * Copyright (c) 2025 imsabbar
 */

// User avatar and motivational messages
function getUserAvatar() {
  // Use a coding-themed avatar
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=CodeMaster&accessories=eyepatch',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Developer&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Programmer&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/miniavs/svg?seed=Coder&backgroundColor=ffd5dc'
  ];
  
  // Use local storage to persist avatar choice
  let savedAvatar = localStorage.getItem('user_avatar');
  if (!savedAvatar) {
    savedAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    localStorage.setItem('user_avatar', savedAvatar);
  }
  return savedAvatar;
}

function getMotivation(level) {
  const messages = {
    beginner: [
      '🌱 Every pro was once a beginner!',
      '🎯 Start slow, finish strong.',
      '💪 Practice makes perfect.',
      '🚀 You are learning fast!',
      '⭐ Building solid foundations!'
    ],
    intermediate: [
      '🔥 Keep pushing your limits!',
      '📈 Consistency is key.',
      '⚡ You are getting faster!',
      '🎯 Focus and flow!',
      '💻 Coding like a pro!'
    ],
    pro: [
      '🥷 You are a typing ninja!',
      '👑 Master of the keys!',
      '🏆 Break your own records!',
      '⚡ Lightning fast fingers!',
      '🎯 Precision and speed!'
    ],
    test: [
      '📊 Let\'s see what you got!',
      '⏱️ Time to show your skills!',
      '🎯 Focus and type!',
      '🔥 Give it your best shot!'
    ]
  };
  
  const arr = messages[level] || messages.beginner;
  return arr[Math.floor(Math.random() * arr.length)];
}

function getEncouragementMessage(wpm, accuracy) {
  if (wpm >= 70 && accuracy >= 95) {
    return '🏆 AMAZING! You are a typing champion!';
  } else if (wpm >= 50 && accuracy >= 90) {
    return '🔥 Excellent work! You are on fire!';
  } else if (wpm >= 35 && accuracy >= 85) {
    return '⭐ Great job! Keep up the momentum!';
  } else if (wpm >= 25 && accuracy >= 80) {
    return '👍 Good progress! You are improving!';
  } else if (accuracy >= 90) {
    return '🎯 Fantastic accuracy! Speed will come with practice!';
  } else if (wpm >= 30) {
    return '⚡ Nice speed! Focus on accuracy next!';
  } else {
    return '🌱 Keep practicing! You are building great habits!';
  }
}

function getLevelFromStats(wpm, accuracy) {
  const score = (wpm * 0.7) + (accuracy * 0.3);
  
  if (score >= 60) return 'pro';
  if (score >= 35) return 'intermediate';
  return 'beginner';
}
