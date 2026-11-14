export class HapticEngine {
  private enabled = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public trigger(type: 'light' | 'medium' | 'heavy' | 'celebration') {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) {
      return;
    }

    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate([40, 20, 40]);
          break;
        case 'celebration':
          navigator.vibrate([50, 40, 60, 40, 100]);
          break;
      }
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }
}

export const haptics = new HapticEngine();
