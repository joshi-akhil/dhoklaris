# DHOKLARIS — A Premium Gujarati Dhokla-Themed Falling-Block Arcade Game

> **"Stack It. Spice It. Smash It!"**  
> *"Too Much Dhokla? Never!"*

---

## 🌟 Overview

**Dhoklaris** is a complete, responsive, indie-grade falling-block puzzle arcade game fusing classic Tetris mechanics with vibrant Gujarati culinary culture. Every tetromino piece is composed of authentic, spongy golden-yellow **Dhokla cubes** garnished with black mustard seeds (rai), fresh green coriander, and roasted green chilies.

Built with **React 18**, **TypeScript**, **Tailwind CSS**, **HTML5 Canvas**, and the **Web Audio API**, Dhoklaris features a deterministic, high-performance game engine with zero external runtime dependencies.

---

## 🎮 Game Modes

1. **Classic Dhoklaris (Endless Arcade)**
   - The timeless falling-block experience.
   - Advance one level every 10 cleared lines. Gravity accelerates progressively.
   - Real-time score, line, level, combo, and high-score tracking.

2. **Sprint — 40 Lines (Speed Run)**
   - Race against the clock to clear 40 lines as fast as humanly possible.
   - Precision timer and persistent best completion time records.

3. **Ultra — 2 Minutes (Blitz Mode)**
   - Fixed 120-second countdown.
   - Maximize score before time runs out with heavy multi-line and combo bonuses.

4. **Zen Mode (Relaxed)**
   - No game-over condition, no timer pressure.
   - If blocks stack to the top, the top rows automatically vaporize. Relaxed gravity.

5. **Master Challenges (7 Culinary Trials)**
   - Progressive objectives:
     - *Warm-up Fry*: Clear 10 lines without topping out.
     - *Double Tadka*: 3 consecutive line clears in a row.
     - *Four-Line Feast*: Execute a 4-line Tetris clear.
     - *Fast Snack*: Score 5,000 points in under 3 minutes.
     - *Gentle Steamer*: Reach Level 4 without using Hard Drop.
     - *Combo Maestro*: Build a 5-combo streak across placements.
     - *Royal Kitchen*: Clear 30 lines in Rising Heat mode.

6. **Rising Heat (Extreme Survival)**
   - Starts at Level 6 with 1.75x gravity speed.
   - Aggressive difficulty ramping rewarded by high Tadka point multipliers.

7. **Custom Kitchen (Sandbox)**
   - Customize starting level (1–15), gravity curve (None / Slow / Normal / Fast / Extreme), time limits (Unlimited / 2 / 5 / 10 mins), starting garbage rows (0–10), preview count (1–5), and ghost/hold toggles.

---

## 🏆 The Dhokla Masters Club & Rewards

- **4 Reward Tiers**:
  - 🥉 **Bronze**: Dhokla Rookie
  - 🥈 **Silver**: Dhokla Enthusiast
  - 🥇 **Gold**: Dhokla Master
  - 👑 **Platinum**: Dhokla Legend
- **Tadka Points Economy**: Earn points from line clears, combos, Tetrises, and challenges.
- **Cosmetic Unlocks**:
  - *Skins*: Classic Gujarati Dhokla, Khaman Special (Saffron Gold), Spicy Green Chili (Herb Infused), Royal Golden Dhokla.
  - *Board Frames*: Charcoal Kitchen, Royal Brass Thali, Curry Leaf Emerald, Saffron Festival.
  - *Player Titles*: Dhokla Apprentice, Fafda Fanatic, Tadka Specialist, Khaman Connoisseur, Master Chef, Dhokla Deity.

---

## 🕹️ Controls Guide

### Desktop Keyboard
| Key | Action |
|---|---|
| **Left Arrow** | Move left |
| **Right Arrow** | Move right |
| **Down Arrow** | Soft drop |
| **Up Arrow / X** | Rotate clockwise (SRS) |
| **Z** | Rotate counter-clockwise |
| **Space** | Hard drop (Smash) |
| **C** | Hold piece (once per placement) |
| **P / Escape** | Pause / Resume |

### Mobile & Tablet Touch
- **Dedicated Touchpad**: Large touch-friendly buttons for `LEFT`, `RIGHT`, `ROTATE CW`, `ROTATE CCW`, `SOFT DROP`, `HARD DROP (SMASH)`, and `HOLD`.
- **DAS (Delayed Auto Shift)**: Smooth continuous sliding when pressing and holding directional buttons.
- **Configurable Button Size**: Switch between Normal and Large button layouts.
- **Optional Swipe Gestures**: Tap to rotate, swipe left/right to move, swipe down to drop.

---

## 🔊 Audio & Haptic System

- **Zero-Dependency Web Audio API Synthesizer**:
  - Movement clicks, rotation swooshes, soft/hard drops with screen shake, lock clicks.
  - Chords for single, double, and triple clears.
  - Majestic fanfare for 4-line Tetris clears ("FOUR-LINE FEAST!").
  - Escalating pitch for spicy combos.
  - Synthesized Gujarati folk-arcade pentatonic soundtrack loop.
- **Mobile Haptics**: Tactile feedback on hard drops and major line clears.

---

## 🚀 Running the Game

To launch the local development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5050`.

To run the automated test suite:
```bash
npm run test
```

To build for production:
```bash
npm run build
```
