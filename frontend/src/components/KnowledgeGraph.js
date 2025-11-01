import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search, Filter, Eye, Brain, ZoomIn, ZoomOut, Loader } from 'lucide-react';
import './KnowledgeGraph.css';

const KnowledgeGraph = ({ topics, userAvatar, userName, onClose, onReinforce }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [nodes, setNodes] = useState([]);
  const [centerNode, setCenterNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterState, setFilterState] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [focusedNodeIndex, setFocusedNodeIndex] = useState(null);

  // Enhanced graph data with library connections
  const graphData = [
    {
      id: 't1',
      title: 'Forgetting Curve',
      state: 'high',
      lastReview: '2 days ago',
      score: 80,
      quizCount: 3,
      libraryId: 'lib1',
      connections: ['t2', 't5']
    },
    {
      id: 't2',
      title: 'Active Recall',
      state: 'medium',
      lastReview: '5 days ago',
      score: 65,
      quizCount: 2,
      libraryId: 'lib2',
      connections: ['t1', 't3', 't5']
    },
    {
      id: 't3',
      title: 'Spacing Effect',
      state: 'fading',
      lastReview: '2 weeks ago',
      score: 45,
      quizCount: 1,
      libraryId: 'lib3',
      connections: ['t2', 't4']
    },
    {
      id: 't4',
      title: 'Neuroplasticity',
      state: 'medium',
      lastReview: 'Never',
      score: 0,
      quizCount: 0,
      libraryId: 'lib4',
      connections: ['t3', 't5']
    },
    {
      id: 't5',
      title: 'Memory Consolidation',
      state: 'high',
      lastReview: '3 days ago',
      score: 90,
      quizCount: 4,
      libraryId: 'lib1',
      connections: ['t1', 't2', 't4']
    }
  ];

  const getStateColor = (state) => {
    switch(state) {
      case 'high': return '#06D6A0'; // Retention Green
      case 'medium': return '#FFD166'; // Neuro Yellow
      case 'fading': return '#EF476F'; // Coral
      default: return '#CBD5E0';
    }
  };

  const getStateLabel = (state) => {
    switch(state) {
      case 'high': return 'High Retention';
      case 'medium': return 'Medium';
      case 'fading': return 'Fading';
      default: return 'Unknown';
    }
  };

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    const canvas = canvasRef.current;
    if (!canvas) return () => clearTimeout(loadTimer);

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Create center node (user)
    const centerX = width / 2;
    const centerY = height / 2;
    
    const center = {
      id: 'center',
      title: userName || 'You',
      x: centerX,
      y: centerY,
      radius: 45,
      isCenter: true,
      avatar: userAvatar
    };
    
    setCenterNode(center);

    // Create topic nodes in circle around center
    const radius = Math.min(width, height) / 3.5;
    
    // Filter nodes based on search and filter
    let filteredData = graphData;
    
    if (searchQuery) {
      filteredData = filteredData.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterState !== 'all') {
      filteredData = filteredData.filter(topic => topic.state === filterState);
    }

    const generatedNodes = filteredData.map((data, i) => {
      const angle = (i / filteredData.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...data,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 35
      };
    });

    setNodes(generatedNodes);

    let animationId;
    let time = 0;

    const animate = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Apply transformations
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw connections from center to topics
      generatedNodes.forEach((node) => {
        if (!node || !center) return;
        
        ctx.save();
        
        // Soft glowing line
        const gradient = ctx.createLinearGradient(center.x, center.y, node.x, node.y);
        gradient.addColorStop(0, 'rgba(14, 124, 123, 0.3)');
        gradient.addColorStop(1, getStateColor(node.state) + '40');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = getStateColor(node.state) + '60';
        
        // Draw bezier curve
        const midX = (center.x + node.x) / 2;
        const midY = (center.y + node.y) / 2;
        const offsetX = (node.y - center.y) * 0.1;
        const offsetY = (center.x - node.x) * 0.1;
        
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.quadraticCurveTo(
          midX + offsetX,
          midY + offsetY,
          node.x,
          node.y
        );
        ctx.stroke();
        ctx.restore();
      });

      // Draw inter-topic connections
      generatedNodes.forEach((nodeA) => {
        if (!nodeA.connections) return;
        
        nodeA.connections.forEach(connId => {
          const nodeB = generatedNodes.find(n => n.id === connId);
          if (!nodeB) return;
          
          ctx.save();
          ctx.strokeStyle = 'rgba(14, 124, 123, 0.15)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
          ctx.restore();
        });
      });

      // Draw center node (user)
      if (center) {
        const centerScale = 1 + Math.sin(time * 0.8) * 0.03;
        const centerRadius = center.radius * centerScale;
        
        // Outer ring (Deep Teal)
        ctx.save();
        ctx.beginPath();
        ctx.arc(center.x, center.y, centerRadius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#0E7C7B';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(14, 124, 123, 0.4)';
        ctx.stroke();
        ctx.restore();
        
        // Inner circle (avatar or initial)
        ctx.save();
        ctx.beginPath();
        ctx.arc(center.x, center.y, centerRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#118AB2';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        
        // User initial or emoji
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = (center.title || 'Y')[0].toUpperCase();
        ctx.fillText(initial, center.x, center.y);
        ctx.restore();
      }

      // Draw topic nodes
      generatedNodes.forEach((node, idx) => {
        if (!node) return;
        
        const isHovered = hoveredNode === idx;
        const isSelected = selectedNode?.id === node.id;
        const isFading = node.state === 'fading';
        
        // Pulsing animation for fading topics
        let pulseScale = 1;
        if (isFading) {
          pulseScale = 1 + Math.sin(time * 2 + idx) * 0.1;
        }
        
        // Scale on hover
        const scale = isHovered ? 1.15 : (isSelected ? 1.1 : 1);
        const nodeRadius = node.radius * scale * pulseScale;

        // Draw glow for hovered/selected
        if (isHovered || isSelected || isFading) {
          ctx.save();
          const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, nodeRadius + 15
          );
          gradient.addColorStop(0, getStateColor(node.state) + (isFading ? '60' : '40'));
          gradient.addColorStop(1, getStateColor(node.state) + '00');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius + 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw node circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        
        // Gradient fill based on state
        const nodeGradient = ctx.createRadialGradient(
          node.x - nodeRadius * 0.3,
          node.y - nodeRadius * 0.3,
          0,
          node.x,
          node.y,
          nodeRadius
        );
        nodeGradient.addColorStop(0, getStateColor(node.state));
        nodeGradient.addColorStop(1, getStateColor(node.state) + 'CC');
        
        ctx.fillStyle = nodeGradient;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.stroke();
        ctx.restore();

        // Draw icon based on score
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icon = node.score >= 80 ? '✓' : node.score >= 50 ? '•' : '!';
        ctx.fillText(icon, node.x, node.y);
        ctx.restore();
      });

      ctx.restore(); // Restore transformations

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      clearTimeout(loadTimer);
    };
  }, [hoveredNode, selectedNode, filterState, searchQuery, zoom, pan, userName, userAvatar]);

  const handleCanvasClick = (e) => {
    if (isDragging) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const clickedNodeIndex = nodes.findIndex(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    if (clickedNodeIndex >= 0) {
      setSelectedNode(nodes[clickedNodeIndex]);
    } else {
      setSelectedNode(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const hoveredIndex = nodes.findIndex(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    setHoveredNode(hoveredIndex >= 0 ? hoveredIndex : null);
    canvas.style.cursor = hoveredIndex >= 0 ? 'pointer' : (isDragging ? 'grabbing' : 'grab');
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedNode) {
          setSelectedNode(null);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && nodes.length > 0) {
        setFocusedNodeIndex((prev) => {
          const next = prev === null ? 0 : (prev + 1) % nodes.length;
          setSelectedNode(nodes[next]);
          return next;
        });
      } else if (e.key === 'ArrowLeft' && nodes.length > 0) {
        setFocusedNodeIndex((prev) => {
          const next = prev === null ? nodes.length - 1 : (prev - 1 + nodes.length) % nodes.length;
          setSelectedNode(nodes[next]);
          return next;
        });
      } else if (e.key === 'Enter' && focusedNodeIndex !== null) {
        setSelectedNode(nodes[focusedNodeIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, selectedNode, focusedNodeIndex, onClose]);

  const hoveredNodeData = hoveredNode !== null ? nodes[hoveredNode] : null;

  return (
    <div className="knowledge-graph-modal">
      {/* Header with Search and Filters */}
      <div className="graph-modal-header">
        <div className="graph-header-left">
          <h2>Your Knowledge Network</h2>
          <p className="graph-subtitle">Interactive memory visualization • Click nodes to explore</p>
        </div>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
      </div>

      {/* Controls Bar */}
      <div className="graph-controls-bar">
        <div className="graph-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="graph-filters">
          <button
            className={`filter-btn ${filterState === 'all' ? 'active' : ''}`}
            onClick={() => setFilterState('all')}
          >
            All
          </button>
          <button
            className={`filter-btn filter-high ${filterState === 'high' ? 'active' : ''}`}
            onClick={() => setFilterState('high')}
          >
            High
          </button>
          <button
            className={`filter-btn filter-medium ${filterState === 'medium' ? 'active' : ''}`}
            onClick={() => setFilterState('medium')}
          >
            Medium
          </button>
          <button
            className={`filter-btn filter-fading ${filterState === 'fading' ? 'active' : ''}`}
            onClick={() => setFilterState('fading')}
          >
            Fading
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="graph-canvas-container"
      >
        <canvas
          ref={canvasRef}
          className="graph-canvas"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Hover Tooltip */}
        {hoveredNodeData && !selectedNode && (
          <div className="graph-tooltip">
            <h4>{hoveredNodeData.title}</h4>
            <div className="tooltip-stats">
              <div className="tooltip-stat">
                <span className="stat-label">Recall:</span>
                <span className="stat-value" style={{color: getStateColor(hoveredNodeData.state)}}>
                  {hoveredNodeData.score}%
                </span>
              </div>
              <div className="tooltip-stat">
                <span className="stat-label">Last Review:</span>
                <span className="stat-value">{hoveredNodeData.lastReview}</span>
              </div>
              <div className="tooltip-stat">
                <span className="stat-label">State:</span>
                <span className="stat-badge" style={{
                  background: getStateColor(hoveredNodeData.state) + '20',
                  color: getStateColor(hoveredNodeData.state)
                }}>
                  {getStateLabel(hoveredNodeData.state)}
                </span>
              </div>
            </div>
            <p className="tooltip-hint">Click to explore</p>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="graph-zoom-controls">
          <button onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button onClick={handleResetView} title="Reset View" className="reset-btn">
            Reset
          </button>
        </div>

        {/* Legend */}
        <div className="graph-legend">
          <h4>Retention Strength</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-dot" style={{background: '#06D6A0'}}></div>
              <span>High (≥80%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{background: '#FFD166'}}></div>
              <span>Medium (50-79%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{background: '#EF476F'}}></div>
              <span>Fading (&lt;50%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNode && (
        <div className="node-detail-modal">
          <div className="node-detail-header">
            <div>
              <h3>{selectedNode.title}</h3>
              <span className="node-detail-subtitle">
                {selectedNode.quizCount} {selectedNode.quizCount === 1 ? 'quiz' : 'quizzes'} taken
              </span>
            </div>
            <button onClick={() => setSelectedNode(null)} className="detail-close">
              <X size={20} />
            </button>
          </div>

          <div className="node-detail-body">
            <div className="detail-stats-grid">
              <div className="detail-stat-card">
                <span className="stat-icon">📊</span>
                <div>
                  <h4>{selectedNode.score}%</h4>
                  <p>Recall Score</p>
                </div>
              </div>
              <div className="detail-stat-card">
                <span className="stat-icon">⏰</span>
                <div>
                  <h4>{selectedNode.lastReview}</h4>
                  <p>Last Reviewed</p>
                </div>
              </div>
              <div className="detail-stat-card">
                <span className="stat-icon">
                  {selectedNode.state === 'high' ? '🟢' : selectedNode.state === 'medium' ? '🟡' : '🔴'}
                </span>
                <div>
                  <h4>{getStateLabel(selectedNode.state)}</h4>
                  <p>Current State</p>
                </div>
              </div>
            </div>

            {selectedNode.state === 'fading' && (
              <div className="detail-warning">
                ⚠️ This topic needs reinforcement soon to prevent forgetting
              </div>
            )}

            <div className="detail-actions">
              <button className="btn-action btn-primary" onClick={() => onReinforce && onReinforce(selectedNode)}>
                <Brain size={18} /> Reinforce Now
              </button>
              <button className="btn-action btn-secondary">
                <Eye size={18} /> View Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
