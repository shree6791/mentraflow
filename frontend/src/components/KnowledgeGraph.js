import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const KnowledgeGraph = ({ topics, onClose }) => {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Sample data with connections
  const graphData = [
    {id: 1, title: 'Forgetting Curve', state: 'fading', lastReview: '3 weeks ago', score: 45},
    {id: 2, title: 'Active Recall Benefits', state: 'high', lastReview: '1 week ago', score: 92},
    {id: 3, title: 'Spacing Effect Principles', state: 'high', lastReview: '3 days ago', score: 88},
    {id: 4, title: 'Neuroplasticity', state: 'medium', lastReview: '5 days ago', score: 68},
    {id: 5, title: 'Transformer Attention', state: 'medium', lastReview: '2 days ago', score: 72}
  ];

  const connections = [
    [2, 3], // Active Recall <-> Spacing Effect
    [3, 4], // Spacing Effect <-> Neuroplasticity
    [4, 5], // Neuroplasticity <-> Transformer
    [1, 2]  // Forgetting Curve <-> Active Recall (weak)
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Create nodes with fixed positions for better layout
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const generatedNodes = graphData.map((data, i) => {
      const angle = (i / graphData.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...data,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 28
      };
    });

    setNodes(generatedNodes);

    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const getStateColor = (state) => {
      switch(state) {
        case 'high': return '#06D6A0';
        case 'medium': return '#FFD166';
        case 'fading': return '#FF6B6B';
        default: return '#CBD5E0';
      }
    };

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      connections.forEach(([i, j]) => {
        const nodeA = generatedNodes[i];
        const nodeB = generatedNodes[j];
        
        const isWeak = (i === 0 || j === 0); // Forgetting Curve connections are weak
        
        ctx.save();
        ctx.strokeStyle = isWeak ? 'rgba(14, 124, 123, 0.15)' : 'rgba(14, 124, 123, 0.3)';
        ctx.lineWidth = isWeak ? 1.5 : 2.5;
        
        // Draw curved line
        const midX = (nodeA.x + nodeB.x) / 2;
        const midY = (nodeA.y + nodeB.y) / 2;
        const offsetX = (nodeB.y - nodeA.y) * 0.15;
        const offsetY = (nodeA.x - nodeB.x) * 0.15;
        
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.quadraticCurveTo(
          midX + offsetX,
          midY + offsetY,
          nodeB.x,
          nodeB.y
        );
        ctx.stroke();
        ctx.restore();
      });

      // Draw nodes
      generatedNodes.forEach((node, idx) => {
        const isHovered = hoveredNode === idx;
        const isSelected = selectedNode?.id === node.id;
        const scale = isHovered ? 1.08 : 1;
        const nodeRadius = node.radius * scale;
        
        // Gentle breathing animation
        const breathe = Math.sin(time + idx) * 0.03 + 1;
        const finalRadius = nodeRadius * breathe;

        // Draw glow for hovered/selected
        if (isHovered || isSelected) {
          ctx.save();
          const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, finalRadius + 12
          );
          gradient.addColorStop(0, getStateColor(node.state) + '40');
          gradient.addColorStop(1, getStateColor(node.state) + '00');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, finalRadius + 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw node
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, finalRadius, 0, Math.PI * 2);
        ctx.fillStyle = getStateColor(node.state);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // Draw label
        ctx.save();
        ctx.fillStyle = '#2E2E2E';
        ctx.font = isHovered ? '600 13px Inter' : '500 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const maxWidth = 120;
        const words = node.title.split(' ');
        let line = '';
        let y = node.y + finalRadius + 12;
        
        words.forEach((word, i) => {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, node.x, y);
            line = word + ' ';
            y += 16;
          } else {
            line = testLine;
          }
        });
        ctx.fillText(line, node.x, y);
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [hoveredNode, selectedNode]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hoveredIndex = nodes.findIndex(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    setHoveredNode(hoveredIndex >= 0 ? hoveredIndex : null);
    canvas.style.cursor = hoveredIndex >= 0 ? 'pointer' : 'default';
  };

  const getStateLabel = (state) => {
    switch(state) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'fading': return 'Fading';
      default: return 'Unknown';
    }
  };

  const getStateColor = (state) => {
    switch(state) {
      case 'high': return '#06D6A0';
      case 'medium': return '#FFD166';
      case 'fading': return '#FF6B6B';
      default: return '#CBD5E0';
    }
  };

  return (
    <div className="graph-modal-container">
      <div className="graph-modal-header">
        <div>
          <h2>Your Knowledge Graph</h2>
          <p className="graph-subtitle">See how your understanding connects and strengthens over time.</p>
        </div>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>
      </div>
      
      <div className="graph-canvas-container">
        <canvas 
          ref={canvasRef} 
          className="graph-canvas"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
        />
        
        <div className="graph-legend">
          <div className="legend-title">Retention States</div>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-dot" style={{background: '#06D6A0'}}></div>
              <span>High</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{background: '#FFD166'}}></div>
              <span>Medium</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{background: '#FF6B6B'}}></div>
              <span>Fading</span>
            </div>
          </div>
          <p className="legend-hint">Your memory network adapts as you recall and reinforce ideas.</p>
        </div>
        
        {selectedNode && (
          <div className="node-detail-panel">
            <div className="node-detail-header">
              <h4>{selectedNode.title}</h4>
              <button 
                className="node-close"
                onClick={() => setSelectedNode(null)}
                aria-label="Close detail"
              >
                <X size={16} />
              </button>
            </div>
            <div className="node-detail-body">
              <div className="detail-row">
                <span className="detail-label">Last Reviewed:</span>
                <span className="detail-value">{selectedNode.lastReview}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Recall Score:</span>
                <span className="detail-value">
                  <span className="score-badge" style={{color: getStateColor(selectedNode.state)}}>
                    {selectedNode.score}%
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">State:</span>
                <span className="state-badge" style={{
                  background: getStateColor(selectedNode.state) + '20',
                  color: getStateColor(selectedNode.state),
                  border: `1px solid ${getStateColor(selectedNode.state)}`
                }}>
                  {getStateLabel(selectedNode.state)}
                </span>
              </div>
            </div>
            <div className="node-detail-actions">
              <button className="detail-action-btn">Review Summary</button>
              <button className="detail-action-btn">Practice 3 Qs</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraph;