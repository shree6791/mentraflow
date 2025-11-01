import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as d3 from 'd3';
import '../styles/KnowledgeGraph.css';

const KnowledgeGraphPage = () => {
  const navigate = useNavigate();
  const svgRef = useRef();

  // Sample data
  const graphData = {
    nodes: [
      { id: 'spacing-effect', label: 'Spacing Effect', category: 'memory', retention: 'high' },
      { id: 'working-memory', label: 'Working Memory', category: 'cognition', retention: 'high' },
      { id: 'cognitive-load', label: 'Cognitive Load', category: 'cognition', retention: 'medium' },
      { id: 'neural-pathways', label: 'Neural Pathways', category: 'neuroscience', retention: 'medium' },
      { id: 'interleaving', label: 'Interleaving', category: 'memory', retention: 'weak' },
      { id: 'retrieval-practice', label: 'Retrieval Practice', category: 'memory', retention: 'weak' }
    ],
    links: [
      { source: 'spacing-effect', target: 'working-memory', strength: 'strong' },
      { source: 'spacing-effect', target: 'retrieval-practice', strength: 'medium' },
      { source: 'working-memory', target: 'cognitive-load', strength: 'strong' },
      { source: 'cognitive-load', target: 'neural-pathways', strength: 'medium' },
      { source: 'interleaving', target: 'spacing-effect', strength: 'weak' },
      { source: 'retrieval-practice', target: 'working-memory', strength: 'weak' }
    ]
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Color scale for categories
    const colorScale = {
      memory: '#0E7C7B',
      cognition: '#4E9AF1',
      neuroscience: '#FFD166'
    };

    // Create force simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('class', d => `link ${d.strength}`)
      .attr('stroke', '#ddd')
      .attr('stroke-width', d => d.strength === 'strong' ? 3 : d.strength === 'medium' ? 2 : 1)
      .attr('stroke-opacity', 0.6);

    // Create node groups
    const node = svg.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', 40)
      .attr('fill', d => colorScale[d.category])
      .attr('stroke', d => {
        if (d.retention === 'high') return '#06D6A0';
        if (d.retention === 'medium') return '#FFD166';
        return '#EF476F';
      })
      .attr('stroke-width', 4)
      .attr('opacity', 0.9);

    // Add labels to nodes
    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .style('pointer-events', 'none')
      .call(wrap, 70);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Text wrapping function
    function wrap(text, width) {
      text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const y = text.attr('y');
        const dy = parseFloat(text.attr('dy'));
        let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
        
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
          }
        }
      });
    }

  }, []);

  return (
    <div className="knowledge-graph-page">
      <div className="graph-page-container">
        {/* Header */}
        <div className="graph-page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="header-content">
            <h1>Knowledge Graph</h1>
            <p className="subtitle">Visualize connections between your learned topics</p>
          </div>
        </div>

        {/* Legend */}
        <div className="graph-legend">
          <div className="legend-section">
            <h4>Categories</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-dot" style={{background: '#0E7C7B'}}></div>
                <span>Memory Techniques</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{background: '#4E9AF1'}}></div>
                <span>Cognition</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{background: '#FFD166'}}></div>
                <span>Neuroscience</span>
              </div>
            </div>
          </div>
          <div className="legend-section">
            <h4>Retention Status</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-ring" style={{borderColor: '#06D6A0'}}></div>
                <span>Strong</span>
              </div>
              <div className="legend-item">
                <div className="legend-ring" style={{borderColor: '#FFD166'}}></div>
                <span>Medium</span>
              </div>
              <div className="legend-item">
                <div className="legend-ring" style={{borderColor: '#EF476F'}}></div>
                <span>Needs Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph Container */}
        <div className="graph-container">
          <svg ref={svgRef} className="knowledge-graph-svg"></svg>
          <div className="graph-hint">
            💡 Drag nodes to explore connections
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphPage;
