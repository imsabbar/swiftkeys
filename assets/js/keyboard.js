/**
 * Virtual Keyboard Component
 * Copyright (c) 2025 imsabbar
 */

class VirtualKeyboard {
  constructor(containerId = 'virtual-keyboard') {
    this.container = document.getElementById(containerId);
    this.keys = {};
    // AJAZZ AK680 Layout (65%)
    this.layout = [
      ['Esc', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace', 'Ins'],
      ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\', 'Del'],
      ['Caps Lock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter', 'PgUp'],
      ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift', '↑', 'PgDn'],
      ['Ctrl', 'Win', 'Alt', ' ', 'Alt', 'Fn', 'Ctrl', '←', '↓', '→']
    ];
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.attachListeners();
  }

  render() {
    let html = '';
    this.layout.forEach((row, rowIndex) => {
      html += '<div class="keyboard-row">';
      row.forEach((key, keyIndex) => {
        let className = 'key';
        let label = key;
        
        // Special keys styling
        if (key.length > 1 || ['↑', '←', '↓', '→'].includes(key)) {
          let cleanName = key.toLowerCase().replace(/\s+/g, '-');
          if (['↑', '←', '↓', '→'].includes(key)) cleanName = 'arrow';
          className += ` key-${cleanName}`;
        }
        
        // Accurate sizing for AK680 (65%)
        if (key === 'Backspace') className += ' u-2';
        else if (key === 'Tab') className += ' u-15';
        else if (key === '\\') className += ' u-15';
        else if (key === 'Caps Lock') className += ' u-175';
        else if (key === 'Enter') className += ' u-225';
        else if (key === 'Shift') {
            // Left Shift is 2.25u, Right Shift is 1.75u
            if (keyIndex === 0) className += ' u-225';
            else className += ' u-175';
        }
        else if (key === ' ') className += ' u-625';
        else if (['Ctrl', 'Win', 'Alt'].includes(key)) {
             // Left modifiers are 1.25u, Right are 1u
             // Row 4 (index 4) has Ctrl/Win/Alt at start (1.25u)
             // and Alt/Fn/Ctrl at mid/end (1u)
             if (rowIndex === 4 && keyIndex < 3) className += ' u-125';
             else className += ' u-1';
        }
        else {
            className += ' u-1';
        }
        
        html += `<div class="${className}" data-key="${key}">${label}</div>`;
      });
      html += '</div>';
    });
    this.container.innerHTML = html;
  }

  attachListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  getKeyLabel(e) {
    let key = e.key;
    
    // Map Event key to Layout label
    if (key === 'Control') return 'Ctrl';
    if (key === 'CapsLock') return 'Caps Lock';
    if (key === 'Escape') return 'Esc';
    if (key === 'Delete') return 'Del';
    if (key === 'Insert') return 'Ins';
    if (key === 'PageUp') return 'PgUp';
    if (key === 'PageDown') return 'PgDn';
    if (key === 'ArrowUp') return '↑';
    if (key === 'ArrowDown') return '↓';
    if (key === 'ArrowLeft') return '←';
    if (key === 'ArrowRight') return '→';
    if (key === 'Meta') return 'Win';
    
    // Handle Shifted symbols for US QWERTY
    const shiftMap = {
      '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
      '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
    };
    if (shiftMap[key]) return shiftMap[key];
    
    // Map Backtick/Tilde to Esc for 65% layout
    if (key === '`' || key === '~') return 'Esc';

    return key;
  }

  handleKeyDown(e) {
    let label = this.getKeyLabel(e);
    
    // Find key element(s)
    let keys = document.querySelectorAll(`.key[data-key="${label}"]`);
    
    // Fallback for case-insensitive match (e.g. 'A' vs 'a')
    if (keys.length === 0 && label.length === 1) {
       keys = document.querySelectorAll(`.key[data-key="${label.toLowerCase()}"]`);
    }
    
    keys.forEach(k => k.classList.add('active'));
    
    // Handle Shift specific visualization if needed (left vs right)
    // Currently both light up, which is acceptable.
  }

  handleKeyUp(e) {
    let label = this.getKeyLabel(e);
    
    let keys = document.querySelectorAll(`.key[data-key="${label}"]`);
    if (keys.length === 0 && label.length === 1) {
       keys = document.querySelectorAll(`.key[data-key="${label.toLowerCase()}"]`);
    }
    
    keys.forEach(k => k.classList.remove('active'));
  }
}

// Initialize on load if container exists, or wait for app to init
window.VirtualKeyboard = VirtualKeyboard;
