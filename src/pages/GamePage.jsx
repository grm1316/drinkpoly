import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useGame } from '../context/GameContext'
import Board from '../components/game/Board'
import PlayerList from '../components/game/PlayerList'
import DiceButton from '../components/game/DiceButton'
import CellPopup from '../components/game/CellPopup'

export default function GamePage() {
  const { room, setRoom, players, setPlayers, myPlayerId } = useGame()
  const [cells, setCells] = useState([])
  const [activeCell, setActiveCell] = useState(null)
  const [diceResult, setDiceResult] = useState(null)
  const [rolling, setRolling] = useState(false)
  const channelRef = useRef(null)

  const isMyTurn = room?.current_turn === myPlayerId

  useEffect(() => {
    supabase.from('cells').select().order('position').then(({ data }) => {
      if (data) setCells(data)
    })

    const channel = supabase
      .channel(`game-${room.id}`, { config: { broadcast: { self: true } } })
      .on('broadcast', { event: 'cell-landed' }, ({ payload }) => {
        setActiveCell(payload.cell)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'players',
      }, (payload) => {
        setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${room.id}`,
      }, (payload) => {
        setRoom(payload.new)
        setActiveCell(null)
      })
      .subscribe()

    channelRef.current = channel

    return () => supabase.removeChannel(channel)
  }, [])

  async function handleRoll() {
    if (!isMyTurn || rolling || cells.length === 0) return
    setRolling(true)

    const dice = Math.floor(Math.random() * 6) + 1
    setDiceResult(dice)

    const myPlayer = players.find(p => p.id === myPlayerId)
    const newPosition = (myPlayer.position + dice) % 36

    await supabase
      .from('players')
      .update({ position: newPosition })
      .eq('id', myPlayerId)

    const cell = cells.find(c => c.position === newPosition)

    channelRef.current?.send({
      type: 'broadcast',
      event: 'cell-landed',
      payload: { cell },
    })

    setRolling(false)
  }

  async function handleClosePopup() {
    setActiveCell(null)
    setDiceResult(null)

    const sorted = [...players].sort((a, b) => a.turn_order - b.turn_order)
    const currentIdx = sorted.findIndex(p => p.id === room.current_turn)
    const nextPlayer = sorted[(currentIdx + 1) % sorted.length]

    await supabase
      .from('rooms')
      .update({ current_turn: nextPlayer.id })
      .eq('id', room.id)
  }

  function handleExit() {
    if (window.confirm('게임을 나가시겠습니까?')) {
      window.location.reload()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', gap: '12px' }}>
      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleExit}
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            background: 'transparent',
            color: '#666',
            border: '1px solid #444',
            borderRadius: '8px',
          }}
        >
          나가기
        </button>
      </div>
      <Board cells={cells} players={players} myPlayerId={myPlayerId} />
      <PlayerList players={players} currentTurn={room?.current_turn} myPlayerId={myPlayerId} />
      <DiceButton isMyTurn={isMyTurn} onRoll={handleRoll} rolling={rolling} diceResult={diceResult} />
      {activeCell && (
        <CellPopup cell={activeCell} isMyTurn={isMyTurn} onClose={handleClosePopup} />
      )}
    </div>
  )
}
