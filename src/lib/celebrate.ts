// Set when a student ticks an exercise; the all-done disc only bursts right after a real tick, not on page load.
let lastTickAt = 0;
export const markTick = () => void (lastTickAt = Date.now());
export const tickedRecently = () => Date.now() - lastTickAt < 4000;
