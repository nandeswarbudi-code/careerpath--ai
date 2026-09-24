import { useState } from 'react';
import type { Role } from '../types';
import { runCodeInSandbox } from '../lib/codeRunner';
import { executeCode, type CodingLanguage } from '../lib/api';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  starter: string;
  hint: string;
}

function generateProblems(roleTitle: string): Problem[] {
  const r = roleTitle.toLowerCase();
  const isWeb = r.includes('frontend') || r.includes('full') || r.includes('ui') || r.includes('ux');
  const isBackend = r.includes('backend') || r.includes('devops') || r.includes('cloud') || r.includes('sre');
  const isData = r.includes('data') || r.includes('ml') || r.includes('analyst');

  const easy: Problem[] = [
    { id: 'e1', title: 'Reverse a String', difficulty: 'Easy', description: 'Write a function that reverses a string.', starter: 'function reverse(str) {\n  // your code\n}', hint: 'Use split, reverse, join or a loop.' },
    { id: 'e2', title: 'Find Maximum', difficulty: 'Easy', description: 'Find the largest number in an array.', starter: 'function findMax(arr) {\n  // your code\n}', hint: 'Use Math.max(...arr) or loop.' },
    { id: 'e3', title: 'Count Vowels', difficulty: 'Easy', description: 'Count the number of vowels in a string.', starter: 'function countVowels(str) {\n  // your code\n}', hint: 'Use regex /[aeiou]/gi or loop.' },
    { id: 'e4', title: 'Palindrome Check', difficulty: 'Easy', description: 'Check if a string is a palindrome.', starter: 'function isPalindrome(str) {\n  // your code\n}', hint: 'Compare string with its reverse.' },
    { id: 'e5', title: 'FizzBuzz', difficulty: 'Easy', description: 'Print 1-100. For multiples of 3 print "Fizz", 5 print "Buzz", both print "FizzBuzz".', starter: 'function fizzBuzz() {\n  // your code\n}', hint: 'Use modulo operator %.' },
    { id: 'e6', title: 'Sum of Array', difficulty: 'Easy', description: 'Return the sum of all numbers in an array.', starter: 'function sum(arr) {\n  // your code\n}', hint: 'Use reduce or a loop.' },
    { id: 'e7', title: 'Remove Duplicates', difficulty: 'Easy', description: 'Remove duplicate values from an array.', starter: 'function removeDups(arr) {\n  // your code\n}', hint: 'Use Set or filter.' },
    { id: 'e8', title: 'Title Case', difficulty: 'Easy', description: 'Capitalize the first letter of each word.', starter: 'function titleCase(str) {\n  // your code\n}', hint: 'Split by space, capitalize each, join.' },
    { id: 'e9', title: 'Even Numbers Filter', difficulty: 'Easy', description: 'Filter only even numbers from an array.', starter: 'function evens(arr) {\n  // your code\n}', hint: 'Use filter with n % 2 === 0.' },
    { id: 'e10', title: 'Factorial', difficulty: 'Easy', description: 'Calculate the factorial of a number.', starter: 'function factorial(n) {\n  // your code\n}', hint: 'Recursive: n * factorial(n-1), base case n <= 1.' },
  ];

  const medium: Problem[] = isWeb ? [
    { id: 'm1', title: 'Debounce Function', difficulty: 'Medium', description: 'Implement a debounce function that delays execution.', starter: 'function debounce(fn, delay) {\n  // your code\n}', hint: 'Use setTimeout and clearTimeout.' },
    { id: 'm2', title: 'Deep Clone Object', difficulty: 'Medium', description: 'Create a deep clone of a nested object.', starter: 'function deepClone(obj) {\n  // your code\n}', hint: 'JSON.parse(JSON.stringify(obj)) or recursive.' },
    { id: 'm3', title: 'Flatten Nested Array', difficulty: 'Medium', description: 'Flatten a deeply nested array into a single level.', starter: 'function flatten(arr) {\n  // your code\n}', hint: 'Use recursion or arr.flat(Infinity).' },
    { id: 'm4', title: 'Event Emitter', difficulty: 'Medium', description: 'Implement a simple pub/sub event emitter.', starter: 'class EventEmitter {\n  // on, emit, off\n}', hint: 'Store listeners in a Map<string, Function[]>.' },
    { id: 'm5', title: 'Promise.all Implementation', difficulty: 'Medium', description: 'Implement your own Promise.all.', starter: 'function promiseAll(promises) {\n  // your code\n}', hint: 'Track resolved count, resolve when all done.' },
    { id: 'm6', title: 'Throttle Function', difficulty: 'Medium', description: 'Implement throttle — limit function calls to once per interval.', starter: 'function throttle(fn, limit) {\n  // your code\n}', hint: 'Track lastCall timestamp.' },
    { id: 'm7', title: 'Memoize Function', difficulty: 'Medium', description: 'Create a memoization wrapper for expensive functions.', starter: 'function memoize(fn) {\n  // your code\n}', hint: 'Use a cache Map with JSON.stringify(args) as key.' },
    { id: 'm8', title: 'DOM Tree Traversal', difficulty: 'Medium', description: 'Implement BFS traversal of a DOM-like tree structure.', starter: 'function bfsTraverse(root) {\n  // your code\n}', hint: 'Use a queue. Process node, enqueue children.' },
    { id: 'm9', title: 'Infinite Scroll Logic', difficulty: 'Medium', description: 'Implement the logic for detecting scroll-to-bottom for infinite loading.', starter: 'function onScroll(el, loadMore) {\n  // your code\n}', hint: 'Compare scrollTop + clientHeight with scrollHeight.' },
    { id: 'm10', title: 'CSS-in-JS Parser', difficulty: 'Medium', description: 'Convert a JS style object to a CSS string.', starter: 'function toCSS(styles) {\n  // your code\n}', hint: 'camelCase to kebab-case, join with semicolons.' },
  ] : isData ? [
    { id: 'm1', title: 'Moving Average', difficulty: 'Medium', description: 'Calculate the moving average of a window size k.', starter: 'function movingAvg(arr, k) {\n  // your code\n}', hint: 'Sliding window technique.' },
    { id: 'm2', title: 'Matrix Transpose', difficulty: 'Medium', description: 'Transpose a 2D matrix (rows become columns).', starter: 'function transpose(matrix) {\n  // your code\n}', hint: 'Swap matrix[i][j] with matrix[j][i].' },
    { id: 'm3', title: 'Group By Key', difficulty: 'Medium', description: 'Group an array of objects by a given key.', starter: 'function groupBy(arr, key) {\n  // your code\n}', hint: 'Use reduce to build a Map.' },
    { id: 'm4', title: 'Median Finder', difficulty: 'Medium', description: 'Find the median of an unsorted array.', starter: 'function findMedian(arr) {\n  // your code\n}', hint: 'Sort first, then pick middle element(s).' },
    { id: 'm5', title: 'Frequency Counter', difficulty: 'Medium', description: 'Count the frequency of each element in an array.', starter: 'function frequency(arr) {\n  // your code\n}', hint: 'Use a Map or object to count.' },
    { id: 'm6', title: 'Normalize Data', difficulty: 'Medium', description: 'Min-max normalize an array of numbers to [0, 1].', starter: 'function normalize(arr) {\n  // your code\n}', hint: '(x - min) / (max - min) for each element.' },
    { id: 'm7', title: 'Pivot Table', difficulty: 'Medium', description: 'Create a simple pivot table from an array of records.', starter: 'function pivot(data, rowKey, colKey, valKey) {\n  // your code\n}', hint: 'Nested grouping with aggregation.' },
    { id: 'm8', title: 'Running Sum', difficulty: 'Medium', description: 'Compute the running (cumulative) sum of an array.', starter: 'function runningSum(arr) {\n  // your code\n}', hint: 'Keep a running total, push to result.' },
    { id: 'm9', title: 'Outlier Detection', difficulty: 'Medium', description: 'Find values more than 2 standard deviations from the mean.', starter: 'function findOutliers(arr) {\n  // your code\n}', hint: 'Compute mean and stddev first.' },
    { id: 'm10', title: 'Merge Sorted Arrays', difficulty: 'Medium', description: 'Merge two sorted arrays into one sorted array.', starter: 'function mergeSorted(a, b) {\n  // your code\n}', hint: 'Two-pointer technique.' },
  ] : [
    { id: 'm1', title: 'Two Sum', difficulty: 'Medium', description: 'Find two numbers that add up to a target. Return their indices.', starter: 'function twoSum(nums, target) {\n  // your code\n}', hint: 'Use a HashMap for O(n) solution.' },
    { id: 'm2', title: 'Valid Parentheses', difficulty: 'Medium', description: 'Check if a string of brackets is balanced.', starter: 'function isValid(s) {\n  // your code\n}', hint: 'Use a stack. Push open, pop on close.' },
    { id: 'm3', title: 'Binary Search', difficulty: 'Medium', description: 'Implement binary search on a sorted array.', starter: 'function binarySearch(arr, target) {\n  // your code\n}', hint: 'Two pointers: low and high, compare mid.' },
    { id: 'm4', title: 'Linked List Reverse', difficulty: 'Medium', description: 'Reverse a singly linked list.', starter: 'function reverseList(head) {\n  // your code\n}', hint: 'Track prev, current, next. Rewire pointers.' },
    { id: 'm5', title: 'LRU Cache', difficulty: 'Medium', description: 'Design a Least Recently Used cache with get/put.', starter: 'class LRUCache {\n  constructor(capacity) {}\n  get(key) {}\n  put(key, value) {}\n}', hint: 'Use Map (ordered in JS) or doubly linked list + HashMap.' },
    { id: 'm6', title: 'Rate Limiter', difficulty: 'Medium', description: 'Implement a token bucket rate limiter.', starter: 'class RateLimiter {\n  constructor(rate, capacity) {}\n  allow() {}\n}', hint: 'Track tokens and last refill time.' },
    { id: 'm7', title: 'Anagram Groups', difficulty: 'Medium', description: 'Group an array of strings into anagram groups.', starter: 'function groupAnagrams(strs) {\n  // your code\n}', hint: 'Sort each string as key, group by key.' },
    { id: 'm8', title: 'Merge Intervals', difficulty: 'Medium', description: 'Merge overlapping intervals in an array.', starter: 'function mergeIntervals(intervals) {\n  // your code\n}', hint: 'Sort by start, merge if overlapping.' },
    { id: 'm9', title: 'Max Subarray Sum', difficulty: 'Medium', description: 'Find the contiguous subarray with the largest sum (Kadane\'s).', starter: 'function maxSubArray(nums) {\n  // your code\n}', hint: 'Track maxCurrent and maxGlobal.' },
    { id: 'm10', title: 'JSON Flatten', difficulty: 'Medium', description: 'Flatten a nested JSON object with dot-notation keys.', starter: 'function flattenJSON(obj) {\n  // your code\n}', hint: 'Recursive. Concatenate keys with dot separator.' },
  ];

  const hard: Problem[] = [
    { id: 'h1', title: 'Serialize/Deserialize Tree', difficulty: 'Hard', description: 'Serialize a binary tree to a string and deserialize it back.', starter: 'function serialize(root) {}\nfunction deserialize(data) {}', hint: 'BFS with null markers. Use queue for both.' },
    { id: 'h2', title: 'Trie Implementation', difficulty: 'Hard', description: 'Implement a Trie with insert, search, and startsWith.', starter: 'class Trie {\n  insert(word) {}\n  search(word) {}\n  startsWith(prefix) {}\n}', hint: 'Each node has a Map of children and an isEnd flag.' },
    { id: 'h3', title: 'Dijkstra\'s Shortest Path', difficulty: 'Hard', description: 'Find the shortest path in a weighted graph.', starter: 'function dijkstra(graph, start) {\n  // your code\n}', hint: 'Priority queue + distance table. Relax edges.' },
    { id: 'h4', title: 'Task Scheduler', difficulty: 'Hard', description: 'Schedule tasks with cooldown between same tasks. Minimize total time.', starter: 'function leastInterval(tasks, n) {\n  // your code\n}', hint: 'Count frequencies. Most frequent task determines slots.' },
    { id: 'h5', title: 'Regex Matcher', difficulty: 'Hard', description: 'Implement simple regex matching with . and * support.', starter: 'function isMatch(s, p) {\n  // your code\n}', hint: 'Dynamic programming. dp[i][j] = s[0..i] matches p[0..j].' },
    { id: 'h6', title: isWeb ? 'Virtual DOM Diffing' : isData ? 'K-Means Clustering' : 'Database Query Optimizer', difficulty: 'Hard', description: isWeb ? 'Implement a simple virtual DOM diff algorithm.' : isData ? 'Implement basic K-Means clustering.' : 'Design a query optimizer that chooses index vs full scan.', starter: 'function solve(input) {\n  // your code\n}', hint: 'Break into sub-problems. Think about edge cases.' },
    { id: 'h7', title: 'LFU Cache', difficulty: 'Hard', description: 'Design a Least Frequently Used cache.', starter: 'class LFUCache {\n  constructor(capacity) {}\n  get(key) {}\n  put(key, value) {}\n}', hint: 'Two HashMaps + frequency tracking + min frequency.' },
    { id: 'h8', title: 'Word Break II', difficulty: 'Hard', description: 'Find all ways to break a string into valid dictionary words.', starter: 'function wordBreak(s, wordDict) {\n  // your code\n}', hint: 'Backtracking + memoization.' },
    { id: 'h9', title: 'Median of Data Stream', difficulty: 'Hard', description: 'Find the median from a continuous data stream.', starter: 'class MedianFinder {\n  addNum(num) {}\n  findMedian() {}\n}', hint: 'Use two heaps: max-heap for lower half, min-heap for upper.' },
    { id: 'h10', title: isWeb ? 'Build a Reactive System' : isBackend ? 'Distributed Lock' : 'MapReduce Framework', difficulty: 'Hard', description: isWeb ? 'Build a simple reactive state system like Vue/Solid signals.' : isBackend ? 'Design a distributed lock using Redis-like logic.' : 'Implement a simplified MapReduce.', starter: 'function solve(input) {\n  // your code\n}', hint: 'Think about concurrency, state, and edge cases.' },
  ];

  return [...easy, ...medium, ...hard];
}

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: 'badge-green',
  Medium: 'badge-amber',
  Hard: 'badge-red',
};

interface Props { role: Role | null; }

const LANGUAGES: { id: CodingLanguage; label: string }[] = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'php', label: 'PHP' },
  { id: 'ruby', label: 'Ruby' },
];

function starterFor(problem: Problem, language: CodingLanguage): string {
  if (language === 'javascript') return problem.starter;
  const comment = language === 'python' ? '#' : language === 'ruby' || language === 'php' ? '#' : '//';
  const body = `${comment} ${problem.description}\n${comment} Implement your solution below.\n`;
  if (language === 'python') return `${body}\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()\n`;
  if (language === 'ruby') return `${body}\ndef solve\n  # your code\nend\n\nsolve\n`;
  if (language === 'php') return `<?php\n${body}\nfunction solve() {\n    // your code\n}\n\nsolve();\n`;
  if (language === 'java') return `${body}\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // your code\n    }\n}\n`;
  return `${body}\n#include <stdio.h>\n\nint main(void) {\n    // your code\n    return 0;\n}\n`;
}

export default function CodingPractice({ role }: Props) {
  const problems = generateProblems(role?.title ?? 'Software Developer');
  const [filter, setFilter] = useState<Difficulty | 'All'>('All');
  const [selected, setSelected] = useState<Problem>(problems[0]);
  const [code, setCode] = useState(selected.starter);
  const [language, setLanguage] = useState<CodingLanguage>('javascript');
  const [output, setOutput] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  const filtered = filter === 'All' ? problems : problems.filter((p) => p.difficulty === filter);
  const counts = { Easy: problems.filter((p) => p.difficulty === 'Easy').length, Medium: problems.filter((p) => p.difficulty === 'Medium').length, Hard: problems.filter((p) => p.difficulty === 'Hard').length };

  const pick = (p: Problem) => { setSelected(p); setCode(starterFor(p, language)); setOutput([]); setShowHint(false); };

  const changeLanguage = (next: CodingLanguage) => {
    setLanguage(next);
    setCode(starterFor(selected, next));
    setOutput([]);
  };

  const run = async (): Promise<string[]> => {
    setOutput(['🔄 Running...']);
    if (language !== 'javascript') {
      setOutput(['🔄 Compiling and running online…']);
      try {
        const result = await executeCode(language, code);
        const lines = [
          result.status === 'success' ? '✅ Compilation and execution succeeded.' : `❌ ${result.status === 'compile-error' ? 'Compilation failed.' : 'Runtime error.'}`,
          result.compileOutput,
          result.runOutput,
        ].filter(Boolean).flatMap((line) => line.split('\n'));
        setOutput(lines);
        return lines;
      } catch (err) {
        const lines = [`❌ Error: ${(err as Error).message}`];
        setOutput(lines);
        return lines;
      }
    }
    const test = selected.id.startsWith('e1') ? 'console.log(reverse("hello"))' :
      selected.id.startsWith('e2') ? 'console.log(findMax([3,7,2,9,1]))' :
      selected.id.startsWith('e4') ? 'console.log(isPalindrome("racecar"))' :
      selected.id.startsWith('e6') ? 'console.log(sum([1,2,3,4,5]))' :
      selected.id.startsWith('e10') ? 'console.log(factorial(5))' :
      'console.log("Function defined — add your own tests below")';
    try {
      const logs = await runCodeInSandbox(code, `try { ${test} } catch (e) { console.log("⚠️ " + e.message) }`);
      const result = logs.length > 0 ? ['✅ Code executed:', ...logs.map((line) => `  → ${line}`)] : ['✅ Code ran without errors.', '💡 Add console.log() to see output.'];
      setOutput(result);
      return result;
    } catch (err) {
      const result = [`❌ Error: ${(err as Error).message}`, '💡 Check your syntax or infinite loops and try again.'];
      setOutput(result);
      return result;
    }
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Coding Practice</div>
        <h1 className="mt-1 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>
          {role?.title ?? 'General'} — {problems.length} Problems
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          {counts.Easy} Easy · {counts.Medium} Medium · {counts.Hard} Hard — tailored to your role.
        </p>
      </div>

      {/* Difficulty filter */}
      <div className="mb-4 flex gap-2">
        {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
          <button key={d} onClick={() => setFilter(d)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${filter === d ? 'text-white' : ''}`}
            style={{ background: filter === d ? 'var(--primary)' : 'var(--bg-alt)', color: filter === d ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            {d} {d !== 'All' ? `(${counts[d]})` : `(${problems.length})`}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Problem list */}
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => pick(p)}
              className={`card w-full text-left p-3 transition ${selected.id === p.id ? '' : ''}`}
              style={{ borderColor: selected.id === p.id ? 'var(--primary)' : 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className={`badge ${DIFF_COLORS[p.difficulty]}`}>{p.difficulty}</span>
              </div>
              <h4 className="mt-1.5 text-sm font-bold" style={{ color: 'var(--text)' }}>{p.title}</h4>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{selected.title}</h2>
              <span className={`badge ${DIFF_COLORS[selected.difficulty]}`}>{selected.difficulty}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{selected.description}</p>
            <button onClick={() => setShowHint(!showHint)} className="mt-2 text-xs font-bold" style={{ color: 'var(--primary)' }}>
              {showHint ? '🙈 Hide hint' : '💡 Show hint'}
            </button>
            {showHint && <p className="mt-1 text-xs rounded-lg p-2" style={{ background: 'var(--badge-blue-bg)', color: 'var(--badge-blue-text)' }}>💡 {selected.hint}</p>}
          </div>

          <div className="card overflow-hidden flex flex-col" style={{ background: '#1e1e2e' }}>
            <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-400" style={{ borderBottom: '1px solid #2a2a3e' }}>
              <select value={language} onChange={(e) => changeLanguage(e.target.value as CodingLanguage)} className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 outline-none">
                {LANGUAGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <textarea value={code} onChange={(e) => setCode(e.target.value)}
              className="flex-1 min-h-[200px] w-full bg-transparent p-4 text-sm text-green-300 outline-none resize-none font-mono leading-relaxed" />
          </div>

          <div className="flex gap-2">
            <button onClick={run} className="btn btn-ghost text-xs flex-1">▶ Run Code</button>
            <button onClick={async () => { await run(); setOutput((prev) => [...prev, '', '🚀 Solution submitted for review.']); }} className="btn btn-primary text-xs flex-1">Submit & Run</button>
          </div>

          {output.length > 0 && (
            <div className="card p-4 font-mono text-xs space-y-1" style={{ background: '#1e1e2e', color: '#a6e3a1' }}>
              <div className="text-slate-500 font-bold border-b border-slate-700 pb-1 mb-1">CONSOLE</div>
              {output.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
