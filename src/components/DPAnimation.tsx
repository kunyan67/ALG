import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { KnapsackAnimationConfig } from '../data/algorithms'

export default function DPAnimation({ config }: { config: KnapsackAnimationConfig }) {
  switch (config.type) {
    case 'knapsack-01':
      return <Knapsack01Animation config={config} />
    case 'knapsack-complete':
      return <KnapsackCompleteAnimation config={config} />
    case 'knapsack-multi':
      return <KnapsackMultiAnimation config={config} />
    case 'knapsack-group':
      return <KnapsackGroupAnimation config={config} />
    case 'knapsack-2d':
      return <Knapsack2DAnimation config={config} />
    default:
      return <div className="text-gray-500">暂不支持此类型的动画</div>
  }
}

// ==================== 通用工具 ====================

function useAnimationPlayer(totalSteps: number) {
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!playing) { clearTimer(); return }
    if (step >= totalSteps - 1) { setPlaying(false); return }
    timerRef.current = setTimeout(() => setStep((s) => s + 1), speed)
    return clearTimer
  }, [playing, step, totalSteps, speed, clearTimer])

  const reset = useCallback(() => { clearTimer(); setPlaying(false); setStep(-1) }, [clearTimer])
  const playPause = useCallback(() => {
    if (step >= totalSteps - 1) { setStep(-1); setPlaying(true) } else { setPlaying((p) => !p) }
  }, [step, totalSteps])
  const stepForward = useCallback(() => { setPlaying(false); setStep((s) => Math.min(s + 1, totalSteps - 1)) }, [totalSteps])
  const stepBack = useCallback(() => { setPlaying(false); setStep((s) => Math.max(s - 1, -1)) }, [])

  return { step, playing, speed, setSpeed, reset, playPause, stepForward, stepBack }
}

function Controls({ player, stepInfo }: { player: ReturnType<typeof useAnimationPlayer>; stepInfo: string }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button onClick={player.stepBack} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300">上一步</button>
      <button onClick={player.playPause} className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded transition-colors text-white font-medium min-w-16">{player.playing ? '暂停' : '播放'}</button>
      <button onClick={player.stepForward} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300">下一步</button>
      <button onClick={player.reset} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300">重置</button>
      <div className="flex items-center gap-2 ml-auto">
        <label className="text-xs text-gray-500">速度:</label>
        <input type="range" min={100} max={1500} step={100} value={1600 - player.speed} onChange={(e) => player.setSpeed(1600 - Number(e.target.value))} className="w-20 accent-indigo-500" />
      </div>
      <span className="text-xs text-gray-500 ml-2">{stepInfo}</span>
    </div>
  )
}

// 单元格高亮类型
type Highlight = 'none' | 'target' | 'source-skip' | 'source-pick' | 'updated' | 'final'

function cellStyle(h: Highlight): string {
  switch (h) {
    case 'target':       return 'bg-indigo-600/30 ring-2 ring-indigo-400 text-white'        // 当前正在决策的格子
    case 'source-skip':  return 'bg-amber-500/20 ring-2 ring-amber-400 text-amber-300'      // 不选来源（上一行同列）
    case 'source-pick':  return 'bg-emerald-500/20 ring-2 ring-emerald-400 text-emerald-300' // 选了来源（上一行偏移列）
    case 'updated':      return 'bg-emerald-600/40 text-emerald-200'                         // 刚更新完
    case 'final':        return 'bg-indigo-500/25 text-indigo-200'                           // 最终答案
    default:             return 'bg-gray-900/60 text-gray-400'
  }
}

// ==================== 0-1 背包：完整二维 DP 表 ====================

interface FullStep {
  row: number        // 当前物品行索引（1-based in grid, 0-based in items）
  col: number        // 当前容量列
  skipVal: number    // 不选该物品的值 = dp[i-1][w]
  pickVal: number    // 选该物品的值 = dp[i-1][w-weight]+value（-1 表示不可选）
  chosen: boolean    // 最终是否选了
  result: number     // 最终填入的值
  sourceCol: number  // 如果选了，来源列 = w - weight；如果没选，-1
  desc: string
  grid: number[][]   // 此步完成后的完整二维 dp 表快照
}

function build01FullSteps(config: KnapsackAnimationConfig): { steps: FullStep[]; initGrid: number[][] } {
  const { items, capacity: W } = config
  const n = items.length
  // dp[i][w] i=0..n, w=0..W
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
  const steps: FullStep[] = []

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1]
    for (let w = 0; w <= W; w++) {
      const skipVal = dp[i - 1][w]
      let pickVal = -1
      let sourceCol = -1
      if (w >= weight) {
        pickVal = dp[i - 1][w - weight] + value
        sourceCol = w - weight
      }
      const chosen = pickVal > skipVal
      dp[i][w] = chosen ? pickVal : skipVal

      const itemLabel = String.fromCharCode(65 + i - 1) // A, B, C...
      let desc: string
      if (pickVal < 0) {
        desc = `物品${itemLabel}(重${weight},值${value}) 容量${w}: 放不下 → 继承上行 dp[${i - 1}][${w}]=${skipVal}`
      } else if (chosen) {
        desc = `物品${itemLabel}(重${weight},值${value}) 容量${w}: 选! dp[${i - 1}][${sourceCol}]+${value}=${pickVal} > 不选${skipVal} → 填入 ${pickVal}`
      } else {
        desc = `物品${itemLabel}(重${weight},值${value}) 容量${w}: 不选 ${skipVal} >= 选 dp[${i - 1}][${sourceCol}]+${value}=${pickVal} → 填入 ${skipVal}`
      }

      steps.push({
        row: i, col: w, skipVal, pickVal, chosen, result: dp[i][w],
        sourceCol: chosen ? sourceCol : -1,
        desc,
        grid: dp.map((r) => [...r]),
      })
    }
  }
  return { steps, initGrid: [new Array(W + 1).fill(0)] }
}

function Knapsack01Animation({ config }: { config: KnapsackAnimationConfig }) {
  const { steps, initGrid } = useRef(build01FullSteps(config)).current
  const player = useAnimationPlayer(steps.length)
  const W = config.capacity
  const n = config.items.length

  // 当前 grid 快照
  const currentGrid = player.step >= 0 ? steps[player.step].grid : [...initGrid, ...Array.from({ length: n }, () => new Array(W + 1).fill(0))]
  const cur = player.step >= 0 ? steps[player.step] : null
  const isFinished = player.step === steps.length - 1

  // 行标签: 0（无物品）, 物品A, 物品B, ...
  const rowLabels = ['初始', ...config.items.map((_, i) => `物品${String.fromCharCode(65 + i)}`)]
  const colLabels = Array.from({ length: W + 1 }, (_, i) => String(i))

  // 对于当前步已经处理过的行，显示到哪一行
  const visibleRows = cur ? cur.row + 1 : 1

  return (
    <div className="space-y-4">
      {/* 物品信息卡片 */}
      <div className="flex gap-2 flex-wrap">
        {config.items.map((item, i) => (
          <div key={i} className={`px-3 py-1.5 rounded text-xs border transition-colors ${
            cur && cur.row === i + 1
              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
              : 'border-gray-700 bg-gray-800 text-gray-400'
          }`}>
            物品{String.fromCharCode(65 + i)}: 重量={item.weight}, 价值={item.value}
          </div>
        ))}
      </div>

      {/* DP 二维表 */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-16 h-9 text-xs text-gray-500 border border-gray-700 bg-gray-900 sticky left-0 z-10">物品＼容量</th>
              {colLabels.map((l, j) => (
                <th key={j} className="w-14 h-9 text-xs text-gray-400 border border-gray-700 bg-gray-900 font-mono">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.min(visibleRows, n + 1) }, (_, i) => (
              <tr key={i}>
                <td className="w-16 h-10 text-xs text-gray-400 border border-gray-700 bg-gray-900 text-center font-medium sticky left-0 z-10">
                  {rowLabels[i]}
                </td>
                {Array.from({ length: W + 1 }, (_, w) => {
                  let hl: Highlight = 'none'
                  if (cur && !isFinished) {
                    if (i === cur.row && w === cur.col) {
                      hl = cur.chosen ? 'updated' : 'target'
                      if (cur.chosen) hl = 'updated'
                      else hl = 'target'
                    } else if (i === cur.row - 1 && w === cur.col) {
                      hl = 'source-skip' // 不选来源
                    } else if (cur.chosen && i === cur.row - 1 && w === cur.sourceCol) {
                      hl = 'source-pick' // 选了来源
                    } else if (!cur.chosen && cur.pickVal >= 0 && i === cur.row - 1 && w === cur.col - config.items[cur.row - 1].weight) {
                      hl = 'source-pick' // 没选但也显示比较来源（灰化显示备选来源）
                    }
                  }
                  if (isFinished && i === n && w === W) hl = 'final'

                  const val = currentGrid[i]?.[w] ?? 0
                  // 只显示已经被填过的格子
                  const filled = i === 0 || (cur && (i < cur.row || (i === cur.row && w <= cur.col)))

                  return (
                    <td key={w} className="w-14 h-10 border border-gray-700 p-0 relative">
                      <motion.div
                        key={`${i}-${w}-${val}-${hl}`}
                        initial={hl === 'updated' ? { scale: 1.15 } : { scale: 1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`w-full h-full flex items-center justify-center font-mono text-sm font-medium transition-colors duration-200 ${
                          filled ? cellStyle(hl) : 'bg-gray-950/40 text-gray-700'
                        }`}
                      >
                        {filled ? val : '-'}
                      </motion.div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 决策说明 */}
      {cur && (
        <motion.div
          key={player.step}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs bg-gray-800 rounded px-4 py-2.5 space-y-1"
        >
          <div className="text-gray-300 font-mono">{cur.desc}</div>
          <div className="flex gap-4 text-gray-500">
            <span><span className="inline-block w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-400 mr-1 align-middle" /> 不选来源</span>
            <span><span className="inline-block w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-400 mr-1 align-middle" /> 选了来源</span>
            <span><span className="inline-block w-3 h-3 rounded-sm bg-indigo-600/40 border border-indigo-400 mr-1 align-middle" /> 当前决策</span>
          </div>
        </motion.div>
      )}

      <Controls player={player} stepInfo={`步骤 ${player.step + 1} / ${steps.length}`} />
    </div>
  )
}

// ==================== 完全背包：二维 DP 表 ====================
// 完全背包的区别：dp[i][w] = max(dp[i-1][w], dp[i][w-weight]+value)
// 来源从「同一行」取（因为正序遍历）

function buildCompleteFullSteps(config: KnapsackAnimationConfig): { steps: FullStep[]; initGrid: number[][] } {
  const { items, capacity: W } = config
  const n = items.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
  const steps: FullStep[] = []

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1]
    for (let w = 0; w <= W; w++) {
      const skipVal = dp[i - 1][w]
      let pickVal = -1
      let sourceCol = -1
      if (w >= weight) {
        // 完全背包：从同一行取（dp[i][w-weight]），因为可以重复选
        pickVal = dp[i][w - weight] + value
        sourceCol = w - weight
      }
      const chosen = pickVal > skipVal
      dp[i][w] = chosen ? pickVal : skipVal

      const itemLabel = String.fromCharCode(65 + i - 1)
      let desc: string
      if (pickVal < 0) {
        desc = `物品${itemLabel}(重${weight},值${value}) 容量${w}: 放不下 → 继承上行 ${skipVal}`
      } else if (chosen) {
        desc = `物品${itemLabel}(重${weight},值${value}) 容量${w}: 选! dp[${i}][${sourceCol}]+${value}=${pickVal} > 不选${skipVal} → 填入 ${pickVal}（注意：来源是同行!可重复选取）`
      } else {
        desc = `物品${itemLabel}(重${weight},值${value}) 容量${w}: 不选 ${skipVal} >= 选 dp[${i}][${sourceCol}]+${value}=${pickVal} → 填入 ${skipVal}`
      }

      steps.push({
        row: i, col: w, skipVal, pickVal, chosen, result: dp[i][w],
        sourceCol: chosen ? sourceCol : -1,
        desc,
        grid: dp.map((r) => [...r]),
      })
    }
  }
  return { steps, initGrid: [new Array(W + 1).fill(0)] }
}

function KnapsackCompleteAnimation({ config }: { config: KnapsackAnimationConfig }) {
  const { steps } = useRef(buildCompleteFullSteps(config)).current
  const player = useAnimationPlayer(steps.length)
  const W = config.capacity
  const n = config.items.length

  const currentGrid = player.step >= 0 ? steps[player.step].grid : Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
  const cur = player.step >= 0 ? steps[player.step] : null
  const isFinished = player.step === steps.length - 1

  const rowLabels = ['初始', ...config.items.map((_, i) => `物品${String.fromCharCode(65 + i)}`)]
  const colLabels = Array.from({ length: W + 1 }, (_, i) => String(i))
  const visibleRows = cur ? cur.row + 1 : 1

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {config.items.map((item, i) => (
          <div key={i} className={`px-3 py-1.5 rounded text-xs border transition-colors ${
            cur && cur.row === i + 1 ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-gray-700 bg-gray-800 text-gray-400'
          }`}>
            物品{String.fromCharCode(65 + i)}: 重量={item.weight}, 价值={item.value} (无限)
          </div>
        ))}
      </div>

      <div className="text-xs text-amber-400/70 bg-amber-400/5 rounded px-3 py-1.5">
        与 0-1 背包的区别：「选」的来源从同一行取 dp[i][w-weight]，而非上一行 dp[i-1][w-weight]
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-16 h-9 text-xs text-gray-500 border border-gray-700 bg-gray-900 sticky left-0 z-10">物品＼容量</th>
              {colLabels.map((l, j) => (
                <th key={j} className="w-14 h-9 text-xs text-gray-400 border border-gray-700 bg-gray-900 font-mono">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.min(visibleRows, n + 1) }, (_, i) => (
              <tr key={i}>
                <td className="w-16 h-10 text-xs text-gray-400 border border-gray-700 bg-gray-900 text-center font-medium sticky left-0 z-10">{rowLabels[i]}</td>
                {Array.from({ length: W + 1 }, (_, w) => {
                  let hl: Highlight = 'none'
                  if (cur && !isFinished) {
                    if (i === cur.row && w === cur.col) hl = cur.chosen ? 'updated' : 'target'
                    else if (i === cur.row - 1 && w === cur.col) hl = 'source-skip'
                    // 完全背包：选的来源在同一行
                    else if (cur.chosen && i === cur.row && w === cur.sourceCol) hl = 'source-pick'
                    else if (!cur.chosen && cur.pickVal >= 0 && i === cur.row && w === cur.col - config.items[cur.row - 1].weight) hl = 'source-pick'
                  }
                  if (isFinished && i === n && w === W) hl = 'final'
                  const val = currentGrid[i]?.[w] ?? 0
                  const filled = i === 0 || (cur && (i < cur.row || (i === cur.row && w <= cur.col)))
                  return (
                    <td key={w} className="w-14 h-10 border border-gray-700 p-0">
                      <motion.div
                        key={`${i}-${w}-${val}-${hl}`}
                        initial={hl === 'updated' ? { scale: 1.15 } : { scale: 1 }}
                        animate={{ scale: 1 }}
                        className={`w-full h-full flex items-center justify-center font-mono text-sm font-medium transition-colors duration-200 ${filled ? cellStyle(hl) : 'bg-gray-950/40 text-gray-700'}`}
                      >{filled ? val : '-'}</motion.div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cur && (
        <motion.div key={player.step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs bg-gray-800 rounded px-4 py-2.5 space-y-1">
          <div className="text-gray-300 font-mono">{cur.desc}</div>
          <div className="flex gap-4 text-gray-500">
            <span><span className="inline-block w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-400 mr-1 align-middle" /> 不选来源(上行)</span>
            <span><span className="inline-block w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-400 mr-1 align-middle" /> 选的来源(同行)</span>
          </div>
        </motion.div>
      )}

      <Controls player={player} stepInfo={`步骤 ${player.step + 1} / ${steps.length}`} />
    </div>
  )
}

// ==================== 多重背包：二进制拆分后展示为二维表 ====================

interface MultiBatch {
  itemIdx: number   // 原始物品索引
  batch: number     // 该组的数量
  bw: number        // 该组总重量
  bv: number        // 该组总价值
  label: string     // 显示标签
}

function buildMultiFullSteps(config: KnapsackAnimationConfig): { steps: FullStep[]; batches: MultiBatch[] } {
  const { items, capacity: W } = config
  // 先做二进制拆分
  const batches: MultiBatch[] = []
  for (let i = 0; i < items.length; i++) {
    const { weight, value, count = 1 } = items[i]
    let remaining = count
    for (let k = 1; remaining > 0; k *= 2) {
      const batch = Math.min(k, remaining)
      remaining -= batch
      batches.push({
        itemIdx: i,
        batch,
        bw: batch * weight,
        bv: batch * value,
        label: `${String.fromCharCode(65 + i)}x${batch}`,
      })
    }
  }

  const rowCount = batches.length + 1
  const dp: number[][] = Array.from({ length: rowCount }, () => new Array(W + 1).fill(0))
  const steps: FullStep[] = []

  for (let r = 1; r < rowCount; r++) {
    const b = batches[r - 1]
    for (let w = 0; w <= W; w++) {
      const skipVal = dp[r - 1][w]
      let pickVal = -1
      let sourceCol = -1
      if (w >= b.bw) {
        pickVal = dp[r - 1][w - b.bw] + b.bv
        sourceCol = w - b.bw
      }
      const chosen = pickVal > skipVal
      dp[r][w] = chosen ? pickVal : skipVal

      let desc: string
      if (pickVal < 0) {
        desc = `${b.label}(重${b.bw},值${b.bv}) 容量${w}: 放不下 → 继承 ${skipVal}`
      } else if (chosen) {
        desc = `${b.label}(重${b.bw},值${b.bv}) 容量${w}: 选! dp[${r - 1}][${sourceCol}]+${b.bv}=${pickVal} > ${skipVal} → 填入 ${pickVal}`
      } else {
        desc = `${b.label}(重${b.bw},值${b.bv}) 容量${w}: 不选 ${skipVal} >= ${pickVal} → 填入 ${skipVal}`
      }

      steps.push({
        row: r, col: w, skipVal, pickVal, chosen, result: dp[r][w],
        sourceCol: chosen ? sourceCol : -1,
        desc,
        grid: dp.map((row) => [...row]),
      })
    }
  }
  return { steps, batches }
}

function KnapsackMultiAnimation({ config }: { config: KnapsackAnimationConfig }) {
  const { steps, batches } = useRef(buildMultiFullSteps(config)).current
  const player = useAnimationPlayer(steps.length)
  const W = config.capacity
  const totalRows = batches.length + 1

  const currentGrid = player.step >= 0 ? steps[player.step].grid : Array.from({ length: totalRows }, () => new Array(W + 1).fill(0))
  const cur = player.step >= 0 ? steps[player.step] : null
  const isFinished = player.step === steps.length - 1

  const rowLabels = ['初始', ...batches.map((b) => b.label)]
  const colLabels = Array.from({ length: W + 1 }, (_, i) => String(i))
  const visibleRows = cur ? cur.row + 1 : 1

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {config.items.map((item, i) => (
          <div key={i} className={`px-3 py-1.5 rounded text-xs border transition-colors ${
            cur && batches[cur.row - 1]?.itemIdx === i ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-gray-700 bg-gray-800 text-gray-400'
          }`}>
            物品{String.fromCharCode(65 + i)}: 重量={item.weight}, 价值={item.value}, 数量={item.count}
          </div>
        ))}
      </div>

      <div className="text-xs text-amber-400/70 bg-amber-400/5 rounded px-3 py-1.5">
        二进制拆分后的虚拟物品：{batches.map((b) => `${b.label}(重${b.bw},值${b.bv})`).join(' | ')}，然后按 0-1 背包处理
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-16 h-9 text-xs text-gray-500 border border-gray-700 bg-gray-900 sticky left-0 z-10">虚拟物品＼容量</th>
              {colLabels.map((l, j) => (
                <th key={j} className="w-14 h-9 text-xs text-gray-400 border border-gray-700 bg-gray-900 font-mono">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.min(visibleRows, totalRows) }, (_, i) => (
              <tr key={i}>
                <td className="w-16 h-10 text-xs text-gray-400 border border-gray-700 bg-gray-900 text-center font-medium sticky left-0 z-10">{rowLabels[i]}</td>
                {Array.from({ length: W + 1 }, (_, w) => {
                  let hl: Highlight = 'none'
                  if (cur && !isFinished) {
                    if (i === cur.row && w === cur.col) hl = cur.chosen ? 'updated' : 'target'
                    else if (i === cur.row - 1 && w === cur.col) hl = 'source-skip'
                    else if (cur.chosen && i === cur.row - 1 && w === cur.sourceCol) hl = 'source-pick'
                    else if (!cur.chosen && cur.pickVal >= 0 && i === cur.row - 1 && w === cur.col - batches[cur.row - 1].bw) hl = 'source-pick'
                  }
                  if (isFinished && i === totalRows - 1 && w === W) hl = 'final'
                  const val = currentGrid[i]?.[w] ?? 0
                  const filled = i === 0 || (cur && (i < cur.row || (i === cur.row && w <= cur.col)))
                  return (
                    <td key={w} className="w-14 h-10 border border-gray-700 p-0">
                      <motion.div
                        key={`${i}-${w}-${val}-${hl}`}
                        initial={hl === 'updated' ? { scale: 1.15 } : { scale: 1 }}
                        animate={{ scale: 1 }}
                        className={`w-full h-full flex items-center justify-center font-mono text-sm font-medium transition-colors duration-200 ${filled ? cellStyle(hl) : 'bg-gray-950/40 text-gray-700'}`}
                      >{filled ? val : '-'}</motion.div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cur && (
        <motion.div key={player.step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs bg-gray-800 rounded px-4 py-2.5 text-gray-300 font-mono">
          {cur.desc}
        </motion.div>
      )}
      <Controls player={player} stepInfo={`步骤 ${player.step + 1} / ${steps.length}`} />
    </div>
  )
}

// ==================== 分组背包：行=每一组，二维 DP 表 ====================

function buildGroupFullSteps(config: KnapsackAnimationConfig) {
  const { items, capacity: W } = config
  // 分组
  const groupMap = new Map<number, { weight: number; value: number; label: string }[]>()
  for (const item of items) {
    const g = item.group ?? 0
    if (!groupMap.has(g)) groupMap.set(g, [])
    groupMap.get(g)!.push({ weight: item.weight, value: item.value, label: `w=${item.weight},v=${item.value}` })
  }
  const groups = Array.from(groupMap.entries()).sort((a, b) => a[0] - b[0])
  const G = groups.length

  const dp: number[][] = Array.from({ length: G + 1 }, () => new Array(W + 1).fill(0))
  const steps: FullStep[] = []

  for (let g = 1; g <= G; g++) {
    const [gIdx, gItems] = groups[g - 1]
    for (let w = 0; w <= W; w++) {
      // 初始化为不选任何物品 = 继承上行
      dp[g][w] = dp[g - 1][w]
      let bestPickVal = -1
      let bestSourceCol = -1
      let bestItemLabel = ''

      for (const item of gItems) {
        if (w >= item.weight) {
          const pv = dp[g - 1][w - item.weight] + item.value
          if (pv > dp[g][w]) {
            dp[g][w] = pv
            bestPickVal = pv
            bestSourceCol = w - item.weight
            bestItemLabel = item.label
          }
        }
      }

      const skipVal = dp[g - 1][w]
      const chosen = dp[g][w] > skipVal

      let desc: string
      if (chosen) {
        desc = `组${gIdx}(${bestItemLabel}) 容量${w}: 选! dp[${g - 1}][${bestSourceCol}]+v=${bestPickVal} > 不选${skipVal} → 填入 ${dp[g][w]}`
      } else {
        desc = `组${gIdx} 容量${w}: 组内无更优选择 → 继承上行 ${skipVal}`
      }

      steps.push({
        row: g, col: w, skipVal, pickVal: bestPickVal, chosen, result: dp[g][w],
        sourceCol: bestSourceCol,
        desc,
        grid: dp.map((r) => [...r]),
      })
    }
  }
  return { steps, groups, G }
}

function KnapsackGroupAnimation({ config }: { config: KnapsackAnimationConfig }) {
  const { steps, groups, G } = useRef(buildGroupFullSteps(config)).current
  const player = useAnimationPlayer(steps.length)
  const W = config.capacity
  const totalRows = G + 1

  const currentGrid = player.step >= 0 ? steps[player.step].grid : Array.from({ length: totalRows }, () => new Array(W + 1).fill(0))
  const cur = player.step >= 0 ? steps[player.step] : null
  const isFinished = player.step === steps.length - 1

  const rowLabels = ['初始', ...groups.map(([gIdx]) => `组${gIdx}`)]
  const colLabels = Array.from({ length: W + 1 }, (_, i) => String(i))
  const visibleRows = cur ? cur.row + 1 : 1

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        {groups.map(([gIdx, gItems]) => (
          <div key={gIdx} className={`flex gap-1 items-center px-2 py-1 rounded border transition-colors ${
            cur && cur.row === groups.findIndex(([g]) => g === gIdx) + 1 ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700'
          }`}>
            <span className="text-xs text-gray-500 mr-1">组{gIdx}:</span>
            {gItems.map((item, j) => (
              <span key={j} className="text-xs text-gray-400">
                [{item.label}]{j < gItems.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="text-xs text-amber-400/70 bg-amber-400/5 rounded px-3 py-1.5">
        每组最多选一个物品：对每个容量，比较组内所有物品的选取结果和不选（继承上行）
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-16 h-9 text-xs text-gray-500 border border-gray-700 bg-gray-900 sticky left-0 z-10">组＼容量</th>
              {colLabels.map((l, j) => (
                <th key={j} className="w-14 h-9 text-xs text-gray-400 border border-gray-700 bg-gray-900 font-mono">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.min(visibleRows, totalRows) }, (_, i) => (
              <tr key={i}>
                <td className="w-16 h-10 text-xs text-gray-400 border border-gray-700 bg-gray-900 text-center font-medium sticky left-0 z-10">{rowLabels[i]}</td>
                {Array.from({ length: W + 1 }, (_, w) => {
                  let hl: Highlight = 'none'
                  if (cur && !isFinished) {
                    if (i === cur.row && w === cur.col) hl = cur.chosen ? 'updated' : 'target'
                    else if (i === cur.row - 1 && w === cur.col) hl = 'source-skip'
                    else if (cur.chosen && i === cur.row - 1 && w === cur.sourceCol) hl = 'source-pick'
                  }
                  if (isFinished && i === totalRows - 1 && w === W) hl = 'final'
                  const val = currentGrid[i]?.[w] ?? 0
                  const filled = i === 0 || (cur && (i < cur.row || (i === cur.row && w <= cur.col)))
                  return (
                    <td key={w} className="w-14 h-10 border border-gray-700 p-0">
                      <motion.div
                        key={`${i}-${w}-${val}-${hl}`}
                        initial={hl === 'updated' ? { scale: 1.15 } : { scale: 1 }}
                        animate={{ scale: 1 }}
                        className={`w-full h-full flex items-center justify-center font-mono text-sm font-medium transition-colors duration-200 ${filled ? cellStyle(hl) : 'bg-gray-950/40 text-gray-700'}`}
                      >{filled ? val : '-'}</motion.div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cur && (
        <motion.div key={player.step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs bg-gray-800 rounded px-4 py-2.5 text-gray-300 font-mono">
          {cur.desc}
        </motion.div>
      )}
      <Controls player={player} stepInfo={`步骤 ${player.step + 1} / ${steps.length}`} />
    </div>
  )
}

// ==================== 二维费用背包 ====================

interface Step2DFull {
  itemIdx: number
  w: number
  v: number
  skipVal: number
  pickVal: number
  chosen: boolean
  result: number
  srcW: number
  srcV: number
  desc: string
  // 对于每个物品，存储一个 (W+1)x(V+1) 的表快照
  slice: number[][]  // 当前物品层的 dp 快照
  prevSlice: number[][] // 上一层的 dp 快照
}

function build2DFullSteps(config: KnapsackAnimationConfig) {
  const { items, capacity: W, capacity2: V = 0 } = config
  const n = items.length

  // 用两层滚动
  let prev = Array.from({ length: W + 1 }, () => new Array(V + 1).fill(0))
  const steps: Step2DFull[] = []

  for (let idx = 0; idx < n; idx++) {
    const { weight, value, volume = 0 } = items[idx]
    const curr = prev.map((r) => [...r]) // 复制上一层作为初始
    const itemLabel = String.fromCharCode(65 + idx)

    for (let w = W; w >= 0; w--) {
      for (let v = V; v >= 0; v--) {
        const skipVal = prev[w][v]
        let pickVal = -1
        let srcW = -1
        let srcV = -1
        if (w >= weight && v >= volume) {
          pickVal = prev[w - weight][v - volume] + value
          srcW = w - weight
          srcV = v - volume
        }
        const chosen = pickVal > skipVal
        curr[w][v] = chosen ? pickVal : skipVal

        let desc: string
        if (pickVal < 0) {
          desc = `物品${itemLabel}(重${weight},体${volume},值${value}) [w=${w},v=${v}]: 放不下 → 继承 ${skipVal}`
        } else if (chosen) {
          desc = `物品${itemLabel} [w=${w},v=${v}]: 选! prev[${srcW}][${srcV}]+${value}=${pickVal} > ${skipVal} → ${pickVal}`
        } else {
          desc = `物品${itemLabel} [w=${w},v=${v}]: 不选 ${skipVal} >= ${pickVal} → ${skipVal}`
        }

        steps.push({
          itemIdx: idx, w, v, skipVal, pickVal, chosen, result: curr[w][v],
          srcW, srcV, desc,
          slice: curr.map((r) => [...r]),
          prevSlice: prev.map((r) => [...r]),
        })
      }
    }
    prev = curr.map((r) => [...r])
  }
  return steps
}

function Knapsack2DAnimation({ config }: { config: KnapsackAnimationConfig }) {
  const steps = useRef(build2DFullSteps(config)).current
  const player = useAnimationPlayer(steps.length)
  const W = config.capacity
  const V = config.capacity2 ?? 0

  const cur = player.step >= 0 ? steps[player.step] : null
  const isFinished = player.step === steps.length - 1

  // 显示当前物品层的表
  const currentSlice = cur ? cur.slice : Array.from({ length: W + 1 }, () => new Array(V + 1).fill(0))

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {config.items.map((item, i) => (
          <div key={i} className={`px-3 py-1.5 rounded text-xs border transition-colors ${
            cur && cur.itemIdx === i ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-gray-700 bg-gray-800 text-gray-400'
          }`}>
            物品{String.fromCharCode(65 + i)}: 重量={item.weight}, 体积={item.volume}, 价值={item.value}
          </div>
        ))}
      </div>

      <div className="text-xs text-amber-400/70 bg-amber-400/5 rounded px-3 py-1.5">
        当前显示：{cur ? `物品${String.fromCharCode(65 + cur.itemIdx)}层` : '初始层'} 的 dp[w][v] 表（行=重量 0~{W}，列=体积 0~{V}）
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-14 h-9 text-xs text-gray-500 border border-gray-700 bg-gray-900 sticky left-0 z-10">重＼体</th>
              {Array.from({ length: V + 1 }, (_, v) => (
                <th key={v} className="w-12 h-9 text-xs text-gray-400 border border-gray-700 bg-gray-900 font-mono">v={v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: W + 1 }, (_, w) => (
              <tr key={w}>
                <td className="w-14 h-9 text-xs text-gray-400 border border-gray-700 bg-gray-900 text-center font-medium sticky left-0 z-10">w={w}</td>
                {Array.from({ length: V + 1 }, (_, v) => {
                  let hl: Highlight = 'none'
                  if (cur && !isFinished) {
                    if (w === cur.w && v === cur.v) hl = cur.chosen ? 'updated' : 'target'
                    else if (cur.chosen && w === cur.srcW && v === cur.srcV) hl = 'source-pick'
                  }
                  if (isFinished && w === W && v === V) hl = 'final'
                  return (
                    <td key={v} className="w-12 h-9 border border-gray-700 p-0">
                      <motion.div
                        key={`${w}-${v}-${currentSlice[w][v]}-${hl}`}
                        initial={hl === 'updated' ? { scale: 1.15 } : { scale: 1 }}
                        animate={{ scale: 1 }}
                        className={`w-full h-full flex items-center justify-center font-mono text-xs font-medium transition-colors duration-200 ${cellStyle(hl)}`}
                      >{currentSlice[w][v]}</motion.div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cur && (
        <motion.div key={player.step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs bg-gray-800 rounded px-4 py-2.5 text-gray-300 font-mono">
          {cur.desc}
        </motion.div>
      )}
      <Controls player={player} stepInfo={`步骤 ${player.step + 1} / ${steps.length}`} />
    </div>
  )
}
