import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { adminConfigured, isAdminRequest } from '@/lib/auth';
import { LoginForm } from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Вход в панель',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLoginPage() {
  if (await isAdminRequest()) redirect('/admin');

  const configured = adminConfigured();
  const ready = configured.password && configured.secret;

  return (
    <div className="shell flex min-h-[70svh] items-center py-12">
      <div className="mx-auto w-full max-w-sm">
        <span className="eyebrow">Панель сервиса</span>
        <h1 className="mt-2 text-display-3 font-semibold text-white">Вход владельца</h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-steel-400">
          Здесь видны заявки с сайта: время, клиент, телефон и услуга. Доступ по паролю из
          переменной окружения <code className="font-mono text-steel-200">ADMIN_PASSWORD</code>.
        </p>

        <div className="mt-6">
          <LoginForm ready={ready} missing={!configured.password ? 'ADMIN_PASSWORD' : !configured.secret ? 'ADMIN_SESSION_SECRET' : null} />
        </div>
      </div>
    </div>
  );
}
