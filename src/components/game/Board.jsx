const TYPE_COLORS = {
  drink: '#ff6b6b',
  mission: '#48cae4',
  penalty: '#a29bfe',
  special: '#ffd93d',
  neutral: '#636e72',
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
      width: 'min(92vw, 460px)',
      height: 'min(92vw, 460px)',
      border: '2px solid #444',
      borderRadius: '12px',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* 중앙 영역 */}
      <div style={{
        gridRow: '2 / 10',
        gridColumn: '2 / 10',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a2e',
        gap: '6px',
      }}>
        <div style={{ fontSize: 'clamp(16px, 4vw, 24px)', fontWeight: 'bold', color: '#ffd93d', letterSpacing: '1px' }}>
          DrinkPoly
        </div>
        <div style={{ fontSize: 'clamp(9px, 2vw, 12px)', color: '#888' }}>
          주루마블
        </div>
      </div>

      {/* 칸 */}
      {cells.map(cell => {
        const { gridRow, gridColumn } = getGridPos(cell.position)
        const playersHere = playersByPosition[cell.position] || []
        const bg = TYPE_COLORS[cell.type] || '#636e72'

        return (
          <div
            key={cell.id}
            style={{
              gridRow,
              gridColumn,
              background: bg,
              border: '1px solid rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px 1px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 'clamp(6px, 1.5vw, 9px)', color: 'rgba(0,0,0,0.5)', lineHeight: 1 }}>
              {TYPE_LABELS[cell.type]}
            </div>
            <div style={{ fontSize: 'clamp(5px, 1.2vw, 8px)', color: 'rgba(0,0,0,0.6)', lineHeight: 1 }}>
              {cell.position}
            </div>
            {playersHere.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', justifyContent: 'center' }}>
                {playersHere.map(p => (
                  <div
                    key={p.id}
                    title={p.name}
                    style={{
                      width: 'clamp(8px, 2vw, 12px)',
                      height: 'clamp(8px, 2vw, 12px)',
                      borderRadius: '50%',
                      background: PLAYER_COLORS[p.colorIdx % PLAYER_COLORS.length],
                      border: p.id === myPlayerId ? '1.5px solid #fff' : '1px solid rgba(0,0,0,0.3)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { PLAYER_COLORS }
