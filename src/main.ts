import "./style.css";

const APP_NAME = "changing something so i can publish the fork";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;
