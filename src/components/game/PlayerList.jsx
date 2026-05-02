import { PLAYER_COLORS } from './Board'

export default function PlayerList({ players, currentTurn, myPlayerId }) {
  const sorted = [...players].sort((a, b) => a.turn_order - b.turn_order)

  return (
    <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {sorted.map((p, idx) => {
        const isCurrentTurn = p.id === currentTurn
        const isMe = p.id === myPlayerId
        const color = PLAYER_COLORS[idx % PLAYER_COLORS.length]

        return (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 14px',
              borderRadius: '12px',
              background: isCurrentTurn
                ? 'linear-gradient(135deg, #2a2618 0%, #1e1c10 100%)'
                : '#16152a',
              animation: isCurrentTurn ? 'pulseGlow 2s ease-in-out infinite' : 'none',
              transition: 'all 0.3s',
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
              boxShadow: isCurrentTurn ? `0 0 8px ${color}` : 'none',
            }} />
            <span style={{
              fontWeight: isMe ? '700' : '400',
              flex: 1,
              fontSize: '15px',
              color: isCurrentTurn ? '#fff' : '#ccc',
            }}>
              {p.name}
              {isMe && (
                <span style={{
                  color: '#6660aa',
                  fontSize: '11px',
                  marginLeft: '6px',
                  fontWeight: '500',
                }}>나</span>
              )}
              {p.is_host && (
                <span style={{
                  color: '#ffd93d',
                  fontSize: '11px',
                  marginLeft: '6px',
                  fontWeight: '700',
                }}>방장</span>
              )}
            </span>
            <span style={{
              fontSize: '12px',
              color: isCurrentTurn ? '#aaa' : '#555',
              fontWeight: '500',
            }}>
              {p.position}칸
            </span>
            {isCurrentTurn && (
              <span style={{
                fontSize: '11px',
                background: '#ffd93d',
                color: '#0f0e1a',
                padding: '3px 10px',
                borderRadius: '10px',
                fontWeight: '800',
                letterSpacing: '0.5px',
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
