import React from "react";
import ProfileHeader from "../components/ProfileHeader";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Validation Schema
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
  cardNumber: yup
    .string()
    .required("Card number is required")
    .matches(/^[0-9]{16}$/, "Card number must be 16 digits"),
  expiryDate: yup
    .string()
    .required("Expiry date is required")
    .test("valid-date", "Expiry date must be in the future", function (value) {
      if (!value) return false;
      const today = new Date();
      const inputDate = new Date(value);
      return inputDate > today;
    }),
  cvv: yup
    .string()
    .required("CVV is required")
    .matches(/^[0-9]{3}$/, "CVV must be 3 digits"),
  terms: yup.bool().oneOf([true], "You must accept the terms and conditions"),
});

const Carddetail = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Submit Handler
  const onSubmit = (data) => {
    navigate("/billingverificationotp");
  };

  return (
    <>
      <ProfileHeader />
      <main className="wrapper">
        <section className="middle-container">
          <section className="login-wrapper">
            <div className="container">
              <div className="row text-center">
                <div className="col-md-12">
                  <h3 className="main-heading">Card Detail</h3>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="make-payment-wrap">
                    <h3 className="payment-heading">Enter Card Detail</h3>

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="row">
                        {/* Card Holder Name */}
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

                        {/* Card Number */}
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
                              {...register("cardNumber")}
                            />
                            {errors.cardNumber && (
                              <div className="invalid-feedback d-block">
                                {errors.cardNumber.message}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expiry Date */}
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="expiry-date" className="form-label">
                              Expiry date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="expiry-date"
                              {...register("expiryDate")}
                            />
                            {errors.expiryDate && (
                              <div className="invalid-feedback d-block">
                                {errors.expiryDate.message}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CVV */}
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="cvv" className="form-label">
                              CVV
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              id="cvv"
                              {...register("cvv")}
                            />
                            {errors.cvv && (
                              <div className="invalid-feedback d-block">
                                {errors.cvv.message}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="col-md-6">
                          <div className="form-group-checkbox">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="checkChecked"
                                {...register("terms")}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="checkChecked"
                              >
                                I agree to term &amp; conditions
                              </label>
                            </div>
                            {errors.terms && (
                              <div className="invalid-feedback d-block">
                                {errors.terms.message}
                              </div>
                            )}
                            <div className="form-text">
                              Your information will be saved for future payment.
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="col-md-12">
                          <div className="btn-block">
                            <button type="submit" className="btn btn-primary">
                              Save
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
    </>
  );
};

export default Carddetail;
