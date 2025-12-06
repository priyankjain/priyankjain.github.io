import React, { useState, useEffect, useMemo } from "react";
import "./styles.css";

const ROWS = 4;
const COLS = 23;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!'";

const SCREENS = [
    [
        "HI, STRANGER! ^"
    ],
    [
        "I'M, PRIYANK JAIN",
        "WELCOME! +"
    ],
    [
        "I AM A",
        "SOFTWARE ENGINEER %",
        "AT GOOGLE",
        "IN NEW YORK CITY $"
    ],
    [
        "PREVIOUSLY,",
        "I WORKED AT",
        "TWITTER ~ UNTIL",
        "MUSK @ ACQUIRED IT"
    ],
    [
        "I GOT MY MASTERS IN",
        "COMPUTER SCIENCE &",
        "FROM PURDUE",
        "UNIVERSITY #"
    ]
];

const TwitterLogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
);

const PurdueLogo = () => (
    <img src="/purdue.png" alt="Purdue" style={{ width: '22px', height: '22px' }} />
);

const Tile = ({ targetChar, waitingChar, shouldReveal, isRevealed, color }) => {
    const [displayChar, setDisplayChar] = useState(waitingChar || "");

    useEffect(() => {
        if (isRevealed) {
            setDisplayChar(targetChar || "");
            return;
        }

        if (shouldReveal) {
            const interval = setInterval(() => {
                setDisplayChar(CHARS[Math.floor(Math.random() * CHARS.length)]);
            }, 30);
            return () => clearInterval(interval);
        }

        // Waiting state
        setDisplayChar(waitingChar || "");
    }, [targetChar, waitingChar, shouldReveal, isRevealed]);

    const renderContent = () => {
        if (displayChar === "~") return <TwitterLogo />;
        if (displayChar === "#") return <PurdueLogo />;
        if (displayChar === "^") return "👋";
        if (displayChar === "+") return "✨";
        if (displayChar === "%") return "💻";
        if (displayChar === "$") return "🗽";
        if (displayChar === "@") return "🚀";
        if (displayChar === "&") return "🎓";
        return displayChar;
    };

    return (
        <div
            className={`tile ${shouldReveal ? "active" : ""}`}
            style={{ color: color || 'var(--text)' }}
        >
            {renderContent()}
        </div>
    );
};

export default function App() {
    const [screenIndex, setScreenIndex] = useState(0);
    const [revealIndex, setRevealIndex] = useState(0);

    // Determines the sequence of "active" tiles (r, c) that need animating.
    // Ordered by Row, then Column (Line by Line).
    const animationSequence = useMemo(() => {
        const seq = [];
        const prevScreenIndex = screenIndex - 1;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const targetData = getCellData(screenIndex, r, c);
                const targetChar = targetData ? targetData.char : null;
                const targetColor = targetData ? getStyle(screenIndex, targetData.lineIndex, targetData.charIndex) : null;

                const waitingData = prevScreenIndex >= 0 ? getCellData(prevScreenIndex, r, c) : null;
                const waitingChar = waitingData ? waitingData.char : null;
                const waitingColor = waitingData ? getStyle(prevScreenIndex, waitingData.lineIndex, waitingData.charIndex) : null;

                // If this tile has content now OR had content before, it must animate
                // Only if the content is DIFFERENT (e.g. appearing, disappearing, or changing letter)
                // OR if the COLOR is different (e.g. same letter but changing style).
                // If it's the exact same letter AND color in same spot, don't flip.
                if (targetChar !== waitingChar || targetColor !== waitingColor) {
                    seq.push({ r, c });
                }
            }
        }
        return seq;
    }, [screenIndex]);

    // Map for O(1) lookup: "r-c" -> sequenceIndex
    const sequenceMap = useMemo(() => {
        const map = new Map();
        animationSequence.forEach((pos, index) => {
            map.set(`${pos.r}-${pos.c}`, index);
        });
        return map;
    }, [animationSequence]);

    useEffect(() => {
        // Check if we've revealed all items in the sequence
        const maxIndex = animationSequence.length;

        if (revealIndex >= maxIndex + 20) { // +20 buffer for reading time (approx 600ms)
            if (screenIndex < SCREENS.length - 1) {
                const timer = setTimeout(() => {
                    setScreenIndex((prev) => prev + 1);
                    setRevealIndex(0);
                }, 2000);
                return () => clearTimeout(timer);
            }
            return;
        }

        const timer = setTimeout(() => {
            setRevealIndex((prev) => prev + 1);
        }, 60); // Slower sequential reveal (60ms per tile) to allow flip duration

        return () => clearTimeout(timer);
    }, [revealIndex, screenIndex, animationSequence.length]);

    // Create grid data
    const renderGrid = () => {
        const grid = [];
        const prevScreenIndex = screenIndex - 1;

        for (let r = 0; r < ROWS; r++) {
            const rowTiles = [];
            for (let c = 0; c < COLS; c++) {
                const targetData = getCellData(screenIndex, r, c);
                const targetChar = targetData ? targetData.char : null;
                const targetColor = targetData ? getStyle(screenIndex, targetData.lineIndex, targetData.charIndex) : null;

                const waitingData = prevScreenIndex >= 0 ? getCellData(prevScreenIndex, r, c) : null;
                const waitingChar = waitingData ? waitingData.char : null;
                const waitingColor = waitingData ? getStyle(prevScreenIndex, waitingData.lineIndex, waitingData.charIndex) : null;

                const seqIdx = sequenceMap.get(`${r}-${c}`);

                // Default handling if tile is not in the animation sequence (always background)
                let isRevealed = true;
                let shouldReveal = false;

                if (seqIdx !== undefined) {
                    isRevealed = seqIdx < revealIndex;
                    shouldReveal = seqIdx === revealIndex;
                }

                // Determine which color to show
                let displayColor;
                if (isRevealed) {
                    // Only show target color when the char is actually locked in
                    displayColor = targetColor;
                } else if (shouldReveal) {
                    // During animation/shuffle
                    // If we are coming FROM a colored text, keep that color during shuffle (dissolving).
                    // If we are coming from Black (null), keep it Black during shuffle (neutral noise).
                    // We DO NOT show the new color yet, to avoid "color before text".
                    if (waitingColor) {
                        displayColor = waitingColor;
                    } else {
                        displayColor = null; // Default/Black
                    }
                } else {
                    // Waiting
                    displayColor = waitingColor;
                }

                rowTiles.push(
                    <Tile
                        key={`${r}-${c}`}
                        targetChar={targetChar}
                        waitingChar={waitingChar}
                        isRevealed={isRevealed}
                        shouldReveal={shouldReveal}
                        color={displayColor}
                    />
                );
            }
            grid.push(<div key={r} className="board-row">{rowTiles}</div>);
        }
        return grid;
    };

    return (
        <div className="board-container">
            {renderGrid()}
        </div>
    );
}

// moved outside to avoid stale closure or strictly passing screenIdx
function getCellData(screenIdx, r, c) {
    if (screenIdx < 0 || screenIdx >= SCREENS.length) return null;

    const screenLines = SCREENS[screenIdx];
    const totalLines = screenLines.length;
    // User requested reducing top spacing so start at 0
    const startRow = 0;

    if (r >= startRow && r < startRow + totalLines) {
        const lineIndex = r - startRow;
        const line = screenLines[lineIndex];
        const startCol = Math.floor((COLS - line.length) / 2);
        if (c >= startCol && c < startCol + line.length) {
            return {
                char: line[c - startCol],
                lineIndex: lineIndex,
                charIndex: c - startCol
            };
        }
    }
    return null;
}

// Helper to determine color based on screen content
function getStyle(screenIdx, lineIdx, charIdx) {
    // Screen 0: Hi Stranger
    if (screenIdx === 0 && lineIdx === 0) {
        // "HI, STRANGER! ^"
        if (charIdx >= 4 && charIdx <= 12) return '#E91E63'; // Stranger - Pink
    }

    // Screen 1: Priyank Jain / Welcome
    if (screenIdx === 1) {
        if (lineIdx === 0 && charIdx >= 5) return '#009688'; // Priyank Jain - Teal
        if (lineIdx === 1) return '#FFB300'; // Welcome - Amber/Gold
    }

    // Screen 2: Google
    if (screenIdx === 2) {
        // Line 1: "SOFTWARE ENGINEER %"
        if (lineIdx === 1) {
            // SOFTWARE (0-7)
            if (charIdx >= 0 && charIdx <= 7) return '#009688'; // Teal
            // ENGINEER (9-16)
            if (charIdx >= 9 && charIdx <= 16) return '#009688'; // Teal
        }
        // Line 2: "AT GOOGLE"
        if (lineIdx === 2) {
            // GOOGLE (3-8)
            // G(3) O(4) O(5) G(6) L(7) E(8)
            if (charIdx === 3) return '#4285F4';
            if (charIdx === 4) return '#EA4335';
            if (charIdx === 5) return '#FBBC05';
            if (charIdx === 6) return '#4285F4';
            if (charIdx === 7) return '#34A853';
            if (charIdx === 8) return '#EA4335';
        }
        // Line 3: "IN NEW YORK CITY $"
        if (lineIdx === 3) {
            // NEW YORK CITY (3-15)
            if (charIdx >= 3 && charIdx <= 15) return '#00BCD4'; // Cyan
        }
    }

    // Screen 3: Twitter
    if (screenIdx === 3) {
        // Line 2: "TWITTER ~ UNTIL"
        if (lineIdx === 2) {
            // TWITTER (0-6)
            if (charIdx >= 0 && charIdx <= 6) return '#1DA1F2'; // Twitter Blue
            // Twitter Icon at position 8
            if (charIdx === 8) return '#1DA1F2'; // Twitter Icon
        }
    }

    // Screen 4: Purdue
    if (screenIdx === 4) {
        if (lineIdx === 2) {
            // "FROM PURDUE"
            // PURDUE (5-10)
            if (charIdx >= 5) return '#CEB888'; // Purdue Gold
        }
        if (lineIdx === 3) {
            // "UNIVERSITY #"
            // UNIVERSITY (0-9)
            if (charIdx <= 9) return '#CEB888'; // Purdue Gold
        }
    }

    return null;
}
