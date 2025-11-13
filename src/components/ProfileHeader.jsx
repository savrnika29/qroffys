import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import {
  searchicon,
  logo,
  headernotification,
  headercommenticon,
  heaaderhomeicon,
  heaaderqlipsicon,
  headerprecent,
  headderpayicon,
  headerdiscount,
  heaadercreateicon,
  notification,
} from "../imaUrl";
import { useDispatch, useSelector } from "react-redux";
import Headersearchfilter from "../model/Headersearchfilter";
import { fetchFilteredPosts } from "../feature/homePage/homePostslice";
import { showPayAlert } from "../utils/swalHelper";
const ProfileHeader = () => {
  const [profile, setProfile] = useState("");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch] = useDebounce(searchQuery); // 500ms debounce
  const user = useSelector((state) => state.auth.user);
  const role = user?.role || localStorage.getItem("profile");
  useEffect(() => {
    setProfile(localStorage.getItem("profile"));
  }, []);

  useEffect(() => {
    const body = {
      search: debouncedSearch,
      limit: "10",
      page: "1",
    };

    if (token) {
      dispatch(fetchFilteredPosts({ token, body, setLoading }));
    }
  }, [debouncedSearch, token, dispatch]);

  const handleSearchClick = (e) => {
    e.preventDefault();
    const body = {
      search: searchQuery,
      limit: "10",
      page: "1",
    };
    if (token) {
      // if (searchQuery) {
      dispatch(fetchFilteredPosts({ token, body, setLoading }));
      // }
      const toastElement = document.getElementById("liveToast");
      if (toastElement) {
        const toastInstance =
          window.bootstrap.Toast.getOrCreateInstance(toastElement);
        toastInstance.show();
      }
    }
  };
  const handleClick = (e) => {
    if (user?.isSubscribed === false && user?.role === "customer") {
      e.preventDefault();
      showPayAlert("info", "You need an active subscription to access this page!").then(
        (result) => {
          if (result.isConfirmed) {
            navigate("/subscription");
          }
        }
      );
    } else {
      navigate("/subscription");
    }
  };
 
   const handleFilterIconClick = (e) => {
    e.preventDefault();
    const toastElement = document.getElementById("liveToast");
    if (toastElement) {
      const toastInstance =
        window.bootstrap.Toast.getOrCreateInstance(toastElement);
      toastInstance.show();
    }
  };
  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg navigation-wrap">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/home">
            <img src={logo} alt="" />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasExample"
            aria-controls="offcanvasExample"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse">
            <div className="search-wrapper">
              <form className="form-group" onSubmit={(e) => e.preventDefault()}>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <button
                  className="btn btn-link liveToastBtn"
                  // onClick={handleSearchClick}    
                                    onClick={handleFilterIconClick} // Changed to separate function

                  type="button"
                >
                  <img src={searchicon} alt="search icon" />
                </button>
              </form>
            </div>
            <ul className="header-after-login-mid-icons mx-auto me-auto mb-2 mb-lg-0">
              <li>
                <Link to="/home">
                  <i>
                    <img src={heaaderhomeicon} alt="" />
                  </i>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/shortfeeds">
                  <i>
                    <img src={heaaderqlipsicon} alt="" />
                  </i>
                  <span>Videos</span>
                </Link>
              </li>
              <li>
                <Link to="/qroffydiscountbusinessprofile">
                  <i>
                    <img src={headerprecent} alt="" />
                  </i>
                  <span>Qroffy Discount</span>
                </Link>
              </li>
              <li>
                <Link to="/makepaymnetfaceqr" onClick={handleClick}>
                  <i>
                    <img src={headderpayicon} alt="" />
                  </i>
                  <span>Pay</span>
                </Link>
              </li>
              <li>
                <Link to="/newquastcommanuser">
                  <i>
                    <img src={heaadercreateicon} alt="" />
                  </i>
                  <span>Create Qast</span>
                </Link>
              </li>
            </ul>
            <div className="header-icon-btn-wrap after-login">
              <Link to="/notification">
                <img src={headernotification} alt="" />
              </Link>
              <Link to="/chatlist">
                <img src={headercommenticon} alt="" />
              </Link>
              {role === "customer" && (

                <Link to="/subscription" className="discount-icon">
                  <img src={headerdiscount} alt="" />
                  <span>Activate Discount</span>
                </Link>
              )}
            </div>
          </div>
          <div
            className="offcanvas offcanvas-start d-lg-none"
            tabIndex={-1}
            id="offcanvasExample"
            aria-labelledby="offcanvasExampleLabel"
          >
            <div className="offcanvas-header">
              <div className="header-icon-btn-wrap after-login">
                <Link to="/notification">
                  <img src={notification} alt="" />
                </Link>
                <Link to="/chatlist">
                  <img src={headercommenticon} alt="" />
                </Link>
                <Link to="/subscription" className="discount-icon">
                  <img src={headerdiscount} alt="" />
                </Link>
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
            </div>
            <div className="offcanvas-body">
              <ul className="header-after-login-mid-icons mx-auto me-auto mb-2 mb-lg-0">
                <li>
                  <Link to="/home">
                    <i>
                      <img src={heaaderhomeicon} alt="" />
                    </i>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link to="/shortfeeds">
                    <i>
                      <img src={heaaderqlipsicon} alt="" />
                    </i>
                    <span>Videos</span>
                  </Link>
                </li>
                <li>
                  <Link to="/qroffydiscountbusinessprofile">
                    <i>
                      <img src={headerprecent} alt="" />
                    </i>
                    <span>Qroffy Discount</span>
                  </Link>
                </li>
                <li>
                  <Link to="/makepaymnetfaceqr" onClick={handleClick}>
                    <i>
                      <img src={headderpayicon} alt="" />
                    </i>
                    <span>Pay</span>
                  </Link>
                </li>
                <li>
                  <Link to="/newquastcommanuser">
                    <i>
                      <img src={heaadercreateicon} alt="" />
                    </i>
                    <span>Create Qast</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <Headersearchfilter />
    </header>
  );
};

export default ProfileHeader;
