import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProfileHeader from "../components/ProfileHeader";
import Sidebar from "../components/Sidebar";
import {
  fetchPaymentRequests,
  declinePaymentRequest,
  clearError,
} from "../feature/paymentrequsetSlice";
import { deleteAlert, showAlert } from "../utils/swalHelper";
import { crossredicon } from "../imaUrl";
import { showPayAlert } from "../utils/swalHelper";
const Allrequest = () => {
  const dispatch = useDispatch();
  const { paymentRequests, status, error, approveStatus, declineStatus } =
    useSelector((state) => state.paymentRequests);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Handle approve button click
  const handleApprove = (requestId, amount, businessId) => {
    if (!user?.isSubscribed) {
      showPayAlert(
        "info",
        "You need an active subscription to access this page!"
      ).then((result) => {
        if (result.isConfirmed) {
          navigate("/subscription");
        }
      });
    } else {
      navigate(
        `/scanface?requestId=${requestId}&pay=true&businessId=${businessId}&amount=${amount}`
      );
    }
  };

  useEffect(() => {
    dispatch(fetchPaymentRequests());
  }, [dispatch, approveStatus, declineStatus]);

  // Handle decline button click
  const handleDecline = (requestId) => {
    dispatch(declinePaymentRequest(requestId));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    const time = date.toLocaleString("en-US", options);

    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${time} ${day} ${month} ${year}`;
  };

  if (error) {
    return (
      <div>
        Error: {error}
        <button onClick={() => dispatch(clearError())}>Clear Error</button>
      </div>
    );
  }

  return (
    <div>
      <ProfileHeader />
      <main className="wrapper">
        <section className="middle-container">
          <div className="container-fluid">
            <div className="profile-wrapper">
              <div className="row">
                <div className="col-md-3">
                  <Sidebar />
                </div>
                <div className="col-md-9">
                  <div className="profile-wrapper-right">
                    <div className="payment-history-wrap all-request-wrap">
                      <h3 className="main-heading">All Payment Requests</h3>
                      {paymentRequests.length === 0 ? (
                        <p>No payment requests found.</p>
                      ) : (
                        paymentRequests.map((request) => (
                          <div className="payment-history-row" key={request.id}>
                            <div className="row">
                              <div className="col-md-9">
                                <div className="pay-history-left all-request-left">
                                  <div className="purchase-plan-wrap">
                                    <small className="sm-label">
                                      From:{" "}
                                      {request.businessId?.businessName ||
                                        "Unknown"}
                                    </small>
                                    <big className="purchase-id">
                                      Payment request: {request.id}
                                    </big>
                                  </div>
                                  <div className="btn-block">
                                    {request.status === "reject" ? (
                                      <button
                                        className="btn btn-primary approved"
                                        style={{ PointerEvent: "none" }}
                                      >
                                        <i className="cross-icon">
                                          <img src={crossredicon} />
                                        </i>
                                        Declined
                                      </button>
                                    ) : request.status === "paid" ? (
                                      <button className="btn btn-primary approved">
                                        <i className="tick-icon" />
                                        Approved
                                      </button>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          className="btn btn-primary me-2"
                                          onClick={() => {
                                            handleApprove(
                                              request._id,
                                              request.amount,
                                              request.businessId?._id
                                            );
                                          }}
                                          disabled={approveStatus === "loading"}
                                        >
                                          Approve
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-dark"
                                          onClick={async (e) => {
                                            e.preventDefault();

                                            const result = await deleteAlert(
                                              "Are you sure?",
                                              "Do you really want to decline this payment request?"
                                            );

                                            if (result.isConfirmed) {
                                              handleDecline(request._id);
                                            }
                                          }}
                                          disabled={declineStatus === "loading"}
                                        >
                                          Decline
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="pay-history-right">
                                  <div className="col-md-12">
                                    <time>{formatDate(request.createdAt)}</time>
                                  </div>
                                  <div className="active-plan-wrap all-request-right">
                                    <span className="label">
                                      ${request.amount} USD
                                    </span>
                                    {request?.discount && (
                                      <>
                                        <big className="gradient-text">
                                          {request?.discount}%
                                        </big>
                                        <big className="disconut">
                                          Discount Applied
                                        </big>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Allrequest;
