import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { GameProvider } from './context/GameContext'
import { useGame } from './context/GameContext'
import LobbyPage from './pages/LobbyPage'
import GamePage from './pages/GamePage'

function AppContent() {
  const { setRoom, setPlayers, setMyPlayerId } = useGame()
  const [page, setPage] = useState('loading')

  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = localStorage.getItem('drinkpoly-session')
        if (!saved) { setPage('lobby'); return }

        const { roomId, myPlayerId } = JSON.parse(saved)

        const { data: room } = await supabase
          .from('rooms').select().eq('id', roomId).eq('status', 'playing').single()

        if (!room) { localStorage.removeItem('drinkpoly-session'); setPage('lobby'); return }

        const { data: players } = await supabase
          .from('players').select().eq('room_id', roomId)

        const myPlayer = players?.find(p => p.id === myPlayerId)
        if (!myPlayer) { localStorage.removeItem('drinkpoly-session'); setPage('lobby'); return }

        setRoom(room)
        setPlayers(players)
        setMyPlayerId(myPlayerId)
        setPage('game')
      } catch {
        setPage('lobby')
      }
    }
    restoreSession()
  }, [])

  if (page === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffd93d', letterSpacing: '2px' }}>DrinkPoly</div>
      </div>
    )
  }

  return (
    <>
      {page === 'lobby' && <LobbyPage onEnterGame={() => setPage('game')} />}
      {page === 'game' && <GamePage onExit={() => { localStorage.removeItem('drinkpoly-session'); setPage('lobby') }} />}
    </>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}