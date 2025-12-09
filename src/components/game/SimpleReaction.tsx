import React, { useState, useEffect, useRef } from 'react'
import type { GameProps, TrialResult } from '../../types/game'

const randomDelay = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export const SimpleReaction: React.FC<GameProps> = ({ onFinish, onUpdateStats }) => {
  const [bgColor, setBgColor] = useState('#58CC02') // Start Green
  const [text, setText] = useState<React.ReactNode>('Wait for Red...')

  const stateRef = useRef({
    count: 0,
    rts: [] as number[],
    trials: [] as TrialResult[],
    active: false,
    waiting: false,
    startT: 0,
    trialStartTime: 0,
    waitTimer: null as ReturnType<typeof setTimeout> | null,
    feedbackTimer: null as ReturnType<typeof setTimeout> | null,
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

      if (state.count >= 5) {
        const avg =
          state.rts.length > 0 ? state.rts.reduce((a, b) => a + b, 0) / state.rts.length : 0
        const correctTrials = state.trials.filter((t) => t.correct).length
        const accuracy = state.trials.length > 0 ? (correctTrials / state.trials.length) * 100 : 0
        onFinish({ avg, accuracy, trials: state.trials })
        return
      }

      // 切换到等待状态 (Green)
      setBgColor('#58CC02')
      setText(<div style={{ fontSize: '24px', color: 'white' }}>Wait for Red...</div>)
      state.waiting = true
      state.active = false
      state.trialStartTime = performance.now()

      // 设置随机延时后变红 (Stimulus)
      state.waitTimer = setTimeout(() => {
        setBgColor('#FF4B4B') // 变为红色刺激
        setText('PRESS!')
        state.startT = performance.now()
        state.waiting = false
        state.active = true
      }, randomDelay(1500, 3500))
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current
      if (e.code === 'Space') {
        // --- 1. 太早点击 (Too Early) 逻辑 ---
        if (state.waiting) {
          if (state.waitTimer) clearTimeout(state.waitTimer)
          state.waiting = false

          // 记录内部状态
          state.count++
          const trial: TrialResult = {
            trialNumber: state.count,
            correct: false,
            timestamp: state.trialStartTime,
            metadata: { tooEarly: true },
          }
          state.trials.push(trial)

          // 优化的 UX: 错误反馈使用红色背景
          setBgColor('#FF4B4B')
          setText('Too Early!')

          // 延迟调用 onUpdateStats 和 next
          state.feedbackTimer = setTimeout(() => {
            onUpdateStats(state.count, state.trials.filter((t) => t.correct).length)
            next()
          }, 1000)

          // --- 2. 正确响应 (Success) 逻辑 ---
        } else if (state.active) {
          const rt = performance.now() - state.startT
          state.active = false

          // 记录内部状态
          state.rts.push(rt)
          state.count++
          const trial: TrialResult = {
            trialNumber: state.count,
            correct: true,
            reactionTime: rt,
            timestamp: state.trialStartTime,
          }
          state.trials.push(trial)

          // 优化的 UX: 成功结果使用中立的蓝色背景
          setBgColor('#0096C7')
          setText(rt.toFixed(0) + 'ms')

          // 延迟调用 onUpdateStats 和 next
          state.feedbackTimer = setTimeout(() => {
            onUpdateStats(state.count, state.trials.filter((t) => t.correct).length)
            next()
          }, 1000)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    next()

    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const state = stateRef.current
      if (state.waitTimer) clearTimeout(state.waitTimer)
      if (state.feedbackTimer) clearTimeout(state.feedbackTimer)
    }
  }, [onFinish, onUpdateStats])

  return (
    <div className='game-frame' id='game-canvas' style={{ background: bgColor, color: 'white' }}>
      {text}
    </div>
  )
}
