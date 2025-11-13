import React from 'react'
import Sidebar from '../components/Sidebar'
import ProfileHeader from '../components/ProfileHeader'

function Paymenthistory() {
  return (
    <div>
      <>
      <ProfileHeader/>
  {/* Main Wrapper : Start */}
  <main className="wrapper">
    {/* Container : Start */}
    <section className="middle-container">
      <div className="container-fluid">
        <div className="profile-wrapper">
          <div className="row">
            <div className="col-md-3">
              <Sidebar/>
            </div>
            <div className="col-md-9">
              <div className="profile-wrapper-right">
                <div className="payment-history-wrap">
                  <h3 className="main-heading">Payment History</h3>
                  <div className="payment-history-row">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="pay-history-left">
                          <div className="purchase-plan-wrap">
                            <span className="label">Purchased Plan:</span>
                            <small className="sm-label">Transaction ID:</small>
                            <big className="purchase-id">GDHHSHH5678</big>
                          </div>
                          <a
                            href="javascript:void(0);"
                            className="btn btn-primary"
                          >
                            Download invoice
                          </a>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="pay-history-right">
                          <div className="active-plan-wrap">
                            <span className="label">6 Months</span>
                            <small className="sm-label">Plan active till</small>
                            <big className="purchase-id">
                              30 May 2025 - 30 Nov 2025
                            </big>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <time>30 May 2025</time>
                      </div>
                    </div>
                  </div>
                  <div className="payment-history-row">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="pay-history-left">
                          <div className="purchase-plan-wrap">
                            <span className="label">Purchased Plan:</span>
                            <small className="sm-label">Transaction ID:</small>
                            <big className="purchase-id">GDHHSHH5678</big>
                          </div>
                          <a
                            href="javascript:void(0);"
                            className="btn btn-primary"
                          >
                            Download invoice
                          </a>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="pay-history-right">
                          <div className="active-plan-wrap">
                            <span className="label">6 Months</span>
                            <small className="sm-label">Plan active till</small>
                            <big className="purchase-id">
                              30 May 2025 - 30 Nov 2025
                            </big>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <time>30 May 2025</time>
                      </div>
                    </div>
                  </div>
                  <div className="payment-history-row">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="pay-history-left">
                          <div className="purchase-plan-wrap">
                            <span className="label">Purchased Plan:</span>
                            <small className="sm-label">Transaction ID:</small>
                            <big className="purchase-id">GDHHSHH5678</big>
                          </div>
                          <a
                            href="javascript:void(0);"
                            className="btn btn-primary"
                          >
                            Download invoice
                          </a>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="pay-history-right">
                          <div className="active-plan-wrap">
                            <span className="label">6 Months</span>
                            <small className="sm-label">Plan active till</small>
                            <big className="purchase-id">
                              30 May 2025 - 30 Nov 2025
                            </big>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <time>30 May 2025</time>
                      </div>
                    </div>
                  </div>
                  <div className="payment-history-row">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="pay-history-left">
                          <div className="purchase-plan-wrap">
                            <span className="label">Purchased Plan:</span>
                            <small className="sm-label">Transaction ID:</small>
                            <big className="purchase-id">GDHHSHH5678</big>
                          </div>
                          <a
                            href="javascript:void(0);"
                            className="btn btn-primary"
                          >
                            Download invoice
                          </a>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="pay-history-right">
                          <div className="active-plan-wrap">
                            <span className="label">6 Months</span>
                            <small className="sm-label">Plan active till</small>
                            <big className="purchase-id">
                              30 May 2025 - 30 Nov 2025
                            </big>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <time>30 May 2025</time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* Container : End */}
  </main>
</>
  </div>
  )
}

export default Paymenthistory
