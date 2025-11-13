import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import Thankyou from "../model/Thankyou";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchUsers } from "../feature/usersSlice";
import Loader from "../components/Loader";
import { payCharge } from "../feature/paymentSlice";
import { showAlert } from "../utils/swalHelper";

const schema = yup.object().shape({
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be a positive value")
    .min(1, "Minimum amount should be 1"),
});

const SendQRrequest = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const token = useSelector((state) => state.auth?.token);
  const [showModal, setShowModal] = useState(false);
  const { businessId, amount: initialAmount, paymentId } = location.state || {};
  const targetId = businessId;

  const selectedUser = users?.find(
    (user) => user.id === targetId || user._id === targetId
  );
  const discountPercentage = selectedUser?.discountPercentage;

  const amount = watch("amount");

  const localDiscountedPrice = amount
    ? (amount - (amount * discountPercentage) / 100)?.toFixed(2)
    : null;

  useEffect(() => {
    if (initialAmount) {
      setValue("amount", initialAmount);
    }
  }, [initialAmount, setValue]);

  const onSubmit = async (data) => {
    if (!token) {
      showAlert("error", "Login first");
      return;
    }

    try {
      setLoading(true);
      const { payload } = await dispatch(
        payCharge({
          token,
          planId: null,
          amount: localDiscountedPrice,
          paymentMethodId: paymentId,
          businessId: businessId,
          requestId: null,
        })
      );
      setLoading(false);
      if (payload?.error === false) {
        const modalEl = document.getElementById("thankyoupopup");
        if (modalEl && window.bootstrap && window.bootstrap.Modal) {
          const modalInstance = new window.bootstrap.Modal(modalEl);
          modalInstance.show();
        }

        // navigate("/home");
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const getUserDetails = async () => {
    try {
      setLoading(true);
      const { payload } = await dispatch(fetchUsers({ token, userProfile: "customer" }));
      if (payload?.length > 0) {
        setUsers(payload);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getUserDetails();
    }
  }, []);

  return (
    <div>
      <ProfileHeader />
      <main className="wrapper">
        <section className="middle-container">
          <div className="container-fluid">
            {loading === true && <Loader />}
            <div className="profile-wrapper">
              <div className="row">
                <div className="col-md-3">
                  <Sidebar />
                </div>
                <div className="col-md-9">
                  <div className="profile-wrapper-right">
                    <h3 className="main-heading">Enter Amount</h3>
                    <div className="billing-main">
                      <form onSubmit={handleSubmit(onSubmit)}>
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
                              id="enter-amount"
                              {...register("amount")}
                              disabled
                            />
                            <p className="text-danger">
                              {errors.amount?.message}
                            </p>
                          </div>
                          <div className="discount-box">
                            <p className="big-text">
                              {discountPercentage}% Off
                            </p>
                            <div className="payable-amount-after">
                              <span className="label">
                                Payable Amount After Discount:
                              </span>
                              <span className="total-amount">
                                {localDiscountedPrice
                                  ? `$${localDiscountedPrice} USD`
                                  : "Enter an amount to calculate"}
                              </span>
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !token || !targetId}
                          >
                            Pay Now
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
      <Thankyou />
    </div>
  );
};

export default SendQRrequest;
