import React, { useState, useEffect, useRef } from 'react'
import type { GameProps, TrialResult } from '../../types/game'
// 假设这是您的工具函数
const randomDelay = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min

export const ChoiceReaction: React.FC<GameProps> = ({ onFinish, onUpdateStats }) => {
  const [content, setContent] = useState<React.ReactNode>('⏳')

  const stateRef = useRef({
    count: 0,
    hits: 0, // 正确响应的次数
    rts: [] as number[], // 仅记录正确响应的 RTs
    trials: [] as TrialResult[],
    active: false,
    target: '', // 预期的响应键 ('ArrowLeft' 或 'ArrowRight')
    startT: 0, // 刺激呈现的时刻
    trialStartTime: 0, // 试次开始（等待）的时刻
    // 用于 "Wait for Stimulus" 的定时器 ID
    waitTimer: null as ReturnType<typeof setTimeout> | null, 
    // 用于结果展示的定时器 ID (1000ms 间隔)
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
      if (state.feedbackTimer) {
        clearTimeout(state.feedbackTimer)
        state.feedbackTimer = null
      }
      
      if (state.count >= 8) {
        const avg = state.rts.length ? state.rts.reduce((a, b) => a + b, 0) / state.rts.length : 0
        const acc = (state.hits / state.count) * 100
        onFinish({ avg, accuracy: acc, trials: state.trials })
        return
      }

      // 准备阶段：等待
      setContent('Waiting...')
      state.trialStartTime = performance.now()

      // 设置随机延时后呈现刺激
      state.waitTimer = setTimeout(() => {
        const isLeft = Math.random() > 0.5
        state.target = isLeft ? 'ArrowLeft' : 'ArrowRight'
        
        // 呈现刺激
        setContent(isLeft ? '⬅️' : '➡️')
        state.startT = performance.now()
        state.active = true
      }, randomDelay(800, 1300))
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current
      
      // 检查是否在活动状态且按下的键是预期的响应键之一
      if (state.active && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
        
        // 立即禁用输入并清除刺激定时器
        state.active = false
        if (state.waitTimer) clearTimeout(state.waitTimer)
        
        const rt = performance.now() - state.startT
        const isCorrect = e.code === state.target

        // 记录试次结果 (内部状态)
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
        
        // --- 展示结果与更新统计 ---
        
        if (isCorrect) {
          state.rts.push(rt)
          state.hits++
          setContent(`✅ ${rt.toFixed(0)}ms`)
        } else {
          setContent('❌')
        }
        
        // 延迟调用 onUpdateStats 和 next (修复点)
        state.feedbackTimer = setTimeout(() => {
          // 在延迟后通知父组件更新数据
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
      if (state.feedbackTimer) clearTimeout(state.feedbackTimer)
    }
  }, [onFinish, onUpdateStats])

  return (
    <div className='game-frame' id='game-canvas' style={{ fontSize: '48px' }}>
      {content}
    </div>
  )
}