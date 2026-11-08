'use client';

import { useState } from 'react';
import { SITE_URL } from '@/lib/site';

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(`${SITE_URL}/graduation?to=${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button type="button" onClick={copy} className="text-xs text-sky-300 hover:text-sky-200">
      {copied ? 'Copied ✓' : 'Copy link'}
    </button>
  );
}
