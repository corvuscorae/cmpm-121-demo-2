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
bus.addEventListener("drawing-changed", draw);
bus.addEventListener("cursor-changed", draw);

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

//* DATA CONTAINERS FOR DRAWING *//
interface Point {
  x: number,
  y: number,
  stroke: number,
};

class Line {
  points: Point[] = [];
  
  constructor(x, y, stroke) {
    this.points.push( {x, y, stroke} );
  }

  display(ctx) {
    const {x, y, stroke} = this.points[0];
    ctx.lineWidth = stroke;
    ctx!.beginPath();
    ctx!.moveTo(x, y);
    for (const {x, y} of this.points) { ctx!.lineTo(x, y); }
    ctx!.stroke();
  }
}

class Tool {
  point: Point;
  text: string;

  constructor(x, y, stroke, preview) {
    this.point = this.point = {x: x, y: y, stroke: stroke};
    this.text = preview;
  }

  display(ctx) {
    const {x, y, stroke} = this.point;
    ctx!.font = `${stroke * 10}px monospace`;
    ctx!.fillText(this.text, x, y);
  }
}

//* MOUSE EVENT LISTENERS *//
let currentLine: Line | null = null;
let currentSticker: Tool | null = null;

let drawing: Array<Line | Tool> = [];
let redoDrawing: Array<Line | Tool> = [];

let cursor: Tool | null = null;

let currentStroke = THIN_STROKE;
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
    currentSticker = new Tool(e.offsetX, e.offsetY, currentStroke, currentTool);
    drawing.push(currentSticker);
    redoDrawing.splice(0, redoDrawing.length);
  }
});

myCanvas.addEventListener("mousemove", (e) => {

  if(currentTool == "."){
    if(cursor) cursorDisplay(e);
    currentLine!.points.push({ x: e.offsetX, y: e.offsetY, stroke: currentStroke });
    notify("drawing-changed");
  } else {
    cursorDisplay(e);
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

// stroke thickness selection
app.append(document.createElement("div"));
const thicknessLabel = document.createElement("text");
function changeStoke(strokeSize){ 
  thicknessLabel.innerHTML = ` stroke: ${currentStroke = strokeSize}`; 
}

const thinStroke = new Button("thin", () =>{ changeStoke(THIN_STROKE) }).button.click();
const thickStroke = new Button("thick", () =>{ changeStoke(THICK_STROKE) });

app.append(thicknessLabel);

// stickers
app.append(document.createElement("div"));
const stickerLabels = ["👁️","👃","👄",];
const stickers: Button[] = [];

for(let label of stickerLabels){
  stickers.push(new Button(label, () => { currentTool = label; }));
}

// custom stickers
app.append(document.createElement("div"));
const customSticker = new Button("[+]",()=>{
  let newSticker = prompt("custom sticker text","😊");
  if(newSticker) {
    stickerLabels.push(newSticker);
    stickers.push(new Button(newSticker, () => { currentTool = newSticker; }))
  }
});

// export
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

