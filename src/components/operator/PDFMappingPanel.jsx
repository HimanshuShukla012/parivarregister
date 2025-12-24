import React, { useState } from 'react';
import api from '../../services/api';
import DataTablePanel from './DataTablePanel';

const PDFMappingPanel = ( onSuccess, onError, setLoading ) => {
  const [gaonCode, setGaonCode] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const [registerOptions, setRegisterOptions] = useState([]);
  const [pdfUrl, setPdfUrl] = useState('');
  const [localPdfUrl, setLocalPdfUrl] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [showPDF, setShowPDF] = useState(true);
  const [tableData, setTableData] = useState([]);

  const handleGetVillageData = async (e) => {
    e.preventDefault();
    if (!gaonCode) {
      alert('कृपया गाँव कोड डालें!');
      return;
    }

    setLoading(true);
    try {
      // Fetch village registers
const villageResponse = await api.get(`/gaon/?gaonCode=${gaonCode}&underSupervisor=`);
      const data = villageResponse.data;

      const options = [];
      for (let i = 1; i <= parseInt(data.noOfRegisters); i++) {
        options.push(i);
      }
      setRegisterOptions(options);

      // Fetch pending village data
      const pendingResponse = await api.get(`/getPendingVilOperator/?gaonCode=${gaonCode}`);
      setTableData(pendingResponse.data);

    } catch (error) {
      alert('कृपया सही गाँव का चयन करें!');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetPDF = (e) => {
    e.preventDefault();
    if (!gaonCode || !registerNo) {
      alert('कृपया गाँव कोड और रजिस्टर नंबर दर्ज करें');
      return;
    }

    const url = `/getRegisterPDF/?gaonCode=${gaonCode}&registerNo=${registerNo}`;
    setPdfUrl(url);
    setLocalPdfUrl('');
  };

  const handleLocalPDFUpload = () => {
    const fileInput = document.getElementById('pdfInput1');
    const file = fileInput?.files?.[0];

    if (!file) {
      setUploadMessage('कृपया एक PDF फ़ाइल चुनें।');
      return;
    }

    if (file.type !== 'application/pdf') {
      setUploadMessage('केवल PDF फ़ाइलें अनुमत हैं।');
      return;
    }

    const blobURL = URL.createObjectURL(file);
    setLocalPdfUrl(blobURL);
    setPdfUrl('');
    setUploadMessage('PDF प्रीव्यू लोड हुआ।');
  };

  const displayUrl = localPdfUrl || pdfUrl;

  return (
    <div className="panel-wrapper" style={{ display: 'flex' }}>
      <div className={`subContainer ${!showPDF ? 'hidden' : ''}`} style={{ borderRight: 'none' }}>
        <h3>परिवार रजिस्टर स्कैन की गई फ़ाइल (पीडीएफ प्रारूप)</h3>
        
        <form id="pdfForm1" onSubmit={handleGetPDF}>
          <label htmlFor="registerNo1">रजिस्टर नंबर: &nbsp;</label>
          <select
            id="registerNo1"
            value={registerNo}
            onChange={(e) => setRegisterNo(e.target.value)}
            style={{ width: '40%' }}
            required
          >
            <option value="0">Select Register No.</option>
            {registerOptions.map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
          <button type="submit">Get PDF</button>

          <div className="file-upload-wrapper">
            <div className="file-actions">
              <input type="file" id="pdfInput1" accept="application/pdf" />
              <button type="button" id="localPdfUploadBtn1" onClick={handleLocalPDFUpload}>
                Upload PDF
              </button>
            </div>
            <span id="uploadMsg1">{uploadMessage}</span>
          </div>
        </form>

        {displayUrl && (
          <iframe
            id="pdfViewer1"
            className="pdf-viewer"
            src={displayUrl}
            frameBorder="0"
            height="600px"
            width="100%"
            style={{ display: 'block' }}
          />
        )}
      </div>

      <button
        id="togglePDFSection"
        onClick={() => setShowPDF(!showPDF)}
        style={{ paddingInline: '1px', marginTop: 0 }}
      >
        <i className={`fa fa-arrow-alt-circle-${showPDF ? 'left' : 'right'}`}></i>
      </button>

      <DataTablePanel
        gaonCode={gaonCode}
        setGaonCode={setGaonCode}
        onGetVillageData={handleGetVillageData}
        tableData={tableData}
        setTableData={setTableData}
        onSuccess={onSuccess}
        onError={onError}
        setLoading={setLoading}
        showPDF={showPDF}
      />
    </div>
  );
};

export default PDFMappingPanel;