import React, { useEffect, useRef, useState } from 'react';

const KnowledgeGraph = ({ topics }) => {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    // Generate nodes based on topics
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Create nodes
    const generatedNodes = topics.map((topic, i) => ({
      id: topic.id,
      title: topic.title,
      status: topic.status,
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 100) + 50,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    }));

    setNodes(generatedNodes);

    const ctx = canvas.getContext('2d');
    let animationId;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.strokeStyle = 'rgba(14, 124, 123, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < generatedNodes.length; i++) {
        for (let j = i + 1; j < generatedNodes.length; j++) {
          const dx = generatedNodes[j].x - generatedNodes[i].x;
          const dy = generatedNodes[j].y - generatedNodes[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 200) {
            ctx.beginPath();
            ctx.moveTo(generatedNodes[i].x, generatedNodes[i].y);
            ctx.lineTo(generatedNodes[j].x, generatedNodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw nodes
      generatedNodes.forEach((node) => {
        // Simple physics
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x < 20 || node.x > width - 20) node.vx *= -1;
        if (node.y < 20 || node.y > height - 20) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(20, Math.min(width - 20, node.x));
        node.y = Math.max(20, Math.min(height - 20, node.y));

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
        
        // Color based on status
        if (node.status === 'high') {
          ctx.fillStyle = '#06D6A0';
        } else if (node.status === 'medium') {
          ctx.fillStyle = '#FFD166';
        } else {
          ctx.fillStyle = '#EF476F';
        }
        
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#1a202c';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.title.substring(0, 15) + '...', node.x, node.y + 25);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [topics]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a node
    const clickedNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 12;
    });

    setSelectedNode(clickedNode || null);
  };

  return (
    <div className="graph-container">
      <canvas 
        ref={canvasRef} 
        className="graph-canvas"
        onClick={handleCanvasClick}
      />
      {selectedNode && (
        <div className="node-detail">
          <h4>{selectedNode.title}</h4>
          <p className="node-status">
            Status: <span className={`status-badge ${selectedNode.status}`}>
              {selectedNode.status}
            </span>
          </p>
          <div className="node-actions">
            <button className="action-btn">Review Summary</button>
            <button className="action-btn">Practice 3 Qs</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;