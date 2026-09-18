import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log("main.jsx executing!");
const container = document.getElementById("root");
console.log("Root container:", container);
createRoot(container).render(<App />);
