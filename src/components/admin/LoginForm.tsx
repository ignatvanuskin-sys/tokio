'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

export function LoginForm({ ready, missing }: { ready: boolean; missing: string | null }) {
  const id = useId();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-warn/40 bg-warn/10 p-4 text-[0.875rem] leading-relaxed text-warn"
      >
        <p className="font-semibold">Панель не настроена</p>
        <p className="mt-1.5">
          Не задана переменная окружения{' '}
          <code className="font-mono">{missing ?? 'ADMIN_PASSWORD'}</code>. Добавьте её в{' '}
          <code className="font-mono">.env</code> и перезапустите сервер:
        </p>
        <pre className="mt-2.5 overflow-x-auto rounded-lg bg-ink/60 p-3 font-mono text-[0.75rem] leading-relaxed text-steel-200">
{`ADMIN_PASSWORD=ваш-пароль
ADMIN_SESSION_SECRET=${'<'}48+ случайных символов${'>'}`}
        </pre>
        <p className="mt-2 text-[0.8125rem]">
          Сгенерировать секрет:{' '}
          <code className="font-mono">
            node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(48).toString(&apos;base64url&apos;))&quot;
          </code>
        </p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;

      if (!res.ok || !json?.ok) {
        setError(json?.message ?? 'Не удалось войти. Попробуйте ещё раз.');
        return;
      }

      setPassword('');
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Не удалось соединиться с сервером. Проверьте подключение.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5" noValidate>
      <label htmlFor={id} className="field-label">
        Пароль
      </label>
      <input
        id={id}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="field"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        required
      />

      {error && (
        <p id={`${id}-err`} role="alert" className="field-error">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}

      <button type="submit" disabled={busy || password.length === 0} className="btn btn-primary btn-block mt-5">
        {busy ? 'Проверяем…' : 'Войти'}
      </button>

      <p className="mt-3 text-[0.75rem] leading-relaxed text-steel-600">
        Сессия хранится в защищённой cookie на 12 часов. Пять неудачных попыток с одного адреса
        блокируют вход на 15 минут.
      </p>
    </form>
  );
}
