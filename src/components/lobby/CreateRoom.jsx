import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useGame } from '../../context/GameContext'

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

export default function CreateRoom({ onEnterGame, onBack }) {
  const { setRoom, setPlayers, setMyPlayerId } = useGame()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [localPlayers, setLocalPlayers] = useState([])

  useEffect(() => {
    if (!roomId) return

    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setLocalPlayers(prev => [...prev, payload.new])
        setPlayers(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [roomId])

  async function handleCreate() {
    if (!name.trim()) return setError('닉네임을 입력해주세요')
    setLoading(true)
    setError('')

    const code = generateCode()

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({ code, status: 'waiting' })
      .select()
      .single()

    if (roomError) {
      setError('방 생성에 실패했습니다')
      setLoading(false)
      return
    }

    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({ room_id: room.id, name: name.trim(), position: 0, turn_order: 1, is_host: true })
      .select()
      .single()

    if (playerError) {
      setError('플레이어 등록에 실패했습니다')
      setLoading(false)
      return
    }

    setRoom(room)
    setMyPlayerId(player.id)
    setLocalPlayers([player])
    setPlayers([player])
    setRoomId(room.id)
    setRoomCode(code)
    setLoading(false)
  }

  async function handleStartGame() {
    const hostPlayer = localPlayers.find(p => p.is_host)
    await supabase
      .from('rooms')
      .update({ status: 'playing', current_turn: hostPlayer.id })
      .eq('id', roomId)
    onEnterGame()
  }

  if (roomCode) {
    return (
      <div>
        <h2>방 코드: {roomCode}</h2>
        <p>친구들에게 공유하세요</p>
        <h3>참여자 ({localPlayers.length}명)</h3>
        <ul>
          {localPlayers.map(p => (
            <li key={p.id}>{p.name}{p.is_host ? ' (방장)' : ''}</li>
          ))}
        </ul>
        <button onClick={handleStartGame} disabled={localPlayers.length < 2}>
          게임 시작
        </button>
        {localPlayers.length < 2 && <p>최소 2명이 필요합니다</p>}
      </div>
    )
  }

  return (
    <div>
      <button onClick={onBack}>뒤로</button>
      <h2>방 만들기</h2>
      <input
        type="text"
        placeholder="닉네임"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={10}
      />
      {error && <p>{error}</p>}
      <button onClick={handleCreate} disabled={loading}>
        {loading ? '생성 중...' : '방 만들기'}
      </button>
    </div>
  )
}
