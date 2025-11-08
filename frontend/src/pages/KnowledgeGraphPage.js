import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import KnowledgeGraphD3 from '../components/KnowledgeGraphD3';

const KnowledgeGraphPage = () => {
  const navigate = useNavigate();
  const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
  
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get(`${API}/topics`);
        setTopics(response.data?.topics || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setTopics([]);
        setLoading(false);
      }
    };

    fetchTopics();
  }, [API]);

  if (loading) {
    return (
      <AppLayout title="Your Knowledge Network">
        <div className="knowledge-graph-loading">
          <div className="loading-spinner"></div>
          <p>Loading your knowledge network...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Your Knowledge Network"
      subtitle="Interactive memory visualization • Click nodes to explore"
      maxWidth="100%"
    >
      <KnowledgeGraphD3 
          topics={topics} 
          userAvatar="/default-avatar.png"
          userName="Demo User"
          onClose={() => navigate(-1)}
          onReinforce={(node) => {
            console.log(`Reinforce ${node.title}`);
          }}
          hideHeader={true}
        />
    </AppLayout>
  );
};

export default KnowledgeGraphPage;
