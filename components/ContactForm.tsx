'use client';
import { useState } from 'react';

/** Posts to /contact.php (PHP hosting). Shown only when NEXT_PUBLIC_PHP_CONTACT=1. */
export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');
  return (
    <form
      className="contact-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setState('sending');
        try {
          const r = await fetch('/contact.php', { method: 'POST', body: new FormData(e.currentTarget) });
          const j = await r.json();
          setState(j.ok ? 'ok' : 'err');
          setMsg(j.message || '');
        } catch {
          setState('err');
          setMsg('Could not send right now. Please email us instead.');
        }
      }}
    >
      <label className="ctl-text">
        <span>Your email</span>
        <input type="email" name="email" required maxLength={120} autoComplete="email" />
      </label>
      <label className="ctl-text">
        <span>Message</span>
        <textarea name="message" required minLength={10} maxLength={3000} rows={6} />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />
      <button type="submit" className="btn-primary" disabled={state === 'sending' || state === 'ok'}>
        {state === 'sending' ? 'Sending…' : state === 'ok' ? 'Sent ✓' : 'Send message'}
      </button>
      {msg && (
        <p className={state === 'ok' ? 'muted' : 'error'} role="status">
          {msg}
        </p>
      )}
    </form>
  );
}
