import {
  PlayerStats,
  GameSettings,
  Achievement,
  CosmeticSkin,
  BoardTheme,
  SavedGameState,
  UserProfile,
} from '../game/types';
import {
  INITIAL_ACHIEVEMENTS,
  COSMETIC_SKINS,
  BOARD_THEMES,
} from '../game/achievements';

const STORAGE_VERSION = 'v1.0';
const STATS_KEY = `dhoklaris_${STORAGE_VERSION}_stats`;
const SETTINGS_KEY = `dhoklaris_${STORAGE_VERSION}_settings`;
const ACHIEVEMENTS_KEY = `dhoklaris_${STORAGE_VERSION}_achievements`;
const SKINS_KEY = `dhoklaris_${STORAGE_VERSION}_skins`;
const THEMES_KEY = `dhoklaris_${STORAGE_VERSION}_themes`;
const SAVED_GAME_KEY = `dhoklaris_${STORAGE_VERSION}_saved_game`;
const PROFILES_KEY = `dhoklaris_${STORAGE_VERSION}_profiles`;
const ACTIVE_PROFILE_KEY = `dhoklaris_${STORAGE_VERSION}_active_profile`;

function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

function hashAnswer(ans: string): string {
  const norm = ans.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return hashPin(norm || 'dhokla');
}

function generateRecoveryKey(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let res = 'CHEF-';
  for (let i = 0; i < 4; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  linesCleared: 0,
  highestScore: 0,
  highestLevel: 1,
  bestCombo: 0,
  totalPlaytimeSeconds: 0,
  tetrisClears: 0,
  tadkaPoints: 100, // Starting gift!
  classicBestScore: 0,
  sprintBestTimeSeconds: null,
  ultraBestScore: 0,
  risingHeatBestScore: 0,
  challengesCompleted: [],
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.7,
  musicVolume: 0.35,
  sfxEnabled: true,
  musicEnabled: false,
  hapticEnabled: true,
  reducedMotion: false,
  touchControls: true,
  gestureControls: true,
  buttonSize: 'normal',
  selectedSkin: 'classic',
  selectedTheme: 'charcoal',
  playerTitle: 'Dhokla Apprentice',
  das: 260,
  arr: 50,
};

class StorageManager {
  private memoryFallback: Map<string, string> = new Map();

  private getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return this.memoryFallback.get(key) || null;
  }

  private setItem(key: string, value: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    } else {
      this.memoryFallback.set(key, value);
    }
  }

  private removeItem(key: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    } else {
      this.memoryFallback.delete(key);
    }
  }

  // Stats
  public loadStats(): PlayerStats {
    try {
      const data = this.getItem(STATS_KEY);
      if (data) {
        return { ...DEFAULT_STATS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to parse saved stats, using defaults', e);
    }
    return { ...DEFAULT_STATS };
  }

  public saveStats(stats: PlayerStats) {
    try {
      this.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save stats', e);
    }
  }

  // Settings
  public loadSettings(): GameSettings {
    try {
      const data = this.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to parse saved settings, using defaults', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  public saveSettings(settings: GameSettings) {
    try {
      this.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }

  // Achievements
  public loadAchievements(): Achievement[] {
    try {
      const data = this.getItem(ACHIEVEMENTS_KEY);
      if (data) {
        const parsed: Achievement[] = JSON.parse(data);
        return INITIAL_ACHIEVEMENTS.map(initial => {
          const found = parsed.find(p => p.id === initial.id);
          return found ? { ...initial, ...found } : initial;
        });
      }
    } catch (e) {
      console.warn('Failed to parse achievements', e);
    }
    return [...INITIAL_ACHIEVEMENTS];
  }

  public saveAchievements(achievements: Achievement[]) {
    try {
      this.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (e) {
      console.warn('Failed to save achievements', e);
    }
  }

  // Cosmetic Skins
  public loadSkins(): CosmeticSkin[] {
    try {
      const data = this.getItem(SKINS_KEY);
      if (data) {
        const parsed: CosmeticSkin[] = JSON.parse(data);
        return COSMETIC_SKINS.map(s => {
          const found = parsed.find(p => p.id === s.id);
          return found ? { ...s, unlocked: found.unlocked } : s;
        });
      }
    } catch (e) {
      console.warn('Failed to parse skins', e);
    }
    return [...COSMETIC_SKINS];
  }

  public saveSkins(skins: CosmeticSkin[]) {
    try {
      this.setItem(SKINS_KEY, JSON.stringify(skins));
    } catch (e) {
      console.warn('Failed to save skins', e);
    }
  }

  // Board Themes
  public loadThemes(): BoardTheme[] {
    try {
      const data = this.getItem(THEMES_KEY);
      if (data) {
        const parsed: BoardTheme[] = JSON.parse(data);
        return BOARD_THEMES.map(t => {
          const found = parsed.find(p => p.id === t.id);
          return found ? { ...t, unlocked: found.unlocked } : t;
        });
      }
    } catch (e) {
      console.warn('Failed to parse themes', e);
    }
    return [...BOARD_THEMES];
  }

  public saveThemes(themes: BoardTheme[]) {
    try {
      this.setItem(THEMES_KEY, JSON.stringify(themes));
    } catch (e) {
      console.warn('Failed to save themes', e);
    }
  }

  // Active In-Progress Game Auto-Save
  public saveActiveGameState(state: SavedGameState) {
    try {
      this.setItem(SAVED_GAME_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save in-progress game state', e);
    }
  }

  public loadActiveGameState(): SavedGameState | null {
    try {
      const data = this.getItem(SAVED_GAME_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load in-progress game state', e);
    }
    return null;
  }

  public clearActiveGameState() {
    this.removeItem(SAVED_GAME_KEY);
  }

  // --- Unique Player Account Registry & Authentication ---

  public getProfiles(): UserProfile[] {
    try {
      const data = this.getItem(PROFILES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse profiles', e);
    }
    return [];
  }

  public getActiveUsername(): string | null {
    return this.getItem(ACTIVE_PROFILE_KEY);
  }

  public setActiveUsername(username: string) {
    this.setItem(ACTIVE_PROFILE_KEY, username);
  }

  public logout() {
    this.removeItem(ACTIVE_PROFILE_KEY);
  }

  // Look up security question for password recovery
  public getSecurityQuestion(username: string): string | null {
    const trimmed = username.trim().toLowerCase();
    const profiles = this.getProfiles();
    const found = profiles.find(p => p.username.toLowerCase() === trimmed);
    return found ? (found.recoveryQuestion || 'What is your favorite Gujarati snack?') : null;
  }

  // Reset forgotten PIN using Security Answer OR 8-character Recovery Key
  public resetPin(
    username: string,
    answerOrKey: string,
    newPin: string
  ): { success: boolean; message: string } {
    const trimmed = username.trim();
    if (!trimmed) {
      return { success: false, message: 'Please enter your username.' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, message: 'New PIN must be at least 4 digits.' };
    }

    const profiles = this.getProfiles();
    const existing = profiles.find(p => p.username.toLowerCase() === trimmed.toLowerCase());
    if (!existing) {
      return { success: false, message: `No registered chef found with username '${trimmed}'.` };
    }

    const cleanInput = answerOrKey.trim();
    const isKeyMatch = existing.recoveryKey && existing.recoveryKey.toUpperCase() === cleanInput.toUpperCase();
    const isAnsMatch = existing.recoveryAnswerHash && existing.recoveryAnswerHash === hashAnswer(cleanInput);

    if (isKeyMatch || isAnsMatch) {
      existing.pinHash = hashPin(newPin);
      existing.lastActiveAt = Date.now();
      this.setItem(PROFILES_KEY, JSON.stringify(profiles));
      this.setActiveUsername(existing.username);
      return {
        success: true,
        message: `PIN reset successfully! You are now logged in as Chef ${existing.username}.`,
      };
    }

    return {
      success: false,
      message: 'Incorrect security answer or recovery key. Please verify your answer or use your recovery key.',
    };
  }

  // Enforces unique usernames with 4-digit PIN verification + recovery question
  public registerOrLogin(
    username: string,
    pin: string,
    securityQuestion?: string,
    securityAnswer?: string
  ): { success: boolean; message: string; isNewUser: boolean; recoveryKey?: string } {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.', isNewUser: false };
    }
    if (!pin || pin.length < 4) {
      return { success: false, message: 'PIN must be at least 4 digits.', isNewUser: false };
    }

    const profiles = this.getProfiles();
    const existing = profiles.find(p => p.username.toLowerCase() === trimmed.toLowerCase());
    const hashed = hashPin(pin);

    if (existing) {
      // Existing user -> verify PIN
      if (existing.pinHash === hashed) {
        existing.lastActiveAt = Date.now();
        this.setItem(PROFILES_KEY, JSON.stringify(profiles));
        this.setActiveUsername(existing.username);
        return {
          success: true,
          message: `Welcome back, Chef ${existing.username}! Authenticated successfully.`,
          isNewUser: false,
          recoveryKey: existing.recoveryKey,
        };
      } else {
        return {
          success: false,
          message: `The username '${trimmed}' is already claimed by another chef! Enter the correct PIN or click 'Forgot PIN?'.`,
          isNewUser: false,
        };
      }
    }

    // New unique user -> register with secret recovery key and question
    const recoveryKey = generateRecoveryKey();
    const question = securityQuestion || 'What is your favorite Gujarati snack?';
    const answer = securityAnswer || 'khaman';

    const newProfile: UserProfile = {
      uid: `uid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: trimmed,
      pinHash: hashed,
      recoveryQuestion: question,
      recoveryAnswerHash: hashAnswer(answer),
      recoveryKey: recoveryKey,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    profiles.push(newProfile);
    this.setItem(PROFILES_KEY, JSON.stringify(profiles));
    this.setActiveUsername(trimmed);

    return {
      success: true,
      message: `Account created! Welcome to the kitchen, Chef ${trimmed}! Recovery Key: ${recoveryKey}`,
      isNewUser: true,
      recoveryKey: recoveryKey,
    };
  }

  // Export full account backup code
  public exportAccountCode(): string {
    const payload = {
      username: this.getActiveUsername() || 'Dhokla Chef',
      stats: this.loadStats(),
      achievements: this.loadAchievements(),
      skins: this.loadSkins(),
      themes: this.loadThemes(),
      settings: this.loadSettings(),
      exportedAt: Date.now(),
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }

  // Import full account backup code across any phone or computer
  public importAccountCode(code: string): { success: boolean; message: string } {
    try {
      const decoded = decodeURIComponent(escape(atob(code.trim())));
      const data = JSON.parse(decoded);
      if (!data.username || !data.stats) {
        return { success: false, message: 'Invalid Dhoklaris save code.' };
      }

      this.saveStats(data.stats);
      if (data.achievements) this.saveAchievements(data.achievements);
      if (data.skins) this.saveSkins(data.skins);
      if (data.themes) this.saveThemes(data.themes);
      if (data.settings) this.saveSettings(data.settings);
      this.setActiveUsername(data.username);

      return {
        success: true,
        message: `Account restored! Welcome back, Chef ${data.username}!`,
      };
    } catch {
      return { success: false, message: 'Failed to read save code. Please ensure it is valid.' };
    }
  }

  // Complete reset
  public resetAllProgress() {
    try {
      this.removeItem(STATS_KEY);
      this.removeItem(ACHIEVEMENTS_KEY);
      this.removeItem(SKINS_KEY);
      this.removeItem(THEMES_KEY);
    } catch (e) {
      console.warn('Failed to reset progress', e);
    }
  }
}

export const persistence = new StorageManager();
