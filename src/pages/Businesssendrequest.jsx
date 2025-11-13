import React, { useRef, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import Makepaymentsentsucessful from "../model/Makepaymentsentsuccessful";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  sendBusinessRequest,
  clearBusinessData,
  sendPaymentRequest,
} from "../feature/sendbusinessSlice";
import { getProfile } from "../feature/profileSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { showAlert } from "../utils/swalHelper";
import Loader from "../components/Loader";

const schema = yup.object().shape({
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be a positive value")
    .min(1, "Minimum amount should be 1"),
});

const Businesssendrequest = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);
  const { loading, error } = useSelector((state) => state.sendbusiness);
  const { user, loading: profileLoading } = useSelector(
    (state) => state.profile
  );
  const location = useLocation();
  const [loader, setLoader] = useState(false);
  // 👇 yahan se ID aur amount aa rahi hai Scanface se
  const { businessID, amount, customerID } = location.state || {};

  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Debug logs

  // Set form default amount
  useEffect(() => {
    if (amount) {
      setValue("amount", parseFloat(amount));
    }
  }, [amount, setValue]);

  // Fetch profile and calculate discount
  useEffect(() => {
    if (token) {
      dispatch(getProfile(token));
    }
    return () => {
      dispatch(clearBusinessData());
    };
  }, [dispatch, token]);

  useEffect(() => {
    if (amount && user?.discountPercentage) {
      const discount = user.discountPercentage / 100;
      const calculated = amount - amount * discount;
      setDiscountedPrice(calculated.toFixed(2));
    }
  }, [amount, user?.discountPercentage]);

  const handleSubmitData = async (data) => {
    try {
      setLoader(true);
      const { payload } = await dispatch(sendPaymentRequest({ customerId: businessID, amount: discountedPrice, token, }));

      if (payload?._id) {
        setShowModal(true);
        // showAlert("success", "Request sended successfully");
        // navigate("/home");
        setShowModal(true);
        const modalEl = document.getElementById("makepaymentsentsucessful");
        if (modalEl && window.bootstrap && window.bootstrap.Modal) {
          const modalInstance = new window.bootstrap.Modal(modalEl);
          modalInstance.show();
        }
      }
      setLoader(false);
    } catch (err) {
      setLoader(false);
    }
  };

  return (
    <>
      <ProfileHeader />
      <main className="wrapper">
        {loader && <Loader />}
        <section className="middle-container">
          <div className="container-fluid">
            <div className="profile-wrapper">
              <div className="row">
                <div className="col-md-3">
                  <Sidebar />
                </div>
                <div className="col-md-9">
                  <div className="profile-wrapper-right">
                    <h3 className="main-heading">Enter Amount</h3>
                    <div className="billing-main">
                      <form onSubmit={handleSubmit(handleSubmitData)}>
                        <div className="amount-wrap">
                          <div className="form-group">
                            <label
                              htmlFor="enter-amount"
                              className="form-label"
                            >
                              Enter Amount
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              disabled
                              id="enter-amount"
                              {...register("amount")}


                            />

                            {errors.amount && (
                              <p className="text-danger">
                                {errors.amount.message}
                              </p>
                            )}
                            {error && (
                              <p className="text-danger">
                                {error.message || "An error occurred"}
                              </p>
                            )}
                          </div>

                          <div className="discount-box">
                            <p className="big-text">
                              {user?.discountPercentage
                                ? `${user.discountPercentage}% Off`
                                : "Loading discount..."}
                            </p>
                            <div className="payable-amount-after">
                              <span className="label">
                                Payable Amount After Discount:
                              </span>
                              <span className="total-amount">
                                {discountedPrice !== null
                                  ? `$${discountedPrice} USD`
                                  : "Calculating..."}
                              </span>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !token || profileLoading}
                          >
                            {loading ? "Processing..." : "Send Request"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Makepaymentsentsucessful
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
    </>
  );
};

export default Businesssendrequest;
