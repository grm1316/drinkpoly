import { createContext, useContext, useState } from 'react'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [currentTurn, setCurrentTurn] = useState(null)

  return (
    <GameContext.Provider value={{ room, setRoom, players, setPlayers, currentTurn, setCurrentTurn }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
