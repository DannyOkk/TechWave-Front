import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'theme-mode'; // 'auto' | 'light' | 'dark'

function prefersLight(){
  try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches } catch { return false }
}

function applyTheme(mode){
  const root = document.documentElement
  if (mode === 'light') root.classList.add('light-theme')
  else if (mode === 'dark') root.classList.remove('light-theme')
  else root.classList[ prefersLight() ? 'add' : 'remove' ]('light-theme')
}

export default function ThemeToggle({ variant = 'icon', label = 'Tema', onDone }){
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'auto' } catch { return 'auto' }
  })
  const mqlRef = useRef(null)

  useEffect(()=>{
    // Persist and apply theme
    try { localStorage.setItem(STORAGE_KEY, mode) } catch {}
    applyTheme(mode)
    // Handle auto follow system preference
    const setupMql = () => {
      if (!window.matchMedia) return
      // cleanup previous
      if (mqlRef.current){ try { mqlRef.current.removeEventListener('change', onPrefChange) } catch {}
      }
      if (mode === 'auto'){
        const mql = window.matchMedia('(prefers-color-scheme: light)')
        const handler = onPrefChange
        try { mql.addEventListener('change', handler) } catch {}
        mqlRef.current = mql
      }
    }
    const onPrefChange = () => { if (mode === 'auto') applyTheme('auto') }
    setupMql()
    return () => {
      if (mqlRef.current){ try { mqlRef.current.removeEventListener('change', onPrefChange) } catch {} }
    }
  }, [mode])

  const setAndClose = (m) => { setMode(m); if (onDone) onDone() }
  // Cycle order: light -> dark -> auto -> light
  const nextMode = (m) => (m === 'light' ? 'dark' : m === 'dark' ? 'auto' : 'light')

  if (variant === 'menu'){
    const opts = [
      { key:'auto', emoji:'🌗', text:'Auto' },
      { key:'light', emoji:'☀️', text:'Claro' },
      { key:'dark', emoji:'🌙', text:'Oscuro' },
    ]
    return (
      <>
        {label ? <span style={{cursor:'default', opacity:.8}}>{label}</span> : null}
        {opts.map(o=> (
          <button key={o.key} type="button" onClick={()=> setAndClose(o.key)} style={{display:'block', width:'100%', textAlign:'left', padding:'8px 10px', background:'transparent', border:'none', cursor:'pointer', font: 'inherit'}}>
            {o.emoji} {o.text} {mode===o.key ? '✓' : ''}
          </button>
        ))}
      </>
    )
  }

  if (variant === 'menuCycle'){
    const emoji = mode === 'auto' ? '🌗' : mode === 'light' ? '☀️' : '🌙'
    const text = mode === 'auto' ? 'Auto' : mode === 'light' ? 'Claro' : 'Oscuro'
    return (
      <button type="button" className="btn-ghost" onClick={()=> setMode(nextMode(mode))} aria-pressed="false">
        {emoji} {text}
      </button>
    )
  }

  const icon = mode === 'auto' ? '🌗' : mode === 'light' ? '☀️' : '🌙'
  return (
    <button className="btn" style={{background:'transparent', color:'var(--text-primary)', border:'1px solid var(--border-light)'}} onClick={()=> setMode(nextMode(mode)) } aria-label="Cambiar tema">
      {icon}
    </button>
  )
}
