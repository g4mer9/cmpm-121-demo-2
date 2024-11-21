import "./style.css";
/**copilot prompt: Each time a tool button (a marker or sticker button) is pressed, randomize the color/rotation that will be used next time the tool is used. The tool preview display should help them decide if they want to keep clicking to get a different random variation.
 */

//EVENT BUS SETUP====================================================================================
//used example for this and most of step 7 https://quant-paint.glitch.me/paint2.html
let cursorCommand : CursorCommand | null = null;
const bus = new EventTarget();
function notify(name: string) {
    bus.dispatchEvent(new Event(name));
}
const draw_event = new Event("draw");
const clear_event = new Event("clear");
const list_of_buttons: string[] = ["thick", "thin", "💖", "🍒", "😀"];
const list_of_colors: string[] = ["red", "blue", "green", "purple", "orange", "black", "brown", "pink", "yellow", "gray"];
let current_color: string = "black";
const THICK_FONT: string = "22px monospace";
const THIN_FONT: string = "12px monospace";
const THICK_LINE_WIDTH: number = 7;
const THIN_LINE_WIDTH: number = 3;

//INTERFACES=========================================================================================
interface Pixel {
    x: number;
    y: number;
  }

interface Drawable {
    type: string,
    color: string,
    addPixel(pixel: Pixel): void,
    display(context: CanvasRenderingContext2D): void;
}
interface CursorCommand {
    x: number,
    y: number,
    type: string,
    execute(context: CanvasRenderingContext2D): void
}


//LINE CREATE FUNCTION================================================================================
function createLine(type: string, color: string): Drawable {
    const pixels: Pixel[] = [];
    return {
        type, 
        color,
        addPixel(pixel: Pixel): void {
            pixels.push(pixel);
        },
        display(context: CanvasRenderingContext2D): void {
            context.fillStyle = this.color;
            context.strokeStyle = this.color;
            if(pixels.length > 1) {
                const x = pixels[0].x;
                const y = pixels[0].y;
                if(type == "thick") context.lineWidth = THICK_LINE_WIDTH;
                else if(type == "thin")context.lineWidth = THIN_LINE_WIDTH;
                context?.beginPath();
                context?.moveTo(x, y);
                for(const {x, y} of pixels) {
                    context?.lineTo(x, y);
                }
                context?.stroke();
            }
            else if(type != "thick" && type != "thin") {
                const x = pixels[0].x;
                const y = pixels[0].y;
                context.fillText(type, x, y);
            }
        }
    }
}

//CURSOR COMMAND CREATE FUNCTION=====================================================================
function createCursorCommand(x: number, y: number, type: string) {
    return {
        x,
        y,
        type,
        execute(context: CanvasRenderingContext2D): void {
            if(type == "thick") {
                context.font = THICK_FONT
                context.fillText("o", x - 8, y + 8);
            }
            else if(type == "thin"){
                context.font = THIN_FONT
                context.fillText("o", x - 4, y);
            }
            else {
                context.font = THICK_FONT
                context.fillText(type, x - 18, y + 10);
            }
        }
    }
}

//INNER HTML SETUP===================================================================================
const APP_NAME = "Drawing Game!";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

const header = document.createElement("h1");
header.textContent = APP_NAME;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.height = 256;
canvas.width = 256;

const format = document.createElement("div");
format.id = "canvas-format";
format.appendChild(header);
format.appendChild(canvas);
app.appendChild(format);

//any[][] from GPT https://chatgpt.com/share/670f30d4-c6fc-8007-829e-26766989f016 (redundant now since style checker didn't like any[][])
const lines: Drawable[] = [];
const redos: Drawable[] = [];
let current_line_type: string = "thin";//thin
let current_line: Drawable;
const pencil = canvas.getContext("2d");

//initial clear
if(pencil) pencil.fillStyle = "white";
pencil?.fillRect(0, 0, 256, 256);
if(pencil) pencil.fillStyle = "black";
pencil?.translate(128, 128);
canvas.parentNode?.insertBefore(header, canvas);
function redraw() {
    canvas.dispatchEvent(draw_event);
}



//EVENT DEFINITIONS==================================================================================

canvas.addEventListener("mouseout", () => {
    cursorCommand = null;
    notify("tool-moved");
});

canvas.addEventListener("mouseenter", (e) => {
    cursorCommand = createCursorCommand(e.offsetX, e.offsetY, current_line_type);
    notify("tool-moved");
});


//from the glitch example https://quant-paint.glitch.me/paint0.html {
//mouse click event
const cursor = {active: false, x: 0, y: 0};
canvas.addEventListener("mousedown", (event) => {
    cursor.active = true;
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;

    current_line = createLine(current_line_type, current_color);

    lines.push(current_line);
    redos.splice(0, redos.length);
    let p: Pixel;
    if(current_line.type == "thin" || current_line.type == "thick") p = {x: cursor.x, y: cursor.y};
    else p = {x: cursor.x - 18, y: cursor.y + 10};
    current_line.addPixel(p);
    
    canvas.dispatchEvent(draw_event);
});


//mouse move event
canvas.addEventListener("mousemove", (event) => {
    if(cursor.active && (current_line.type == "thin" || current_line.type == "thick")) {
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        const p: Pixel = {x: cursor.x, y: cursor.y};
        current_line.addPixel(p);
        canvas.dispatchEvent(draw_event);
    }
    else if(cursor.active) {
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        current_line = createLine(current_line_type, current_color);
        lines.pop();
        lines.push(current_line);
        redos.splice(0, redos.length);
        const p: Pixel = {x: cursor.x-18, y: cursor.y+10};
        current_line.addPixel(p);
        canvas.dispatchEvent(draw_event);
    }
    else {
        cursorCommand = createCursorCommand(event.offsetX, event.offsetY, current_line_type);
        notify("tool-moved");
    }
});


//mouse release event
canvas.addEventListener("mouseup", () => {
    cursor.active = false;
    current_line = createLine(current_line_type, current_color);
    canvas.dispatchEvent(draw_event);
});

//draw event, adapted from glitch paint1
canvas.addEventListener(
    "draw", () => {
        canvas.dispatchEvent(clear_event);
        for(const drawing of lines){

            drawing.display(pencil!);
        }
        if(cursorCommand && pencil) cursorCommand.execute(pencil);
        
    }, false,
);

//clear event
canvas.addEventListener(
    "clear", () => {
        if(pencil) pencil.fillStyle = "white";
        pencil?.fillRect(0, 0, 256, 256);
        if(pencil) pencil.fillStyle = "black"; 
    }, false,
);

//BUTTONS============================================================================================
//clear button
const clear_button = document.createElement("button");
clear_button.innerHTML = "clear";
document.body.append(clear_button);
clear_button.addEventListener("click", () => {
    canvas.dispatchEvent(clear_event);
    current_line = createLine(current_line_type, current_color);
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


for(const button of list_of_buttons) {
    const new_button = document.createElement("button");
    new_button.innerHTML = button;
    document.body.append(new_button);
    new_button.addEventListener("click", () => {
        current_line_type = button;
        current_color = list_of_colors[Math.floor(Math.random() * list_of_colors.length)];
        pencil?.rotate(Math.random() * 2 * Math.PI);
        notify("tool-moved");
    });
 }

const custom_button = document.createElement("button");
custom_button.innerHTML = "custom";
document.body.append(custom_button);
custom_button.addEventListener("click", () => {
    const custom_input = prompt("Enter a custom string:", "text or emoji");
    if(custom_input) current_line_type = custom_input;
    notify("tool-moved");
});

const download_button = document.createElement("button");
download_button.innerHTML = "download";
document.body.append(download_button);
download_button.addEventListener("click", () => {
    const new_canvas = document.createElement("canvas");
    new_canvas.height = 1024;
    new_canvas.width = 1024;
    const new_pencil = new_canvas.getContext("2d");
    if(new_pencil) new_pencil.scale(4, 4);
    if(new_pencil) new_pencil.fillStyle = "white";
    new_pencil?.fillRect(0, 0, 1024, 1024);
    if(new_pencil) new_pencil.fillStyle = "black";
    for(const drawing of lines){
        if(drawing.type == "thin" && new_pencil) new_pencil.font = THIN_FONT
        else if(new_pencil) new_pencil.font = THICK_FONT
        drawing.display(new_pencil!);
    }
    const url = new_canvas.toDataURL();
    const a = document.createElement("a");
    a.href = url;
    a.download = "drawing.png";
    a.click();
});

//EVENT LISTENERS====================================================================================
bus.addEventListener("tool-moved", redraw);

function tick() {
    redraw();
    requestAnimationFrame(tick);
}
tick();