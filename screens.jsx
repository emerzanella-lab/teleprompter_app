// screens.jsx — Home (script library), Editor, PreFlight, Done

const { useState, useEffect, useRef, useMemo } = React;

// ─── Home (script library) ─────────────────────────────────────────────
function HomeScreen({ scripts, onOpen, onNew, onPaste, onDelete }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q.trim()) return scripts;
    const ql = q.toLowerCase();
    return scripts.filter(s =>
      s.title.toLowerCase().includes(ql) ||
      s.body.toLowerCase().includes(ql)
    );
  }, [scripts, q]);

  return (
    <div className="screen" data-screen-label="01 Home">
      <div className="ios-nav">
        <div className="ios-nav-bar">
          <div />
          <button className="ios-nav-btn bold" onClick={onPaste}>
            <Icon.Paste size={22} color="#000" />
          </button>
        </div>
        <div className="ios-large-title">Scripts</div>
        <div className="search">
          <Icon.Search />
          <input
            placeholder="Buscar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div className="screen-content">
        {filtered.length === 0 && (
          <div className="empty">
            <div className="glyph"><Icon.Doc size={32} color="rgba(60,60,67,0.4)" /></div>
            <div className="t-headline" style={{ color: 'var(--label)' }}>
              {q ? 'Nenhum resultado' : 'Sem scripts ainda'}
            </div>
            <div className="t-subhead">
              {q ? `Nada combina com "${q}"` : 'Toque em + para criar seu primeiro script'}
            </div>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="inset-card" style={{ marginBottom: 100 }}>
            {filtered.map((s) => (
              <ScriptCard key={s.id} script={s} onOpen={() => onOpen(s.id)} onDelete={() => onDelete(s.id)} />
            ))}
          </div>
        )}
      </div>
      <button className="fab" onClick={onNew} aria-label="Novo script">
        <Icon.Plus size={26} color="#fff" />
      </button>
    </div>
  );
}

function ScriptCard({ script, onOpen, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  const startX = useRef(0);
  const dx = useRef(0);
  const [translate, setTranslate] = useState(0);

  const onTouchStart = (e) => {
    startX.current = (e.touches?.[0] || e).clientX;
    dx.current = translate;
  };
  const onTouchMove = (e) => {
    const x = (e.touches?.[0] || e).clientX;
    const delta = x - startX.current;
    const next = Math.min(0, Math.max(-90, dx.current + delta));
    setTranslate(next);
  };
  const onTouchEnd = () => {
    if (translate < -45) { setTranslate(-80); setShowDelete(true); }
    else { setTranslate(0); setShowDelete(false); }
  };

  const wordCount = script.body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 130));
  const dateStr = new Date(script.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  });

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <button
        onClick={onDelete}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 80, background: 'var(--destructive)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 500,
        }}>
        Excluir
      </button>
      <div
        className="script-card"
        style={{
          background: 'var(--surface)',
          transform: `translateX(${translate}px)`,
          transition: 'transform 0.2s cubic-bezier(.3,.7,.4,1)',
        }}
        onClick={() => translate === 0 ? onOpen() : (setTranslate(0), setShowDelete(false))}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onTouchStart}
        onMouseMove={(e) => e.buttons === 1 && onTouchMove(e)}
        onMouseUp={onTouchEnd}
      >
        <div className="title">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {script.title || 'Sem título'}
          </span>
          <Icon.Chevron size={14} color="rgba(60,60,67,0.3)" />
        </div>
        {script.body && <div className="preview">{script.body}</div>}
        <div className="meta">
          <span>{wordCount} palavras</span>
          <span>·</span>
          <span>~{minutes} min</span>
          <span>·</span>
          <span>{dateStr}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────
function EditorScreen({ script, onBack, onSave, onDelete, onStart }) {
  const [title, setTitle] = useState(script.title);
  const [body, setBody] = useState(script.body);
  const dirty = title !== script.title || body !== script.body;

  const save = () => {
    onSave({ ...script, title: title.trim() || 'Sem título', body, updatedAt: Date.now() });
  };

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 130));

  return (
    <div className="screen editor" data-screen-label="02 Editor">
      <div className="ios-nav">
        <div className="ios-nav-bar">
          <button className="ios-nav-btn" onClick={() => { if (dirty) save(); onBack(); }}>
            <Icon.Back color="#000" />
            <span>Scripts</span>
          </button>
          <button
            className="ios-nav-btn bold"
            onClick={() => { save(); onStart(); }}
            disabled={!body.trim()}
            style={{ opacity: body.trim() ? 1 : 0.3 }}
          >
            Próximo
          </button>
        </div>
      </div>
      <input
        className="editor-title"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="editor-divider" />
      <textarea
        className="editor-body"
        placeholder="Comece a escrever seu script…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div style={{
        padding: '8px 16px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '0.5px solid var(--separator)',
        background: 'var(--bg)',
      }}>
        <div className="t-footnote" style={{ color: 'var(--label-secondary)' }}>
          {wordCount} palavras · ~{minutes} min
        </div>
        <button
          onClick={() => onDelete(script.id)}
          style={{ color: 'var(--destructive)' }}
        >
          <Icon.Trash color="currentColor" />
        </button>
      </div>
    </div>
  );
}

// ─── Pre-flight (settings before going live) ──────────────────────────
function PreFlightScreen({ script, settings, setSettings, onBack, onStart }) {
  const fmtSpeed = (v) => `${v}x`;
  const fmtSize = (v) => `${v}pt`;
  return (
    <div className="preflight" data-screen-label="03 Pre-flight">
      <div className="preflight-nav">
        <button className="ios-nav-btn" onClick={onBack}>
          <Icon.Back color="#fff" />
          <span>Editar</span>
        </button>
        <span className="t-headline" style={{ flex: 1, textAlign: 'center' }}>
          {script.title || 'Sem título'}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0 200px' }}>
        {/* Preview chip */}
        <div style={{ padding: '0 16px 18px' }}>
          <div className="t-footnote" style={{ color: 'rgba(255,255,255,0.5)', padding: '0 4px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Preview
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: 16,
            fontSize: settings.fontSize * 0.42,
            lineHeight: 1.3,
            fontWeight: 600,
            color: '#fff',
            maxHeight: 110,
            overflow: 'hidden',
            position: 'relative',
            transform: settings.mirror ? 'scaleX(-1)' : 'none',
          }}>
            {(script.body || 'Seu texto aparecerá aqui…').slice(0, 140)}…
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
              background: 'linear-gradient(to top, rgba(28,28,30,1), transparent)',
            }} />
          </div>
        </div>

        {/* Reading config */}
        <div className="t-footnote" style={{ color: 'rgba(255,255,255,0.5)', padding: '0 32px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Leitura
        </div>
        <div className="pf-card">
          <div className="pf-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="lbl"><Icon.TextSize /> &nbsp;Tamanho</span>
              <span className="val">{fmtSize(settings.fontSize)}</span>
            </div>
            <input
              type="range" className="ios-slider"
              min={24} max={96} step={2}
              value={settings.fontSize}
              onChange={(e) => setSettings({ fontSize: Number(e.target.value) })}
            />
          </div>
          <div className="pf-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="lbl"><Icon.Speed /> &nbsp;Velocidade</span>
              <span className="val">{fmtSpeed(settings.speed.toFixed(1))}</span>
            </div>
            <input
              type="range" className="ios-slider"
              min={0.4} max={3} step={0.1}
              value={settings.speed}
              onChange={(e) => setSettings({ speed: Number(e.target.value) })}
            />
          </div>
          <div className="pf-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="lbl"><Icon.Timer /> &nbsp;Contagem regressiva</span>
              <span className="val">{settings.countdown}s</span>
            </div>
            <input
              type="range" className="ios-slider"
              min={0} max={10} step={1}
              value={settings.countdown}
              onChange={(e) => setSettings({ countdown: Number(e.target.value) })}
            />
          </div>
          <div className="pf-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="lbl">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" opacity="0.6"/>
                  <rect x="5" y={3 + (settings.textPosition / 100) * 10} width="10" height="3" rx="0.8" fill="currentColor"/>
                </svg>
                &nbsp;Posição do texto
              </span>
              <span className="val">{settings.textPosition}%</span>
            </div>
            <input
              type="range" className="ios-slider"
              min={10} max={90} step={5}
              value={settings.textPosition}
              onChange={(e) => setSettings({ textPosition: Number(e.target.value) })}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: -2,
            }}>
              <span>Topo (lente)</span>
              <span>Centro</span>
              <span>Base</span>
            </div>
          </div>
        </div>

        {/* Camera config */}
        <div className="t-footnote" style={{ color: 'rgba(255,255,255,0.5)', padding: '14px 32px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Câmera & Gravação
        </div>
        <div className="pf-card">
          <div className="pf-row">
            <Icon.Camera />
            <span className="lbl">Câmera ativa</span>
            <button className="ios-toggle dark" data-on={settings.camera ? '1' : '0'}
                    onClick={() => setSettings({ camera: !settings.camera })}>
              <i />
            </button>
          </div>
          <div className="pf-row">
            <Icon.Record size={18} color="#FF3B30" />
            <span className="lbl">Gravar ao iniciar</span>
            <button className="ios-toggle dark" data-on={settings.record ? '1' : '0'}
                    onClick={() => setSettings({ record: !settings.record })}>
              <i />
            </button>
          </div>
          <div className="pf-row">
            <Icon.Mirror />
            <span className="lbl">Espelhar texto</span>
            <button className="ios-toggle dark" data-on={settings.mirror ? '1' : '0'}
                    onClick={() => setSettings({ mirror: !settings.mirror })}>
              <i />
            </button>
          </div>
          <div className="pf-row">
            <Icon.FlipCamera />
            <span className="lbl">Câmera frontal</span>
            <button className="ios-toggle dark" data-on={settings.frontCamera ? '1' : '0'}
                    onClick={() => setSettings({ frontCamera: !settings.frontCamera })}>
              <i />
            </button>
          </div>
        </div>

        {/* Remote / advanced */}
        <div className="t-footnote" style={{ color: 'rgba(255,255,255,0.5)', padding: '14px 32px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Controle remoto
        </div>
        <div className="pf-card">
          <div className="pf-row">
            <Icon.Bluetooth />
            <span className="lbl">Pareamento Bluetooth</span>
            <span className="val">Desligado</span>
            <Icon.Chevron size={12} color="rgba(255,255,255,0.3)" />
          </div>
        </div>
      </div>

      <button className={`pf-start ${settings.record ? 'record' : ''}`} onClick={onStart}>
        {settings.record ? <Icon.Record size={20} /> : <Icon.Play size={20} color="#000" />}
        {settings.record ? 'Iniciar e Gravar' : 'Iniciar Teleprompter'}
      </button>
    </div>
  );
}

// ─── Done / Summary ────────────────────────────────────────────────────
function DoneScreen({ duration, words, recorded, onAgain, onHome }) {
  return (
    <div className="done-summary" data-screen-label="05 Done">
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon.Check size={36} color="#fff" />
      </div>
      <div className="t-title1" style={{ color: '#fff' }}>Concluído</div>
      <div style={{ display: 'flex', gap: 28, marginTop: 8 }}>
        <Stat label="Duração" value={fmtTime(duration)} />
        <Stat label="Palavras" value={words} />
        <Stat label="WPM" value={duration > 0 ? Math.round(words / (duration / 60)) : 0} />
      </div>
      {recorded && (
        <div style={{
          marginTop: 12,
          padding: '8px 14px',
          borderRadius: 999,
          background: 'rgba(255,59,48,0.18)',
          color: '#FF8B83',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon.Record size={10} color="#FF3B30" /> Vídeo salvo
        </div>
      )}
      <div style={{
        position: 'absolute',
        left: 16, right: 16, bottom: 56,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <button className="pf-start" style={{ position: 'static' }} onClick={onAgain}>
          Ler novamente
        </button>
        <button onClick={onHome} style={{
          height: 56, color: 'rgba(255,255,255,0.7)', fontSize: 17, fontWeight: 500,
        }}>
          Voltar aos Scripts
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Paste sheet ──────────────────────────────────────────────────────
function PasteSheet({ onClose, onPaste }) {
  const [text, setText] = useState('');
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <div style={{ padding: '4px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} className="ios-nav-btn">Cancelar</button>
          <div className="t-headline">Colar texto</div>
          <button
            className="ios-nav-btn bold"
            onClick={() => onPaste(text)}
            disabled={!text.trim()}
            style={{ opacity: text.trim() ? 1 : 0.3 }}
          >
            Criar
          </button>
        </div>
        <textarea
          className="editor-body"
          placeholder="Cole ou digite seu texto aqui…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ minHeight: 280, background: 'var(--surface)', margin: '0 16px', borderRadius: 12, padding: 14 }}
          autoFocus
        />
      </div>
    </>
  );
}

function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

Object.assign(window, {
  HomeScreen, EditorScreen, PreFlightScreen, DoneScreen, PasteSheet, fmtTime,
});
