import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function PageShell({ title, children }) {
  const headingRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section>
      <h1 ref={headingRef} tabIndex="-1">
        {title}
      </h1>

      {children}

      <nav aria-label="Page navigation">
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>

        {" | "}

        <Link to="/dashboard">Home</Link>
      </nav>
    </section>
  );
}

export default PageShell;
