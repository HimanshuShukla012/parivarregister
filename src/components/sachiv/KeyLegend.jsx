import React from 'react';

const KeyLegend = ({ onScrollToError, searchTerm, onSearchChange }) => {
  return (
    <div style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px 20px',
      marginBottom: '20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Left Section - Error Keys */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        flex: '1'
      }}>
        <div style={{
          fontWeight: '600',
          fontSize: '0.95rem',
          color: '#1e293b',
          whiteSpace: 'nowrap'
        }}>
          त्रुटि संकेत:
        </div>
        
        {/* Red Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#dc2626',
            borderRadius: '4px',
            border: '1px solid #b91c1c'
          }}></div>
          <span style={{
            fontSize: '0.875rem',
            color: '#475569',
            whiteSpace: 'nowrap'
          }}>
            रिक्त/तिथि
          </span>
        </div>

        {/* Blue Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: 'cornflowerblue',
            borderRadius: '4px',
            border: '1px solid #5a8fd4'
          }}></div>
          <span style={{
            fontSize: '0.875rem',
            color: '#475569',
            whiteSpace: 'nowrap'
          }}>
            विभिन्न परिवारों के लिए समान मकान नंबर
          </span>
        </div>

        {/* Scroll Button */}
        <button
          onClick={onScrollToError}
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#5568d3';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#667eea';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.2)';
          }}
        >
          <i className="fas fa-arrow-down" style={{ marginRight: '6px' }}></i>
          पहली त्रुटि पर जाएं
        </button>
      </div>

      {/* Right Section - Search */}
      <div style={{
        minWidth: '250px',
        maxWidth: '350px'
      }}>
        <div style={{ position: 'relative' }}>
          <i className="fas fa-search" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}></i>
          <input
            type="text"
            placeholder="खोजें......"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: 'white'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default KeyLegend;