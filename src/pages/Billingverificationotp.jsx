import React, { useRef } from 'react';

const Billingverificationotp = () => {
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (/^[0-9]$/.test(value)) {
      if (index < inputRefs.length - 1) {
        inputRefs[index + 1].current.focus();
      }
    } else {
      e.target.value = ''; // clear invalid input
    }
  };

  return (
    <div>
      <main className="wrapper">
        <section className="middle-container">
          <section className="login-wrapper verification-wrapper">
            <div className="container">
              <div className="row text-center">
                <div className="col-md-12">
                  <h3 className="main-heading">Verification Code</h3>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <form>
                    <div className="verification-fields">
                      <div className="form-group">
                        <label htmlFor="otp" className="form-label">
                          Enter OTP for verifying account.
                        </label>
                        <div className="fields">
                        {inputRefs.map((ref, index) => (
                            <input
                            key={index}
                            type="text"
                            maxLength={1}
                            className="form-control"
                            ref={ref}
                            style={{ textAlign: "center", fontSize: "24px" }}
                            onChange={(e) => handleChange(e, index)}
                            onFocus={(e) => e.target.select()}
                          />
                          
                          ))}
                        </div>
                      </div>
                      <div className="btn-block">
                        <button
                          type="button"
                          className="btn btn-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#makepaymenterror"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default Billingverificationotp;
