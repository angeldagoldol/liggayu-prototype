import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { readStorage, removeStorage, writeStorage } from '../../lib/storage.js';
import { Button, Field, Hanko, Input } from '../ui/index.js';
import { validateEmail } from './newsletter.js';
import { japanNow, nextSeason } from './japanTime.js';
import styles from './NewsletterForm.module.css';

const STORAGE_KEY = 'newsletter';

/**
 * "Seasonal letters" sign-up: one email per season. Validates on submit
 * (then live while fixing), confirms with a toast and remembers the address
 * locally (demo — nothing is sent anywhere).
 */
export function NewsletterForm() {
  const toast = useToast();
  const inputRef = useRef(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [subscribed, setSubscribed] = useState(() => readStorage(STORAGE_KEY, null));

  const onSubmit = (event) => {
    event.preventDefault();
    const message = validateEmail(email);
    setError(message);
    if (message) {
      inputRef.current?.focus();
      return;
    }
    const record = { email: email.trim(), since: new Date().toISOString() };
    writeStorage(STORAGE_KEY, record);
    setSubscribed(record);
    setEmail('');
    const next = nextSeason(japanNow().season.id);
    toast({
      title: 'Subscribed — arigatō!',
      description: `Your first seasonal letter arrives with ${next.label.toLowerCase()} (${next.jp}).`,
      tone: 'success',
    });
  };

  if (subscribed?.email) {
    return (
      <div className={styles.done} role="status">
        <Hanko text="済" size={46} title="Done" />
        <div>
          <p className={styles.doneText}>
            You’re on the list as <strong className={styles.email}>{subscribed.email}</strong>. Four letters a year, one
            per season.
          </p>
          <button
            type="button"
            className={styles.change}
            onClick={() => {
              removeStorage(STORAGE_KEY);
              setSubscribed(null);
            }}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit}>
      <Field label="Email address" error={error} className={styles.field}>
        <Input
          ref={inputRef}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="hanako@example.com"
          className={styles.input}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(validateEmail(event.target.value));
          }}
        />
      </Field>
      <Button type="submit" variant="accent" className={styles.submit} iconRight={<ArrowRight />}>
        Subscribe
      </Button>
    </form>
  );
}
