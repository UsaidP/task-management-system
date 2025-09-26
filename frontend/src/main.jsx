import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Signup } from "./components/auth/Signup.jsx";
import { Login } from "./components/auth/Login.jsx";
import { Forget } from "./components/auth/Forget.jsx";
import { Reset } from "./components/auth/Reset.jsx";
import { ConfirmEmail } from "./components/auth/ConfirmEmail.jsx";
import Me from "./components/auth/Me.jsx";
import Logout from "./components/auth/Logout.jsx";
import { AuthProvider } from "./components/auth/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<Forget />} />
          <Route path="/forget-password" element={<Reset />} />
          <Route path="/confirm" element={<ConfirmEmail />} />
          <Route path="/profile" element={<Me />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
