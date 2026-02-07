import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Board from "./Board";
import Login from "./Login";
import Signup from "./Signup";

export function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Board />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>

    // <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
    //   <h1 style={{ margin: 0 }}>Team Boards (starter)</h1>
    //   <p style={{ maxWidth: 760, lineHeight: 1.4 }}>
    //     This is a minimal scaffold. Candidates will implement routing, auth,
    //     board UI, tasks, comments, and all required behaviors.
    //   </p>

    //   <section
    //     style={{
    //       marginTop: 16,
    //       padding: 16,
    //       border: "1px solid #ddd",
    //       borderRadius: 12,
    //     }}
    //   >
    //     <h2 style={{ marginTop: 0 }}>API connectivity check</h2>
    //     <p>
    //       Ensure the API is running and visit <code>/health</code> on port 4000.
    //     </p>
    //   </section>
    // </div>
  );
}
