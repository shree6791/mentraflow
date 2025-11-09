import React from 'react';
import { X } from 'lucide-react';

const FilterModal = ({
  show,
  onClose,
  quickFilter,
  setQuickFilter,
  sortBy,
  setSortBy
}) => {
  if (!show) return null;

  const handleFilterChange = (filter) => {
    setQuickFilter(filter);
    onClose();
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Filters & Sorting</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          <div className="filter-section">
            <h3>Filter by Status</h3>
            <div className="filter-buttons">
              <button 
                className={`filter-option-btn ${quickFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All Items
              </button>
              <button 
                className={`filter-option-btn warning ${quickFilter === 'due-soon' ? 'active' : ''}`}
                onClick={() => handleFilterChange('due-soon')}
              >
                ⏰ Due Soon
              </button>
              <button 
                className={`filter-option-btn urgent ${quickFilter === 'fading' ? 'active' : ''}`}
                onClick={() => handleFilterChange('fading')}
              >
                🔴 Fading
              </button>
              <button 
                className={`filter-option-btn success ${quickFilter === 'strong' ? 'active' : ''}`}
                onClick={() => handleFilterChange('strong')}
              >
                ✅ Strong
              </button>
            </div>
          </div>

          <div className="filter-section">
            <h3>Sort by</h3>
            <div className="sort-options">
              <button 
                className={`sort-option-btn ${sortBy === 'priority' ? 'active' : ''}`}
                onClick={() => handleSortChange('priority')}
              >
                Priority
              </button>
              <button 
                className={`sort-option-btn ${sortBy === 'recent' ? 'active' : ''}`}
                onClick={() => handleSortChange('recent')}
              >
                Recent
              </button>
              <button 
                className={`sort-option-btn ${sortBy === 'score' ? 'active' : ''}`}
                onClick={() => handleSortChange('score')}
              >
                Score
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
