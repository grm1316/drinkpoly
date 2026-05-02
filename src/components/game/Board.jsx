const TYPE_COLORS = {
  drink: '#e05252',
  mission: '#2eb8d8',
  penalty: '#9b8fe4',
  special: '#e8c82a',
  neutral: '#4a5568',
}

const TYPE_DARK_COLORS = {
  drink: '#a03030',
  mission: '#1a8aaa',
  penalty: '#6a5fc0',
  special: '#b09010',
  neutral: '#2d3748',
}

const TYPE_LABELS = {
  drink: '술',
  mission: '미션',
  penalty: '벌칙',
  special: '특수',
  neutral: '중립',
}

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#fd79a8']

function getGridPos(position) {
  if (position <= 9) return { gridRow: 10, gridColumn: position + 1 }
  if (position <= 18) return { gridRow: 10 - (position - 9), gridColumn: 10 }
  if (position <= 27) return { gridRow: 1, gridColumn: 10 - (position - 18) }
  return { gridRow: position - 26, gridColumn: 1 }
}

export default function Board({ cells, players, myPlayerId }) {
  const sortedPlayers = [...players].sort((a, b) => a.turn_order - b.turn_order)

  const playersByPosition = {}
  sortedPlayers.forEach((p, idx) => {
    if (!playersByPosition[p.position]) playersByPosition[p.position] = []
    playersByPosition[p.position].push({ ...p, colorIdx: idx })
  })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(10, 1fr)',
      gridTemplateRows: 'repeat(10, 1fr)',
      width: 'min(96vw, 620px)',
      height: 'min(96vw, 620px)',
      border: '2px solid rgba(255,217,61,0.3)',
      borderRadius: '14px',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 0 32px rgba(255,217,61,0.08), 0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {/* 중앙 영역 */}
      <div style={{
        gridRow: '2 / 10',
        gridColumn: '2 / 10',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #1e1a3a 0%, #0f0e1a 100%)',
        gap: '4px',
      }}>
        <div style={{
          fontSize: 'clamp(14px, 3.5vw, 22px)',
          fontWeight: '900',
          color: '#ffd93d',
          letterSpacing: '1px',
          textShadow: '0 0 12px rgba(255,217,61,0.5)',
        }}>
          DrinkPoly
        </div>
        <div style={{ fontSize: 'clamp(8px, 1.8vw, 11px)', color: '#6660aa', fontWeight: '500' }}>
          주루마블
        </div>
      </div>

      {/* 칸 */}
      {cells.map(cell => {
        const { gridRow, gridColumn } = getGridPos(cell.position)
        const playersHere = playersByPosition[cell.position] || []
        const bg = TYPE_COLORS[cell.type] || '#4a5568'
        const bgDark = TYPE_DARK_COLORS[cell.type] || '#2d3748'
        const label = TYPE_LABELS[cell.type] || ''

        return (
          <div
            key={cell.id}
            style={{
              gridRow,
              gridColumn,
              background: `linear-gradient(160deg, ${bg} 0%, ${bgDark} 100%)`,
              border: '1px solid rgba(0,0,0,0.4)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px 1px 2px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 타입 라벨 */}
            <div style={{
              fontSize: 'clamp(6px, 1.4vw, 9px)',
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1,
              fontWeight: '800',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              letterSpacing: '-0.3px',
            }}>
              {label}
            </div>

            {/* 플레이어 토큰 */}
            {playersHere.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', justifyContent: 'center' }}>
                {playersHere.map(p => (
                  <div
                    key={p.id}
                    title={p.name}
                    style={{
                      fontSize: 'clamp(12px, 2.8vw, 18px)',
                      lineHeight: 1,
                      filter: p.id === myPlayerId
                        ? 'drop-shadow(0 0 4px #fff) drop-shadow(0 0 8px rgba(255,217,61,0.9))'
                        : 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))',
                    }}
                  >
                    {p.avatar || '🎲'}
                  </div>
                ))}
              </div>
            )}

            {/* 위치 번호 */}
            <div style={{
              fontSize: 'clamp(5px, 1vw, 7px)',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1,
              fontWeight: '600',
            }}>
              {cell.position}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { PLAYER_COLORS }