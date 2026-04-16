import type { AlgorithmNode, AlgorithmContent, CodeEntry } from './algorithms'

export function backtrackingAlgorithms(): AlgorithmNode[] {
  return [
    {
      id: 'backtracking-enumeration',
      label: '枚举型回溯',
      children: [
        { id: 'backtracking-permutations', label: '全排列', content: permutations() },
        { id: 'backtracking-subsets', label: '子集', content: subsets() },
        { id: 'backtracking-combinations', label: '组合', content: combinations() },
      ],
    },
    {
      id: 'backtracking-constraints',
      label: '约束型回溯',
      children: [
        { id: 'backtracking-n-queens', label: 'N 皇后', content: nQueens() },
        { id: 'backtracking-parentheses', label: '括号生成', content: generateParentheses() },
      ],
    },
    {
      id: 'backtracking-search',
      label: '目标搜索',
      children: [
        { id: 'backtracking-combination-sum', label: '组合总和', content: combinationSum() },
      ],
    },
  ]
}

function permutations(): AlgorithmContent {
  return {
    title: '全排列',
    description: [
      { type: 'text', content: '给定一个不含重复元素的数组，要求枚举它的所有排列。核心不是“把答案写出来”，而是理解递归树中每一层在决定哪个位置放哪个数。' },
      { type: 'table', table: { headers: ['输入', '输出示例'], rows: [['[1,2,3]', '[1,2,3]、[1,3,2]、[2,1,3] ...']] } },
    ],
    approach: `**状态**：path 表示当前已经选好的前缀，used[i] 表示 nums[i] 是否已使用。

**递归过程**：
1. 若 path 长度等于 n，得到一个完整排列
2. 否则枚举所有还没用过的数字
3. 选择一个数字加入 path
4. 递归下一层
5. 返回时撤销选择，继续尝试其它候选

**理解重点**：回溯不是“失败了才退”，而是“每次试完一个分支都必须把现场恢复”。`,
    complexity: { time: 'O(n * n!)', space: 'O(n)' },
    animation: { type: 'backtracking', algorithm: 'permutations', nums: [1, 2, 3] },
    codes: backtrackingCodes('permutations'),
  }
}

function subsets(): AlgorithmContent {
  return {
    title: '子集',
    description: [
      { type: 'text', content: '给定一个数组，要求枚举它的所有子集。理解重点是每个元素都面临“选”或“不选”两个分支。' },
      { type: 'table', table: { headers: ['输入', '部分输出'], rows: [['[1,2,3]', '[]、[1]、[2]、[1,2] ...']] } },
    ],
    approach: `**二叉决策树**：处理到第 i 个元素时，只有两种选择：加入当前子集，或跳过它。

因此整棵递归树本质上是在枚举所有选/不选方案。`,
    complexity: { time: 'O(n * 2^n)', space: 'O(n)' },
    animation: { type: 'backtracking', algorithm: 'subsets', nums: [1, 2, 3] },
    codes: backtrackingCodes('subsets'),
  }
}

function combinations(): AlgorithmContent {
  return {
    title: '组合',
    description: [
      { type: 'text', content: '从 1..n 中选 k 个数，输出所有组合。重点是 start 指针如何保证组合不重复。' },
      { type: 'table', table: { headers: ['n', 'k', '输出示例'], rows: [['4', '2', '[1,2]、[1,3]、[1,4] ...']] } },
    ],
    approach: `**关键约束**：下一层只能从更靠后的数继续选，这样 [1,2] 和 [2,1] 不会重复出现。

当 path 长度达到 k 时，就得到一个合法组合。`,
    complexity: { time: 'O(C(n,k) * k)', space: 'O(k)' },
    animation: { type: 'backtracking', algorithm: 'combinations', n: 4, k: 2 },
    codes: backtrackingCodes('combinations'),
  }
}

function nQueens(): AlgorithmContent {
  return {
    title: 'N 皇后',
    description: [
      { type: 'text', content: '在 n×n 棋盘上放置 n 个皇后，使任意两个皇后都不在同一行、同一列、同一对角线上。动画重点是每一行如何尝试列位置，以及冲突检测如何剪枝。' },
      { type: 'table', table: { headers: ['n', '解的数量'], rows: [['4', '2'], ['8', '92']] } },
    ],
    approach: `**按行搜索**：第 row 行只放一个皇后。

**合法性检查**：
1. 当前列是否已有皇后
2. 左上到右下对角线是否冲突
3. 右上到左下对角线是否冲突

**回溯意义**：若这一行某列能放，就暂时放下；若后续行无法继续，就撤销当前皇后并尝试下一列。`,
    complexity: { time: '最坏 O(n!)，剪枝后显著减少', space: 'O(n)' },
    animation: { type: 'backtracking', algorithm: 'n-queens', n: 4 },
    codes: backtrackingCodes('n-queens'),
  }
}

function generateParentheses(): AlgorithmContent {
  return {
    title: '括号生成',
    description: [
      { type: 'text', content: '生成 n 对括号的所有合法组合。回溯的关键不是暴力放括号，而是随时维护“左括号用了多少个、右括号用了多少个”。' },
      { type: 'table', table: { headers: ['n', '输出示例'], rows: [['3', '((()))、(()())、(())() ...']] } },
    ],
    approach: `**约束条件**：
1. 左括号数量不能超过 n
2. 任意前缀中，右括号数量不能超过左括号数量

第二条就是合法括号串的本质剪枝条件。`,
    complexity: { time: '与卡特兰数相关', space: 'O(n)' },
    animation: { type: 'backtracking', algorithm: 'generate-parentheses', n: 3 },
    codes: backtrackingCodes('generate-parentheses'),
  }
}

function combinationSum(): AlgorithmContent {
  return {
    title: '组合总和',
    description: [
      { type: 'text', content: '给定一组候选数和目标值 target，允许同一个数重复选择，找出所有和为 target 的组合。关键是理解“当前和”“下一次从哪个位置继续选”与“剪枝”的关系。' },
      { type: 'table', table: { headers: ['候选', 'target', '答案示例'], rows: [['[2,3,6,7]', '7', '[2,2,3], [7]']] } },
    ],
    approach: `**状态**：path 表示当前组合，sum 表示当前和，start 表示下一次可选起点。

**为什么传 start？**
因为组合不区分顺序，固定从当前位置及以后继续选，可以避免 [2,3] 和 [3,2] 这种重复。

**剪枝**：若 sum 已经超过 target，就立即返回，不再继续向下搜索。`,
    complexity: { time: '与解空间大小相关', space: 'O(target / min(c))' },
    animation: { type: 'backtracking', algorithm: 'combination-sum', nums: [2, 3, 6, 7], target: 7 },
    codes: backtrackingCodes('combination-sum'),
  }
}

function backtrackingCodes(kind: 'permutations' | 'subsets' | 'combinations' | 'n-queens' | 'generate-parentheses' | 'combination-sum'): CodeEntry[] {
  const codes = {
    permutations: {
      C: `#include <stdio.h>\nint used[10], path[10];\nvoid dfs(int* nums, int n, int depth) {\n    if (depth == n) return;\n    for (int i = 0; i < n; i++) {\n        if (used[i]) continue;\n        used[i] = 1; path[depth] = nums[i];\n        dfs(nums, n, depth + 1);\n        used[i] = 0;\n    }\n}`,
      Python: `def permute(nums):\n    ans, path, used = [], [], [False] * len(nums)\n    def dfs():\n        if len(path) == len(nums):\n            ans.append(path[:]); return\n        for i, x in enumerate(nums):\n            if used[i]:\n                continue\n            used[i] = True; path.append(x)\n            dfs()\n            path.pop(); used[i] = False\n    dfs(); return ans`,
      JavaScript: `function permute(nums) {
  const ans = [];
  const path = [];
  const used = Array(nums.length).fill(false);

  function dfs() {
    if (path.length === nums.length) {
      ans.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      dfs();
      path.pop();
      used[i] = false;
    }
  }

  dfs();
  return ans;
}`,
      TypeScript: `function permute(nums: number[]): number[][] {
  const ans: number[][] = [];
  const path: number[] = [];
  const used = Array(nums.length).fill(false);

  function dfs(): void {
    if (path.length === nums.length) {
      ans.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      dfs();
      path.pop();
      used[i] = false;
    }
  }

  dfs();
  return ans;
}`,
      Java: `import java.util.*;

class Permutations {
    List<List<Integer>> ans = new ArrayList<>();
    List<Integer> path = new ArrayList<>();
    boolean[] used;

    void dfs(int[] nums) {
        if (path.size() == nums.length) {
            ans.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            dfs(nums);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}`,
    },
    subsets: {
      C: `void dfs(int* nums, int n, int idx, int* path, int size) {
    if (idx == n) {
        return;
    }

    dfs(nums, n, idx + 1, path, size);

    path[size] = nums[idx];
    dfs(nums, n, idx + 1, path, size + 1);
}`,
      Python: `def subsets(nums):\n    ans, path = [], []\n    def dfs(i):\n        if i == len(nums):\n            ans.append(path[:]); return\n        dfs(i + 1)\n        path.append(nums[i]); dfs(i + 1); path.pop()\n    dfs(0); return ans`,
      JavaScript: `function subsets(nums) {
  const ans = [];
  const path = [];

  function dfs(i) {
    if (i === nums.length) {
      ans.push([...path]);
      return;
    }
    dfs(i + 1);
    path.push(nums[i]);
    dfs(i + 1);
    path.pop();
  }

  dfs(0);
  return ans;
}`,
      TypeScript: `function subsets(nums: number[]): number[][] {
  const ans: number[][] = [];
  const path: number[] = [];

  function dfs(i: number): void {
    if (i === nums.length) {
      ans.push([...path]);
      return;
    }
    dfs(i + 1);
    path.push(nums[i]);
    dfs(i + 1);
    path.pop();
  }

  dfs(0);
  return ans;
}`,
      Java: `import java.util.*;

class Subsets {
    List<List<Integer>> ans = new ArrayList<>();
    List<Integer> path = new ArrayList<>();

    void dfs(int[] nums, int i) {
        if (i == nums.length) {
            ans.add(new ArrayList<>(path));
            return;
        }
        dfs(nums, i + 1);
        path.add(nums[i]);
        dfs(nums, i + 1);
        path.remove(path.size() - 1);
    }
}`,
    },
    combinations: {
      C: `void dfs(int n, int k, int start, int* path, int depth) {
    if (depth == k) {
        return;
    }
    for (int x = start; x <= n; x++) {
        path[depth] = x;
        dfs(n, k, x + 1, path, depth + 1);
    }
}`,
      Python: `def combine(n, k):\n    ans, path = [], []\n    def dfs(start):\n        if len(path) == k:\n            ans.append(path[:]); return\n        for x in range(start, n + 1):\n            path.append(x); dfs(x + 1); path.pop()\n    dfs(1); return ans`,
      JavaScript: `function combine(n, k) {
  const ans = [];
  const path = [];

  function dfs(start) {
    if (path.length === k) {
      ans.push([...path]);
      return;
    }
    for (let x = start; x <= n; x++) {
      path.push(x);
      dfs(x + 1);
      path.pop();
    }
  }

  dfs(1);
  return ans;
}`,
      TypeScript: `function combine(n: number, k: number): number[][] {
  const ans: number[][] = [];
  const path: number[] = [];

  function dfs(start: number): void {
    if (path.length === k) {
      ans.push([...path]);
      return;
    }
    for (let x = start; x <= n; x++) {
      path.push(x);
      dfs(x + 1);
      path.pop();
    }
  }

  dfs(1);
  return ans;
}`,
      Java: `import java.util.*;

class Combine {
    List<List<Integer>> ans = new ArrayList<>();
    List<Integer> path = new ArrayList<>();

    void dfs(int n, int k, int start) {
        if (path.size() == k) {
            ans.add(new ArrayList<>(path));
            return;
        }
        for (int x = start; x <= n; x++) {
            path.add(x);
            dfs(n, k, x + 1);
            path.remove(path.size() - 1);
        }
    }
}`,
    },
    'n-queens': {
      C: `int col[20], diag1[40], diag2[40], pos[20];\nvoid dfs(int n, int row) { if (row == n) return; for (int c = 0; c < n; c++) { if (col[c] || diag1[row - c + n] || diag2[row + c]) continue; col[c] = diag1[row - c + n] = diag2[row + c] = 1; pos[row] = c; dfs(n, row + 1); col[c] = diag1[row - c + n] = diag2[row + c] = 0; } }`,
      Python: `def solve_n_queens(n):\n    ans, cols, d1, d2 = [], set(), set(), set(); board = [-1] * n\n    def dfs(r):\n        if r == n: ans.append(board[:]); return\n        for c in range(n):\n            if c in cols or r - c in d1 or r + c in d2: continue\n            cols.add(c); d1.add(r - c); d2.add(r + c); board[r] = c\n            dfs(r + 1)\n            cols.remove(c); d1.remove(r - c); d2.remove(r + c)\n    dfs(0); return ans`,
      JavaScript: `function solveNQueens(n) {
  const ans = [];
  const cols = new Set();
  const d1 = new Set();
  const d2 = new Set();
  const board = Array(n).fill(-1);

  function dfs(r) {
    if (r === n) {
      ans.push([...board]);
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
      cols.add(c);
      d1.add(r - c);
      d2.add(r + c);
      board[r] = c;
      dfs(r + 1);
      cols.delete(c);
      d1.delete(r - c);
      d2.delete(r + c);
    }
  }

  dfs(0);
  return ans;
}`,
      TypeScript: `function solveNQueens(n: number): number[][] {
  const ans: number[][] = [];
  const cols = new Set<number>();
  const d1 = new Set<number>();
  const d2 = new Set<number>();
  const board = Array(n).fill(-1);

  function dfs(r: number): void {
    if (r === n) {
      ans.push([...board]);
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
      cols.add(c);
      d1.add(r - c);
      d2.add(r + c);
      board[r] = c;
      dfs(r + 1);
      cols.delete(c);
      d1.delete(r - c);
      d2.delete(r + c);
    }
  }

  dfs(0);
  return ans;
}`,
      Java: `import java.util.*;

class NQueens {
    List<int[]> ans = new ArrayList<>();
    Set<Integer> cols = new HashSet<>();
    Set<Integer> d1 = new HashSet<>();
    Set<Integer> d2 = new HashSet<>();
    int[] board;

    void dfs(int n, int r) {
        if (r == n) {
            ans.add(board.clone());
            return;
        }
        for (int c = 0; c < n; c++) {
            if (cols.contains(c) || d1.contains(r - c) || d2.contains(r + c)) continue;
            cols.add(c);
            d1.add(r - c);
            d2.add(r + c);
            board[r] = c;
            dfs(n, r + 1);
            cols.remove(c);
            d1.remove(r - c);
            d2.remove(r + c);
        }
    }
}`,
    },
    'generate-parentheses': {
      C: `void dfs(int n, int open, int close) { if (open == n && close == n) return; if (open < n) dfs(n, open + 1, close); if (close < open) dfs(n, open, close + 1); }`,
      Python: `def generate_parenthesis(n):\n    ans = []\n    def dfs(path, open_cnt, close_cnt):\n        if open_cnt == n and close_cnt == n:\n            ans.append(path); return\n        if open_cnt < n: dfs(path + '(', open_cnt + 1, close_cnt)\n        if close_cnt < open_cnt: dfs(path + ')', open_cnt, close_cnt + 1)\n    dfs('', 0, 0); return ans`,
      JavaScript: `function generateParenthesis(n) {
  const ans = [];

  function dfs(path, openCnt, closeCnt) {
    if (openCnt === n && closeCnt === n) {
      ans.push(path);
      return;
    }
    if (openCnt < n) {
      dfs(path + '(', openCnt + 1, closeCnt);
    }
    if (closeCnt < openCnt) {
      dfs(path + ')', openCnt, closeCnt + 1);
    }
  }

  dfs('', 0, 0);
  return ans;
}`,
      TypeScript: `function generateParenthesis(n: number): string[] {
  const ans: string[] = [];

  function dfs(path: string, openCnt: number, closeCnt: number): void {
    if (openCnt === n && closeCnt === n) {
      ans.push(path);
      return;
    }
    if (openCnt < n) {
      dfs(path + '(', openCnt + 1, closeCnt);
    }
    if (closeCnt < openCnt) {
      dfs(path + ')', openCnt, closeCnt + 1);
    }
  }

  dfs('', 0, 0);
  return ans;
}`,
      Java: `import java.util.*;

class Parentheses {
    List<String> ans = new ArrayList<>();

    void dfs(String path, int n, int open, int close) {
        if (open == n && close == n) {
            ans.add(path);
            return;
        }
        if (open < n) {
            dfs(path + "(", n, open + 1, close);
        }
        if (close < open) {
            dfs(path + ")", n, open, close + 1);
        }
    }
}`,
    },
    'combination-sum': {
      C: `void dfs(int* a, int n, int start, int target, int depth) { if (target == 0) return; for (int i = start; i < n; i++) { if (a[i] > target) continue; dfs(a, n, i, target - a[i], depth + 1); } }`,
      Python: `def combination_sum(candidates, target):\n    ans, path = [], []\n    def dfs(start, remain):\n        if remain == 0:\n            ans.append(path[:]); return\n        for i in range(start, len(candidates)):\n            x = candidates[i]\n            if x > remain: continue\n            path.append(x); dfs(i, remain - x); path.pop()\n    dfs(0, target); return ans`,
      JavaScript: `function combinationSum(candidates, target) {
  const ans = [];
  const path = [];

  function dfs(start, remain) {
    if (remain === 0) {
      ans.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      const x = candidates[i];
      if (x > remain) continue;
      path.push(x);
      dfs(i, remain - x);
      path.pop();
    }
  }

  dfs(0, target);
  return ans;
}`,
      TypeScript: `function combinationSum(candidates: number[], target: number): number[][] {
  const ans: number[][] = [];
  const path: number[] = [];

  function dfs(start: number, remain: number): void {
    if (remain === 0) {
      ans.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      const x = candidates[i];
      if (x > remain) continue;
      path.push(x);
      dfs(i, remain - x);
      path.pop();
    }
  }

  dfs(0, target);
  return ans;
}`,
      Java: `import java.util.*;

class CombinationSum {
    List<List<Integer>> ans = new ArrayList<>();
    List<Integer> path = new ArrayList<>();

    void dfs(int[] a, int start, int remain) {
        if (remain == 0) {
            ans.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < a.length; i++) {
            if (a[i] > remain) continue;
            path.add(a[i]);
            dfs(a, i, remain - a[i]);
            path.remove(path.size() - 1);
        }
    }
}`,
    },
  } as const

  return [
    { lang: 'C', code: codes[kind].C },
    { lang: 'Python', code: codes[kind].Python },
    { lang: 'JavaScript', code: codes[kind].JavaScript },
    { lang: 'TypeScript', code: codes[kind].TypeScript },
    { lang: 'Java', code: codes[kind].Java },
  ]
}
