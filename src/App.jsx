import React, { useState, useEffect, useMemo } from "react";
import "./styles.css";

const ROWS = 4;
const COLS = 29;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!'";

const SCREENS = [
    [
        "HI, STRANGER!"
    ],
    [
        "I'M, PRIYANK JAIN",
        "WELCOME!"
    ],
    [
        "I AM A SENIOR SOFTWARE",
        "ENGINEER AT GOOGLE",
        "IN NEW YORK CITY"
    ],
    [
        "PREVIOUSLY, I WORKED AT",
        "TWITTER UNTIL",
        "MUSK ACQUIRED IT"
    ],
    [
        "I GOT MY MASTERS IN",
        "COMPUTER SCIENCE",
        "FROM PURDUE UNIVERSITY"
    ]
];

const Tile = ({ targetChar, waitingChar, shouldReveal, isRevealed }) => {
    const [displayChar, setDisplayChar] = useState(waitingChar || "");

    useEffect(() => {
        if (isRevealed) {
            setDisplayChar(targetChar || "");
            return;
        }

        if (shouldReveal) {
            const interval = setInterval(() => {
                setDisplayChar(CHARS[Math.floor(Math.random() * CHARS.length)]);
            }, 33); // Slower animation speed
            return () => clearInterval(interval);
        }

        // Waiting state
        setDisplayChar(waitingChar || "");
    }, [targetChar, waitingChar, shouldReveal, isRevealed]);

    const isFilled = displayChar !== "";

    return (
        <div className={`tile ${shouldReveal ? "active" : ""} ${isFilled ? "filled" : ""}`}>
            {displayChar}
        </div>
    );
};

export default function App() {
    const [screenIndex, setScreenIndex] = useState(0);
    const [revealIndex, setRevealIndex] = useState(0);
    // phase: 'reading' | 'wiping' | 'clearing'
    const [phase, setPhase] = useState("wiping");

    // Determines the sequence of "active" tiles (r, c) that need animating.
    // Ordered by Row, then Column.
    const animationSequence = useMemo(() => {
        const seq = [];
        // In "clearing" phase, we are flipping from Text (screenIndex) -> Blank.
        // In "wiping" phase, we are flipping from Blank (or prev clearing?) -> Text (screenIndex).
        // Actually, let's simplify:
        // When wiping: target = SCREENS[idx]. waiting = null (assumed cleared).
        // When clearing: target = null. waiting = SCREENS[idx].

        // Both phases share the logic: "If target OR waiting has char, push to sequence".
        // The difference is what getChar returns.

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const targetChar = getChar(screenIndex, r, c, phase);
                const waitingChar = getWaitingChar(screenIndex, r, c, phase);

                if (targetChar || waitingChar) {
                    seq.push({ r, c });
                }
            }
        }
        return seq;
    }, [screenIndex, phase]);

    // Map for O(1) lookup
    const sequenceMap = useMemo(() => {
        const map = new Map();
        animationSequence.forEach((pos, index) => {
            map.set(`${pos.r}-${pos.c}`, index);
        });
        return map;
    }, [animationSequence]);

    useEffect(() => {
        const maxIndex = animationSequence.length;

        // If wiped/revealed everything
        if (revealIndex >= maxIndex + 15) { // buffer
            if (phase === "wiping") {
                // Done wiping in. Go to reading.
                setPhase("reading");
                setRevealIndex(0);
                return;
            }
            if (phase === "clearing") {
                // Done clearing. Go to next screen (if avail) and start wiping.
                if (screenIndex < SCREENS.length - 1) {
                    setScreenIndex((prev) => prev + 1);
                    setPhase("wiping");
                    setRevealIndex(0);
                }
                return;
            }
        }

        // If reading, wait then start clearing
        if (phase === "reading") {
            const timer = setTimeout(() => {
                if (screenIndex < SCREENS.length - 1) {
                    setPhase("clearing");
                    setRevealIndex(0);
                }
            }, 2500);
            return () => clearTimeout(timer);
        }

        // Animation timer (wiping or clearing)
        const timer = setTimeout(() => {
            setRevealIndex((prev) => prev + 1);
        }, 36); // Approx screen wipe speed (slower)

        return () => clearTimeout(timer);
    }, [revealIndex, screenIndex, animationSequence.length, phase]);

    // Create grid data
    const renderGrid = () => {
        const grid = [];
        for (let r = 0; r < ROWS; r++) {
            const rowTiles = [];
            for (let c = 0; c < COLS; c++) {
                const targetChar = getChar(screenIndex, r, c, phase);
                const waitingChar = getWaitingChar(screenIndex, r, c, phase);

                const seqIdx = sequenceMap.get(`${r}-${c}`);

                let isRevealed = true;
                let shouldReveal = false;

                if (seqIdx !== undefined) {
                    isRevealed = seqIdx < revealIndex;
                    shouldReveal = seqIdx === revealIndex;
                }

                rowTiles.push(
                    <Tile
                        key={`${r}-${c}`}
                        targetChar={targetChar}
                        waitingChar={waitingChar}
                        isRevealed={isRevealed}
                        shouldReveal={shouldReveal}
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

// Helpers
function getChar(screenIdx, r, c, phase) {
    // If we are clearing, target is NULL (blank).
    if (phase === "clearing") return null;

    // Otherwise (wiping or reading), target is the Text.
    if (screenIdx < 0 || screenIdx >= SCREENS.length) return null;

    // ... Layout logic
    const screenLines = SCREENS[screenIdx];
    const totalLines = screenLines.length;
    const startRow = Math.floor((ROWS - totalLines) / 2);

    if (r >= startRow && r < startRow + totalLines) {
        const lineIndex = r - startRow;
        const line = screenLines[lineIndex];
        const startCol = Math.floor((COLS - line.length) / 2);
        if (c >= startCol && c < startCol + line.length) {
            return line[c - startCol];
        }
    }
    return null;
}

function getWaitingChar(screenIdx, r, c, phase) {
    // If we are clearing, waiting char IS the text (so we see it before it flips to blank).
    if (phase === "clearing") {
        // Reuse getChar logic but force it to look up the text
        return getChar(screenIdx, r, c, "reading");
    }
    // If wiping, waiting char is NULL (because we assumed we cleared before).
    return null;
}
