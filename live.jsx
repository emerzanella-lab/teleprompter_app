// live.jsx — Live teleprompter screen w/ 3 variants

const { useState: lsState, useEffect: lsEffect, useRef: lsRef, useMemo: lsMemo, useCallback: lsCB } = React;

// ─── Camera hook ──────────────────────────────────────────────────────
function useCamera(enabled, frontCamera) {
  const [stream, setStream] = lsState(null);
  const [error, setError] = lsState(null);
  lsEffect(() => {
    if (!enabled) {
      setStream(null);
      return;
    }
    let active = true;
    let s;
    navigator.mediaDevices?.getUserMedia({
      video: { facingMode: frontCamera ? 'user' : 'environment' },
      audio: false,
    }).then(streamObj => {
      if (!active) { streamObj.getTracks().forEach(t => t.stop()); return; }
      s = streamObj;
      setStream(streamObj);
    }).catch(err => {
      console.warn('Camera unavailable:', err.message);
      setError(err.message);
    });
    return () => {
      active = false;
      if (s) s.getTracks().forEach(t => t.stop());
    };
  }, [enabled, frontCamera]);
  return { stream, error };
}

// ─── Recorder timer ───────────────────────────────────────────────────
function useTicker(running) {
  const [elapsed, setElapsed] = lsState(0);
  const startRef = lsRef(null);
  lsEffect(() => {
    if (!running) { startRef.current = null; return; }
    startRef.current = performance.now() - elapsed * 1000;
    let raf;
    const tick = () => {
      setElapsed((performance.now() - startRef.current) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  return [elapsed, setElapsed];
}

// ─── Live screen ──────────────────────────────────────────────────────
function LiveScreen({ script, settings, variant, onExit }) {
  const [playing, setPlaying] = lsState(false);
  const [countdown, setCountdown] = lsState(settings.countdown);
  const [showControls, setShowControls] = lsState(true);
  const [elapsed, setElapsed] = useTicker(playing);

  // live-tweakable settings (override pre-flight while in live)
  const [fontSize, setFontSize] = lsState(settings.fontSize);
  const [speed, setSpeed] = lsState(settings.speed);
  const [textPos, setTextPos] = lsState(settings.textPosition ?? 50);

  const videoRef = lsRef(null);
  const { stream, error: camError } = useCamera(settings.camera, settings.frontCamera);

  // attach stream
  lsEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Countdown timer
  lsEffect(() => {
    if (countdown <= 0) {
      if (settings.countdown > 0 && !playing) setPlaying(true);
      return;
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  // Auto-hide controls after a few seconds while playing
  lsEffect(() => {
    if (!playing || !showControls) return;
    const t = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(t);
  }, [playing, showControls]);

  // Reset everything
  const reset = () => {
    setPlaying(false);
    setElapsed(0);
    setCountdown(settings.countdown);
  };

  const togglePlay = () => {
    if (countdown > 0) return;
    setPlaying(!playing);
    setShowControls(true);
  };

  const wordCount = lsMemo(() => script.body.trim().split(/\s+/).filter(Boolean).length, [script.body]);

  return (
    <div className="live" data-screen-label={`04 Live (${variant})`}
         onClick={() => playing && setShowControls(s => !s)}>
      {/* Camera */}
      {settings.camera && stream ? (
        <video
          ref={videoRef}
          autoPlay playsInline muted
          className={`live-camera ${settings.frontCamera ? 'mirror' : ''}`}
        />
      ) : (
        <div className="live-camera fallback" />
      )}
      <div className="live-veil" />

      {/* Text */}
      <div
        className="live-text-area"
        style={{ transform: settings.mirror ? 'scaleX(-1)' : 'none' }}
      >
        {variant === 'classic' && (
          <ClassicScroll body={script.body} fontSize={fontSize} speed={speed} playing={playing} elapsed={elapsed} textPos={textPos} />
        )}
        {variant === 'focus' && (
          <FocusScroll body={script.body} fontSize={fontSize} speed={speed} playing={playing} elapsed={elapsed} textPos={textPos} />
        )}
        {variant === 'karaoke' && (
          <KaraokeScroll body={script.body} fontSize={fontSize} speed={speed} playing={playing} elapsed={elapsed} textPos={textPos} />
        )}
      </div>

      <div className="live-fade-top" />
      <div className="live-fade-bottom" />

      {/* Variant overlays */}
      {variant === 'classic' && (
        <div className="tp-marker" style={{ top: `${textPos}%` }}>
          <div className="triangle left" />
          <div className="triangle right" />
        </div>
      )}
      {variant === 'focus' && (
        <div className="focus-band" style={{ top: `${textPos}%` }} />
      )}

      {/* Top bar */}
      {showControls && (
        <div className="live-top">
          <button className="live-pill-icon" onClick={onExit} aria-label="Sair">
            <Icon.Close size={16} color="#fff" />
          </button>
          {settings.record && (
            <div className="rec-chip">
              <div className="rec-dot" />
              REC {fmtTime(elapsed)}
            </div>
          )}
          <button className="live-pill-icon" onClick={reset} aria-label="Reiniciar">
            <Icon.Rewind color="#fff" />
          </button>
        </div>
      )}

      {/* Countdown */}
      {countdown > 0 && (
        <div className="countdown">
          <div className="countdown-num" key={countdown}>{countdown}</div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="live-controls" onClick={(e) => e.stopPropagation()}>
          {/* live sliders */}
          <div className="live-control-row">
            <div className="live-pill" style={{ flex: 1, gap: 12 }}>
              <Icon.TextSize size={20} color="#fff" />
              <input
                type="range" className="ios-slider"
                min={24} max={120} step={2}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: 32, textAlign: 'right' }}>{fontSize}</span>
            </div>
          </div>
          <div className="live-control-row">
            <div className="live-pill" style={{ flex: 1, gap: 12 }}>
              <Icon.Speed size={20} color="#fff" />
              <input
                type="range" className="ios-slider"
                min={0.4} max={3} step={0.1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: 32, textAlign: 'right' }}>{speed.toFixed(1)}×</span>
            </div>
          </div>
          <div className="live-control-row">
            <div className="live-pill" style={{ flex: 1, gap: 12 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="14" height="14" rx="2" stroke="#fff" strokeWidth="1.4" opacity="0.6"/>
                <rect x="5" y={3 + (textPos / 100) * 10} width="10" height="2.5" rx="0.8" fill="#fff"/>
              </svg>
              <input
                type="range" className="ios-slider"
                min={10} max={90} step={5}
                value={textPos}
                onChange={(e) => setTextPos(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: 36, textAlign: 'right' }}>{textPos}%</span>
            </div>
          </div>

          {/* play/pause + reset */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                {fmtTime(elapsed)} · {wordCount} palavras
              </div>
            </div>
            <button className={`live-play ${settings.record ? 'recording' : ''}`} onClick={togglePlay}>
              {playing
                ? <Icon.Pause size={32} color={settings.record ? '#fff' : '#000'} />
                : <Icon.Play size={32} color={settings.record ? '#fff' : '#000'} />}
            </button>
            <button onClick={onExit} style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 600 }}>
                Concluir
              </div>
            </button>
          </div>
        </div>
      )}

      {/* When controls hidden during play, show a tap hint briefly */}
      {!showControls && playing && (
        <div style={{
          position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
          color: 'rgba(255,255,255,0.35)', fontSize: 12,
          pointerEvents: 'none',
        }}>
          Toque para mostrar controles
        </div>
      )}
    </div>
  );
}

// ─── Variant: Classic vertical scroll ─────────────────────────────────
// pixels per second computed from font size & speed multiplier so that
// at speed 1.0, we read ~150 WPM (about 1 line per ~3 seconds).
function ClassicScroll({ body, fontSize, speed, playing, elapsed, textPos = 50 }) {
  const containerRef = lsRef(null);
  const contentRef = lsRef(null);
  const [containerH, setContainerH] = lsState(700);
  const [contentH, setContentH] = lsState(0);

  lsEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerH(containerRef.current.clientHeight);
      if (contentRef.current) setContentH(contentRef.current.scrollHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [body, fontSize]);

  // Scroll: start at halfway down (so first line lands at center marker),
  // go negative by px = elapsed * pxPerSec
  const pxPerSec = fontSize * 0.6 * speed; // ~one font-size unit every ~1.7s at 1x
  const anchor = containerH * (textPos / 100);
  const offset = playing || elapsed > 0
    ? anchor - elapsed * pxPerSec
    : anchor;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div
        ref={contentRef}
        className="tp-scroll"
        style={{
          transform: `translateY(${offset}px)`,
          fontSize: fontSize,
          lineHeight: 1.35,
          willChange: 'transform',
          // we don't transition during play; transition only the pause case via JS would be too tricky.
        }}
      >
        {body.split(/\n\n+/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        {/* tail padding to scroll past end */}
        <div style={{ height: containerH }} />
      </div>
    </div>
  );
}

// ─── Variant: Focus band ──────────────────────────────────────────────
// Identical scrolling, but uses a wider center band rather than triangles.
// The text in the focus band naturally appears clearer due to the band overlay.
function FocusScroll({ body, fontSize, speed, playing, elapsed, textPos = 50 }) {
  return <ClassicScroll body={body} fontSize={fontSize} speed={speed} playing={playing} elapsed={elapsed} textPos={textPos} />;
}

// ─── Variant: Karaoke (word-by-word highlight, auto-center) ───────────
function KaraokeScroll({ body, fontSize, speed, playing, elapsed, textPos = 50 }) {
  const containerRef = lsRef(null);
  const wordRefs = lsRef([]);
  const [activeIdx, setActiveIdx] = lsState(0);
  const [offset, setOffset] = lsState(0);

  const tokens = lsMemo(() => {
    // Split into tokens that preserve paragraph breaks
    const out = [];
    body.split(/\n\n+/).forEach((para, pi) => {
      para.split(/\s+/).filter(Boolean).forEach(w => out.push({ kind: 'word', text: w }));
      out.push({ kind: 'break' });
    });
    return out;
  }, [body]);

  const words = lsMemo(() => tokens.filter(t => t.kind === 'word'), [tokens]);

  // 150 WPM at speed 1.0 = 2.5 words/sec
  const wordsPerSec = 2.5 * speed;
  const currentWord = Math.min(words.length - 1, Math.floor(elapsed * wordsPerSec));

  lsEffect(() => {
    setActiveIdx(currentWord);
  }, [currentWord]);

  // Center the active word at textPos
  lsEffect(() => {
    if (!containerRef.current) return;
    const el = wordRefs.current[activeIdx];
    if (!el) return;
    const cH = containerRef.current.clientHeight;
    const wordTop = el.offsetTop;
    const wordH = el.offsetHeight;
    setOffset(cH * (textPos / 100) - wordTop - wordH / 2);
  }, [activeIdx, fontSize, textPos]);

  let wIdx = -1;
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div
        className="tp-scroll"
        style={{
          transform: `translateY(${offset}px)`,
          transition: 'transform 0.35s cubic-bezier(.3,.7,.4,1)',
          fontSize: fontSize,
          lineHeight: 1.4,
          padding: '0 28px',
        }}
      >
        {tokens.map((tok, i) => {
          if (tok.kind === 'break') return <div key={i} style={{ height: '1.2em' }} />;
          wIdx++;
          const myIdx = wIdx;
          const cls = myIdx < activeIdx ? 'past'
                    : myIdx === activeIdx ? 'active'
                    : 'future';
          return (
            <span
              key={i}
              ref={el => (wordRefs.current[myIdx] = el)}
              className={`tp-word ${cls}`}
              style={{ display: 'inline-block', margin: '0 0.18em' }}
            >
              {tok.text}
            </span>
          );
        })}
        <div style={{ height: '50vh' }} />
      </div>
    </div>
  );
}

Object.assign(window, { LiveScreen });
