import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useGame } from '../context/GameContext'
import { playRollSound, playLandSound } from '../lib/sounds'
import Board from '../components/game/Board'
import PlayerList from '../components/game/PlayerList'
import DiceButton from '../components/game/DiceButton'
import CellPopup from '../components/game/CellPopup'

export default function GamePage({ onExit }) {
  const { room, setRoom, players, setPlayers, myPlayerId } = useGame()
  const [cells, setCells] = useState([])
  const [activeCell, setActiveCell] = useState(null)
  const [diceResult, setDiceResult] = useState(null)
  const [rolling, setRolling] = useState(false)
  const [lapReward, setLapReward] = useState(null)
  const [showTargetPicker, setShowTargetPicker] = useState(false)
  const [attackedBy, setAttackedBy] = useState(null)
  const channelRef = useRef(null)
  const hiddenAtRef = useRef(null)

  const isMyTurn = room?.current_turn === myPlayerId
  const myPlayer = players.find(p => p.id === myPlayerId)
  const [attackUsed, setAttackUsed] = useState(false)

  useEffect(() => {
    if (isMyTurn) setAttackUsed(false)
  }, [isMyTurn])

  useEffect(() => {
    localStorage.setItem('drinkpoly-session', JSON.stringify({ roomId: room.id, myPlayerId }))
  }, [])

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now()
      } else if (document.visibilityState === 'visible') {
        if (hiddenAtRef.current && Date.now() - hiddenAtRef.current > 30000) {
          window.location.reload()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    supabase.from('cells').select().order('position').then(({ data }) => {
      if (data) setCells(data)
    })

    const channel = supabase
      .channel(`game-${room.id}`, { config: { broadcast: { self: true } } })
      .on('broadcast', { event: 'cell-landed' }, ({ payload }) => {
        setActiveCell(payload.cell)
      })
      .on('broadcast', { event: 'player-attacked' }, ({ payload }) => {
        if (payload.targetId === myPlayerId) {
          setAttackedBy(payload.attackerName)
        }
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

  async function advanceTurn() {
    const sorted = [...players].sort((a, b) => a.turn_order - b.turn_order)
    const currentIdx = sorted.findIndex(p => p.id === room.current_turn)
    const nextPlayer = sorted[(currentIdx + 1) % sorted.length]
    await supabase.from('rooms').update({ current_turn: nextPlayer.id }).eq('id', room.id)
  }

  async function handleRoll() {
    if (!isMyTurn || rolling || cells.length === 0 || !myPlayer || attackUsed) return
    setRolling(true)
    playRollSound()

    const dice = Math.floor(Math.random() * 6) + 1

    await new Promise(resolve => setTimeout(resolve, 1200))

    setDiceResult(dice)
    playLandSound()

    const rawNext = myPlayer.position + dice
    const completedLap = rawNext >= 36
    const newPosition = rawNext % 36

    const playerUpdate = { position: newPosition }

    if (completedLap) {
      playerUpdate.laps = (myPlayer.laps || 0) + 1
      // attack_tickets 컬럼이 없으면 항상 면제권 지급
      const hasAttackCol = myPlayer.attack_tickets !== undefined
      const rewardType = hasAttackCol && Math.random() < 0.5 ? 'attack_tickets' : 'tickets'
      playerUpdate[rewardType] = (myPlayer[rewardType] || 0) + 1
      const rewardName = rewardType === 'tickets' ? '면제권' : '저격권'
      setLapReward(rewardName)
      setTimeout(() => setLapReward(null), 3000)
    }

    const { error } = await supabase.from('players').update(playerUpdate).eq('id', myPlayerId)
    if (error) {
      // laps/tickets 없이 위치만 재시도
      await supabase.from('players').update({ position: newPosition }).eq('id', myPlayerId)
    }

    const cell = cells.find(c => c.position === newPosition)

    if (!cell) {
      // 칸 정보가 없으면 팝업 없이 바로 턴 넘김
      setRolling(false)
      setDiceResult(null)
      await advanceTurn()
      return
    }

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
    await advanceTurn()
  }

  async function handleUseTicket() {
    await supabase
      .from('players')
      .update({ tickets: (myPlayer.tickets || 0) - 1 })
      .eq('id', myPlayerId)
    handleClosePopup()
  }

  async function handleUseAttackTicket(targetId) {
    const target = players.find(p => p.id === targetId)
    if (!target) return
    await supabase
      .from('players')
      .update({ attack_tickets: (myPlayer.attack_tickets || 0) - 1 })
      .eq('id', myPlayerId)
    channelRef.current?.send({
      type: 'broadcast',
      event: 'player-attacked',
      payload: { targetId, attackerName: myPlayer.name, targetName: target.name },
    })
    setShowTargetPicker(false)
    setAttackUsed(true)
    await advanceTurn()
  }

  function handleExit() {
    if (window.confirm('게임을 나가시겠습니까?')) {
      localStorage.removeItem('drinkpoly-session')
      onExit()
    }
  }

  const currentPlayer = players.find(p => p.id === room?.current_turn)
  const otherPlayers = players.filter(p => p.id !== myPlayerId)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 12px 32px',
      gap: '12px',
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #1e1a3a 0%, #0f0e1a 60%)',
    }}>
      {/* 헤더 */}
      <div style={{ width: '100%', maxWidth: '620px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffd93d', letterSpacing: '1px' }}>
          DrinkPoly
        </div>
        <div style={{ fontSize: '13px', color: '#555', fontWeight: '700', letterSpacing: '3px' }}>
          {room?.code}
        </div>
        <button
          onClick={handleExit}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: '600',
            background: 'transparent',
            color: '#555',
            border: '1px solid #2a2848',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          나가기
        </button>
      </div>

      <Board cells={cells} players={players} myPlayerId={myPlayerId} />

      {currentPlayer && (
        <div style={{
          width: '100%',
          maxWidth: '620px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '600',
          color: isMyTurn ? '#ffd93d' : '#888',
          padding: '2px 0',
        }}>
          {isMyTurn ? '내 차례입니다' : `${currentPlayer.name}의 차례`}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '620px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <DiceButton isMyTurn={isMyTurn} onRoll={handleRoll} rolling={rolling} diceResult={diceResult} />
        {isMyTurn && !rolling && !diceResult && !attackUsed && (myPlayer?.attack_tickets || 0) > 0 && (
          <button
            onClick={() => setShowTargetPicker(true)}
            style={{
              padding: '10px 28px',
              fontSize: '14px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 16px rgba(192,57,43,0.4)',
            }}
          >
            저격권 사용 ({myPlayer.attack_tickets}장)
          </button>
        )}
      </div>

      <PlayerList players={players} currentTurn={room?.current_turn} myPlayerId={myPlayerId} />

      {activeCell && (
        <CellPopup
          cell={activeCell}
          isMyTurn={isMyTurn}
          onClose={handleClosePopup}
          myPlayer={myPlayer}
          onUseTicket={handleUseTicket}
        />
      )}

      {/* 바퀴 완주 리워드 토스트 */}
      {lapReward && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #ffd93d 0%, #f39c12 100%)',
          color: '#0f0e1a',
          padding: '14px 28px',
          borderRadius: '16px',
          fontWeight: '900',
          fontSize: '16px',
          zIndex: 200,
          boxShadow: '0 4px 24px rgba(255,217,61,0.5)',
          whiteSpace: 'nowrap',
          animation: 'popupEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          바퀴 완주! {lapReward} 1장 획득
        </div>
      )}

      {/* 저격 당했을 때 팝업 */}
      {attackedBy && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 150,
            padding: '20px',
          }}
        >
          <div style={{
            background: 'linear-gradient(160deg, #2a1010 0%, #1a0808 100%)',
            border: '2px solid #ff6b6b',
            borderRadius: '24px',
            padding: '36px 28px',
            maxWidth: '340px',
            width: '100%',
            textAlign: 'center',
            animation: 'popupEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            boxShadow: '0 0 40px rgba(255,107,107,0.4)',
          }}>
            <div style={{ fontSize: '52px', marginBottom: '12px', lineHeight: 1 }}>🎯</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#ff6b6b', marginBottom: '8px' }}>
              저격당했습니다!
            </div>
            <div style={{ fontSize: '15px', color: '#aaa', marginBottom: '20px' }}>
              {attackedBy}이(가) 저격권을 사용했습니다
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#fff', marginBottom: '24px' }}>
              1잔 마시세요!
            </div>
            <button
              onClick={() => setAttackedBy(null)}
              style={{
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: '800',
                background: '#ff6b6b',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              마셨습니다
            </button>
          </div>
        </div>
      )}

      {/* 저격 타겟 선택 */}
      {showTargetPicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 150,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(160deg, #1e1c32 0%, #13112a 100%)',
            border: '2px solid #ff6b6b',
            borderRadius: '24px',
            padding: '28px',
            width: '100%',
            maxWidth: '340px',
            animation: 'popupEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            boxShadow: '0 0 40px rgba(255,107,107,0.3)',
          }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#ff6b6b', marginBottom: '4px', textAlign: 'center' }}>
              저격권 사용
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px', textAlign: 'center' }}>
              저격할 플레이어를 선택하세요
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {otherPlayers.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleUseAttackTicket(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: '#2a2848',
                    border: '1.5px solid #3a3860',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '24px', lineHeight: 1 }}>{p.avatar || '🎲'}</span>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff', flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>{p.position}칸</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTargetPicker(false)}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                background: 'transparent',
                color: '#555',
                border: '1px solid #2a2848',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}