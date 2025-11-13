import React from 'react'

const Makepaymenterror = () => {
  return (
    <div>
        <div>
      {/* Modal Error */}
      
      <div
            className="custom-modal modal fade"
            id="errorpopup"
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
          <div className="error-wrapper text-center">
            <h3 className="main-heading">Oops!</h3>
            <p>Insufficient funds.</p>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  {/* Modal Error */}
    </div>
    </div>
  )
}

export default Makepaymenterror

