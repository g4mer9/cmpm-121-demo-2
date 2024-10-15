import "./style.css";

const APP_NAME = "Drawing Program!";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.height = 256;
canvas.width = 256;
const ctx = canvas.getContext("2d");


document.title = APP_NAME;
app.innerHTML = APP_NAME;
header.innerHTML = APP_NAME;
app.parentNode?.insertBefore(header, app);
