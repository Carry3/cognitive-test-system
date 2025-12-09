import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { GameProps, TrialResult } from '../../types/game'

// Color words and their corresponding colors
const COLOR_OPTIONS = [
  { name: 'RED', color: '#FF4B4B' },
  { name: 'BLUE', color: '#1CB0F6' },
  { name: 'GREEN', color: '#58CC02' },
  { name: 'YELLOW', color: '#FFC800' },
] as const

const DEFAULT_KEY_MAPPING = {
  RED: 'Digit1',
  BLUE: 'Digit2',
  GREEN: 'Digit3',
  YELLOW: 'Digit4',
}

// Convert key code to friendly label
const getKeyLabel = (keyCode: string): string => {
  // Handle Digit keys (Digit1 -> 1, Digit6 -> 6, etc.)
  if (keyCode.startsWith('Digit')) {
    return keyCode.replace('Digit', '')
  }
  // Handle Key keys (KeyQ -> Q, KeyB -> B, etc.)
  if (keyCode.startsWith('Key')) {
    return keyCode.replace('Key', '')
  }
  // Handle Arrow keys
  if (keyCode.startsWith('Arrow')) {
    const direction = keyCode.replace('Arrow', '')
    return `Arrow${direction.charAt(0)}${direction.slice(1).toLowerCase()}`
  }
  // Handle other special keys
  const specialKeys: Record<string, string> = {
    Space: 'Space',
    Enter: 'Enter',
    Escape: 'Esc',
    Backspace: 'Backspace',
    Tab: 'Tab',
    ShiftLeft: 'L Shift',
    ShiftRight: 'R Shift',
    ControlLeft: 'L Ctrl',
    ControlRight: 'R Ctrl',
    AltLeft: 'L Alt',
    AltRight: 'R Alt',
  }
  return specialKeys[keyCode] || keyCode
}

const randomDelay = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export const Stroop: React.FC<GameProps> = ({ onFinish, onUpdateStats }) => {
  const [content, setContent] = useState<React.ReactNode>('Preparing...')
  const [showInstructions, setShowInstructions] = useState(true)
  const [keyMapping, setKeyMapping] = useState<Record<string, string>>(DEFAULT_KEY_MAPPING)
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const stateRef = useRef({
    count: 0,
    hits: 0,
    rts: [] as number[],
    trials: [] as TrialResult[],
    active: false,
    wordIndex: 0,
    colorIndex: 0,
    isCongruent: false,
    startT: 0,
    trialStartTime: 0,
    waitTimer: null as ReturnType<typeof setTimeout> | null,
    feedbackTimer: null as ReturnType<typeof setTimeout> | null,
  })

  const next = useCallback(() => {
    const state = stateRef.current

    if (state.waitTimer) {
      clearTimeout(state.waitTimer)
      state.waitTimer = null
    }
    if (state.feedbackTimer) {
      clearTimeout(state.feedbackTimer)
      state.feedbackTimer = null
    }

    if (state.count >= 20) {
      const avg = state.rts.length ? state.rts.reduce((a, b) => a + b, 0) / state.rts.length : 0
      const acc = (state.hits / state.count) * 100
      onFinish({ avg, accuracy: acc, trials: state.trials })
      return
    }

    setContent(<div style={{ fontSize: '48px', color: '#666' }}>Waiting...</div>)
    state.trialStartTime = performance.now()

    state.waitTimer = setTimeout(() => {
      const wordIdx = Math.floor(Math.random() * COLOR_OPTIONS.length)
      let colorIdx = Math.floor(Math.random() * COLOR_OPTIONS.length)

      const shouldBeCongruent = Math.random() > 0.5
      if (shouldBeCongruent) {
        colorIdx = wordIdx
      } else {
        while (colorIdx === wordIdx) {
          colorIdx = Math.floor(Math.random() * COLOR_OPTIONS.length)
        }
      }

      state.wordIndex = wordIdx
      state.colorIndex = colorIdx
      state.isCongruent = shouldBeCongruent

      setContent(
        <div style={{ fontSize: '72px', fontWeight: 'bold', color: COLOR_OPTIONS[colorIdx].color }}>
          {COLOR_OPTIONS[wordIdx].name}
        </div>,
      )

      state.startT = performance.now()
      state.active = true
    }, randomDelay(800, 1500))
  }, [onFinish])

  const handleColorSelect = useCallback(
    (colorIndex: number) => {
      const state = stateRef.current
      if (!state.active) return

      state.active = false
      if (state.waitTimer) clearTimeout(state.waitTimer)

      const rt = performance.now() - state.startT
      const isCorrect = colorIndex === state.colorIndex

      state.count++
      const trial: TrialResult = {
        trialNumber: state.count,
        correct: isCorrect,
        reactionTime: rt,
        timestamp: state.trialStartTime,
        metadata: {
          wordName: COLOR_OPTIONS[state.wordIndex].name,
          wordColor: COLOR_OPTIONS[state.wordIndex].color,
          displayColor: COLOR_OPTIONS[state.colorIndex].color,
          isCongruent: state.isCongruent,
          selectedColorIndex: colorIndex,
          expectedColorIndex: state.colorIndex,
        },
      }
      state.trials.push(trial)

      if (isCorrect) {
        state.rts.push(rt)
        state.hits++
        setContent(`✅ ${rt.toFixed(0)}ms`)
      } else {
        setContent(`❌ Should be ${COLOR_OPTIONS[state.colorIndex].name}`)
      }

      state.feedbackTimer = setTimeout(() => {
        onUpdateStats(state.count, state.hits)
        next()
      }, 1000)
    },
    [onUpdateStats, next],
  )

  useEffect(() => {
    if (showInstructions) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current
      if (!state.active) return

      // Find which color this key maps to
      const colorName = Object.keys(keyMapping).find((color) => keyMapping[color] === e.code)

      if (colorName) {
        const colorIndex = COLOR_OPTIONS.findIndex((c) => c.name === colorName)
        if (colorIndex !== -1) {
          handleColorSelect(colorIndex)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    next()

    // Capture current state for cleanup
    const currentState = stateRef.current

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (currentState.waitTimer) clearTimeout(currentState.waitTimer)
      if (currentState.feedbackTimer) clearTimeout(currentState.feedbackTimer)
    }
  }, [showInstructions, keyMapping, handleColorSelect, next])

  const handleKeyMappingClick = (colorName: string) => {
    setEditingKey(colorName)
  }

  // Handle key capture for mapping editing
  useEffect(() => {
    if (!editingKey || !showInstructions) return

    const handleKeyCapture = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Check if this key is already assigned to another color
      const isAlreadyUsed = Object.entries(keyMapping).some(
        ([colorName, keyCode]) => colorName !== editingKey && keyCode === e.code,
      )

      if (isAlreadyUsed) {
        // Key is already used, show error or just ignore
        alert(`This key is already assigned to another color. Please choose a different key.`)
        return
      }

      setKeyMapping((prev) => ({
        ...prev,
        [editingKey]: e.code,
      }))
      setEditingKey(null)
    }

    document.addEventListener('keydown', handleKeyCapture, true)
    return () => {
      document.removeEventListener('keydown', handleKeyCapture, true)
    }
  }, [editingKey, showInstructions, keyMapping])

  if (showInstructions) {
    return (
      <div
        className='game-frame'
        id='game-canvas'
        style={{ fontSize: '18px', padding: '30px', textAlign: 'center', height: 'auto' }}
      >
        <div style={{ marginBottom: '30px', lineHeight: '1.8', width: '100%' }}>
          <p style={{ marginBottom: '15px' }}>
            Select the <strong style={{ color: '#FF4B4B' }}>ink color</strong> of the word,{' '}
            <strong>ignore the word meaning</strong>
          </p>

          <div
            style={{
              marginBottom: '10px',
              padding: '10px',
              background: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
              Key Mapping (Click to Change)
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                maxWidth: '400px',
                margin: '0 auto',
                padding: '10px',
              }}
            >
              {COLOR_OPTIONS.map((color) => {
                // 根据 color.name 决定颜色类，默认为蓝色
                let colorClass = 'duo-btn-blue'
                if (color.name === 'RED') {
                  colorClass = 'duo-btn-red'
                } else if (color.name === 'GREEN') {
                  colorClass = 'duo-btn-green'
                } else if (color.name === 'YELLOW') {
                  colorClass = 'duo-btn-yellow'
                } else if (color.name === 'BLUE') {
                  colorClass = 'duo-btn-blue'
                }

                return (
                  <button
                    key={color.name}
                    className={`duo-btn ${colorClass}`}
                    onClick={() => handleKeyMappingClick(color.name)}
                  >
                    <div className='duo-btn-content'>
                      <div className='duo-btn-text'>{color.name}</div>
                      <div className='duo-btn-key'>
                        (
                        {editingKey === color.name
                          ? 'Press key...'
                          : getKeyLabel(keyMapping[color.name])}
                        )
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            {editingKey && (
              <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
                Press any key to assign it to{' '}
                {COLOR_OPTIONS.find((c) => c.name === editingKey)?.name}
              </p>
            )}
          </div>

          <p style={{ fontSize: '16px', color: '#666', marginTop: '20px' }}>
            Example: If you see{' '}
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#0096C7' }}>RED</span>{' '}
            (word "RED" in blue ink),
            <br />
            click the <strong style={{ color: '#0096C7' }}>BLUE</strong> button or press the key
            mapped to BLUE
          </p>
        </div>
        <button
          className='btn btn-primary'
          style={{ fontSize: '18px', padding: '12px 40px' }}
          onClick={() => {
            if (editingKey) {
              setEditingKey(null)
            } else {
              setShowInstructions(false)
            }
          }}
        >
          {editingKey ? 'Cancel Editing' : 'Start Test'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>
      <div
        className='game-frame'
        id='game-canvas'
        style={{
          fontSize: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          minHeight: '300px',
        }}
      >
        {content}
      </div>
      、
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {COLOR_OPTIONS.map((color, idx) => {
          const keyLabel = getKeyLabel(keyMapping[color.name])
          const isActive = stateRef.current.active // 检查是否激活

          // 根据 color.name 决定颜色类，默认为蓝色
          let colorClass = 'duo-btn-blue'
          if (color.name === 'RED') {
            colorClass = 'duo-btn-red'
          } else if (color.name === 'GREEN') {
            colorClass = 'duo-btn-green'
          } else if (color.name === 'YELLOW') {
            colorClass = 'duo-btn-yellow'
          } else if (color.name === 'BLUE') {
            colorClass = 'duo-btn-blue'
          }

          return (
            <button
              key={color.name}
              className={`duo-btn ${colorClass} ${!isActive ? 'duo-btn-disabled' : ''}`}
              onClick={() => handleColorSelect(idx)}
              disabled={!isActive}
            >
              <div className='duo-btn-content'>
                <div className='duo-btn-text'>{color.name}</div>
                <div className='duo-btn-key'>({keyLabel})</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
