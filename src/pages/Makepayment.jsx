import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  createPaymentIntent,
  payCharge,
  getSavedCards,
  saveCardDetail,
} from "../feature/paymentSlice";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { getSavedCardvedio } from "../feature/savedCardSlice";
import ProfileHeader from "../components/ProfileHeader";
import Thankyou from "../model/Thankyou";

const schema = yup.object().shape({
  cardHolder: yup
    .string()
    .test(
      "no-digits",
      "First name must contain only characters (no numbers)",
      (value) => !/\d/.test(value)
    )
    .required("Card holder name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "First name too long"),
  terms: yup.bool().oneOf([true], "You must accept the terms and conditions"),
});

const Makepayment = () => {
  const navigate = useNavigate();
  const { amount, currency, planId } = useSelector(
    (store) => store?.subscription
  );
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stripe = useStripe();
  const { token, user } = useSelector((store) => store?.auth);
  const [loading, setLoading] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const dispatch = useDispatch();
  const elements = useElements();
  const queryParams = new URLSearchParams(location.search);
  const isBilling = queryParams.get("isBilling") === "true";
  const getAmount = searchParams.get("amount");
  const requestId = searchParams.get("requestId");
  const planIdFromQuery = searchParams.get("planId");
  const businessId = searchParams.get("businessId");
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const getSavedCardsData = () => {
    try {
      if (token) {
        setLoading(true);
        const { payload } = dispatch(
          getSavedCardvedio({ token, customerId: user?.customerId })
        );
        if (payload.error === false) {
          setSavedCards(payload.data.data || []);
        }
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

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
      return "";
    }
  }

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Please login first");
      return;
    }
    if (user?.customerId) {
      setLoading(true);
      try {
        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement || !stripe) {
          setLoading(false);
          toast.error("Stripe is not loaded properly");
          return;
        }
        const { error: cardError, paymentMethod } =
          await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
            billing_details: { name: data.cardHolder, email: user?.email },
          });

        if (cardError) {
          setLoading(false);
          toast.error(cardError.message || "Please check card details");
          return;
        }

        const saveCard = await dispatch(
          saveCardDetail({
            token,
            userId: user._id,
            paymentMethodId: paymentMethod.id,
          })
        );

        if (saveCard.payload.status === 400) {
          toast.error(saveCard.payload.message);
          return;
        }
        const { payload } = await dispatch(
          createPaymentIntent({
            setLoading,
            token,
            customerId: user?.customerId,
          })
        );

        if (!payload?.data?.clientSecret) {
          setLoading(false);
          toast.error("Failed to create client secret");
          return;
        }
        const { error: setupError, setupIntent } =
          await stripe.confirmCardSetup(payload.data.clientSecret, {
            payment_method: paymentMethod.id,
          });

        if (setupError) {
          setLoading(false);
          toast.error(setupError.message || "Setup failed");
          return;
        }

        if (setupIntent?.status === "succeeded") {
          if (isBilling) {
            setLoading(false);
            const modalEl = document.getElementById("thankyoupopup");
            if (modalEl && window.bootstrap && window.bootstrap.Modal) {
              const modalInstance = new window.bootstrap.Modal(modalEl);
              modalInstance.show();
            }
          } else {
            const { payload } = await dispatch(
              getSavedCardvedio({ token, customerId: user?.customerId })
            );

            if (payload?.length === 0) {
              return;
            }

            const chargeResponse = await dispatch(
              payCharge({
                token,
                planId: planIdFromQuery ? planIdFromQuery : "",
                amount: getAmount,
                paymentMethodId: payload[payload?.length - 1]?.id,
                businessId: businessId || "",
                requestId: requestId ? requestId : "",
              })
            );
            setLoading(false);
            if (chargeResponse.payload?.error === false) {
              const modalEl = document.getElementById("thankyoupopup");
              if (modalEl && window.bootstrap && window.bootstrap.Modal) {
                const modalInstance = new window.bootstrap.Modal(modalEl);
                modalInstance.show();
              }
            } else {
              toast.error(chargeResponse.payload?.message || "Payment failed");
            }
          }
        }
      } catch (err) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Missing customer id");
    }
  };

  const stripeElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#000",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontWeight: "400",
        lineHeight: "1.5",
        padding: "0.75rem",
        "::placeholder": {
          color: "#999",
          fontWeight: "400",
          fontSize: "16px",
        },
      },
      invalid: {
        color: "#dc3545",
      },
    },
  };

  useEffect(() => {
    getSavedCardsData();
  }, [token]);
  return (
    <div>
      {location.pathname?.includes("makepayment") && <ProfileHeader />}
      {loading && <Loader />}
      <main className="wrapper">
        <section className="middle-container">
          <section
            className={
              isBilling === true
                ? "login-wrapper"
                : "login-wrapper make-payment-wrap"
            }
          >
            <div className="container">
              <div className="row text-center">
                <div className="col-md-12">
                  <h3 className="main-heading">
                    {isBilling === true ? "Card Detail" : "Make Payment"}
                  </h3>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="make-payment-wrap">
                    <h3 className="payment-heading">Enter Card Detail</h3>

                    {planIdFromQuery && (
                      <div className="payable-amount">
                        <span className="label">Payable Amount:</span>
                        <span className="amount">
                          {getCurrencySymbol(currency)}
                          {amount} {currency}
                        </span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="row">
                        <>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label
                                htmlFor="card-holder-name"
                                className="form-label"
                              >
                                Card Holder Name
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="card-holder-name"
                                placeholder="Name"
                                {...register("cardHolder")}
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(
                                    /\d/g,
                                    ""
                                  );
                                  trigger("cardHolder");
                                }}
                              />
                              {errors.cardHolder && (
                                <div className="invalid-feedback d-block">
                                  {errors.cardHolder.message}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label
                                htmlFor="card-number"
                                className="form-label"
                              >
                                Enter Card Number
                              </label>
                              <div
                                className="form-control"
                                style={{ padding: 15 }}
                              >
                                <CardNumberElement
                                  options={{
                                    ...stripeElementOptions,
                                    placeholder: "Card Number",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label
                                htmlFor="expiry-date"
                                className="form-label"
                              >
                                Expiry Date
                              </label>
                              <div
                                className="form-control"
                                style={{ padding: 15 }}
                              >
                                <CardExpiryElement
                                  options={{
                                    ...stripeElementOptions,
                                    placeholder: "MM/YY",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="cvv" className="form-label">
                                CVV
                              </label>
                              <div
                                className="form-control"
                                style={{ padding: 15 }}
                              >
                                <CardCvcElement
                                  options={{
                                    ...stripeElementOptions,
                                    placeholder: "CVV",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </>

                        <div className="col-md-6">
                          <div className="form-group-checkbox">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                {...register("terms")}
                                style={{ cursor: "pointer" }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="checkChecked"
                              >
                                <a
                                  className="form-check-label"
                                  href="/terms"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                  }}
                                >
                                  I agree to term & conditions{" "}
                                </a>
                              </label>
                              {errors.terms && (
                                <div className="invalid-feedback d-block">
                                  {errors.terms.message}
                                </div>
                              )}
                            </div>
                            <div className="form-text">
                              Your information will be saved for future payment.
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="btn-block">
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={loading}
                            >
                              {loading
                                ? "Processing..."
                                : isBilling === true
                                ? "Add Card"
                                : "Pay Now"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
      <Thankyou />
    </div>
  );
};

export default Makepayment;
