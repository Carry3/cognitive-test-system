import React, { useState, useEffect, useRef } from 'react'
import type { GameProps, TrialResult } from '../../types/game'
// 假设这是您的工具函数
const randomDelay = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

export const ChoiceReaction: React.FC<GameProps> = ({ onFinish, onUpdateStats }) => {
  const [content, setContent] = useState<React.ReactNode>('⏳')

  const stateRef = useRef({
    count: 0,
    hits: 0,
    rts: [] as number[],
    trials: [] as TrialResult[],
    active: false,
    target: '',
    startT: 0,
    trialStartTime: 0,
    waitTimer: null as ReturnType<typeof setTimeout> | null,
    feedbackTimer: null as ReturnType<typeof setTimeout> | null,
  })

  // Use refs for callbacks to avoid adding them to dependencies
  const onFinishRef = useRef(onFinish)
  const onUpdateStatsRef = useRef(onUpdateStats)

  // Update refs when callbacks change
  useEffect(() => {
    onFinishRef.current = onFinish
    onUpdateStatsRef.current = onUpdateStats
  })

  useEffect(() => {
    const next = () => {
      const state = stateRef.current

      if (state.waitTimer) {
        clearTimeout(state.waitTimer)
        state.waitTimer = null
      }
      if (state.feedbackTimer) {
        clearTimeout(state.feedbackTimer)
        state.feedbackTimer = null
      }

      if (state.count >= 8) {
        const avg = state.rts.length ? state.rts.reduce((a, b) => a + b, 0) / state.rts.length : 0
        const acc = (state.hits / state.count) * 100
        onFinishRef.current({ avg, accuracy: acc, trials: state.trials })
        return
      }

      setContent('Waiting...')
      state.trialStartTime = performance.now()

      state.waitTimer = setTimeout(() => {
        const isLeft = Math.random() > 0.5
        state.target = isLeft ? 'ArrowLeft' : 'ArrowRight'

        setContent(isLeft ? '⬅️' : '➡️')
        state.startT = performance.now()
        state.active = true
      }, randomDelay(800, 1300))
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current

      if (state.active && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
        state.active = false
        if (state.waitTimer) clearTimeout(state.waitTimer)

        const rt = performance.now() - state.startT
        const isCorrect = e.code === state.target

        state.count++
        const trial: TrialResult = {
          trialNumber: state.count,
          correct: isCorrect,
          reactionTime: rt,
          timestamp: state.trialStartTime,
          metadata: {
            expectedKey: state.target,
            actualKey: e.code,
          },
        }
        state.trials.push(trial)

        if (isCorrect) {
          state.rts.push(rt)
          state.hits++
          setContent(`✅ ${rt.toFixed(0)}ms`)
        } else {
          setContent('❌')
        }

        state.feedbackTimer = setTimeout(() => {
          onUpdateStatsRef.current(state.count, state.hits)
          next()
        }, 1000)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    next()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const state = stateRef.current
      if (state.waitTimer) clearTimeout(state.waitTimer)
      if (state.feedbackTimer) clearTimeout(state.feedbackTimer)
    }
  }, []) // Empty dependency array - effect runs only once

  return (
    <div className='game-frame' id='game-canvas' style={{ fontSize: '48px' }}>
      {content}
    </div>
  )
}