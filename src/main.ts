import "./style.css";

//EVENT BUS SETUP====================================================================================
//used example for this and most of step 7 https://quant-paint.glitch.me/paint2.html
let cursorCommand : CursorCommand | null = null;
const bus = new EventTarget();
function notify(name: string) {
    bus.dispatchEvent(new Event(name));
}
const draw_event = new Event("draw");
const clear_event = new Event("clear");

//INTERFACES=========================================================================================
interface Pixel {
    x: number;
    y: number;
  }

interface Drawable {
    type: boolean,
    addPixel(pixel: Pixel): void,
    display(context: CanvasRenderingContext2D): void;
}
interface CursorCommand {
    x: number,
    y: number,
    type: boolean,
    execute(context: CanvasRenderingContext2D): void
}


//LINE CREATE FUNCTION================================================================================
function createLine(type: boolean): Drawable {
    const pixels: Pixel[] = [];
    return {
        type, 
        addPixel(pixel: Pixel): void {
            pixels.push(pixel);
        },
        display(context: CanvasRenderingContext2D): void {
            if(pixels.length > 1) {
                const x = pixels[0].x;
                const y = pixels[0].y;
                if(this.type) context.lineWidth = 10;
                else context.lineWidth = 1;
                context?.beginPath();
                context?.moveTo(x, y);
                for(const {x, y} of pixels) {
                    context?.lineTo(x, y);
                }
                context?.stroke();
            }
        }
    }
}

//CURSOR COMMAND CREATE FUNCTION=====================================================================
function createCursorCommand(x: number, y: number, type: boolean) {
    return {
        x,
        y,
        type,
        execute(context: CanvasRenderingContext2D): void {
            if(type) {
                context.font = "32px monospace";
                context.fillText("o", x - 8, y + 8);
            }
            else {
                context.font = "8px monospace";
                context.fillText("o", x - 4, y);
            }
            
        }
    }
}

//INNER HTML SETUP===================================================================================
const APP_NAME = "Drawing Game!";
const header = document.createElement("h1");
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
//any[][] from GPT https://chatgpt.com/share/670f30d4-c6fc-8007-829e-26766989f016 (redundant now since style checker didn't like any[][])
const lines: Drawable[] = [];
const redos: Drawable[] = [];
let current_line_type: boolean = false;//thin
let current_line: Drawable;
canvas.height = 256;
canvas.width = 256;
const pencil = canvas.getContext("2d");
//initial clear
if(pencil) pencil.fillStyle = "white";
pencil?.fillRect(0, 0, 256, 256);
if(pencil) pencil.fillStyle = "black";
document.title = APP_NAME;
header.innerHTML = APP_NAME;
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

    current_line = createLine(current_line_type);

    lines.push(current_line);
    redos.splice(0, redos.length);
    const p: Pixel = {x: cursor.x, y: cursor.y};
    current_line.addPixel(p);
    
    canvas.dispatchEvent(draw_event);
});


//mouse move event
canvas.addEventListener("mousemove", (event) => {
    if(cursor.active) {
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        const p: Pixel = {x: cursor.x, y: cursor.y};
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
    current_line = createLine(current_line_type);
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
    current_line = createLine(current_line_type);
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


//Thick button
const thick_button = document.createElement("button");
thick_button.innerHTML = "thick";
document.body.append(thick_button);
thick_button.addEventListener("click", () => {
    current_line_type = true;
});

//thin button
const thin_button = document.createElement("button");
thin_button.innerHTML = "thin";
document.body.append(thin_button);
thin_button.addEventListener("click", () => {
    current_line_type = false;
});


bus.addEventListener("tool-moved", redraw);

function tick() {
    redraw();
    requestAnimationFrame(tick);
}
tick();

/**STEP 8 PSEUDOCODE {
    context.fillText(text, x, y);
    context.translate(x, y); //changes "origin point" on canvas so next drawing that calls 0,0 is actually at the new spot
    context.rotate((45* Math.PI) / 180); //degree rotation format, same as translate
    context.resetTransform();

    3 different emojis https://emojipedia.org/cookie
    fire tool-moved when you click the different brush types
    preview for sticker placement
    drag and click repositions instead of painting over
}*/