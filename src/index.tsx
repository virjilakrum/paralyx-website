import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Paralyx } from "./screens/Paralyx";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Paralyx />
  </StrictMode>,
);
