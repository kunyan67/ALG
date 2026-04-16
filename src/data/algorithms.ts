// 算法分类树形结构定义
export interface AlgorithmNode {
  id: string
  label: string
  children?: AlgorithmNode[]
  // 叶子节点才有内容
  content?: AlgorithmContent
}

export interface DescTable {
  headers: string[]
  rows: string[][]
}

export interface AlgorithmContent {
  title: string
  description: DescBlock[]  // 问题描述，支持混合文本和表格
  approach: string          // 解题思路
  complexity: { time: string; space: string }
  // 动画配置（支持背包和排序两种）
  animation: AnimationConfig
  // 5 种语言代码
  codes: CodeEntry[]
}

export type DescBlock =
  | { type: 'text'; content: string }
  | { type: 'table'; table: DescTable }

// 背包动画配置
export interface KnapsackAnimationConfig {
  type: 'knapsack-01' | 'knapsack-complete' | 'knapsack-multi' | 'knapsack-group' | 'knapsack-2d'
  items: { weight: number; value: number; count?: number; group?: number; volume?: number }[]
  capacity: number
  capacity2?: number
}

// 排序动画配置
export interface SortAnimationConfig {
  type: 'sort'
  algorithm: 'bubble' | 'selection' | 'insertion' | 'shell' | 'merge' | 'quick' | 'heap' | 'counting' | 'bucket' | 'radix'
  data: number[]
}

// 查找动画配置
export interface SearchAnimationConfig {
  type: 'search'
  algorithm: 'sequential' | 'binary' | 'interpolation' | 'fibonacci' | 'hash'
  data: number[]
  target: number
}

// 图算法动画配置
export interface GraphNode { id: string; x: number; y: number }
export interface GraphEdge { from: string; to: string; weight: number }
export interface GraphAnimationConfig {
  type: 'graph'
  algorithm: 'dijkstra' | 'bellman-ford' | 'floyd' | 'spfa' | 'astar' | 'bfs' | 'dfs' | 'topo' | 'tarjan'
  nodes: GraphNode[]
  edges: GraphEdge[]
  source: string
  // A* 专用：网格地图
  grid?: number[][]  // 0=可通行, 1=障碍
  goal?: string
}

// 贪心算法动画配置
export interface GreedyAnimationConfig {
  type: 'greedy'
  algorithm: 'activity-selection' | 'fractional-knapsack' | 'huffman' | 'prim' | 'kruskal'
  // 活动选择
  activities?: { name: string; start: number; end: number }[]
  // 分数背包
  items?: { weight: number; value: number }[]
  capacity?: number
  // Huffman
  frequencies?: { char: string; freq: number }[]
  // Prim/Kruskal 复用图结构
  nodes?: GraphNode[]
  edges?: GraphEdge[]
}

// 通用DP动画配置（经典DP问题用）
export interface DPClassicAnimationConfig {
  type: 'dp-classic'
  algorithm: 'climbing-stairs' | 'house-robber' | 'coin-change' | 'perfect-squares' | 'lis' | 'lcs' | 'edit-distance' | 'kmp' | 'rabin-karp' | 'matrix-chain'
  n?: number
  coins?: number[]
  amount?: number
  sequence?: number[]
  str1?: string
  str2?: string
  pattern?: string
  text?: string
  matrices?: number[] // 矩阵链维度
}

export interface BacktrackingAnimationConfig {
  type: 'backtracking'
  algorithm: 'permutations' | 'n-queens' | 'combination-sum' | 'subsets' | 'combinations' | 'generate-parentheses'
  nums?: number[]
  target?: number
  n?: number
  k?: number
}

export interface TreeStructureNode {
  id: string
  label: string
  x: number
  y: number
  color?: 'red' | 'black' | 'blue' | 'green'
}

export interface TreeStructureEdge {
  from: string
  to: string
}

export interface TreeSnapshot {
  title: string
  desc: string
  nodes: TreeStructureNode[]
  edges: TreeStructureEdge[]
  highlightNodeIds?: string[]
  highlightEdgeKeys?: string[]
  sideNote?: string
  table?: DescTable
  leafLinks?: [string, string][]
}

export interface TreeAnimationConfig {
  type: 'tree-structure'
  algorithm: 'bst' | 'avl' | 'red-black-tree' | 'b-tree' | 'b-plus-tree' | 'trie' | 'segment-tree' | 'fenwick-tree' | 'union-find' | 'skip-list' | 'heap' | 'hash-table' | 'lru-cache'
  snapshots: TreeSnapshot[]
}

export type AnimationConfig =
  | KnapsackAnimationConfig
  | SortAnimationConfig
  | SearchAnimationConfig
  | GraphAnimationConfig
  | GreedyAnimationConfig
  | DPClassicAnimationConfig
  | BacktrackingAnimationConfig
  | TreeAnimationConfig

export interface CodeEntry {
  lang: 'C' | 'C++' | 'Python' | 'JavaScript' | 'TypeScript' | 'Java'
  code: string
}

// ===================== 算法分类树 =====================

import { sortingAlgorithms } from './sorting'
import { searchAlgorithms } from './searching'
import { graphAlgorithms } from './graph'
import { greedyAlgorithms } from './greedy'
import { dpLinear, dpSequence, dpInterval, dpCounting } from './dp-classic'
import { backtrackingAlgorithms } from './backtracking'
import { treeAlgorithms } from './trees'

export const algorithmCategories: AlgorithmNode[] = [
  {
    id: 'sorting',
    label: '排序算法',
    children: sortingAlgorithms(),
  },
  {
    id: 'searching',
    label: '查找算法',
    children: searchAlgorithms(),
  },
  {
    id: 'graph',
    label: '图算法',
    children: graphAlgorithms(),
  },
  {
    id: 'backtracking',
    label: '回溯算法',
    children: backtrackingAlgorithms(),
  },
  {
    id: 'tree-structures',
    label: '树与高级数据结构',
    children: treeAlgorithms(),
  },
  {
    id: 'greedy',
    label: '贪心算法',
    children: greedyAlgorithms(),
  },
  {
    id: 'dp',
    label: '动态规划',
    children: [
      {
        id: 'dp-linear',
        label: '线性 DP',
        children: dpLinear(),
      },
      {
        id: 'knapsack',
        label: '背包问题',
        children: [
          { id: 'knapsack-01', label: '0-1 背包', content: knapsack01() },
          { id: 'knapsack-complete', label: '完全背包', content: knapsackComplete() },
          { id: 'knapsack-multi', label: '多重背包', content: knapsackMulti() },
          { id: 'knapsack-group', label: '分组背包', content: knapsackGroup() },
          { id: 'knapsack-2d', label: '二维费用背包', content: knapsack2D() },
        ],
      },
      {
        id: 'dp-sequence',
        label: '序列与字符串',
        children: dpSequence(),
      },
      {
        id: 'dp-interval',
        label: '区间 DP',
        children: dpInterval(),
      },
      {
        id: 'dp-counting',
        label: '计数 DP',
        children: dpCounting(),
      },
    ],
  },
]

// 辅助：根据 id 扁平查找
export function findAlgorithm(id: string): AlgorithmContent | undefined {
  function walk(nodes: AlgorithmNode[]): AlgorithmContent | undefined {
    for (const n of nodes) {
      if (n.id === id && n.content) return n.content
      if (n.children) {
        const found = walk(n.children)
        if (found) return found
      }
    }
  }
  return walk(algorithmCategories)
}

// ==================== 0-1 背包 ====================

function knapsack01(): AlgorithmContent {
  return {
    title: '0-1 背包问题',
    description: [
      { type: 'text', content: '给定 N 个物品和一个容量为 W 的背包。第 i 个物品的重量为 weight[i]，价值为 value[i]。\n每个物品只能选择「放入」或「不放入」背包（不可分割），求在不超过背包容量的前提下能装入的最大价值。\n\n例如：背包容量 W=7，物品如下：' },
      { type: 'table', table: { headers: ['物品', '重量', '价值'], rows: [['A', '2', '6'], ['B', '3', '8'], ['C', '4', '7'], ['D', '5', '11']] } },
      { type: 'text', content: '最优解：选 A + D，总重量 7，总价值 17。' },
    ],

    approach: `**状态定义**：dp[i][w] 表示考虑前 i 个物品、背包容量为 w 时的最大价值。

**状态转移方程**：
- 若不选第 i 个物品：dp[i][w] = dp[i-1][w]
- 若选第 i 个物品（前提 w >= weight[i]）：dp[i][w] = dp[i-1][w - weight[i]] + value[i]
- 取二者最大值：dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i]] + value[i])

**初始化**：dp[0][w] = 0（没有物品可选时价值为 0）

**空间优化**：可以用一维数组，从右向左遍历容量（保证每个物品只用一次）。`,

    complexity: { time: 'O(N * W)', space: 'O(N * W)，一维优化后 O(W)' },

    animation: {
      type: 'knapsack-01',
      items: [
        { weight: 2, value: 6 },
        { weight: 3, value: 8 },
        { weight: 4, value: 7 },
        { weight: 5, value: 11 },
      ],
      capacity: 7,
    },

    codes: [
      {
        lang: 'C',
        code: `#include <stdio.h>
#include <string.h>

// 求两数较大值
int max(int a, int b) { return a > b ? a : b; }

/**
 * 0-1 背包（一维优化版）
 * @param W      背包总容量
 * @param n      物品数量
 * @param weight 每个物品的重量数组
 * @param value  每个物品的价值数组
 * @return       能装入的最大价值
 */
int knapsack01(int W, int n, int weight[], int value[]) {
    // dp[w] 表示容量为 w 时的最大价值
    int dp[W + 1];
    memset(dp, 0, sizeof(dp));

    // 逐个考虑每个物品
    for (int i = 0; i < n; i++) {
        // 从右向左遍历，确保每个物品只被选一次
        for (int w = W; w >= weight[i]; w--) {
            // 选或不选第 i 个物品，取最大值
            dp[w] = max(dp[w], dp[w - weight[i]] + value[i]);
        }
    }
    return dp[W];
}

int main() {
    int weight[] = {2, 3, 4, 5};
    int value[]  = {6, 8, 7, 11};
    int W = 7, n = 4;
    printf("最大价值: %d\\n", knapsack01(W, n, weight, value));
    return 0;
}`,
      },
      {
        lang: 'Python',
        code: `def knapsack_01(W: int, weights: list[int], values: list[int]) -> int:
    """
    0-1 背包（一维优化版）
    :param W:       背包总容量
    :param weights:  每个物品的重量列表
    :param values:   每个物品的价值列表
    :return:         能装入的最大价值
    """
    n = len(weights)
    # dp[w] 表示容量为 w 时的最大价值
    dp = [0] * (W + 1)

    # 逐个考虑每个物品
    for i in range(n):
        # 从右向左遍历，确保每个物品只被选一次
        for w in range(W, weights[i] - 1, -1):
            # 选或不选第 i 个物品，取最大值
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])

    return dp[W]


# 示例
weights = [2, 3, 4, 5]
values  = [6, 8, 7, 11]
print(f"最大价值: {knapsack_01(7, weights, values)}")`,
      },
      {
        lang: 'JavaScript',
        code: `/**
 * 0-1 背包（一维优化版）
 * @param {number} W        背包总容量
 * @param {number[]} weights 每个物品的重量数组
 * @param {number[]} values  每个物品的价值数组
 * @returns {number}         能装入的最大价值
 */
function knapsack01(W, weights, values) {
  const n = weights.length;
  // dp[w] 表示容量为 w 时的最大价值
  const dp = new Array(W + 1).fill(0);

  // 逐个考虑每个物品
  for (let i = 0; i < n; i++) {
    // 从右向左遍历，确保每个物品只被选一次
    for (let w = W; w >= weights[i]; w--) {
      // 选或不选第 i 个物品，取最大值
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[W];
}

// 示例
const weights = [2, 3, 4, 5];
const values  = [6, 8, 7, 11];
console.log(\`最大价值: \${knapsack01(7, weights, values)}\`);`,
      },
      {
        lang: 'TypeScript',
        code: `/**
 * 0-1 背包（一维优化版）
 * @param W       背包总容量
 * @param weights 每个物品的重量数组
 * @param values  每个物品的价值数组
 * @returns       能装入的最大价值
 */
function knapsack01(W: number, weights: number[], values: number[]): number {
  const n = weights.length;
  // dp[w] 表示容量为 w 时的最大价值
  const dp: number[] = new Array(W + 1).fill(0);

  // 逐个考虑每个物品
  for (let i = 0; i < n; i++) {
    // 从右向左遍历，确保每个物品只被选一次
    for (let w = W; w >= weights[i]; w--) {
      // 选或不选第 i 个物品，取最大值
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[W];
}

// 示例
const weights: number[] = [2, 3, 4, 5];
const values: number[]  = [6, 8, 7, 11];
console.log(\`最大价值: \${knapsack01(7, weights, values)}\`);`,
      },
      {
        lang: 'Java',
        code: `public class Knapsack01 {
    /**
     * 0-1 背包（一维优化版）
     * @param W       背包总容量
     * @param weights 每个物品的重量数组
     * @param values  每个物品的价值数组
     * @return        能装入的最大价值
     */
    public static int knapsack01(int W, int[] weights, int[] values) {
        int n = weights.length;
        // dp[w] 表示容量为 w 时的最大价值
        int[] dp = new int[W + 1];

        // 逐个考虑每个物品
        for (int i = 0; i < n; i++) {
            // 从右向左遍历，确保每个物品只被选一次
            for (int w = W; w >= weights[i]; w--) {
                // 选或不选第 i 个物品，取最大值
                dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
            }
        }
        return dp[W];
    }

    public static void main(String[] args) {
        int[] weights = {2, 3, 4, 5};
        int[] values  = {6, 8, 7, 11};
        System.out.println("最大价值: " + knapsack01(7, weights, values));
    }
}`,
      },
    ],
  }
}

// ==================== 完全背包 ====================

function knapsackComplete(): AlgorithmContent {
  return {
    title: '完全背包问题',
    description: [
      { type: 'text', content: '给定 N 种物品和一个容量为 W 的背包。每种物品有无限个可用，第 i 种物品的重量为 weight[i]，价值为 value[i]。\n求在不超过背包容量的前提下能装入的最大价值。\n\n例如：背包容量 W=7，物品如下：' },
      { type: 'table', table: { headers: ['物品', '重量', '价值'], rows: [['A', '2', '6'], ['B', '3', '8'], ['C', '4', '7']] } },
      { type: 'text', content: '最优解：选 A x 2 + B x 1，总重量 7，总价值 20。' },
    ],

    approach: `**与 0-1 背包的区别**：每种物品可以选无限次。

**状态转移方程**：
dp[i][w] = max(dp[i-1][w], dp[i][w - weight[i]] + value[i])

注意第二项是 dp[i] 而不是 dp[i-1]，因为同一物品可以重复选取。

**一维优化**：与 0-1 背包不同，遍历容量时**从左向右**（正序），这样同一物品可以被多次选取。`,

    complexity: { time: 'O(N * W)', space: 'O(W)' },

    animation: {
      type: 'knapsack-complete',
      items: [
        { weight: 2, value: 6 },
        { weight: 3, value: 8 },
        { weight: 4, value: 7 },
      ],
      capacity: 7,
    },

    codes: [
      {
        lang: 'C',
        code: `#include <stdio.h>
#include <string.h>

int max(int a, int b) { return a > b ? a : b; }

/**
 * 完全背包（一维优化版）
 * 与 0-1 背包的唯一区别：内层循环正序遍历
 */
int knapsackComplete(int W, int n, int weight[], int value[]) {
    int dp[W + 1];
    memset(dp, 0, sizeof(dp));

    for (int i = 0; i < n; i++) {
        // 正序遍历：允许同一物品被多次选取
        for (int w = weight[i]; w <= W; w++) {
            dp[w] = max(dp[w], dp[w - weight[i]] + value[i]);
        }
    }
    return dp[W];
}

int main() {
    int weight[] = {2, 3, 4};
    int value[]  = {6, 8, 7};
    printf("最大价值: %d\\n", knapsackComplete(7, 3, weight, value));
    return 0;
}`,
      },
      {
        lang: 'Python',
        code: `def knapsack_complete(W: int, weights: list[int], values: list[int]) -> int:
    """
    完全背包（一维优化版）
    与 0-1 背包的唯一区别：内层循环正序遍历
    """
    dp = [0] * (W + 1)

    for i in range(len(weights)):
        # 正序遍历：允许同一物品被多次选取
        for w in range(weights[i], W + 1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])

    return dp[W]


weights = [2, 3, 4]
values  = [6, 8, 7]
print(f"最大价值: {knapsack_complete(7, weights, values)}")`,
      },
      {
        lang: 'JavaScript',
        code: `/**
 * 完全背包（一维优化版）
 * 与 0-1 背包的唯一区别：内层循环正序遍历
 */
function knapsackComplete(W, weights, values) {
  const dp = new Array(W + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    // 正序遍历：允许同一物品被多次选取
    for (let w = weights[i]; w <= W; w++) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[W];
}

console.log(\`最大价值: \${knapsackComplete(7, [2,3,4], [6,8,7])}\`);`,
      },
      {
        lang: 'TypeScript',
        code: `function knapsackComplete(W: number, weights: number[], values: number[]): number {
  const dp: number[] = new Array(W + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    // 正序遍历：允许同一物品被多次选取
    for (let w = weights[i]; w <= W; w++) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[W];
}

console.log(\`最大价值: \${knapsackComplete(7, [2,3,4], [6,8,7])}\`);`,
      },
      {
        lang: 'Java',
        code: `public class KnapsackComplete {
    /**
     * 完全背包（一维优化版）
     * 与 0-1 背包的唯一区别：内层循环正序遍历
     */
    public static int knapsackComplete(int W, int[] weights, int[] values) {
        int[] dp = new int[W + 1];

        for (int i = 0; i < weights.length; i++) {
            // 正序遍历：允许同一物品被多次选取
            for (int w = weights[i]; w <= W; w++) {
                dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
            }
        }
        return dp[W];
    }

    public static void main(String[] args) {
        System.out.println("最大价值: " + knapsackComplete(7,
            new int[]{2,3,4}, new int[]{6,8,7}));
    }
}`,
      },
    ],
  }
}

// ==================== 多重背包 ====================

function knapsackMulti(): AlgorithmContent {
  return {
    title: '多重背包问题',
    description: [
      { type: 'text', content: '给定 N 种物品和一个容量为 W 的背包。第 i 种物品最多有 count[i] 个，重量为 weight[i]，价值为 value[i]。\n求在不超过背包容量的前提下能装入的最大价值。\n\n例如：背包容量 W=8，物品如下：' },
      { type: 'table', table: { headers: ['物品', '重量', '价值', '数量'], rows: [['A', '2', '6', '3'], ['B', '3', '8', '2'], ['C', '5', '12', '1']] } },
      { type: 'text', content: '最优解：选 A x 1 + B x 2，总重量 8，总价值 22。' },
    ],

    approach: `**朴素方法**：把每种物品展开成 count[i] 个独立物品，然后用 0-1 背包解决。

**二进制优化**：将 count[i] 个物品拆分为 1, 2, 4, ..., 2^k, 余数 这几组，每组作为一个"虚拟物品"做 0-1 背包。这样将每种物品的枚举从 O(count) 降到 O(log count)。

例如 count=13 → 拆为 1, 2, 4, 6（1+2+4+6=13），只需 4 轮而非 13 轮。`,

    complexity: { time: 'O(N * W * log(maxCount))，二进制优化', space: 'O(W)' },

    animation: {
      type: 'knapsack-multi',
      items: [
        { weight: 2, value: 6, count: 3 },
        { weight: 3, value: 8, count: 2 },
        { weight: 5, value: 12, count: 1 },
      ],
      capacity: 8,
    },

    codes: [
      {
        lang: 'C',
        code: `#include <stdio.h>
#include <string.h>

int max(int a, int b) { return a > b ? a : b; }

/**
 * 多重背包（二进制优化版）
 * 将每种物品的数量按二进制拆分，转化为 0-1 背包
 */
int knapsackMulti(int W, int n, int weight[], int value[], int count[]) {
    int dp[W + 1];
    memset(dp, 0, sizeof(dp));

    for (int i = 0; i < n; i++) {
        int remaining = count[i];
        // 二进制拆分：1, 2, 4, 8, ... 直到剩余数量
        for (int k = 1; remaining > 0; k *= 2) {
            int batch = k < remaining ? k : remaining;
            remaining -= batch;
            int bw = batch * weight[i];  // 这一组的总重量
            int bv = batch * value[i];   // 这一组的总价值
            // 按 0-1 背包处理（逆序遍历）
            for (int w = W; w >= bw; w--) {
                dp[w] = max(dp[w], dp[w - bw] + bv);
            }
        }
    }
    return dp[W];
}

int main() {
    int weight[] = {2, 3, 5};
    int value[]  = {6, 8, 12};
    int count[]  = {3, 2, 1};
    printf("最大价值: %d\\n", knapsackMulti(8, 3, weight, value, count));
    return 0;
}`,
      },
      {
        lang: 'Python',
        code: `def knapsack_multi(W: int, weights: list[int], values: list[int], counts: list[int]) -> int:
    """
    多重背包（二进制优化版）
    将每种物品的数量按二进制拆分，转化为 0-1 背包
    """
    dp = [0] * (W + 1)

    for i in range(len(weights)):
        remaining = counts[i]
        k = 1
        # 二进制拆分：1, 2, 4, 8, ...
        while remaining > 0:
            batch = min(k, remaining)
            remaining -= batch
            bw = batch * weights[i]  # 这一组的总重量
            bv = batch * values[i]   # 这一组的总价值
            # 按 0-1 背包处理（逆序遍历）
            for w in range(W, bw - 1, -1):
                dp[w] = max(dp[w], dp[w - bw] + bv)
            k *= 2

    return dp[W]


print(f"最大价值: {knapsack_multi(8, [2,3,5], [6,8,12], [3,2,1])}")`,
      },
      {
        lang: 'JavaScript',
        code: `/**
 * 多重背包（二进制优化版）
 * 将每种物品的数量按二进制拆分，转化为 0-1 背包
 */
function knapsackMulti(W, weights, values, counts) {
  const dp = new Array(W + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    let remaining = counts[i];
    // 二进制拆分
    for (let k = 1; remaining > 0; k *= 2) {
      const batch = Math.min(k, remaining);
      remaining -= batch;
      const bw = batch * weights[i]; // 这一组的总重量
      const bv = batch * values[i];  // 这一组的总价值
      // 按 0-1 背包处理（逆序遍历）
      for (let w = W; w >= bw; w--) {
        dp[w] = Math.max(dp[w], dp[w - bw] + bv);
      }
    }
  }
  return dp[W];
}

console.log(\`最大价值: \${knapsackMulti(8, [2,3,5], [6,8,12], [3,2,1])}\`);`,
      },
      {
        lang: 'TypeScript',
        code: `function knapsackMulti(
  W: number, weights: number[], values: number[], counts: number[]
): number {
  const dp: number[] = new Array(W + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    let remaining = counts[i];
    for (let k = 1; remaining > 0; k *= 2) {
      const batch = Math.min(k, remaining);
      remaining -= batch;
      const bw = batch * weights[i]; // 这一组的总重量
      const bv = batch * values[i];  // 这一组的总价值
      // 按 0-1 背包处理（逆序遍历）
      for (let w = W; w >= bw; w--) {
        dp[w] = Math.max(dp[w], dp[w - bw] + bv);
      }
    }
  }
  return dp[W];
}

console.log(\`最大价值: \${knapsackMulti(8, [2,3,5], [6,8,12], [3,2,1])}\`);`,
      },
      {
        lang: 'Java',
        code: `public class KnapsackMulti {
    /**
     * 多重背包（二进制优化版）
     * 将每种物品的数量按二进制拆分，转化为 0-1 背包
     */
    public static int knapsackMulti(int W, int[] weights, int[] values, int[] counts) {
        int[] dp = new int[W + 1];

        for (int i = 0; i < weights.length; i++) {
            int remaining = counts[i];
            for (int k = 1; remaining > 0; k *= 2) {
                int batch = Math.min(k, remaining);
                remaining -= batch;
                int bw = batch * weights[i]; // 这一组的总重量
                int bv = batch * values[i];  // 这一组的总价值
                // 按 0-1 背包处理（逆序遍历）
                for (int w = W; w >= bw; w--) {
                    dp[w] = Math.max(dp[w], dp[w - bw] + bv);
                }
            }
        }
        return dp[W];
    }

    public static void main(String[] args) {
        System.out.println("最大价值: " + knapsackMulti(8,
            new int[]{2,3,5}, new int[]{6,8,12}, new int[]{3,2,1}));
    }
}`,
      },
    ],
  }
}

// ==================== 分组背包 ====================

function knapsackGroup(): AlgorithmContent {
  return {
    title: '分组背包问题',
    description: [
      { type: 'text', content: '给定 N 个物品分成若干组，每组中最多只能选一个物品放入容量为 W 的背包。\n求在不超过背包容量的前提下能装入的最大价值。\n\n例如：背包容量 W=7，物品分组如下：' },
      { type: 'table', table: { headers: ['组', '物品', '重量', '价值'], rows: [['1', 'A', '2', '5'], ['1', 'B', '3', '8'], ['2', 'C', '4', '9'], ['2', 'D', '5', '10']] } },
      { type: 'text', content: '最优解：选 B（组1）+ C（组2），总重量 7，总价值 17。' },
    ],

    approach: `**核心思想**：在每组内做「选哪一个或都不选」的决策。

**状态转移**：
对于第 g 组中的每个物品 j：
dp[w] = max(dp[w], dp[w - weight[g][j]] + value[g][j])

**关键**：外层遍历组，中层逆序遍历容量，内层遍历组内物品。
必须在遍历容量的循环内部遍历组内物品，而非反过来——这保证了每组最多选一个。`,

    complexity: { time: 'O(G * W * K)，G 为组数，K 为最大组内物品数', space: 'O(W)' },

    animation: {
      type: 'knapsack-group',
      items: [
        { weight: 2, value: 5, group: 1 },
        { weight: 3, value: 8, group: 1 },
        { weight: 4, value: 9, group: 2 },
        { weight: 5, value: 10, group: 2 },
      ],
      capacity: 7,
    },

    codes: [
      {
        lang: 'C',
        code: `#include <stdio.h>
#include <string.h>

int max(int a, int b) { return a > b ? a : b; }

/**
 * 分组背包
 * groups[g] 存储第 g 组的物品列表
 * 每组最多选一个物品
 */
int knapsackGroup(int W, int groupCount,
    int groupSizes[], int weights[][10], int values[][10]) {
    int dp[W + 1];
    memset(dp, 0, sizeof(dp));

    // 外层遍历每一组
    for (int g = 0; g < groupCount; g++) {
        // 中层逆序遍历容量（保证每组最多选一个）
        for (int w = W; w >= 0; w--) {
            // 内层遍历组内每个物品
            for (int j = 0; j < groupSizes[g]; j++) {
                if (w >= weights[g][j]) {
                    dp[w] = max(dp[w], dp[w - weights[g][j]] + values[g][j]);
                }
            }
        }
    }
    return dp[W];
}

int main() {
    int groupSizes[] = {2, 2};
    int weights[2][10] = {{2, 3}, {4, 5}};
    int values[2][10]  = {{5, 8}, {9, 10}};
    printf("最大价值: %d\\n", knapsackGroup(7, 2, groupSizes, weights, values));
    return 0;
}`,
      },
      {
        lang: 'Python',
        code: `def knapsack_group(W: int, groups: list[list[tuple[int, int]]]) -> int:
    """
    分组背包
    :param groups: groups[g] = [(weight, value), ...] 第 g 组的物品列表
    每组最多选一个物品
    """
    dp = [0] * (W + 1)

    # 外层遍历每一组
    for group in groups:
        # 中层逆序遍历容量（保证每组最多选一个）
        for w in range(W, -1, -1):
            # 内层遍历组内每个物品
            for weight, value in group:
                if w >= weight:
                    dp[w] = max(dp[w], dp[w - weight] + value)

    return dp[W]


groups = [
    [(2, 5), (3, 8)],   # 第 1 组
    [(4, 9), (5, 10)],  # 第 2 组
]
print(f"最大价值: {knapsack_group(7, groups)}")`,
      },
      {
        lang: 'JavaScript',
        code: `/**
 * 分组背包
 * @param {number} W 背包容量
 * @param {Array<Array<{w:number,v:number}>>} groups 分组物品
 * 每组最多选一个物品
 */
function knapsackGroup(W, groups) {
  const dp = new Array(W + 1).fill(0);

  // 外层遍历每一组
  for (const group of groups) {
    // 中层逆序遍历容量（保证每组最多选一个）
    for (let w = W; w >= 0; w--) {
      // 内层遍历组内每个物品
      for (const { w: wt, v } of group) {
        if (w >= wt) {
          dp[w] = Math.max(dp[w], dp[w - wt] + v);
        }
      }
    }
  }
  return dp[W];
}

const groups = [
  [{ w: 2, v: 5 }, { w: 3, v: 8 }],
  [{ w: 4, v: 9 }, { w: 5, v: 10 }],
];
console.log(\`最大价值: \${knapsackGroup(7, groups)}\`);`,
      },
      {
        lang: 'TypeScript',
        code: `interface Item { w: number; v: number }

function knapsackGroup(W: number, groups: Item[][]): number {
  const dp: number[] = new Array(W + 1).fill(0);

  // 外层遍历每一组
  for (const group of groups) {
    // 中层逆序遍历容量（保证每组最多选一个）
    for (let w = W; w >= 0; w--) {
      // 内层遍历组内每个物品
      for (const { w: wt, v } of group) {
        if (w >= wt) {
          dp[w] = Math.max(dp[w], dp[w - wt] + v);
        }
      }
    }
  }
  return dp[W];
}

const groups: Item[][] = [
  [{ w: 2, v: 5 }, { w: 3, v: 8 }],
  [{ w: 4, v: 9 }, { w: 5, v: 10 }],
];
console.log(\`最大价值: \${knapsackGroup(7, groups)}\`);`,
      },
      {
        lang: 'Java',
        code: `import java.util.*;

public class KnapsackGroup {
    /**
     * 分组背包
     * 每组最多选一个物品
     */
    public static int knapsackGroup(int W, int[][][] groups) {
        int[] dp = new int[W + 1];

        // 外层遍历每一组
        for (int[][] group : groups) {
            // 中层逆序遍历容量（保证每组最多选一个）
            for (int w = W; w >= 0; w--) {
                // 内层遍历组内每个物品 [weight, value]
                for (int[] item : group) {
                    if (w >= item[0]) {
                        dp[w] = Math.max(dp[w], dp[w - item[0]] + item[1]);
                    }
                }
            }
        }
        return dp[W];
    }

    public static void main(String[] args) {
        int[][][] groups = {
            {{2, 5}, {3, 8}},   // 第 1 组
            {{4, 9}, {5, 10}},  // 第 2 组
        };
        System.out.println("最大价值: " + knapsackGroup(7, groups));
    }
}`,
      },
    ],
  }
}

// ==================== 二维费用背包 ====================

function knapsack2D(): AlgorithmContent {
  return {
    title: '二维费用背包问题',
    description: [
      { type: 'text', content: '给定 N 个物品和一个背包，背包有两种容量限制：最大重量 W 和最大体积 V。\n第 i 个物品的重量为 weight[i]，体积为 volume[i]，价值为 value[i]。\n每个物品只能选或不选，求在不超过两种容量的前提下能装入的最大价值。\n\n例如：背包最大重量 W=6，最大体积 V=5，物品如下：' },
      { type: 'table', table: { headers: ['物品', '重量', '体积', '价值'], rows: [['A', '2', '1', '5'], ['B', '3', '3', '8'], ['C', '4', '2', '9']] } },
      { type: 'text', content: '最优解：选 A + C，总重量 6，总体积 3，总价值 14。' },
    ],

    approach: `**核心思想**：将一维 dp 扩展为二维，dp[w][v] 表示重量不超过 w、体积不超过 v 时的最大价值。

**状态转移方程**：
dp[w][v] = max(dp[w][v], dp[w - weight[i]][v - volume[i]] + value[i])

**遍历方式**：两层容量都逆序遍历（与 0-1 背包一致），确保每个物品只被选一次。

这个思路可以推广到任意多维费用的情况，只需增加对应的维度即可。`,

    complexity: { time: 'O(N * W * V)', space: 'O(W * V)' },

    animation: {
      type: 'knapsack-2d',
      items: [
        { weight: 2, value: 5, volume: 1 },
        { weight: 3, value: 8, volume: 3 },
        { weight: 4, value: 9, volume: 2 },
      ],
      capacity: 6,
      capacity2: 5,
    },

    codes: [
      {
        lang: 'C',
        code: `#include <stdio.h>
#include <string.h>

int max(int a, int b) { return a > b ? a : b; }

/**
 * 二维费用背包
 * 同时受重量和体积两种限制
 */
int knapsack2D(int W, int V, int n,
    int weight[], int volume[], int value[]) {
    // dp[w][v] 表示重量<=w 且体积<=v 时的最大价值
    int dp[W + 1][V + 1];
    memset(dp, 0, sizeof(dp));

    for (int i = 0; i < n; i++) {
        // 两维都逆序遍历（0-1 背包思路）
        for (int w = W; w >= weight[i]; w--) {
            for (int v = V; v >= volume[i]; v--) {
                dp[w][v] = max(dp[w][v],
                    dp[w - weight[i]][v - volume[i]] + value[i]);
            }
        }
    }
    return dp[W][V];
}

int main() {
    int weight[] = {2, 3, 4};
    int volume[] = {1, 3, 2};
    int value[]  = {5, 8, 9};
    printf("最大价值: %d\\n", knapsack2D(6, 5, 3, weight, volume, value));
    return 0;
}`,
      },
      {
        lang: 'Python',
        code: `def knapsack_2d(W: int, V: int,
    weights: list[int], volumes: list[int], values: list[int]) -> int:
    """
    二维费用背包
    同时受重量和体积两种限制
    """
    # dp[w][v] 表示重量<=w 且体积<=v 时的最大价值
    dp = [[0] * (V + 1) for _ in range(W + 1)]

    for i in range(len(weights)):
        # 两维都逆序遍历（0-1 背包思路）
        for w in range(W, weights[i] - 1, -1):
            for v in range(V, volumes[i] - 1, -1):
                dp[w][v] = max(dp[w][v],
                    dp[w - weights[i]][v - volumes[i]] + values[i])

    return dp[W][V]


print(f"最大价值: {knapsack_2d(6, 5, [2,3,4], [1,3,2], [5,8,9])}")`,
      },
      {
        lang: 'JavaScript',
        code: `/**
 * 二维费用背包
 * 同时受重量和体积两种限制
 */
function knapsack2D(W, V, weights, volumes, values) {
  // dp[w][v] 表示重量<=w 且体积<=v 时的最大价值
  const dp = Array.from({ length: W + 1 }, () => new Array(V + 1).fill(0));

  for (let i = 0; i < weights.length; i++) {
    // 两维都逆序遍历（0-1 背包思路）
    for (let w = W; w >= weights[i]; w--) {
      for (let v = V; v >= volumes[i]; v--) {
        dp[w][v] = Math.max(dp[w][v],
          dp[w - weights[i]][v - volumes[i]] + values[i]);
      }
    }
  }
  return dp[W][V];
}

console.log(\`最大价值: \${knapsack2D(6, 5, [2,3,4], [1,3,2], [5,8,9])}\`);`,
      },
      {
        lang: 'TypeScript',
        code: `function knapsack2D(
  W: number, V: number,
  weights: number[], volumes: number[], values: number[]
): number {
  // dp[w][v] 表示重量<=w 且体积<=v 时的最大价值
  const dp: number[][] = Array.from(
    { length: W + 1 }, () => new Array(V + 1).fill(0)
  );

  for (let i = 0; i < weights.length; i++) {
    // 两维都逆序遍历（0-1 背包思路）
    for (let w = W; w >= weights[i]; w--) {
      for (let v = V; v >= volumes[i]; v--) {
        dp[w][v] = Math.max(dp[w][v],
          dp[w - weights[i]][v - volumes[i]] + values[i]);
      }
    }
  }
  return dp[W][V];
}

console.log(\`最大价值: \${knapsack2D(6, 5, [2,3,4], [1,3,2], [5,8,9])}\`);`,
      },
      {
        lang: 'Java',
        code: `public class Knapsack2D {
    /**
     * 二维费用背包
     * 同时受重量和体积两种限制
     */
    public static int knapsack2D(int W, int V,
        int[] weights, int[] volumes, int[] values) {
        // dp[w][v] 表示重量<=w 且体积<=v 时的最大价值
        int[][] dp = new int[W + 1][V + 1];

        for (int i = 0; i < weights.length; i++) {
            // 两维都逆序遍历（0-1 背包思路）
            for (int w = W; w >= weights[i]; w--) {
                for (int v = V; v >= volumes[i]; v--) {
                    dp[w][v] = Math.max(dp[w][v],
                        dp[w - weights[i]][v - volumes[i]] + values[i]);
                }
            }
        }
        return dp[W][V];
    }

    public static void main(String[] args) {
        System.out.println("最大价值: " + knapsack2D(6, 5,
            new int[]{2,3,4}, new int[]{1,3,2}, new int[]{5,8,9}));
    }
}`,
      },
    ],
  }
}
