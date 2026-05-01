import { PLAYER_COLORS } from './Board'

export default function PlayerList({ players, currentTurn, myPlayerId }) {
  const sorted = [...players].sort((a, b) => a.turn_order - b.turn_order)

  return (
    <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {sorted.map((p, idx) => {
        const isCurrentTurn = p.id === currentTurn
        const isMe = p.id === myPlayerId

        return (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: isCurrentTurn ? '#2a2a1a' : '#1e1e1e',
              border: isCurrentTurn ? '1.5px solid #ffd93d' : '1.5px solid #333',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: PLAYER_COLORS[idx % PLAYER_COLORS.length],
              flexShrink: 0,
            }} />
            <span style={{ fontWeight: isMe ? 'bold' : 'normal', flex: 1, fontSize: '15px' }}>
              {p.name}
              {isMe && <span style={{ color: '#888', fontSize: '12px', marginLeft: '6px' }}>나</span>}
              {p.is_host && <span style={{ color: '#ffd93d', fontSize: '11px', marginLeft: '6px' }}>방장</span>}
            </span>
            <span style={{ fontSize: '12px', color: '#888' }}>{p.position}칸</span>
            {isCurrentTurn && (
              <span style={{
                fontSize: '11px',
                background: '#ffd93d',
                color: '#000',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 'bold',
              }}>
                차례
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
