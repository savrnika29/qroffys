import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import Thankyou from "../model/Thankyou";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  sendBusinessRequest,
  clearBusinessData,
} from "../feature/sendbusinessSlice";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const schema = yup.object().shape({
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be a positive value")
    .min(1, "Minimum amount should be 1"),
});

const Sendrequest = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.auth?.token);
  const {
    businessId: reduxBusinessId,
    discountedPrice: apiDiscountedPrice,
    loading,
    error,
  } = useSelector((state) => state.sendbusiness);
  const usersList = useSelector((state) => state.users.usersList);
  const [showModal, setShowModal] = useState(false);

  // Get businessId, customerID, amount, and paymentMethod from location.state
  const {
    businessId = reduxBusinessId,
    customerID,
    amount: initialAmount,
    paymentMethod,
  } = location.state || {};

  // Use the correct ID based on the flow
  const targetId = businessId || customerID;

  // Get discountPercentage for the selected business/customer
  const selectedUser = usersList.find(
    (user) => user.id === targetId || user._id === targetId
  );
  const discountPercentage = selectedUser?.discountPercentage || 15;

  // Watch the amount input for real-time changes
  const amount = watch("amount");

  // Calculate discounted price locally
  const localDiscountedPrice = amount
    ? (amount - (amount * discountPercentage) / 100).toFixed(2)
    : null;

  // Prefill the amount input
  useEffect(() => {
    if (initialAmount) {
      setValue("amount", initialAmount);
    }
  }, [initialAmount, setValue]);

  // Handle form submission
  const onSubmit = async (data) => {
    if (!token) {
      console.error("Token is undefined. Please log in.");
      alert("Please log in first");
      return;
    }
    if (!targetId) {
      console.error("Business/Customer ID is undefined.");
      alert("Business or Customer ID is missing");
      return;
    }
    if (!paymentMethod) {
      console.error("Payment method is not specified.");
      alert("Payment method is missing");
      return;
    }
    try {
      const result = await dispatch(
        sendBusinessRequest({
          businessId: targetId,
          amount: data.amount,
          token,
          discountPercentage,
        })
      ).unwrap();

      setShowModal(true);

      // Navigate based on paymentMethod
      if (paymentMethod === "face") {
        navigate(
          `/scanface?businessId=${targetId}&amount=${localDiscountedPrice}&pay=true`
        );
      } else {
        navigate("/sccaner", {
          state: {
            businessId: targetId,
            amount: data.amount,
            discountedPrice: localDiscountedPrice || apiDiscountedPrice,
          },
        });
      }
    } catch (err) {
      console.error("API call failed:", err);
      alert("Failed to process request. Please try again.");
    }
  };

  // Clean up Redux state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearBusinessData());
    };
  }, [dispatch]);

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
                                  : apiDiscountedPrice
                                  ? `$${apiDiscountedPrice} USD`
                                  : "Enter an amount to calculate"}
                              </span>
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                              loading || !token || !targetId || !paymentMethod
                            }
                          >
                            {loading
                              ? "Processing..."
                              : !token
                              ? "Please Login"
                              : !targetId
                              ? "Missing Business/Customer ID"
                              : !paymentMethod
                              ? "Missing Payment Method"
                              : "Pay Now"}
                          </button>
                        </div>
                      </form>
                      {error && <p className="text-danger mt-3">{error}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {showModal && <Thankyou onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Sendrequest;

// import Sidebar from "../components/Sidebar";
// import ProfileHeader from "../components/ProfileHeader";
// import Thankyou from "../model/Thankyou";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { useDispatch, useSelector } from "react-redux";
// import { sendBusinessRequest, clearBusinessData } from "../feature/sendbusinessSlice";
// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// const schema = yup.object().shape({
//   amount: yup
//     .number()
//     .typeError("Amount must be a number")
//     .required("Amount is required")
//     .positive("Amount must be a positive value")
//     .min(1, "Minimum amount should be 1"),
// });

// const Sendrequest = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch,
//   } = useForm({
//     resolver: yupResolver(schema),
//   });

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const token = useSelector((state) => state.auth?.token);
//   const { businessId: reduxBusinessId, discountedPrice: apiDiscountedPrice, loading, error } = useSelector(
//     (state) => state.sendbusiness
//   );
//   const usersList = useSelector((state) => state.users.usersList);
//   const [showModal, setShowModal] = useState(false);

//   // Get businessId, customerID, amount, and paymentMethod from location.state
//   const {
//     businessId = reduxBusinessId,
//     customerID,
//     amount: initialAmount,
//     paymentMethod,
//   } = location.state || {};

//   // Use the correct ID based on the flow
//   const targetId = businessId || customerID;

//   // Get discountPercentage for the selected business/customer
//   const selectedUser = usersList.find((user) => user.id === targetId || user._id === targetId);
//   const discountPercentage = selectedUser?.discountPercentage || 15;

//   // Watch the amount input for real-time changes
//   const amount = watch("amount");

//   // Calculate discounted price locally
//   const localDiscountedPrice = amount
//     ? (amount - (amount * discountPercentage) / 100).toFixed(2)
//     : null;

//   // Prefill the amount input
//   useEffect(() => {
//     if (initialAmount) {
//       setValue("amount", initialAmount);
//     }
//   }, [initialAmount, setValue]);

//   // Handle form submission
//   const onSubmit = async (data) => {
//     if (!token) {
//       console.error("Token is undefined. Please log in.");
//       alert("Please log in first");
//       return;
//     }
//     if (!targetId) {
//       console.error("Business/Customer ID is undefined.");
//       alert("Business or Customer ID is missing");
//       return;
//     }
//     if (!paymentMethod) {
//       console.error("Payment method is not specified.");
//       alert("Payment method is missing");
//       return;
//     }
//     try {
//       const result = await dispatch(
//         sendBusinessRequest({
//           businessId: targetId,
//           amount: data.amount,
//           token,
//           discountPercentage,
//         })
//       ).unwrap();

//       console.log("API response:", result);
//       setShowModal(true);

//       // Navigate based on paymentMethod
//       if (paymentMethod === 'face') {
//         console.log("Navigating to /scanface");
//         navigate('/scanface', {
//           state: {
//             businessId: targetId,
//             amount: data.amount,
//             discountedPrice: localDiscountedPrice || apiDiscountedPrice,
//           },
//         });
//       } else if (paymentMethod === 'qr') {
//         console.log("Navigating to /myqrcode");
//         navigate('/myqrcode', {
//           state: {
//             businessId: targetId,
//             amount: data.amount,
//             discountedPrice: localDiscountedPrice || apiDiscountedPrice,
//           },
//         });
//       } else {
//         console.error("Invalid payment method:", paymentMethod);
//         alert("Invalid payment method");
//       }
//     } catch (err) {
//       console.error("API call failed:", err);
//       alert("Failed to process request. Please try again.");
//     }
//   };

//   // Clean up Redux state when component unmounts
//   useEffect(() => {
//     return () => {
//       dispatch(clearBusinessData());
//     };
//   }, [dispatch]);

//   return (
//     <div>
//       <ProfileHeader />
//       <main className="wrapper">
//         <section className="middle-container">
//           <div className="container-fluid">
//             <div className="profile-wrapper">
//               <div className="row">
//                 <div className="col-md-3">
//                   <Sidebar />
//                 </div>
//                 <div className="col-md-9">
//                   <div className="profile-wrapper-right">
//                     <h3 className="main-heading">Enter Amount</h3>
//                     <div className="billing-main">
//                       <form onSubmit={handleSubmit(onSubmit)}>
//                         <div className="amount-wrap">
//                           <div className="form-group">
//                             <label htmlFor="enter-amount" className="form-label">
//                               Enter Amount
//                             </label>
//                             <input
//                               type="number"
//                               className="form-control"
//                               id="enter-amount"
//                               {...register("amount")}
//                             />
//                             <p className="text-danger">{errors.amount?.message}</p>
//                           </div>
//                           <div className="discount-box">
//                             <p className="big-text">{discountPercentage}% Off</p>
//                             <div className="payable-amount-after">
//                               <span className="label">Payable Amount After Discount:</span>
//                               <span className="total-amount">
//                                 {localDiscountedPrice
//                                   ? `$${localDiscountedPrice} USD`
//                                   : apiDiscountedPrice
//                                     ? `$${apiDiscountedPrice} USD`
//                                     : "Enter an amount to calculate"}
//                               </span>
//                             </div>
//                           </div>
//                           <button
//                             type="submit"
//                             className="btn btn-primary"
//                             disabled={loading || !token || !targetId || !paymentMethod}
//                           >
//                             {loading
//                               ? "Processing..."
//                               : !token
//                                 ? "Please Login"
//                                 : !targetId
//                                   ? "Missing Business/Customer ID"
//                                   : !paymentMethod
//                                     ? "Missing Payment Method"
//                                     : "Pay Now"}
//                           </button>
//                         </div>
//                       </form>
//                       {error && <p className="text-danger mt-3">{error}</p>}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//       {showModal && <Thankyou onClose={() => setShowModal(false)} />}
//     </div>
//   );
// };

// export default Sendrequest;
