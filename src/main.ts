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
ctx!.textAlign = "center";

//* CONSTANTS *//
const THIN_STROKE = 1;
const THICK_STROKE = 5;

//* EVENT HANDLERS *//
let bus = new EventTarget();
bus.addEventListener("drawing-changed", drawToCanvas);
bus.addEventListener("cursor-changed", drawToCanvas);

function notify(name) { bus.dispatchEvent(new Event(name)); }

function drawToCanvas() {
  ctx!.clearRect(0, 0, myCanvas.width, myCanvas.height);
  drawing.forEach((cmd) => { cmd.display(ctx) });
  if (cursor) { cursor.display(ctx); }
}

function moveCursor(mouseEvent){
  if(mouseEvent) {
    let point = {x: mouseEvent.offsetX, y: mouseEvent.offsetY, stroke: currentStroke};
    cursor = new Tool(point, currentTool, currentColor);
  }
  else cursor = null;
  notify("cursor-changed");
}

//* DATA CONTAINERS FOR DRAWING *//
interface Point {
  x: number,
  y: number,
  stroke: number,
};

class Line {
  points: Point[] = [];
  color: string;
  
  constructor(point, color?) {
    this.points.push( point );
    if(color) this.color = color;
    else this.color = "black";
  }

  display(ctx) {
    const {x, y, stroke} = this.points[0];
    ctx.lineWidth = stroke;
    ctx.strokeStyle = this.color;
    ctx!.beginPath();
    ctx!.moveTo(x, y);
    for (const {x, y} of this.points) { ctx!.lineTo(x, y); }
    ctx!.stroke();
  }
}

class Tool {
  point: Point;
  text: string;
  color: string;

  constructor(point, preview, color?) {
    this.point = {x: point.x, y: point.y, stroke: point.stroke};
    this.text = preview;
    if(color) this.color = color;
    else this.color = "black";
  }

  display(ctx) {
    const {x, y, stroke} = this.point;
    ctx!.font = `${this.point.stroke * 10}px monospace`;
    ctx!.fillStyle = currentColor;
    ctx!.fillText(this.text, this.point.x, this.point.y);
  }
}

//* MOUSE EVENT LISTENERS *//
let currentLine: Line | null = null;
let currentSticker: Tool | null = null;

let drawing: Array<Line | Tool> = [];
let redoDrawing: Array<Line | Tool> = [];

let cursor: Tool | null = null;

let currentStroke = THIN_STROKE;
let currentColor = "black";
let currentTool = ".";

myCanvas.addEventListener("mouseout", () => { moveCursor(null); });
myCanvas.addEventListener("mouseenter", (e) => { moveCursor(e); });

myCanvas.addEventListener("mousedown", (e) => {
  moveCursor(null);

  if(currentTool == "."){
    let point = {x: e.offsetX, y: e.offsetY, stroke: currentStroke};
    currentLine = new Line(point, currentColor);
    drawing.push(currentLine);
    redoDrawing.splice(0, redoDrawing.length);
    notify("drawing-changed");
  } 
});

myCanvas.addEventListener("mouseup", (e) => {
  moveCursor(e);

  if(currentTool == "."){
    currentLine = null;
    notify("drawing-changed");
  }else{
    let point = {x: e.offsetX, y: e.offsetY, stroke: currentStroke};
    currentSticker = new Tool(point, currentTool, currentColor);
    drawing.push(currentSticker);
    redoDrawing.splice(0, redoDrawing.length);
  }
});

myCanvas.addEventListener("mousemove", (e) => {
  if(currentTool == "."){
    if(cursor) moveCursor(e); // if line tool, will keep cursor hidden when mouse down
    currentLine!.points.push({ x: e.offsetX, y: e.offsetY, stroke: currentStroke });
    notify("drawing-changed");
  } else {
    moveCursor(e);
  }
});

//* BUTTONS *//
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
  drawing = [];
  redoDrawing = [];
  ctx!.clearRect(0, 0, myCanvas.width, myCanvas.height);
});

function pushPop(pushTo, popFrom){
  if(popFrom.length > 0){
    pushTo.push(popFrom.pop()!);
    notify("drawing-changed");
  }
}
const undo = new Button("undo", () =>{ pushPop(redoDrawing, drawing); });
const redo = new Button("redo", () =>{ pushPop(drawing, redoDrawing); });

// color selection
app.append(document.createElement("div"));
let colorChoices = ["black", "red", "blue", "green"];
let colors: Button[] = [];
for(let color of colorChoices){
  let newColor = new Button(color, () => {currentColor = color});
  newColor.button.style.backgroundColor = color;
  colors.push(newColor);
}

// ADD custom color
const customColor = new Button("[+]",()=>{
  let newColor = prompt("custom color [name, hex code, or rgb value]","purple");
  if(newColor) { 
    currentColor = newColor; 
    customColor.button.style.backgroundColor = newColor; 
  }
});

// thickness selection
app.append(document.createElement("div"));
const thicknessLabel = document.createElement("text");
function changeStoke(strokeSize){ 
  thicknessLabel.innerHTML = ` stroke: ${currentStroke = strokeSize}`; 
}

const thin = new Button("thin", () =>{ changeStoke(THIN_STROKE) }).button.click();
const thick = new Button("thick", () =>{ changeStoke(THICK_STROKE) });

app.append(thicknessLabel);

// default tools
app.append(document.createElement("div"));
const toolLabels = [".", "👁️","👃","👄",];
const tools: Button[] = [];

for(let label of toolLabels){
  tools.push(new Button(label, () => { currentTool = label; }));
}

// ADD custom stickers
const customSticker = new Button("[+]",()=>{
  let newSticker = prompt("custom sticker text","😊");
  if(newSticker) {
    toolLabels.push(newSticker);
    tools.push(new Button(newSticker, () => { currentTool = newSticker; }))
  }
});

//* EXPORT *//
app.append(document.createElement("div"));
const exportCanvas = new Button("export",()=>{
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = tempCanvas.height = 1024;

  const tempCtx = tempCanvas.getContext("2d");
  tempCtx!.scale(4,4);
  tempCtx!.fillStyle = "white";
  tempCtx!.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx!.textAlign = "center";

  drawing.forEach((cmd) => { cmd.display(tempCtx) });

  tempCanvas.toBlob(() => {
    const anchor = document.createElement("a");
    anchor.href = tempCanvas.toDataURL("image/png");
    anchor.download = "canvas.png";
    anchor.click();
  });
});

// TODO: containers to group buttons, etc