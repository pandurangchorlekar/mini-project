import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Login from "./Login";
import QuizApp from "./QuizApp";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);

  return user ? (
    <QuizApp user={user} />
  ) : (
    <Login onLogin={setUser} />
  );
}

createRoot(document.getElementById("root")).render(<App />);
