import { useEffect, useRef } from "react";
import "./App.css";
import { Application } from "./canvas";

function App() {
  const canvasRef = useRef<Application>();
  useEffect(() => {
    canvasRef.current = new Application();
    canvasRef.current.init();
  }, []);

  return (
    <div className="App">
      <canvas id="canvas" />
    </div>
  );
}

export default App;
