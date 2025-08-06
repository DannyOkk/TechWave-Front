import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/Authform.css"; // Actualizada la ruta

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login exitoso
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("username", username);
        onLoginSuccess(); // Esto actualiza el estado en App.js
        navigate("/dashboard"); // Esto navega inmediatamente
      } else {
        // Error de autenticación
        if (data.error) {
          setError(data.error);
        } else {
          setError("Usuario o contraseña incorrectos");
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setError("Error de conexión. Verifica tu internet.");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ AGREGAR función para ir a register:
  const handleGoToRegister = () => {
    navigate("/register");
  };

  // ⭐ AGREGAR función para volver al home:
  const handleGoToHome = () => {
    navigate("/");
  };

  return (
    <div className="auth-container authform-bg"> {/* ⭐ SOLO AGREGAR auth-container */}
      <form className="authform-card" onSubmit={handleSubmit}>
        <h2>Iniciar sesión</h2>
        <div className="authform-input-group">
          <input
            type="text"
            value={username}
            autoFocus
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu usuario"
            required
          />
        </div>
        <div className="authform-input-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
          />
        </div>
        {error && <div className="authform-error">{error}</div>}
        <button className="authform-btn" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <div className="authform-footer">
          <span>¿No tenés cuenta?</span>
          <button
            type="button"
            className="authform-link"
            onClick={handleGoToRegister}
          >
            Registrate
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;