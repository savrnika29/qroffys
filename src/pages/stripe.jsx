import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

// Stripe input styling
const stripeElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      "::placeholder": { color: "#aab7c4" },
    },
    invalid: {
      color: "#fa755a",
    },
  },
};

// Validation Schema
const schema = yup.object().shape({
  cardHolder: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Only letters allowed")
    .required("Card holder name is required")
    .min(2, "Name must be at least 2 characters"),
  terms: yup.bool().oneOf([true], "You must accept the terms"),
});

export default function StripePayment({
  customerId,
  amount = "10",
  currency = "USD",
}) {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODk1OTRiMmM1YmY0Mjc1YjEzNTZkMDUiLCJlbWFpbCI6Imt1bGRlZXBAZ21haWwuY29tIiwibmFtZSI6Ikt1bGRlZXAiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NTQ2MzM0NzAsImV4cCI6MTc4NjE2OTQ3MH0.6s_9YY0QGsrp3Z6byVhsXMeiVnA_-aWGVFVXuOR0PxE";

  const handleSubmit = async (values) => {
    if (!stripe || !elements) return;

    try {
      setLoading(true);

      // 1️⃣ Create SetupIntent
      const { data } = await axios.post(
        "http://localhost:5500/api/v1/stripe/save-card",
        { customerId: "cus_SpOHit17XQmusi" },
        {
          headers: {
            Authorization: `${token}`, // add Bearer token
            "Content-Type": "application/json",
          },
        }
      );

      const clientSecret = data.clientSecret;

      // 2️⃣ Confirm Card Setup
      const cardElement = elements.getElement(CardNumberElement);

      const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: { name: values.cardHolder },
          },
        }
      );

      if (error) {
        // alert(error.message);
        console.error("error>>>>>>>>..", error);

        setLoading(false);
        return;
      }

      // Step 3: Save card in DB
      await axios.post(
        "http://localhost:5500/api/v1/stripe/saveCardDetails",
        {
          userId: "689594b2c5bf4275b1356d05",
          paymentMethodId: setupIntent.payment_method,
        },
        { headers: { Authorization: `${token}` } }
      );

      alert("Card saved successfully!");
      navigate("/success"); // Redirect after saving card
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProfileHeader />
      <main className="wrapper">
        <section className="middle-container">
          <section className="login-wrapper">
            <div className="container">
              <h3 className="main-heading">Make Payment</h3>
              <div className="make-payment-wrap">
                <h3 className="payment-heading">Enter Card Detail</h3>
                <div className="payable-amount">
                  <span className="label">Payable Amount:</span>
                  <span className="amount">
                    {amount} {currency}
                  </span>
                </div>

                <Formik
                  initialValues={{ cardHolder: "", terms: false }}
                  validationSchema={schema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      {/* Card Holder */}
                      <div className="form-group">
                        <label>Card Holder Name</label>
                        <Field
                          name="cardHolder"
                          className="form-control"
                          placeholder="Name"
                        />
                        <ErrorMessage
                          name="cardHolder"
                          component="div"
                          className="invalid-feedback d-block"
                        />
                      </div>

                      {/* Card Number */}
                      <div className="form-group">
                        <label>Card Number</label>
                        <div className="form-control" style={{ padding: 15 }}>
                          <CardNumberElement options={stripeElementOptions} />
                        </div>
                      </div>

                      {/* Expiry Date */}
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <div className="form-control" style={{ padding: 15 }}>
                          <CardExpiryElement options={stripeElementOptions} />
                        </div>
                      </div>

                      {/* CVV */}
                      <div className="form-group">
                        <label>CVV</label>
                        <div className="form-control" style={{ padding: 15 }}>
                          <CardCvcElement options={stripeElementOptions} />
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="form-check">
                        <Field
                          type="checkbox"
                          name="terms"
                          className="form-check-input"
                        />
                        <label className="form-check-label">
                          I agree to terms & conditions
                        </label>
                        <ErrorMessage
                          name="terms"
                          component="div"
                          className="invalid-feedback d-block"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary mt-3"
                        disabled={loading || isSubmitting}
                      >
                        {loading ? "Saving..." : "Pay Now"}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
