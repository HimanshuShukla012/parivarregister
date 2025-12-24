import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import PDFViewer from '../../../components/operator/PDFViewer';
import FamilyEntryForm from '../../../components/operator/FamilyEntryForm';
import PDFMappingPanel from '../../../components/operator/PDFMappingPanel';
import '../../../assets/styles/pages/operator.css';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [entriesToday, setEntriesToday] = useState(0);
  const [showPDFMapping, setShowPDFMapping] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalColor, setModalColor] = useState('green');
  const [currentGaonCode, setCurrentGaonCode] = useState(''); // ✅ Shared state for gaonCode

  useEffect(() => {
    fetchEntriesToday();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleBeforeUnload = () => {
    navigator.sendBeacon('/ajax_logout/');
  };

  const fetchEntriesToday = async () => {
    try {
const response = await api.get('/opDailyEntryCount/');
      setEntriesToday(response.data.entriesToday);
    } catch (error) {
      console.error('Error fetching daily entries:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const showMessage = (message, color = 'green') => {
    setModalMessage(message);
    setModalColor(color);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    if (modalMessage === 'Saved Successfully!') {
      // Refresh entries count
      fetchEntriesToday();
    }
  };

  return (
    <div>
      {/* Loading Screen */}
      {loading && (
        <div id="loading-screen" style={{ display: 'flex' }}>
          <div className="spinner"></div>
          <h2>&nbsp;&nbsp;&nbsp;Loading, please wait...</h2>
        </div>
      )}

      {/* Header */}
      <header className="backgroundOrange">
        <div className="heading">
          <h1>Parivar Register</h1>
          
          <button className="guideline" style={{ margin: '0 20px 10px 20px', padding: 0, border: 'none', background: 'none' }}>
            <a 
              href="/static/assets/Operator Roles & Responsibilities.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="guidelineBtn"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#f0f0f0',
                color: '#000',
                fontSize: '14px',
                textDecoration: 'underline',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
              }}
            >
              View/Download Guidelines
            </a>
          </button>

          <button className="guideline" style={{ margin: '0 20px 10px 20px', padding: 0, border: 'none', background: 'none' }}>
            <a 
              href="/static/assets/Operator_Demo.mp4" 
              target="_blank"
              rel="noopener noreferrer"
              className="guidelineBtn"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#f0f0f0',
                color: '#000',
                fontSize: '14px',
                textDecoration: 'underline',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
              }}
            >
              Watch Demo Video
            </a>
          </button>

          <h3>Entries Today: <span id="entries">{entriesToday}</span></h3>

          <div>
            <button 
              id="switch" 
              onClick={() => setShowPDFMapping(!showPDFMapping)}
              style={{ marginRight: '15px' }}
            >
              {showPDFMapping ? 'Data Entry' : 'PDF Mapping'}
            </button>
            <button onClick={handleLogout} className="logoutBtn">
              लॉग आउट
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!showPDFMapping ? (
        <section className="container">
          {/* ✅ Pass currentGaonCode to PDFViewer */}
          <PDFViewer gaonCode={currentGaonCode} />
          
          {/* ✅ Pass setCurrentGaonCode to FamilyEntryForm */}
          <FamilyEntryForm 
            userId={user?.loginID} 
            onSuccess={() => showMessage('Saved Successfully!', 'green')}
            onError={(msg) => showMessage(msg, 'red')}
            setLoading={setLoading}
            onGaonCodeChange={setCurrentGaonCode}
          />
        </section>
      ) : (
        <PDFMappingPanel 
          userId={user?.loginID}
          onSuccess={() => showMessage('Saved Successfully!', 'green')}
          onError={(msg) => showMessage(msg, 'red')}
          setLoading={setLoading}
        />
      )}

      {/* Message Modal */}
      {showModal && (
        <div className={`popup ${showModal ? 'isVisible' : ''}`}>
          <div className="popupModal">
            <button 
              id="btnCloseForm" 
              className="close-button"
              onClick={closeModal}
            >
              X
            </button>
            <h1 style={{ color: modalColor }}>{modalMessage}</h1>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;