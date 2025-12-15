// src/components/hq/VerifyDataEntryForm.jsx
import React, { useState } from 'react';
import hqService from '../../services/hqService';

const VerifyDataEntryForm = ({ zilaList, onGaonDataLoad }) => {
  const [selectedZila, setSelectedZila] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedGaon, setSelectedGaon] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [gaons, setGaons] = useState([]);
  const [loading, setLoading] = useState({
    blocks: false,
    gaons: false,
    data: false
  });
  const [error, setError] = useState('');

  const handleZilaChange = async (e) => {
    const zila = e.target.value;
    setSelectedZila(zila);
    setSelectedBlock('');
    setSelectedGaon('');
    setBlocks([]);
    setGaons([]);
    setError('');

    if (zila) {
      setLoading(prev => ({ ...prev, blocks: true }));
      try {
        const blockData = await hqService.getBlocksByZila(zila);
        
        // FIX 2: Add safety checks for API response
        console.log('Block data received:', blockData);
        
        if (!blockData) {
          console.error('Block data is null or undefined');
          setError('No blocks found for this district');
          setBlocks([]);
        } else if (!Array.isArray(blockData)) {
          console.error('Block data is not an array:', typeof blockData, blockData);
          setError('Invalid block data format received');
          setBlocks([]);
        } else {
          setBlocks(blockData);
          if (blockData.length === 0) {
            setError('No blocks available for this district');
          }
        }
      } catch (error) {
        console.error('Error fetching blocks:', error);
        setError('Failed to load blocks. Please try again.');
        setBlocks([]);
      } finally {
        setLoading(prev => ({ ...prev, blocks: false }));
      }
    }
  };

  const handleBlockChange = async (e) => {
  const block = e.target.value;
  setSelectedBlock(block);
  setSelectedGaon('');
  setGaons([]);
  setError('');

  if (block) {
    setLoading(prev => ({ ...prev, gaons: true }));
    try {
      // Use the new method that only fetches villages with data entry
      const gaonData = await hqService.getVillagesWithDataEntry(block);
        
        // Add safety checks for gaon data
        console.log('Gaon data received:', gaonData);
        
        if (!gaonData) {
          console.error('Gaon data is null or undefined');
          setError('No villages found for this block');
          setGaons([]);
        } else if (!Array.isArray(gaonData)) {
          console.error('Gaon data is not an array:', typeof gaonData, gaonData);
          setError('Invalid village data format received');
          setGaons([]);
        } else {
          setGaons(gaonData);
          if (gaonData.length === 0) {
            setError('No villages available for this block');
          }
        }
      } catch (error) {
        console.error('Error fetching gaons:', error);
        setError('Failed to load villages. Please try again.');
        setGaons([]);
      } finally {
        setLoading(prev => ({ ...prev, gaons: false }));
      }
    }
  };

  const handleGaonChange = (e) => {
    setSelectedGaon(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedZila || !selectedBlock || !selectedGaon) {
      setError('Please select all fields');
      return;
    }

    setLoading(prev => ({ ...prev, data: true }));
    setError('');

    try {
      const data = await hqService.getGaonData(selectedGaon);
      
      if (!data) {
        setError('No data found for selected village');
        return;
      }
      
      if (!Array.isArray(data)) {
        console.error('Gaon data is not an array:', data);
        setError('Invalid village data format');
        return;
      }
      
      onGaonDataLoad(data);
    } catch (error) {
      console.error('Error fetching gaon data:', error);
      setError('Failed to fetch village data. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Verify Data Entry</h2>
        <div className="section-line"></div>
      </div>
      
      {error && (
        <div style={{
          padding: '12px',
          margin: '10px 0',
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '14px'
        }}>
          <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          {error}
        </div>
      )}
      
      <div id="formContainer" className="filter-section">
        <form id="getRawDataForm" onSubmit={handleSubmit}>
          <div className="formSubContainer">
            <div>
              <label htmlFor="rawDataZila">
                ज़िला <span className="required">*</span>
              </label>
              <select
                name="rawDataZila"
                id="rawDataZila"
                value={selectedZila}
                onChange={handleZilaChange}
                disabled={loading.blocks}
                required
              >
                <option value="" disabled>
                  Select Zila
                </option>
                {Array.isArray(zilaList) && zilaList.map((zila) => (
                  <option key={zila.zila} value={zila.zila}>
                    {zila.zila}
                  </option>
                ))}
              </select>
              {loading.blocks && (
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Loading blocks...
                </small>
              )}
            </div>

            <div>
              <label htmlFor="rawDataBlock">
                ब्लाक <span className="required">*</span>
              </label>
              <select
                name="rawDataBlock"
                id="rawDataBlock"
                value={selectedBlock}
                onChange={handleBlockChange}
                disabled={!selectedZila || loading.blocks || loading.gaons}
                required
              >
                <option value="" disabled>
                  {loading.blocks ? 'Loading...' : 'Select Block'}
                </option>
                {Array.isArray(blocks) && blocks.map((block) => (
  <option key={block.blockCode || block.block} value={block.block}>
    {block.blockCode ? `${block.blockCode} - ${block.block}` : block.block}
  </option>
))}
              </select>
              {loading.gaons && (
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Loading villages...
                </small>
              )}
            </div>

            <div>
              <label htmlFor="gaon">
                गाँव <span className="required">*</span>
              </label>
              <select
                name="gaon"
                id="gaon"
                value={selectedGaon}
                onChange={handleGaonChange}
                disabled={!selectedBlock || loading.gaons || loading.data}
                required
              >
                <option value="" disabled>
                  {loading.gaons ? 'Loading...' : 'Select Gaon'}
                </option>
                {Array.isArray(gaons) && gaons.map((gaon) => (
                  <option key={gaon.gaonCode} value={gaon.gaonCode}>
                    {gaon.gaon}
                  </option>
                ))}
              </select>
            </div>

            <button 
              id="gaonBtn" 
              type="submit"
              disabled={loading.data || !selectedZila || !selectedBlock || !selectedGaon}
              style={{
                opacity: loading.data ? 0.6 : 1,
                cursor: loading.data ? 'not-allowed' : 'pointer'
              }}
            >
              {loading.data ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i> डेटा प्राप्त करें
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyDataEntryForm;