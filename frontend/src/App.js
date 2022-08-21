import React from "react";
import './App.css';
import Game from "./game/Game";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Game />
    )
  }
}

export default App;
