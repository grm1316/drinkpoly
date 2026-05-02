import { useState, useEffect, useRef } from 'react'

const PIPS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
}

function DiceFace({ value, size = 80, rolling, landed }) {
  const pips = PIPS[value] || []
  const pipSize = size * 0.18

  const animation = rolling
    ? 'diceRoll 0.18s ease-in-out infinite'
    : landed
    ? 'diceLand 0.35s ease-out forwards'
    : 'none'

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size * 0.18,
      background: '#fff',
      position: 'relative',
      boxShadow: rolling
        ? '0 0 24px rgba(255,217,61,0.7)'
        : '0 4px 16px rgba(0,0,0,0.4)',
      animation,
      flexShrink: 0,
    }}>
      {pips.map(([left, top], i) => (
        <div key={i} style={{
          position: 'absolute',
          width: pipSize,
          height: pipSize,
          borderRadius: '50%',
          background: '#1a1a2e',
          left: `${left}%`,
          top: `${top}%`,
          transform: 'translate(-50%, -50%)',
        }} />
      ))}
    </div>
  )
}

export default function DiceButton({ isMyTurn, onRoll, rolling, diceResult }) {
  const [displayValue, setDisplayValue] = useState(1)
  const [landed, setLanded] = useState(false)
  const intervalRef = useRef(null)
  const prevResult = useRef(null)

  useEffect(() => {
    if (rolling) {
      setLanded(false)
      intervalRef.current = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1)
      }, 120)
    } else {
      clearInterval(intervalRef.current)
      if (diceResult) {
        setDisplayValue(diceResult)
        if (prevResult.current !== diceResult) {
          setLanded(true)
          prevResult.current = diceResult
          setTimeout(() => setLanded(false), 350)
        }
      }
    }
    return () => clearInterval(intervalRef.current)
  }, [rolling, diceResult])

  return (
    <div style={{
      width: '100%',
      maxWidth: '460px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 0',
    }}>
      <DiceFace value={displayValue} size={80} rolling={rolling} landed={landed} />

      <button
        onClick={onRoll}
        disabled={!isMyTurn || rolling}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '18px',
          fontWeight: 'bold',
          background: isMyTurn && !rolling ? '#ffd93d' : '#1e1c32',
          color: isMyTurn && !rolling ? '#0f0e1a' : '#555',
          border: isMyTurn && !rolling ? 'none' : '1.5px solid #3a3860',
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