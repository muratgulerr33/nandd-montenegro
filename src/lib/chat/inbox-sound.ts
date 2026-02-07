/**
 * Web Audio preset notification sounds (no external files, no copyright risk).
 * Used for admin inbox new-message alert and guest new-message alert.
 * Singleton AudioContext: unlock once via user gesture (e.g. pointerdown), then play.
 */

export type InboxSoundPreset = 'soft_click' | 'pop' | 'ding' | 'chime' | 'none';

const PRESETS: Record<
  Exclude<InboxSoundPreset, 'none'>,
  { freq: number; duration: number; type: OscillatorType; gain: number; decay?: boolean }
> = {
  soft_click: { freq: 800, duration: 0.06, type: 'sine', gain: 0.15 },
  pop: { freq: 600, duration: 0.08, type: 'sine', gain: 0.2 },
  ding: { freq: 880, duration: 0.15, type: 'sine', gain: 0.18, decay: true },
  chime: { freq: 523, duration: 0.2, type: 'sine', gain: 0.12, decay: true },
};

let ctx: AudioContext | null = null;

export function getInboxAudioContextState(): { hasCtx: boolean; state: string } {
  if (typeof window === 'undefined') return { hasCtx: false, state: 'unknown' };
  return { hasCtx: ctx != null, state: ctx?.state ?? 'none' };
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return Ctx ?? null;
}

function playWithContext(ctx: AudioContext, config: (typeof PRESETS)['soft_click']): void {
  try {
    const gainNode = ctx.createGain();
    const osc = ctx.createOscillator();
    osc.type = config.type;
    osc.frequency.setValueAtTime(config.freq, ctx.currentTime);
    if (config.decay) {
      osc.frequency.exponentialRampToValueAtTime(config.freq * 0.6, ctx.currentTime + config.duration);
    }
    gainNode.gain.setValueAtTime(config.gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + config.duration);
  } catch {
    // fail silently
  }
}

/**
 * Unlock audio for this origin (call from a user gesture, e.g. first pointerdown).
 * Creates singleton AudioContext and optionally plays a silent beep for iOS/Chrome.
 */
export async function unlockInboxAudio(): Promise<void> {
  const debug = typeof localStorage !== 'undefined' && localStorage.getItem('debugInboxSound') === '1';
  const Ctx = getAudioContext();
  if (!Ctx) return;
  if (!ctx) ctx = new Ctx();
  const stateBefore = ctx.state;
  try {
    await ctx.resume();
    if (debug) console.info(`[inbox-sound] unlockInboxAudio state before=${stateBefore} after=${ctx.state}`);
    // Optional: very short silent beep for stricter iOS/Chrome policies (ignore errors)
    try {
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(1, ctx.currentTime);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.001);
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
}

/**
 * Play a preset sound using the singleton context. No-op if unlock was never called.
 */
export async function playInboxSound(preset: InboxSoundPreset): Promise<void> {
  const debug = typeof localStorage !== 'undefined' && localStorage.getItem('debugInboxSound') === '1';
  if (debug) console.info('[inbox-sound] playInboxSound called', { preset });
  if (preset === 'none') return;
  const config = PRESETS[preset as keyof typeof PRESETS];
  if (!config) return;
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') await ctx.resume();
    playWithContext(ctx, config);
  } catch {
    // fail silently
  }
}
