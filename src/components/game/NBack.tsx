import React, { useState, useEffect, useRef } from 'react'
import type { GameProps, TrialResult } from '../../types/game'

// The core challenge of N-Back is handling hits statistics for four result types:
// 1. Match + Press (Hit) -> hit (hits++)
// 2. Match + No Press (Miss) -> error
// 3. No Match + Press (False Alarm) -> error
// 4. No Match + No Press (Correct Rejection) -> hit (hits++)

export const NBack: React.FC<GameProps> = ({ onFinish, onUpdateStats }) => {
  const [content, setContent] = useState<React.ReactNode>('Watch...')
  const [borderColor, setBorderColor] = useState('#E5E5E5')

  const stateRef = useRef({
    count: 0,
    hits: 0,
    sequence: [] as number[],
    trials: [] as TrialResult[],
    active: false,
    isMatch: false,
    responded: false,
    trialStartTime: 0,
    timer: null as ReturnType<typeof setTimeout> | null,
    interTimer: null as ReturnType<typeof setTimeout> | null,
  })

  const onFinishRef = useRef(onFinish)
  const onUpdateStatsRef = useRef(onUpdateStats)

  useEffect(() => {
    onFinishRef.current = onFinish
    onUpdateStatsRef.current = onUpdateStats
  })

  useEffect(() => {
    // Visual flash feedback: red (error/miss) or green (correct)
    const flashBorder = (color: string) => {
      setBorderColor(color)
      setTimeout(() => setBorderColor('#E5E5E5'), 300)
    }

    const next = () => {
      const state = stateRef.current

      // Clean up previous timers
      if (state.timer) {
        clearTimeout(state.timer)
        state.timer = null
      }
      if (state.interTimer) {
        clearTimeout(state.interTimer)
        state.interTimer = null
      }

      if (state.count >= 12) {
        const correctTrials = state.trials.filter((t) => t.correct)

        // Calculate average reaction time for correct responses only
        const rtTrials = correctTrials.filter((t) => t.reactionTime !== undefined)
        const avg =
          rtTrials.length > 0
            ? rtTrials.reduce((sum, t) => sum + (t.reactionTime || 0), 0) / rtTrials.length
            : 0

        // Accuracy based on hits / total trials
        const acc = (state.hits / state.count) * 100
        onFinishRef.current({ avg, accuracy: acc, trials: state.trials })
        return
      }

      // --- Stimulus generation logic ---
      let num: number
      // N-Back is typically N>1, but this code is 1-Back
      const prev = state.sequence.length > 0 ? state.sequence[state.sequence.length - 1] : -1
      const shouldMatch = state.sequence.length > 0 && Math.random() < 0.3

      if (shouldMatch) {
        num = prev
      } else {
        do {
          num = Math.floor(Math.random() * 9) + 1
        } while (num === prev)
      }

      state.sequence.push(num)
      // state.isMatch here corresponds to "should press" for the current trial
      state.isMatch = num === prev
      state.trialStartTime = performance.now()

      // Reset UI state
      setContent(num)
      state.active = true
      state.responded = false
      setBorderColor('#E5E5E5') // Ensure border color is reset

      // 1500ms response time limit
      state.timer = setTimeout(() => {
        // --- Response timeout (Miss/Correct Rejection) logic ---
        if (state.active) {
          state.active = false

          const isCorrect = !state.isMatch // No-match no-response is correct

          if (isCorrect) {
            state.hits++ // Correct Rejection: correct no-press
            flashBorder('green')
          } else {
            // Match Miss: matched but didn't press
            flashBorder('red')
          }

          // Record timeout trial (internal state)
          state.count++
          const trial: TrialResult = {
            trialNumber: state.count,
            correct: isCorrect,
            timestamp: state.trialStartTime,
            metadata: {
              isMatch: state.isMatch,
              timeout: true,
            },
          }
          state.trials.push(trial)

          // Delayed call to onUpdateStats and next (fix point)
          state.interTimer = setTimeout(() => {
            onUpdateStatsRef.current(state.count, state.hits)
            next()
          }, 1000)
        }
      }, 1500)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current
      if (e.code === 'Space' && state.active && !state.responded) {
        state.responded = true
        state.active = false
        if (state.timer) clearTimeout(state.timer) // Clean up response time limit timer

        const rt = performance.now() - state.trialStartTime
        const isCorrect = state.isMatch // Pressing on match is correct (Hit)

        // Record trial result (internal state)
        state.count++
        const trial: TrialResult = {
          trialNumber: state.count,
          correct: isCorrect,
          reactionTime: rt,
          timestamp: state.trialStartTime,
          metadata: {
            isMatch: state.isMatch,
          },
        }
        state.trials.push(trial)

        // --- UI and hits statistics update ---

        if (isCorrect) {
          state.hits++ // Match Hit: matched and correctly pressed
          flashBorder('green')
          setContent((prev) => (
            <>
              {prev}
              <div style={{ fontSize: '30px', color: 'green' }}>✅</div>
            </>
          ))
        } else {
          // False Alarm: no match but pressed
          flashBorder('red')
          setContent((prev) => (
            <>
              {prev}
              <div style={{ fontSize: '30px', color: 'red' }}>❌</div>
            </>
          ))
        }

        // 延迟调用 onUpdateStats 和 next (修复点)
        state.interTimer = setTimeout(() => {
          onUpdateStats(state.count, state.hits)
          next()
        }, 1000)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Add 1000ms introduction delay before first game start
    const startTimer = setTimeout(next, 1000)

    // --- Cleanup function ---
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(startTimer)
      const state = stateRef.current
      if (state.timer) clearTimeout(state.timer)
      if (state.interTimer) clearTimeout(state.interTimer)
    }
  }, [])

  return (
    <div
      className='game-frame'
      id='game-canvas'
      // Increase border width to make flashBorder effect more visible
      style={{ borderColor: borderColor, transition: 'border-color 0.2s', borderWidth: '5px', borderStyle: 'solid' }}
    >
      {content}
    </div>
  )
}