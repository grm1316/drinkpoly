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
              fontSize: '22px',
              lineHeight: 1,
              flexShrink: 0,
              filter: isCurrentTurn ? 'drop-shadow(0 0 6px rgba(255,217,61,0.8))' : 'none',
            }}>
              {p.avatar || '🎲'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <span style={{
                  fontWeight: isMe ? '700' : '400',
                  fontSize: '15px',
                  color: isCurrentTurn ? '#fff' : '#ccc',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {p.name}
                </span>
                {isMe && (
                  <span style={{ color: '#6660aa', fontSize: '11px', fontWeight: '500', flexShrink: 0 }}>나</span>
                )}
                {p.is_host && (
                  <span style={{ color: '#ffd93d', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>방장</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#555', fontWeight: '500' }}>
                  {p.laps || 0}바퀴
                </span>
                {(p.tickets || 0) > 0 && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    background: 'rgba(255,217,61,0.12)',
                    color: '#ffd93d',
                    padding: '1px 6px',
                    borderRadius: '5px',
                    border: '1px solid rgba(255,217,61,0.25)',
                  }}>
                    면제 {p.tickets}
                  </span>
                )}
                {(p.attack_tickets || 0) > 0 && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    background: 'rgba(255,107,107,0.12)',
                    color: '#ff6b6b',
                    padding: '1px 6px',
                    borderRadius: '5px',
                    border: '1px solid rgba(255,107,107,0.25)',
                  }}>
                    저격 {p.attack_tickets}
                  </span>
                )}
              </div>
            </div>

            <span style={{
              fontSize: '12px',
              color: isCurrentTurn ? '#aaa' : '#555',
              fontWeight: '500',
              flexShrink: 0,
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
                flexShrink: 0,
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