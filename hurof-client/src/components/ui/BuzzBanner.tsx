import { Bell } from 'lucide-react';

interface BuzzBannerProps {
  playerName: string;
  onReset?: () => void;
  showReset?: boolean;
  timerSecondsLeft?: number;
  timerPhase?: 1 | 2 | null;
}

export function BuzzBanner({
  playerName,
  onReset,
  showReset,
  timerSecondsLeft,
  timerPhase,
}: BuzzBannerProps) {
  const hasTimer   = timerPhase != null && (timerSecondsLeft ?? 0) > 0;
  const isLow      = (timerSecondsLeft ?? 0) <= 5;
  const timerColor = isLow
    ? '#f87171'
    : timerPhase === 1
    ? 'var(--gold)'
    : '#7DAFE8';

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        /* Fixed overlay — slides in from top, never pushes layout */
        position:   'fixed',
        top:        0,
        left:       0,
        right:      0,
        zIndex:     50,

        /* Slide-down entrance */
        animation: 'buzz-strip-drop 0.38s cubic-bezier(0.22,1,0.36,1) both',

        /* Cinematic dark glass strip */
        background:     'linear-gradient(180deg, rgba(2,2,10,0.97) 0%, rgba(12,13,17,0.96) 100%)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom:   '1px solid var(--border-gold)',
        boxShadow:      '0 4px 40px rgba(0,0,0,0.7), 0 0 60px rgba(201,168,76,0.08)',

        /* Strip sizing — compact, never grows beyond readable height */
        padding:   '0 clamp(1rem, 3vw, 2.5rem)',
        minHeight: '72px',
        maxHeight: '120px',

        /* Inner layout: RTL row, vertically centred */
        display:        'flex',
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            'clamp(0.75rem, 2vw, 1.5rem)',
        direction:      'rtl',
      }}
    >
      {/* ── Gold accent line at top edge ── */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     2,
          background: 'linear-gradient(90deg, transparent 0%, var(--gold) 40%, var(--gold-bright) 50%, var(--gold) 60%, transparent 100%)',
          opacity:    0.6,
        }}
      />

      {/* ── LEFT group: bell + name + subtitle ── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        'clamp(0.5rem, 1.5vw, 1rem)',
          minWidth:   0,    /* allow text to shrink/truncate */
          flex:       '1 1 0',
        }}
      >
        {/* Bell icon with subtle glow ring */}
        <div
          aria-hidden="true"
          style={{
            position:   'relative',
            flexShrink: 0,
            color:      'var(--gold)',
            filter:     'drop-shadow(0 0 10px rgba(201,168,76,0.65))',
            animation:  'float-in-scale 0.4s 0.05s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          {/* Expanding ring — purely decorative */}
          <div
            style={{
              position:     'absolute',
              inset:        '-6px',
              borderRadius: '50%',
              border:       '1px solid rgba(201,168,76,0.35)',
              animation:    'ring-expand 1.8s ease-out 0.2s infinite',
              pointerEvents:'none',
            }}
          />
          <Bell size={28} strokeWidth={1.6} />
        </div>

        {/* Name + subtitle column */}
        <div
          style={{
            display:  'flex',
            flexDirection: 'column',
            gap:      2,
            minWidth: 0,
            animation:'banner-rise 0.42s 0.08s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {/* Player name — Amiri, prominent, gold gradient */}
          <div
            style={{
              fontFamily: "'Amiri', serif",
              fontSize:   'clamp(1.25rem, 3.5vw, 2rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, var(--gold-dim) 0%, var(--gold-bright) 50%, var(--gold-2) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
              whiteSpace: 'nowrap',
              overflow:   'hidden',
              textOverflow: 'ellipsis',
              maxWidth:   '40vw',
            }}
          >
            {playerName}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontFamily:    "'Cairo', sans-serif",
              fontSize:      'clamp(0.65rem, 1.4vw, 0.8rem)',
              fontWeight:    600,
              letterSpacing: '0.06em',
              color:         'var(--cream-2)',
              animation:     'float-in 0.35s 0.2s ease both',
            }}
          >
            ضغط أول!
          </div>
        </div>
      </div>

      {/* ── RIGHT group: timer + reset ── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        'clamp(0.5rem, 1.5vw, 1rem)',
          flexShrink: 0,
          animation:  'float-in 0.4s 0.15s ease both',
        }}
      >
        {/* Timer — inline pill */}
        {hasTimer && (
          <div
            aria-live="off"
            style={{
              display:      'flex',
              alignItems:   'baseline',
              gap:          '0.3em',
            }}
          >
            <span
              className="timer-num"
              style={{
                fontFamily:  "'Cairo', sans-serif",
                fontSize:    'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight:  900,
                lineHeight:  1,
                color:       timerColor,
                textShadow:  `0 0 24px ${timerColor}99, 0 0 48px ${timerColor}33`,
                transition:  'color 0.3s ease, text-shadow 0.3s ease',
              }}
            >
              {timerSecondsLeft}
            </span>
            <span
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontSize:   'clamp(0.6rem, 1.2vw, 0.72rem)',
                fontWeight: 600,
                color:      timerColor,
                opacity:    0.75,
                transition: 'color 0.3s ease',
                paddingBottom: '0.15em',
              }}
            >
              {timerPhase === 1 ? 'وقت الضغط' : 'وقت التفكير'}
            </span>
          </div>
        )}

        {/* Divider between timer and reset button */}
        {hasTimer && showReset && (
          <div
            aria-hidden="true"
            style={{
              width:      1,
              height:     32,
              background: 'var(--border-gold)',
              flexShrink: 0,
            }}
          />
        )}

        {/* Reset — compact ghost button, host-only */}
        {showReset && (
          <button
            onClick={onReset}
            style={{
              fontFamily:     "'Cairo', sans-serif",
              fontSize:       'clamp(0.7rem, 1.3vw, 0.8rem)',
              fontWeight:     700,
              padding:        '0.35em 0.9em',
              borderRadius:   '999px',
              border:         '1px solid rgba(255,255,255,0.15)',
              background:     'rgba(255,255,255,0.04)',
              color:          'var(--cream-2)',
              cursor:         'pointer',
              backdropFilter: 'blur(8px)',
              letterSpacing:  '0.04em',
              whiteSpace:     'nowrap',
              transition:     'background 0.18s ease, border-color 0.18s ease, color 0.18s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.background   = 'rgba(201,168,76,0.1)';
              el.style.borderColor  = 'rgba(201,168,76,0.4)';
              el.style.color        = 'var(--gold-2)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.background   = 'rgba(255,255,255,0.04)';
              el.style.borderColor  = 'rgba(255,255,255,0.15)';
              el.style.color        = 'var(--cream-2)';
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={e =>   { e.currentTarget.style.transform = 'scale(1)';    }}
          >
            إعادة ضبط الجرس
          </button>
        )}
      </div>
    </div>
  );
}
