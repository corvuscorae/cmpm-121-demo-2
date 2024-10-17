import "./style.css";

const APP_NAME = "sticker sketch";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// app title
const title = document.createElement("h1");
title.innerHTML = APP_NAME;
app.append(title);

// canvas
const myCanvas = document.createElement("canvas");
myCanvas.width = myCanvas.height = 256;
app.append(myCanvas);

const ctx = myCanvas.getContext("2d");
ctx.fillStyle = "white";
ctx?.fillRect(0, 0, myCanvas.width, myCanvas.height);

const cursor = { active: false, x: 0, y: 0 };

// draw on canvas
let lines: { x: number; y: number; }[][] = [];
let currentLine: { x: number; y: number; }[] = [];

const drawingChanged = new Event("drawing-changed");

myCanvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    currentLine = [];
    lines.push(currentLine);
    currentLine.push({x: cursor.x, y: cursor.y});
});

myCanvas.addEventListener("mouseup", () => {
    cursor.active = false;
    currentLine = [];
});

myCanvas.addEventListener("mousemove", (e) => {
    if (cursor.active) {
      cursor.x = e.offsetX;
      cursor.y = e.offsetY;
      currentLine.push({x: cursor.x, y: cursor.y});

      myCanvas.dispatchEvent(drawingChanged);
    }
});

myCanvas.addEventListener("drawing-changed", (e)=>{
    ctx?.clearRect(0, 0, myCanvas.width, myCanvas.height);
    ctx?.fillRect(0, 0, myCanvas.width, myCanvas.height);
    for (const line of lines) {
        if (line.length > 1) {
            ctx?.beginPath();
            const { x, y } = line[0];
            ctx?.moveTo(x, y);
            for (const { x, y } of line) {
                ctx?.lineTo(x, y);
            }
            ctx?.stroke();
        }
    }
});

// clear canvas
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(document.createElement("div"), clearButton);

clearButton.addEventListener("click", () => {
    lines = [];
    ctx?.clearRect(0, 0, myCanvas.width, myCanvas.height);
    ctx?.fillRect(0, 0, myCanvas.width, myCanvas.height);
});