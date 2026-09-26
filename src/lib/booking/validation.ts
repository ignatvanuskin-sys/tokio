/**
 * Server-side validation. The client validates for UX; THIS is the authority.
 * Anything that reaches the database has already passed through here.
 */

import { z } from 'zod';
import { checkPhone } from '@/lib/phone';
import { addDays, venueDate } from '@/lib/time';
import { daySlotStarts, scheduleConfig } from '@/data/schedule';
import { getService } from '@/data/services';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^\d{2}:\d{2}$/;

const noControlChars = (s: string) => !/[\u0000-\u001f\u007f]/.test(s.replace(/[\n\t]/g, ''));

export const createBookingSchema = z.object({
  serviceSlug: z
    .string()
    .trim()
    .min(1, 'Выберите услугу')
    .refine((slug) => Boolean(getService(slug)), 'Неизвестная услуга'),

  slotDate: z
    .string()
    .trim()
    .regex(ISO_DATE, 'Некорректная дата')
    .refine((d) => {
      const today = venueDate();
      return d >= today && d <= addDays(today, scheduleConfig.horizonDays);
    }, 'Дата вне доступного периода записи'),

  slotTime: z
    .string()
    .trim()
    .regex(HHMM, 'Некорректное время')
    .refine((t) => daySlotStarts().includes(t), 'Это время недоступно для записи'),

  name: z
    .string()
    .trim()
    .min(2, 'Укажите имя')
    .max(80, 'Слишком длинное имя')
    .refine(noControlChars, 'Имя содержит недопустимые символы'),

  phone: z.string().trim().refine((value) => checkPhone(value).ok, 'Введите корректный номер телефона'),

  vehicleMake: z
    .string()
    .trim()
    .max(40, 'Слишком длинное название марки')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),

  vehicleModel: z
    .string()
    .trim()
    .max(60, 'Слишком длинное название модели')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),

  vehicleYear: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined || v === '') return null;
      const n = typeof v === 'number' ? v : Number(String(v).trim());
      return Number.isFinite(n) ? Math.trunc(n) : null;
    })
    .refine((y) => y === null || (y >= 1950 && y <= new Date().getFullYear() + 1), {
      message: 'Проверьте год выпуска',
    }),

  comment: z
    .string()
    .trim()
    .max(600, 'Комментарий слишком длинный (максимум 600 символов)')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),

  /** Client-generated UUID that makes retries safe. */
  idempotencyKey: z.string().trim().uuid('Некорректный ключ идемпотентности'),
});

export type CreateBookingPayload = z.infer<typeof createBookingSchema>;

export const loginSchema = z.object({
  password: z.string().min(1, 'Введите пароль').max(200, 'Пароль слишком длинный'),
});

/** Turns a ZodError into a field->message map for the client. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
