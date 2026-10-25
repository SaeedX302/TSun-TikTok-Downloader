import { useEffect, useState } from 'react';
import type { Platform } from '../ui/types';

export type { Platform };

const ANDROID = /Android/i;
const IOS = /iPhone|iPad|iPod/i;

function fromQuery(): Platform | null {
  try {
    const value = new URLSearchParams(window.location.search).get('ui');
    if (value === 'android' || value === 'ios') return value;
    if (value === 'web' || value === 'desktop') return 'desktop';
  } catch {
    // Ignore malformed URLs.
  }
  return null;
}

export function detectPlatform(): Platform {
  const forced = fromQuery();
  if (forced) return forced;

  const current = document.documentElement.dataset.platform;
  if (current === 'android' || current === 'ios' || current === 'desktop') {
    return current;
  }

  const ua = navigator.userAgent;

  if (ANDROID.test(ua)) return 'android';
  if (IOS.test(ua)) return 'ios';

  // iPadOS reports itself as a Mac; touch points reveal the difference.
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    return 'ios';
  }

  return 'desktop';
}

/**
 * Picks the interface language for the current device.
 *
 * `?ui=android` / `?ui=ios` / `?ui=web` is available for previewing another
 * platform without changing the user agent.
 */
export function usePlatform(): Platform {
  const [platform] = useState<Platform>(detectPlatform);

  useEffect(() => {
    document.documentElement.dataset.platform = platform;
  }, [platform]);

  return platform;
}
