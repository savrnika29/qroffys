import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ProfileHeader from "../components/ProfileHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchUsers, clearError } from "../feature/usersSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { getSavedCardvedio } from "../feature/savedCardSlice";
import Loader from "../components/Loader";

const MakeYourPayment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [allCards, setCards] = useState();
  const { businessName, _id } = location.state || {};
  const { usersList, error } = useSelector((state) => state.users);
  const { customerId } = useSelector((state) => state?.auth?.user);
  const { token } = useSelector((state) => state?.auth);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const validationSchema = Yup.object().shape({
    business: Yup.string().required("Business is required"),
    amount: Yup.number()
      .typeError("Amount must be a number")
      .required("Amount is required")
      .positive("Amount must be positive")
      .min(1, "Minimum amount is 1"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      business: businessName || "",
      amount: "",
    },
  });

  const getAllUsers = () => {
    setValue("business", businessName ? businessName : "");
    setSelectedUser(_id ? { _id: _id } : null);
    dispatch(fetchUsers("customer"));
  };

  useEffect(() => {
    getAllUsers();
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, businessName]);

  const handleUserSelect = (user) => {
    setValue("business", user?.businessName);
    setSelectedUser(user);
    setShowDropdown(false);
  };

  const filteredUsers = (usersList || []).filter((user) => {
    const searchValue = (businessName || "").toLowerCase();
    return user.businessName?.toLowerCase().includes(searchValue);
  });

  const handleSubmitForm = async (data) => {
    if (token) {
      navigate("/discount", {
        state: {
          businessId: selectedUser?._id,
          amount: data?.amount,
          paymentId: allCards?.id,
        },
      });
    }
  };

  const getMyCardsDetails = async () => {
    try {
      setLoading(true);
      const { payload } = await dispatch(
        getSavedCardvedio({ token, customerId })
      );
      if (payload?.length > 0) {
        setCards(payload[payload?.length - 1]);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getMyCardsDetails();
    }
  }, []);

  return (
    <div>
      <ProfileHeader />
      <main className="wrapper">
        {loading === true && <Loader />}
        <section className="middle-container">
          <div className="container">
            <div className="make-payment-main">
              <div className="row text-center">
                <div className="col-md-12">
                  <h3 className="main-heading">Make Payment</h3>
                </div>
              </div>

              <form onSubmit={handleSubmit(handleSubmitForm)}>
                <div className="row">
                  <div className="col-md-12">
                    <div className="make-payment-wrap face-qr">
                      <div className="row">
                        <div className="col-md-12">
                          <div
                            className="form-group"
                            style={{ position: "relative" }}
                          >
                            <i className="icon find-business-icon" />
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Find Business"
                              {...register("business")}
                              disabled
                              onFocus={() => setShowDropdown(true)}
                              onBlur={() => {
                                setTimeout(() => setShowDropdown(false), 200);
                              }}
                            />
                            {errors.business && (
                              <p className="text-danger small">
                                {errors.business.message}
                              </p>
                            )}

                            {showDropdown && (
                              <div
                                className="search-dropdown"
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: "0",
                                  right: "0",
                                  backgroundColor: "white",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                  zIndex: 1000,
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                              >
                                {loading ? (
                                  <div
                                    className="dropdown-item"
                                    style={{ padding: "10px" }}
                                  >
                                    Loading...
                                  </div>
                                ) : error ? (
                                  <div
                                    className="dropdown-item text-danger"
                                    style={{ padding: "10px" }}
                                  >
                                    {error}
                                  </div>
                                ) : filteredUsers.length > 0 ? (
                                  filteredUsers.map((user) => (
                                    <div
                                      key={user._id}
                                      className="dropdown-item"
                                      style={{
                                        padding: "10px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                      }}
                                      onMouseDown={() => handleUserSelect(user)}
                                    >
                                      <div className="user-info">
                                        <div className="user-name">
                                          {user.businessName}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div
                                    className="dropdown-item"
                                    style={{ padding: "10px" }}
                                  >
                                    No businesses found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="form-group">
                            <i className="icon amount-icon" />
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Enter Amount"
                              {...register("amount")}
                            />
                            {errors.amount && (
                              <p className="text-danger small">
                                {errors.amount.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="btn-block">
                            <button type="submit" className="btn btn-primary">
                              Continue
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MakeYourPayment;
