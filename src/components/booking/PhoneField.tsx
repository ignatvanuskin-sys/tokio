'use client';

import { useId, useRef, useState } from 'react';
import { checkPhone, digitsOf, formatAsYouType } from '@/lib/phone';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  required?: boolean;
  autoFocus?: boolean;
};

/**
 * Kazakhstan phone field.
 *
 * · `type="tel"` + `inputMode="tel"` → the phone keypad opens on mobile.
 * · The mask is applied to the DIGITS, so paste works from any source
 *   ("+7 778 998 88 77", "87789988877", "8 (778) 998-88-77", "778998877").
 * · The caret is kept at the end of the value, which is what a masked field
 *   should do; deleting digits reformats naturally.
 * · Validation happens on blur and on submit, never on the first keystroke, so
 *   the user is not shouted at while typing.
 */
export function PhoneField({ value, onChange, onBlur, error, required = true, autoFocus }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);

  const handleChange = (raw: string) => {
    // Keep at most 11 digits (8 + 10 national, or 7 + 10) to avoid runaway input.
    const digits = digitsOf(raw).slice(0, 11);
    if (digits.length === 0) {
      onChange('');
      return;
    }
    onChange(formatAsYouType(digits));
  };

  const check = checkPhone(value);
  const showError = Boolean(error) || (touched && value.length > 0 && !check.ok);

  return (
    <div>
      <label htmlFor={id} className="field-label">
        Телефон{required && <span className="text-accent-bright"> *</span>}
      </label>

      <input
        id={id}
        ref={inputRef}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        enterKeyHint="next"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => {
          setTouched(true);
          // Normalise a pasted value into the canonical grouped form.
          if (value) onChange(formatAsYouType(value));
          onBlur?.();
        }}
        placeholder="+7 (778) 998-88-77"
        aria-invalid={showError || undefined}
        aria-describedby={showError ? errorId : `${id}-hint`}
        className="field tnum"
      />

      {showError ? (
        <p id={errorId} className="field-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error || (!check.ok ? check.message : 'Введите корректный номер телефона')}
        </p>
      ) : (
        <p id={`${id}-hint`} className="field-hint">
          Казахстанский номер. Можно вставить из буфера — формат подставится сам.
        </p>
      )}
    </div>
  );
}
