import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useGame } from '../../context/GameContext'

export default function JoinRoom({ onEnterGame, onBack }) {
  const { setRoom, setPlayers, setMyPlayerId } = useGame()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [localPlayers, setLocalPlayers] = useState([])

  useEffect(() => {
    if (!roomId) return

    const channel = supabase
      .channel(`room-join-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setLocalPlayers(prev => {
          if (prev.find(p => p.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
        setPlayers(prev => {
          if (prev.find(p => p.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        if (payload.new.status === 'playing') onEnterGame()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [roomId])

  async function handleJoin() {
    if (!code.trim() || !name.trim()) return setError('방 코드와 닉네임을 입력해주세요')
    setLoading(true)
    setError('')

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select()
      .eq('code', code.trim().toUpperCase())
      .eq('status', 'waiting')
      .single()

    if (roomError || !room) {
      setError('방을 찾을 수 없습니다')
      setLoading(false)
      return
    }

    const { data: existingPlayers } = await supabase
      .from('players')
      .select()
      .eq('room_id', room.id)

    const turnOrder = (existingPlayers?.length || 0) + 1

    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({ room_id: room.id, name: name.trim(), position: 0, turn_order: turnOrder, is_host: false })
      .select()
      .single()

    if (playerError) {
      setError('입장에 실패했습니다')
      setLoading(false)
      return
    }

    setRoom(room)
    setMyPlayerId(player.id)
    setLocalPlayers([...(existingPlayers || []), player])
    setPlayers([...(existingPlayers || []), player])
    setRoomId(room.id)
    setRoomCode(room.code)
    setLoading(false)
  }

  if (roomId) {
    return (
      <div>
        <h2>방 코드: {roomCode}</h2>
        <p>방장이 게임을 시작할 때까지 기다려주세요</p>
        <h3>참여자 ({localPlayers.length}명)</h3>
        <ul>
          {localPlayers.map(p => (
            <li key={p.id}>{p.name}{p.is_host ? ' (방장)' : ''}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div>
      <button onClick={onBack}>뒤로</button>
      <h2>방 참여하기</h2>
      <input
        type="text"
        placeholder="방 코드 (4자리)"
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        maxLength={4}
      />
      <input
        type="text"
        placeholder="닉네임"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={10}
      />
      {error && <p>{error}</p>}
      <button onClick={handleJoin} disabled={loading}>
        {loading ? '입장 중...' : '입장'}
      </button>
    </div>
  )
}
