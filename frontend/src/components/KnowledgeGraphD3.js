
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search, Filter, Eye, Brain, ZoomIn, ZoomOut, Loader, X, RotateCcw } from 'lucide-react';
import * as d3 from 'd3';
import { COLORS } from '../constants/theme';
import './KnowledgeGraph.css';

const KnowledgeGraphD3 = ({ topics, userAvatar, userName, onClose, onReinforce, onTakeQuiz, onViewSummary, hideHeader, externalSearchQuery = '' }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const onTakeQuizRef = useRef(onTakeQuiz);
  const onViewSummaryRef = useRef(onViewSummary);
  
  const [activeFilters, setActiveFilters] = useState(['high', 'medium', 'fading']);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Use external search query if provided (prioritize external)
  const effectiveSearchQuery = externalSearchQuery || searchQuery;
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNode, setExpandedNode] = useState(null);
  const [showQuickReview, setShowQuickReview] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [tooltipData, setTooltipData] = useState(null);
  const [hoverTooltip, setHoverTooltip] = useState({ visible: false, x: 0, y: 0, data: null });
  
  // Handle window resize for responsive graph
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Use viewport height calculation instead of container height to prevent growth
        const height = Math.max(600, window.innerHeight - 200);
        setDimensions({ width, height });
      }
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Initial size check
    handleResize();
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Keep refs up to date
  useEffect(() => {
    onTakeQuizRef.current = onTakeQuiz;
    onViewSummaryRef.current = onViewSummary;
    
    // Also attach to window for D3 to access
    window._knowledgeGraphCallbacks = {
      onTakeQuiz,
      onViewSummary
    };
    
    console.log('Callbacks updated:', { 
      onTakeQuiz: typeof onTakeQuiz,
      onViewSummary: typeof onViewSummary 
    });
  }, [onTakeQuiz, onViewSummary]);

  // Use topics from props (fetched from backend API)
  const graphData = topics || [];

  // Helper functions
  const getNodeColor = (state) => {
    switch(state) {
      case 'high': return COLORS.retention.green; // Green
      case 'medium': return COLORS.retention.yellow; // Yellow
      case 'fading': return COLORS.retention.red; // Red
      default: return COLORS.primary.teal;
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
    return 0.3 + (Math.random() * 0.4); // 0.3 to 0.7
  };

  // Filter and search logic
  const getFilteredNodes = () => {
    // Only filter by legend state, NOT by search (we'll dim nodes instead)
    return graphData.filter(node => {
      const matchesFilter = activeFilters.includes(node.state);
      return matchesFilter;
    });
  };

  // Check if a node matches the search query
  const nodeMatchesSearch = (node) => {
    if (!effectiveSearchQuery || effectiveSearchQuery.trim() === '') return true;
    return node.title.toLowerCase().includes(effectiveSearchQuery.toLowerCase());
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
            strength: Math.random()
          });
        }
      });
    });
    
    return links;
  };

  // Store node positions to preserve them across filter changes
  const nodePositionsRef = useRef(new Map());

  // Initialize D3 force simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Get container dimensions
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    setDimensions({ width, height });

    // Save current node positions before clearing
    if (simulationRef.current) {
      simulationRef.current.nodes().forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          nodePositionsRef.current.set(node.id, { x: node.x, y: node.y });
        }
      });
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('position', 'relative')
      .style('z-index', '1');

    // Create zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;

    // Create main group for zooming/panning
    const g = svg.append('g').attr('class', 'graph-container');

    // Get filtered data
    const filteredNodes = getFilteredNodes();
    
    // Restore saved positions to filtered nodes
    filteredNodes.forEach(node => {
      const savedPos = nodePositionsRef.current.get(node.id);
      if (savedPos) {
        node.x = savedPos.x;
        node.y = savedPos.y;
      }
    });
    
    const filteredLinks = getFilteredLinks(filteredNodes);

    // Bounding box function
    const boundingBox = (node) => {
      const radius = getNodeRadius(node.connections);
      const padding = radius + 30;
      
      if (node.x !== undefined) {
        node.x = Math.max(padding, Math.min(width - padding, node.x));
      }
      if (node.y !== undefined) {
        node.y = Math.max(padding, Math.min(height - padding, node.y));
      }
    };

    // Create force simulation
    // Check if we have saved positions - if yes, use lower alpha for smoother transitions
    const hasPositions = filteredNodes.some(node => nodePositionsRef.current.has(node.id));
    
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
      .alpha(hasPositions ? 0.3 : 1) // Lower alpha if positions are known
      .alphaDecay(hasPositions ? 0.05 : 0.0228) // Faster settling if positions are known
      .on('tick', () => {
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
      .attr('stroke-opacity', d => {
        const sourceMatches = nodeMatchesSearch(d.source);
        const targetMatches = nodeMatchesSearch(d.target);
        // Dim link if either end doesn't match search
        const baseOpacity = getLinkOpacity(d.source, d.target);
        return (sourceMatches && targetMatches) ? baseOpacity : baseOpacity * 0.2;
      })
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
      .attr('class', 'node-circle')
      .attr('opacity', d => nodeMatchesSearch(d) ? 1 : 0.2); // Dim non-matching nodes

    // Node labels
    node.append('text')
      .attr('dy', d => getNodeRadius(d.connections) + 15)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-label')
      .attr('fill', '#333')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('opacity', d => nodeMatchesSearch(d) ? 1 : 0.3) // Dim non-matching labels
      .text(d => d.title);

    // Node interactions - Show tooltip on CLICK
    node.on('click', function(event, d) {
      event.stopPropagation();
      
      // Get screen position for tooltip
      const containerBounds = containerRef.current.getBoundingClientRect();
      const tooltipX = containerBounds.left + d.x;
      const tooltipY = containerBounds.top + d.y - getNodeRadius(d.connections) - 20;
      
      // Set tooltip data in React state
      setTooltipData({
        node: d,
        x: tooltipX,
        y: tooltipY
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
    })
    // MVP Demo: Add hover tooltip for quick info
    .on('mouseover', function(event, d) {
      const containerBounds = containerRef.current.getBoundingClientRect();
      setHoverTooltip({
        visible: true,
        x: event.clientX - containerBounds.left + 10,
        y: event.clientY - containerBounds.top - 10,
        data: d
      });
    })
    .on('mouseout', function() {
      setHoverTooltip({ visible: false, x: 0, y: 0, data: null });
    });

    // Click outside to close tooltip
    svg.on('click', function(event) {
      console.log('SVG clicked, closing tooltip');
      setTooltipData(null);
      
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

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      const radius = getNodeRadius(d.connections);
      const padding = radius + 30;
      
      d.fx = Math.max(padding, Math.min(width - padding, event.x));
      d.fy = Math.max(padding, Math.min(height - padding, event.y));
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      const radius = getNodeRadius(d.connections);
      const padding = radius + 30;
      
      d.fx = Math.max(padding, Math.min(width - padding, event.x));
      d.fy = Math.max(padding, Math.min(height - padding, event.y));
    }

    // Center the graph on initial load (reduced by 25% for better view)
    setTimeout(() => {
      const bounds = g.node().getBBox();
      const fullWidth = bounds.width;
      const fullHeight = bounds.height;
      const midX = bounds.x + fullWidth / 2;
      const midY = bounds.y + fullHeight / 2;
      
      if (fullWidth && fullHeight) {
        const scale = 0.675 / Math.max(fullWidth / width, fullHeight / height); // Reduced from 0.9 to 0.675 (25% smaller)
        const translate = [
          width / 2 - scale * midX,
          height / 2 - scale * midY
        ];
        
        svg.transition()
          .duration(750)
          .call(
            zoomBehavior.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
          );
      }
      
      setIsLoading(false);
    }, 1000);

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [expandedNode, onTakeQuizRef, onViewSummaryRef]); // Removed activeFilters and searchQuery to prevent recreation

  // Update node/link visibility when filters or search change (without recreating simulation)
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return;

    const svg = d3.select(svgRef.current);
    const filteredNodes = getFilteredNodes();
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    // Update node visibility based on filters
    svg.selectAll('.graph-node')
      .transition()
      .duration(300)
      .style('opacity', d => filteredNodeIds.has(d.id) ? 1 : 0)
      .style('pointer-events', d => filteredNodeIds.has(d.id) ? 'all' : 'none');

    // Update node circle opacity based on search
    svg.selectAll('.node-circle')
      .transition()
      .duration(300)
      .attr('opacity', d => {
        if (!filteredNodeIds.has(d.id)) return 0;
        return nodeMatchesSearch(d) ? 1 : 0.2;
      });

    // Update node labels opacity based on search
    svg.selectAll('.node-label')
      .transition()
      .duration(300)
      .attr('opacity', d => {
        if (!filteredNodeIds.has(d.id)) return 0;
        return nodeMatchesSearch(d) ? 1 : 0.3;
      });

    // Update link visibility
    svg.selectAll('.graph-link')
      .transition()
      .duration(300)
      .attr('stroke-opacity', d => {
        const sourceVisible = filteredNodeIds.has(d.source.id);
        const targetVisible = filteredNodeIds.has(d.target.id);
        if (!sourceVisible || !targetVisible) return 0;
        
        const sourceMatches = nodeMatchesSearch(d.source);
        const targetMatches = nodeMatchesSearch(d.target);
        const baseOpacity = getLinkOpacity(d.source, d.target);
        return (sourceMatches && targetMatches) ? baseOpacity : baseOpacity * 0.2;
      });

    // Update simulation nodes (but don't restart heavily)
    if (simulationRef.current) {
      const allNodes = simulationRef.current.nodes();
      allNodes.forEach(node => {
        // Keep filtered-out nodes in place but mark them
        node._filtered = !filteredNodeIds.has(node.id);
      });
      
      // Very gentle restart to adjust positions slightly
      simulationRef.current.alpha(0.05).restart();
    }
  }, [activeFilters, effectiveSearchQuery]);

  // Handle dimension changes separately without full redraw
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.attr('width', dimensions.width)
       .attr('height', dimensions.height);
    
    // Restart simulation with new dimensions
    if (simulationRef.current) {
      simulationRef.current
        .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
        .alpha(0.3)
        .restart();
    }
  }, [dimensions]);

  const handleRecenter = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.transition()
      .duration(750)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity
      );
    
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
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      zoomBehaviorRef.current.scaleBy,
      1.3
    );
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      zoomBehaviorRef.current.scaleBy,
      0.7
    );
  };

  return (
    <div className="knowledge-graph-container" ref={containerRef}>
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

      {/* Internal search bar removed - using external search from parent */}

      <div className="graph-visualization">
        {isLoading && (
          <div className="graph-loading">
            <Loader className="spinner" size={48} />
            <p>Generating knowledge connections...</p>
          </div>
        )}

        <svg ref={svgRef} className="knowledge-graph-svg"></svg>

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

        <div className="graph-legend-inline">
          <div className="legend-inline-items">
            <div 
              className={`legend-inline-item ${activeFilters.includes('high') ? 'active' : 'inactive'}`}
              onClick={() => toggleFilter('high')}
              title="Click to toggle High retention filter"
            >
              <div className="legend-inline-dot" style={{background: '#06D6A0'}}></div>
              <span>High</span>
            </div>
            <div 
              className={`legend-inline-item ${activeFilters.includes('medium') ? 'active' : 'inactive'}`}
              onClick={() => toggleFilter('medium')}
              title="Click to toggle Medium retention filter"
            >
              <div className="legend-inline-dot" style={{background: '#FFD166'}}></div>
              <span>Medium</span>
            </div>
            <div 
              className={`legend-inline-item ${activeFilters.includes('fading') ? 'active' : 'inactive'}`}
              onClick={() => toggleFilter('fading')}
              title="Click to toggle Fading retention filter"
            >
              <div className="legend-inline-dot" style={{background: '#EF476F'}}></div>
              <span>Fading</span>
            </div>
          </div>
        </div>

        <div className="graph-hint">
          💡 Drag nodes to explore • Click to view details • Click background to close
        </div>
      </div>

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

      {tooltipData && (
        <div 
          className="graph-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y}px`,
            transform: 'translate(-50%, -100%)',
            opacity: 1,
            pointerEvents: 'auto',
            background: 'white',
            border: '1px solid #E0E0E0',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 10000,
            minWidth: '220px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="tooltip-close"
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
            onClick={() => setTooltipData(null)}
          >
            <X size={16} />
          </button>
          
          <strong style={{paddingRight: '1.5rem', display: 'block', marginBottom: '0.75rem', color: '#1a1a1a', fontSize: '1.1rem'}}>
            {tooltipData.node.title}
          </strong>
          
          <div className="tooltip-stats" style={{marginBottom: '1rem', fontSize: '0.9rem', color: '#666'}}>
            <div style={{marginBottom: '0.25rem'}}>
              <span style={{color: '#888'}}>Last Review:</span>{' '}
              <span style={{color: '#1a1a1a', fontWeight: 500}}>{tooltipData.node.lastReview}</span>
            </div>
            <div style={{marginBottom: '0.25rem'}}>
              <span style={{color: '#888'}}>Score:</span>{' '}
              <span style={{color: '#1a1a1a', fontWeight: 500}}>{tooltipData.node.score}%</span>
            </div>
            <div>
              <span style={{color: '#888'}}>Connections:</span>{' '}
              <span style={{color: '#1a1a1a', fontWeight: 500}}>{tooltipData.node.connections.length}</span>
            </div>
          </div>
          
          <div className="tooltip-actions" style={{display: 'flex', gap: '0.5rem'}}>
            <button 
              className="tooltip-btn tooltip-btn-primary"
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                background: '#0E7C7B',
                color: 'white'
              }}
              onClick={() => {
                console.log('🎯 React Quiz Button Clicked!');
                if (onTakeQuiz) {
                  onTakeQuiz(tooltipData.node);
                }
                setTooltipData(null);
              }}
            >
              Take Quiz
            </button>
            <button 
              className="tooltip-btn tooltip-btn-secondary"
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                background: '#E0E0E0',
                color: '#333'
              }}
              onClick={() => {
                console.log('📄 React Summary Button Clicked!');
                if (onViewSummary) {
                  onViewSummary(tooltipData.node);
                }
                setTooltipData(null);
              }}
            >
              View Summary
            </button>
          </div>
        </div>
      )}

      {/* MVP Demo: Hover Tooltip for Quick Info */}
      {hoverTooltip.visible && hoverTooltip.data && (
        <div 
          className="graph-hover-tooltip"
          style={{
            position: 'absolute',
            left: `${hoverTooltip.x}px`,
            top: `${hoverTooltip.y}px`,
            pointerEvents: 'none',
            zIndex: 9999
          }}
        >
          <div style={{
            background: 'white',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            minWidth: '200px'
          }}>
            <h4 style={{margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#0E7C7B'}}>
              {hoverTooltip.data.title}
            </h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem'}}>
              <span style={{fontSize: '0.8125rem', color: '#333'}}>
                📊 {hoverTooltip.data.score}% retention
              </span>
              <span style={{fontSize: '0.8125rem', color: '#333'}}>
                🔗 {hoverTooltip.data.connections?.length || 0} connections
              </span>
            </div>
            <div style={{paddingTop: '0.5rem', borderTop: '1px solid #E0E0E0'}}>
              <span style={{fontSize: '0.75rem', color: '#888'}}>
                Last: {hoverTooltip.data.lastReview}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphD3;