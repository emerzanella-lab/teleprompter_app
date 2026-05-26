// icons.jsx — SF-Symbol-style inline SVG icons

const Icon = {
  Plus: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M11 4v14M4 11h14" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Search: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.6"/>
      <path d="M11 11l3.5 3.5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Chevron: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size * 0.6} height={size} viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Back: ({ color = 'currentColor' }) => (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
      <path d="M10 2L2 10l8 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Close: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2 2l10 10M12 2L2 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Play: ({ size = 28, color = '#000' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M9 5.5l14 8.5-14 8.5V5.5z" fill={color}/>
    </svg>
  ),
  Pause: ({ size = 28, color = '#000' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="7" y="5" width="5" height="18" rx="1.5" fill={color}/>
      <rect x="16" y="5" width="5" height="18" rx="1.5" fill={color}/>
    </svg>
  ),
  Record: ({ size = 28, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="9" fill={color}/>
    </svg>
  ),
  Stop: ({ size = 24, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="6" y="6" width="12" height="12" rx="2" fill={color}/>
    </svg>
  ),
  Rewind: ({ size = 22, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M11 18a7 7 0 100-14 7 7 0 00-5 2.1M5 3v3.5h3.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Mirror: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2v16" stroke={color} strokeWidth="1.4" strokeDasharray="2 2"/>
      <path d="M3 6l5 4-5 4V6zM17 6l-5 4 5 4V6z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  Camera: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M3 7h3l1.5-2h7L16 7h3v11H3V7z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <circle cx="11" cy="12.5" r="3.5" stroke={color} strokeWidth="1.6"/>
    </svg>
  ),
  Mic: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="7" y="2" width="6" height="11" rx="3" stroke={color} strokeWidth="1.6"/>
      <path d="M4 9c0 3.3 2.7 6 6 6s6-2.7 6-6M10 15v3" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  TextSize: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <text x="2" y="14" fontFamily="-apple-system" fontWeight="700" fontSize="11" fill={color}>A</text>
      <text x="10" y="17" fontFamily="-apple-system" fontWeight="700" fontSize="16" fill={color}>A</text>
    </svg>
  ),
  Speed: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M3 12a8 8 0 0116 0" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M11 12l5-3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="11" cy="12" r="1.2" fill={color}/>
    </svg>
  ),
  Timer: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="12" r="7.5" stroke={color} strokeWidth="1.6"/>
      <path d="M11 7v5l3 2" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M8 2h6" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Remote: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <rect x="7" y="2" width="8" height="18" rx="3" stroke={color} strokeWidth="1.6"/>
      <circle cx="11" cy="6" r="1.2" fill={color}/>
      <path d="M9 11h4M9 14h4" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Sun: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="4" stroke={color} strokeWidth="1.6"/>
      <path d="M11 2v2M11 18v2M2 11h2M18 11h2M4.5 4.5l1.5 1.5M16 16l1.5 1.5M4.5 17.5L6 16M16 6l1.5-1.5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Trash: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 6h12M8 3h4M5.5 6l1 11h7l1-11" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 9v5M11.5 9v5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Edit: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M11 3l4 4-8 8H3v-4l8-8z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  Doc: ({ size = 28, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M7 4h10l5 5v15H7V4z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M17 4v5h5" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M11 14h6M11 18h6" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Paste: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="5" y="3" width="10" height="14" rx="1.5" stroke={color} strokeWidth="1.6"/>
      <rect x="7" y="2" width="6" height="3" rx="0.8" stroke={color} strokeWidth="1.6" fill="#fff"/>
    </svg>
  ),
  Share: ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2v11M6 6l4-4 4 4M4 12v5h12v-5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Check: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5l3 3 7-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Bluetooth: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M5 5l8 8-4 3V2l4 3-8 8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  FlipCamera: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M3 7h3l1.5-2h7L16 7h3v11H3V7z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M8 13a3 3 0 016 0M11 16l2-2-2-2" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
};

window.Icon = Icon;
