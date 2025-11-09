import React, { useState, useEffect } from 'react';
import { Link, ExternalLink, CheckCircle, Copy, RefreshCw, Zap, MessageSquare, Download } from 'lucide-react';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import './MCPConnect.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const MCPConnect = () => {
  const [mcpSettings, setMCPSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [importHistory, setImportHistory] = useState([]);

  useEffect(() => {
    fetchMCPSettings();
    fetchImportHistory();
  }, []);

  const fetchMCPSettings = async () => {
    try {
      const response = await axios.get(`${API}/mcp/settings?user_id=demo_user`);
      setMCPSettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching MCP settings:', error);
      setLoading(false);
    }
  };

  const fetchImportHistory = async () => {
    try {
      const response = await axios.get(`${API}/mcp/history?user_id=demo_user&limit=10`);
      setImportHistory(response.data.imports || []);
    } catch (error) {
      console.error('Error fetching import history:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <AppLayout title="MCP Connection">
        <div className="mcp-loading">
          <RefreshCw className="spin" size={32} />
          <p>Loading MCP settings...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Memory Control Protocol (MCP)">
      <div className="mcp-container">
        
        {/* Hero Section */}
        <div className="mcp-hero">
          <Zap size={48} className="mcp-hero-icon" />
          <h1>Turn Your AI Chats Into Permanent Knowledge</h1>
          <p>Connect Claude, Perplexity, or ChatGPT to automatically capture insights, generate quizzes, and build your knowledge graph.</p>
        </div>

        {/* Connection Status */}
        <div className="mcp-status-card">
          <div className="mcp-status-header">
            <CheckCircle size={24} className="status-icon active" />
            <h2>MCP Server Active</h2>
          </div>
          <p className="mcp-status-text">Your MentraFlow MCP endpoint is ready to receive exports from AI platforms.</p>
        </div>

        {/* Endpoint URL */}
        <div className="mcp-endpoint-section">
          <h3>Your MCP Endpoint URL</h3>
          <p className="mcp-section-description">
            Copy this URL and configure it in your AI platform's MCP settings
          </p>
          
          <div className="mcp-url-box">
            <code className="mcp-url">{mcpSettings?.mcp_endpoint_url}</code>
            <button 
              className="mcp-copy-btn"
              onClick={() => copyToClipboard(mcpSettings?.mcp_endpoint_url)}
            >
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Platform Instructions */}
        <div className="mcp-platforms">
          <h3>Enable MCP in Your AI Platform</h3>
          
          {/* Claude */}
          <div className="mcp-platform-card">
            <div className="mcp-platform-header">
              <MessageSquare size={24} />
              <h4>Claude Desktop</h4>
              <span className="mcp-badge">Recommended</span>
            </div>
            <div className="mcp-platform-body">
              <p className="mcp-platform-description">
                Export your Claude conversations directly to MentraFlow with one click.
              </p>
              
              <div className="mcp-steps">
                <div className="mcp-step">
                  <span className="mcp-step-number">1</span>
                  <div className="mcp-step-content">
                    <strong>Open Claude Settings</strong>
                    <p>Go to Settings → Developer → MCP Servers</p>
                  </div>
                </div>
                
                <div className="mcp-step">
                  <span className="mcp-step-number">2</span>
                  <div className="mcp-step-content">
                    <strong>Add MentraFlow Server</strong>
                    <p>Click "Add Server" and paste your endpoint URL</p>
                  </div>
                </div>
                
                <div className="mcp-step">
                  <span className="mcp-step-number">3</span>
                  <div className="mcp-step-content">
                    <strong>Configure & Enable</strong>
                    <p>Name: "MentraFlow" | Enable auto-export for new chats</p>
                  </div>
                </div>
                
                <div className="mcp-step">
                  <span className="mcp-step-number">4</span>
                  <div className="mcp-step-content">
                    <strong>Start Exporting</strong>
                    <p>Click "Export to MentraFlow" in any conversation</p>
                  </div>
                </div>
              </div>

              <a 
                href="https://docs.anthropic.com/claude/docs/mcp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mcp-docs-link"
              >
                <ExternalLink size={16} />
                View Claude MCP Documentation
              </a>
            </div>
          </div>

          {/* Perplexity */}
          <div className="mcp-platform-card">
            <div className="mcp-platform-header">
              <Zap size={24} />
              <h4>Perplexity</h4>
              <span className="mcp-badge mcp-badge-coming-soon">Coming Soon</span>
            </div>
            <div className="mcp-platform-body">
              <p className="mcp-platform-description">
                Export Perplexity search sessions and research threads.
              </p>
              <p className="mcp-coming-soon-text">
                Perplexity MCP integration is in development. Join the waitlist to be notified when it's ready.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mcp-how-it-works">
          <h3>How MCP Works</h3>
          <div className="mcp-flow">
            <div className="mcp-flow-step">
              <div className="mcp-flow-icon">1</div>
              <h4>You Chat</h4>
              <p>Have conversations in Claude or Perplexity as usual</p>
            </div>
            
            <div className="mcp-flow-arrow">→</div>
            
            <div className="mcp-flow-step">
              <div className="mcp-flow-icon">2</div>
              <h4>Click Export</h4>
              <p>Export latest 5-10 chats to MentraFlow</p>
            </div>
            
            <div className="mcp-flow-arrow">→</div>
            
            <div className="mcp-flow-step">
              <div className="mcp-flow-icon">3</div>
              <h4>Auto-Processing</h4>
              <p>AI summarizes, extracts concepts, generates quizzes</p>
            </div>
            
            <div className="mcp-flow-arrow">→</div>
            
            <div className="mcp-flow-step">
              <div className="mcp-flow-icon">4</div>
              <h4>Knowledge Graph</h4>
              <p>Concepts added to your graph with scheduled recall</p>
            </div>
          </div>
        </div>

        {/* Import History */}
        {importHistory.length > 0 && (
          <div className="mcp-history">
            <h3>Recent Imports</h3>
            <div className="mcp-history-list">
              {importHistory.map((import_item, index) => (
                <div key={index} className="mcp-history-item">
                  <Download size={20} />
                  <div className="mcp-history-details">
                    <strong>{import_item.platform}</strong>
                    <span>{import_item.concepts_extracted} concepts | {import_item.quizzes_generated} quizzes</span>
                  </div>
                  <span className="mcp-history-time">{import_item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mcp-settings-card">
          <h3>MCP Settings</h3>
          <div className="mcp-settings-grid">
            <div className="mcp-setting-item">
              <label>Auto Quiz Generation</label>
              <span className="mcp-setting-value">
                {mcpSettings?.auto_quiz_generation ? '✅ Enabled' : '❌ Disabled'}
              </span>
            </div>
            <div className="mcp-setting-item">
              <label>Summarization Model</label>
              <span className="mcp-setting-value">{mcpSettings?.summarization_model}</span>
            </div>
            <div className="mcp-setting-item">
              <label>Max Conversations per Export</label>
              <span className="mcp-setting-value">{mcpSettings?.max_conversations_per_export}</span>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default MCPConnect;
