import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search, Filter, Eye, Brain, ZoomIn, ZoomOut, Loader, X, RotateCcw } from 'lucide-react';
import * as d3 from 'd3';
import './KnowledgeGraph.css';

const KnowledgeGraphD3 = ({ topics, userAvatar, userName, onClose, onReinforce, hideHeader }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
  
  const [activeFilters, setActiveFilters] = useState(['high', 'medium', 'fading']); // All active by default
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
      const matchesFilter = activeFilters.includes(node.state);
      const matchesSearch = !searchQuery || node.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  // Toggle filter for legend items
  const toggleFilter = (filterType) => {
    setActiveFilters(prev => {
      if (prev.includes(filterType)) {
        // If only one filter left, don't allow removing it
        if (prev.length === 1) return prev;
        return prev.filter(f => f !== filterType);
      } else {
        return [...prev, filterType];
      }
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
      .style('pointer-events', 'auto')
      .style('background', 'white')
      .style('border', '1px solid #E0E0E0')
      .style('border-radius', '12px')
      .style('padding', '1rem')
      .style('box-shadow', '0 8px 24px rgba(0, 0, 0, 0.2)')
      .style('z-index', '1000')
      .style('min-width', '220px');

    // Node interactions - Show tooltip on CLICK instead of hover
    node.on('click', function(event, d) {
      event.stopPropagation();
      
      // Show tooltip with node details
      tooltip.transition()
        .duration(200)
        .style('opacity', 1);
      
      // Use the node's actual simulation coordinates (d.x, d.y)
      // Position tooltip above the node
      const tooltipX = d.x;
      const tooltipY = d.y - getNodeRadius(d.connections) - 20; // Position above node with gap
      
      tooltip.html(`
        <div class="tooltip-content" style="background: white; color: #1F2937; position: relative;">
          <button class="tooltip-close" style="position: absolute; top: 0.5rem; right: 0.5rem; background: transparent; border: none; cursor: pointer; color: #6B7280; padding: 0.25rem; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <strong style="display: block; font-size: 1rem; color: #1A1A2E; margin-bottom: 0.75rem; font-weight: 700; padding-right: 1.5rem;">${d.title}</strong>
          <div class="tooltip-stats" style="display: flex; flex-direction: column; gap: 0.375rem; font-size: 0.875rem; color: #6B7280; margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid #E0E0E0;">
            <div>Last Review: <span style="color: #1F2937; font-weight: 600;">${d.lastReview}</span></div>
            <div>Score: <span style="color: #1F2937; font-weight: 600;">${d.score}%</span></div>
            <div>Connections: <span style="color: #1F2937; font-weight: 600;">${d.connections.length}</span></div>
          </div>
          <div class="tooltip-actions" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button class="tooltip-btn tooltip-btn-primary" data-id="${d.id}" data-action="quiz" style="padding: 0.5rem 1rem; border-radius: 6px; border: none; font-size: 0.875rem; font-weight: 600; cursor: pointer; background: linear-gradient(135deg, #FFD166, #FFC130); color: #1A1A1A;">
              Take Quiz
            </button>
            <button class="tooltip-btn tooltip-btn-secondary" data-id="${d.id}" data-action="summary" style="padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; background: #F3F4F6; color: #0E7C7B; border: 1px solid #E0E0E0;">
              View Summary
            </button>
          </div>
        </div>
      `)
        .style('left', tooltipX + 'px')
        .style('top', tooltipY + 'px')
        .style('transform', 'translate(-50%, -100%)');
      
      // Add click handlers to tooltip buttons
      d3.selectAll('.tooltip-btn').on('click', function(e) {
        e.stopPropagation();
        const action = d3.select(this).attr('data-action');
        if (action === 'quiz') {
          setSelectedNode(d);
          setShowQuickReview(true);
        } else if (action === 'summary') {
          console.log('Open summary for:', d.title);
        }
        tooltip.transition().duration(200).style('opacity', 0);
      });
      
      // Add close button handler
      d3.select('.tooltip-close').on('click', function(e) {
        e.stopPropagation();
        tooltip.transition().duration(200).style('opacity', 0);
      });
      
      // Highlight connected nodes
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

    // Click outside to close tooltip and reset highlights
    svg.on('click', function() {
      tooltip.transition().duration(200).style('opacity', 0);
      
      // Reset all highlights
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

        {/* Zoom Controls - Embedded in Graph (Google Maps style) */}
        <div className="graph-embedded-zoom-controls">
          <button onClick={handleZoomIn} className="embedded-zoom-btn" title="Zoom In">
            <ZoomIn size={20} />
          </button>
          <button onClick={handleZoomOut} className="embedded-zoom-btn" title="Zoom Out">
            <ZoomOut size={20} />
          </button>
          <button onClick={handleRecenter} className="embedded-zoom-btn embedded-recenter-btn" title="Reset View">
            <RotateCcw size={20} />
          </button>
        </div>

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
          💡 Drag nodes to explore • Click to view details • Click background to close
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
