import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { algorithmCategories, type AlgorithmNode } from '../data/algorithms'

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="w-64 min-w-64 h-screen overflow-y-auto border-r border-gray-800 bg-gray-900 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white tracking-wide">ALG</h1>
        <p className="text-xs text-gray-500 mt-0.5">算法可视化学习</p>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-1">
        {algorithmCategories.map((cat) => (
          <CategoryNode key={cat.id} node={cat} depth={0} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  )
}

function CategoryNode({ node, depth, onNavigate }: { node: AlgorithmNode; depth: number; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const hasChildren = node.children && node.children.length > 0
  const isLeaf = !hasChildren && node.content

  const isActive = location.pathname === `/algorithm/${node.id}`

  if (isLeaf) {
    return (
      <Link
        to={`/algorithm/${node.id}`}
        onClick={onNavigate}
        className={`block py-1.5 px-3 rounded text-sm transition-colors ${
          isActive
            ? 'bg-indigo-600/20 text-indigo-400 font-medium'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        {node.label}
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 py-1.5 px-3 rounded text-sm text-gray-300 hover:bg-gray-800 transition-colors"
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        <svg
          className={`w-3 h-3 transition-transform flex-shrink-0 ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium">{node.label}</span>
      </button>
      {open && node.children && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <CategoryNode key={child.id} node={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}
