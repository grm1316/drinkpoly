const TYPE_COLORS = {
  drink: '#ff6b6b',
  mission: '#48cae4',
  penalty: '#a29bfe',
  special: '#ffd93d',
  neutral: '#8a9ba8',
}

const TYPE_LABELS = {
  drink: '음주',
  mission: '미션',
  penalty: '벌칙',
  special: '특수',
  neutral: '중립',
}

const TYPE_EMOJI = {
  drink: '🍺',
  mission: '🎯',
  penalty: '💀',
  special: '✨',
  neutral: '😐',
}

export default function CellPopup({ cell, isMyTurn, onClose, myPlayer, onUseTicket }) {
  const color = TYPE_COLORS[cell.type] || '#8a9ba8'
  const canUseTicket = isMyTurn
    && (cell.type === 'drink' || cell.type === 'penalty')
    && (myPlayer?.tickets || 0) > 0

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.82)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #1e1c32 0%, #13112a 100%)',
        border: `2px solid ${color}`,
        borderRadius: '24px',
        padding: '36px 28px',
        width: '100%',
        maxWidth: '380px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        animation: 'popupEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        boxShadow: `0 0 40px ${color}33, 0 20px 60px rgba(0,0,0,0.6)`,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '36px', lineHeight: 1 }}>{TYPE_EMOJI[cell.type]}</div>
          <div style={{
            padding: '5px 18px',
            borderRadius: '20px',
            background: color,
            color: cell.type === 'special' ? '#0f0e1a' : '#fff',
            fontSize: '13px',
            fontWeight: '800',
            letterSpacing: '1px',
          }}>
            {TYPE_LABELS[cell.type]}
          </div>
        </div>

        <div style={{
          fontSize: 'clamp(20px, 5vw, 26px)',
          fontWeight: '700',
          color: '#fff',
          lineHeight: 1.5,
          textShadow: `0 0 20px ${color}66`,
        }}>
          {cell.description}
        </div>

        {isMyTurn ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {canUseTicket && (
              <button
                onClick={onUseTicket}
                style={{
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #2a2848 0%, #1e1c32 100%)',
                  color: '#ffd93d',
                  border: '2px solid rgba(255,217,61,0.5)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                }}
              >
                면제권 사용 (남은 {myPlayer.tickets}장)
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '16px',
                fontSize: '16px',
                fontWeight: '800',
                background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                color: cell.type === 'special' ? '#0f0e1a' : '#fff',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                boxShadow: `0 4px 16px ${color}55`,
              }}
            >
              확인 (다음 턴)
            </button>
          </div>
        ) : (
          <p style={{ color: '#555', fontSize: '13px', fontWeight: '500' }}>
            차례 플레이어가 확인을 눌러야 넘어갑니다
          </p>
        )}
      </div>
    </div>
  )
}