export function Facebook({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export function Twitter({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
    </svg>
  );
}

export function Linkedin({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

export function Instagram({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1.5"/>
    </svg>
  );
}

export function Mail({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function Phone({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function Code({ size = 60 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" fill="none" stroke="currentColor" strokeWidth="2"/>
      <polyline points="8 6 2 12 8 18" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function Design({ size = 50 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 2a10 10 0 0 0-9.95 9h11.64L9.74 7.05a1 1 0 0 1 1.41-1.41l5.66 5.65a1 1 0 0 1 0 1.42l-5.66 5.65a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41L13.69 13H2.05A10 10 0 1 0 12 2z"/>
    </svg>
  );
}

export function Mobile({ size = 55 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function SocialMedia({ size = 30 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="8" cy="11" r="1"/>
      <circle cx="16" cy="11" r="1"/>
      <path d="M8.5 14.5s1.5 2 3.5 2 3.5-2 3.5-2" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function Write({ size = 30 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function CodeDev({ size = 30 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" fill="none" stroke="currentColor" strokeWidth="2"/>
      <polyline points="8 6 2 12 8 18" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function Home({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function HelpCircle({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" fill="none" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function Services({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
      <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
      <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
      <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"/>
      <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"/>
      <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function Blog({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <polyline points="13 2 13 9 20 9" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function ChevronLeft({ size = 40 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function ChevronRight({ size = 40 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function UserIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function Target({ size = 24 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function Palette({ size = 24 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 2-.8 2-2 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3c3 0 5.7-2.4 5.7-5.4C23 6.4 18.1 2 12 2z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="6.5" cy="11.5" r="1.5"/>
      <circle cx="9.5" cy="7.5" r="1.5"/>
      <circle cx="14.5" cy="7.5" r="1.5"/>
      <circle cx="17.5" cy="11.5" r="1.5"/>
    </svg>
  );
}

export function CodeBrackets({ size = 24 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" fill="none" stroke="currentColor" strokeWidth="2"/>
      <polyline points="8 6 2 12 8 18" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function CheckSquare({ size = 24 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <polyline points="9 11 12 14 22 4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function Rocket({ size = 24 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
