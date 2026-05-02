import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useGame } from '../../context/GameContext'
import { AVATARS } from '../../lib/avatars'

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

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

export default function CreateRoom({ onEnterGame, onBack }) {
  const { setRoom, setPlayers, setMyPlayerId } = useGame()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🐻')
  const [maxPlayers, setMaxPlayers] = useState(6)
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
      .insert({ code, status: 'waiting', max_players: maxPlayers })
      .select()
      .single()

    if (roomError) {
      setError('방 생성에 실패했습니다')
      setLoading(false)
      return
    }

    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({ room_id: room.id, name: name.trim(), avatar, position: 0, turn_order: 1, is_host: true })
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
    const { data: updatedRoom } = await supabase
      .from('rooms')
      .update({ status: 'playing', current_turn: hostPlayer.id })
      .eq('id', roomId)
      .select()
      .single()
    setRoom(updatedRoom)
    localStorage.setItem('drinkpoly-session', JSON.stringify({ roomId, myPlayerId: hostPlayer.id }))
    onEnterGame()
  }

  if (roomCode) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>방 코드</div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: '#ffd93d', letterSpacing: '8px' }}>{roomCode}</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>친구들에게 공유하세요</div>
          </div>

          <div style={{ background: '#1e1c32', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', color: '#aaa', fontWeight: '500' }}>참여자 ({localPlayers.length}/{maxPlayers}명)</div>
            {localPlayers.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#2a2848', borderRadius: '10px' }}>
                <span style={{ fontSize: '22px', lineHeight: 1 }}>{p.avatar || '🎲'}</span>
                <span style={{ flex: 1, fontSize: '15px', fontWeight: '500' }}>{p.name}</span>
                {p.is_host && <span style={{ fontSize: '11px', color: '#ffd93d', fontWeight: '700' }}>방장</span>}
              </div>
            ))}
          </div>

          <button
            onClick={handleStartGame}
            disabled={localPlayers.length < 2}
            style={{
              padding: '18px', fontSize: '17px', fontWeight: '700',
              background: localPlayers.length >= 2 ? '#ffd93d' : '#2a2848',
              color: localPlayers.length >= 2 ? '#0f0e1a' : '#555',
              border: 'none', borderRadius: '14px',
              cursor: localPlayers.length >= 2 ? 'pointer' : 'not-allowed',
            }}
          >
            {localPlayers.length < 2 ? '최소 2명이 필요합니다' : '게임 시작'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '24px', padding: '0', lineHeight: 1 }}>←</button>
          <span style={{ fontSize: '20px', fontWeight: '700' }}>방 만들기</span>
        </div>

        <div>
          <label style={labelStyle}>닉네임</label>
          <input type="text" placeholder="닉네임을 입력하세요" value={name}
            onChange={e => setName(e.target.value)} maxLength={10} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>내 캐릭터 <span style={{ fontSize: '20px' }}>{avatar}</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                style={{
                  padding: '10px 0',
                  fontSize: '22px',
                  background: avatar === a ? '#2a2848' : '#16152a',
                  border: avatar === a ? '2px solid #ffd93d' : '2px solid transparent',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>최대 인원</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[2, 3, 4, 5, 6, 7, 8].map(n => (
              <button key={n} onClick={() => setMaxPlayers(n)} style={{
                flex: 1, minWidth: '40px', padding: '12px 0', fontSize: '15px', fontWeight: '700',
                background: maxPlayers === n ? '#ffd93d' : '#1e1c32',
                color: maxPlayers === n ? '#0f0e1a' : '#aaa',
                border: maxPlayers === n ? 'none' : '1.5px solid #3a3860',
                borderRadius: '10px', cursor: 'pointer',
              }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#ff6b6b', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

        <button onClick={handleCreate} disabled={loading} style={{
          padding: '18px', fontSize: '17px', fontWeight: '700',
          background: '#ffd93d', color: '#0f0e1a', border: 'none', borderRadius: '14px',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? '생성 중...' : '방 만들기'}
        </button>
      </div>
    </div>
  )
}