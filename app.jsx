// app.jsx — main app state + routing

const { useState: aState, useEffect: aEffect, useMemo: aMemo, useRef: aRef } = React;

// Seed scripts so the app feels alive on first visit
const SEED_SCRIPTS = [
  {
    id: 's-1',
    title: 'Abertura do canal',
    body: `Olá pessoal, sejam muito bem-vindos de volta ao canal.

Hoje a gente vai falar sobre um assunto que mudou a forma como eu trabalho com vídeos: como criar um teleprompter usando apenas o seu iPhone.

Nos próximos minutos eu vou te mostrar o passo a passo, das configurações iniciais até dicas avançadas que ninguém costuma comentar por aí.

Se você é criador de conteúdo, jornalista, ou só quer gravar um discurso sem travar, esse vídeo é pra você.

Antes de começar, deixa o like e se inscreve no canal — isso ajuda demais o algoritmo a entregar o conteúdo pra mais gente.`,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 's-2',
    title: 'Reels — lançamento produto',
    body: `Você está cansado de gravar vídeo, esquecer o texto e ter que repetir mil vezes?

Eu também estava. Foi aí que descobri esse app de teleprompter que cabe no bolso e me fez economizar horas de edição.

A interface é simples, o controle de velocidade é preciso, e o melhor: a câmera fica visível por trás do texto, então você nunca quebra o contato visual.

Link na bio.`,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 's-3',
    title: 'Podcast — intro do episódio',
    body: `Bem-vindos a mais um episódio do podcast.

No programa de hoje a gente recebe um convidado especial pra falar sobre design de produto, processos criativos, e como manter a sanidade enquanto a sua startup está crescendo.

Fica até o final porque rola uma história que eu garanto: você vai querer mandar pros seus amigos.`,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
];

const DEFAULT_SETTINGS = {
  fontSize: 56,
  speed: 1.0,
  countdown: 3,
  textPosition: 30, // % from top — 30 aligns with iPhone front-cam lens area
  camera: true,
  record: false,
  mirror: false,
  frontCamera: true,
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "classic",
  "density": "regular"
}/*EDITMODE-END*/;

function loadScripts() {
  try {
    const raw = localStorage.getItem('tp:scripts');
    if (!raw) return SEED_SCRIPTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_SCRIPTS;
  } catch { return SEED_SCRIPTS; }
}
function saveScripts(s) {
  try { localStorage.setItem('tp:scripts', JSON.stringify(s)); } catch {}
}

function useIsMobile() {
  const [m, setM] = aState(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 500px)').matches
  );
  aEffect(() => {
    const mq = window.matchMedia('(max-width: 500px)');
    const fn = (e) => setM(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return m;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = aState({ name: 'home' });
  const [scripts, setScripts] = aState(loadScripts);
  const [settings, setSettings] = aState(DEFAULT_SETTINGS);
  const [showPaste, setShowPaste] = aState(false);
  const [lastSession, setLastSession] = aState({ duration: 0, words: 0, blob: null, mime: '' });
  const isMobile = useIsMobile();

  // Persist scripts
  aEffect(() => { saveScripts(scripts); }, [scripts]);

  const currentScript = aMemo(() => scripts.find(s => s.id === route.id), [scripts, route.id]);
  const updateSettings = (patch) => setSettings(s => ({ ...s, ...patch }));

  // Script CRUD
  const newScript = () => {
    const id = 's-' + Date.now();
    const s = { id, title: '', body: '', updatedAt: Date.now() };
    setScripts(prev => [s, ...prev]);
    setRoute({ name: 'editor', id });
  };

  const newFromPaste = (text) => {
    const lines = text.trim().split('\n');
    const id = 's-' + Date.now();
    const s = {
      id,
      title: lines[0].slice(0, 40) || 'Texto colado',
      body: text.trim(),
      updatedAt: Date.now(),
    };
    setScripts(prev => [s, ...prev]);
    setShowPaste(false);
    setRoute({ name: 'editor', id });
  };

  const saveScript = (s) => {
    setScripts(prev => prev.map(x => x.id === s.id ? s : x));
  };

  const deleteScript = (id) => {
    setScripts(prev => prev.filter(s => s.id !== id));
    if (route.id === id) setRoute({ name: 'home' });
  };

  // Density class for entire phone interior
  const densityClass = `density-${t.density}`;

  // Shared content (all screens) — used both in mobile fullscreen and desktop frame
  const screens = (
    <div className={densityClass} style={{ position: 'absolute', inset: 0 }}>
      {route.name === 'home' && (
        <HomeScreen
          scripts={scripts}
          onOpen={(id) => setRoute({ name: 'editor', id })}
          onNew={newScript}
          onPaste={() => setShowPaste(true)}
          onDelete={deleteScript}
        />
      )}
      {route.name === 'editor' && currentScript && (
        <EditorScreen
          script={currentScript}
          onBack={() => setRoute({ name: 'home' })}
          onSave={saveScript}
          onDelete={deleteScript}
          onStart={() => setRoute({ name: 'preflight', id: currentScript.id })}
        />
      )}
      {route.name === 'preflight' && currentScript && (
        <PreFlightScreen
          script={currentScript}
          settings={settings}
          setSettings={updateSettings}
          onBack={() => setRoute({ name: 'editor', id: currentScript.id })}
          onStart={() => setRoute({ name: 'live', id: currentScript.id })}
        />
      )}
      {route.name === 'live' && currentScript && (
        <LiveScreen
          key={`live-${t.variant}-${currentScript.id}`}
          script={currentScript}
          settings={settings}
          variant={t.variant}
          onExit={(result) => {
            const words = currentScript.body.trim().split(/\s+/).filter(Boolean).length;
            setLastSession({
              duration: result?.duration || 0,
              words,
              blob: result?.blob || null,
              mime: result?.mime || '',
            });
            setRoute({ name: 'done', id: currentScript.id });
          }}
        />
      )}
      {route.name === 'done' && (
        <DoneScreen
          duration={lastSession.duration}
          words={lastSession.words}
          recorded={settings.record}
          blob={lastSession.blob}
          mime={lastSession.mime}
          onAgain={() => setRoute({ name: 'live', id: route.id })}
          onHome={() => setRoute({ name: 'home' })}
        />
      )}
      {showPaste && (
        <PasteSheet onClose={() => setShowPaste(false)} onPaste={newFromPaste} />
      )}
    </div>
  );

  // On a real phone, render fullscreen — no fake iOS frame
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'var(--bg)',
        overflow: 'hidden',
      }}>
        {screens}
        <TweaksPanel title="Tweaks">
          {tweakBody(t, setTweak, setScripts, setRoute)}
        </TweaksPanel>
      </div>
    );
  }

  return (
    <div className="stage">
      <IOSDevice dark={false}>{screens}</IOSDevice>
      <TweaksPanel title="Tweaks">
        {tweakBody(t, setTweak, setScripts, setRoute)}
      </TweaksPanel>
    </div>
  );
}

// Tweaks body (shared between mobile + desktop)
function tweakBody(t, setTweak, setScripts, setRoute) {
  return (
    <>
      <TweakSection label="Tela de leitura" />
      <TweakRadio
        label="Variação"
        value={t.variant}
        options={[
          { value: 'classic', label: 'Classic' },
          { value: 'focus', label: 'Focus' },
          { value: 'karaoke', label: 'Karaokê' },
        ]}
        onChange={(v) => setTweak('variant', v)}
      />
      <TweakSection label="Interface" />
      <TweakRadio
        label="Densidade"
        value={t.density}
        options={[
          { value: 'compact', label: 'Compact' },
          { value: 'regular', label: 'Regular' },
          { value: 'spacious', label: 'Spacious' },
        ]}
        onChange={(v) => setTweak('density', v)}
      />
      <TweakSection label="Dicas" />
      <div style={{
        fontSize: 11, color: 'rgba(41,38,27,0.6)', lineHeight: 1.5,
        padding: '0 2px',
      }}>
        Em <b>Classic</b>, o texto rola sob uma linha-guia. <b>Focus</b> traz uma faixa central destacada. <b>Karaokê</b> ilumina palavra-por-palavra.
      </div>
      <TweakButton label="Resetar scripts" secondary
        onClick={() => {
          if (confirm('Resetar todos os scripts para os exemplos?')) {
            localStorage.removeItem('tp:scripts');
            setScripts(SEED_SCRIPTS);
            setRoute({ name: 'home' });
          }
        }}
      />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
