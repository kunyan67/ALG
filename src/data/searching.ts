import type { AlgorithmNode, AlgorithmContent } from './algorithms'

export function searchAlgorithms(): AlgorithmNode[] {
  return [
    {
      id: 'linear-search',
      label: '线性查找',
      children: [
        { id: 'search-sequential', label: '顺序查找', content: sequentialSearch() },
      ],
    },
    {
      id: 'ordered-search',
      label: '有序表查找',
      children: [
        { id: 'search-binary', label: '二分查找', content: binarySearch() },
        { id: 'search-interpolation', label: '插值查找', content: interpolationSearch() },
        { id: 'search-fibonacci', label: '斐波那契查找', content: fibonacciSearch() },
      ],
    },
    {
      id: 'hash-search',
      label: '散列查找',
      children: [
        { id: 'search-hash', label: '哈希查找', content: hashSearch() },
      ],
    },
  ]
}

// ==================== 顺序查找 ====================

function sequentialSearch(): AlgorithmContent {
  return {
    title: '顺序查找',
    description: [
      { type: 'text', content: '顺序查找是最简单的查找算法：从头到尾逐个比较，找到目标就返回，找不到就返回 -1。' },
      { type: 'text', content: '不要求数据有序，适用于任何线性结构。缺点是效率低，平均需要比较 n/2 次。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['前提条件', '无'], ['适用场景', '小规模数据、无序数据'], ['平均比较次数', 'n/2']] } },
    ],
    approach: `**流程**：
从数组第一个元素开始，逐个与目标值比较：
- 相等 → 找到了，返回索引
- 不等 → 继续下一个
- 遍历完 → 未找到，返回 -1

**优化（哨兵法）**：在数组末尾放一个「哨兵」等于目标值，省去每次循环的边界检查。`,
    complexity: { time: '最好 O(1)，平均 O(n)，最坏 O(n)', space: 'O(1)' },
    animation: { type: 'search', algorithm: 'sequential', data: [15, 27, 3, 42, 9, 67, 33, 8, 51, 76, 22, 44, 95, 18, 60, 84, 5, 39, 71, 28], target: 71 },
    codes: [
      { lang: 'C', code: `#include <stdio.h>

// 顺序查找：逐个比较
int sequentialSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target)
            return i;  // 找到，返回索引
    }
    return -1;  // 未找到
}

int main() {
    int arr[] = {15, 27, 3, 42, 9, 67, 33, 8};
    int idx = sequentialSearch(arr, 8, 67);
    printf("目标在位置: %d\\n", idx);
    return 0;
}` },
      { lang: 'Python', code: `def sequential_search(arr: list[int], target: int) -> int:
    """顺序查找：逐个比较"""
    for i, v in enumerate(arr):
        if v == target:
            return i  # 找到
    return -1  # 未找到

arr = [15, 27, 3, 42, 9, 67, 33, 8]
print(f"目标在位置: {sequential_search(arr, 67)}")` },
      { lang: 'JavaScript', code: `// 顺序查找：逐个比较
function sequentialSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

console.log("目标在位置:", sequentialSearch([15,27,3,42,9,67,33,8], 67));` },
      { lang: 'TypeScript', code: `function sequentialSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

console.log("目标在位置:", sequentialSearch([15,27,3,42,9,67,33,8], 67));` },
      { lang: 'Java', code: `public class SequentialSearch {
    public static int search(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }
    public static void main(String[] args) {
        int[] arr = {15, 27, 3, 42, 9, 67, 33, 8};
        System.out.println("目标在位置: " + search(arr, 67));
    }
}` },
    ],
  }
}

// ==================== 二分查找 ====================

function binarySearch(): AlgorithmContent {
  return {
    title: '二分查找',
    description: [
      { type: 'text', content: '二分查找是有序数组上效率最高的查找算法。每次将搜索范围缩小一半，O(log n) 时间内定位目标。' },
      { type: 'text', content: '前提条件：数组必须有序。这是所有有序查找算法的基础。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['前提条件', '数组有序'], ['适用场景', '大规模有序数据'], ['比较次数', 'O(log n)']] } },
    ],
    approach: `**核心思想**：每次比较中间元素，将搜索范围缩小一半。

**流程**：
1. 初始化 left=0, right=n-1
2. 计算 mid = left + (right - left) / 2（避免溢出）
3. 比较 arr[mid] 与 target：
   - arr[mid] == target → 找到
   - arr[mid] < target → 在右半部分，left = mid + 1
   - arr[mid] > target → 在左半部分，right = mid - 1
4. 当 left > right 时，未找到`,
    complexity: { time: 'O(log n)', space: 'O(1)' },
    animation: { type: 'search', algorithm: 'binary', data: [2, 5, 8, 12, 16, 19, 23, 28, 33, 38, 42, 47, 53, 56, 61, 67, 72, 78, 84, 91, 95, 99], target: 67 },
    codes: [
      { lang: 'C', code: `#include <stdio.h>

// 二分查找：每次缩小一半搜索范围
int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target)
            return mid;       // 找到
        else if (arr[mid] < target)
            left = mid + 1;   // 目标在右半
        else
            right = mid - 1;  // 目标在左半
    }
    return -1;
}

int main() {
    int arr[] = {2,5,8,12,16,23,38,56,72,91};
    printf("目标在位置: %d\\n", binarySearch(arr, 10, 23));
    return 0;
}` },
      { lang: 'Python', code: `def binary_search(arr: list[int], target: int) -> int:
    """二分查找：每次缩小一半搜索范围"""
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1   # 右半
        else:
            right = mid - 1  # 左半
    return -1

print(f"目标在位置: {binary_search([2,5,8,12,16,23,38,56,72,91], 23)}")` },
      { lang: 'JavaScript', code: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log("目标在位置:", binarySearch([2,5,8,12,16,23,38,56,72,91], 23));` },
      { lang: 'TypeScript', code: `function binarySearch(arr: number[], target: number): number {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log("目标在位置:", binarySearch([2,5,8,12,16,23,38,56,72,91], 23));` },
      { lang: 'Java', code: `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
    public static void main(String[] args) {
        int[] arr = {2,5,8,12,16,23,38,56,72,91};
        System.out.println("目标在位置: " + search(arr, 23));
    }
}` },
    ],
  }
}

// ==================== 插值查找 ====================

function interpolationSearch(): AlgorithmContent {
  return {
    title: '插值查找',
    description: [
      { type: 'text', content: '插值查找是二分查找的优化版。二分查找总是取中间点，而插值查找根据目标值在范围中的「比例位置」来预估查找点，类似于查字典时根据首字母翻到大概位置。' },
      { type: 'text', content: '当数据分布均匀时，插值查找平均只需 O(log log n) 次比较，远优于二分查找。但数据分布极端不均匀时可能退化到 O(n)。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['前提条件', '数组有序且分布较均匀'], ['适用场景', '均匀分布的大规模有序数据'], ['平均比较次数', 'O(log log n)']] } },
    ],
    approach: `**与二分查找的区别**：

二分：mid = left + (right - left) / 2
插值：mid = left + (target - arr[left]) / (arr[right] - arr[left]) * (right - left)

**直觉**：如果 target 接近 arr[left]，mid 就靠近 left；接近 arr[right] 就靠近 right。
相当于用线性插值估计 target 的位置。

**其他流程与二分完全一致**：比较 arr[mid] 与 target，缩小范围。`,
    complexity: { time: '均匀分布 O(log log n)，最坏 O(n)', space: 'O(1)' },
    animation: { type: 'search', algorithm: 'interpolation', data: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100], target: 90 },
    codes: [
      { lang: 'C', code: `#include <stdio.h>

// 插值查找：根据值的比例估算位置
int interpolationSearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right && target >= arr[left] && target <= arr[right]) {
        // 插值公式：按比例估算位置
        int mid = left + (long long)(target - arr[left])
                  * (right - left) / (arr[right] - arr[left]);
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    int arr[] = {10,20,30,40,50,60,70,80,90,100};
    printf("目标在位置: %d\\n", interpolationSearch(arr, 10, 70));
    return 0;
}` },
      { lang: 'Python', code: `def interpolation_search(arr: list[int], target: int) -> int:
    """插值查找：根据值的比例估算位置"""
    left, right = 0, len(arr) - 1
    while left <= right and target >= arr[left] and target <= arr[right]:
        # 插值公式
        mid = left + (target - arr[left]) * (right - left) // (arr[right] - arr[left])
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

print(f"目标在位置: {interpolation_search([10,20,30,40,50,60,70,80,90,100], 70)}")` },
      { lang: 'JavaScript', code: `function interpolationSearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right && target >= arr[left] && target <= arr[right]) {
    // 插值公式：按比例估算位置
    const mid = left + Math.floor(
      (target - arr[left]) * (right - left) / (arr[right] - arr[left])
    );
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log("目标在位置:", interpolationSearch([10,20,30,40,50,60,70,80,90,100], 70));` },
      { lang: 'TypeScript', code: `function interpolationSearch(arr: number[], target: number): number {
  let left = 0, right = arr.length - 1;
  while (left <= right && target >= arr[left] && target <= arr[right]) {
    const mid = left + Math.floor(
      (target - arr[left]) * (right - left) / (arr[right] - arr[left])
    );
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log("目标在位置:", interpolationSearch([10,20,30,40,50,60,70,80,90,100], 70));` },
      { lang: 'Java', code: `public class InterpolationSearch {
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right && target >= arr[left] && target <= arr[right]) {
            int mid = left + (int)((long)(target - arr[left])
                      * (right - left) / (arr[right] - arr[left]));
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
    public static void main(String[] args) {
        int[] arr = {10,20,30,40,50,60,70,80,90,100};
        System.out.println("目标在位置: " + search(arr, 70));
    }
}` },
    ],
  }
}

// ==================== 斐波那契查找 ====================

function fibonacciSearch(): AlgorithmContent {
  return {
    title: '斐波那契查找',
    description: [
      { type: 'text', content: '斐波那契查找利用斐波那契数列的黄金分割特性来确定查找点。与二分查找的「二等分」不同，它按「黄金比例」约 0.618 来分割区间。' },
      { type: 'text', content: '优点是只需加减运算（无除法），在某些硬件上比二分更快。缺点是实现稍复杂，需要预计算斐波那契数列。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['前提条件', '数组有序'], ['适用场景', '有序数据，避免除法运算的场景'], ['比较次数', 'O(log n)']] } },
    ],
    approach: `**核心思想**：用斐波那契数 F(k) 来分割数组。

**流程**：
1. 找到最小的 F(k) 使得 F(k) >= n
2. 将数组扩展到 F(k) 长度（用最后元素填充）
3. 查找点 mid = left + F(k-1) - 1（黄金分割点）
4. 比较 arr[mid] 与 target：
   - 等于 → 找到（注意 mid 可能在扩展区，取 min(mid, n-1)）
   - 小于 → 在右区间，left = mid + 1，k -= 2
   - 大于 → 在左区间，right = mid - 1，k -= 1`,
    complexity: { time: 'O(log n)', space: 'O(n)（扩展数组）' },
    animation: { type: 'search', algorithm: 'fibonacci', data: [1, 5, 9, 12, 18, 25, 31, 36, 43, 49, 55, 58, 63, 67, 72, 78, 84, 90, 95, 99], target: 84 },
    codes: [
      { lang: 'C', code: `#include <stdio.h>

// 斐波那契查找：黄金分割点查找
int fibSearch(int arr[], int n, int target) {
    // 生成斐波那契数列
    int fib[20] = {0, 1};
    for (int i = 2; i < 20; i++) fib[i] = fib[i-1] + fib[i-2];
    // 找到 F(k) >= n
    int k = 0;
    while (fib[k] < n) k++;
    // 扩展数组到 F(k) 长度
    int tmp[fib[k]];
    for (int i = 0; i < n; i++) tmp[i] = arr[i];
    for (int i = n; i < fib[k]; i++) tmp[i] = arr[n-1];
    // 查找
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + fib[k-1] - 1;
        if (target < tmp[mid]) {
            right = mid - 1; k -= 1;    // 左区间
        } else if (target > tmp[mid]) {
            left = mid + 1; k -= 2;     // 右区间
        } else {
            return mid < n ? mid : n-1;  // 找到
        }
    }
    return -1;
}

int main() {
    int arr[] = {1,5,12,25,36,43,58,67,78,90};
    printf("目标在位置: %d\\n", fibSearch(arr, 10, 43));
    return 0;
}` },
      { lang: 'Python', code: `def fibonacci_search(arr: list[int], target: int) -> int:
    """斐波那契查找：黄金分割点"""
    n = len(arr)
    # 生成斐波那契数列
    fib = [0, 1]
    while fib[-1] < n:
        fib.append(fib[-1] + fib[-2])
    k = len(fib) - 1
    # 扩展数组
    tmp = arr + [arr[-1]] * (fib[k] - n)
    left, right = 0, n - 1
    while left <= right:
        mid = left + fib[k - 1] - 1
        if target < tmp[mid]:
            right = mid - 1; k -= 1
        elif target > tmp[mid]:
            left = mid + 1; k -= 2
        else:
            return min(mid, n - 1)
    return -1

print(f"目标在位置: {fibonacci_search([1,5,12,25,36,43,58,67,78,90], 43)}")` },
      { lang: 'JavaScript', code: `function fibonacciSearch(arr, target) {
  const n = arr.length;
  const fib = [0, 1];
  while (fib[fib.length - 1] < n) fib.push(fib.at(-1) + fib.at(-2));
  let k = fib.length - 1;
  const tmp = [...arr];
  while (tmp.length < fib[k]) tmp.push(arr[n - 1]);
  let left = 0, right = n - 1;
  while (left <= right) {
    const mid = left + fib[k - 1] - 1;
    if (target < tmp[mid]) { right = mid - 1; k -= 1; }
    else if (target > tmp[mid]) { left = mid + 1; k -= 2; }
    else return Math.min(mid, n - 1);
  }
  return -1;
}

console.log("目标在位置:", fibonacciSearch([1,5,12,25,36,43,58,67,78,90], 43));` },
      { lang: 'TypeScript', code: `function fibonacciSearch(arr: number[], target: number): number {
  const n = arr.length, fib = [0, 1];
  while (fib[fib.length - 1] < n) fib.push(fib.at(-1)! + fib.at(-2)!);
  let k = fib.length - 1;
  const tmp = [...arr];
  while (tmp.length < fib[k]) tmp.push(arr[n - 1]);
  let left = 0, right = n - 1;
  while (left <= right) {
    const mid = left + fib[k - 1] - 1;
    if (target < tmp[mid]) { right = mid - 1; k--; }
    else if (target > tmp[mid]) { left = mid + 1; k -= 2; }
    else return Math.min(mid, n - 1);
  }
  return -1;
}

console.log("目标在位置:", fibonacciSearch([1,5,12,25,36,43,58,67,78,90], 43));` },
      { lang: 'Java', code: `public class FibonacciSearch {
    public static int search(int[] arr, int target) {
        int n = arr.length;
        int[] fib = new int[20];
        fib[0]=0; fib[1]=1;
        for(int i=2;i<20;i++) fib[i]=fib[i-1]+fib[i-2];
        int k = 0;
        while (fib[k] < n) k++;
        int[] tmp = new int[fib[k]];
        System.arraycopy(arr, 0, tmp, 0, n);
        for (int i = n; i < fib[k]; i++) tmp[i] = arr[n-1];
        int left = 0, right = n - 1;
        while (left <= right) {
            int mid = left + fib[k-1] - 1;
            if (target < tmp[mid]) { right = mid-1; k--; }
            else if (target > tmp[mid]) { left = mid+1; k-=2; }
            else return Math.min(mid, n-1);
        }
        return -1;
    }
    public static void main(String[] args) {
        int[] arr = {1,5,12,25,36,43,58,67,78,90};
        System.out.println("目标在位置: " + search(arr, 43));
    }
}` },
    ],
  }
}

// ==================== 哈希查找 ====================

function hashSearch(): AlgorithmContent {
  return {
    title: '哈希查找',
    description: [
      { type: 'text', content: '哈希查找通过哈希函数将 key 直接映射到存储位置，理想情况下 O(1) 时间完成查找。' },
      { type: 'text', content: '核心难点是处理「哈希冲突」——两个不同的 key 映射到同一位置。常见解决方法：开放寻址法（线性探测、二次探测）和链地址法（拉链法）。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['前提条件', '无'], ['适用场景', '需要 O(1) 查找的场景'], ['冲突处理', '链地址法 / 开放寻址法']] } },
    ],
    approach: `**构建哈希表**：
1. 选择哈希函数：hash(key) = key % tableSize
2. 处理冲突：本例用链地址法（每个槽位挂一个链表）

**查找流程**：
1. 计算 index = hash(target)
2. 在 table[index] 对应的链表中顺序查找
3. 找到返回，链表遍历完未找到返回 -1

**装载因子** α = n / tableSize，α 越小冲突越少。一般保持 α < 0.75。`,
    complexity: { time: '理想 O(1)，最坏 O(n)', space: 'O(n)' },
    animation: { type: 'search', algorithm: 'hash', data: [12, 25, 37, 48, 57, 63, 79, 85, 92, 14, 33, 51, 68, 76, 99, 8], target: 51 },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <stdlib.h>

#define SIZE 7

typedef struct Node { int val; struct Node *next; } Node;

// 哈希函数
int hash(int key) { return key % SIZE; }

// 插入
void insert(Node *table[], int key) {
    int idx = hash(key);
    Node *node = malloc(sizeof(Node));
    node->val = key;
    node->next = table[idx];
    table[idx] = node;
}

// 查找
int search(Node *table[], int key) {
    int idx = hash(key);
    Node *cur = table[idx];
    while (cur) {
        if (cur->val == key) return idx;  // 找到
        cur = cur->next;
    }
    return -1;  // 未找到
}

int main() {
    Node *table[SIZE] = {NULL};
    int data[] = {12,25,37,48,57,63,79,85};
    for (int i = 0; i < 8; i++) insert(table, data[i]);
    printf("37 在槽位: %d\\n", search(table, 37));
    return 0;
}` },
      { lang: 'Python', code: `class HashTable:
    """哈希表（链地址法）"""
    def __init__(self, size=7):
        self.size = size
        self.table: list[list[int]] = [[] for _ in range(size)]

    def _hash(self, key: int) -> int:
        return key % self.size

    def insert(self, key: int):
        idx = self._hash(key)
        self.table[idx].append(key)

    def search(self, key: int) -> int:
        idx = self._hash(key)
        # 在链表中查找
        for v in self.table[idx]:
            if v == key:
                return idx  # 返回槽位
        return -1

ht = HashTable()
for v in [12,25,37,48,57,63,79,85]:
    ht.insert(v)
print(f"37 在槽位: {ht.search(37)}")` },
      { lang: 'JavaScript', code: `class HashTable {
  constructor(size = 7) {
    this.size = size;
    this.table = Array.from({ length: size }, () => []);
  }
  _hash(key) { return key % this.size; }
  insert(key) { this.table[this._hash(key)].push(key); }
  search(key) {
    const idx = this._hash(key);
    // 在链表中查找
    return this.table[idx].includes(key) ? idx : -1;
  }
}

const ht = new HashTable();
[12,25,37,48,57,63,79,85].forEach(v => ht.insert(v));
console.log("37 在槽位:", ht.search(37));` },
      { lang: 'TypeScript', code: `class HashTable {
  private table: number[][];
  constructor(private size = 7) {
    this.table = Array.from({ length: size }, () => []);
  }
  private _hash(key: number): number { return key % this.size; }
  insert(key: number) { this.table[this._hash(key)].push(key); }
  search(key: number): number {
    const idx = this._hash(key);
    return this.table[idx].includes(key) ? idx : -1;
  }
}

const ht = new HashTable();
[12,25,37,48,57,63,79,85].forEach(v => ht.insert(v));
console.log("37 在槽位:", ht.search(37));` },
      { lang: 'Java', code: `import java.util.*;

public class HashSearch {
    static final int SIZE = 7;
    static List<List<Integer>> table = new ArrayList<>();
    static { for (int i = 0; i < SIZE; i++) table.add(new ArrayList<>()); }

    static int hash(int key) { return key % SIZE; }
    static void insert(int key) { table.get(hash(key)).add(key); }
    static int search(int key) {
        int idx = hash(key);
        return table.get(idx).contains(key) ? idx : -1;
    }

    public static void main(String[] args) {
        for (int v : new int[]{12,25,37,48,57,63,79,85}) insert(v);
        System.out.println("37 在槽位: " + search(37));
    }
}` },
    ],
  }
}
