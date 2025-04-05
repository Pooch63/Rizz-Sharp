import React from "react";
import logo from "./logo.svg";
import "./App.scss";

import { Playground } from "./playground";

function App() {
  return (
    <div className="App">
      <header className="App-header"></header>
      <div className="playground-container">
        <Playground />
      </div>
    </div>
  );
}

export default App;
