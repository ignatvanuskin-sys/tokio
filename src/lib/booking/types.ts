export type BookingStatus = 'new' | 'confirmed' | 'done' | 'cancelled';

export const BOOKING_STATUSES: BookingStatus[] = ['new', 'confirmed', 'done', 'cancelled'];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  done: 'Выполнена',
  cancelled: 'Отменена',
};

export type BookingRecord = {
  id: string;
  createdAt: string;
  /** Venue-local calendar date, "YYYY-MM-DD". */
  slotDate: string;
  /** Venue-local wall clock, "HH:MM". */
  slotTime: string;
  status: BookingStatus;

  serviceSlug: string;
  serviceTitle: string;

  customerId: string | null;
  customerName: string;
  /** Always stored in E.164. */
  customerPhone: string;

  vehicleId: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;

  comment: string | null;
  /** Client-supplied key that makes retries safe. */
  idempotencyKey: string;
  source: string;
};

export type SlotAvailability = {
  time: string;
  taken: number;
  capacity: number;
  available: boolean;
  /** Present only when the slot is still in the future and within the horizon. */
  bookable: boolean;
};

export type DayAvailability = {
  date: string;
  timeZone: string;
  slotMinutes: number;
  slots: SlotAvailability[];
};

export type CreateBookingInput = {
  slotDate: string;
  slotTime: string;
  serviceSlug: string;
  serviceTitle: string;
  name: string;
  /** E.164 */
  phone: string;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  comment?: string | null;
  idempotencyKey: string;
  source?: string;
};

export type CreateBookingResult =
  | { ok: true; booking: BookingRecord; duplicate: boolean }
  | {
      ok: false;
      code: 'slot_taken' | 'slot_not_bookable' | 'server_error';
      message: string;
      /** Fresh availability so the client can re-render the picker. */
      availability?: DayAvailability;
    };

export type BookingFilter = {
  from?: string;
  to?: string;
  status?: BookingStatus;
  serviceSlug?: string;
};

export interface BookingStore {
  readonly backend: 'postgres' | 'demo';
  /** Verifies connectivity / creates demo storage. */
  init(): Promise<void>;
  health(): Promise<{ ok: boolean; backend: string; detail?: string }>;
  availability(dateKey: string, now?: Date): Promise<DayAvailability>;
  createBooking(input: CreateBookingInput, now?: Date): Promise<CreateBookingResult>;
  listBookings(filter: BookingFilter): Promise<BookingRecord[]>;
  getBooking(id: string): Promise<BookingRecord | null>;
  setStatus(id: string, status: BookingStatus): Promise<BookingRecord | null>;
  countsByStatus(from: string, to: string): Promise<Record<BookingStatus, number>>;
}
