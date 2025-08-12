import { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const [light, setLight] = useState(false)
  useEffect(()=>{
    const root = document.documentElement
    if (light) root.classList.add('light-theme')
    else root.classList.remove('light-theme')
  },[light])
  return (
    <button className="btn" style={{background:'transparent', color:'var(--text-primary)', border:'1px solid var(--border-light)'}} onClick={()=> setLight(v=>!v)}>
      {light ? '🌙' : '☀️'}
    </button>
  )
}
