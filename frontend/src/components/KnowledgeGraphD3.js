import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search, Filter, Eye, Brain, ZoomIn, ZoomOut, Loader, X, RotateCcw } from 'lucide-react';
import * as d3 from 'd3';
import './KnowledgeGraph.css';

const KnowledgeGraphD3 = ({ topics, userAvatar, userName, onClose, onReinforce, hideHeader }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
  
  const [filterState, setFilterState] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNode, setExpandedNode] = useState(null);
  const [showQuickReview, setShowQuickReview] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Enhanced graph data with connections
  const graphData = [
    { id: 't1', title: 'Forgetting Curve', state: 'high', lastReview: '2 days ago', score: 85, connections: ['t2', 't5', 't7'] },
    { id: 't2', title: 'Active Recall', state: 'high', lastReview: '1 day ago', score: 92, connections: ['t1', 't3', 't5'] },
    { id: 't3', title: 'Spacing Effect', state: 'medium', lastReview: '1 week ago', score: 68, connections: ['t2', 't4', 't6'] },
    { id: 't4', title: 'Working Memory', state: 'fading', lastReview: '2 weeks ago', score: 45, connections: ['t3', 't5'] },
    { id: 't5', title: 'Cognitive Load', state: 'high', lastReview: '3 days ago', score: 88, connections: ['t1', 't2', 't4', 't6'] },
    { id: 't6', title: 'Neuroplasticity', state: 'medium', lastReview: '5 days ago', score: 72, connections: ['t3', 't5', 't7'] },
    { id: 't7', title: 'Memory Consolidation', state: 'fading', lastReview: '3 weeks ago', score: 38, connections: ['t1', 't6'] },
    { id: 't8', title: 'Metacognition', state: 'high', lastReview: '1 day ago', score: 90, connections: ['t2', 't5'] },
  ];

  // Helper functions
  const getNodeColor = (state) => {
    switch(state) {
      case 'high': return '#06D6A0'; // Green
      case 'medium': return '#FFD166'; // Yellow
      case 'fading': return '#EF476F'; // Red
      default: return '#0E7C7B';
    }
  };

  const getNodeRadius = (connections) => {
    // Size based on importance (number of connections)
    const baseRadius = 20;
    const scale = 4;
    return baseRadius + (connections.length * scale);
  };

  const getLinkOpacity = (source, target) => {
    // Higher opacity for stronger connections
    // In a real app, this could be based on quiz performance, review frequency, etc.
    return 0.3 + (Math.random() * 0.4); // 0.3 to 0.7
  };

  // Filter and search logic
  const getFilteredNodes = () => {
    return graphData.filter(node => {
      const matchesFilter = filterState === 'all' || node.state === filterState;
      const matchesSearch = !searchQuery || node.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const getFilteredLinks = (filteredNodes) => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const links = [];
    
    filteredNodes.forEach(node => {
      node.connections.forEach(targetId => {
        if (nodeIds.has(targetId)) {
          links.push({
            source: node.id,
            target: targetId,
            strength: Math.random() // In real app, based on relationship strength
          });
        }
      });
    });
    
    return links;
  };

  // Initialize D3 force simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Get container dimensions
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    setDimensions({ width, height });

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    // Create main group for zooming/panning
    const g = svg.append('g').attr('class', 'graph-container');

    // Get filtered data
    const filteredNodes = getFilteredNodes();
    const filteredLinks = getFilteredLinks(filteredNodes);

    // Bounding box function to keep nodes FULLY within viewport
    const boundingBox = (node) => {
      const radius = getNodeRadius(node.connections);
      const padding = radius + 30; // Extra padding to ensure full visibility
      
      if (node.x !== undefined) {
        node.x = Math.max(padding, Math.min(width - padding, node.x));
      }
      if (node.y !== undefined) {
        node.y = Math.max(padding, Math.min(height - padding, node.y));
      }
    };

    // Create force simulation with strict bounds
    const simulation = d3.forceSimulation(filteredNodes)
      .force('link', d3.forceLink(filteredLinks)
        .id(d => d.id)
        .distance(120)
        .strength(0.5))
      .force('charge', d3.forceManyBody()
        .strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => getNodeRadius(d.connections) + 15))
      .on('tick', () => {
        // Apply bounds on every tick
        filteredNodes.forEach(boundingBox);
      });

    simulationRef.current = simulation;

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('class', 'graph-link')
      .attr('stroke', '#999')
      .attr('stroke-opacity', d => getLinkOpacity(d.source, d.target))
      .attr('stroke-width', 2);

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .join('g')
      .attr('class', 'graph-node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Node circles
    node.append('circle')
      .attr('r', d => getNodeRadius(d.connections))
      .attr('fill', d => getNodeColor(d.state))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('class', 'node-circle');

    // Node labels
    node.append('text')
      .attr('dy', d => getNodeRadius(d.connections) + 15)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-label')
      .attr('fill', '#333')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text(d => d.title);

    // Create tooltip inside container (not body) to preserve CSS variable context
    const tooltip = d3.select(containerRef.current).append('div')
      .attr('class', 'graph-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'auto');

    // Node interactions
    node.on('click', function(event, d) {
      event.stopPropagation();
      handleNodeClick(d);
    });

    node.on('mouseenter', function(event, d) {
      // Show tooltip with actions
      tooltip.transition()
        .duration(200)
        .style('opacity', 1);
      
      // Get container offset for proper positioning
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipX = event.clientX - containerRect.left + 15;
      const tooltipY = event.clientY - containerRect.top - 15;
      
      tooltip.html(`
        <div class="tooltip-content">
          <strong>${d.title}</strong>
          <div class="tooltip-stats">
            <div>Last Review: <span>${d.lastReview}</span></div>
            <div>Score: <span>${d.score}%</span></div>
            <div>Connections: <span>${d.connections.length}</span></div>
          </div>
          <div class="tooltip-actions">
            <button class="tooltip-btn tooltip-btn-primary" data-id="${d.id}" data-action="quiz">
              Take Quiz
            </button>
            <button class="tooltip-btn tooltip-btn-secondary" data-id="${d.id}" data-action="summary">
              View Summary
            </button>
          </div>
        </div>
      `)
        .style('left', tooltipX + 'px')
        .style('top', tooltipY + 'px');
      
      // Add click handlers to tooltip buttons
      d3.selectAll('.tooltip-btn').on('click', function() {
        const action = d3.select(this).attr('data-action');
        if (action === 'quiz') {
          setSelectedNode(d);
          setShowQuickReview(true);
        } else if (action === 'summary') {
          // Open summary view
          console.log('Open summary for:', d.title);
        }
        tooltip.style('opacity', 0);
      });
      
      // Highlight connected nodes
      if (expandedNode && expandedNode !== d.id) return;
      
      const connectedIds = new Set([d.id, ...d.connections]);
      
      node.select('circle')
        .transition()
        .duration(200)
        .attr('stroke-width', nodeD => connectedIds.has(nodeD.id) ? 5 : 3)
        .attr('opacity', nodeD => connectedIds.has(nodeD.id) ? 1 : 0.3);
      
      link
        .transition()
        .duration(200)
        .attr('stroke-opacity', linkD => 
          (linkD.source.id === d.id || linkD.target.id === d.id) ? 0.8 : 0.1
        )
        .attr('stroke-width', linkD =>
          (linkD.source.id === d.id || linkD.target.id === d.id) ? 3 : 2
        );
    });

    node.on('mouseleave', function(event, d) {
      // Hide tooltip
      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
      
      if (expandedNode) return;
      
      node.select('circle')
        .transition()
        .duration(200)
        .attr('stroke-width', 3)
        .attr('opacity', 1);
      
      link
        .transition()
        .duration(200)
        .attr('stroke-opacity', linkD => getLinkOpacity(linkD.source, linkD.target))
        .attr('stroke-width', 2);
    });

    node.on('mousemove', function(event) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipX = event.clientX - containerRect.left + 15;
      const tooltipY = event.clientY - containerRect.top - 15;
      
      tooltip
        .style('left', tooltipX + 'px')
        .style('top', tooltipY + 'px');
    });

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions with bounds checking
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      // Apply bounds during drag
      const radius = getNodeRadius(d.connections);
      const padding = radius + 30;
      
      d.fx = Math.max(padding, Math.min(width - padding, event.x));
      d.fy = Math.max(padding, Math.min(height - padding, event.y));
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      // Keep node fixed at bounded position
      const radius = getNodeRadius(d.connections);
      const padding = radius + 30;
      
      d.fx = Math.max(padding, Math.min(width - padding, event.x));
      d.fy = Math.max(padding, Math.min(height - padding, event.y));
    }

    // Loading complete
    setTimeout(() => setIsLoading(false), 500);

    // Cleanup
    return () => {
      simulation.stop();
      d3.select('.graph-tooltip').remove();
    };
  }, [filterState, searchQuery, expandedNode]);

  const handleNodeClick = (node) => {
    if (expandedNode === node.id) {
      // Second click - open quick review
      setSelectedNode(node);
      setShowQuickReview(true);
    } else {
      // First click - expand to show connections
      setExpandedNode(node.id);
    }
  };

  const handleRecenter = () => {
    const svg = d3.select(svgRef.current);
    svg.transition()
      .duration(750)
      .call(
        d3.zoom().transform,
        d3.zoomIdentity
      );
    
    // Reset all fixed positions
    if (simulationRef.current) {
      simulationRef.current.nodes().forEach(node => {
        node.fx = null;
        node.fy = null;
      });
      simulationRef.current.alpha(0.3).restart();
    }
    
    setExpandedNode(null);
  };

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      d3.zoom().scaleBy,
      1.3
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      d3.zoom().scaleBy,
      0.7
    );
  };

  return (
    <div className="knowledge-graph-page" ref={containerRef}>
      {!hideHeader && (
        <div className="graph-header">
          <div className="graph-header-left">
            <button onClick={onClose} className="back-btn">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="graph-title">Knowledge Graph</h2>
              <p className="graph-subtitle">Explore connections between concepts</p>
            </div>
          </div>
        </div>
      )}

      <div className="graph-controls-bar">
        {/* Search */}
        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filter */}
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Concepts</option>
            <option value="high">Strong Retention</option>
            <option value="medium">Medium Retention</option>
            <option value="fading">Needs Review</option>
          </select>
        </div>

        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button onClick={handleRecenter} className="zoom-btn recenter-btn" title="Recenter">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Graph Container */}
      <div className="graph-visualization">
        {isLoading && (
          <div className="graph-loading">
            <Loader className="spinner" size={48} />
            <p>Generating knowledge connections...</p>
          </div>
        )}

        <svg ref={svgRef} className="knowledge-graph-svg"></svg>

        {/* Inline Legend */}
        <div className="graph-legend-inline">
          <div className="legend-inline-items">
            <div className="legend-inline-item">
              <div className="legend-inline-dot" style={{background: '#06D6A0'}}></div>
              <span>High</span>
            </div>
            <div className="legend-inline-item">
              <div className="legend-inline-dot" style={{background: '#FFD166'}}></div>
              <span>Medium</span>
            </div>
            <div className="legend-inline-item">
              <div className="legend-inline-dot" style={{background: '#EF476F'}}></div>
              <span>Fading</span>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="graph-hint">
          💡 Drag nodes to explore • Click once to expand • Click again to review
        </div>
      </div>

      {/* Quick Review Modal */}
      {showQuickReview && selectedNode && (
        <div className="modal-overlay" onClick={() => setShowQuickReview(false)}>
          <div className="quick-review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowQuickReview(false)}>
              <X size={20} />
            </button>
            
            <h3>{selectedNode.title}</h3>
            
            <div className="modal-stats">
              <div className="stat-item">
                <span className="stat-label">Last Review</span>
                <span className="stat-value">{selectedNode.lastReview}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Score</span>
                <span className="stat-value">{selectedNode.score}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Retention</span>
                <span className={`stat-badge stat-badge-${selectedNode.state}`}>
                  {selectedNode.state === 'high' ? 'Strong' : selectedNode.state === 'medium' ? 'Medium' : 'Fading'}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowQuickReview(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={() => {
                setShowQuickReview(false);
                if (onReinforce) onReinforce(selectedNode);
              }}>
                <Brain size={18} />
                Take Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphD3;
