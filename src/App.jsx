import { useState } from 'react'
import { GameProvider } from './context/GameContext'
import LobbyPage from './pages/LobbyPage'
import GamePage from './pages/GamePage'

export default function App() {
  const [page, setPage] = useState('lobby')

  return (
    <GameProvider>
      {page === 'lobby' && <LobbyPage onEnterGame={() => setPage('game')} />}
      {page === 'game' && <GamePage />}
    </GameProvider>
  )
}
