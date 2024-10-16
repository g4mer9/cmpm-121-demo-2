import "./style.css";

interface Pixel {
    x: number;
    y: number;
  }

interface Drawable {
    display(context: CanvasRenderingContext2D): void;
}

class Line implements Drawable {
    private pixels: Pixel[];

    constructor() {
        this.pixels = [];
    }

    addPixel(pixel: Pixel) {
        this.pixels.push(pixel);
    }

    display(context: CanvasRenderingContext2D): void {
        //canvas.dispatchEvent(clear_event);
        //for(const pixel of this.pixels){
            if(this.pixels.length > 1) {
                const x = this.pixels[0].x;
                const y = this.pixels[0].y;

                context?.beginPath();
                context?.moveTo(x, y);
                for(const {x, y} of this.pixels) {
                    context?.lineTo(x, y);
                }
                context?.stroke();
            }
        //}
    }

}
//INNER HTML SETUP
const APP_NAME = "Drawing Game!";

const header = document.createElement("h1");
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

//any[][] from GPT https://chatgpt.com/share/670f30d4-c6fc-8007-829e-26766989f016
const lines: Drawable[] = [];
const redos: Drawable[] = [];
let current_line: Line;
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

    current_line = new Line();
    lines.push(current_line);
    redos.splice(0, redos.length);
    const p: Pixel = {x: cursor.x, y: cursor.y};
    current_line.addPixel(p);
    
    canvas.dispatchEvent(draw_event);
});

canvas.addEventListener("mousemove", (event) => {
    if(cursor.active) {
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        const p: Pixel = {x: cursor.x, y: cursor.y};
        current_line.addPixel(p);
        canvas.dispatchEvent(draw_event);
    }
});

canvas.addEventListener("mouseup", () => {
    cursor.active = false;
    current_line = new Line();
    canvas.dispatchEvent(draw_event);
  });

//}


//draw event, adapted from glitch paint1
canvas.addEventListener(
    "draw", () => {
        canvas.dispatchEvent(clear_event);
        //console.log(lines.length)
        for(const drawing of lines){

            drawing.display(pencil!);
        }
        
    }, false,
);

//clear event
canvas.addEventListener(
    "clear", () => {
        //console.log("clear event");
        if(pencil) pencil.fillStyle = "white";
        pencil?.fillRect(0, 0, 256, 256);
        if(pencil) pencil.fillStyle = "black"; 
    }, false,
);


//clear button
const clear_button = document.createElement("button");
clear_button.innerHTML = "clear";
document.body.append(clear_button);
clear_button.addEventListener("click", () => {
    canvas.dispatchEvent(clear_event);
    current_line = new Line();
    lines.splice(0, lines.length);
    redos.splice(0, redos.length);
});


//undo button
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


//redo button
const redo_button = document.createElement("button");
redo_button.innerHTML = "redo";
document.body.append(redo_button);
redo_button.addEventListener("click", () => {
    if(redos.length > 0) {
        lines.push(redos[redos.length - 1]);
        redos.pop();
        canvas.dispatchEvent(draw_event);
    }
});

