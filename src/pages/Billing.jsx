import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import { getSavedCardvedio } from "../feature/savedCardSlice";
import {
  deleteSavedCard,
  clearDeleteMessages,
} from "../feature/savedCardSlice";

const Billing = () => {
  const dispatch = useDispatch();

  // Get state from Redux
  const savedCardsState = useSelector((state) => state.savedCards);
  const {
    cardvedio = [],
    loading,
    error,
    deleteSuccess,
    deleteError,
  } = savedCardsState || { cardvedio: [] };
  const user = useSelector((state) => state.profile?.user);
  const token = useSelector((state) => state.auth?.token);

  // ✅ Get customerId dynamically from user or localStorage
  const customerId = user?.customerId || localStorage.getItem("customerId");

  // Fetch saved cards
  useEffect(() => {
    if (customerId && token) {
      dispatch(getSavedCards({ customerId, token }));
    } else {
    }
  }, [dispatch, customerId, token]);

  // Handle card deletion
  const handleDeleteCard = (paymentMethodId) => {
    dispatch(
      deleteSavedCard({
        token,
        paymentMethodId,
        connectedAccountId: user?.connectedAccountId,
      })
    );
  };

  // Clear success/error messages after a delay
  useEffect(() => {
    if (deleteSuccess || deleteError) {
      const timer = setTimeout(() => {
        dispatch(clearDeleteMessages());
      }, 3000); // Clear messages after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess, deleteError, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  useEffect(() => {
    if (customerId && token) {
      dispatch(getSavedCardvedio({ customerId, token }));
    } else {
      console.warn("Missing customerId or token");
    }
  }, [dispatch, customerId, token]);

  return (
    <>
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
                    <h3 className="main-heading">Billing</h3>
                    <div className="billing-main">
                      {loading && <p>Loading cards...</p>}
                      {error && (
                        <div style={{ color: "red" }}>
                          Error: {error.message || "Failed to load cards"}
                        </div>
                      )}
                      {!loading && !error && cards.length === 0 && (
                        <p>No cards saved yet.</p>
                      )}
                      {!loading &&
                        cards.length > 0 &&
                        cards.map((card, index) => (
                          <div
                            className="billing-box"
                            key={card._id || card.id || index}
                          >
                            <div className="billing-head">
                              <h3>
                                {(
                                  card.card?.brand ||
                                  card.brand ||
                                  "CARD"
                                ).toUpperCase()}
                              </h3>
                              <div className="btn-block">
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                  Edit
                                </a>
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                  Delete
                                </a>
                              </div>
                            </div>
                            <div className="card-no">
                              **** **** ****{" "}
                              {card.card?.last4 || card.last4 || "****"}
                            </div>
                            <div className="card-date">
                              Expiry Date:{" "}
                              {card.card?.exp_month || card.exp_month || "MM"}/
                              {card.card?.exp_year || card.exp_year || "YY"}
                            </div>
                          </div>
                        ))}
                      <a
                        href="#"
                        className="btn btn-primary"
                        onClick={(e) => e.preventDefault()}
                      >
                        + Add New Card
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Billing;
