import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSavedCards } from "../feature/savedCard/savedCardSlice";
import ProfileHeader from "../components/ProfileHeader";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { submitHelpRequest, clearMessages } from "../feature/helpSlice";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  getSavedCardvedio,
  getSavedCardBusiness,
  deleteSavedCard,
} from "../feature/savedCardSlice";
import { updateProfile, getProfile } from "../feature/profileSlice";
// import { deleteSavedCard, clearDeleteMessages } from "../feature/savedCardSlice";
// import { getSavedCardvedio } from "../feature/savedCardSlice";
import {
  getPaymentHistory,
  downloadPaymentInvoice,
} from "../feature/paymentHistorySlice";
import { deleteAlert } from "../utils/swalHelper";

import {
  previcon,
  closeicon,
  language,
  paymentmethod,
  helpcenter,
  paymenthistory,
  saveicon,
  billing,
  deactivateicon,
  deactivateiconbig,
  frame,
  frameicon,
  moreicon,
} from "../imaUrl";
import moment from "moment/moment";
import { getSavedPostandStories } from "../feature/savedPostandStoriesSlice";
import { deactivateAccount } from "../feature/deactivateSlice";
import { onBoardStatusData } from "../feature/businessOnboardSlice";
import Loader from "../components/Loader";

// Validation schema matching Helpcenter
const schema = yup.object().shape({
  fullName: yup
    .string()
    .test(
      "no-digits",
      "Full name must contain only characters (no numbers)",
      (value) => !/\d/.test(value)
    )
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name too long")
    .required("Full name is required"),
  mobile: yup.string().required("Mobile number is required"),
  email: yup
    .string()
    .email("Email must be valid (e.g., user@example.com)")
    .required("Email is required"),
  message: yup
    .string()
    .min(10, "Message should be at least 10 characters")
    .required("Message is required"),
});

const Languagesetting = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const cards = useSelector((state) => state.savedCards?.cardvedio);
  // const {cardvedio=[] } = useSelector((state) => state.savedCards || {});

  // const { cardvedio, loading, error, deleteSuccess, deleteError } = useSelector(
  //   (state) => state.savedCardsvedio || {}
  // );
  const [businessType, setBusinessType] = useState("");
  const { items, loading, error } = useSelector(
    (state) => state?.savedPostandStories
  );
  const { loading: accountLoading } = useSelector((state) => state.account);
  const [loader, setLoading] = useState(false);
  const cardvedio = items?.postsDetails || [];

  const user = useSelector((state) => state.profile?.user);
  const userInfo = useSelector((state) => state.auth?.user);
  const token = useSelector((state) => state.auth?.token);
  const userId = localStorage.getItem("userId");

  const {
    payments,
    loading: paymentLoading,
    error: paymentError,
  } = useSelector((state) => state.paymentHistory || {});
  // Redux state
  // const { loading, successMessage, errorMessage } = useSelector(
  //   (state) => state.help
  // );

  // Fetch user profile
  const getProfileInfo = async () => {
    try {
      await dispatch(getProfile(token));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

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

  const handleDeactivate = () => {
    dispatch(deactivateAccount({ token, payload: {} }))
      .unwrap()
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {
        toast.error(err);
      });
  };

  // Clear success/error messages after a delay
  // useEffect(() => {
  //   if (deleteSuccess || deleteError) {
  //     const timer = setTimeout(() => {
  //       dispatch(clearDeleteMessages());
  //     }, 3000); // Clear messages after 3 seconds
  //     return () => clearTimeout(timer);
  //   }
  // }, [ deleteError, dispatch]);
  // Initial data

  const cardPaymentBusiness = async () => {
    try {
      if (user?.onboardingStatus === "pending") {
        const payload = {
          type: "",
          businessId: businessid,
        };
        const data = await dispatch(
          onBoardStatusData({ payload, token, setLoading })
        );
        if (data?.payload?.error === false) {
          window.open(
            data?.payload?.data?.onboardingUrl,
            "_self",
            "noopener,noreferrer"
          );
        }
      } else {
        const payload = {
          type: "account_update",
          businessId: businessid,
        };
        const dataRes = await dispatch(
          onBoardStatusData({ payload, token, setLoading })
        );

        if (dataRes?.payload?.error === false) {
          window.open(
            dataRes?.payload?.data?.updateUrl,
            "_self",
            "noopener,noreferrer"
          );
        }
      }
    } catch (error) { }
  };

  useEffect(() => {
    if (token) {
      getProfileInfo();
    }
  }, [token]);
  // Form setup
  const { successMessage, errorMessage } = useSelector((state) => state.help);
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const section = queryParams.get("section");
    if (section) {
      setActiveSection(section); // Set active section (e.g., "billing")
    }
  }, [location]);

  useEffect(() => {
    if (token) {
      dispatch(getPaymentHistory({ token }));
      getProfileInfo();
    }
  }, [dispatch, token]);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      message: "",
    },
  });
  // Form submission

  useEffect(() => {
    if (user) {
      reset({
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        mobile: user?.phoneNumber || user?.mobileNo || user?.mobile || "",
        message: "",
        userId: user._id || userId,
      });
    }
  }, [user, reset, userId]);

  const onSubmit = (data) => {
    const formData = {
      name: data.fullName,
      email: data.email,
      mobileNo: data.mobile, // ✅ Correct key
      message: data.message,
      userId: user?._id || userId,
    };
    dispatch(submitHelpRequest({ formData, token }));
    reset({
      fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      email: user?.email || "",
      mobile: user?.phoneNumber || "",
      message: "",
    });
  };

  // Clear messages on unmount
  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  const customerId = user?.customerId || localStorage.getItem("customerId");
  const businessid = user?._id || localStorage.getItem("_id");

  useEffect(() => {
    // console.log('customerId:', customerId, 'token:', token);

    if (customerId && token) {
      dispatch(getSavedCardvedio({ customerId, token }));
      dispatch(getSavedPostandStories({ token }));
    } else if (businessid && token) {
      dispatch(
        getSavedCardBusiness({ businessId: businessid, token, setBusinessType })
      );
    } else {
      console.warn("Missing customerId or token");
    }
  }, [dispatch, customerId, businessid, token]);
  // Form setup

  const [activeSection, setActiveSection] = useState("language");
  const [userType, setUserType] = useState(""); // default to business
  const dropdownToggleRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    const storedUserType = localStorage.getItem("profile");

    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, []);

  useEffect(() => {
    const handleToggleClick = (e) => {
      e.stopPropagation();
      dropdownMenuRef.current?.classList.toggle("show");

    };

    const handleDocumentClick = (e) => {
      if (
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(e.target) &&
        !dropdownToggleRef.current.contains(e.target)
      ) {
        dropdownMenuRef.current.classList.remove("show");
      }
    };

    const toggleBtn = dropdownToggleRef.current;

    if (toggleBtn && dropdownMenuRef.current) {
      toggleBtn.addEventListener("click", handleToggleClick);
      document.addEventListener("click", handleDocumentClick);
    }

    return () => {
      if (toggleBtn) {
        toggleBtn.removeEventListener("click", handleToggleClick);
      }
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const togglePlayPause = (index) => {
    const video = videoRefs.current[index];
    const icon = document.querySelectorAll(".play-pause-icon")[index];

    if (!video) return;

    if (video.paused) {
      video.play();
      icon.classList.remove("play");
      icon.classList.add("pause");
    } else {
      video.pause();
      icon.classList.remove("pause");
      icon.classList.add("play");
    }
  };

  // const videoSources = cards.map((post) => post.media).flat();

  // Fetch saved cards
  useEffect(() => {
    if (customerId && token) {
      dispatch(getSavedCardvedio({ customerId, token }));
    } else {
      console.warn("Missing customerId or token");
    }
  }, [dispatch, customerId, token]);

  // Customer payment history component

  const downloadInvoice = (id) => {
    if (id) {
      dispatch(downloadPaymentInvoice({ token, id }));
    }
  };

  const renderCustomerPaymentHistory = () => {
    return (
      <div className="col-md-9">
        <div className="profile-wrapper-right">
          <div className="payment-history-wrap">
            <h3 className="main-heading">Payment History</h3>

            {payments?.payments?.length > 0 ? (
              payments.payments.map((item, i) => {
                if (!item?.id) return null;

                const startDate = item.plan?.startDate;
                const endDate = item.plan?.endDate;
                const planDuration = item.plan?.durationInMonths || 1;
                const invoiceURL = item.invoiceUrl;

                return (
                  <div key={i} className="payment-history-row">
                    {user?.role === "customer" ? (
                      <div className="row">
                        {/* LEFT SIDE */}
                        <div className="col-md-6">
                          <div className="pay-history-left">
                            <div className="purchase-plan-wrap">
                              <span className="label">{item.label}</span>
                              <small className="sm-label">
                                Transaction ID:
                              </small>
                              <big className="purchase-id">
                                {item.transactionId}
                              </big>
                            </div>
                            {invoiceURL && (
                              <a
                                href={invoiceURL}
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                download
                              >
                                Download Invoice
                              </a>
                            )}
                          </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="col-md-6">
                          <div className="pay-history-right">
                            <div className="active-plan-wrap">
                              {item?.type === "subscription" ? (
                                <>
                                  <span className="label">
                                    {planDuration}{" "}
                                    {planDuration > 1 ? "Months" : "Month"}
                                  </span>
                                  <small className="sm-label">
                                    Plan active till
                                  </small>
                                  <big className="purchase-id">
                                    {moment(startDate).format("DD MMM YYYY")} -{" "}
                                    {moment(endDate).format("DD MMM YYYY")}
                                  </big>
                                </>
                              ) : (
                                <>
                                  <span className="label">
                                    {item?.amount
                                      ? Number(item.amount).toFixed(1)
                                      : "0.0"}{" "}
                                    USD
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* DATE */}
                        <div className="col-md-12">
                          <time>
                            {moment(item.createdAt).format("DD MMM YYYY")}
                          </time>
                        </div>
                      </div>
                    ) : user?.role === "business" ? (
                      <div className="row">
                        {/* LEFT SIDE */}
                        <div className="col-md-6">
                          <div className="pay-history-left">
                            <div className="purchase-plan-wrap">
                              <span className="label">
                                Name: <strong>{item.from?.name}</strong>
                              </span>
                              <small className="sm-label">Paid amount:</small>
                              <big className="purchase-id">
                                $
                                {item?.amount
                                  ? Number(item.amount).toFixed(1)
                                  : "0.0"}{" "}
                                USD
                              </big>
                            </div>
                            {invoiceURL && (
                              <a
                                href={invoiceURL}
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                download
                              >
                                Download Invoice
                              </a>
                            )}
                          </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="col-md-6">
                          <div className="pay-history-right">
                            <div className="active-plan-wrap">
                              {item?.type === "subscription" ? (
                                <>
                                  <span className="label">
                                    {planDuration}{" "}
                                    {planDuration > 1 ? "Months" : "Month"}
                                  </span>
                                  <small className="sm-label">
                                    Plan active till
                                  </small>
                                  <big className="purchase-id">
                                    {moment(startDate).format("DD MMM YYYY")} -{" "}
                                    {moment(endDate).format("DD MMM YYYY")}
                                  </big>
                                </>
                              ) : (
                                <>
                                  <small className="sm-label">
                                    Transaction ID:
                                  </small>
                                  <big className="purchase-id">
                                    {item.transactionId}
                                  </big>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* DATE */}
                        <div className="col-md-12">
                          <time>
                            {moment(item.createdAt).format("DD MMM YYYY")}
                          </time>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="text-center">No payment history found.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "language":
        return (
          <div className="language-wrapper">
            <div className="form-group form-group-radio">
              <label htmlFor="gender" className="form-label w-100">
                Select Language
              </label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="radioDefault2"
                  id="radioDefault001"
                  defaultChecked=""
                />
                <label className="form-check-label" htmlFor="radioDefault001">
                  English
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="radioDefault2"
                  id="radioDefault002"
                />
                <label className="form-check-label" htmlFor="radioDefault002">
                  हिन्दी
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="radioDefault2"
                  id="radioDefault003"
                />
                <label className="form-check-label" htmlFor="radioDefault003">
                  中國人
                </label>
              </div>
            </div>
            <div className="btn-block">
              <button
                type="submit"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                Save
              </button>
            </div>
          </div>
        );

      case "helpcenter":
        return (
          <div className="help-center-wrapper">
            <h4 className="help-heading">Contact Us</h4>

            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}
            {errorMessage && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="f-name" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="f-name"
                      {...register("fullName")}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/\d/g, "");
                        trigger("fullName");
                      }}
                    />
                    {errors.fullName && (
                      <div style={{ color: "red" }}>
                        {errors.fullName.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="mob-no" className="form-label">
                      Mobile No.
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="mob-no"
                      {...register("mobile")}
                    />
                    {errors.mobile && (
                      <div style={{ color: "red" }}>
                        {errors.mobile.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="form-group">
                    <label htmlFor="email01" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email01"
                      {...register("email")}
                    />
                    {errors.email && (
                      <div style={{ color: "red" }}>{errors.email.message}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      Message
                    </label>
                    <textarea
                      className="form-control"
                      id="message"
                      rows="4"
                      {...register("message")}
                    />
                    {errors.message && (
                      <div style={{ color: "red" }}>
                        {errors.message.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="btn-block">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        );

      case "paymenthistorycustomer":
        // return userType === "customer" ? (
        //   <div className="col-md-9">
        //     <div className="profile-wrapper-right">
        //       <div className="payment-history-wrap">
        //         <h3 className="main-heading">Payment History</h3>

        //         {[1, 2, 3, 4, 5].map((_, index) => (
        //           <div className="payment-history-row" key={index}>
        //             <div className="row">
        //               <div className="col-md-6">
        //                 <div className="pay-history-left">
        //                   <div className="purchase-plan-wrap">
        //                     <div className="name-wrap">
        //                       <span className="label">Name: </span>
        //                       <span className="name-label">Adam</span>
        //                     </div>
        //                     <small className="sm-label">Paid amount to ED.</small>
        //                     <big className="purchase-id">$200 USD</big>
        //                   </div>
        //                   <a href="#" className="btn btn-primary">
        //                     Download invoice
        //                   </a>
        //                 </div>
        //               </div>
        //               <div className="col-md-6">
        //                 <div className="pay-history-right">
        //                   <div className="active-plan-wrap">
        //                     <small className="sm-label">Transaction ID:</small>
        //                     <big className="purchase-id">GDHHSHH5678</big>
        //                   </div>
        //                 </div>
        //               </div>
        //               <div className="col-md-12">
        //                 <time>30 May 2025</time>
        //               </div>
        //             </div>
        //           </div>
        //         ))}
        //       </div>
        //     </div>
        //   </div>
        // ) : (
        return renderCustomerPaymentHistory();
      // )
      case "paymenthistorybusiness":
        // return userType === "business" ? (
        //   <div className="col-md-9">
        //     <div className="profile-wrapper-right">
        //       <div className="payment-history-wrap">
        //         <h3 className="main-heading">Payment History</h3>

        //         {[1, 2, 3, 4, 5].map((_, index) => (
        //           <div className="payment-history-row" key={index}>
        //             <div className="row">
        //               <div className="col-md-6">
        //                 <div className="pay-history-left">
        //                   <div className="purchase-plan-wrap">
        //                     <div className="name-wrap">
        //                       <span className="label">Name: </span>
        //                       <span className="name-label">Adam</span>
        //                     </div>
        //                     <small className="sm-label">Paid amount to ED.</small>
        //                     <big className="purchase-id">$200 USD</big>
        //                   </div>
        //                   <a href="#" className="btn btn-primary">
        //                     Download invoice
        //                   </a>
        //                 </div>
        //               </div>
        //               <div className="col-md-6">
        //                 <div className="pay-history-right">
        //                   <div className="active-plan-wrap">
        //                     <small className="sm-label">Transaction ID:</small>
        //                     <big className="purchase-id">GDHHSHH5678</big>
        //                   </div>
        //                 </div>
        //               </div>
        //               <div className="col-md-12">
        //                 <time>30 May 2025</time>
        //               </div>
        //             </div>
        //           </div>
        //         ))}
        //       </div>
        //     </div>
        //   </div>
        // ) : (
        //   renderCustomerPaymentHistory()
        // );

        return renderCustomerPaymentHistory();
      case "saved":
        return (
          <div>
            <div className="profile-wrapper-right saved-qlip-videos-wrap">
              <h3 className="main-heading">Saved Qlip Videos/Saved Qasts</h3>
              <div className="saved-qlip-videos">
                {loading && <p>Loading saved items...</p>}
                {!loading && cardvedio.length === 0 && (
                  <p>No saved media found.</p>
                )}

                {cardvedio.map((post, postIndex) => {
                  const mediaArray = Array.isArray(post.media)
                    ? post.media
                    : [];

                  return mediaArray.map((media, mediaIndex) => {
                    const fullUrl = `${media.url}`;

                    // Show video
                    if (media.url?.endsWith(".mp4")) {
                      return (
                        <div
                          className="saved-video"
                          key={`${post._id}-${mediaIndex}`}
                        >
                          <video
                            controls
                            width="100%"
                            poster={media.thumbnail || ""}
                            ref={(el) => {
                              if (el) {
                                videoRefs.current[
                                  `${postIndex}-${mediaIndex}`
                                ] = el;
                              }
                            }}
                          >
                            <source src={fullUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      );
                    }

                    // Show image
                    if (media.url?.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
                      return (
                        <div
                          className="saved-image"
                          key={`${post._id}-${mediaIndex}`}
                        >
                          <img src={fullUrl} alt="Saved media" />
                        </div>
                      );
                    }

                    return null; // If neither image nor video
                  });
                })}
              </div>
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="billing-wrapper">
            <div className="billing-info">
              {loader === true && <Loader />}
              <div className="col-md-9">
                <div className="profile-wrapper-right">
                  <h3 className="main-heading">Billing</h3>
                  <div className="billing-main">
                    {loading && <p>Loading cards...</p>}

                    {!loading && !error && cards.length === 0 && (
                      <p>No cards saved yet.</p>
                    )}
                    {!loading &&
                      cards?.length > 0 &&
                      cards?.map((card, index) => {
                        return userInfo?.role === "customer" ? (
                          <>
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
                                  <a
                                    href="#"
                                    onClick={async (e) => {
                                      e.preventDefault();

                                      const result = await deleteAlert(
                                        "Are you sure?",
                                        "Do you really want to delete this card?"
                                      );

                                      if (result.isConfirmed) {
                                        handleDeleteCard(card.id);
                                      }
                                    }}
                                  >
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
                                {card.card?.exp_month || card.exp_month || "MM"}
                                /{card.card?.exp_year || card.exp_year || "YY"}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="billing-box" key={card?._id}>
                              <div className="billing-head">
                                <h3>{(card?.bank_name).toUpperCase()}</h3>
                                <div className="btn-block card-date">
                                  Status: {card?.status}
                                </div>
                              </div>
                              <div className="card-no">
                                **** **** ****{" "}
                                {card.card?.last4 || card.last4 || "****"}
                              </div>
                              <div className="card-date">
                                Business Type:{" "}
                                {businessType ? businessType : "-"}
                              </div>
                            </div>
                          </>
                        );
                      })}
                    {userInfo?.role === "customer" ? (
                      <Link
                        to="/makepayment?isBilling=true"
                        className="btn btn-primary"
                      >
                        + Add New Card
                      </Link>
                    ) : (
                      <Link
                        onClick={() => {
                          cardPaymentBusiness();
                        }}
                        className="btn btn-primary"
                      >
                        {user?.onboardingStatus === "pending"
                          ? "Add New Card"
                          : "Update Card"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "deactiveteaccount":
        return (
          <div className="billing-wrapper">
            <div className="billing-info">
              <div className="col-md-9">
                <div className="profile-wrapper-right">
                  <div className="deactivate-account-wrap">
                    <h3 className="main-heading">Deactivate Account</h3>
                    <div className="deactivate-account-box">
                      <i>
                        <img src={deactivateiconbig} alt="" />
                      </i>
                      <div className="btn-block">
                        <p>Are you sure want to deactivate your account ?</p>
                        {/* <Link to="/login" className="btn btn-primary">
                          Yes
                        </Link> */}
                        <button
                          onClick={async (e) => {
                            e.preventDefault();

                            const result = await deleteAlert(
                              "Are you sure?",
                              "Do you really want to deactivate this account?"
                            );

                            if (result.isConfirmed) {
                              await handleDeactivate();  // <-- CALL the function here!
                            }
                          }}
                          className="btn btn-primary"
                          disabled={accountLoading}
                        >
                          {accountLoading ? "Processing..." : "Yes"}
                        </button>
                        <Link to="" className="btn btn-outline-secondary">
                          No
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
      // return <div>Content for {activeSection} coming soon...</div>;
    }
  };

  return (
    <div>
      <>
        <ProfileHeader />
        <main className="wrapper">
          <section className="middle-container">
            <div className="container-fluid">
              <div className="profile-wrapper">
                <div className="row">
                  <div className="col-md-3">
                    <div className="profile-left-nav">
                      <ul className="profile-nav-menu d-none d-sm-block">
                        {/* Common item: Language Preference */}
                        <li>
                          <a
                            className={activeSection === "language" ? "" : ""}
                            onClick={() => setActiveSection("language")}
                            style={{ cursor: "pointer" }}
                          >
                            <i>
                              <img src={language} alt="" />
                            </i>
                            <span>Language Preference</span>
                          </a>
                        </li>

                        {/* BUSINESS User Menu */}
                        {userType === "business" ||
                          user?.role === "business" ? (
                          <>
                            <li>
                              <a
                                className={
                                  activeSection === "makepayment"
                                    ? "active"
                                    : ""
                                }
                                onClick={() => setActiveSection("makepayment")}
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={paymentmethod} alt="" />
                                </i>
                                <span>Change Payment Method</span>
                              </a>
                            </li>

                            <li>
                              <a
                                className={
                                  activeSection === "paymenthistorybusiness" ||
                                    "paymenthistorycustomer"
                                    ? ""
                                    : ""
                                }
                                onClick={() =>
                                  setActiveSection("paymenthistorybusiness")
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={frameicon} alt="" />
                                </i>
                                <span>Payment History</span>
                              </a>
                            </li>

                            <li>
                              <a
                                className={
                                  activeSection === "billing" ? "active" : ""
                                }
                                onClick={() => setActiveSection("billing")}
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={billing} alt="" />
                                </i>
                                <span>Billing</span>
                              </a>
                            </li>

                            <li>
                              <a
                                className={
                                  activeSection === "saved" ? "active" : ""
                                }
                                onClick={() => setActiveSection("saved")}
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={saveicon} alt="" />
                                </i>
                                <span>Saved Qlip Videos/Saved Qasts</span>
                              </a>
                            </li>

                            <li>
                              <a

                                className={
                                  activeSection === "helpcenter" ? "active" : ""
                                }
                                onClick={() => setActiveSection("helpcenter")}
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={helpcenter} alt="" />
                                </i>
                                <span>Help Center</span>
                              </a>
                            </li>

                            <li>
                              <a
                                className={
                                  activeSection === "deactiveteaccount"
                                    ? "active"
                                    : ""
                                }
                                onClick={() =>
                                  setActiveSection("deactiveteaccount")
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={deactivateicon} alt="" />
                                </i>
                                <span>Deactivate Account</span>
                              </a>
                            </li>
                          </>
                        ) : (
                          /* CUSTOMER userType menu */
                          <>
                            <li>
                              <a
                                className={
                                  activeSection === "helpcenter" ? "active" : ""
                                }
                                onClick={() => setActiveSection("helpcenter")}
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={helpcenter} alt="" />
                                </i>
                                <span>Help Center</span>
                              </a>
                            </li>

                            <li>
                              <a
                                className=""
                                onClick={(e) => e.preventDefault()}
                                style={{
                                  cursor: "not-allowed",
                                  opacity: 0.6,
                                  pointerEvents: "none", // full disable interaction
                                }}
                              >
                                <i>
                                  <img src={paymentmethod} alt="" />
                                </i>
                                <span>Change Payment Method</span>
                              </a>
                            </li>

                            <li>
                              <a
                                className={
                                  activeSection === "paymenthistorybusiness" ||
                                    "paymenthistorycustomer"
                                    ? ""
                                    : ""
                                }
                                onClick={() =>
                                  setActiveSection("paymenthistorybusiness")
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={frameicon} alt="" />
                                </i>
                                <span>Payment History</span>
                              </a>
                            </li>

                            <li>
                              <a
                                className={
                                  activeSection === "saved" ? "active" : ""
                                }
                                onClick={() => setActiveSection("saved")}
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={saveicon} alt="" />
                                </i>
                                <span>Saved Qlip Videos/Saved Qasts</span>
                              </a>
                            </li>

                            <li>
                              <a
                                className={
                                  activeSection === "billing" ? "active" : ""
                                }
                                onClick={() => setActiveSection("billing")}
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={billing} alt="" />
                                </i>
                                <span>Billing</span>
                              </a>
                            </li>
                          </>
                        )}
                      </ul>
                      <div className="tab-profile justify-content-end">
                        <div className="more-dropdown custom-dropdown d-lg-none">
                          <a
                            href="#"
                            className="custom-dropdown-toggle"
                            ref={dropdownToggleRef}
                            onClick={(e) => e.preventDefault()}
                          >
                            <label>Settings</label>
                            <img src={moreicon} alt="" />
                          </a>
                          <ul
                            className="custom-dropdown-menu"
                            ref={dropdownMenuRef}
                          >
                            {/* Common item: Language Preference */}
                            <li>
                              <a
                                className={
                                  activeSection === "language" ? "active" : ""
                                }
                                onClick={() => { setActiveSection("language"), dropdownMenuRef.current.classList.remove("show") }}
                                style={{ cursor: "pointer" }}
                              >
                                <i>
                                  <img src={language} alt="" />
                                </i>
                                <span>Language Preference</span>
                              </a>
                            </li>

                            {/* BUSINESS User Menu */}
                            {userType === "business" ||
                              user?.role === "business" ? (
                              <>
                                <li>
                                  <a
                                    className={
                                      activeSection === "makepayment"
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() => { setActiveSection("makepayment"), dropdownMenuRef.current.classList.remove("show") }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i>
                                      <img src={paymentmethod} alt="" />
                                    </i>
                                    <span>Change Payment Method</span>
                                  </a>
                                </li>

                                <li>
                                  <a
                                    className={
                                      activeSection ===
                                        "paymenthistorybusiness" ||
                                        "paymenthistorycustomer"
                                        ? ""
                                        : ""
                                    }
                                    onClick={() => {
                                      setActiveSection("paymenthistorybusiness"), dropdownMenuRef.current.classList.remove("show")
                                    }
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i>
                                      <img src={frameicon} alt="" />
                                    </i>
                                    <span>Payment History</span>
                                  </a>
                                </li>

                                <li>
                                  <a
                                    className={
                                      activeSection === "billing"
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() => { setActiveSection("billing"), dropdownMenuRef.current.classList.remove("show") }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i>
                                      <img src={billing} alt="" />
                                    </i>
                                    <span>Billing</span>
                                  </a>
                                </li>

                                <li>
                                  <a
                                    className={
                                      activeSection === "saved" ? "active" : ""
                                    }
                                    onClick={() => { setActiveSection("saved"), dropdownMenuRef.current.classList.remove("show") }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i>
                                      <img src={saveicon} alt="" />
                                    </i>
                                    <span>Saved Qlip Videos/Saved Qasts</span>
                                  </a>
                                </li>

                                <li>
                                  <a
                                    className={
                                      activeSection === "helpcenter"
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() => {
                                      setActiveSection("helpcenter"), dropdownMenuRef.current.classList.remove("show")
                                    }
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i>
                                      <img src={helpcenter} alt="" />
                                    </i>
                                    <span>Help Center</span>
                                  </a>
                                </li>

                                <li>
                                  <a
                                    className={
                                      activeSection === "deactiveteaccount"
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() => {
                                      setActiveSection("deactiveteaccount"), dropdownMenuRef.current.classList.remove("show")
                                    }
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i>
                                      <img src={deactivateicon} alt="" />
                                    </i>
                                    <span>Deactivate Account</span>
                                  </a>
                                </li>
                              </>
                            ) : (
                              /* CUSTOMER userType menu */
                              <>
                                <li>
                                  <a
                                    className={
                                      activeSection === "helpcenter"
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() => {
                                      setActiveSection("helpcenter"), dropdownMenuRef.current.classList.remove("show")
                                    }
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i>
                                      <img src={helpcenter} alt="" />
                                    </i>
                                    <span>Help Center</span>
                                  </a>
                                </li>

                                <li>
                                  <a
                                    className=""
                                    onClick={(e) => e.preventDefault()}
                                    style={{
                                      cursor: "not-allowed",
                                      opacity: 0.6,
                                      pointerEvents: "none", // full disable interaction
                                    }}
                                  >
                                    <i>
                                      <img src={paymentmethod} alt="" />
                                    </i>
                                    <span>Change Payment Method</span>
                                  </a>
                                </li>

                                <li>
                                  <a
                                    className={
                                      activeSection ===
                                        "paymenthistorybusiness" ||
                                        "paymenthistorycustomer"
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() => {
                                      setActiveSection("paymenthistorybusiness"), dropdownMenuRef.current.classList.remove("show")
                                    }
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i>
                                      <img src={frameicon} alt="" />
                                    </i>
                                    <span>Payment History</span>
                                  </a>
                                </li>

                                <li>
                                  <a
                                    className={
                                      activeSection === "saved" ? "active" : ""
                                    }
                                    onClick={() => { setActiveSection("saved"), dropdownMenuRef.current.classList.remove("show") }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i>
                                      <img src={saveicon} alt="" />
                                    </i>
                                    <span>Saved Qlip Videos/Saved Qasts</span>
                                  </a>
                                </li>

                                <li>
                                  <a
                                    className={
                                      activeSection === "billing"
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() => { setActiveSection("billing"), dropdownMenuRef.current.classList.remove("show") }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i>
                                      <img src={billing} alt="" />
                                    </i>
                                    <span>Billing</span>
                                  </a>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-9">{renderMainContent()}</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    </div>
  );
};

export default Languagesetting;
