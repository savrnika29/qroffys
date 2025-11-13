import React from 'react'

const Makepaymentfaceqr = () => {
  return (
    <div>
      <>
  <main className="wrapper">
    {/* Container : Start */}
    <section className="middle-container">
      <section className="login-wrapper">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-12">
              <h3 className="main-heading">Make Payment</h3>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="make-payment-wrap face-qr">
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <i className="icon find-business-icon" />
                      <input
                        type="text"
                        className="form-control"
                        id="find-business"
                        placeholder="Find Business"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <i className="icon amount-icon" />
                      <input
                        type="number"
                        className="form-control"
                        id="enter-amount"
                        placeholder="Enter Amount"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="btn-block">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#thankyoupopup"
                      >
                        <i className="pay-face-icon" />
                        Pay by Face
                      </button>
                      <button
                        type="submit"
                        className="btn btn-dark"
                        data-bs-toggle="modal"
                        data-bs-target="#thankyoupopup"
                      >
                        <i className="pay-qr-icon" />
                        Pay by QR
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
    {/* Container : End */}
  </main>


 
</>

    </div>
  )
}

export default Makepaymentfaceqr
