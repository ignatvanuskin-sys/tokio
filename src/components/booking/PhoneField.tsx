'use client';

import { useId, useState } from 'react';
import { checkPhone, digitsOf, formatAsYouType } from '@/lib/phone';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  required?: boolean;
};

/**
 * Kazakhstan phone field.
 *
 * · `type="tel"` + `inputMode="tel"` open the phone keypad on mobile.
 * · The mask is applied to the DIGITS, so paste works from any source
 *   ("+7 778 998 88 77", "87789988877", "8 (778) 998-88-77", "778998877").
 * · Validation runs on blur and on submit, never on the first keystroke — the
 *   user is not shouted at mid-typing.
 */
export function PhoneField({ value, onChange, onBlur, error, required = true }: Props) {
  const id = useId();
  const [touched, setTouched] = useState(false);

  const handleChange = (raw: string) => {
    const digits = digitsOf(raw).slice(0, 11);
    onChange(digits.length === 0 ? '' : formatAsYouType(digits));
  };

  const check = checkPhone(value);
  const showError = Boolean(error) || (touched && value.length > 0 && !check.ok);

  return (
    <div>
      <label htmlFor={id} className="label">
        Телефон{required && <span className="text-accent"> *</span>}
      </label>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        enterKeyHint="done"
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
        aria-describedby={showError ? `${id}-error` : `${id}-hint`}
        className="field tnum"
      />

      {showError ? (
        <p id={`${id}-error`} className="error-text" role="alert">
          <span aria-hidden="true">⚠</span>
          {error || (!check.ok ? check.message : 'Введите корректный номер телефона')}
        </p>
      ) : (
        <p id={`${id}-hint`} className="hint mt-1">
          По нему подтвердим запись — звонком или в WhatsApp. Можно вставить из буфера.
        </p>
      )}
    </div>
  );
}
