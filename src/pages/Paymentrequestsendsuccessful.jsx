import React from 'react'
import ProfileHeader from '../components/ProfileHeader'

const Paymentrequestsendsuccessful = () => {
  return (
    <div>
      <>
  <ProfileHeader/>
  {/* Main Wrapper : Start */}
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
              <div className="make-payment-wrap">
                <h3 className="payment-heading">Enter Card Detail</h3>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="card-holder-name" className="form-label">
                        Card Holder Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="card-holder-name"
                        placeholder="Name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="card-number" className="form-label">
                        Enter Card Number
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="card-number"
                        placeholder="Number"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="expiry-date" className="form-label">
                        Expiry date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="expiry-date"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="csv" className="form-label">
                        CSV
                      </label>
                      <input type="number" className="form-control" id="csv" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-checkbox">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="checkChecked"
                          defaultChecked=""
                        />
                        <label
                          className="form-check-label"
                          htmlFor="checkChecked"
                        >
                          I agree to term &amp; conditions
                        </label>
                      </div>
                      <div className="form-text">
                        You information will be save for the future payment.
                      </div>
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
                        Save
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
  {/* Main Wrapper : End */}
 
</>

    </div>
  )
}

export default Paymentrequestsendsuccessful
