/**
 * Mission Management Module
 * Copyright (c) 2025 imsabbar
 */

// Mission Manager to handle fetching and filtering
class MissionManager {
  constructor() {
    this.missions = [];
    this.loading = false;
  }

  async loadMissions() {
    this.loading = true;
    try {
      const response = await fetch('assets/data/missions.json');
      if (!response.ok) throw new Error('Failed to load missions');
      this.missions = await response.json();
      console.log('Missions loaded:', this.missions.length);
      return this.missions;
    } catch (error) {
      console.error('Error loading missions, using fallback:', error);
      // Fallback data if fetch fails (e.g. local file access)
      this.missions = [
        {
          "id": 1,
          "name": "QWERTY Basics",
          "description": "Master the home row and basic letters.",
          "level": "beginner",
          "language": "general",
          "time": 30,
          "exercises": ["asdf jkl;", "qwertyuiop", "zxcvbnm", "the quick brown fox"]
        },
        {
          "id": 2,
          "name": "Numbers & Symbols",
          "description": "Practice numbers and common symbols.",
          "level": "beginner",
          "language": "general",
          "time": 30,
          "exercises": ["1234567890", "!@#$%^&*()", "let x = 10;", "const y = \"hello\";"]
        },
        {
          "id": 4,
          "name": "Code Snippets",
          "description": "Type real programming code.",
          "level": "intermediate",
          "language": "javascript",
          "time": 45,
          "exercises": ["function greet(name) { return `Hello, ${name}!`; }", "for (let i = 0; i < 5; i++) { console.log(i); }"]
        },
        {
          "id": 11,
          "name": "Python Basics",
          "description": "Essential Python syntax and data structures.",
          "level": "intermediate",
          "language": "python",
          "time": 45,
          "exercises": ["def calculate_area(radius): return 3.14 * radius ** 2", "numbers = [x for x in range(10) if x % 2 == 0]"]
        },
        {
          "id": 13,
          "name": "C++ Fundamentals",
          "description": "Pointers, references, and memory management.",
          "level": "intermediate",
          "language": "cpp",
          "time": 50,
          "exercises": ["int* ptr = &value; *ptr = 100;", "std::vector<int> vec = {1, 2, 3}; vec.push_back(4);"]
        },
        {
            "id": 10,
            "name": "Terminal Commands",
            "description": "Master common terminal and git commands.",
            "level": "pro",
            "language": "bash",
            "time": 35,
            "exercises": ["git add . && git commit -m \"feat: add new feature\"", "docker run -d -p 3000:3000 --name app my-app:latest"]
        }
      ];
      return this.missions;
    } finally {
      this.loading = false;
    }
  }

  getMissionsByLevel(level) {
    return this.missions.filter(m => m.level === level);
  }

  getMissionsByLanguage(language) {
    if (language === 'all') return this.missions;
    return this.missions.filter(m => m.language === language || m.language === 'general');
  }

  getMissionById(id) {
    return this.missions.find(m => m.id === id);
  }
}

window.MissionManager = MissionManager;
