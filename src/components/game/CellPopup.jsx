const TYPE_COLORS = {
  drink: '#ff6b6b',
  mission: '#48cae4',
  penalty: '#a29bfe',
  special: '#ffd93d',
  neutral: '#636e72',
}

const TYPE_LABELS = {
  drink: '음주',
  mission: '미션',
  penalty: '벌칙',
  special: '특수',
  neutral: '중립',
}

export default function CellPopup({ cell, isMyTurn, onClose }) {
  const color = TYPE_COLORS[cell.type] || '#888'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div style={{
        background: '#1e1e1e',
        border: `2px solid ${color}`,
        borderRadius: '20px',
        padding: '36px 28px',
        width: '100%',
        maxWidth: '380px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{
          display: 'inline-block',
          alignSelf: 'center',
          padding: '5px 16px',
          borderRadius: '20px',
          background: color,
          color: '#000',
          fontSize: '14px',
          fontWeight: 'bold',
        }}>
          {TYPE_LABELS[cell.type]}
        </div>

        <div style={{
          fontSize: 'clamp(20px, 5vw, 28px)',
          fontWeight: 'bold',
          color: '#fff',
          lineHeight: 1.4,
        }}>
          {cell.description}
        </div>

        {isMyTurn ? (
          <button
            onClick={onClose}
            style={{
              padding: '14px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: color,
              color: '#000',
              border: 'none',
              borderRadius: '12px',
            }}
          >
            확인 (다음 턴)
          </button>
        ) : (
          <p style={{ color: '#666', fontSize: '14px' }}>
            현재 차례 플레이어가 확인을 눌러야 넘어갑니다
          </p>
        )}
      </div>
    </div>
  )
}
