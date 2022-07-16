import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="App">
      <nav>
        <Link to="/home">Home</Link>
        <Link to="/search">Search</Link>
      </nav>
      <div className="App__outlet-wrapper">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
