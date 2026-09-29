import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import "../styles/themes.css";

function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Use t(), but keep an English fallback for keys that
  // have not been added to every language file yet.
  const text = (key, fallback) => {
    const translated = t(key);

    if (!translated || translated === key) {
      return fallback;
    }

    return translated;
  };

  const focusPageHeading = () => {
    setTimeout(() => {
      const heading = document.querySelector("main h1");

      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }
    }, 0);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError(
        text(
          "login.invalidEmail",
          "Please enter a valid email address."
        )
      );
      return;
    }

    if (password.length < 4) {
      setError(
        text(
          "login.passwordTooShort",
          "Password must be at least 4 characters."
        )
      );
      return;
    }

    /*
      HACKATHON V1 DEMO LOGIN

      This is only a local demo login.

      IMPORTANT:
      This must later be replaced with real FastAPI backend
      authentication.

      Never store the password in localStorage.
    */

    localStorage.setItem("udaan-demo-user", cleanEmail);

    // IMPORTANT ACCESSIBILITY RULE:
    // Never send the password to speechSynthesis,
    // voice commands, announcements, logs, or localStorage.

    navigate("/dashboard");

    // Move keyboard focus to the new page heading.
    focusPageHeading();
  };

  return (
    <main
      className="setup-page"
      aria-labelledby="login-heading"
    >
      <div className="setup-container">
        <section
          className="setup-card"
          style={{
            maxWidth: "560px",
            margin: "0 auto",
          }}
        >
          <header className="setup-header">
            <h1 id="login-heading" tabIndex="-1">
              {text("login.title", "Login to Udaan")}
            </h1>

            <p>
              {text(
                "login.description",
                "Sign in to continue to your accessible learning dashboard."
              )}
            </p>
          </header>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                border: "2px solid currentColor",
                borderRadius: "10px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div
              className="setup-section"
              style={{ marginBottom: "1.25rem" }}
            >
              <label htmlFor="email">
                {text("login.email", "Email")}
              </label>

              <input
                id="email"
                name="email"
                type="email"
                className="setup-select"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                autoComplete="email"
                inputMode="email"
                required
                aria-required="true"
                style={{
                  width: "100%",
                  marginTop: "0.5rem",
                }}
              />
            </div>

            <div
              className="setup-section"
              style={{ marginBottom: "1.5rem" }}
            >
              <label htmlFor="password">
                {text("login.password", "Password")}
              </label>

              <input
                id="password"
                name="password"
                type="password"
                className="setup-select"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                autoComplete="current-password"
                required
                aria-required="true"
                aria-describedby="password-help"
                style={{
                  width: "100%",
                  marginTop: "0.5rem",
                }}
              />

              <p
                id="password-help"
                style={{
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}
              >
                {text(
                  "login.passwordHelp",
                  "For this demo, use at least 4 characters."
                )}
              </p>
            </div>

            <button
              type="submit"
              className="primary-button"
              style={{
                width: "100%",
                minHeight: "56px",
              }}
            >
              {text("login.loginButton", "Login")}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Login;