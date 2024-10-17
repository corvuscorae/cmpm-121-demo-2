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
myCanvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
});

myCanvas.addEventListener("mouseup", () => {
    cursor.active = false;
});

myCanvas.addEventListener("mousemove", (e) => {
    if (cursor.active) {
      ctx?.beginPath();
      ctx?.moveTo(cursor.x, cursor.y);
      ctx?.lineTo(e.offsetX, e.offsetY);
      ctx?.stroke();
      cursor.x = e.offsetX;
      cursor.y = e.offsetY;
    }
});

// clear canvas
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
    ctx?.clearRect(0, 0, myCanvas.width, myCanvas.height);
    ctx?.fillRect(0, 0, myCanvas.width, myCanvas.height);
});