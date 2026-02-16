/**
 * Frames per second of the game
 */
let framerate = 60;

/**
 * @param {Number} n
 * @returns Random Integer Between 0 and n-1
 */
const randomInt = n => Math.floor(Math.random() * n);

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @returns String that can be used as a rgb web color
 */
const rgb = (r, g, b) => `rgba(${r}, ${g}, ${b})`;

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @param {Number} a Alpha Value
 * @returns String that can be used as a rgba web color
 */
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

/**
 * @param {Number} h Hue
 * @param {Number} s Saturation
 * @param {Number} l Lightness
 * @returns String that can be used as a hsl web color
 */
const hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

/** Creates an alias for requestAnimationFrame for backwards compatibility */
window.requestAnimFrame = (() => {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        /**
         * Compatibility for requesting animation frames in older browsers
         * @param {Function} callback Function
         * @param {DOM} element DOM ELEMENT
         */
        ((callback, element) => {
            window.setTimeout(callback, 1000 / framerate);
        });
})();

/**
 * Returns distance from two points
 * @param {Number} p1, p2 Two objects with x and y coordinates
 * @returns Distance between the two points
 */
const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

function getFacing(point) {
    if (point.x === 0 && point.y === 0) return 4;
    let angle = Math.atan2(point.y, point.x) / Math.PI;
    
    if (-0.625 < angle && angle < -0.375) return 0;
    if (-0.375 < angle && angle < -0.125) return 1;
    if (-0.125 < angle && angle < 0.125) return 2;
    if (0.125 < angle && angle < 0.375) return 3;
    if (0.375 < angle && angle < 0.625) return 4;
    if (0.625 < angle && angle < 0.875) return 5;
    if (-0.875 > angle || angle < 0.875) return 6;
    if (-0.875 < angle && angle < -0.625) return 7;
}

/**
 * @param row either an int row or a cell with properties "r" and "c"
 * @param col an int column (optional if row has "r" and "c")
 * @return {x, y} pair in pixel coordinates
 */
const cellToCoords = (row, col) => {
    if ('r' in row && 'c' in row) {
        return {x: row.c * CELL_SIZE + CELL_SIZE / 2, y: row.r * CELL_SIZE + CELL_SIZE / 2};
    } else if ('row' in row && 'col' in row) {
        return {x: row.col * CELL_SIZE + CELL_SIZE / 2, y: row.row * CELL_SIZE + CELL_SIZE / 2};
    }
    return {x: col * CELL_SIZE, y: row * CELL_SIZE};
}

/**
 * @param pos {x, y} pair in pixels. may be null or undefined.
 * @param box {x, y, width, height} in pixels. may be null or undefined.
 * @return true if pos is inside box, false otherwise.
 */
const insideBox = (pos, box) => {
    if (pos == null || box == null || pos == undefined || box == undefined) {
        return false;
    }
    return pos.x >= box.x && pos.x <= box.x + box.width && pos.y >= box.y && pos.y <= box.y + box.height;
}