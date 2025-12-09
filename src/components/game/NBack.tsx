import React, { useState, useEffect, useRef } from 'react'
import type { GameProps, TrialResult } from '../../types/game'

// N-Back 的核心难点在于处理四种结果的 hits 统计：
// 1. 匹配 (Match) + 按下 (Hit) -> 命中 (hits++)
// 2. 匹配 (Match) + 未按下 (Miss) -> 错误
// 3. 非匹配 (No Match) + 按下 (False Alarm) -> 错误
// 4. 非匹配 (No Match) + 未按下 (Correct Rejection) -> 命中 (hits++)

export const NBack: React.FC<GameProps> = ({ onFinish, onUpdateStats }) => {
  const [content, setContent] = useState<React.ReactNode>('Watch...')
  const [borderColor, setBorderColor] = useState('#E5E5E5')

  const stateRef = useRef({
    count: 0,
    hits: 0, // 正确的响应次数 (包含正确按下和正确不按)
    sequence: [] as number[],
    trials: [] as TrialResult[],
    active: false,
    isMatch: false,
    responded: false,
    trialStartTime: 0,
    // 用于刺激呈现时间的定时器 ID (1500ms 响应限制)
    timer: null as ReturnType<typeof setTimeout> | null, 
    // 用于结果展示的定时器 ID (1000ms 间隔)
    interTimer: null as ReturnType<typeof setTimeout> | null,
  })

  useEffect(() => {
    // 视觉闪烁反馈：红色（错误/未命中）或绿色（正确）
    const flashBorder = (color: string) => {
      setBorderColor(color)
      setTimeout(() => setBorderColor('#E5E5E5'), 300)
    }

    const next = () => {
      const state = stateRef.current
      
      // 清理之前的定时器
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
        
        // 只计算正确响应的平均反应时间
        const rtTrials = correctTrials.filter((t) => t.reactionTime !== undefined)
        const avg =
          rtTrials.length > 0
            ? rtTrials.reduce((sum, t) => sum + (t.reactionTime || 0), 0) / rtTrials.length
            : 0
            
        // 准确率基于 hits / 总试次数
        const acc = (state.hits / state.count) * 100
        onFinish({ avg, accuracy: acc, trials: state.trials })
        return
      }

      // --- 刺激生成逻辑 ---
      let num: number
      // N-Back 通常是 N>1，但您的代码是 1-Back
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
      // 这里的 state.isMatch 对应的是当前试次的 "是否应该按下"
      state.isMatch = num === prev 
      state.trialStartTime = performance.now()

      // 重置 UI 状态
      setContent(num)
      state.active = true
      state.responded = false
      setBorderColor('#E5E5E5') // 确保边框颜色已重置

      // 1500ms 响应时间限制
      state.timer = setTimeout(() => {
        // --- 响应超时 (Miss/Correct Rejection) 逻辑 ---
        if (state.active) {
          state.active = false
          
          const isCorrect = !state.isMatch // 非匹配未响应是正确的

          if (isCorrect) {
            state.hits++ // Correct Rejection: 正确未按下
            flashBorder('green') 
          } else {
            // Match Miss: 匹配但未按下
            flashBorder('red') 
          }

          // 记录超时的试次 (内部状态)
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
          
          // 延迟调用 onUpdateStats 和 next (修复点)
          state.interTimer = setTimeout(() => {
            onUpdateStats(state.count, state.hits)
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
        if (state.timer) clearTimeout(state.timer) // 清理响应时间限制定时器

        const rt = performance.now() - state.trialStartTime
        const isCorrect = state.isMatch // 匹配时按下是正确的 (Hit)

        // 记录试次结果 (内部状态)
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
        
        // --- UI 和 hits 统计更新 ---
        
        if (isCorrect) {
          state.hits++ // Match Hit: 匹配且正确按下
          flashBorder('green') 
          setContent((prev) => (
            <>
              {prev}
              <div style={{ fontSize: '30px', color: 'green' }}>✅</div>
            </>
          ))
        } else {
          // False Alarm: 非匹配但按下
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
    // 首次开始游戏前增加 1000ms 介绍延时
    const startTimer = setTimeout(next, 1000)

    // --- 清理函数 ---
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(startTimer)
      const state = stateRef.current
      if (state.timer) clearTimeout(state.timer)
      if (state.interTimer) clearTimeout(state.interTimer)
    }
  }, [onFinish, onUpdateStats])

  return (
    <div
      className='game-frame'
      id='game-canvas'
      // 增加边框宽度以便 flashBorder 效果更明显
      style={{ borderColor: borderColor, transition: 'border-color 0.2s', borderWidth: '5px', borderStyle: 'solid' }}
    >
      {content}
    </div>
  )
}