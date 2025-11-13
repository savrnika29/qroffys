import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ProfileHeader from "../components/ProfileHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchUsers, clearError } from "../feature/usersSlice";
import { showAlert } from "../utils/swalHelper";
import { toast } from "react-toastify";
// import { userDataInfo } from "../feature/auth/authSlice";

const Makepaymentfaceqr = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Create URLSearchParams object
  const queryParams = new URLSearchParams(location.search);
  const { firstName, lastName, _id } = location.state || {};
  // Get values
  const businessId = queryParams.get("businessid");
  const businessName = queryParams.get("businessname");
  const { isCardAdded } = useSelector((state) => state?.auth?.user);

  const userInfo = useSelector((state) => state?.auth?.user);

  const { usersList, loading, error } = useSelector((state) => state.users);

  const [profile, setProfile] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const token = useSelector((state) => state.auth?.token);

  const getAllUsers = () => {
    if (userInfo.role === "business") {
      setSearchTerm(firstName ? firstName + " " + lastName : "");
      setSelectedUser(_id ? { _id: _id } : null);
    } else {
      setSearchTerm(businessName ? businessName : "");
      setSelectedUser(businessId ? { _id: businessId } : null);
    }

    const userProfile = userInfo.role;

    if (userProfile) {
      dispatch(fetchUsers({ token, userProfile }));
    }
    setProfile(userProfile);
  };

  useEffect(() => {
    getAllUsers();
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, businessName]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };
  const scanQRData = () => {
    if (!isCardAdded) {
      return showAlert("error", "Add card first");
      // return navigate("/scanface");
    }
    if (selectedUser && amount) {
      navigate("/sendrequest", {
        state: {
          customerID: selectedUser._id,
          amount: amount,
          paymentMethod: "qr", // Pass payment method
        },
      });
    } else {
      toast.error("Please select a business and enter an amount.");
    }
  };
  const handleUserSelect = (user) => {
    if (user.role === "business" && user.onboardingStatus === "pending") {
      setSearchTerm("");
      return toast.error(`${user?.businessName} is not onboard in stripe.`);
    }
    // Profile ke hisaab se naam input me dikhana hai
    if (profile === "business") {
      // Business side → Customer ka naam dikhana hai
      const displayName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName ||
          user.lastName ||
          user.name ||
          user.userName ||
          "Unknown";

      setSearchTerm(displayName);
    } else {
      // Customer side → Business ka naam dikhana hai
      setSearchTerm(user?.businessName || user?.userName || "Unknown");
    }

    // Stripe onboarding status check

    setSelectedUser(user);
    setShowDropdown(false);
  };

  const filteredUsers = (usersList || []).filter((user) => {
    if (!searchTerm) return true;

    const firstName = user.firstName || "";
    const businessName = user.businessName || "";

    const lastName = user.lastName || "";
    const userName = user.userName || "";
    return (
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getDisplayName = (user, profile) => {
    return profile === "business"
      ? user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || user.userName || "Unknown"
      : user.businessName ||
      user.userName ||
      user.firstName ||
      user.lastName ||
      "Unknown";
  };

  return (
    <div>
      <ProfileHeader />
      <main className="wrapper">
        <section className="middle-container">
          <div className="container">
            <div className="make-payment-main">
              <div className="row text-center">
                <div className="col-md-12">
                  <h3 className="main-heading">Make Payment</h3>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="make-payment-wrap face-qr">
                    <div className="row">
                      <div className="col-md-12">
                        {profile === "customer" ? (
                          <div
                            className="form-group"
                            style={{ position: "relative" }}
                          >
                            <i className="icon find-business-icon" />
                            <input
                              type="text"
                              className="form-control"
                              id="find-business"
                              placeholder="Find Business"
                              value={searchTerm}
                              onChange={handleSearchChange}
                              disabled={
                                profile === "customer" && businessId
                                  ? true
                                  : false
                              }
                              onFocus={handleInputFocus}
                              onBlur={handleInputBlur}
                            />
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
                                        <div>
                                          <div className="user-name">
                                            {getDisplayName(user, profile)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div
                                    className="dropdown-item"
                                    style={{ padding: "10px" }}
                                  >
                                    {profile === "customer"
                                      ? "No businesses found"
                                      : "No users found"}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className="form-group"
                            style={{ position: "relative" }}
                          >
                            <i className="icon find-business-icon" />
                            <input
                              type="text"
                              className="form-control"
                              id="find-customer"
                              placeholder="Find Customer"
                              value={searchTerm}
                              onChange={handleSearchChange}
                              onFocus={handleInputFocus}
                              disabled={
                                profile === "business" && _id ? true : false
                              }
                              onBlur={handleInputBlur}
                            />
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
                                  filteredUsers.map((customer) => (
                                    <div
                                      key={customer._id}
                                      className="dropdown-item"
                                      style={{
                                        padding: "10px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                      }}
                                      onMouseDown={() =>
                                        handleUserSelect(customer)
                                      }
                                    >
                                      <div className="user-info">
                                        <div>
                                          <div className="user-name">
                                            {customer.firstName}{" "}
                                            {customer.lastName}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div
                                    className="dropdown-item"
                                    style={{ padding: "10px" }}
                                  >
                                    No customers found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="col-md-12">
                        <div className="form-group">
                          <i className="icon amount-icon" />
                          <input
                            type="number"
                            className="form-control"
                            id="enter-amount"
                            placeholder="Enter Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="btn-block">
                          {profile === "customer" ? (
                            <>
                              <button
                                type="submit"
                                className="btn btn-primary"
                                onClick={() => {
                                  if (selectedUser && amount) {
                                    navigate("/sendrequest", {
                                      state: {
                                        customerID: selectedUser._id,
                                        amount: amount,
                                        paymentMethod: "face", // Pass payment method
                                      },
                                    });
                                  } else {
                                    toast.error(
                                      "Please select a business and enter an amount."
                                    );
                                  }
                                }}
                              >
                                <i className="pay-face-icon" />
                                Pay by Face
                              </button>
                              <button
                                type="submit"
                                className="btn btn-dark"
                                onClick={() => {
                                  scanQRData();
                                }}
                              >
                                <i className="pay-qr-icon" />
                                Pay by QR
                              </button>
                            </>
                          ) : (
                            <button
                              type="submit"
                              className="btn btn-primary"
                              onClick={() => {
                                if (selectedUser && amount) {
                                  navigate("/businesssendrequest", {
                                    state: {
                                      businessID: selectedUser._id,
                                      amount: amount,
                                      paymentMethod: "face", // Default to face, adjust if needed
                                    },
                                  });
                                } else {
                                  toast.error(
                                    "Please select a customer and enter an amount."
                                  );
                                }
                              }}
                            >
                              Continue
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Makepaymentfaceqr;
