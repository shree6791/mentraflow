import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import KnowledgeGraph from '../components/KnowledgeGraph';
import '../styles/PageHeader.css';

const KnowledgeGraphPage = () => {
  const navigate = useNavigate();

  // Sample topics data (same as Dashboard)
  const topics = [
    { 
      id: 'spacing-effect', 
      title: 'Spacing Effect', 
      category: 'Memory Technique', 
      retention: 85,
      lastReviewed: '2 days ago',
      connections: ['working-memory', 'interleaving']
    },
    { 
      id: 'working-memory', 
      title: 'Working Memory', 
      category: 'Cognitive Science', 
      retention: 72,
      lastReviewed: '5 days ago',
      connections: ['spacing-effect', 'cognitive-load']
    },
    { 
      id: 'cognitive-load', 
      title: 'Cognitive Load', 
      category: 'Learning Theory', 
      retention: 55,
      lastReviewed: '2 weeks ago',
      connections: ['working-memory']
    },
    { 
      id: 'interleaving', 
      title: 'Interleaving Practice', 
      category: 'Memory Technique', 
      retention: 68,
      lastReviewed: '1 week ago',
      connections: ['spacing-effect']
    }
  ];

  return (
    <div className="knowledge-graph-page-wrapper">
      {/* App Header */}
      <AppHeader />
      
      {/* Knowledge Graph Component */}
      <div className="graph-page-content">
        <KnowledgeGraph 
          topics={topics} 
          userAvatar="/default-avatar.png"
          userName="Demo User"
          onClose={() => navigate(-1)}
          onReinforce={(node) => {
            console.log(`Reinforce ${node.title}`);
          }}
        />
      </div>
    </div>
  );
};

export default KnowledgeGraphPage;
