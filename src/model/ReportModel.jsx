import React, { useState } from "react";

const ReportPostModal = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ reason, additionalDetails });
    // toast.success("Successfully submitted");
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="btn-close btn-" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <h3 className="main-heading">Report Post</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPostModal;
