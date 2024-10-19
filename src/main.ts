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

const cursor = { active: false, x: 0, y: 0 };

// draw on canvas
interface Displayable {
    display(context: CanvasRenderingContext2D): void;
}
  
class Drawing implements Displayable {
    // For this example, let's assume the drawing consists of a series of lines
    lines: {x: number, y: number }[];
  
    constructor() { this.lines = [ ]; }
  
    display(context: CanvasRenderingContext2D): void {
      context.beginPath();
      this.lines.forEach(line => {
        //context.moveTo(line.startX, line.startY);
        context.lineTo(line.x, line.y);
        context.moveTo(line.x, line.y);
      });
      context.stroke();
    }
}

const drawing = new Drawing();

const drawingChanged = new Event("drawing-changed");

myCanvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    ctx!.moveTo(cursor.x, cursor.y);
});

myCanvas.addEventListener("mouseup", () => {
    cursor.active = false;
});

myCanvas.addEventListener("mousemove", (e) => {
    if (cursor.active) {
      cursor.x = e.offsetX;
      cursor.y = e.offsetY;

      myCanvas.dispatchEvent(drawingChanged);
    }
});

myCanvas.addEventListener("drawing-changed", ()=>{
    resetCanvas();
    drawing.lines.push({x: cursor.x, y: cursor.y});
    if (ctx) {
        drawing.display(ctx);
    }
});

// clear canvas
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(document.createElement("div"), clearButton);

clearButton.addEventListener("click", () => {
    lines = [];
    redoLines = [];
    resetCanvas()
});

function resetCanvas(): void {
    ctx?.clearRect(0, 0, myCanvas.width, myCanvas.height);
    ctx?.fillRect(0, 0, myCanvas.width, myCanvas.height);
}

// undo
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
      redoLines.push(lines.pop());
      myCanvas.dispatchEvent(drawingChanged);
    }
  });

// redo
const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
    if (redoLines.length > 0) {
      lines.push(redoLines.pop());
      myCanvas.dispatchEvent(drawingChanged);
    }
});