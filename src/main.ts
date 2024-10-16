import "./style.css";

const APP_NAME = "sticker sketch";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

// app title
const title = document.createElement("h1");
title.innerHTML = APP_NAME;
app.append(title);

// canvas
const canvas = document.createElement("canvas");
canvas.width = canvas.height = 256;
app.append(canvas);