import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Science from './pages/Science';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/science" element={<Science />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;