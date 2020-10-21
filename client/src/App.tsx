import React from "react";
import "./App.scss";
import { Home } from "./features/home/Home";

function App() {
  return (
    <div className="App">
      <header className="App-header"></header>
      <h1>Welcome to Taps!</h1>

      <Home />
    </div>
  );
}

export default App;
