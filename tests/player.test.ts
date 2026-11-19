import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getVideoEl, seek, play, pause, currentTime } from '../src/lib/player';

describe('player', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('getVideoEl ritorna null senza <video>', () => {
    expect(getVideoEl()).toBeNull();
  });

  it('getVideoEl trova il tag video', () => {
    const v = document.createElement('video');
    document.body.appendChild(v);
    expect(getVideoEl()).toBe(v);
  });

  it('seek imposta currentTime', () => {
    const v = document.createElement('video');
    document.body.appendChild(v);
    seek(42.5);
    expect(v.currentTime).toBe(42.5);
  });

  it('seek senza video non lancia', () => {
    expect(() => seek(10)).not.toThrow();
  });

  it('play/pause chiamano i metodi del video', () => {
    const v = document.createElement('video');
    // jsdom non implementa play/pause: mock
    (v as any).play = vi.fn().mockResolvedValue(undefined);
    (v as any).pause = vi.fn();
    document.body.appendChild(v);
    play();
    pause();
    expect((v as any).play).toHaveBeenCalled();
    expect((v as any).pause).toHaveBeenCalled();
  });

  it('currentTime ritorna 0 senza video', () => {
    expect(currentTime()).toBe(0);
  });

  it('currentTime legge dal video', () => {
    const v = document.createElement('video');
    document.body.appendChild(v);
    // currentTime in jsdom è readonly-ish: assegniamolo via defineProperty
    Object.defineProperty(v, 'currentTime', { value: 12.3, writable: true, configurable: true });
    expect(currentTime()).toBe(12.3);
  });
});
