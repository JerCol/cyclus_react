// src/components/WordSearchBackground.jsx
import React, { useState, useEffect, useMemo } from "react";
import "../styles/wordsearch.css";

const DIRECTIONS = [
  { x: 1, y: 0 },   // →
  { x: -1, y: 0 },  // ←
  { x: 0, y: 1 },   // ↓
  { x: 0, y: -1 },  // ↑
  { x: 1, y: 1 },   // ↘
  { x: -1, y: 1 },  // ↙
  { x: 1, y: -1 },  // ↗
  { x: -1, y: -1 }, // ↖
];

function createEmptyRow(cols) {
  return Array.from({ length: cols }, () => null);
}

function createEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => createEmptyRow(cols));
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Check if `word` could go, letter by letter, starting at (row,col) moving in `dir`.
 * Returns true only if every letter fits inside the grid boundaries and either
 * the cell is null or already contains exactly that letter.
 */
function canPlaceWordRect(grid, word, row, col, dir) {
  const R = grid.length, C = grid[0].length;
  for (let i = 0; i < word.length; i++) {
    const r2 = row + dir.y * i;
    const c2 = col + dir.x * i;
    if (r2 < 0 || r2 >= R || c2 < 0 || c2 >= C) return false;
    const existing = grid[r2][c2];
    if (existing !== null && existing !== word[i]) return false;
  }
  return true;
}

/**
 * Actually writes `word` into `grid` at (row,col) along `dir`, returning
 * an array of [r,c] positions that we just filled. (Used both for normal placement
 * and for “forced” overwrite placement.)
 */
function placeWordRect(grid, word, row, col, dir) {
  const positions = [];
  for (let i = 0; i < word.length; i++) {
    const r2 = row + dir.y * i;
    const c2 = col + dir.x * i;
    grid[r2][c2] = word[i];
    positions.push([r2, c2]);
  }
  return positions;
}

/**
 * Fill all remaining null cells with random uppercase A–Z letters.
 */
function fillEmptyCellsRect(grid) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const R = grid.length, C = grid[0].length;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = letters[randomInt(letters.length)];
      }
    }
  }
}

/**
 * generateRectangularWordSearch
 *   - words:       array of strings (already uppercase, no duplicates in caller)
 *   - rows, cols:  grid dimensions
 *   - highlight:   the single word that must be forced-in
 *
 * Returns { grid, wordPositions }, where:
 *   - grid is a rows×cols 2D array of letters A–Z
 *   - wordPositions is an object { [word]: [[r,c], …] }
 */
function generateRectangularWordSearch(words, rows, cols, highlight) {
  // 1) Filter out any empty or null, preserve insertion order and remove duplicates:
  const filtered = [];
  const seen = new Set();
  for (let w of words) {
    if (w && w.length > 0 && !seen.has(w)) {
      seen.add(w);
      filtered.push(w);
    }
  }

  // 2) Separate out the “highlight” word (newly joined) so it goes first:
  let newWord = null;
  const rest = [];
  for (let w of filtered) {
    if (w === highlight) {
      newWord = w;
    } else {
      rest.push(w);
    }
  }

  // 3) Sort the “rest” by descending length (longest first), then append them.
  const sortedRest = rest.sort((a, b) => b.length - a.length);
  // Build the final placement list: [ newWord (if any), ...sortedRest ]
  const uniqueWords = newWord ? [newWord, ...sortedRest] : sortedRest;

  // 4) Create empty grid and an object to track each word’s coordinates:
  let grid = createEmptyGrid(rows, cols);
  const wordPositions = {};

  // 5) Try placing each word in turn.  If it’s the “newWord” and it fails 50 tries,
  //    we forcibly overwrite into a random location so it still appears.
  for (let idx = 0; idx < uniqueWords.length; idx++) {
    const w = uniqueWords[idx];
    let placed = false;

    // 50 random attempts (normal placement):
    for (let attempt = 0; attempt < 50; attempt++) {
      const dir = DIRECTIONS[randomInt(DIRECTIONS.length)];
      const r0 = randomInt(rows);
      const c0 = randomInt(cols);
      if (canPlaceWordRect(grid, w, r0, c0, dir)) {
        wordPositions[w] = placeWordRect(grid, w, r0, c0, dir);
        placed = true;
        break;
      }
    }

    // If not placed yet, AND this word is the “newWord,” force‐write:
    if (!placed && newWord && w === newWord) {
      // Pick a random start+direction; if it goes out of bounds, we simply stop writing
      // at the boundary. This ensures every letter of newWord is at least attempted.
      const dir = DIRECTIONS[randomInt(DIRECTIONS.length)];
      const r0 = randomInt(rows);
      const c0 = randomInt(cols);
      const forcedPositions = [];
      for (let i = 0; i < w.length; i++) {
        const r2 = r0 + dir.y * i;
        const c2 = c0 + dir.x * i;
        if (r2 < 0 || r2 >= rows || c2 < 0 || c2 >= cols) break;
        grid[r2][c2] = w[i];
        forcedPositions.push([r2, c2]);
      }
      wordPositions[w] = forcedPositions;
      placed = true;
    }

    // If still not placed (i.e. a non-highlight word failed), just skip it:
    if (!placed) {
      continue;
    }
  }

  // 6) Fill remaining empty cells with random letters:
  fillEmptyCellsRect(grid);

  return { grid, wordPositions };
}

export default function WordSearchBackground({
  words,           // array of uppercase strings
  highlightWord,   // uppercase string or null
}) {
  const cellSizePx = 24;
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cols = Math.ceil(viewport.width / cellSizePx);
  const rows = Math.ceil(viewport.height / cellSizePx);

  // Only regenerate if words, rows, cols, or highlightWord change:
  const { grid, wordPositions } = useMemo(() => {
    return generateRectangularWordSearch(words, rows, cols, highlightWord);
  }, [words.join("|"), rows, cols, highlightWord]);

  // Build a set of “highlight” coordinates (to add a special CSS class)
  const highlightCoords = new Set();
  if (highlightWord && wordPositions[highlightWord]) {
    for (let [r, c] of wordPositions[highlightWord]) {
      highlightCoords.add(`${r},${c}`);
    }
  }

  // Build a set of all “any‐word” coordinates (so we can bold them)
  const wordCoords = useMemo(() => {
    const set = new Set();
    Object.values(wordPositions).forEach((coords) => {
      coords.forEach(([r, c]) => set.add(`${r},${c}`));
    });
    return set;
  }, [wordPositions]);

  return (
    <div className="wordsearch-background">
      {grid.map((rowArr, rIdx) => (
        <div key={rIdx} className="ws-row">
          {rowArr.map((letter, cIdx) => {
            const key = `${rIdx},${cIdx}`;
            const isHighlighted = highlightCoords.has(key);
            const isWordCell = wordCoords.has(key);
            return (
              <span
                key={key}
                className={[
                  "ws-cell",
                  isWordCell && "ws-cell--bold",
                  isHighlighted && "ws-cell--highlight",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {letter}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
