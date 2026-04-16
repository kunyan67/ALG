import { useParams } from 'react-router-dom'
import { findAlgorithm, type DescBlock, type AnimationConfig, type CodeEntry } from '../data/algorithms'
import CodeTabs from './CodeTabs'
import DPAnimation from './DPAnimation'
import DPClassicAnimation from './DPClassicAnimation'
import SortAnimation from './SortAnimation'
import SearchAnimation from './SearchAnimation'
import GraphAnimation from './GraphAnimation'
import GreedyAnimation from './GreedyAnimation'
import BacktrackingAnimation from './BacktrackingAnimation'
import TreeStructureAnimation from './TreeStructureAnimation'

export default function AlgorithmPage() {
  const { id } = useParams<{ id: string }>()
  const algo = id ? findAlgorithm(id) : undefined

  if (!algo) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        未找到该算法，请从左侧选择
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 md:px-8 md:py-8 md:space-y-8">
      {/* 标题 */}
      <h1 className="text-2xl md:text-3xl font-bold text-white">{algo.title}</h1>

      {/* 问题描述 */}
      <Section title="问题描述">
        <DescriptionRenderer blocks={algo.description} />
      </Section>

      {/* 解题思路 */}
      <Section title="解题思路">
        <div className="text-sm text-gray-300 leading-relaxed space-y-2">
          {algo.approach.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/)
            return (
              <p key={i}>
                {parts.map((part, j) =>
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={j} className="text-indigo-400 font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </p>
            )
          })}
        </div>
      </Section>

      <Section title="时间复杂度">
        <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
          <p>
            先看主循环、递归层数或状态总数一共会展开多少次，再看每次展开要处理多少工作量。
            嵌套循环通常把各层规模相乘，分治和回溯通常看状态树规模与单状态代价。
          </p>
          <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
            <span>
              时间复杂度：<code className="text-indigo-400/80">{algo.complexity.time}</code>
            </span>
            <span>
              空间复杂度：<code className="text-indigo-400/80">{algo.complexity.space}</code>
            </span>
          </div>
        </div>
      </Section>

      {/* 动画 */}
      <Section title="解题过程动画">
        <AnimationDispatcher key={id} config={algo.animation} />
      </Section>

      {/* 代码实现 */}
      <Section title="代码实现">
        <CodeTabs codes={ensureCppCode(algo.codes)} />
      </Section>
    </div>
  )
}

function ensureCppCode(codes: CodeEntry[]): CodeEntry[] {
  if (codes.some((entry) => entry.lang === 'C++')) {
    return codes
  }

  const seed = codes.find((entry) => entry.lang === 'C') ?? codes[0]
  const fallback = seed?.code ?? '// 暂无实现'

  const cppCode = `#include <bits/stdc++.h>
using namespace std;

/*
 * C++ 实现说明：
 * 当前页面暂时复用同题思路的参考实现。
 * 如果这里的代码源自 C 版本，请根据需要替换为更贴近现代 C++ 风格的写法。
 */

${fallback}`

  return [{ lang: 'C++', code: cppCode }, ...codes]
}

/** 根据动画类型分派到不同组件 */
function AnimationDispatcher({ config }: { config: AnimationConfig }) {
  if (config.type === 'sort') return <SortAnimation config={config} />
  if (config.type === 'search') return <SearchAnimation config={config} />
  if (config.type === 'graph') return <GraphAnimation config={config} />
  if (config.type === 'greedy') return <GreedyAnimation config={config} />
  if (config.type === 'dp-classic') return <DPClassicAnimation config={config} />
  if (config.type === 'backtracking') return <BacktrackingAnimation config={config} />
  if (config.type === 'tree-structure') return <TreeStructureAnimation config={config} />
  return <DPAnimation config={config} />
}

/** 渲染结构化的问题描述（文本 + 表格混合） */
function DescriptionRenderer({ blocks }: { blocks: DescBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        if (block.type === 'text') {
          return (
            <pre
              key={i}
              className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans"
            >
              {block.content}
            </pre>
          )
        }
        // 表格
        const { headers, rows } = block.table
        return (
          <div key={i} className="overflow-x-auto">
            <table className="border-collapse text-sm w-auto">
              <thead>
                <tr>
                  {headers.map((h, j) => (
                    <th
                      key={j}
                      className="px-4 py-2 text-left text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-4 py-1.5 text-sm text-gray-400 border border-gray-700 font-mono"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-800 bg-gray-900/80">
        <h2 className="text-base font-semibold text-gray-200">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}
