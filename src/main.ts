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
    const {x, y} = this.points[0];
    ctx!.moveTo(x, y);
    for (const {x, y} of this.points) { ctx!.lineTo(x, y); }
    ctx!.stroke();
  }
}

class Sticker {
  point: {x: number, y: number};
  sticker: string;
  
  constructor(x, y, sticker) {
    this.point = {x: x, y: y}
    this.sticker = sticker;
  }

  display(ctx) {
    ctx.font = `${10}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(this.sticker, this.point.x, this.point.y);
  }
}

class Tool {
  x: number; 
  y: number;
  stroke: number;
  preview: string;

  constructor(x, y, stroke, preview) {
    this.x = x;
    this.y = y;
    this.stroke = stroke;
    this.preview = preview;
  }

  display(ctx) {
    ctx.font = `${this.stroke * 10}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(this.preview, this.x, this.y);
  }
}

let bus = new EventTarget();

function notify(name) { bus.dispatchEvent(new Event(name)); }

function draw() {
  ctx!.clearRect(0, 0, myCanvas.width, myCanvas.height);

  drawing.forEach((cmd) => {
    cmd.display(ctx)
  });

  if (cursor) { cursor.display(ctx); }
}

function cursorDisplay(e){
  if(e) cursor = new Tool(e.offsetX, e.offsetY, currentStroke, currentTool);
  else cursor = null;
  notify("cursor-changed");
}

bus.addEventListener("drawing-changed", draw);
bus.addEventListener("cursor-changed", draw);
bus.addEventListener("tool-moved", draw);

let currentLine: Line | null = null;
let currentSticker: Sticker | null = null;

let drawing: Array<Line | Sticker> = [];
let redoDrawing: Array<Line | Sticker> = [];
let currentStroke = 1;

let cursor: Tool | null = null;
let currentTool = ".";

myCanvas.addEventListener("mouseout", () => { cursorDisplay(null); });
myCanvas.addEventListener("mouseenter", (e) => { cursorDisplay(e); });

myCanvas.addEventListener("mousedown", (e) => {
  cursorDisplay(null);

  if(currentTool == "."){
    currentLine = new Line(e.offsetX, e.offsetY, currentStroke);
    drawing.push(currentLine);
    redoDrawing.splice(0, redoDrawing.length);
    notify("drawing-changed");
  } 
});

myCanvas.addEventListener("mouseup", (e) => {
  cursorDisplay(e);

  if(currentTool == "."){
    currentLine = null;
    notify("drawing-changed");
  }else{
    currentSticker = new Sticker(e.offsetX, e.offsetY, currentTool);
    drawing.push(currentSticker);
    redoDrawing.splice(0, redoDrawing.length);
  }
});

myCanvas.addEventListener("mousemove", (e) => {

  if(currentTool == "."){
    if(cursor) cursorDisplay(e);
    currentLine!.points.push({ x: e.offsetX, y: e.offsetY });
    notify("drawing-changed");
  } else {
    cursorDisplay(e);
  }
});

app.append(document.createElement("div"));

// BUTTONS
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
  drawing = [];
  redoDrawing = [];
  ctx!.clearRect(0, 0, myCanvas.width, myCanvas.height);
});

const undo = new Button("undo", () =>{
  if(drawing.length > 0){
    redoDrawing.push(drawing.pop()!);
    notify("drawing-changed");
  }
});

const redo = new Button("redo", () =>{
  if(redoDrawing.length > 0){
    drawing.push(redoDrawing.pop()!);
    notify("drawing-changed");
  }
});

// user feedback for thickness selected
app.append(document.createElement("div"));
const thicknessLabel = document.createElement("text");
function changeStoke(strokeSize){ 
  currentTool = "."
  thicknessLabel.innerHTML = ` stroke: ${currentStroke = strokeSize}`; 
}

const thinStroke = new Button("thin", () =>{ changeStoke(1) }).button.click();
const thickStroke = new Button("thick", () =>{ changeStoke(5) });

app.append(thicknessLabel);

// stickers
app.append(document.createElement("div"));
const emoji1 = new Button("👁️", () => { currentTool = "👁️"; });
const emoji2 = new Button("👃", () => { currentTool = "👃"; });
const emoji3 = new Button("👄", () => { currentTool = "👄"; });

