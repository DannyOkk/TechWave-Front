import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/Authform.css"; // Actualizada la ruta

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/create-user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          role: "client", // Por defecto los registros son clientes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registro exitoso
        onRegisterSuccess(); // Mostrar mensaje
        navigate("/login"); // Navegar al login
      } else {
        // Error del servidor
        if (data.username) {
          setError("El nombre de usuario ya existe");
        } else if (data.email) {
          setError("El email ya está registrado");
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("Error al crear la cuenta. Intenta nuevamente.");
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setError("Error de conexión. Verifica tu internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container authform-bg"> {/* ⭐ SOLO AGREGAR auth-container */}
      <form className="authform-card" onSubmit={handleSubmit}>
        <h2>Registrarse</h2>
        <div className="authform-input-group">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
            required
          />
        </div>
        <div className="authform-input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
          />
        </div>
        <div className="authform-input-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            minLength="6"
          />
        </div>
        <div className="authform-input-group">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            required
            minLength="6"
          />
        </div>
        {error && <div className="authform-error">{error}</div>}
        <button className="authform-btn" type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        <div className="authform-footer">
          <span>¿Ya tienes cuenta?</span>
          <button
            type="button"
            className="authform-link"
            onClick={handleGoToLogin}
          >
            Inicia sesión aquí
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;