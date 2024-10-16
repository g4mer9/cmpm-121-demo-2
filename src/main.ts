import "./style.css";


//INNER HTML SETUP
const APP_NAME = "Drawing Program!";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.height = 256;
canvas.width = 256;
const ctx = canvas.getContext("2d");
if(ctx) ctx.fillStyle = "white";
ctx?.fillRect(0, 0, 256, 256);
if(ctx) ctx.fillStyle = "black";

document.title = APP_NAME;
app.innerHTML = APP_NAME;
header.innerHTML = APP_NAME;
app.parentNode?.insertBefore(header, app);



//from the glitch example https://quant-paint.glitch.me/paint0.html {
const cursor = {active: false, x: 0, y: 0};

canvas.addEventListener("mousedown", (event) => {
    cursor.active = true;
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
});

canvas.addEventListener("mousemove", (event) => {
    if(cursor.active) {
        ctx?.beginPath();
        ctx?.moveTo(cursor.x, cursor.y);
        ctx?.lineTo(event.offsetX, event.offsetY);
        ctx?.stroke();
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
    }
});

canvas.addEventListener("mouseup", (event) => {
    cursor.active = false;
  });

//}

const clear_button = document.createElement("button");
clear_button.innerHTML = "clear";
document.body.append(clear_button);
clear_button.addEventListener("click", () => {
    if(ctx) ctx.fillStyle = "white";
    ctx?.fillRect(0, 0, 256, 256);
    if(ctx) ctx.fillStyle = "black";
});