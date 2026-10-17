import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { SEASON_MAP } from '../../data/seasons.js';
import { readStorage, writeStorage } from '../../lib/storage.js';
import { Button, Chip, Drawer, Field, Hanko, Input, Select, Textarea } from '../ui/index.js';
import {
  INTERESTS,
  MAX_TRAVELLERS,
  MESSAGE_LIMIT,
  appendInquiry,
  createInquiry,
  initialInquiry,
  toggleInterest,
  upcomingMonths,
  validateInquiry,
} from './inquiry.js';
import { MiniPage } from './MiniPage.jsx';
import { sealText } from './pageMeta.js';
import styles from './InquiryDrawer.module.css';

const SEND_DELAY = 900;
const FIELD_ORDER = ['name', 'email', 'month', 'travellers', 'message'];

/** − n + control. Receives id / aria-* from <Field> and puts them on its input. */
function Stepper({ value, onChange, min = 1, max = MAX_TRAVELLERS, ...inputProps }) {
  const n = Number(value) || min;
  return (
    <div className={styles.stepper}>
      <button type="button" className={styles.step} onClick={() => onChange(Math.max(min, n - 1))} disabled={n <= min} aria-label="One traveller fewer">
        <Minus aria-hidden="true" />
      </button>
      <input
        {...inputProps}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        className={styles.stepValue}
        value={value}
        onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
      />
      <button type="button" className={styles.step} onClick={() => onChange(Math.min(max, n + 1))} disabled={n >= max} aria-label="One more traveller">
        <Plus aria-hidden="true" />
      </button>
    </div>
  );
}

/** The brochure this inquiry is about, as a small ticket stub. */
function TripStub({ brochure }) {
  const seasons = (brochure.seasons ?? []).map((id) => SEASON_MAP[id]).filter(Boolean);
  return (
    <div className={styles.stub}>
      <span className={styles.stubCover}>
        <MiniPage brochure={brochure} face={0} />
      </span>
      <div className={styles.stubText}>
        <p className={styles.stubKicker}>Your trip</p>
        <p className={styles.stubTitle}>{brochure.title}</p>
        {seasons.length > 0 && (
          <p className={styles.stubSeasons}>
            Best in{' '}
            {seasons.map((s, i) => (
              <span key={s.id}>
                {i > 0 && (i === seasons.length - 1 ? ' & ' : ', ')}
                {s.label.toLowerCase()}{' '}
                <span lang="ja" className={styles.stubKanji} style={{ '--season': s.color }}>
                  {s.jp}
                </span>
              </span>
            ))}
          </p>
        )}
      </div>
      <Hanko text={sealText(brochure)} size={40} className={styles.stubSeal} />
    </div>
  );
}

/**
 * "Plan this trip" side drawer: name, email, travel month (next 12 months,
 * defaulting to the brochure's best season), travellers, interests and a
 * message. Validates inline, "sends" after a short delay, saves the
 * inquiry to localStorage (`inquiries`), confirms with a toast and closes.
 * A draft survives closing the drawer until it is sent.
 * Props: open, onClose, brochure.
 */
export function InquiryDrawer({ open, onClose, brochure }) {
  const toast = useToast();
  const uid = useId();
  const months = useMemo(() => upcomingMonths(new Date()), []);
  const [values, setValues] = useState(() => initialInquiry(brochure, months));
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const timer = useRef(null);
  const formId = `${uid}-form`;
  const ids = Object.fromEntries(FIELD_ORDER.map((f) => [f, `${uid}-${f}`]));
  const best = new Set(brochure.seasons ?? []);
  const organization = brochure.organization || 'The publisher';

  useEffect(() => () => clearTimeout(timer.current), []);

  const update = (field, value) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (attempted) setErrors(validateInquiry(next, months));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (sending) return;
    const found = validateInquiry(values, months);
    setErrors(found);
    setAttempted(true);
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    setSending(true);
    timer.current = setTimeout(() => {
      const record = createInquiry(values, brochure);
      writeStorage('inquiries', appendInquiry(readStorage('inquiries', []), record));
      setSending(false);
      setValues(initialInquiry(brochure, months));
      setErrors({});
      setAttempted(false);
      onClose();
      toast({
        title: 'Inquiry sent — arigatō!',
        description: `${organization} will reply to ${record.email} within two working days.`,
        tone: 'success',
      });
    }, SEND_DELAY);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Plan this trip"
      description={`Tell ${organization} when and how you would like to travel. No payment, no obligation.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="accent" loading={sending} iconRight={<ArrowUpRight />}>
            Send inquiry
          </Button>
        </>
      }
    >
      <form id={formId} className={styles.form} onSubmit={onSubmit} noValidate aria-busy={sending || undefined}>
        <TripStub brochure={brochure} />

        <Field id={ids.name} label="Your name" error={errors.name} required>
          <Input value={values.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" placeholder="Aiko Tanaka" />
        </Field>

        <Field id={ids.email} label="Email" hint="We only use it to reply about this trip." error={errors.email} required>
          <Input
            type="email"
            inputMode="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            autoComplete="email"
            placeholder="aiko@example.com"
          />
        </Field>

        <div className={styles.row}>
          <Field id={ids.month} label="Travel month" error={errors.month} required>
            <Select value={values.month} onChange={(e) => update('month', e.target.value)}>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                  {best.has(m.season) ? ' · best' : ''}
                </option>
              ))}
            </Select>
          </Field>
          <Field id={ids.travellers} label="Travellers" error={errors.travellers} required>
            <Stepper value={values.travellers} onChange={(n) => update('travellers', n)} />
          </Field>
        </div>

        <fieldset className={styles.interests}>
          <legend className={styles.legend}>
            Interests <span className={styles.optional}>optional</span>
          </legend>
          <div className={styles.chips}>
            {INTERESTS.map((interest) => (
              <Chip
                key={interest.id}
                selected={values.interests.includes(interest.id)}
                onClick={() => update('interests', toggleInterest(values.interests, interest.id))}
                icon={
                  <span lang="ja" className={styles.kanji}>
                    {interest.jp}
                  </span>
                }
              >
                {interest.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <Field
          id={ids.message}
          label="Anything else?"
          hint={`${values.message.length} / ${MESSAGE_LIMIT}`}
          error={errors.message}
        >
          <Textarea
            rows={4}
            value={values.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Dietary needs, a ryokan you have your eye on, a birthday to celebrate…"
          />
        </Field>
      </form>
    </Drawer>
  );
}
