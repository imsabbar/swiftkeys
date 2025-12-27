/**
 * Local Storage Wrapper
 * Copyright (c) 2025 imsabbar
 */

// Utility for storing and retrieving progress
const STORAGE_KEY = 'qwerty_typing_progress';

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function loadProgress() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { missions: [], history: [] };
}
