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
myCanvas.style.cursor = "none";
app.append(myCanvas);

const ctx = myCanvas.getContext("2d");

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
    ctx.font = `${this.stroke * 10}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(".", this.x, this.y);
  }
}

let bus = new EventTarget();

function notify(name) {
  bus.dispatchEvent(new Event(name));
}

function draw() {
  ctx!.clearRect(0, 0, myCanvas.width, myCanvas.height);

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

function cursorDisplay(e){
  if(e) cursor = new Tool(e.offsetX, e.offsetY, currentStroke);
  else cursor = null;
  notify("cursor-changed");
}

myCanvas.addEventListener("mouseout", () => {
  cursorDisplay(null);
});

myCanvas.addEventListener("mouseenter", (e) => {
  cursorDisplay(e);
});

myCanvas.addEventListener("mousedown", (e) => {
  cursorDisplay(null);

  currentLine = new Line(e.offsetX, e.offsetY, currentStroke);
  lines.push(currentLine);
  redoLines.splice(0, redoLines.length);
  notify("drawing-changed");
});

myCanvas.addEventListener("mouseup", (e) => {
  cursorDisplay(e);

  currentLine = null;
  notify("drawing-changed");
});

myCanvas.addEventListener("mousemove", (e) => {
  if(cursor) cursorDisplay(e);

  currentLine!.points.push({ x: e.offsetX, y: e.offsetY });
  notify("drawing-changed");
});

app.append(document.createElement("div"));

class Button{
  button: HTMLButtonElement = document.createElement("button");
  label: string = "";
  execute(){};

  constructor(label, execute) {
    this.label = label;
    this.button.innerHTML = label;
    app.append(this.button);

    this.execute = execute;
    this.button.addEventListener("click", () => this.execute());
  }
};

const clear = new Button("clear", () => {  
  lines = [];
  redoLines = [];
  ctx!.clearRect(0, 0, myCanvas.width, myCanvas.height);
});

const undo = new Button("undo", () =>{
  if(lines.length > 0){
    redoLines.push(lines.pop()!);
    notify("drawing-changed");
  }
});

const redo = new Button("redo", () =>{
  if(redoLines.length > 0){
    lines.push(redoLines.pop()!);
    notify("drawing-changed");
  }
});

// user feedback for thickness selected
const thicknessLabel = document.createElement("div");
thicknessLabel.innerHTML = `line thickness: ${currentStroke}`;

// thin line
const thinStroke = new Button("thin", () =>{
  currentStroke = 1;
  thicknessLabel.innerHTML = `line thickness: ${currentStroke}`;
});

// thick line
const thickStroke = new Button("thick", () =>{
  currentStroke = 5;
  thicknessLabel.innerHTML = `line thickness: ${currentStroke}`;
});

app.append(thicknessLabel);
