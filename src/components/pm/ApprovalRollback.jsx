import React, { useState, useEffect } from 'react';
import { 
  Search, UserCheck, CheckCircle, XCircle, ChevronDown, ChevronRight, 
  Users, MapPin, FileText, AlertCircle, RefreshCw, Home, Check, FileDown
} from 'lucide-react';

const PMApprovalRollback = () => {
  const [activeTab, setActiveTab] = useState('rejected');
  const [loading, setLoading] = useState(false);
  
  // Rejected Families States
  const [gaons, setGaons] = useState([]);
  const [selectedGaon, setSelectedGaon] = useState(null);
  const [families, setFamilies] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [expandedFamily, setExpandedFamily] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Approval Queue States
  const [updatedFamilies, setUpdatedFamilies] = useState([]);
  const [selectedForApproval, setSelectedForApproval] = useState([]);
  const [approvalSearchTerm, setApprovalSearchTerm] = useState('');
  
  // Approved Data
  const [approvedData, setApprovedData] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalRejected: 0,
    assignedToSupervisor: 0,
    pendingApproval: 0,
    approved: 0
  });

  useEffect(() => {
    if (activeTab === 'rejected') {
      fetchRejectedGaons();
      fetchSupervisors();
    } else if (activeTab === 'approval') {
      fetchUpdatedFamilies();
    } else if (activeTab === 'approved') {
      fetchApprovedData();
    }
  }, [activeTab]);

  const fetchRejectedGaons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/getRejectedGaonList', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Rejected Gaons Response:', data);
      
      if (data.success) {
        setGaons(data.data || []);
        setStats(prev => ({ 
          ...prev, 
          totalRejected: data.count || data.data?.length || 0 
        }));
      } else {
        console.error('API returned success: false', data);
        alert(data.error || data.message || 'Failed to load rejected villages');
        setGaons([]);
      }
    } catch (error) {
      console.error('Error fetching gaons:', error);
      alert(`Failed to load rejected villages: ${error.message}`);
      setGaons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRejectedFamilies = async (gaonCode) => {
    setLoading(true);
    try {
      const response = await fetch(`/getRejectedByGaonCode?gaonCode=${gaonCode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Rejected Families Response:', data);
      
      if (data.success) {
      console.log('Families array:', data.data);
      console.log('Families length:', data.data?.length);
        setFamilies(data.data || []);
      } else {
        alert(data.message || data.error || 'Failed to load rejected families');
        setFamilies([]);
      }
    } catch (error) {
      console.error('Error fetching families:', error);
      alert(`Failed to load rejected families: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await fetch('/get_supervisors_desu', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Supervisors Response:', data);
      
      if (data.success) {
        setSupervisors(data.data || []);
      } else {
        console.warn('Failed to load supervisors:', data.message);
        setSupervisors([]);
      }
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      setSupervisors([]);
    }
  };

  const assignSupervisor = async () => {
    if (!selectedGaon || !selectedSupervisor) {
      alert('Please select both a village and supervisor');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/assignSupervisorToRejectedFamilies', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gaonCode: selectedGaon.gaonCode,
          supervisorId: selectedSupervisor
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Supervisor assigned successfully!');
        setSelectedSupervisor('');
        fetchRejectedGaons();
        setFamilies([]);
        setSelectedGaon(null);
      } else {
        alert(data.message || data.error || 'Failed to assign supervisor');
      }
    } catch (error) {
      console.error('Error assigning supervisor:', error);
      alert('Failed to assign supervisor');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdatedFamilies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/get_updated_rejected_gaon', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Updated Families Response:', data);
      
      if (data.success) {
        const enrichedData = await Promise.all(
          (data.data || []).map(async (item) => {
            try {
              const detailResponse = await fetch(
                `/getRejectedByGaonCode?gaonCode=${item.gaonCode}`,
                { credentials: 'include' }
              );
              const detailData = await detailResponse.json();
              
              if (detailData.success && detailData.data) {
                const familyMember = detailData.data.find(f => f.id === item.fromID);
                return {
                  ...item,
                  memberName: familyMember?.memberName || 'Unknown',
                  familyHeadName: familyMember?.familyHeadName || 'Unknown',
                  caste: familyMember?.caste || 'Unknown'
                };
              }
              return item;
            } catch {
              return item;
            }
          })
        );
        
        setUpdatedFamilies(enrichedData);
        setStats(prev => ({ ...prev, pendingApproval: enrichedData.length }));
      }
    } catch (error) {
      console.error('Error fetching updated families:', error);
      alert('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const approveFamilies = async () => {
    if (selectedForApproval.length === 0) {
      alert('Please select at least one family to approve');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/bulk-approve-rejected-families', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ rejectedFamilyIds: selectedForApproval })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`${data.data.approved} families approved successfully!`);
        setSelectedForApproval([]);
        fetchUpdatedFamilies();
      } else {
        alert(data.message || 'Failed to approve families');
      }
    } catch (error) {
      console.error('Error approving families:', error);
      alert('Failed to approve families');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/get_approved_gaon_codes', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setApprovedData(data.data?.gaonCodes || []);
        setStats(prev => ({ ...prev, approved: data.data?.count || 0 }));
      }
    } catch (error) {
      console.error('Error fetching approved data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredGaons = () => {
    if (!searchTerm) return gaons;
    return gaons.filter(gaon =>
      gaon.gaon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gaon.gaonCode?.toString().includes(searchTerm)
    );
  };

  const getFilteredUpdatedFamilies = () => {
    if (!approvalSearchTerm) return updatedFamilies;
    return updatedFamilies.filter(family =>
      family.gaonCode?.toString().includes(approvalSearchTerm) ||
      family.memberName?.toLowerCase().includes(approvalSearchTerm.toLowerCase()) ||
      family.familyHeadName?.toLowerCase().includes(approvalSearchTerm.toLowerCase())
    );
  };

  const groupFamiliesByHouse = (familiesData) => {
    const grouped = {};
    familiesData.forEach(member => {
      const key = `${member.houseNumberNum}_${member.familyHeadName}`;
      if (!grouped[key]) {
        grouped[key] = {
          houseNumberNum: member.houseNumberNum,
          houseNumberText: member.houseNumberText,
          familyHeadName: member.familyHeadName,
          members: []
        };
      }
      grouped[key].members.push(member);
    });
    return Object.values(grouped);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8fafc, #e0e7ff)', padding: '2rem' }}>
      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem',
        maxWidth: '1400px',
        margin: '0 auto 2rem'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
          borderRadius: '16px', 
          padding: '1.5rem', 
          color: 'white',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px' }}>
              <XCircle size={28} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.totalRejected}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Rejected Villages</div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
          borderRadius: '16px', 
          padding: '1.5rem', 
          color: 'white',
          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px' }}>
              <UserCheck size={28} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.assignedToSupervisor}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Assigned to Supervisor</div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
          borderRadius: '16px', 
          padding: '1.5rem', 
          color: 'white',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px' }}>
              <AlertCircle size={28} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.pendingApproval}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Pending Approval</div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #10b981, #059669)', 
          borderRadius: '16px', 
          padding: '1.5rem', 
          color: 'white',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px' }}>
              <CheckCircle size={28} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.approved}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Approved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('rejected')}
            style={{
              flex: 1,
              padding: '1.25rem 2rem',
              border: 'none',
              background: activeTab === 'rejected' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'transparent',
              color: activeTab === 'rejected' ? 'white' : '#64748b',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <XCircle size={20} />
            Rejected Families
          </button>
          
          <button
            onClick={() => setActiveTab('approval')}
            style={{
              flex: 1,
              padding: '1.25rem 2rem',
              border: 'none',
              background: activeTab === 'approval' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: activeTab === 'approval' ? 'white' : '#64748b',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={20} />
            Pending Approval ({stats.pendingApproval})
          </button>
          
          <button
            onClick={() => setActiveTab('approved')}
            style={{
              flex: 1,
              padding: '1.25rem 2rem',
              border: 'none',
              background: activeTab === 'approved' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: activeTab === 'approved' ? 'white' : '#64748b',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle size={20} />
            Approved
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2rem' }}>
          {/* Rejected Families Tab */}
          {activeTab === 'rejected' && (
            <div>
              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '500px' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search villages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Village Selection */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>
                  <MapPin size={16} />
                  Select Village
                </label>
                <select
                  value={selectedGaon?.gaonCode || ''}
                  onChange={(e) => {
  const selectedCode = e.target.value;
  console.log('Selected Code:', selectedCode);
  
  // Convert string to number for comparison
  const gaon = gaons.find(g => g.gaonCode.toString() === selectedCode);
  console.log('Found Gaon:', gaon);
  
  setSelectedGaon(gaon);
  setFamilies([]);
  setExpandedFamily(null);
  setSelectedSupervisor('');
  
  if (gaon) {
    console.log('Fetching families for:', gaon.gaonCode);
    fetchRejectedFamilies(gaon.gaonCode);
  }
}}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Choose a Village...</option>
                  {getFilteredGaons().map(gaon => (
                    <option key={gaon.gaonCode} value={gaon.gaonCode}>
                      {gaon.gaon} ({gaon.gaonCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Supervisor Assignment - Shows ONLY when village is selected */}
              {selectedGaon && (
  <div key={selectedGaon.gaonCode} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: '600', color: '#1e293b' }}>
                    <UserCheck size={16} />
                    Assign Supervisor to {selectedGaon.gaon}
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <select
                      value={selectedSupervisor}
                      onChange={(e) => setSelectedSupervisor(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.875rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        cursor: 'pointer',
                        background: 'white'
                      }}
                    >
                      <option value="">Select Supervisor...</option>
                      {supervisors.map(sup => (
                        <option key={sup.loginID} value={sup.loginID}>
                          {sup.name} ({sup.loginID})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={assignSupervisor}
                      disabled={!selectedSupervisor || loading}
                      style={{
                        padding: '0.875rem 2rem',
                        background: selectedSupervisor && !loading ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#cbd5e1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: selectedSupervisor && !loading ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedSupervisor && !loading ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                      }}
                    >
                      {loading ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </div>
              )}

              {/* Families List - Shows ONLY when village is selected */}
              {selectedGaon && !loading && families.length > 0 && (
                <div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#1e293b', 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FileText size={20} />
                    Rejected Families
                    <span style={{ 
                      background: '#fee2e2', 
                      color: '#dc2626', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.875rem',
                      fontWeight: '700'
                    }}>
                      {families.length}
                    </span>
                  </h3>
                  
                  {groupFamiliesByHouse(families).map((family, idx) => (
                    <div key={idx} style={{ 
                      marginBottom: '1rem', 
                      border: '2px solid #e2e8f0', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <div
                        onClick={() => setExpandedFamily(expandedFamily === idx ? null : idx)}
                        style={{
                          padding: '1.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                          transition: 'background 0.3s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <Home size={24} color="#f59e0b" />
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '1.1rem' }}>
                              House #{family.houseNumberNum} - {family.familyHeadName}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              {family.members.length} member{family.members.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        {expandedFamily === idx ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>

                      {expandedFamily === idx && (
                        <div style={{ background: 'white' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Caste</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Gender</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {family.members.map(member => (
                                <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                  <td style={{ padding: '1rem', color: '#1e293b' }}>{member.memberName}</td>
                                  <td style={{ padding: '1rem', color: '#1e293b' }}>{member.caste}</td>
                                  <td style={{ padding: '1rem', color: '#1e293b' }}>{member.gender}</td>
                                  <td style={{ padding: '1rem' }}>
                                    <span style={{
                                      padding: '0.375rem 0.875rem',
                                      background: '#fee2e2',
                                      color: '#dc2626',
                                      borderRadius: '20px',
                                      fontSize: '0.75rem',
                                      fontWeight: '600'
                                    }}>
                                      Rejected
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <RefreshCw size={48} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading...</p>
                </div>
              )}

              {!loading && selectedGaon && families.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.1rem' }}>No rejected families found for this village</p>
                </div>
              )}

              {!loading && !selectedGaon && gaons.length > 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <MapPin size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.1rem' }}>Please select a village to view rejected families</p>
                </div>
              )}
            </div>
          )}

          {/* Approval Tab */}
          {activeTab === 'approval' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                  <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search by village code or family name..."
                    value={approvalSearchTerm}
                    onChange={(e) => setApprovalSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>
                
                {selectedForApproval.length > 0 && (
                  <button
                    onClick={approveFamilies}
                    disabled={loading}
                    style={{
                      padding: '0.875rem 2rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    <Check size={16} />
                    Approve Selected ({selectedForApproval.length})
                  </button>
                )}
              </div>

              <div style={{ border: '2px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e293b', width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={selectedForApproval.length === getFilteredUpdatedFamilies().length && getFilteredUpdatedFamilies().length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedForApproval(getFilteredUpdatedFamilies().map(f => f.id));
                            } else {
                              setSelectedForApproval([]);
                            }
                          }}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Village Code</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Family Head</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Member</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Caste</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredUpdatedFamilies().map((family, idx) => (
                      <tr key={family.id} style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        background: idx % 2 === 0 ? 'white' : '#f8fafc',
                        transition: 'background 0.2s ease'
                      }}>
                        <td style={{ padding: '1rem' }}>
                          <input
                            type="checkbox"
                            checked={selectedForApproval.includes(family.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedForApproval([...selectedForApproval, family.id]);
                              } else {
                                setSelectedForApproval(selectedForApproval.filter(id => id !== family.id));
                              }
                            }}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '1rem', color: '#1e293b', fontWeight: '500' }}>{family.gaonCode}</td>
                        <td style={{ padding: '1rem', color: '#475569' }}>{family.familyHeadName || 'Loading...'}</td>
                        <td style={{ padding: '1rem', color: '#475569' }}>{family.memberName || 'Loading...'}</td>
                        <td style={{ padding: '1rem', color: '#475569' }}>{family.caste || 'Loading...'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <RefreshCw size={48} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading pending approvals...</p>
                </div>
              )}

              {!loading && getFilteredUpdatedFamilies().length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <CheckCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ fontSize: '1.1rem' }}>No families awaiting approval</p>
                </div>
              )}
            </div>
          )}

          {/* Approved Tab */}
          {activeTab === 'approved' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle size={20} color="#10b981" />
                  Approved Village Codes
                  <span style={{ 
                    background: '#d1fae5', 
                    color: '#059669', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.875rem',
                    fontWeight: '700'
                  }}>
                    {approvedData.length}
                  </span>
                </h3>
                {approvedData.length > 0 && (
                  <button
                    onClick={() => {
                      const url = `/get_all_approved_by_pm_data/?gaonCodes=${approvedData.join(',')}`;
                      window.open(url, '_blank');
                    }}
                    style={{
                      padding: '0.875rem 2rem',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <FileDown size={16} />
                    Download All Data
                  </button>
                )}
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: '1rem' 
              }}>
                {approvedData.map((code, idx) => (
                  <div key={idx} style={{
                    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                    border: '2px solid #10b981',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'default'
                  }}>
                    <MapPin size={32} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: '700', color: '#065f46', fontSize: '1.5rem' }}>{code}</div>
                    <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.5rem', fontWeight: '600' }}>Approved</div>
                  </div>
                ))}
              </div>

              {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <RefreshCw size={48} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading approved data...</p>
                </div>
              )}

              {!loading && approvedData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ fontSize: '1.1rem' }}>No approved villages yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default PMApprovalRollback;