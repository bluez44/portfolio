'use client';

import { useState } from 'react';
import { SITE_URL } from '@/lib/site';

export function CopyLinkButton({ slug }: { slug: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${SITE_URL}/graduation?to=${slug}`);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 1500);
  };
  return (
    <button type="button" onClick={copy} className="text-xs text-sky-300 hover:text-sky-200">
      {state === 'copied' ? 'Copied ✓' : state === 'failed' ? 'Copy failed' : 'Copy link'}
    </button>
  );
}
