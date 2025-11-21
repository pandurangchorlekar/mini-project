import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");

  function submit(e) {
    e.preventDefault();
    if (username.trim() === "") {
      alert("Enter any username");
      return;
    }
    onLogin(username);
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600">
      <form
        onSubmit={submit}
        className="bg-white p-6 rounded-xl shadow-xl w-80"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
