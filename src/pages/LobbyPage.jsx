import { useState } from 'react'
import CreateRoom from '../components/lobby/CreateRoom'
import JoinRoom from '../components/lobby/JoinRoom'

export default function LobbyPage({ onEnterGame }) {
  const [view, setView] = useState('initial')

  if (view === 'create') return <CreateRoom onEnterGame={onEnterGame} onBack={() => setView('initial')} />
  if (view === 'join') return <JoinRoom onEnterGame={onEnterGame} onBack={() => setView('initial')} />

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      gap: '48px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 'clamp(36px, 10vw, 56px)',
          fontWeight: '900',
          color: '#ffd93d',
          letterSpacing: '2px',
          lineHeight: 1.1,
        }}>
          DrinkPoly
        </div>
        <div style={{ fontSize: '16px', color: '#aaa', marginTop: '8px', fontWeight: '500' }}>
          주루마블
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '320px' }}>
        <button
          onClick={() => setView('create')}
          style={{
            padding: '18px',
            fontSize: '17px',
            fontWeight: '700',
            background: '#ffd93d',
            color: '#0f0e1a',
            border: 'none',
            borderRadius: '14px',
          }}
        >
          방 만들기
        </button>
        <button
          onClick={() => setView('join')}
          style={{
            padding: '18px',
            fontSize: '17px',
            fontWeight: '700',
            background: 'transparent',
            color: '#ffd93d',
            border: '2px solid #ffd93d',
            borderRadius: '14px',
          }}
        >
          방 참여하기
        </button>
      </div>
    </div>
  )
}