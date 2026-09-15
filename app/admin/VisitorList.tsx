'use client';

import { useEffect, useState } from 'react';

type Visitor = {
  id: string;
  ip: string;
  city: string;
  country: string;
  userAgent: string;
  createdAt: string;
};

export default function VisitorList() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/visitor')
      .then(async res => {
        if (!res.ok) {
          throw new Error('Failed to fetch visitors');
        }
        return res.json();
      })
      .then(data => {
        setVisitors(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-zinc-400">Loading visitors...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (visitors.length === 0) {
    return <div className="text-zinc-400">No visitors found.</div>;
  }

  return (
    <div className="overflow-x-auto border border-zinc-800 rounded-lg">
      <table className="min-w-full text-left text-sm whitespace-nowrap">
        <thead className="uppercase tracking-wider border-b border-zinc-800 bg-zinc-900/50">
          <tr>
            <th className="px-6 py-4">IP Address</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Device / User Agent</th>
            <th className="px-6 py-4">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {visitors.map((v) => (
            <tr key={v.id} className="hover:bg-zinc-900/30 transition">
              <td className="px-6 py-4">{v.ip}</td>
              <td className="px-6 py-4">{v.city}, {v.country}</td>
              <td className="px-6 py-4 max-w-xs truncate" title={v.userAgent}>
                {v.userAgent}
              </td>
              <td className="px-6 py-4 text-zinc-400">
                {new Date(v.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
