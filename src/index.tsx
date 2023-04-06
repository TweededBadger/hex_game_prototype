import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

import { Main } from "./Main";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// document.addEventListener("DOMContentLoaded", () => {

// });

const start = () => {
  const main = new Main(30);
  main.start();
};

if (document.readyState !== "loading") {
  console.log("document is already ready, just execute code here");
  start();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    console.log("document was not ready, place code here");
    start();
  });
}
