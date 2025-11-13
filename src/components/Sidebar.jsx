import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  homeicon,
  payicon,
  qlipsicon,
  paymentrequesticon,
  saveicon,
  createicon,
  helpicon,
  subscriptionicon,
  settingicon,
  logout,
  profilepic,
  businessprofile,
  activeicon,
  closeiconbig,
  moreicon,
} from "../imaUrl";
import { clearAuthState } from "../feature/auth/authSlice";
import { getProfile } from "../feature/profileSlice";
import { showPayAlert } from "../utils/swalHelper";
const VITE_API_URL = import.meta.env.VITE_API_URL;

const Sidebar = () => {
  const dispatch = useDispatch();

  const [profile, setProfile] = useState("");

  const { user } = useSelector((store) => store?.profile);
  const { token, user: authUser } = useSelector((store) => store?.auth);
  const role = user?.role || authUser?.role || localStorage.getItem("profile");
  const navigate = useNavigate();

  const dropdownToggleRef = useRef(null);
  const dropdownMenuRef = useRef(null);

  useEffect(() => {
    setProfile(localStorage.getItem("profile"));
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

  const getProfileInfo = async () => {
    try {
      await dispatch(getProfile(token));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Initial data
  useEffect(() => {
    if (token) {
      getProfileInfo();
    }
  }, [token]);

  const handleClick = (e) => {
    if (user?.isSubscribed === false && user?.role === "customer") {
      e.preventDefault();
      showPayAlert(
        "info",
        "You need an active subscription to access this page!"
      ).then((result) => {
        if (result.isConfirmed) {
          navigate("/subscription");
        }
      });
    } else {
      navigate("/subscription");
    }
  };

  return (
    <div>
      <div className="profile-left-nav">
        <div className="tab-profile">
          {role === "customer" ? (
            <Link to="/profile">
              <figure>
                <img src={user?.profilePicture} alt="" />
              </figure>
              <span>
                {user?.firstName?.charAt(0).toUpperCase() +
                  user?.firstName?.slice(1).toLowerCase()}{" "}
                {user?.lastName?.charAt(0).toUpperCase() +
                  user?.lastName?.slice(1).toLowerCase()}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/mybusinessprofile")}
              className="profile-button"
            >
              {user?.profilePicture || authUser?.profilePicture ? (
                <img
                  className="tab-profile_buss"
                  src={user?.profilePicture || authUser?.profilePicture}
                  alt=""
                />
              ) : (
                <div className="business-profile-circle">
                  <span>
                    {(user?.businessName || authUser?.businessName || "N/A")
                      .split(" ")
                      .map((w) => w.charAt(0).toUpperCase())
                      .join("")}
                  </span>{" "}
                </div>
              )}
              <span>
                {/* {user?.firstName
                  ? user?.firstName + " " + user?.lastName
                  : user?.businessName?.charAt(0).toUpperCase() +
                  authUser?.businessName?.slice(1).toLowerCase()} */}

                {user?.businessName ||
                  authUser?.businessName ||
                  `${authUser?.firstName || ""} ${authUser?.lastName || ""}`}
              </span>
            </button>
          )}

          {/* Dropdown for mobile */}
          <div className="tab-profile">
            <div className="more-dropdown custom-dropdown d-lg-none">
              <a
                href="#"
                className="custom-dropdown-toggle"
                ref={dropdownToggleRef}
                onClick={(e) => e.preventDefault()}
              >
                <img src={moreicon} alt="" />
              </a>
              <ul className="custom-dropdown-menu" ref={dropdownMenuRef}>
                <li>
                  <a href="/home">
                    <i>
                      <img src={homeicon} alt="" />
                    </i>
                    <span>Home</span>
                  </a>
                </li>
                <li>
                  <a href="/makepaymnetfaceqr" onClick={handleClick}>
                    <i>
                      <img src={payicon} alt="" />
                    </i>
                    <span>Pay</span>
                  </a>
                </li>
                <li>
                  <a href="/shortfeeds">
                    <i>
                      <img src={qlipsicon} alt="" />
                    </i>
                    <span>Qlips</span>
                  </a>
                </li>
                <li>
                  {role === "customer" && (
                    <a href="/allrequest">
                      <i>
                        <img src={paymentrequesticon} alt="" />
                      </i>
                      <span>All Payment Requests</span>
                    </a>
                  )}
                </li>
                <li>
                  <a href="/saved">
                    <i>
                      <img src={saveicon} alt="" />
                    </i>
                    <span>Saved Qlip Videos/Saved Qasts</span>
                  </a>
                </li>
                <li>
                  <a href="/newquastcommanuser">
                    <i>
                      <img src={createicon} alt="" />
                    </i>
                    <span>Create Qast</span>
                  </a>
                </li>
                <li>
                  <a href="/helpcenter">
                    <i>
                      <img src={helpicon} alt="" />
                    </i>
                    <span>Help Center</span>
                  </a>
                </li>
                <li>
                  {role === "customer" && (
                    <a href="/subscription">
                      <i>
                        <img src={activeicon} alt="" />
                      </i>
                      <span>Activate Discount</span>
                    </a>
                  )}
                </li>
                <li>
                  <a href="/languagesetting">
                    <i>
                      <img src={settingicon} alt="" />
                    </i>
                    <span>Settings</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(clearAuthState());
                      navigate("/login", { replace: true });
                    }}
                  >
                    <i>
                      <img src={logout} alt="" />
                    </i>
                    <span>Log Out</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar for desktop */}
        <ul className="profile-nav-menu d-none d-sm-block">
          <li>
            <Link to="/home">
              <i>
                <img src={homeicon} alt="" />
              </i>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/makepaymnetfaceqr" onClick={handleClick}>
              <i>
                <img src={payicon} alt="" />
              </i>
              <span>Pay</span>
            </Link>
          </li>
          <li>
            <Link to="/shortfeeds">
              <i>
                <img src={qlipsicon} alt="" />
              </i>
              <span>Qlips</span>
            </Link>
          </li>
          {role === "customer" && (
            <li>
              <Link to="/allrequest">
                <i>
                  <img src={paymentrequesticon} alt="" />
                </i>
                <span>All Payment Requests</span>
              </Link>
            </li>
          )}
          <li>
            <Link to="/saved">
              <i>
                <img src={saveicon} alt="" />
              </i>
              <span>Saved Qlip Videos/Saved Qasts</span>
            </Link>
          </li>
          <li>
            <Link to="/newquastcommanuser">
              <i>
                <img src={createicon} alt="" />
              </i>
              <span>Create Qast</span>
            </Link>
          </li>
          <li>
            <Link to="/helpcenter">
              <i>
                <img src={helpicon} alt="" />
              </i>
              <span>Help Center</span>
            </Link>
          </li>
          {role === "customer" && (
            <li>
              <Link to="/subscription">
                <i>
                  <img src={activeicon} alt="" />
                </i>
                <span>Activate Discount</span>
              </Link>
            </li>
          )}
          <li>
            <Link to="/languagesetting">
              <i>
                <img src={settingicon} alt="" />
              </i>
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                dispatch(clearAuthState());
                navigate("/login", { replace: true });
              }}
            >
              <i>
                <img src={logout} alt="" />
              </i>
              <span>Log Out</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
