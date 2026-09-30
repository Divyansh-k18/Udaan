export function Icon({ name, className = "", ...props }) {
  const paths = {
    book: <><path d="M12 5v15M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1Z" /><path d="M6 8h3m6 0h3M6 12h3m6 0h3" /></>,
    chart: <><path d="M4 3v17h17M8 16v-5m5 5V7m5 9V4" /></>,
    settings: <><path d="M4 7h16M4 17h16" /><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3h.01"/></>,
    home: <><path d="m3 10 9-7 9 7v10H3ZM9 20v-7h6v7"/></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M6 11v1a6 6 0 0 0 12 0v-1m-6 7v3m-4 0h8"/></>,
    headphones: <><path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/></>,
    keyboard: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M5 9h1m3 0h1m3 0h1m3 0h1M5 13h1m3 0h1m3 0h1m3 0h1M8 16h8"/></>,
    display: <><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M12 17v4m-5 0h10m-5-17v12"/></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    stop: <rect x="5" y="5" width="14" height="14" rx="2"/>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg className={`ui-icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name] || paths.book}</svg>;
}

export function BrandMark() {
  return <svg className="brand-mark" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" rx="12" fill="currentColor"/><path d="m9 24 22-14-8 22-4-11Z" fill="var(--on-accent)"/><path d="m19 21 12-11" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>;
}

export function LearningIllustration() {
  return <svg className="learning-illustration" viewBox="0 0 560 330" fill="none" aria-hidden="true" focusable="false">
    <circle cx="300" cy="170" r="145" fill="var(--art-mint)"/>
    <circle cx="468" cy="64" r="27" fill="var(--art-sand)"/>
    <path d="M58 260h449" stroke="var(--line)" strokeWidth="2" strokeLinecap="round"/>
    <rect x="171" y="61" width="259" height="172" rx="17" fill="var(--surface)" stroke="var(--accent)" strokeWidth="3"/>
    <path d="M171 93h259" stroke="var(--line)" strokeWidth="2"/>
    <circle cx="189" cy="77" r="4" fill="var(--accent)"/><circle cx="203" cy="77" r="4" fill="var(--line)"/><circle cx="217" cy="77" r="4" fill="var(--line)"/>
    <rect x="194" y="114" width="152" height="8" rx="4" fill="var(--accent)"/>
    <rect x="194" y="133" width="201" height="6" rx="3" fill="var(--line)"/>
    <rect x="194" y="154" width="212" height="51" rx="9" fill="var(--surface-soft)" stroke="var(--accent)" strokeWidth="2"/>
    <circle cx="214" cy="179" r="10" fill="var(--accent)"/><path d="m210 179 3 3 6-7" stroke="var(--on-accent)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M239 175h139m-139 11h91" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"/>
    <path d="m153 234-17 24c51 9 272 9 320 0l-18-24Z" fill="var(--art-sand)" stroke="var(--accent)" strokeWidth="2"/>
    <g transform="translate(52 100) rotate(-8 60 70)"><rect width="103" height="144" rx="13" fill="var(--surface)" stroke="var(--accent)" strokeWidth="3"/><path d="M17 99h69M17 114h51" stroke="var(--line)" strokeWidth="4" strokeLinecap="round"/><path d="M24 64V47a28 28 0 0 1 56 0v17" stroke="var(--accent)" strokeWidth="6"/><rect x="18" y="50" width="14" height="30" rx="6" fill="var(--accent)"/><rect x="72" y="50" width="14" height="30" rx="6" fill="var(--accent)"/></g>
    <g transform="translate(394 208) rotate(9)"><rect width="100" height="70" rx="14" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2"/><path d="m32 34 12 12 27-29" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/></g>
    <path d="m112 49 8-13 8 13m-8-13v26M461 128l9 8 14-16" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="146" cy="286" r="6" fill="var(--accent)"/><circle cx="490" cy="173" r="7" fill="var(--art-sand)"/>
  </svg>;
}
