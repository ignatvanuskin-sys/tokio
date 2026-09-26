'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.replace('/admin/login');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={() => void logout()} disabled={busy} className="btn btn-secondary btn-sm">
      {busy ? 'Выходим…' : 'Выйти'}
    </button>
  );
}
