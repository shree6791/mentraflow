import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronRight, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const MCPImportsSection = () => {
  const navigate = useNavigate();
  const [mcpConcepts, setMcpConcepts] = useState([]);
  const [mcpStats, setMcpStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetchMCPData();
  }, []);

  const fetchMCPData = async () => {
    try {
      setLoading(true);
      
      // Fetch MCP concepts
      const conceptsResponse = await axios.get(`${BACKEND_URL}/api/mcp/concepts?user_id=demo_user&limit=5`);
      setMcpConcepts(conceptsResponse.data.concepts || []);
      
      // Fetch MCP settings/stats
      const settingsResponse = await axios.get(`${BACKEND_URL}/api/mcp/settings?user_id=demo_user`);
      setMcpStats(settingsResponse.data.stats || {});
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching MCP data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mcp-imports-section loading">
        <div className="mcp-header">
          <div className="mcp-title">
            <Zap size={20} style={{ color: '#14B8A6' }} />
            <h3>AI Conversation Imports</h3>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>Loading...</p>
      </div>
    );
  }

  // Don't show section if no MCP imports
  if (!mcpConcepts || mcpConcepts.length === 0) {
    return null;
  }

  return (
    <div className="mcp-imports-section">
      <div className="mcp-header">
        <div className="mcp-title">
          <Zap size={20} style={{ color: '#14B8A6' }} />
          <h3>AI Conversation Imports</h3>
          <span className="mcp-badge">
            {mcpStats?.total_concepts || mcpConcepts.length} concepts
          </span>
        </div>
        <div className="mcp-actions">
          <button 
            className="mcp-link-btn"
            onClick={() => navigate('/mcp-connect')}
          >
            <Settings size={16} />
            Configure MCP
          </button>
          <button 
            className="mcp-expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <div className="mcp-stats-bar">
            <div className="mcp-stat">
              <span className="mcp-stat-label">Total Imports</span>
              <span className="mcp-stat-value">{mcpStats?.total_imports || 0}</span>
            </div>
            <div className="mcp-stat">
              <span className="mcp-stat-label">Concepts Extracted</span>
              <span className="mcp-stat-value">{mcpStats?.total_concepts || 0}</span>
            </div>
            <div className="mcp-stat">
              <span className="mcp-stat-label">Quizzes Generated</span>
              <span className="mcp-stat-value">{mcpStats?.total_quizzes || 0}</span>
            </div>
            <div className="mcp-stat">
              <span className="mcp-stat-label">From Claude</span>
              <span className="mcp-stat-value">{mcpStats?.concepts_from_claude || 0}</span>
            </div>
          </div>

          <div className="mcp-concepts-grid">
            {mcpConcepts.map((concept, index) => (
              <div key={concept.concept_id || index} className="mcp-concept-card">
                <div className="mcp-concept-header">
                  <span className={`mcp-platform-badge ${concept.platform}`}>
                    🤖 {concept.platform}
                  </span>
                  {concept.node_created && (
                    <CheckCircle size={16} style={{ color: '#10B981' }} />
                  )}
                </div>
                
                <p className="mcp-concept-text">{concept.concept_text}</p>
                
                <div className="mcp-concept-footer">
                  <span className="mcp-concept-date">
                    <Clock size={14} />
                    {new Date(concept.created_at).toLocaleDateString()}
                  </span>
                  {concept.node_created && (
                    <button 
                      className="mcp-view-btn"
                      onClick={() => navigate('/knowledge-graph')}
                    >
                      View in Graph
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {mcpConcepts.length >= 5 && (
            <div className="mcp-view-all">
              <button 
                className="mcp-view-all-btn"
                onClick={() => navigate('/mcp-connect')}
              >
                View All Imports
                <ExternalLink size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MCPImportsSection;
