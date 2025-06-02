// src/components/WordSearchBackground.jsx
import React, { useState, useEffect, useMemo } from "react";
import "../styles/wordsearch.css";

// 1) Mogelijke richtingen (eight‐way)
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

// 2) Maak een lege rij van lengte `cols`, gevuld met null
function createEmptyRow(cols) {
  return Array.from({ length: cols }, () => null);
}

// 3) Maak een lege grid van `rows × cols`
function createEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => createEmptyRow(cols));
}

// 4) Willekeurige integer [0, max)
function randomInt(max) {
  return Math.floor(Math.random() * max);
}

// 5) Check of woord volledig past in de grid op gegeven rij/kolom in direction
function canPlaceWordRect(grid, word, row, col, dir) {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let i = 0; i < word.length; i++) {
    const newRow = row + dir.y * i;
    const newCol = col + dir.x * i;
    // Buitengrens‐check
    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
      return false;
    }
    // Als er al een letter staat en die wijkt af, conflict
    const existing = grid[newRow][newCol];
    if (existing !== null && existing !== word[i]) {
      return false;
    }
  }
  return true;
}

// 6) Plaats het woord in de grid en retourneer positie‐coördinaten
function placeWordRect(grid, word, row, col, dir) {
  const positions = [];
  for (let i = 0; i < word.length; i++) {
    const newRow = row + dir.y * i;
    const newCol = col + dir.x * i;
    grid[newRow][newCol] = word[i];
    positions.push([newRow, newCol]);
  }
  return positions;
}

// 7) Vul lege cellen met random A–Z
function fillEmptyCellsRect(grid) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rows = grid.length;
  const cols = grid[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = letters[randomInt(letters.length)];
      }
    }
  }
}

/**
 * 8) generateRectangularWordSearch
 *    - words: array van strings (in hoofdletters)
 *    - rows: aantal rijen in de grid
 *    - cols: aantal kolommen in de grid
 * 
 * Return: { grid, wordPositions }
 *   waarbij grid een 2D‐array is [rows][cols] met elke cel een letter A–Z,
 *   en wordPositions is een object mapping elk woord naar een array van [r,c].
 */
function generateRectangularWordSearch(words, rows, cols) {
  // Filter lege strings en duplicaten, en sorteer op aflopende lengte
  const uniqueWords = Array.from(
    new Set(words.filter((w) => w && w.length > 0))
  ).sort((a, b) => b.length - a.length);

  let grid = createEmptyGrid(rows, cols);
  let wordPositions = {};
  let failed = false;

  // Probeer elk woord te plaatsen
  for (let w of uniqueWords) {
    let placed = false;
    // Maximaal 50 willekeurige pogingen per woord
    for (let attempt = 0; attempt < 50; attempt++) {
      const dir = DIRECTIONS[randomInt(DIRECTIONS.length)];
      const row = randomInt(rows);
      const col = randomInt(cols);
      if (canPlaceWordRect(grid, w, row, col, dir)) {
        wordPositions[w] = placeWordRect(grid, w, row, col, dir);
        placed = true;
        break;
      }
    }
    if (!placed) {
      failed = true;
      break;
    }
  }

  // Als een woord niet geplaatst kon worden (te weinig ruimte of te veel botsingen),
  // kan je hier kiezen:
  //  a) “grid = createEmptyGrid(rows, cols);” en opnieuw proberen (recursief of while‐loop),
  //     maar dat is riskant als de ruimte echt te klein is.
  //  b) Gewoon doorgaan en de resterende plaatsen random vullen (met overlappen van letters).
  // In dit voorbeeld negeren we de mislukking en vullen we verder op:
  //   (je ziet dan in de uiteindelijke puzzel misschien overlappende of incomplete plaatsen,
  //    maar toch vult hij de hele achtergrond met letters).

  // Vul lege cellen alsnog random op
  fillEmptyCellsRect(grid);

  return { grid, wordPositions };
}

export default function WordSearchBackground({
  words,           // array van strings (in hoofdletters)
  highlightWord,   // string (woonwoord in hoofdletters) of null
}) {
  // 9) Celgrootte in pixels – MOET matchen met je CSS (24px ¬één van de dimensies)
  const cellSizePx = 24;

  // 10) Houd actuele viewport‐afmetingen bij
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 11) Luister naar window resize om de grid‐dimensions te herberekenen
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

  // 12) Bereken het aantal rijen en kolommen
  const cols = Math.ceil(viewport.width / cellSizePx);
  const rows = Math.ceil(viewport.height / cellSizePx);

  // 13) Genereer de puzzle **alleen opnieuw** wanneer `words` of `rows` of `cols` verandert
  const { grid, wordPositions } = useMemo(() => {
    return generateRectangularWordSearch(words, rows, cols);
  }, [words.join("|"), rows, cols]);

  // 14) Bepaal welke coördinaten horen bij het woord dat we willen highlighten
const highlightCoords = new Set();
if (highlightWord && wordPositions[highlightWord]) {
  for (let [r, c] of wordPositions[highlightWord]) {
    highlightCoords.add(`${r},${c}`);
  }
}

// 14b) Verzamel ALLE coördinaten die deel uitmaken van *een willekeurig* woord
const wordCoords = useMemo(() => {
  const set = new Set();
  Object.values(wordPositions).forEach((coords) => {
    coords.forEach(([r, c]) => set.add(`${r},${c}`));
  });
  return set;
}, [wordPositions]);

// 15) Render de volledige grid als achtergrond
return (
  <div className="wordsearch-background">
    {grid.map((rowArr, rowIdx) => (
      <div key={rowIdx} className="ws-row">
        {rowArr.map((letter, colIdx) => {
          const cellKey = `${rowIdx},${colIdx}`;
          const isHighlighted = highlightCoords.has(cellKey);
          const isWordCell = wordCoords.has(cellKey);
          return (
            <span
              key={cellKey}
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
