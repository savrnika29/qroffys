// src/model/Makepaymentsentsuccessful.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logopopus } from "../imaUrl";

const Makepaymentsentsuccessful = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    const modalEl = document.getElementById("makepaymentsentsucessful");

    if (modalEl && window.bootstrap && window.bootstrap.Modal) {
      const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
    }

    navigate("/home");
  };

  return (
    <div>
      <div
        className="custom-modal modal fade"
        id="makepaymentsentsucessful"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="container">
                <div className="thankyou-wrapper text-center">
                  <figure>
                    <img src={logopopus} alt="Logo" />
                  </figure>
                  <h3 className="thankyou-heading">
                    Payment Request Sent Successfully!
                  </h3>
                  <div className="btn-block mt-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-bs-dismiss="modal"
                      onClick={() => navigate("/home")}
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Makepaymentsentsuccessful;
