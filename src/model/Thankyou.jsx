import React from 'react'
import { logopopus } from '../imaUrl'
import { useNavigate } from "react-router-dom";

const Thankyou = () => {

  const navigate = useNavigate();

  return (
    <div>
      {/* Modal Thank you */}
      <div
        className="custom-modal modal fade"
        id="thankyoupopup"
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
                <div className="thankyou-wrapper">
                  <figure>
                    <img src={logopopus} alt="" />
                  </figure>
                  <h3 className="thankyou-heading">Thank You!</h3>
                  <p>
                    Thanks for the Payment. You will receive your invoice over your
                    email.{" "}
                  </p>
                  <div className="btn-block">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={() => navigate("/home")}>

                      Back to Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Thank you */}
    </div>
  )
}

export default Thankyou
