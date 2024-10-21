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
ctx!.fillStyle = "white";
ctx!.fillRect(0, 0, myCanvas.width, myCanvas.height);

//const cursor = { active: false, x: 0, y: 0 };

// draw on canvas
class Line {
  points: {x: number, y: number}[] = [];

  constructor(x, y) {
    this.points.push({ x, y });
  }

  display(ctx) {
    ctx!.beginPath();
    const { x, y } = this.points[0];
    ctx!.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx!.lineTo(x, y);
    }
    ctx!.stroke();
  }
}

function draw() {
  resetCanvas();
  lines.forEach((cmd) => cmd.display(ctx));
}

let currentLine: Line | null = null;
let lines: Line[] = [];
let redoLines: Line[] = [];

myCanvas.addEventListener("mousedown", (e) => {
  currentLine = new Line(e.offsetX, e.offsetY);
  lines.push(currentLine);
  redoLines.splice(0, redoLines.length);
  draw();
});

myCanvas.addEventListener("mouseup", () => {
  currentLine = null;
  draw();
});

myCanvas.addEventListener("mousemove", (e) => {
  currentLine!.points.push({ x: e.offsetX, y: e.offsetY });
  draw();
});

function resetCanvas(): void {
  ctx!.clearRect(0, 0, myCanvas.width, myCanvas.height);
  ctx!.fillRect(0, 0, myCanvas.width, myCanvas.height);
}

// clear canvas
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(document.createElement("div"), clearButton);

clearButton.addEventListener("click", () => {
  lines = [];
  redoLines = [];
  resetCanvas()
});

// undo
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
  if(lines.length > 0){
    redoLines.push(lines.pop()!);
    draw();
  }
});

// redo
const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
  if(redoLines.length > 0){
    lines.push(redoLines.pop()!);
    draw();
  }
});