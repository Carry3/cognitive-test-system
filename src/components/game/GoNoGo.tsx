import React, { useState, useEffect, useRef } from 'react'
import type { GameProps, TrialResult } from '../../types/game'

// The key to the GoNoGo task is:
// - Go (green circle): must press Space within 1500ms
// - No-Go (red square): must inhibit, cannot press Space
export const GoNoGo: React.FC<GameProps> = ({ onFinish, onUpdateStats }) => {
  const [content, setContent] = useState<React.ReactNode>('Waiting...')

  const stateRef = useRef({
    count: 0,
    hits: 0,
    rts: [] as number[],
    trials: [] as TrialResult[],
    active: false,
    isGoTrial: false,
    responded: false,
    startT: 0,
    trialStartTime: 0,
    waitTimer: null as ReturnType<typeof setTimeout> | null,
    responseTimer: null as ReturnType<typeof setTimeout> | null,
    feedbackTimer: null as ReturnType<typeof setTimeout> | null,
  })

  const onFinishRef = useRef(onFinish)
  const onUpdateStatsRef = useRef(onUpdateStats)

  useEffect(() => {
    onFinishRef.current = onFinish
    onUpdateStatsRef.current = onUpdateStats
  })

  useEffect(() => {
    const next = () => {
      const state = stateRef.current

      // Clean up previous timers
      if (state.waitTimer) {
        clearTimeout(state.waitTimer)
        state.waitTimer = null
      }
      if (state.responseTimer) {
        clearTimeout(state.responseTimer)
        state.responseTimer = null
      }
      if (state.feedbackTimer) {
        clearTimeout(state.feedbackTimer)
        state.feedbackTimer = null
      }

      if (state.count >= 10) {
        const avg = state.rts.length ? state.rts.reduce((a, b) => a + b, 0) / state.rts.length : 0
        const acc = (state.hits / state.count) * 100
        onFinishRef.current({ avg, accuracy: acc, trials: state.trials })
        return
      }

      // Preparation phase
      setContent('Waiting...') // Fixation cross
      state.trialStartTime = performance.now()

      // Present stimulus after 800ms wait
      state.waitTimer = setTimeout(() => {
        // 70% Go trials (press), 30% No-Go trials (don't press)
        const isGo = Math.random() > 0.3
        state.isGoTrial = isGo

        // Stimulus presentation
        if (isGo) {
          setContent(
            <div
              style={{
                width: '150px',
                height: '150px',
                background: '#58CC02',
                borderRadius: '50%',
              }}
            ></div>,
          )
        } else {
          setContent(<div style={{ width: '150px', height: '150px', background: '#FF4B4B' }}></div>)
        }

        state.startT = performance.now()
        state.active = true
        state.responded = false

        // 1500ms response time limit timer
        state.responseTimer = setTimeout(() => {
          // --- Response timeout (Miss/Correct Rejection) logic ---
          if (state.active) {
            state.active = false

            // Go trial timeout = Miss (incorrect)
            // No-Go trial timeout = Correct Rejection (correct)
            const isCorrect = !state.isGoTrial

            // UI feedback
            if (state.isGoTrial) {
              setContent('MISS ❌')
            } else {
              state.hits++ // No-Go trial correct inhibition
              setContent('Good ✅')
            }

            // Record timeout trial (internal state)
            state.count++
            const trial: TrialResult = {
              trialNumber: state.count,
              correct: isCorrect,
              timestamp: state.trialStartTime,
              metadata: {
                isGoTrial: state.isGoTrial,
                timeout: true,
              },
            }
            state.trials.push(trial)

            // Delayed call to onUpdateStats and next (fix point)
            state.feedbackTimer = setTimeout(() => {
              onUpdateStatsRef.current(state.count, state.hits)
              next()
            }, 1000)
          }
        }, 1500) // Response time window
      }, 800) // Wait time
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current
      if (e.code === 'Space' && state.active && !state.responded) {
        state.responded = true
        state.active = false
        if (state.responseTimer) clearTimeout(state.responseTimer) // Clean up timeout timer

        const rt = performance.now() - state.startT
        // Go trial press is correct (Hit)
        // No-Go trial press is incorrect (False Alarm)
        const isCorrect = state.isGoTrial

        // Record trial result (internal state)
        state.count++
        const trial: TrialResult = {
          trialNumber: state.count,
          correct: isCorrect,
          reactionTime: rt,
          timestamp: state.trialStartTime,
          metadata: {
            isGoTrial: state.isGoTrial,
          },
        }
        state.trials.push(trial)

        // --- UI and hits statistics update ---

        if (state.isGoTrial) {
          if (isCorrect) {
            state.rts.push(rt)
            state.hits++ // Go trial correct press
            setContent(`✅ ${rt.toFixed(0)}ms`)
          } else {
            // Should not happen if logic is sound, but kept for robustness
            setContent(`MISS ❌ (RT: ${rt.toFixed(0)}ms)`)
          }
        } else {
          // No-Go trial pressed = False Alarm
          setContent("Don't Press! ❌")
        }

        // 延迟调用 onUpdateStats 和 next (修复点)
        state.feedbackTimer = setTimeout(() => {
          onUpdateStats(state.count, state.hits)
          next()
        }, 1000)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    next() // Start game

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const state = stateRef.current
      if (state.waitTimer) clearTimeout(state.waitTimer)
      if (state.responseTimer) clearTimeout(state.responseTimer)
      if (state.feedbackTimer) clearTimeout(state.feedbackTimer)
    }
  }, [])

  return (
    <div className='game-frame' id='game-canvas' style={{ fontSize: '36px' }}>
      {content}
    </div>
  )
}
