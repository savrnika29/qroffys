import React from 'react'

const Moreinfo = ({ onClose, businessData }) => {

  return (
    <div>
      <div
        className="custom-modal modal fade"
        id="moreinfopopup"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <div className="container">
                <div className="more-info-wrap">
                  <h3 className="main-heading">Info</h3>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-info">
                        <span className="label">Business Name:</span>
                        {/* <span className="value">Adam R.</span> */}
                        <span className="value">{businessData?.businessName || "N/A"}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-info">
                        <span className="label">Business Category</span>
                        {/* <span className="value">Blogger Qroffer</span> */}
                        <span className="value">{businessData?.categoryId?.name || "N/A"}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-info">
                        <span className="label">City:</span>
                        {/* <span className="value">California</span> */}
                        <span className="value">{businessData?.city?.name || "N/A"}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-info">
                        <span className="label">State</span>
                        {/* <span className="value">California</span> */}
                        <span className="value">{businessData?.state?.name || "N/A"}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-info">
                        <span className="label">Country</span>
                        {/* <span className="value">USA</span> */}
                        <span className="value">{businessData?.country?.name || "N/A"}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-info">
                        <span className="label">Business Type</span>
                        {/* <span className="value">Online store</span> */}
                        <span className="value">{businessData?.businessType || "N/A"}</span>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-info">
                        <span className="label">Address:</span>
                        {/* <span className="value">California USA California USA</span> */}
                        <span className="value">{businessData?.address || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Moreinfo
