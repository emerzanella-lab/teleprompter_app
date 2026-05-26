// live.jsx — Live teleprompter screen w/ 3 variants + optional recording

const { useState: lsState, useEffect: lsEffect, useRef: lsRef, useMemo: lsMemo, useCallback: lsCB } = React;

// ─── Camera + Audio hook ──────────────────────────────────────────────
function useCamera(enabled, frontCamera, withAudio) {
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
      video: {
        facingMode: frontCamera ? 'user' : 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: !!withAudio,
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
  }, [enabled, frontCamera, withAudio]);
  return { stream, error };
}

// ─── MediaRecorder hook ──────────────────────────────────────────────
function pickMime() {
  const candidates = [
    'video/mp4;codecs=avc1,mp4a',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

function useRecorder(stream, enabled, recording) {
  const recRef = lsRef(null);
  const chunksRef = lsRef([]);
  const mimeRef = lsRef('');
  const stopResolversRef = lsRef([]);
  const [blob, setBlob] = lsState(null);
  const [mime, setMime] = lsState('');
  const [supported, setSupported] = lsState(true);

  // Create / destroy recorder when stream + enabled changes
  lsEffect(() => {
    setBlob(null);
    if (!enabled || !stream) return;
    if (typeof MediaRecorder === 'undefined') {
      setSupported(false);
      return;
    }
    const m = pickMime();
    setMime(m);
    mimeRef.current = m;
    let rec;
    try {
      rec = new MediaRecorder(stream, m ? { mimeType: m } : undefined);
    } catch (e) {
      console.warn('MediaRecorder failed:', e.message);
      setSupported(false);
      return;
    }
    chunksRef.current = [];
    rec.ondataavailable = (e) => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const b = new Blob(chunksRef.current, { type: m || 'video/mp4' });
      setBlob(b);
      // resolve any pending stop() promises
      const resolvers = stopResolversRef.current;
      stopResolversRef.current = [];
      resolvers.forEach(r => r(b));
    };
    recRef.current = rec;
    return () => {
      try { if (rec.state !== 'inactive') rec.stop(); } catch {}
      recRef.current = null;
    };
  }, [enabled, stream]);

  // Start/pause/resume tied to `recording`
  lsEffect(() => {
    const rec = recRef.current;
    if (!rec) return;
    try {
      if (recording && rec.state === 'inactive') rec.start(1000);
      else if (!recording && rec.state === 'recording') rec.pause();
      else if (recording && rec.state === 'paused') rec.resume();
    } catch (e) { console.warn(e); }
  }, [recording]);

  // stop() returns a Promise<Blob | null> that resolves once onstop fires
  const stop = lsCB(() => {
    return new Promise((resolve) => {
      const rec = recRef.current;
      if (!rec || rec.state === 'inactive') {
        resolve(null);
        return;
      }
      stopResolversRef.current.push(resolve);
      try { rec.stop(); } catch { resolve(null); }
    });
  }, []);

  return { blob, mime, stop, supported };
}

// ─── Elapsed-time ticker ──────────────────────────────────────────────
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

  // live-tweakable settings
  const [fontSize, setFontSize] = lsState(settings.fontSize);
  const [speed, setSpeed] = lsState(settings.speed);
  const [textPos, setTextPos] = lsState(settings.textPosition ?? 50);

  const videoRef = lsRef(null);
  const { stream } = useCamera(settings.camera, settings.frontCamera, settings.record);
  const { blob, mime, stop: stopRec, supported: recSupported } = useRecorder(stream, settings.record, playing);

  lsEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // Countdown
  lsEffect(() => {
    if (countdown <= 0) {
      if (settings.countdown > 0 && !playing) setPlaying(true);
      return;
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  // Auto-hide controls
  lsEffect(() => {
    if (!playing || !showControls) return;
    const t = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(t);
  }, [playing, showControls]);

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

  // Finish: stop recorder, hand blob to parent via onExit
  const finish = async () => {
    setPlaying(false);
    let recordedBlob = null;
    if (settings.record) {
      recordedBlob = await stopRec();
    }
    onExit({ blob: recordedBlob, mime, duration: elapsed });
  };

  // (blobReadyRef no longer needed — stop() resolves with the blob directly)

  const wordCount = lsMemo(() => script.body.trim().split(/\s+/).filter(Boolean).length, [script.body]);

  return (
    <div className="live" data-screen-label={`04 Live (${variant})`}
         onClick={() => playing && setShowControls(s => !s)}>
      {settings.camera && stream ? (
        <video ref={videoRef} autoPlay playsInline muted
               className={`live-camera ${settings.frontCamera ? 'mirror' : ''}`} />
      ) : (
        <div className="live-camera fallback" />
      )}
      <div className="live-veil" />

      <div className="live-text-area"
           style={{ transform: settings.mirror ? 'scaleX(-1)' : 'none' }}>
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

      {variant === 'classic' && (
        <div className="tp-marker" style={{ top: `${textPos}%` }}>
          <div className="triangle left" />
          <div className="triangle right" />
        </div>
      )}
      {variant === 'focus' && (
        <div className="focus-band" style={{ top: `${textPos}%` }} />
      )}

      {showControls && (
        <div className="live-top">
          <button className="live-pill-icon" onClick={() => finish()} aria-label="Sair">
            <Icon.Close size={16} color="#fff" />
          </button>
          {settings.record && recSupported && (
            <div className="rec-chip">
              <div className="rec-dot" />
              REC {fmtTime(elapsed)}
            </div>
          )}
          {settings.record && !recSupported && (
            <div className="rec-chip" style={{ background: 'rgba(255,149,0,0.3)', color: '#FFB340' }}>
              Gravação indisponível
            </div>
          )}
          <button className="live-pill-icon" onClick={reset} aria-label="Reiniciar">
            <Icon.Rewind color="#fff" />
          </button>
        </div>
      )}

      {countdown > 0 && (
        <div className="countdown">
          <div className="countdown-num" key={countdown}>{countdown}</div>
        </div>
      )}

      {showControls && (
        <div className="live-controls" onClick={(e) => e.stopPropagation()}>
          <div className="live-control-row">
            <div className="live-pill" style={{ flex: 1, gap: 12 }}>
              <Icon.TextSize size={20} color="#fff" />
              <input type="range" className="ios-slider" min={24} max={120} step={2}
                     value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                     style={{ flex: 1 }} />
              <span style={{ minWidth: 32, textAlign: 'right' }}>{fontSize}</span>
            </div>
          </div>
          <div className="live-control-row">
            <div className="live-pill" style={{ flex: 1, gap: 12 }}>
              <Icon.Speed size={20} color="#fff" />
              <input type="range" className="ios-slider" min={0.4} max={3} step={0.1}
                     value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                     style={{ flex: 1 }} />
              <span style={{ minWidth: 32, textAlign: 'right' }}>{speed.toFixed(1)}×</span>
            </div>
          </div>
          <div className="live-control-row">
            <div className="live-pill" style={{ flex: 1, gap: 12 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="14" height="14" rx="2" stroke="#fff" strokeWidth="1.4" opacity="0.6"/>
                <rect x="5" y={3 + (textPos / 100) * 10} width="10" height="2.5" rx="0.8" fill="#fff"/>
              </svg>
              <input type="range" className="ios-slider" min={10} max={90} step={5}
                     value={textPos} onChange={(e) => setTextPos(Number(e.target.value))}
                     style={{ flex: 1 }} />
              <span style={{ minWidth: 36, textAlign: 'right' }}>{textPos}%</span>
            </div>
          </div>

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
            <button onClick={() => finish()} style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 600 }}>
                Concluir
              </div>
            </button>
          </div>
        </div>
      )}

      {!showControls && playing && (
        <div style={{
          position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
          color: 'rgba(255,255,255,0.35)', fontSize: 12, pointerEvents: 'none',
        }}>Toque para mostrar controles</div>
      )}
    </div>
  );
}

// ─── Variants ─────────────────────────────────────────────────────────
function ClassicScroll({ body, fontSize, speed, playing, elapsed, textPos = 50 }) {
  const containerRef = lsRef(null);
  const contentRef = lsRef(null);
  const [containerH, setContainerH] = lsState(700);

  lsEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerH(containerRef.current.clientHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [body, fontSize]);

  const pxPerSec = fontSize * 0.6 * speed;
  const anchor = containerH * (textPos / 100);
  const offset = playing || elapsed > 0 ? anchor - elapsed * pxPerSec : anchor;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div ref={contentRef} className="tp-scroll"
           style={{ transform: `translateY(${offset}px)`, fontSize, lineHeight: 1.35, willChange: 'transform' }}>
        {body.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)}
        <div style={{ height: containerH }} />
      </div>
    </div>
  );
}

function FocusScroll(props) { return <ClassicScroll {...props} />; }

function KaraokeScroll({ body, fontSize, speed, playing, elapsed, textPos = 50 }) {
  const containerRef = lsRef(null);
  const wordRefs = lsRef([]);
  const [activeIdx, setActiveIdx] = lsState(0);
  const [offset, setOffset] = lsState(0);

  const tokens = lsMemo(() => {
    const out = [];
    body.split(/\n\n+/).forEach((para) => {
      para.split(/\s+/).filter(Boolean).forEach(w => out.push({ kind: 'word', text: w }));
      out.push({ kind: 'break' });
    });
    return out;
  }, [body]);

  const words = lsMemo(() => tokens.filter(t => t.kind === 'word'), [tokens]);
  const wordsPerSec = 2.5 * speed;
  const currentWord = Math.min(words.length - 1, Math.floor(elapsed * wordsPerSec));

  lsEffect(() => { setActiveIdx(currentWord); }, [currentWord]);
  lsEffect(() => {
    if (!containerRef.current) return;
    const el = wordRefs.current[activeIdx];
    if (!el) return;
    const cH = containerRef.current.clientHeight;
    setOffset(cH * (textPos / 100) - el.offsetTop - el.offsetHeight / 2);
  }, [activeIdx, fontSize, textPos]);

  let wIdx = -1;
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div className="tp-scroll"
           style={{ transform: `translateY(${offset}px)`, transition: 'transform 0.35s cubic-bezier(.3,.7,.4,1)', fontSize, lineHeight: 1.4, padding: '0 28px' }}>
        {tokens.map((tok, i) => {
          if (tok.kind === 'break') return <div key={i} style={{ height: '1.2em' }} />;
          wIdx++;
          const myIdx = wIdx;
          const cls = myIdx < activeIdx ? 'past' : myIdx === activeIdx ? 'active' : 'future';
          return (
            <span key={i} ref={el => (wordRefs.current[myIdx] = el)}
                  className={`tp-word ${cls}`}
                  style={{ display: 'inline-block', margin: '0 0.18em' }}>
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
