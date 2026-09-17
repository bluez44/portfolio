'use client';

import { useEffect } from 'react';

export function VisitorTracker() {
  useEffect(() => {
    // Call the visitor API to record the visit
    fetch('/api/visitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((err) => {
      console.error('Failed to record visit:', err);
    });
  }, []);

  return null; // This component doesn't render anything
}
