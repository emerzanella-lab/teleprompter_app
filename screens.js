// screens.jsx — Home (script library), Editor, PreFlight, Done

const {
  useState,
  useEffect,
  useRef,
  useMemo
} = React;

// ─── Home (script library) ─────────────────────────────────────────────
function HomeScreen({
  scripts,
  onOpen,
  onNew,
  onPaste,
  onDelete
}) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q.trim()) return scripts;
    const ql = q.toLowerCase();
    return scripts.filter(s => s.title.toLowerCase().includes(ql) || s.body.toLowerCase().includes(ql));
  }, [scripts, q]);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen",
    "data-screen-label": "01 Home"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ios-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ios-nav-bar"
  }, /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("button", {
    className: "ios-nav-btn bold",
    onClick: onPaste
  }, /*#__PURE__*/React.createElement(Icon.Paste, {
    size: 22,
    color: "#000"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ios-large-title"
  }, "Scripts"), /*#__PURE__*/React.createElement("div", {
    className: "search"
  }, /*#__PURE__*/React.createElement(Icon.Search, null), /*#__PURE__*/React.createElement("input", {
    placeholder: "Buscar",
    value: q,
    onChange: e => setQ(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "screen-content"
  }, filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glyph"
  }, /*#__PURE__*/React.createElement(Icon.Doc, {
    size: 32,
    color: "rgba(60,60,67,0.4)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "t-headline",
    style: {
      color: 'var(--label)'
    }
  }, q ? 'Nenhum resultado' : 'Sem scripts ainda'), /*#__PURE__*/React.createElement("div", {
    className: "t-subhead"
  }, q ? `Nada combina com "${q}"` : 'Toque em + para criar seu primeiro script')), filtered.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "inset-card",
    style: {
      marginBottom: 100
    }
  }, filtered.map(s => /*#__PURE__*/React.createElement(ScriptCard, {
    key: s.id,
    script: s,
    onOpen: () => onOpen(s.id),
    onDelete: () => onDelete(s.id)
  })))), /*#__PURE__*/React.createElement("button", {
    className: "fab",
    onClick: onNew,
    "aria-label": "Novo script"
  }, /*#__PURE__*/React.createElement(Icon.Plus, {
    size: 26,
    color: "#fff"
  })));
}
function ScriptCard({
  script,
  onOpen,
  onDelete
}) {
  const [showDelete, setShowDelete] = useState(false);
  const startX = useRef(0);
  const dx = useRef(0);
  const [translate, setTranslate] = useState(0);
  const onTouchStart = e => {
    startX.current = (e.touches?.[0] || e).clientX;
    dx.current = translate;
  };
  const onTouchMove = e => {
    const x = (e.touches?.[0] || e).clientX;
    const delta = x - startX.current;
    const next = Math.min(0, Math.max(-90, dx.current + delta));
    setTranslate(next);
  };
  const onTouchEnd = () => {
    if (translate < -45) {
      setTranslate(-80);
      setShowDelete(true);
    } else {
      setTranslate(0);
      setShowDelete(false);
    }
  };
  const wordCount = script.body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 130));
  const dateStr = new Date(script.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onDelete,
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: 80,
      background: 'var(--destructive)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 15,
      fontWeight: 500
    }
  }, "Excluir"), /*#__PURE__*/React.createElement("div", {
    className: "script-card",
    style: {
      background: 'var(--surface)',
      transform: `translateX(${translate}px)`,
      transition: 'transform 0.2s cubic-bezier(.3,.7,.4,1)'
    },
    onClick: () => translate === 0 ? onOpen() : (setTranslate(0), setShowDelete(false)),
    onTouchStart: onTouchStart,
    onTouchMove: onTouchMove,
    onTouchEnd: onTouchEnd,
    onMouseDown: onTouchStart,
    onMouseMove: e => e.buttons === 1 && onTouchMove(e),
    onMouseUp: onTouchEnd
  }, /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, script.title || 'Sem título'), /*#__PURE__*/React.createElement(Icon.Chevron, {
    size: 14,
    color: "rgba(60,60,67,0.3)"
  })), script.body && /*#__PURE__*/React.createElement("div", {
    className: "preview"
  }, script.body), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("span", null, wordCount, " palavras"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, "~", minutes, " min"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, dateStr))));
}

// ─── Editor ───────────────────────────────────────────────────────────
function EditorScreen({
  script,
  onBack,
  onSave,
  onDelete,
  onStart
}) {
  const [title, setTitle] = useState(script.title);
  const [body, setBody] = useState(script.body);
  const dirty = title !== script.title || body !== script.body;
  const save = () => {
    onSave({
      ...script,
      title: title.trim() || 'Sem título',
      body,
      updatedAt: Date.now()
    });
  };
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 130));
  return /*#__PURE__*/React.createElement("div", {
    className: "screen editor",
    "data-screen-label": "02 Editor"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ios-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ios-nav-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ios-nav-btn",
    onClick: () => {
      if (dirty) save();
      onBack();
    }
  }, /*#__PURE__*/React.createElement(Icon.Back, {
    color: "#000"
  }), /*#__PURE__*/React.createElement("span", null, "Scripts")), /*#__PURE__*/React.createElement("button", {
    className: "ios-nav-btn bold",
    onClick: () => {
      save();
      onStart();
    },
    disabled: !body.trim(),
    style: {
      opacity: body.trim() ? 1 : 0.3
    }
  }, "Pr\xF3ximo"))), /*#__PURE__*/React.createElement("input", {
    className: "editor-title",
    placeholder: "T\xEDtulo",
    value: title,
    onChange: e => setTitle(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "editor-divider"
  }), /*#__PURE__*/React.createElement("textarea", {
    className: "editor-body",
    placeholder: "Comece a escrever seu script\u2026",
    value: body,
    onChange: e => setBody(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 16px 14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '0.5px solid var(--separator)',
      background: 'var(--bg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-footnote",
    style: {
      color: 'var(--label-secondary)'
    }
  }, wordCount, " palavras \xB7 ~", minutes, " min"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onDelete(script.id),
    style: {
      color: 'var(--destructive)'
    }
  }, /*#__PURE__*/React.createElement(Icon.Trash, {
    color: "currentColor"
  }))));
}

// ─── Pre-flight (settings before going live) ──────────────────────────
function PreFlightScreen({
  script,
  settings,
  setSettings,
  onBack,
  onStart
}) {
  const fmtSpeed = v => `${v}x`;
  const fmtSize = v => `${v}pt`;
  return /*#__PURE__*/React.createElement("div", {
    className: "preflight",
    "data-screen-label": "03 Pre-flight"
  }, /*#__PURE__*/React.createElement("div", {
    className: "preflight-nav"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ios-nav-btn",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icon.Back, {
    color: "#fff"
  }), /*#__PURE__*/React.createElement("span", null, "Editar")), /*#__PURE__*/React.createElement("span", {
    className: "t-headline",
    style: {
      flex: 1,
      textAlign: 'center'
    }
  }, script.title || 'Sem título'), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '12px 0 200px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-footnote",
    style: {
      color: 'rgba(255,255,255,0.5)',
      padding: '0 4px 6px',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }
  }, "Preview"), /*#__PURE__*/React.createElement("div", {
    style: {
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
      transform: settings.mirror ? 'scaleX(-1)' : 'none'
    }
  }, (script.body || 'Seu texto aparecerá aqui…').slice(0, 140), "\u2026", /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 40,
      background: 'linear-gradient(to top, rgba(28,28,30,1), transparent)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "t-footnote",
    style: {
      color: 'rgba(255,255,255,0.5)',
      padding: '0 32px 6px',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }
  }, "Leitura"), /*#__PURE__*/React.createElement("div", {
    className: "pf-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pf-row",
    style: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, /*#__PURE__*/React.createElement(Icon.TextSize, null), " \xA0Tamanho"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, fmtSize(settings.fontSize))), /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "ios-slider",
    min: 24,
    max: 96,
    step: 2,
    value: settings.fontSize,
    onChange: e => setSettings({
      fontSize: Number(e.target.value)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "pf-row",
    style: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, /*#__PURE__*/React.createElement(Icon.Speed, null), " \xA0Velocidade"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, fmtSpeed(settings.speed.toFixed(1)))), /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "ios-slider",
    min: 0.4,
    max: 3,
    step: 0.1,
    value: settings.speed,
    onChange: e => setSettings({
      speed: Number(e.target.value)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "pf-row",
    style: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, /*#__PURE__*/React.createElement(Icon.Timer, null), " \xA0Contagem regressiva"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, settings.countdown, "s")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "ios-slider",
    min: 0,
    max: 10,
    step: 1,
    value: settings.countdown,
    onChange: e => setSettings({
      countdown: Number(e.target.value)
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "pf-row",
    style: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "14",
    height: "14",
    rx: "2",
    stroke: "currentColor",
    strokeWidth: "1.4",
    opacity: "0.6"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: 3 + settings.textPosition / 100 * 10,
    width: "10",
    height: "3",
    rx: "0.8",
    fill: "currentColor"
  })), "\xA0Posi\xE7\xE3o do texto"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, settings.textPosition, "%")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "ios-slider",
    min: 10,
    max: 90,
    step: 5,
    value: settings.textPosition,
    onChange: e => setSettings({
      textPosition: Number(e.target.value)
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11,
      color: 'rgba(255,255,255,0.4)',
      marginTop: -2
    }
  }, /*#__PURE__*/React.createElement("span", null, "Topo (lente)"), /*#__PURE__*/React.createElement("span", null, "Centro"), /*#__PURE__*/React.createElement("span", null, "Base")))), /*#__PURE__*/React.createElement("div", {
    className: "t-footnote",
    style: {
      color: 'rgba(255,255,255,0.5)',
      padding: '14px 32px 6px',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }
  }, "C\xE2mera & Grava\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
    className: "pf-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pf-row"
  }, /*#__PURE__*/React.createElement(Icon.Camera, null), /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "C\xE2mera ativa"), /*#__PURE__*/React.createElement("button", {
    className: "ios-toggle dark",
    "data-on": settings.camera ? '1' : '0',
    onClick: () => setSettings({
      camera: !settings.camera
    })
  }, /*#__PURE__*/React.createElement("i", null))), /*#__PURE__*/React.createElement("div", {
    className: "pf-row"
  }, /*#__PURE__*/React.createElement(Icon.Record, {
    size: 18,
    color: "#FF3B30"
  }), /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Gravar ao iniciar"), /*#__PURE__*/React.createElement("button", {
    className: "ios-toggle dark",
    "data-on": settings.record ? '1' : '0',
    onClick: () => setSettings({
      record: !settings.record
    })
  }, /*#__PURE__*/React.createElement("i", null))), /*#__PURE__*/React.createElement("div", {
    className: "pf-row"
  }, /*#__PURE__*/React.createElement(Icon.Mirror, null), /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Espelhar texto"), /*#__PURE__*/React.createElement("button", {
    className: "ios-toggle dark",
    "data-on": settings.mirror ? '1' : '0',
    onClick: () => setSettings({
      mirror: !settings.mirror
    })
  }, /*#__PURE__*/React.createElement("i", null))), /*#__PURE__*/React.createElement("div", {
    className: "pf-row"
  }, /*#__PURE__*/React.createElement(Icon.FlipCamera, null), /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "C\xE2mera frontal"), /*#__PURE__*/React.createElement("button", {
    className: "ios-toggle dark",
    "data-on": settings.frontCamera ? '1' : '0',
    onClick: () => setSettings({
      frontCamera: !settings.frontCamera
    })
  }, /*#__PURE__*/React.createElement("i", null)))), /*#__PURE__*/React.createElement("div", {
    className: "t-footnote",
    style: {
      color: 'rgba(255,255,255,0.5)',
      padding: '14px 32px 6px',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }
  }, "Controle remoto"), /*#__PURE__*/React.createElement("div", {
    className: "pf-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pf-row"
  }, /*#__PURE__*/React.createElement(Icon.Bluetooth, null), /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Pareamento Bluetooth"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, "Desligado"), /*#__PURE__*/React.createElement(Icon.Chevron, {
    size: 12,
    color: "rgba(255,255,255,0.3)"
  })))), /*#__PURE__*/React.createElement("button", {
    className: `pf-start ${settings.record ? 'record' : ''}`,
    onClick: onStart
  }, settings.record ? /*#__PURE__*/React.createElement(Icon.Record, {
    size: 20
  }) : /*#__PURE__*/React.createElement(Icon.Play, {
    size: 20,
    color: "#000"
  }), settings.record ? 'Iniciar e Gravar' : 'Iniciar Teleprompter'));
}

// ─── Done / Summary ────────────────────────────────────────────────────
function DoneScreen({
  duration,
  words,
  recorded,
  onAgain,
  onHome
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "done-summary",
    "data-screen-label": "05 Done"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon.Check, {
    size: 36,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    className: "t-title1",
    style: {
      color: '#fff'
    }
  }, "Conclu\xEDdo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 28,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Dura\xE7\xE3o",
    value: fmtTime(duration)
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Palavras",
    value: words
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "WPM",
    value: duration > 0 ? Math.round(words / (duration / 60)) : 0
  })), recorded && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      padding: '8px 14px',
      borderRadius: 999,
      background: 'rgba(255,59,48,0.18)',
      color: '#FF8B83',
      fontSize: 13,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon.Record, {
    size: 10,
    color: "#FF3B30"
  }), " V\xEDdeo salvo"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 56,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "pf-start",
    style: {
      position: 'static'
    },
    onClick: onAgain
  }, "Ler novamente"), /*#__PURE__*/React.createElement("button", {
    onClick: onHome,
    style: {
      height: 56,
      color: 'rgba(255,255,255,0.7)',
      fontSize: 17,
      fontWeight: 500
    }
  }, "Voltar aos Scripts")));
}
function Stat({
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      color: '#fff',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.5)',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 2
    }
  }, label));
}

// ─── Paste sheet ──────────────────────────────────────────────────────
function PasteSheet({
  onClose,
  onPaste
}) {
  const [text, setText] = useState('');
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sheet-backdrop",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("div", {
    className: "sheet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet-handle"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 16px 12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "ios-nav-btn"
  }, "Cancelar"), /*#__PURE__*/React.createElement("div", {
    className: "t-headline"
  }, "Colar texto"), /*#__PURE__*/React.createElement("button", {
    className: "ios-nav-btn bold",
    onClick: () => onPaste(text),
    disabled: !text.trim(),
    style: {
      opacity: text.trim() ? 1 : 0.3
    }
  }, "Criar")), /*#__PURE__*/React.createElement("textarea", {
    className: "editor-body",
    placeholder: "Cole ou digite seu texto aqui\u2026",
    value: text,
    onChange: e => setText(e.target.value),
    style: {
      minHeight: 280,
      background: 'var(--surface)',
      margin: '0 16px',
      borderRadius: 12,
      padding: 14
    },
    autoFocus: true
  })));
}
function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
Object.assign(window, {
  HomeScreen,
  EditorScreen,
  PreFlightScreen,
  DoneScreen,
  PasteSheet,
  fmtTime
});