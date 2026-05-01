import { useState } from 'react'
import CreateRoom from '../components/lobby/CreateRoom'
import JoinRoom from '../components/lobby/JoinRoom'

export default function LobbyPage({ onEnterGame }) {
  const [view, setView] = useState('initial')

  if (view === 'create') return <CreateRoom onEnterGame={onEnterGame} onBack={() => setView('initial')} />
  if (view === 'join') return <JoinRoom onEnterGame={onEnterGame} onBack={() => setView('initial')} />

  return (
    <div>
      <h1>DrinkPoly</h1>
      <button onClick={() => setView('create')}>방 만들기</button>
      <button onClick={() => setView('join')}>방 참여하기</button>
    </div>
  )
}
