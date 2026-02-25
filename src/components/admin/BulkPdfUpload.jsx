// src/components/admin/BulkPdfUpload.jsx
import { useState, useRef, useCallback } from "react";
import bulkUploadService from "../../services/bulkUploadService"; // ← real API

// ─── Utility ────────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  DONE: "done",
  ERROR: "error",
};

// ─── File Row ────────────────────────────────────────────────────────────────
const FileRow = ({ item, onRemove }) => {
  const isUploading = item.status === STATUS.UPLOADING;
  const isDone      = item.status === STATUS.DONE;
  const isError     = item.status === STATUS.ERROR;
  const isIdle      = item.status === STATUS.IDLE;

  const statusColor = isDone
    ? "#22c55e"
    : isError
    ? "#ef4444"
    : isUploading
    ? "#f59e0b"
    : "#94a3b8";

  const statusLabel = isDone
    ? "Done"
    : isError
    ? item.errorMsg || "Failed"
    : isUploading
    ? `${item.progress}%`
    : "Queued";

  return (
    <div style={rowStyles.wrapper}>
      {/* PDF icon */}
      <div style={rowStyles.iconWrap}>
        <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
          <rect width="22" height="26" rx="3" fill="#1e293b" />
          <path d="M4 6h9l5 5v9a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" fill="#334155" />
          <path d="M13 6l5 5h-5V6z" fill="#475569" />
          <text x="3" y="21" fontSize="5" fontWeight="700" fill="#f59e0b" fontFamily="monospace">PDF</text>
        </svg>
      </div>

      {/* File info + progress */}
      <div style={rowStyles.info}>
        <div style={rowStyles.topRow}>
          <span style={rowStyles.name} title={item.file.name}>
            {item.file.name}
          </span>
          <span style={{ ...rowStyles.statusBadge, color: statusColor }}>
            {statusLabel}
          </span>
        </div>

        <div style={rowStyles.meta}>{formatBytes(item.file.size)}</div>

        {/* Progress bar */}
        <div style={rowStyles.barTrack}>
          <div
            style={{
              ...rowStyles.barFill,
              width: `${item.progress}%`,
              background: isDone
                ? "linear-gradient(90deg, #22c55e, #16a34a)"
                : isError
                ? "linear-gradient(90deg, #ef4444, #b91c1c)"
                : "linear-gradient(90deg, #f59e0b, #d97706)",
              transition: isUploading ? "width 0.15s ease" : "none",
            }}
          />
        </div>
      </div>

      {/* Remove / status icon */}
      <div style={rowStyles.actions}>
        {isDone     && <span style={rowStyles.checkIcon}>✓</span>}
        {isError    && <span style={rowStyles.errorIcon}>✕</span>}
        {isIdle     && (
          <button style={rowStyles.removeBtn} onClick={() => onRemove(item.id)} title="Remove">
            ✕
          </button>
        )}
        {isUploading && <div style={rowStyles.spinner} />}
      </div>
    </div>
  );
};

const rowStyles = {
  wrapper: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 14px", background: "rgba(255,255,255,0.03)",
    borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)",
    marginBottom: "6px", transition: "background 0.2s",
  },
  iconWrap: { flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" },
  name: { fontSize: "13px", fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "300px" },
  statusBadge: { fontSize: "11px", fontWeight: 700, fontFamily: "monospace", flexShrink: 0, marginLeft: "8px" },
  meta: { fontSize: "11px", color: "#64748b", marginBottom: "5px" },
  barTrack: { height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.08)", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "2px" },
  actions: { flexShrink: 0, width: "24px", display: "flex", alignItems: "center", justifyContent: "center" },
  checkIcon: { color: "#22c55e", fontWeight: 700, fontSize: "16px" },
  errorIcon: { color: "#ef4444", fontWeight: 700, fontSize: "14px" },
  removeBtn: { background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px", padding: "2px 4px", lineHeight: 1, borderRadius: "3px", transition: "color 0.15s" },
  spinner: { width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid #f59e0b", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
};

// ─── Overall Progress Summary Bar ────────────────────────────────────────────
const OverallProgress = ({ files }) => {
  if (files.length === 0) return null;

  const total     = files.length;
  const done      = files.filter((f) => f.status === STATUS.DONE).length;
  const errors    = files.filter((f) => f.status === STATUS.ERROR).length;
  const uploading = files.filter((f) => f.status === STATUS.UPLOADING).length;
  const pct       = Math.round((done / total) * 100);
  const allDone   = done + errors === total && total > 0;

  return (
    <div style={overallStyles.wrapper}>
      <div style={overallStyles.header}>
        <span style={overallStyles.label}>Overall Progress</span>
        <span style={overallStyles.stats}>
          <span style={{ color: "#22c55e" }}>{done} done</span>
          {errors   > 0 && <span style={{ color: "#ef4444" }}> · {errors} failed</span>}
          {uploading > 0 && <span style={{ color: "#f59e0b" }}> · {uploading} uploading</span>}
          <span style={{ color: "#64748b" }}> / {total} total</span>
        </span>
      </div>

      <div style={overallStyles.trackOuter}>
        <div style={{ ...overallStyles.fillSegment, width: `${(done / total) * 100}%`, background: "linear-gradient(90deg, #22c55e, #16a34a)", zIndex: 2 }} />
        <div style={{ ...overallStyles.fillSegment, left: `${(done / total) * 100}%`, width: `${(errors / total) * 100}%`, background: "linear-gradient(90deg, #ef4444, #b91c1c)", zIndex: 1 }} />
      </div>

      <div style={overallStyles.pctRow}>
        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
          {allDone
            ? errors === 0
              ? "✓ All files uploaded successfully"
              : `Completed with ${errors} error${errors > 1 ? "s" : ""}`
            : `${pct}% complete`}
        </span>
        <span style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 700, fontFamily: "monospace" }}>
          {pct}%
        </span>
      </div>
    </div>
  );
};

const overallStyles = {
  wrapper: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  label: { fontSize: "13px", fontWeight: 700, color: "#cbd5e1", letterSpacing: "0.5px", textTransform: "uppercase" },
  stats: { fontSize: "12px", fontFamily: "monospace" },
  trackOuter: { position: "relative", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: "8px" },
  fillSegment: { position: "absolute", top: 0, height: "100%", borderRadius: "4px", transition: "width 0.3s ease" },
  pctRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
};

// ─── Main Component ───────────────────────────────────────────────────────────
const BulkPdfUpload = () => {
  const [files, setFiles]               = useState([]);
  const [isDragging, setIsDragging]     = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef(null);
  const idCounter    = useRef(0);

  const makeId = () => `file_${++idCounter.current}`;

  const addFiles = useCallback((newFiles) => {
    const pdfs = Array.from(newFiles).filter(
      (f) => f.type === "application/pdf" || f.name.endsWith(".pdf")
    );
    if (pdfs.length === 0) {
      alert("Please select PDF files only.");
      return;
    }
    setUploadComplete(false);
    setFiles((prev) => [
      ...prev,
      ...pdfs.map((f) => ({ id: makeId(), file: f, status: STATUS.IDLE, progress: 0, errorMsg: "" })),
    ]);
  }, []);

  const handleFileInput = (e) => { addFiles(e.target.files); e.target.value = ""; };
  const handleDrop      = (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };
  const handleRemove    = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const handleClearAll  = () => { setFiles([]); setUploadComplete(false); };

  const updateFile = (id, patch) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  // ─── Real chunked upload via bulkUploadService ──────────────────────────
  const handleUpload = async () => {
    const pending = files.filter((f) => f.status === STATUS.IDLE);
    if (pending.length === 0) return;

    setIsUploading(true);
    setUploadComplete(false);

    const CONCURRENCY = 3; // upload up to 3 files simultaneously
    const queue = [...pending];

    const uploadOne = async (item) => {
      updateFile(item.id, { status: STATUS.UPLOADING, progress: 0 });
      try {
        await bulkUploadService.uploadPdfInChunks(item.file, (pct) => {
          updateFile(item.id, { progress: pct });
        });
        updateFile(item.id, { status: STATUS.DONE, progress: 100 });
      } catch (err) {
        updateFile(item.id, {
          status: STATUS.ERROR,
          progress: 100,
          errorMsg: err.message || "Upload failed",
        });
      }
    };

    for (let i = 0; i < queue.length; i += CONCURRENCY) {
      await Promise.all(queue.slice(i, i + CONCURRENCY).map(uploadOne));
    }

    setIsUploading(false);
    setUploadComplete(true);
  };

  const idleCount  = files.filter((f) => f.status === STATUS.IDLE).length;
  const hasFiles   = files.length > 0;
  const allSettled = files.length > 0 && files.every((f) => f.status === STATUS.DONE || f.status === STATUS.ERROR);

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .bulk-drop-zone:hover   { border-color: rgba(245,158,11,0.6) !important; background: rgba(245,158,11,0.04) !important; }
        .bulk-upload-btn:hover:not(:disabled) { background: linear-gradient(135deg,#d97706,#b45309) !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(245,158,11,0.35) !important; }
        .bulk-upload-btn:active:not(:disabled){ transform: translateY(0); }
        .bulk-clear-btn:hover   { color: #ef4444 !important; border-color: rgba(239,68,68,0.4) !important; }
        .file-row-anim          { animation: fadeIn 0.25s ease; }
      `}</style>

      <div style={mainStyles.container}>
        {/* Header */}
        <div style={mainStyles.header}>
          <div style={mainStyles.headerLeft}>
            <div style={mainStyles.titleIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9"  y1="15" x2="12" y2="12" />
                <line x1="15" y1="15" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <h2 style={mainStyles.title}>PDF Bulk Upload</h2>
              <p style={mainStyles.subtitle}>Select and upload multiple PDF files at once</p>
            </div>
          </div>

          {hasFiles && !isUploading && (
            <button className="bulk-clear-btn" onClick={handleClearAll} style={mainStyles.clearBtn}>
              Clear All
            </button>
          )}
        </div>

        {/* Drop Zone */}
        <div
          className="bulk-drop-zone"
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            ...mainStyles.dropZone,
            borderColor: isDragging ? "rgba(245,158,11,0.8)" : "rgba(255,255,255,0.12)",
            background:  isDragging ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.02)",
            cursor:      isUploading ? "not-allowed" : "pointer",
            pointerEvents: isUploading ? "none" : "auto",
          }}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple style={{ display: "none" }} onChange={handleFileInput} />

          <div style={mainStyles.dropIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={isDragging ? "#f59e0b" : "#475569"} strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p style={{ ...mainStyles.dropText, color: isDragging ? "#f59e0b" : "#94a3b8" }}>
            {isDragging ? "Drop your PDFs here" : "Drag & drop PDF files here"}
          </p>
          <p style={mainStyles.dropSubtext}>or click to browse</p>
          <div style={mainStyles.dropBadge}>PDF only</div>
        </div>

        {/* Overall Progress */}
        {(isUploading || uploadComplete) && files.length > 0 && (
          <OverallProgress files={files} />
        )}

        {/* File List */}
        {hasFiles && (
          <div style={mainStyles.fileList}>
            <div style={mainStyles.fileListHeader}>
              <span style={mainStyles.fileListTitle}>
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </span>
              {idleCount > 0 && !isUploading && (
                <span style={mainStyles.idleBadge}>{idleCount} pending</span>
              )}
            </div>

            <div style={mainStyles.fileListScroll}>
              {files.map((item) => (
                <div key={item.id} className="file-row-anim">
                  <FileRow item={item} onRemove={handleRemove} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {hasFiles && (
          <div style={mainStyles.footer}>
            {allSettled && uploadComplete ? (
              <div style={mainStyles.completeBanner}>
                <span style={{ color: "#22c55e", fontSize: "18px" }}>✓</span>
                <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                  Upload complete —&nbsp;
                  <strong style={{ color: "#e2e8f0" }}>{files.filter((f) => f.status === STATUS.DONE).length}</strong> succeeded,&nbsp;
                  <strong style={{ color: files.filter((f) => f.status === STATUS.ERROR).length > 0 ? "#ef4444" : "#94a3b8" }}>
                    {files.filter((f) => f.status === STATUS.ERROR).length}
                  </strong> failed
                </span>
              </div>
            ) : (
              <button
                className="bulk-upload-btn"
                onClick={handleUpload}
                disabled={isUploading || idleCount === 0}
                style={{
                  ...mainStyles.uploadBtn,
                  opacity: isUploading || idleCount === 0 ? 0.6 : 1,
                  cursor:  isUploading || idleCount === 0 ? "not-allowed" : "pointer",
                  animation: isUploading ? "pulse 1.5s ease infinite" : "none",
                }}
              >
                {isUploading ? (
                  <>
                    <div style={mainStyles.btnSpinner} />
                    Uploading {files.filter((f) => f.status === STATUS.UPLOADING).length} file(s)...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "8px" }}>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17,8 12,3 7,8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Bulk Upload {idleCount} PDF{idleCount !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const mainStyles = {
  container: { background: "linear-gradient(145deg, #0f172a, #1e293b)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px", maxWidth: "720px", margin: "0 auto", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#e2e8f0" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  titleIcon: { width: "42px", height: "42px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { margin: 0, fontSize: "18px", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.3px" },
  subtitle: { margin: "2px 0 0", fontSize: "12px", color: "#64748b" },
  clearBtn: { background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "12px", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s", fontWeight: 600 },
  dropZone: { border: "2px dashed", borderRadius: "12px", padding: "36px 20px", textAlign: "center", transition: "all 0.2s ease", marginBottom: "18px", userSelect: "none" },
  dropIcon: { marginBottom: "10px" },
  dropText: { margin: "0 0 4px", fontSize: "15px", fontWeight: 600, transition: "color 0.2s" },
  dropSubtext: { margin: "0 0 12px", fontSize: "12px", color: "#475569" },
  dropBadge: { display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "3px 10px", borderRadius: "20px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" },
  fileList: { marginBottom: "16px" },
  fileListHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  fileListTitle: { fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  idleBadge: { fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" },
  fileListScroll: { maxHeight: "340px", overflowY: "auto", paddingRight: "4px" },
  footer: { marginTop: "4px" },
  uploadBtn: { width: "100%", padding: "13px 24px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f172a", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.2s ease", boxShadow: "0 4px 15px rgba(245,158,11,0.25)", letterSpacing: "0.3px" },
  btnSpinner: { width: "16px", height: "16px", border: "2.5px solid rgba(15,23,42,0.2)", borderTop: "2.5px solid #0f172a", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: "8px", flexShrink: 0 },
  completeBanner: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "10px", justifyContent: "center" },
};

export default BulkPdfUpload;