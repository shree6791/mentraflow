import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { injectThemeVariables } from './constants/theme';
import Home from './pages/Home';
import Science from './pages/Science';
import Vision from './pages/Vision';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Billing from './pages/Billing';
import Payment from './pages/Payment';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import MCPConnect from './pages/MCPConnect';

function App() {
  // Inject theme CSS variables on mount
  useEffect(() => {
    injectThemeVariables();
  }, []);
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/science" element={<Science />} />
            <Route path="/vision" element={<Vision />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
            <Route path="/mcp-connect" element={<MCPConnect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;