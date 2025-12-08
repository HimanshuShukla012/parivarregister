// src/components/sachiv/KeyLegend.jsx
import React, { useState } from 'react';

const KeyLegend = ({ onScrollToError }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="key-container">
      <div id="key">
        <div className="key-label">Error Keys:</div>
        <div className="key1">
          <div className="color-box" style={{ backgroundColor: 'red' }}>&nbsp;</div>
          <div className="text">Blank/Date</div>
        </div>
        &nbsp;&nbsp;&nbsp;
        <div className="key2">
          <div className="color-box" style={{ backgroundColor: 'cornflowerblue' }}>&nbsp;</div>
          <div className="text">Same House No. for Different Families</div>
        </div>
        <div>
          <button className="scroll-btn" onClick={onScrollToError}>
            Scroll to First Error
          </button>
        </div>
      </div>
      <div>
        <input
          id="search"
          type="text"
          className="form-control"
          placeholder="Search......"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default KeyLegend;