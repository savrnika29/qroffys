import { useCallback, useEffect, useRef, useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSubscriptionPlan,
  paymentId,
  subscriptionAdded,
  deactivateSubscriptionPlan,
} from "../feature/subscriptionSlice";
import Loader from "../components/Loader";
import { getProfile } from "../feature/profileSlice";
import { deleteAlert } from "../utils/swalHelper";

function Subscription() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscription, allSubscription] = useState([]);
  const { token } = useSelector((store) => store?.auth);
  const [selectedSubscription, setSelectedSubscription] = useState();
  const [planTaken, setPlanTaken] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  const { user } = useSelector((store) => store?.profile);

  useEffect(() => {
    dispatch(getProfile(token));
  }, [dispatch]);

  function getCurrencySymbol(currencyCode) {
    try {
      const parts = Intl.NumberFormat("en", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).formatToParts(0);

      const symbol = parts.find((part) => part.type === "currency")?.value;
      return symbol || "";
    } catch (error) {
      // Invalid currency code will throw, return empty string
      return "";
    }
  }

  const handleNavigate = (price, currency, id) => {
    dispatch(subscriptionAdded({ amount: price, currency }));

    dispatch(paymentId(id));

    // navigate("/makepayment");

    // dispatch(subscriptionAdded({ amount: price, currency }));
    // dispatch(paymentId(id));
    // navigate("/scanface");

    navigate(`/scanface?planId=${id}&amount=${price}`);
    // navigate("/makepayment?isBilling=false");

    // navigate("/makepayment");
  };

  const getSubscription = async (pageNum = 1) => {
    try {
      const { payload } = await dispatch(
        getSubscriptionPlan({ page: pageNum, setLoading, token })
      );

      setPlanTaken(payload?.data?.hasActivePlan);
      const newPlans = payload?.data?.plans || [];

      if (newPlans.length === 0 || newPlans.length < 10) {
        setHasMore(false);
      }

      if (pageNum === 1) {
        const dataId = newPlans?.find((plan) => plan.isActive === true)?._id;
        setSelectedSubscription(dataId);
        allSubscription(newPlans);
      } else {
        allSubscription((prev) => [...prev, ...newPlans]);
      }
    } catch (error) {
      setHasMore(false);
    }
  };

  function capitalizeWords(str) {
    return str?.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    if (token) {
      getSubscription(page);
    }
  }, [page]);

  const handleDeactivate = async (dataId) => {
    const result = await deleteAlert(
      "Are you sure?",
      "Do you really want to deactivate this plan?"
    );

    if (result.isConfirmed) {
      const { payload } = await dispatch(
        deactivateSubscriptionPlan({ dataId, token })
      );

      if (payload) {
        window.location.reload();
      }
    } else {
      console.log("User cancelled deactivation");
    }
  };

  const getCurrentActivePlan = () => {
    return subscription?.find((plan) => plan?.isPurchased === true);
  };

  return (
    <div>
      <>
        <ProfileHeader />
        {/* Main Wrapper : Start */}
        <main className="wrapper">
          {loading && <Loader />}
          {/* Container : Start */}
          <section className="middle-container">
            <section className="login-wrapper select-subscription-wrap">
              <div className="container">
                <div className="row text-center">
                  <div className="col-md-12">
                    <h3 className="main-heading">Select Subscription Plan</h3>
                  </div>
                </div>
                <div className="subscription-wrap">
                  <div className="row">
                    {/* <div className="col-md-4">
                      <div className="subscription-box">
                        <h3 className="subscription-heading">Basic</h3>
                        <div className="subscription-amount">
                          <big>$25</big>
                          <small>USD/month</small>
                        </div>
                        <div className="subscription-text">
                          <ul>
                            <li>Lorem Ipsum is simply dummy text</li>
                            <li>Lorem simply dummy text</li>
                          </ul>
                        </div>
                        <div className="btn-block">
                          <a className="btn btn-light disabled">
                            Your current plan
                          </a>
                        </div>
                      </div>
                    </div> */}
                    {subscription
                      ?.filter((subscribed) => subscribed?.isActive === true)
                      ?.map((subscripted, index) => {
                        const isLast = index === subscription.length - 1;
                        return (
                          <div
                            className="col-md-4"
                            style={{
                              cursor:
                                subscripted?.isPurchased === true
                                  ? "default"
                                  : "pointer",
                            }}
                            onClick={() => {
                              setSelectedSubscription(subscripted?._id);
                            }}
                            ref={isLast ? lastElementRef : null}
                          >
                            <div
                              className={
                                selectedSubscription === subscripted?._id
                                  ? "subscription-box popular-plan"
                                  : "subscription-box"
                              }
                            >
                              <h3 className="subscription-heading">
                                {capitalizeWords(subscripted?.name)}
                              </h3>
                              <div className="subscription-amount">
                                <big>
                                  {getCurrencySymbol(subscripted?.currency)}
                                  {subscripted?.price}{" "}
                                </big>
                                <small>{subscripted?.currency}</small>
                              </div>
                              <div className="subscription-text">
                                <ul>
                                  <li>{subscripted?.description}</li>
                                  {/* <li>Lorem simply dummy text</li> */}
                                </ul>
                              </div>
                              <div className="btn-block">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!subscripted?.isPurchased) {
                                      handleNavigate(
                                        subscripted?.price,
                                        subscripted?.currency,
                                        subscripted?._id
                                      );
                                    }
                                  }}
                                  className={
                                    subscripted?.isPurchased === true
                                      ? "btn btn-light disabled"
                                      : subscripted?._id ===
                                        selectedSubscription
                                      ? "btn btn-primary"
                                      : "btn btn-dark"
                                  }
                                  disabled={subscripted?.isPurchased === true}
                                >
                                  {planTaken === true
                                    ? subscripted?.isPurchased === true
                                      ? "Your Current Plan"
                                      : "Upgrade Plan"
                                    : "Get Plan"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {/* <div className="col-md-4">
                      <div className="subscription-box ">
                        <h3 className="subscription-heading">Gold</h3>
                        <div className="subscription-amount">
                          <big>$44</big>
                          <small>USD/month</small>
                        </div>
                        <div className="subscription-text">
                          <ul>
                            <li>Lorem Ipsum is simply dummy text</li>
                            <li>Lorem simply dummy text</li>
                          </ul>
                        </div>
                        <div className="btn-block">
                          <a className="btn btn-dark">Upgrade plan</a>
                        </div>
                      </div>
                    </div> */}
                  </div>
                  {loading && (
                    <div className="row text-center mt-3">
                      <div className="col-md-12">
                        <h6 className="text-muted">Loading more...</h6>
                      </div>
                    </div>
                  )}
                  {hasMore && (
                    <div className="row text-center mt-3">
                      <div className="col-md-12">
                        <h6 className="text-muted">Scroll to load more...</h6>
                      </div>
                    </div>
                  )}

                  {/* {!hasMore && (
                    <div className="row text-center mt-3">
                      <div className="col-md-12">
                        <p className="text-muted">No more plans available</p>
                      </div>
                    </div>
                  )} */}
                  {planTaken && getCurrentActivePlan() && (
                    <div className="row text-center">
                      <div className="col-md-12">
                        {/* <a
                        className="btn btn-outline-light"
                        onClick={handleDeactivate}
                      >
                        Deactivate Plan
                      </a> */}
                        <a
                          className="btn btn-outline-light"
                          onClick={() =>
                            handleDeactivate(getCurrentActivePlan()._id)
                          }
                        >
                          Deactivate Plan
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </section>
          {/* Container : End */}
        </main>
        {/* Main Wrapper : End */}
      </>
    </div>
  );
}

export default Subscription;
