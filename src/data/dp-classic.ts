import type { AlgorithmNode, AlgorithmContent } from './algorithms'

// ==================== 线性 DP ====================
export function dpLinear(): AlgorithmNode[] {
  return [
    { id: 'dp-climbing', label: '爬楼梯', content: climbingStairs() },
    { id: 'dp-robber', label: '打家劫舍', content: houseRobber() },
  ]
}

// ==================== 序列与字符串 ====================
export function dpSequence(): AlgorithmNode[] {
  return [
    { id: 'dp-lis', label: '最长递增子序列', content: lis() },
    { id: 'dp-lcs', label: '最长公共子序列', content: lcs() },
    { id: 'dp-edit', label: '编辑距离', content: editDistance() },
    { id: 'dp-kmp', label: 'KMP 字符串匹配', content: kmp() },
    { id: 'dp-rabin-karp', label: 'Rabin-Karp', content: rabinKarp() },
  ]
}

// ==================== 区间 DP ====================
export function dpInterval(): AlgorithmNode[] {
  return [
    { id: 'dp-matrix-chain', label: '矩阵链乘法', content: matrixChain() },
  ]
}

// ==================== 计数 DP ====================
export function dpCounting(): AlgorithmNode[] {
  return [
    { id: 'dp-coin', label: '零钱兑换', content: coinChange() },
    { id: 'dp-perfect-sq', label: '完全平方数', content: perfectSquares() },
  ]
}

// ==================== 爬楼梯 ====================
function climbingStairs(): AlgorithmContent {
  return {
    title: '爬楼梯', description: [{ type: 'text', content: '有 n 阶楼梯，每次爬 1 或 2 阶，求方案数。本质是斐波那契数列。' }],
    approach: `**dp[i] = dp[i-1] + dp[i-2]**\n到第 i 阶 = 从 i-1 跨 1 步 + 从 i-2 跨 2 步。\n初始 dp[0]=1, dp[1]=1。`,
    complexity: { time: 'O(n)', space: 'O(1)' },
    animation: { type: 'dp-classic', algorithm: 'climbing-stairs', n: 10 },
    codes: [
      { lang: 'C', code: `int climbStairs(int n) {\n    if (n<=2) return n;\n    int a=1,b=2;\n    for (int i=3;i<=n;i++){int c=a+b;a=b;b=c;}\n    return b;\n}` },
      { lang: 'Python', code: `def climb(n):\n    if n<=2: return n\n    a,b=1,2\n    for _ in range(3,n+1): a,b=b,a+b\n    return b` },
      { lang: 'JavaScript', code: `function climb(n) {
  if (n <= 2) return n;

  let a = 1;
  let b = 2;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}` },
      { lang: 'TypeScript', code: `function climb(n:number):number{if(n<=2)return n;let a=1,b=2;for(let i=3;i<=n;i++)[a,b]=[b,a+b];return b;}` },
      { lang: 'Java', code: `public static int climb(int n){if(n<=2)return n;int a=1,b=2;for(int i=3;i<=n;i++){int c=a+b;a=b;b=c;}return b;}` },
    ],
  }
}

// ==================== 打家劫舍 ====================
function houseRobber(): AlgorithmContent {
  return {
    title: '打家劫舍',
    description: [
      { type: 'text', content: '一排房屋，每间有不同金额。相邻房屋不能同时偷。求能偷到的最大金额。' },
      { type: 'text', content: '例如 [2,7,9,3,1] → 选 2+9+1=12。' },
    ],
    approach: `**dp[i] = max(dp[i-1], dp[i-2] + nums[i])**\n- 不偷第 i 间 → dp[i-1]\n- 偷第 i 间 → dp[i-2] + nums[i]（跳过相邻的 i-1）\n取较大值。`,
    complexity: { time: 'O(n)', space: 'O(1)' },
    animation: { type: 'dp-classic', algorithm: 'house-robber', sequence: [2, 7, 9, 3, 1] },
    codes: [
      { lang: 'C', code: `int rob(int nums[], int n) {\n    if (n == 0) return 0;\n    if (n == 1) return nums[0];\n\n    int a = nums[0];\n    int b = nums[0] > nums[1] ? nums[0] : nums[1];\n\n    for (int i = 2; i < n; i++) {\n        int c = b > (a + nums[i]) ? b : (a + nums[i]);\n        a = b;\n        b = c;\n    }\n    return b;\n}` },
      { lang: 'Python', code: `def rob(nums):\n    if len(nums)<=1: return nums[0] if nums else 0\n    a,b=nums[0],max(nums[0],nums[1])\n    for i in range(2,len(nums)):\n        a,b=b,max(b,a+nums[i])\n    return b\n\nprint(rob([2,7,9,3,1]))  # 12` },
      { lang: 'JavaScript', code: `function rob(nums) {\n  if (nums.length <= 1) return nums[0] || 0;\n\n  let a = nums[0];\n  let b = Math.max(nums[0], nums[1]);\n\n  for (let i = 2; i < nums.length; i++) {\n    const next = Math.max(b, a + nums[i]);\n    a = b;\n    b = next;\n  }\n  return b;\n}` },
      { lang: 'TypeScript', code: `function rob(nums: number[]): number {\n  if (nums.length <= 1) return nums[0] || 0;\n\n  let a = nums[0];\n  let b = Math.max(nums[0], nums[1]);\n\n  for (let i = 2; i < nums.length; i++) {\n    const next = Math.max(b, a + nums[i]);\n    a = b;\n    b = next;\n  }\n  return b;\n}` },
      { lang: 'Java', code: `public static int rob(int[] nums){\n    if(nums.length<=1)return nums.length==0?0:nums[0];\n    int a=nums[0],b=Math.max(nums[0],nums[1]);\n    for(int i=2;i<nums.length;i++){int c=Math.max(b,a+nums[i]);a=b;b=c;}\n    return b;\n}` },
    ],
  }
}

// ==================== LIS ====================
function lis(): AlgorithmContent {
  return {
    title: '最长递增子序列 (LIS)',
    description: [{ type: 'text', content: '给定整数数组，找最长严格递增子序列长度（不要求连续）。\n例如 [10,9,2,5,3,7,101,18] → LIS=[2,3,7,101]，长度 4。' }],
    approach: `**O(n²) DP**：dp[i] = 以 arr[i] 结尾的 LIS 长度\ndp[i] = max(dp[j]+1)，j<i 且 arr[j]<arr[i]\n\n**O(n log n) 贪心+二分**：维护 tails 数组，二分查找替换位置。`,
    complexity: { time: 'O(n²) / O(n log n)', space: 'O(n)' },
    animation: { type: 'dp-classic', algorithm: 'lis', sequence: [10, 9, 2, 5, 3, 7, 101, 18] },
    codes: [
      { lang: 'C', code: `int lis(int a[],int n){int dp[n],mx=1;for(int i=0;i<n;i++)dp[i]=1;\n    for(int i=1;i<n;i++)for(int j=0;j<i;j++)if(a[j]<a[i]&&dp[j]+1>dp[i])dp[i]=dp[j]+1;\n    for(int i=0;i<n;i++)if(dp[i]>mx)mx=dp[i];return mx;}` },
      { lang: 'Python', code: `def lis(arr):\n    dp=[1]*len(arr)\n    for i in range(1,len(arr)):\n        for j in range(i):\n            if arr[j]<arr[i]: dp[i]=max(dp[i],dp[j]+1)\n    return max(dp)\nprint(lis([10,9,2,5,3,7,101,18]))  # 4` },
      { lang: 'JavaScript', code: `function lis(arr) {\n  const dp = Array(arr.length).fill(1);\n\n  for (let i = 1; i < arr.length; i++) {\n    for (let j = 0; j < i; j++) {\n      if (arr[j] < arr[i]) {\n        dp[i] = Math.max(dp[i], dp[j] + 1);\n      }\n    }\n  }\n  return Math.max(...dp);\n}` },
      { lang: 'TypeScript', code: `function lis(arr: number[]): number {\n  const dp = Array(arr.length).fill(1);\n\n  for (let i = 1; i < arr.length; i++) {\n    for (let j = 0; j < i; j++) {\n      if (arr[j] < arr[i]) {\n        dp[i] = Math.max(dp[i], dp[j] + 1);\n      }\n    }\n  }\n  return Math.max(...dp);\n}` },
      { lang: 'Java', code: `public static int lis(int[] a){int n=a.length;int[] dp=new int[n];Arrays.fill(dp,1);int mx=1;\n    for(int i=1;i<n;i++)for(int j=0;j<i;j++)if(a[j]<a[i])dp[i]=Math.max(dp[i],dp[j]+1);\n    for(int v:dp)mx=Math.max(mx,v);return mx;}` },
    ],
  }
}

// ==================== LCS ====================
function lcs(): AlgorithmContent {
  return {
    title: '最长公共子序列 (LCS)',
    description: [{ type: 'text', content: '两个字符串的最长公共子序列长度。子序列不要求连续但要保持顺序。\n"ABCBDAB" 和 "BDCAB" → LCS="BCAB"，长度 4。' }],
    approach: `**dp[i][j] = str1 前 i 个与 str2 前 j 个的 LCS 长度**\n- str1[i-1]==str2[j-1] → dp[i-1][j-1]+1\n- 否则 → max(dp[i-1][j], dp[i][j-1])`,
    complexity: { time: 'O(m*n)', space: 'O(m*n)' },
    animation: { type: 'dp-classic', algorithm: 'lcs', str1: 'ABCBDAB', str2: 'BDCAB' },
    codes: [
      { lang: 'C', code: `int lcs(char*a,char*b,int m,int n){int dp[m+1][n+1];\n    for(int i=0;i<=m;i++)dp[i][0]=0;for(int j=0;j<=n;j++)dp[0][j]=0;\n    for(int i=1;i<=m;i++)for(int j=1;j<=n;j++)\n        dp[i][j]=a[i-1]==b[j-1]?dp[i-1][j-1]+1:(dp[i-1][j]>dp[i][j-1]?dp[i-1][j]:dp[i][j-1]);\n    return dp[m][n];}` },
      { lang: 'Python', code: `def lcs(a,b):\n    m,n=len(a),len(b)\n    dp=[[0]*(n+1) for _ in range(m+1)]\n    for i in range(1,m+1):\n        for j in range(1,n+1):\n            dp[i][j]=dp[i-1][j-1]+1 if a[i-1]==b[j-1] else max(dp[i-1][j],dp[i][j-1])\n    return dp[m][n]\nprint(lcs("ABCBDAB","BDCAB"))` },
      { lang: 'JavaScript', code: `function lcs(a,b){const m=a.length,n=b.length,dp=Array.from({length:m+1},()=>Array(n+1).fill(0));\n  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);\n  return dp[m][n];}` },
      { lang: 'TypeScript', code: `function lcs(a:string,b:string):number{const m=a.length,n=b.length,dp=Array.from({length:m+1},()=>Array(n+1).fill(0));\n  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);\n  return dp[m][n];}` },
      { lang: 'Java', code: `public static int lcs(String a,String b){int m=a.length(),n=b.length();int[][]dp=new int[m+1][n+1];\n    for(int i=1;i<=m;i++)for(int j=1;j<=n;j++)dp[i][j]=a.charAt(i-1)==b.charAt(j-1)?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);\n    return dp[m][n];}` },
    ],
  }
}

// ==================== 编辑距离 ====================
function editDistance(): AlgorithmContent {
  return {
    title: '编辑距离',
    description: [{ type: 'text', content: 'str1 变成 str2 的最少操作次数（插入/删除/替换）。\n"horse"→"ros" = 3 步。' }],
    approach: `**dp[i][j] = str1 前 i 个变成 str2 前 j 个的最少操作**\n- 相等 → dp[i-1][j-1]\n- 不等 → 1+min(dp[i-1][j]删, dp[i][j-1]插, dp[i-1][j-1]替)`,
    complexity: { time: 'O(m*n)', space: 'O(m*n)' },
    animation: { type: 'dp-classic', algorithm: 'edit-distance', str1: 'horse', str2: 'ros' },
    codes: [
      { lang: 'C', code: `int min3(int a,int b,int c){return a<b?(a<c?a:c):(b<c?b:c);}\nint edit(char*a,char*b,int m,int n){int dp[m+1][n+1];\n    for(int i=0;i<=m;i++)dp[i][0]=i;for(int j=0;j<=n;j++)dp[0][j]=j;\n    for(int i=1;i<=m;i++)for(int j=1;j<=n;j++)\n        dp[i][j]=a[i-1]==b[j-1]?dp[i-1][j-1]:1+min3(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);\n    return dp[m][n];}` },
      { lang: 'Python', code: `def edit(a,b):\n    m,n=len(a),len(b)\n    dp=[[0]*(n+1) for _ in range(m+1)]\n    for i in range(m+1): dp[i][0]=i\n    for j in range(n+1): dp[0][j]=j\n    for i in range(1,m+1):\n        for j in range(1,n+1):\n            dp[i][j]=dp[i-1][j-1] if a[i-1]==b[j-1] else 1+min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])\n    return dp[m][n]\nprint(edit("horse","ros"))  # 3` },
      { lang: 'JavaScript', code: `function edit(a,b){const m=a.length,n=b.length,dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));\n  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);\n  return dp[m][n];}` },
      { lang: 'TypeScript', code: `function edit(a:string,b:string):number{const m=a.length,n=b.length,dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));\n  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);\n  return dp[m][n];}` },
      { lang: 'Java', code: `public static int edit(String a,String b){int m=a.length(),n=b.length();int[][]dp=new int[m+1][n+1];\n    for(int i=0;i<=m;i++)dp[i][0]=i;for(int j=0;j<=n;j++)dp[0][j]=j;\n    for(int i=1;i<=m;i++)for(int j=1;j<=n;j++)dp[i][j]=a.charAt(i-1)==b.charAt(j-1)?dp[i-1][j-1]:1+Math.min(dp[i-1][j],Math.min(dp[i][j-1],dp[i-1][j-1]));\n    return dp[m][n];}` },
    ],
  }
}

// ==================== KMP ====================
function kmp(): AlgorithmContent {
  return {
    title: 'KMP 字符串匹配',
    description: [
      { type: 'text', content: 'KMP 算法利用「部分匹配表」（next 数组 / 前缀函数）避免回溯，在 O(n+m) 时间内完成字符串匹配。' },
      { type: 'text', content: '核心思想：当匹配失败时，利用已匹配部分的前后缀信息，跳过不可能匹配的位置。' },
    ],
    approach: `**第一步：构建 next 数组**\nnext[i] = pattern[0..i] 的最长相等前后缀长度。\n用双指针递推构建，O(m) 时间。\n\n**第二步：匹配**\n双指针 i（text）、j（pattern）同时前进：\n- text[i]==pattern[j] → 都前进\n- 不匹配 → j 回退到 next[j-1]（不回退 i！）\n- j 到达 pattern 末尾 → 匹配成功`,
    complexity: { time: 'O(n+m)', space: 'O(m)' },
    animation: { type: 'dp-classic', algorithm: 'kmp', text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <string.h>

// 构建 next 数组（前缀函数）
void buildNext(char *p, int m, int next[]) {
    next[0] = 0;
    int len = 0, i = 1;
    while (i < m) {
        if (p[i] == p[len]) { len++; next[i++] = len; }
        else if (len) len = next[len - 1];
        else next[i++] = 0;
    }
}

// KMP 匹配
int kmp(char *text, char *pat) {
    int n = strlen(text), m = strlen(pat);
    int next[m];
    buildNext(pat, m, next);
    int i = 0, j = 0;
    while (i < n) {
        if (text[i] == pat[j]) { i++; j++; }
        else if (j) j = next[j - 1];  // 不回退 i
        else i++;
        if (j == m) return i - m;  // 匹配成功
    }
    return -1;
}` },
      { lang: 'Python', code: `def kmp(text: str, pattern: str) -> int:
    # 构建 next 数组
    m = len(pattern)
    nxt = [0] * m
    length, i = 0, 1
    while i < m:
        if pattern[i] == pattern[length]:
            length += 1; nxt[i] = length; i += 1
        elif length: length = nxt[length - 1]
        else: nxt[i] = 0; i += 1
    # 匹配
    i = j = 0
    while i < len(text):
        if text[i] == pattern[j]: i += 1; j += 1
        elif j: j = nxt[j - 1]
        else: i += 1
        if j == m: return i - m
    return -1

print(kmp("ABABDABACDABABCABAB", "ABABCABAB"))  # 9` },
      { lang: 'JavaScript', code: `function kmp(text, pattern) {
  const m = pattern.length, nxt = [0];
  let len = 0, i = 1;
  while (i < m) {
    if (pattern[i]===pattern[len]) { len++; nxt[i++]=len; }
    else if (len) len = nxt[len-1];
    else nxt[i++] = 0;
  }
  i = 0; let j = 0;
  while (i < text.length) {
    if (text[i]===pattern[j]) { i++; j++; }
    else if (j) j = nxt[j-1];
    else i++;
    if (j===m) return i-m;
  }
  return -1;
}
console.log(kmp("ABABDABACDABABCABAB","ABABCABAB")); // 9` },
      { lang: 'TypeScript', code: `function kmp(text:string, pattern:string):number {
  const m=pattern.length, nxt=[0];
  let len=0, i=1;
  while(i<m){if(pattern[i]===pattern[len]){len++;nxt[i++]=len;}else if(len)len=nxt[len-1];else nxt[i++]=0;}
  i=0;let j=0;
  while(i<text.length){if(text[i]===pattern[j]){i++;j++;}else if(j)j=nxt[j-1];else i++;if(j===m)return i-m;}
  return -1;
}` },
      { lang: 'Java', code: `public class KMP {
    public static int kmp(String text, String pat) {
        int m = pat.length();
        int[] nxt = new int[m];
        int len = 0, i = 1;
        while (i < m) {
            if (pat.charAt(i)==pat.charAt(len)) { len++; nxt[i++]=len; }
            else if (len>0) len = nxt[len-1];
            else nxt[i++] = 0;
        }
        i = 0; int j = 0;
        while (i < text.length()) {
            if (text.charAt(i)==pat.charAt(j)) { i++; j++; }
            else if (j>0) j = nxt[j-1];
            else i++;
            if (j==m) return i-m;
        }
        return -1;
    }
}` },
    ],
  }
}

// ==================== Rabin-Karp ====================
function rabinKarp(): AlgorithmContent {
  return {
    title: 'Rabin-Karp 字符串匹配',
    description: [
      { type: 'text', content: 'Rabin-Karp 用「滚动哈希」进行字符串匹配：先算 pattern 的哈希值，然后在 text 上滑动窗口，O(1) 更新窗口哈希值进行比较。' },
      { type: 'text', content: '哈希冲突时需逐字符验证。适合多模式匹配（同时搜索多个 pattern）。' },
    ],
    approach: `**哈希函数**：hash(s) = s[0]*d^(m-1) + s[1]*d^(m-2) + ... + s[m-1]\nd=进制（如 256），对大质数取模避免溢出。\n\n**滚动更新**：\n新hash = (旧hash - s[i]*d^(m-1)) * d + s[i+m]\n只需 O(1) 时间更新窗口哈希。\n\n**流程**：算 pattern 哈希 → 滑动窗口比较哈希 → 哈希相等时逐字符验证。`,
    complexity: { time: '平均 O(n+m)，最坏 O(nm)', space: 'O(1)' },
    animation: { type: 'dp-classic', algorithm: 'rabin-karp', text: 'ABCABDABCABC', pattern: 'ABCABC' },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <string.h>
#define D 256
#define Q 101  // 大质数

int rabinKarp(char *text, char *pat) {
    int n=strlen(text), m=strlen(pat);
    int h=1, pHash=0, tHash=0;
    for(int i=0;i<m-1;i++) h=(h*D)%Q;
    for(int i=0;i<m;i++){pHash=(D*pHash+pat[i])%Q; tHash=(D*tHash+text[i])%Q;}
    for(int i=0;i<=n-m;i++){
        if(pHash==tHash){
            int j; for(j=0;j<m;j++) if(text[i+j]!=pat[j]) break;
            if(j==m) return i;
        }
        if(i<n-m){
            tHash=(D*(tHash-text[i]*h)+text[i+m])%Q;
            if(tHash<0) tHash+=Q;
        }
    }
    return -1;
}` },
      { lang: 'Python', code: `def rabin_karp(text, pattern, d=256, q=101):
    n, m = len(text), len(pattern)
    h = pow(d, m-1, q)
    p_hash = t_hash = 0
    for i in range(m):
        p_hash = (d*p_hash + ord(pattern[i])) % q
        t_hash = (d*t_hash + ord(text[i])) % q
    for i in range(n - m + 1):
        if p_hash == t_hash and text[i:i+m] == pattern:
            return i
        if i < n - m:
            t_hash = (d*(t_hash - ord(text[i])*h) + ord(text[i+m])) % q
    return -1

print(rabin_karp("ABCABDABCABC", "ABCABC"))  # 6` },
      { lang: 'JavaScript', code: `function rabinKarp(text,pat,d=256,q=101){
  const n=text.length,m=pat.length;let h=1;
  for(let i=0;i<m-1;i++)h=(h*d)%q;
  let pH=0,tH=0;
  for(let i=0;i<m;i++){pH=(d*pH+pat.charCodeAt(i))%q;tH=(d*tH+text.charCodeAt(i))%q;}
  for(let i=0;i<=n-m;i++){
    if(pH===tH&&text.slice(i,i+m)===pat)return i;
    if(i<n-m)tH=(d*(tH-text.charCodeAt(i)*h)+text.charCodeAt(i+m))%q;
    if(tH<0)tH+=q;
  }
  return -1;
}
console.log(rabinKarp("ABCABDABCABC","ABCABC")); // 6` },
      { lang: 'TypeScript', code: `function rabinKarp(text:string,pat:string,d=256,q=101):number{\n  const n=text.length,m=pat.length;let h=1;\n  for(let i=0;i<m-1;i++)h=(h*d)%q;\n  let pH=0,tH=0;\n  for(let i=0;i<m;i++){pH=(d*pH+pat.charCodeAt(i))%q;tH=(d*tH+text.charCodeAt(i))%q;}\n  for(let i=0;i<=n-m;i++){if(pH===tH&&text.slice(i,i+m)===pat)return i;if(i<n-m)tH=(d*(tH-text.charCodeAt(i)*h)+text.charCodeAt(i+m))%q;if(tH<0)tH+=q;}\n  return -1;\n}` },
      { lang: 'Java', code: `public class RabinKarp {
    public static int search(String text,String pat){
        int d=256,q=101,n=text.length(),m=pat.length();
        int h=1;for(int i=0;i<m-1;i++)h=(h*d)%q;
        int pH=0,tH=0;
        for(int i=0;i<m;i++){pH=(d*pH+pat.charAt(i))%q;tH=(d*tH+text.charAt(i))%q;}
        for(int i=0;i<=n-m;i++){
            if(pH==tH&&text.substring(i,i+m).equals(pat))return i;
            if(i<n-m){tH=(d*(tH-text.charAt(i)*h)+text.charAt(i+m))%q;if(tH<0)tH+=q;}
        }
        return -1;
    }
}` },
    ],
  }
}

// ==================== 矩阵链乘法 ====================
function matrixChain(): AlgorithmContent {
  return {
    title: '矩阵链乘法',
    description: [
      { type: 'text', content: '给定 n 个矩阵的维度，求以怎样的顺序相乘使标量乘法次数最少。矩阵乘法满足结合律但不满足交换律，不同括号方案的计算量可以差几个数量级。' },
      { type: 'text', content: '例如维度 [30,35,15,5,10,20]（5 个矩阵），最优括号方案的乘法次数 = 15125。' },
    ],
    approach: `**区间 DP 经典**\n\n**dp[i][j] = 矩阵 i 到 j 相乘的最少乘法次数**\n\n**转移**：枚举分割点 k（i <= k < j）\ndp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j])\n\n**枚举顺序**：按区间长度从小到大。长度 1 时 dp[i][i]=0。`,
    complexity: { time: 'O(n³)', space: 'O(n²)' },
    animation: { type: 'dp-classic', algorithm: 'matrix-chain', matrices: [30, 35, 15, 5, 10, 20] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <limits.h>
int matrixChain(int p[], int n) {
    int dp[n][n];
    for(int i=0;i<n;i++) dp[i][i]=0;
    // 按区间长度枚举
    for(int len=2;len<n;len++)
        for(int i=1;i<=n-len;i++){
            int j=i+len-1; dp[i][j]=INT_MAX;
            for(int k=i;k<j;k++){
                int cost=dp[i][k]+dp[k+1][j]+p[i-1]*p[k]*p[j];
                if(cost<dp[i][j]) dp[i][j]=cost;
            }
        }
    return dp[1][n-1];
}
int main(){int p[]={30,35,15,5,10,20};printf("%d\\n",matrixChain(p,6));}` },
      { lang: 'Python', code: `def matrix_chain(p):
    n = len(p) - 1
    dp = [[0]*n for _ in range(n)]
    for length in range(2, n+1):       # 区间长度
        for i in range(n-length+1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):      # 分割点
                cost = dp[i][k] + dp[k+1][j] + p[i]*p[k+1]*p[j+1]
                dp[i][j] = min(dp[i][j], cost)
    return dp[0][n-1]

print(matrix_chain([30,35,15,5,10,20]))  # 15125` },
      { lang: 'JavaScript', code: `function matrixChain(p){
  const n=p.length-1,dp=Array.from({length:n},()=>Array(n).fill(0));
  for(let len=2;len<=n;len++)
    for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=Infinity;
      for(let k=i;k<j;k++)dp[i][j]=Math.min(dp[i][j],dp[i][k]+dp[k+1][j]+p[i]*p[k+1]*p[j+1]);}
  return dp[0][n-1];
}
console.log(matrixChain([30,35,15,5,10,20])); // 15125` },
      { lang: 'TypeScript', code: `function matrixChain(p:number[]):number{
  const n=p.length-1,dp=Array.from({length:n},()=>Array(n).fill(0));
  for(let len=2;len<=n;len++)
    for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=Infinity;
      for(let k=i;k<j;k++)dp[i][j]=Math.min(dp[i][j],dp[i][k]+dp[k+1][j]+p[i]*p[k+1]*p[j+1]);}
  return dp[0][n-1];
}` },
      { lang: 'Java', code: `public class MatrixChain {
    public static int solve(int[] p){int n=p.length-1;int[][]dp=new int[n][n];
        for(int len=2;len<=n;len++)for(int i=0;i<=n-len;i++){int j=i+len-1;dp[i][j]=Integer.MAX_VALUE;
            for(int k=i;k<j;k++)dp[i][j]=Math.min(dp[i][j],dp[i][k]+dp[k+1][j]+p[i]*p[k+1]*p[j+1]);}
        return dp[0][n-1];}
}` },
    ],
  }
}

// ==================== 零钱兑换 ====================
function coinChange(): AlgorithmContent {
  return {
    title: '零钱兑换',
    description: [
      { type: 'text', content: '给定硬币面额和总金额，求凑成该金额所需最少硬币数。每种硬币无限供应。' },
      { type: 'table', table: { headers: ['示例', '值'], rows: [['coins', '[1, 2, 5]'], ['amount', '11'], ['答案', '3 (5+5+1)']] } },
    ],
    approach: `**dp[i] = 凑成金额 i 的最少硬币数**\ndp[i] = min(dp[i], dp[i-coin]+1)，对每种 coin\n初始 dp[0]=0，其余=∞。正序遍历（完全背包）。`,
    complexity: { time: 'O(amount * coins)', space: 'O(amount)' },
    animation: { type: 'dp-classic', algorithm: 'coin-change', coins: [1, 2, 5], amount: 11 },
    codes: [
      { lang: 'C', code: `int coinChange(int coins[],int n,int amount){\n    int dp[amount+1];for(int i=0;i<=amount;i++)dp[i]=99999;dp[0]=0;\n    for(int i=0;i<n;i++)for(int j=coins[i];j<=amount;j++)\n        if(dp[j-coins[i]]+1<dp[j])dp[j]=dp[j-coins[i]]+1;\n    return dp[amount]>=99999?-1:dp[amount];\n}` },
      { lang: 'Python', code: `def coin_change(coins, amount):\n    dp=[float('inf')]*(amount+1); dp[0]=0\n    for coin in coins:\n        for j in range(coin,amount+1):\n            dp[j]=min(dp[j],dp[j-coin]+1)\n    return dp[amount] if dp[amount]!=float('inf') else -1\nprint(coin_change([1,2,5],11))  # 3` },
      { lang: 'JavaScript', code: `function coinChange(coins, amount) {\n  const dp = Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n\n  for (const c of coins) {\n    for (let j = c; j <= amount; j++) {\n      dp[j] = Math.min(dp[j], dp[j - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}` },
      { lang: 'TypeScript', code: `function coinChange(coins: number[], amount: number): number {\n  const dp = Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n\n  for (const c of coins) {\n    for (let j = c; j <= amount; j++) {\n      dp[j] = Math.min(dp[j], dp[j - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}` },
      { lang: 'Java', code: `public static int coinChange(int[]coins,int amount){int[]dp=new int[amount+1];Arrays.fill(dp,Integer.MAX_VALUE);dp[0]=0;\n    for(int c:coins)for(int j=c;j<=amount;j++)if(dp[j-c]!=Integer.MAX_VALUE)dp[j]=Math.min(dp[j],dp[j-c]+1);\n    return dp[amount]==Integer.MAX_VALUE?-1:dp[amount];}` },
    ],
  }
}

// ==================== 完全平方数 ====================
function perfectSquares(): AlgorithmContent {
  return {
    title: '完全平方数',
    description: [
      { type: 'text', content: '给定正整数 n，找到若干完全平方数（1,4,9,16,...）使得它们的和等于 n，求最少的完全平方数个数。' },
      { type: 'text', content: '例如 n=12 → 4+4+4=12，答案 3。n=13 → 4+9=13，答案 2。' },
    ],
    approach: `**本质是零钱兑换的变形**\n「硬币」= 所有不超过 n 的完全平方数 {1, 4, 9, 16, ...}\n「金额」= n\n\n**dp[i] = 凑成 i 的最少完全平方数个数**\ndp[i] = min(dp[i], dp[i-j²]+1)，j² <= i`,
    complexity: { time: 'O(n√n)', space: 'O(n)' },
    animation: { type: 'dp-classic', algorithm: 'perfect-squares', n: 13 },
    codes: [
      { lang: 'C', code: `int numSquares(int n){\n    int dp[n+1];for(int i=0;i<=n;i++)dp[i]=99999;dp[0]=0;\n    for(int i=1;i<=n;i++)\n        for(int j=1;j*j<=i;j++)\n            if(dp[i-j*j]+1<dp[i])dp[i]=dp[i-j*j]+1;\n    return dp[n];\n}` },
      { lang: 'Python', code: `def num_squares(n):\n    dp=[float('inf')]*(n+1); dp[0]=0\n    for i in range(1,n+1):\n        j=1\n        while j*j<=i:\n            dp[i]=min(dp[i],dp[i-j*j]+1)\n            j+=1\n    return dp[n]\nprint(num_squares(13))  # 2` },
      { lang: 'JavaScript', code: `function numSquares(n){const dp=Array(n+1).fill(Infinity);dp[0]=0;\n  for(let i=1;i<=n;i++)for(let j=1;j*j<=i;j++)dp[i]=Math.min(dp[i],dp[i-j*j]+1);\n  return dp[n];}` },
      { lang: 'TypeScript', code: `function numSquares(n:number):number{const dp=Array(n+1).fill(Infinity);dp[0]=0;\n  for(let i=1;i<=n;i++)for(let j=1;j*j<=i;j++)dp[i]=Math.min(dp[i],dp[i-j*j]+1);\n  return dp[n];}` },
      { lang: 'Java', code: `public static int numSquares(int n){int[]dp=new int[n+1];Arrays.fill(dp,Integer.MAX_VALUE);dp[0]=0;\n    for(int i=1;i<=n;i++)for(int j=1;j*j<=i;j++)dp[i]=Math.min(dp[i],dp[i-j*j]+1);\n    return dp[n];}` },
    ],
  }
}
