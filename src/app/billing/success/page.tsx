import Link from 'next/link';
import type { CSSProperties } from 'react';
import styles from './success.module.css';

const confettiPieces = [
  { x: '6%', delay: '0s', dur: '4.6s', size: '10px', rot: '12deg', drift: '-18px', color: '#60a5fa', shape: 'square' },
  { x: '12%', delay: '0.2s', dur: '3.8s', size: '8px', rot: '42deg', drift: '16px', color: '#93c5fd', shape: 'circle' },
  { x: '18%', delay: '0.35s', dur: '4.2s', size: '12px', rot: '18deg', drift: '-10px', color: '#3b82f6', shape: 'triangle' },
  { x: '24%', delay: '0.6s', dur: '3.6s', size: '9px', rot: '28deg', drift: '12px', color: '#38bdf8', shape: 'square' },
  { x: '30%', delay: '0.15s', dur: '4.4s', size: '11px', rot: '8deg', drift: '-14px', color: '#0ea5e9', shape: 'circle' },
  { x: '36%', delay: '0.4s', dur: '3.9s', size: '8px', rot: '48deg', drift: '18px', color: '#93c5fd', shape: 'triangle' },
  { x: '42%', delay: '0.5s', dur: '4.1s', size: '10px', rot: '22deg', drift: '-8px', color: '#bfdbfe', shape: 'square' },
  { x: '48%', delay: '0.8s', dur: '3.7s', size: '13px', rot: '32deg', drift: '10px', color: '#3b82f6', shape: 'circle' },
  { x: '54%', delay: '0.1s', dur: '4.5s', size: '9px', rot: '14deg', drift: '-12px', color: '#60a5fa', shape: 'triangle' },
  { x: '60%', delay: '0.3s', dur: '3.5s', size: '8px', rot: '38deg', drift: '16px', color: '#93c5fd', shape: 'square' },
  { x: '66%', delay: '0.55s', dur: '4s', size: '11px', rot: '26deg', drift: '-10px', color: '#0ea5e9', shape: 'circle' },
  { x: '72%', delay: '0.7s', dur: '3.8s', size: '9px', rot: '18deg', drift: '12px', color: '#60a5fa', shape: 'triangle' },
  { x: '78%', delay: '0.95s', dur: '4.2s', size: '7px', rot: '20deg', drift: '-16px', color: '#bfdbfe', shape: 'square' },
  { x: '84%', delay: '1.1s', dur: '3.9s', size: '10px', rot: '30deg', drift: '10px', color: '#3b82f6', shape: 'circle' },
  { x: '90%', delay: '1.25s', dur: '4.3s', size: '8px', rot: '36deg', drift: '-12px', color: '#93c5fd', shape: 'triangle' },
  { x: '94%', delay: '1.05s', dur: '3.7s', size: '10px', rot: '24deg', drift: '18px', color: '#60a5fa', shape: 'square' },
  { x: '16%', delay: '1.4s', dur: '4.1s', size: '9px', rot: '40deg', drift: '-10px', color: '#0ea5e9', shape: 'circle' },
  { x: '64%', delay: '1.3s', dur: '4s', size: '8px', rot: '16deg', drift: '14px', color: '#bfdbfe', shape: 'triangle' }
];

export default function BillingSuccessPage() {
  return (
    <div className={styles.page}>
      <div className={styles.glowLayer} aria-hidden="true" />
      <div className={styles.confetti} aria-hidden="true">
        {confettiPieces.map((piece, index) => (
          <span
            key={index}
            className={`${styles.confettiPiece} ${styles[piece.shape]}`}
            style={
              {
                '--x': piece.x,
                '--delay': piece.delay,
                '--dur': piece.dur,
                '--size': piece.size,
                '--rot': piece.rot,
                '--drift': piece.drift,
                '--color': piece.color
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.badge}>Payment complete</div>
        <h1>Welcome to your upgraded plan.</h1>
        <p>
          You are all set. Your new limits are active, and the team can keep the
          momentum going without caps getting in the way.
        </p>

        <div className={styles.actions}>
          <Link href="/dashboard/billing" className={styles.primaryBtn}>
            Go to Billing
          </Link>
          <Link href="/dashboard/chatbots" className={styles.secondaryBtn}>
            View Chatbots
          </Link>
        </div>

        <div className={styles.footerNote}>
          Need anything? Support is on standby.
        </div>
      </div>
    </div>
  );
}
