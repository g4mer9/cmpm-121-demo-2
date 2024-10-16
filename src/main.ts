import "./style.css";


//INNER HTML SETUP
const APP_NAME = "Drawing Game!";

const header = document.createElement("h1");
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

//any[][] from GPT https://chatgpt.com/share/670f30d4-c6fc-8007-829e-26766989f016
let lines: any[][] = [];
let redos: any[][] = [];
let current_line: any[];
canvas.height = 256;
canvas.width = 256;
const pencil = canvas.getContext("2d");
if(pencil) pencil.fillStyle = "white";
pencil?.fillRect(0, 0, 256, 256);
if(pencil) pencil.fillStyle = "black";
document.title = APP_NAME;
header.innerHTML = APP_NAME;
canvas.parentNode?.insertBefore(header, canvas);

const draw_event = new Event("draw");
const clear_event = new Event("clear");

//from the glitch example https://quant-paint.glitch.me/paint0.html {
const cursor = {active: false, x: 0, y: 0};

canvas.addEventListener("mousedown", (event) => {
    cursor.active = true;
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;

    current_line = [];
    lines.push(current_line);
    redos.splice(0, redos.length);
    current_line.push({x: cursor.x, y: cursor.y});
    
    canvas.dispatchEvent(draw_event);
});

canvas.addEventListener("mousemove", (event) => {
    if(cursor.active) {
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        current_line.push({x: cursor.x, y: cursor.y});
        canvas.dispatchEvent(draw_event);
    }
});

canvas.addEventListener("mouseup", (event) => {
    cursor.active = false;
    current_line = [];
    canvas.dispatchEvent(draw_event);
  });

//}


//draw event, adapted from glitch paint1
canvas.addEventListener(
    "draw", (e) => {
        canvas.dispatchEvent(clear_event);
        for(const line of lines){
            if(line.length > 1) {
                const x = line[0].x;
                const y = line[0].y;

                pencil?.beginPath();
                pencil?.moveTo(x, y);
                for(const {x, y} of line) {
                    pencil?.lineTo(x, y);
                }
                pencil?.stroke();
            }
        }
        
    }, false,
);

//clear event
canvas.addEventListener(
    "clear", (e) => {
        console.log("clear event");
        if(pencil) pencil.fillStyle = "white";
        pencil?.fillRect(0, 0, 256, 256);
        if(pencil) pencil.fillStyle = "black"; 
    }, false,
);

const clear_button = document.createElement("button");
clear_button.innerHTML = "clear";
document.body.append(clear_button);
clear_button.addEventListener("click", () => {
    canvas.dispatchEvent(clear_event);
    current_line = [];
    lines.splice(0, lines.length);
});

const undo_button = document.createElement("button");
undo_button.innerHTML = "undo";
document.body.append(undo_button);
undo_button.addEventListener("click", () => {
    if(lines.length > 0) {
        redos.push(lines[lines.length - 1]);
        lines.pop();
        canvas.dispatchEvent(draw_event);
    }
});

const redo_button = document.createElement("button");
redo_button.innerHTML = "redo";
document.body.append(redo_button);
redo_button.addEventListener("click", () => {
    if(lines.length > 0) {
        lines.push(redos[redos.length - 1]);
        redos.pop();
        canvas.dispatchEvent(draw_event);
    }
});

