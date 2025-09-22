import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Signup } from "./components/Signup.jsx";
import { Login } from "./components/Login.jsx";
import { Forget } from "./components/Forget.jsx";
import { Reset } from "./components/Reset.jsx";
import { ConfirmEmail } from "./components/ConfirmEmail.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<Forget />} />
        <Route path="/forget-password" element={<Reset />} />
        <Route path="/confirm" element={<ConfirmEmail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
