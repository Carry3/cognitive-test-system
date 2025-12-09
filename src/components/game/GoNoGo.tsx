import React, { useState, useEffect, useRef } from 'react'
import type { GameProps, TrialResult } from '../../types/game'

// GoNoGo 任务的关键在于：
// - Go (绿色圆圈): 必须在 1500ms 内按下 Space
// - No-Go (红色方块): 必须抑制，不能按下 Space
export const GoNoGo: React.FC<GameProps> = ({ onFinish, onUpdateStats }) => {
  const [content, setContent] = useState<React.ReactNode>('+')

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
    // 用于 "等待刺激呈现" 的定时器 ID (原代码中的 timer)
    waitTimer: null as ReturnType<typeof setTimeout> | null,
    // 用于 "1500ms 响应限制" 的定时器 ID (原代码中的 failTimer)
    responseTimer: null as ReturnType<typeof setTimeout> | null,
    // 用于 "结果展示 1000ms 间隔" 的定时器 ID
    feedbackTimer: null as ReturnType<typeof setTimeout> | null,
  })

  useEffect(() => {
    const next = () => {
      const state = stateRef.current

      // 清理之前的定时器
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
        onFinish({ avg, accuracy: acc, trials: state.trials })
        return
      }

      // 准备阶段
      setContent('+') // Fixation cross
      state.trialStartTime = performance.now()

      // 等待 800ms 后呈现刺激
      state.waitTimer = setTimeout(() => {
        // 70% Go 试次 (按下), 30% No-Go 试次 (不按)
        const isGo = Math.random() > 0.3
        state.isGoTrial = isGo

        // 刺激呈现
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

        // 1500ms 响应限制定时器
        state.responseTimer = setTimeout(() => {
          // --- 响应超时 (Miss/Correct Rejection) 逻辑 ---
          if (state.active) {
            state.active = false

            // Go 试次超时 = Miss (错误)
            // No-Go 试次超时 = Correct Rejection (正确)
            const isCorrect = !state.isGoTrial

            // UI 反馈
            if (state.isGoTrial) {
              setContent('MISS ❌')
            } else {
              state.hits++ // No-Go 试次正确抑制
              setContent('Good ✅')
            }

            // 记录超时的试次 (内部状态)
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

            // 延迟调用 onUpdateStats 和 next (修复点)
            state.feedbackTimer = setTimeout(() => {
              onUpdateStats(state.count, state.hits)
              next()
            }, 1000)
          }
        }, 1500) // 响应时间窗口
      }, 800) // 等待时间
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current
      if (e.code === 'Space' && state.active && !state.responded) {
        state.responded = true
        state.active = false
        if (state.responseTimer) clearTimeout(state.responseTimer) // 清理超时定时器

        const rt = performance.now() - state.startT
        // Go 试次按下是正确的 (Hit)
        // No-Go 试次按下是错误的 (False Alarm)
        const isCorrect = state.isGoTrial

        // 记录试次结果 (内部状态)
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

        // --- UI 和 hits 统计更新 ---

        if (state.isGoTrial) {
          if (isCorrect) {
            state.rts.push(rt)
            state.hits++ // Go 试次正确按下
            setContent(`✅ ${rt.toFixed(0)}ms`)
          } else {
            // Should not happen if logic is sound, but kept for robustness
            setContent(`MISS ❌ (RT: ${rt.toFixed(0)}ms)`)
          }
        } else {
          // No-Go 试次按下了 = False Alarm
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
    next() // 游戏开始

    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const state = stateRef.current
      if (state.waitTimer) clearTimeout(state.waitTimer)
      if (state.responseTimer) clearTimeout(state.responseTimer)
      if (state.feedbackTimer) clearTimeout(state.feedbackTimer)
    }
  }, [onFinish, onUpdateStats])

  return (
    <div className='game-frame' id='game-canvas' style={{ fontSize: '36px' }}>
      {content}
    </div>
  )
}
