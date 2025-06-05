import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowRegister(false);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowRegister(false);
    setShowLogin(false);
  };

  const handleSwitchToRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setShowLogin(true);
    alert("Cuenta creada exitosamente. Por favor, inicia sesión.");
  };

  if (isAuthenticated) {
    return (
      <div className="App">
        <Home onLogout={handleLogout} />
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="App">
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="App">
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      </div>
    );
  }

  // Página principal (Home pública)
  return (
    <div className="App">
      <Home
        onLoginClick={handleSwitchToLogin}
        onRegisterClick={handleSwitchToRegister} // <-- Agrega esta línea
        isPublic={true}
      />
    </div>
  );
};

export default App;