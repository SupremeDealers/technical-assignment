import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { LoginScreen } from "./LoginScreen";
import { RegisterScreen } from "./RegisterScreen";

export function AuthPages() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="auth-container">
      {isLoginMode ? (
        <>
          <LoginScreen />
          <p style={{ textAlign: "center", marginTop: 16 }}>
            Don't have an account?{" "}
            <button
              onClick={() => setIsLoginMode(false)}
              style={{ background: "none", border: "none", color: "#0066cc", cursor: "pointer", textDecoration: "underline" }}
            >
              Sign up
            </button>
          </p>
        </>
      ) : (
        <>
          <RegisterScreen />
          <p style={{ textAlign: "center", marginTop: 16 }}>
            Already have an account?{" "}
            <button
              onClick={() => setIsLoginMode(true)}
              style={{ background: "none", border: "none", color: "#0066cc", cursor: "pointer", textDecoration: "underline" }}
            >
              Log in
            </button>
          </p>
        </>
      )}
    </div>
  );
}
