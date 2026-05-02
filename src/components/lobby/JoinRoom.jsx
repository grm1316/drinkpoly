import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useGame } from '../../context/GameContext'

const inputStyle = {
  width: '100%',
  padding: '16px',
  fontSize: '16px',
  background: '#1e1c32',
  color: '#fff',
  border: '1.5px solid #3a3860',
  borderRadius: '12px',
  outline: 'none',
}

const labelStyle = {
  fontSize: '13px',
  color: '#aaa',
  fontWeight: '500',
  marginBottom: '6px',
  display: 'block',
}

export default function JoinRoom({ onEnterGame, onBack }) {
  const { setRoom, setPlayers, setMyPlayerId } = useGame()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [localPlayers, setLocalPlayers] = useState([])
  const [maxPlayers, setMaxPlayers] = useState(0)

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
        if (payload.new.status === 'playing') {
          setRoom(payload.new)
          onEnterGame()
        }
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
      .in('status', ['waiting', 'playing'])
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

    if (room.status === 'playing') {
      const existing = existingPlayers?.find(p => p.name === name.trim())
      if (!existing) {
        setError('게임이 이미 시작됐습니다')
        setLoading(false)
        return
      }
      setRoom(room)
      setMyPlayerId(existing.id)
      setPlayers(existingPlayers)
      onEnterGame()
      return
    }

    if ((existingPlayers?.length || 0) >= room.max_players) {
      setError('방이 꽉 찼습니다')
      setLoading(false)
      return
    }

    const duplicate = existingPlayers?.find(p => p.name === name.trim())
    if (duplicate) {
      setError('이미 사용 중인 닉네임입니다')
      setLoading(false)
      return
    }

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
    setMaxPlayers(room.max_players)
    setLoading(false)
  }

  if (roomId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>방 코드</div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: '#ffd93d', letterSpacing: '8px' }}>{roomCode}</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>방장이 게임을 시작할 때까지 기다려주세요</div>
          </div>
          <div style={{ background: '#1e1c32', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', color: '#aaa', fontWeight: '500' }}>참여자 ({localPlayers.length}/{maxPlayers}명)</div>
            {localPlayers.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#2a2848', borderRadius: '10px', fontSize: '15px', fontWeight: '500' }}>
                <span style={{ flex: 1 }}>{p.name}</span>
                {p.is_host && <span style={{ fontSize: '11px', color: '#ffd93d', fontWeight: '700' }}>방장</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '24px', padding: '0', lineHeight: 1 }}>←</button>
          <span style={{ fontSize: '20px', fontWeight: '700' }}>방 참여하기</span>
        </div>
        <div>
          <label style={labelStyle}>방 코드</label>
          <input type="text" placeholder="4자리 코드 입력" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={4}
            style={{ ...inputStyle, fontSize: '24px', fontWeight: '700', letterSpacing: '6px', textAlign: 'center' }} />
        </div>
        <div>
          <label style={labelStyle}>닉네임</label>
          <input type="text" placeholder="닉네임을 입력하세요" value={name} onChange={e => setName(e.target.value)} maxLength={10} style={inputStyle} />
        </div>
        {error && <p style={{ color: '#ff6b6b', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
        <button onClick={handleJoin} disabled={loading}
          style={{ padding: '18px', fontSize: '17px', fontWeight: '700', background: '#ffd93d', color: '#0f0e1a', border: 'none', borderRadius: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? '입장 중...' : '입장하기'}
        </button>
      </div>
    </div>
  )
}