import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { DPClassicAnimationConfig } from '../data/algorithms'

interface DPStep {
  desc: string
  dp: number[] | number[][]
  highlight?: { r: number; c?: number }
  phase?: string
  extra?: string
  // 多格高亮：index → 颜色类型
  cellHighlights?: Map<number, 'target' | 'source' | 'best' | 'reject'>
  // 转移路径标注
  transfer?: { from: number; to: number; label: string }
  // 原始数组（LIS 用）
  originalArr?: number[]
  // 字符串匹配专用
  matchView?: {
    text: string
    pattern: string
    offset: number
    textIdx: number
    patIdx: number
    matchedCount: number
    status: 'comparing' | 'match' | 'mismatch' | 'shift' | 'found'
    nextArr?: number[]
    hashInfo?: { patHash: number; winHash: number; window: string }
  }
}

// ==================== 爬楼梯 ====================
function buildClimbingSteps(n: number): DPStep[] {
  const dp = [1, 1], steps: DPStep[] = []
  steps.push({ desc: `dp[0]=1, dp[1]=1`, dp: [...dp] })
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
    steps.push({ desc: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`, dp: [...dp], highlight: { r: i } })
  }
  steps.push({ desc: `答案: dp[${n}] = ${dp[n]}`, dp: [...dp] })
  return steps
}

// ==================== 零钱兑换 ====================
function buildCoinSteps(coins: number[], amount: number): DPStep[] {
  const dp = new Array(amount + 1).fill(Infinity); dp[0] = 0
  const steps: DPStep[] = [{ desc: `dp[0]=0（凑 0 元需要 0 个硬币），其余=∞`, dp: [...dp] }]
  for (const coin of coins) {
    steps.push({ desc: `==== 尝试硬币面额 ${coin} ====`, dp: [...dp], phase: `硬币 ${coin}` })
    for (let j = coin; j <= amount; j++) {
      const hl = new Map<number, 'target' | 'source' | 'best' | 'reject'>()
      hl.set(j, 'target')
      hl.set(j - coin, 'source')
      if (dp[j - coin] !== Infinity && dp[j - coin] + 1 < dp[j]) {
        const old = dp[j]
        dp[j] = dp[j - coin] + 1
        steps.push({
          desc: `dp[${j}] = dp[${j}-${coin}]+1 = dp[${j - coin}]+1 = ${dp[j]}${old === Infinity ? '' : ` < 旧值${old}`}（用硬币 ${coin}，从金额 ${j - coin} 转移）`,
          dp: [...dp], cellHighlights: hl, transfer: { from: j - coin, to: j, label: `+${coin}` }, phase: `硬币 ${coin}`,
        })
      }
    }
  }
  steps.push({ desc: `答案: 凑 ${amount} 最少需要 ${dp[amount] === Infinity ? '无解' : dp[amount] + ' 个硬币'}`, dp: [...dp] })
  return steps
}

// ==================== LIS ====================
function buildLISSteps(seq: number[]): DPStep[] {
  const n = seq.length, dp = new Array(n).fill(1)
  const steps: DPStep[] = [{ desc: `初始: dp 全为 1（每个元素自身就是长度 1 的递增子序列）`, dp: [...dp], originalArr: [...seq] }]

  for (let i = 1; i < n; i++) {
    // 展示开始处理 i
    const startHl = new Map<number, 'target' | 'source' | 'best' | 'reject'>()
    startHl.set(i, 'target')
    steps.push({ desc: `处理 arr[${i}]=${seq[i]}：在 [0..${i - 1}] 中找所有 < ${seq[i]} 的元素`, dp: [...dp], cellHighlights: startHl, originalArr: [...seq] })

    let bestJ = -1
    for (let j = 0; j < i; j++) {
      const hl = new Map<number, 'target' | 'source' | 'best' | 'reject'>()
      hl.set(i, 'target')
      if (seq[j] < seq[i]) {
        hl.set(j, 'source')
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1
          bestJ = j
          steps.push({
            desc: `arr[${j}]=${seq[j]} < ${seq[i]} 且 dp[${j}]+1=${dp[j]} > 旧dp[${i}] → 更新 dp[${i}]=${dp[i]}，来源=位置${j}`,
            dp: [...dp], cellHighlights: hl, transfer: { from: j, to: i, label: `dp[${j}]+1=${dp[i]}` }, originalArr: [...seq],
          })
        } else {
          hl.set(j, 'reject')
          steps.push({
            desc: `arr[${j}]=${seq[j]} < ${seq[i]}，但 dp[${j}]+1=${dp[j] + 1} ≤ dp[${i}]=${dp[i]}，不更新`,
            dp: [...dp], cellHighlights: hl, originalArr: [...seq],
          })
        }
      }
    }
    // 这一轮结束
    const doneHl = new Map<number, 'target' | 'source' | 'best' | 'reject'>()
    doneHl.set(i, 'target')
    if (bestJ >= 0) doneHl.set(bestJ, 'best')
    steps.push({ desc: `dp[${i}]=${dp[i]} 确定${bestJ >= 0 ? `，最佳来源=位置${bestJ}(${seq[bestJ]})` : '，无更优来源'}`, dp: [...dp], cellHighlights: doneHl, originalArr: [...seq] })
  }
  steps.push({ desc: `LIS 长度 = ${Math.max(...dp)}`, dp: [...dp], originalArr: [...seq] })
  return steps
}

// ==================== LCS ====================
function buildLCSSteps(a: string, b: string): DPStep[] {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const steps: DPStep[] = [{ desc: `初始矩阵全 0`, dp: dp.map(r => [...r]) }]
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        steps.push({ desc: `'${a[i - 1]}'=='${b[j - 1]}': dp[${i}][${j}] = dp[${i - 1}][${j - 1}]+1 = ${dp[i][j]}`, dp: dp.map(r => [...r]), highlight: { r: i, c: j } })
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        steps.push({ desc: `'${a[i - 1]}'≠'${b[j - 1]}': dp[${i}][${j}] = max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}`, dp: dp.map(r => [...r]), highlight: { r: i, c: j } })
      }
    }
  }
  steps.push({ desc: `LCS 长度 = ${dp[m][n]}`, dp: dp.map(r => [...r]) })
  return steps
}

// ==================== 编辑距离 ====================
function buildEditSteps(a: string, b: string): DPStep[] {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0))
  const steps: DPStep[] = [{ desc: `初始: dp[i][0]=i, dp[0][j]=j`, dp: dp.map(r => [...r]) }]
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
        steps.push({ desc: `'${a[i - 1]}'=='${b[j - 1]}': dp[${i}][${j}] = ${dp[i][j]}（无操作）`, dp: dp.map(r => [...r]), highlight: { r: i, c: j } })
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
        const op = dp[i][j] - 1 === dp[i - 1][j - 1] ? '替换' : dp[i][j] - 1 === dp[i - 1][j] ? '删除' : '插入'
        steps.push({ desc: `'${a[i - 1]}'≠'${b[j - 1]}': dp[${i}][${j}] = 1+min(${dp[i - 1][j]},${dp[i][j - 1]},${dp[i - 1][j - 1]}) = ${dp[i][j]}（${op}）`, dp: dp.map(r => [...r]), highlight: { r: i, c: j } })
      }
    }
  }
  steps.push({ desc: `编辑距离 = ${dp[m][n]}`, dp: dp.map(r => [...r]) })
  return steps
}

// ==================== 分派 ====================
function buildSteps(config: DPClassicAnimationConfig): DPStep[] {
  switch (config.algorithm) {
    case 'climbing-stairs': return buildClimbingSteps(config.n!)
    case 'house-robber':    return buildHouseRobberSteps(config.sequence!)
    case 'coin-change':     return buildCoinSteps(config.coins!, config.amount!)
    case 'perfect-squares': return buildPerfectSquaresSteps(config.n!)
    case 'lis':             return buildLISSteps(config.sequence!)
    case 'lcs':             return buildLCSSteps(config.str1!, config.str2!)
    case 'edit-distance':   return buildEditSteps(config.str1!, config.str2!)
    case 'kmp':             return buildKMPSteps(config.text!, config.pattern!)
    case 'rabin-karp':      return buildRabinKarpSteps(config.text!, config.pattern!)
    case 'matrix-chain':    return buildMatrixChainSteps(config.matrices!)
  }
}

// ==================== 打家劫舍 ====================
function buildHouseRobberSteps(nums: number[]): DPStep[] {
  const n = nums.length, dp = new Array(n).fill(0)
  const steps: DPStep[] = []
  dp[0] = nums[0]; if (n > 1) dp[1] = Math.max(nums[0], nums[1])
  steps.push({ desc: `dp[0]=${dp[0]}, dp[1]=${dp[1]}`, dp: [...dp], extra: nums.join(', ') })
  for (let i = 2; i < n; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i])
    const chose = dp[i] === dp[i - 2] + nums[i] ? '偷' : '不偷'
    steps.push({ desc: `dp[${i}] = max(dp[${i - 1}]=${dp[i - 1]}, dp[${i - 2}]+${nums[i]}=${dp[i - 2] + nums[i]}) = ${dp[i]}（${chose}第${i}间）`, dp: [...dp], highlight: { r: i }, extra: nums.join(', ') })
  }
  steps.push({ desc: `最大金额 = ${dp[n - 1]}`, dp: [...dp], extra: nums.join(', ') })
  return steps
}

// ==================== 完全平方数 ====================
function buildPerfectSquaresSteps(n: number): DPStep[] {
  const dp = new Array(n + 1).fill(Infinity); dp[0] = 0
  const steps: DPStep[] = [{ desc: `dp[0]=0，其余=∞。可用平方数: ${Array.from({ length: Math.floor(Math.sqrt(n)) }, (_, i) => (i + 1) * (i + 1)).join(', ')}`, dp: [...dp] }]
  for (let i = 1; i <= n; i++) {
    let bestSq = -1
    for (let j = 1; j * j <= i; j++) {
      const sq = j * j
      const hl = new Map<number, 'target' | 'source' | 'best' | 'reject'>()
      hl.set(i, 'target')
      hl.set(i - sq, 'source')
      if (dp[i - sq] + 1 < dp[i]) {
        dp[i] = dp[i - sq] + 1
        bestSq = sq
        steps.push({
          desc: `dp[${i}]: 试 ${i}-${sq}=${i - sq}，dp[${i - sq}]+1=${dp[i]}${dp[i] < Infinity ? ' → 更新!' : ''}（减去 ${j}²=${sq}）`,
          dp: [...dp], cellHighlights: hl, transfer: { from: i - sq, to: i, label: `-${sq}` },
        })
      }
    }
    if (bestSq > 0) {
      const doneHl = new Map<number, 'target' | 'source' | 'best' | 'reject'>()
      doneHl.set(i, 'best')
      doneHl.set(i - bestSq, 'source')
      steps.push({ desc: `dp[${i}]=${dp[i]} 确定（最优: 从 dp[${i - bestSq}] 减去 ${bestSq}）`, dp: [...dp], cellHighlights: doneHl })
    }
  }
  steps.push({ desc: `答案: ${n} 最少需要 ${dp[n]} 个完全平方数`, dp: [...dp] })
  return steps
}

// ==================== KMP 动画 ====================
function buildKMPSteps(text: string, pattern: string): DPStep[] {
  const m = pattern.length, nxt = [0]
  const steps: DPStep[] = []
  let len = 0, idx = 1
  while (idx < m) {
    if (pattern[idx] === pattern[len]) { len++; nxt[idx++] = len }
    else if (len) len = nxt[len - 1]
    else nxt[idx++] = 0
  }

  const mv = (offset: number, ti: number, pi: number, matched: number, status: 'comparing' | 'match' | 'mismatch' | 'shift' | 'found') => ({
    text, pattern, offset, textIdx: ti, patIdx: pi, matchedCount: matched, status, nextArr: [...nxt],
  })

  steps.push({ desc: `构建 next 数组: [${nxt}]`, dp: [...nxt], matchView: mv(0, 0, 0, 0, 'comparing') })

  let i = 0, j = 0, offset = 0
  while (i < text.length) {
    // 展示当前对齐状态和比较位置
    steps.push({ desc: `比较 text[${i}]='${text[i]}' 和 pattern[${j}]='${pattern[j]}'`, dp: [...nxt], matchView: mv(offset, i, j, j, 'comparing') })

    if (text[i] === pattern[j]) {
      steps.push({ desc: `'${text[i]}' == '${pattern[j]}' ✓ 匹配，继续`, dp: [...nxt], matchView: mv(offset, i, j, j + 1, 'match') })
      i++; j++
    } else if (j > 0) {
      const oldJ = j
      j = nxt[j - 1]
      const newOffset = i - j
      steps.push({ desc: `'${text[i]}' ≠ '${pattern[oldJ]}' ✗ 失配! j 从 ${oldJ} 回退到 next[${oldJ - 1}]=${j}，pattern 右滑到位置 ${newOffset}`, dp: [...nxt], matchView: mv(offset, i, oldJ, oldJ, 'mismatch') })
      steps.push({ desc: `pattern 滑动: 偏移 ${offset} → ${newOffset}（利用已匹配的前后缀，text 指针不回退!）`, dp: [...nxt], matchView: mv(newOffset, i, j, j, 'shift') })
      offset = newOffset
    } else {
      steps.push({ desc: `'${text[i]}' ≠ '${pattern[0]}' ✗ j=0 无法回退，i++`, dp: [...nxt], matchView: mv(offset, i, 0, 0, 'mismatch') })
      i++; offset = i
    }
    if (j === m) {
      steps.push({ desc: `匹配成功! pattern 出现在 text 的位置 ${i - m}`, dp: [...nxt], matchView: mv(offset, i - 1, m - 1, m, 'found') })
      return steps
    }
  }
  steps.push({ desc: `遍历完成，未找到匹配`, dp: [...nxt], matchView: mv(offset, text.length - 1, j, j, 'mismatch') })
  return steps
}

// ==================== Rabin-Karp 动画 ====================
function buildRabinKarpSteps(text: string, pattern: string): DPStep[] {
  const steps: DPStep[] = []
  const n = text.length, m = pattern.length, d = 256, q = 101
  let h = 1
  for (let ii = 0; ii < m - 1; ii++) h = (h * d) % q
  let pH = 0, tH = 0
  for (let ii = 0; ii < m; ii++) { pH = (d * pH + pattern.charCodeAt(ii)) % q; tH = (d * tH + text.charCodeAt(ii)) % q }

  const mv = (offset: number, status: 'comparing' | 'match' | 'mismatch' | 'found', winHash: number) => ({
    text, pattern, offset, textIdx: offset, patIdx: 0, matchedCount: 0, status,
    hashInfo: { patHash: pH, winHash, window: text.slice(offset, offset + m) },
  })

  steps.push({ desc: `pattern="${pattern}" hash=${pH}`, dp: [pH], matchView: mv(0, 'comparing', tH) })

  for (let i = 0; i <= n - m; i++) {
    const window = text.slice(i, i + m)
    if (pH === tH) {
      if (window === pattern) {
        steps.push({ desc: `位置 ${i}: hash=${tH}==${pH} ✓ 字符验证通过 → 找到!`, dp: [pH], matchView: mv(i, 'found', tH) })
        return steps
      }
      steps.push({ desc: `位置 ${i}: hash 碰撞! ${tH}==${pH} 但 "${window}" ≠ "${pattern}"`, dp: [pH], matchView: mv(i, 'mismatch', tH) })
    } else {
      steps.push({ desc: `位置 ${i}: "${window}" hash=${tH} ≠ ${pH}，滑动`, dp: [pH], matchView: mv(i, 'comparing', tH) })
    }
    if (i < n - m) {
      tH = (d * (tH - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q
      if (tH < 0) tH += q
    }
  }
  steps.push({ desc: `未找到`, dp: [], matchView: mv(n - m, 'mismatch', tH) })
  return steps
}

// ==================== 矩阵链乘法 ====================
function buildMatrixChainSteps(p: number[]): DPStep[] {
  const n = p.length - 1
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  const steps: DPStep[] = [{ desc: `${n} 个矩阵，维度 [${p}]`, dp: dp.map(r => [...r]) }]
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1; dp[i][j] = Infinity
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + p[i] * p[k + 1] * p[j + 1]
        if (cost < dp[i][j]) dp[i][j] = cost
      }
      steps.push({ desc: `dp[${i}][${j}] = ${dp[i][j]}（区间长度${len}）`, dp: dp.map(r => [...r]), highlight: { r: i, c: j } })
    }
  }
  steps.push({ desc: `最少乘法次数 = ${dp[0][n - 1]}`, dp: dp.map(r => [...r]) })
  return steps
}

// ==================== 播放器 ====================
function usePlayer(total: number) {
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clear = useCallback(() => { if (timer.current) { clearTimeout(timer.current); timer.current = null } }, [])
  useEffect(() => {
    if (!playing) { clear(); return }
    if (step >= total - 1) { setPlaying(false); return }
    timer.current = setTimeout(() => setStep(s => s + 1), speed)
    return clear
  }, [playing, step, total, speed, clear])
  return {
    step, playing, speed, setSpeed,
    reset: useCallback(() => { clear(); setPlaying(false); setStep(-1) }, [clear]),
    playPause: useCallback(() => { if (step >= total - 1) { setStep(-1); setPlaying(true) } else setPlaying(p => !p) }, [step, total]),
    next: useCallback(() => { setPlaying(false); setStep(s => Math.min(s + 1, total - 1)) }, [total]),
    prev: useCallback(() => { setPlaying(false); setStep(s => Math.max(s - 1, -1)) }, []),
  }
}

// ==================== 一维 DP 表 ====================
function DPArray1D({ dp, highlight, labels, cellHighlights, transfer, originalArr }: {
  dp: number[]; highlight?: { r: number }; labels?: string;
  cellHighlights?: Map<number, 'target' | 'source' | 'best' | 'reject'>;
  transfer?: { from: number; to: number; label: string };
  originalArr?: number[];
}) {
  const hlColors: Record<string, string> = {
    target: 'border-amber-500 bg-amber-500/20 text-amber-200 ring-1 ring-amber-400',
    source: 'border-sky-500 bg-sky-500/20 text-sky-200 ring-1 ring-sky-400',
    best: 'border-emerald-500 bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400',
    reject: 'border-gray-600 bg-gray-800/50 text-gray-600 opacity-50',
  }

  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-2 overflow-x-auto">
      {/* 原始数组（LIS 用） */}
      {originalArr && (
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">arr</div>
          <div className="flex gap-px">
            {originalArr.map((v, i) => {
              const ch = cellHighlights?.get(i)
              return (
                <div key={i} className={`w-10 h-8 flex items-center justify-center border rounded text-xs font-mono font-bold ${
                  ch === 'target' ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                  : ch === 'source' ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                  : ch === 'best' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-gray-700 bg-gray-800 text-gray-400'
                }`}>{v}</div>
              )
            })}
          </div>
        </div>
      )}

      {/* 转移箭头指示 */}
      {transfer && (
        <div className="flex gap-px items-center h-5 relative">
          {dp.map((_, i) => (
            <div key={i} className="w-10 flex justify-center">
              {i === transfer.from && <span className="text-sky-400 text-[10px] font-bold">↓来源</span>}
              {i === transfer.to && <span className="text-amber-400 text-[10px] font-bold">↓目标</span>}
            </div>
          ))}
        </div>
      )}

      {/* dp 数组 */}
      <div>
        <div className="text-[10px] text-gray-500 mb-0.5">dp</div>
        <div className="flex gap-px">
          {dp.map((v, i) => {
            const ch = cellHighlights?.get(i)
            const isOldHl = highlight?.r === i
            let cls = v === Infinity ? 'border-gray-700 bg-gray-800 text-gray-600' : 'border-gray-700 bg-gray-800 text-gray-300'
            if (ch) cls = hlColors[ch]
            else if (isOldHl) cls = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
            return (
              <motion.div
                key={i}
                animate={{ scale: ch === 'target' || ch === 'best' ? 1.08 : 1 }}
                className={`w-10 h-10 flex flex-col items-center justify-center border rounded text-xs font-mono ${cls}`}
              >
                <span className="font-bold">{v === Infinity ? '∞' : v}</span>
                <span className="text-[7px] opacity-50">[{i}]</span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {labels && <div className="text-[10px] text-gray-500 font-mono">arr: [{labels}]</div>}

      {/* 图例 */}
      {cellHighlights && cellHighlights.size > 0 && (
        <div className="flex gap-3 text-[9px] text-gray-500 mt-1">
          <span><span className="inline-block w-2 h-2 rounded-sm bg-amber-500/30 border border-amber-500 mr-0.5 align-middle" /> 当前目标</span>
          <span><span className="inline-block w-2 h-2 rounded-sm bg-sky-500/30 border border-sky-500 mr-0.5 align-middle" /> 转移来源</span>
          <span><span className="inline-block w-2 h-2 rounded-sm bg-emerald-500/30 border border-emerald-500 mr-0.5 align-middle" /> 最优选择</span>
        </div>
      )}
    </div>
  )
}

// ==================== 二维 DP 表 ====================
function DPArray2D({ dp, highlight, rowLabels, colLabels }: { dp: number[][]; highlight?: { r: number; c?: number }; rowLabels?: string[]; colLabels?: string[] }) {
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 overflow-x-auto">
      <table className="border-collapse text-[10px]">
        {colLabels && (
          <thead>
            <tr>
              <th className="w-8 h-7 border border-gray-700 bg-gray-900 text-gray-600"></th>
              {colLabels.map((l, j) => (
                <th key={j} className="w-9 h-7 border border-gray-700 bg-gray-900 text-gray-400 font-mono">{l}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {dp.map((row, i) => (
            <tr key={i}>
              {rowLabels && <td className="w-8 h-7 border border-gray-700 bg-gray-900 text-gray-400 font-mono text-center">{rowLabels[i]}</td>}
              {row.map((v, j) => {
                const isHl = highlight?.r === i && highlight?.c === j
                return (
                  <td key={j} className={`w-9 h-7 border border-gray-700 text-center font-mono ${
                    isHl ? 'bg-emerald-500/25 text-emerald-300 font-bold' : 'text-gray-400'
                  }`}>{v === Infinity ? '∞' : v}</td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ==================== 字符串匹配可视化 ====================
function StringMatchView({ mv }: { mv: NonNullable<DPStep['matchView']> }) {
  const { text, pattern, offset, textIdx, patIdx, matchedCount, status, nextArr, hashInfo } = mv
  const m = pattern.length

  const statusColor = {
    comparing: 'border-amber-500 bg-amber-500/20',
    match: 'border-emerald-500 bg-emerald-500/20',
    mismatch: 'border-rose-500 bg-rose-500/20',
    shift: 'border-violet-500 bg-violet-500/20',
    found: 'border-emerald-500 bg-emerald-500/30',
  }

  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-3 overflow-x-auto">
      {/* text 行 */}
      <div>
        <div className="text-[10px] text-gray-500 mb-1">text</div>
        <div className="flex gap-px">
          {text.split('').map((ch, i) => {
            const inWindow = i >= offset && i < offset + m
            const isComparing = i === textIdx && (status === 'comparing' || status === 'match' || status === 'mismatch')
            const isMatched = inWindow && (i - offset) < matchedCount
            let bg = 'bg-gray-800 text-gray-400'
            if (status === 'found' && inWindow) bg = 'bg-emerald-500/30 text-emerald-200 border-emerald-500'
            else if (isComparing) bg = statusColor[status] + ' text-white'
            else if (isMatched) bg = 'bg-emerald-500/15 text-emerald-300'
            else if (inWindow) bg = 'bg-gray-700 text-gray-300'
            return (
              <div key={i} className={`w-7 h-8 flex items-center justify-center text-xs font-mono font-bold border rounded-sm ${bg} ${inWindow ? 'border-gray-600' : 'border-transparent'}`}>
                {ch}
              </div>
            )
          })}
        </div>
        <div className="flex gap-px">
          {text.split('').map((_, i) => (
            <div key={i} className="w-7 text-center text-[7px] text-gray-600 font-mono">{i}</div>
          ))}
        </div>
      </div>

      {/* pattern 行（有偏移） */}
      <div>
        <div className="text-[10px] text-gray-500 mb-1">pattern (偏移={offset})</div>
        <div className="flex gap-px">
          {/* 偏移空格 */}
          {Array.from({ length: offset }, (_, i) => (
            <div key={`sp-${i}`} className="w-7 h-8" />
          ))}
          {/* pattern 字符 */}
          {pattern.split('').map((ch, j) => {
            const isComparing = j === patIdx && (status === 'comparing' || status === 'match' || status === 'mismatch')
            const isMatched = j < matchedCount
            let bg = 'bg-gray-800 text-gray-400 border-gray-600'
            if (status === 'found') bg = 'bg-emerald-500/30 text-emerald-200 border-emerald-500'
            else if (isComparing) bg = statusColor[status] + ' text-white'
            else if (isMatched) bg = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            return (
              <div key={j} className={`w-7 h-8 flex items-center justify-center text-xs font-mono font-bold border rounded-sm ${bg}`}>
                {ch}
              </div>
            )
          })}
        </div>
      </div>

      {/* KMP next 数组 */}
      {nextArr && (
        <div>
          <div className="text-[10px] text-gray-500 mb-1">next 数组（最长相等前后缀）</div>
          <div className="flex gap-px">
            {nextArr.map((v, i) => (
              <div key={i} className="w-7 h-7 flex flex-col items-center justify-center text-[9px] font-mono border border-gray-700 rounded-sm bg-gray-800">
                <span className="text-sky-400 font-bold">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-px">
            {pattern.split('').map((ch, i) => (
              <div key={i} className="w-7 text-center text-[8px] text-gray-500 font-mono">{ch}</div>
            ))}
          </div>
        </div>
      )}

      {/* Rabin-Karp 哈希信息 */}
      {hashInfo && (
        <div className="flex gap-4 text-xs text-gray-400">
          <span>pattern hash: <span className="text-violet-400 font-bold">{hashInfo.patHash}</span></span>
          <span>窗口 "{hashInfo.window}" hash: <span className={`font-bold ${hashInfo.winHash === hashInfo.patHash ? 'text-emerald-400' : 'text-amber-400'}`}>{hashInfo.winHash}</span></span>
          {hashInfo.winHash === hashInfo.patHash && <span className="text-emerald-400">hash 匹配!</span>}
        </div>
      )}

      {/* 状态图例 */}
      <div className="flex gap-3 text-[9px] text-gray-500">
        <span><span className="inline-block w-2 h-2 rounded-sm bg-amber-500/40 border border-amber-500 mr-0.5 align-middle" /> 比较中</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-emerald-500/40 border border-emerald-500 mr-0.5 align-middle" /> 匹配</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-rose-500/40 border border-rose-500 mr-0.5 align-middle" /> 失配</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-violet-500/40 border border-violet-500 mr-0.5 align-middle" /> 滑动</span>
      </div>
    </div>
  )
}

// ==================== 主组件 ====================
export default function DPClassicAnimation({ config }: { config: DPClassicAnimationConfig }) {
  const steps = useRef(buildSteps(config)).current
  const player = usePlayer(steps.length)
  const cur = player.step >= 0 ? steps[player.step] : null

  const is2D = config.algorithm === 'lcs' || config.algorithm === 'edit-distance' || config.algorithm === 'matrix-chain'

  let rowLabels: string[] | undefined, colLabels: string[] | undefined
  if (config.algorithm === 'lcs' || config.algorithm === 'edit-distance') {
    rowLabels = ['', ...config.str1!.split('')]
    colLabels = ['', ...config.str2!.split('')]
  } else if (config.algorithm === 'matrix-chain') {
    const n = config.matrices!.length - 1
    rowLabels = Array.from({ length: n }, (_, i) => `M${i + 1}`)
    colLabels = Array.from({ length: n }, (_, i) => `M${i + 1}`)
  }

  const isMatch = config.algorithm === 'kmp' || config.algorithm === 'rabin-karp'

  return (
    <div className="space-y-3">
      {/* 字符串匹配视图 */}
      {isMatch && cur?.matchView && <StringMatchView mv={cur.matchView} />}

      {/* 普通 DP 表 */}
      {!isMatch && cur && !is2D && <DPArray1D dp={cur.dp as number[]} highlight={cur.highlight} labels={cur.extra} cellHighlights={cur.cellHighlights} transfer={cur.transfer} originalArr={cur.originalArr} />}
      {!isMatch && cur && is2D && <DPArray2D dp={cur.dp as number[][]} highlight={cur.highlight} rowLabels={rowLabels} colLabels={colLabels} />}

      {cur?.phase && <div className="text-xs text-indigo-400">{cur.phase}</div>}

      {cur && (
        <motion.div key={player.step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="text-sm bg-gray-800 rounded px-4 py-2 text-gray-200"
        >{cur.desc}</motion.div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={player.prev} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">上一步</button>
        <button onClick={player.playPause} className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded text-white font-medium min-w-16">{player.playing ? '暂停' : '播放'}</button>
        <button onClick={player.next} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">下一步</button>
        <button onClick={player.reset} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">重置</button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-gray-500">速度:</label>
          <input type="range" min={100} max={1500} step={100} value={1600 - player.speed} onChange={e => player.setSpeed(1600 - Number(e.target.value))} className="w-20 accent-indigo-500" />
        </div>
        <span className="text-xs text-gray-500">{player.step + 1} / {steps.length}</span>
      </div>
    </div>
  )
}
