export default function DiceButton({ isMyTurn, onRoll, rolling, diceResult }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '460px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 0',
    }}>
      {diceResult && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>주사위</span>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#fff',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            border: '2px solid #ffd93d',
          }}>
            {diceResult}
          </div>
        </div>
      )}
      <button
        onClick={onRoll}
        disabled={!isMyTurn || rolling}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '18px',
          fontWeight: 'bold',
          background: isMyTurn && !rolling ? '#ffd93d' : '#1e1e1e',
          color: isMyTurn && !rolling ? '#000' : '#aaa',
          border: isMyTurn && !rolling ? 'none' : '1.5px solid #333',
          borderRadius: '12px',
          cursor: isMyTurn && !rolling ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        {rolling ? '굴리는 중...' : isMyTurn ? '주사위 굴리기' : '다른 플레이어 차례입니다'}
      </button>
    </div>
  )
}
