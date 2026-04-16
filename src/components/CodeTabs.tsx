import { useState } from 'react'
import type { CodeEntry } from '../data/algorithms'

const langColors: Record<string, string> = {
  C: 'text-blue-400 border-blue-400',
  'C++': 'text-cyan-400 border-cyan-400',
  Python: 'text-yellow-400 border-yellow-400',
  JavaScript: 'text-amber-400 border-amber-400',
  TypeScript: 'text-sky-400 border-sky-400',
  Java: 'text-red-400 border-red-400',
}

const langBg: Record<string, string> = {
  C: 'bg-blue-400/10',
  'C++': 'bg-cyan-400/10',
  Python: 'bg-yellow-400/10',
  JavaScript: 'bg-amber-400/10',
  TypeScript: 'bg-sky-400/10',
  Java: 'bg-red-400/10',
}

export default function CodeTabs({ codes }: { codes: CodeEntry[] }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      {/* 语言切换标签 - 水平排列 */}
      <div className="flex gap-1 mb-0 border-b border-gray-700">
        {codes.map((entry, i) => (
          <button
            key={entry.lang}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-mono font-medium transition-colors border-b-2 -mb-px ${
              active === i
                ? `${langColors[entry.lang]} ${langBg[entry.lang]}`
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {entry.lang}
          </button>
        ))}
      </div>

      {/* 代码区域 */}
      <div className="bg-gray-950 rounded-b-lg overflow-x-auto border border-t-0 border-gray-800">
        <pre className="p-5 text-sm leading-7 whitespace-pre overflow-x-auto">
          <code className="text-gray-300 font-mono block min-w-max">{codes[active].code}</code>
        </pre>
      </div>
    </div>
  )
}
