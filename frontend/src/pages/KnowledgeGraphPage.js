import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import KnowledgeGraph from '../components/KnowledgeGraph';

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
    <AppLayout 
      title="Your Knowledge Network"
      subtitle="Interactive memory visualization • Click nodes to explore"
      maxWidth="100%"
    >
      <KnowledgeGraph 
          topics={topics} 
          userAvatar="/default-avatar.png"
          userName="Demo User"
          onClose={() => navigate(-1)}
          onReinforce={(node) => {
            console.log(`Reinforce ${node.title}`);
          }}
          hideHeader={true}
        />
      </div>
    </div>
  );
};

export default KnowledgeGraphPage;
