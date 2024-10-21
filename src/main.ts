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

// draw on canvas
class Line {
  points: {x: number, y: number}[] = [];
  stroke: number = 1;
  
  constructor(x, y, stroke) {
    this.points.push( {x, y} );
    this.stroke = stroke;
  }

  display(ctx) {
    ctx.lineWidth = this.stroke;
    ctx!.beginPath();
    const { x, y } = this.points[0];
    ctx!.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx!.lineTo(x, y);
    }
    ctx!.stroke();
  }
}

class Tool {
  x: number; 
  y: number;
  stroke: number;

  constructor(x, y, stroke) {
    this.x = x;
    this.y = y;
    this.stroke = stroke;
  }

  display(ctx) {
    //ctx.beginPath();
    //ctx.arc(this.x, this.y, this.stroke, 0, 2 * Math.PI);
    //ctx.stroke();
    ctx.font = "32px monospace";
    ctx.fillText("*", this.x - 8, this.y + 16);
  }
}

let bus = new EventTarget();

function notify(name) {
  bus.dispatchEvent(new Event(name));
}

function draw() {
  resetCanvas();
  // object.forEach((cmd) => cmd.display(ctx));
  //ctx!.clearRect(0, 0, myCanvas.width, myCanvas.height);

  lines.forEach((cmd) => cmd.display(ctx));

  if (cursor) {
    cursor.display(ctx);
  }
}

bus.addEventListener("drawing-changed", draw);
bus.addEventListener("cursor-changed", draw);

let currentLine: Line | null = null;
let lines: Line[] = [];
let redoLines: Line[] = [];
let currentStroke = 1;

let cursor: Tool | null = null;

myCanvas.addEventListener("mouseout", (e) => {
  cursor = null;
  notify("cursor-changed");
});

myCanvas.addEventListener("mouseenter", (e) => {
  cursor = new Tool(e.offsetX, e.offsetY, currentStroke);
  notify("cursor-changed");
});

myCanvas.addEventListener("mousedown", (e) => {
  currentLine = new Line(e.offsetX, e.offsetY, currentStroke);
  lines.push(currentLine);
  redoLines.splice(0, redoLines.length);
  notify("drawing-changed");
});

myCanvas.addEventListener("mouseup", () => {
  currentLine = null;
  notify("drawing-changed");
});

myCanvas.addEventListener("mousemove", (e) => {
  cursor = new Tool(e.offsetX, e.offsetY, currentStroke);
  notify("cursor-changed");

  currentLine!.points.push({ x: e.offsetX, y: e.offsetY });
  notify("drawing-changed");
});

function resetCanvas(): void {
  //ctx!.clearRect(0, 0, myCanvas.width, myCanvas.height);
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
    notify("drawing-changed");
  }
});

// redo
const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
  if(redoLines.length > 0){
    lines.push(redoLines.pop()!);
    notify("drawing-changed");
  }
});

// user feedback for thickness selected
const thicknessLabel = document.createElement("div");
thicknessLabel.innerHTML = `line thickness: ${currentStroke}`;

// thin line
const thinButton = document.createElement("button");
thinButton.innerHTML = "thin";
app.append(thinButton);

thinButton.addEventListener("click", () => {
  currentStroke = 1;
  thicknessLabel.innerHTML = `line thickness: ${currentStroke}`;
});

// thick line
const thickButton = document.createElement("button");
thickButton.innerHTML = "thick";
app.append(thickButton);

thickButton.addEventListener("click", () => {
  currentStroke = 5;
  thicknessLabel.innerHTML = `line thickness: ${currentStroke}`;
});

app.append(thicknessLabel);
