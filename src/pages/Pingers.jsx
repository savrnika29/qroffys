import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"; // Added useParams
import ProfileHeader from "../components/ProfileHeader";
import Sidebar from "../components/Sidebar";
import { profilepic, headercommenticon } from "../imaUrl";
import {
  fetchPingers,
  followAction,
  resetFollowerState,
} from "../feature/followersSlice";
import Loader from "../components/Loader";
const Pingers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoading] = useState(false);
  // Parse query params
  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get("tab");
  const { targetUserId } = useParams(); // Get targetUserId from URL (e.g., /pingers/:targetUserId)

  const { token, user: authUser } = useSelector((state) => state.auth || {});

  const userId =
    authUser?._id || authUser?.userId || localStorage.getItem("userId");

  const {
    pingers,
    pinging,
    page,
    loading,
    totalPages,
    error,
    totalFollowers,
    totalFollowing,
    targetUserId: stateTargetUserId,
  } = useSelector((state) => state.followers || {});
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(
    tab === "pinging" ? "following" : "follower"
  );
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  // Determine if viewing self or another user
  const isViewingSelf = !targetUserId || targetUserId === userId;

  useEffect(() => {
    if (!token || !userId) {
      console.warn("Missing token or userId, redirecting to login", {
        token: !!token,
        userId,
      });
      navigate("/login");
      return;
    }
    dispatch(
      fetchPingers({
        token,
        userId,
        targetUserId: targetUserId ? targetUserId : "", // Use targetUserId if provided
        type: activeTab,
        page: 1,
        search,
      })
    );
  }, [dispatch, token, userId, targetUserId, activeTab, navigate]);

  useEffect(() => {
    // if (!targetUserId) {
    dispatch(
      fetchPingers({
        token,
        userId,
        targetUserId: targetUserId ? targetUserId : "", // Use targetUserId if provided
        type: "list",
        page: 1,
        search,
      })
    );
    // }
  }, []);

  // Search effect with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (token && userId) {
        dispatch(
          fetchPingers({
            token,
            userId,
            targetUserId: targetUserId ? targetUserId : "",
            type: activeTab,
            page: 1,
            search,
          })
        );
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [search, dispatch, token, userId, targetUserId, activeTab]);
  // Infinite scroll effect

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      !loading &&
      page < totalPages &&
      token &&
      userId
    ) {
      dispatch(
        fetchPingers({
          token,
          userId,
          targetUserId: targetUserId ? targetUserId : "",
          type: activeTab,
          page: page + 1,
          search,
        })
      );
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    dispatch,
    token,
    userId,
    targetUserId,
    page,
    totalPages,
    loading,
    search,
  ]);
  const fetchDataPingers = () => {
    try {
      dispatch(
        fetchPingers({
          token,
          userId,
          targetUserId: targetUserId ? targetUserId : "",
          type: activeTab,
          page: 1,
          search,
        })
      );
    } catch (error) {}
  };
  const handleFollowAction = async (targetUserId, actionType) => {
    try {
      setLoading(true);
      await dispatch(
        followAction({
          token,
          userId: targetUserId ? targetUserId : "",
          type: actionType,
        })
      );
      fetchDataPingers();
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleTabSwitch = (type) => {
    setActiveTab(type);
    setSearch("");
    dispatch(
      fetchPingers({
        token,
        userId,
        targetUserId: targetUserId ? targetUserId : "",
        type,
        page: 1,
        search: "",
      })
    );
  };

  const getErrorMessage = (error) => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      return error.message || error.error || "An error occurred";
    }
    return "An unknown error occurred";
  };

  if (!token || !userId) {
    return (
      <div>
        <ProfileHeader />
        <main className="wrapper">
          <section className="middle-container">
            <div className="container-fluid">
              <div className="alert alert-warning">
                Please log in to view followers and following.
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div>
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
                    <div className="pingers-wrap">
                      <nav>
                        <div
                          className="nav nav-tabs"
                          id="nav-tab"
                          role="tablist"
                        >
                          <button
                            className={`nav-link ${
                              activeTab === "follower" ? "active" : ""
                            }`}
                            onClick={() => handleTabSwitch("follower")}
                          >
                            Pingers ({totalFollowers || 0}){" "}
                          </button>
                          <button
                            className={`nav-link ${
                              activeTab === "following" ? "active" : ""
                            }`}
                            onClick={() => handleTabSwitch("following")}
                          >
                            Pinging ({totalFollowing || 0})
                          </button>
                        </div>
                      </nav>
                      <div className="tab-content" id="nav-tabContent">
                        <div
                          className={`tab-pane fade ${
                            activeTab === "follower" ? "show active" : ""
                          }`}
                          id="pingers"
                        >
                          <div className="input-border-wrap">
                            <input
                              id="chat-enter-follower"
                              type="text"
                              className="form-control"
                              placeholder="Search"
                              value={search}
                              onChange={handleSearch}
                            />
                            <button type="button" className="btn" />
                          </div>
                          {error && (
                            <div className="error alert alert-danger">
                              {getErrorMessage(error)}
                            </div>
                          )}
                          {loading && page === 1 && (
                            <div className="loading">Loading...</div>
                          )}
                          {!loading && pingers.length === 0 && !error && (
                            <div className="no-data ">No pingers found.</div>
                          )}
                          <div className="pingers-profile-wrap">
                            <ul className="pingers-list">
                              {pingers.map((user, index) => {
                                return (
                                  <li key={user._id || index}>
                                    <div className="pingers-left">
                                      <Link
                                        to={
                                          user._id === authUser?._id
                                            ? "/profile"
                                            : user?.role === "customer"
                                            ? `/commanuserprofile/${user.id}`
                                            : `/commanuserviewbusiness/${user.id}`
                                        }
                                        className="profile-pic-block"
                                      >
                                        <figure>
                                          {user?.role === "customer" ? (
                                            <img
                                              src={
                                                user.profilePic
                                                  ? `${user.profilePic}`
                                                  : profilepic
                                              }
                                              alt={user.name || "User"}
                                            />
                                          ) : (
                                            <div className="business-profile-circle">
                                              <span>
                                                {(user?.businessName)
                                                  .split(" ")
                                                  .map((w) =>
                                                    w.charAt(0).toUpperCase()
                                                  )
                                                  .join("")}
                                              </span>{" "}
                                            </div>
                                          )}
                                        </figure>
                                        <span>
                                          {user.name ||
                                            user.firstName ||
                                            user.businessName ||
                                            "Unknown User"}
                                        </span>
                                      </Link>
                                    </div>
                                    <div className="pingers-right">
                                      {user.itsMe ? (
                                        <span className="text-muted">
                                          {/* This is you */}
                                        </span>
                                      ) : targetUserId ? (
                                        user.isMutualFriendWithMe === false ? (
                                          <>
                                            <button
                                              className="btn btn-primary"
                                              onClick={() =>
                                                handleFollowAction(
                                                  user._id,
                                                  // user.isFollow === true
                                                  user.isFollow === true
                                                    ? user.isFollowing === false
                                                      ? "followback"
                                                      : "follow"
                                                    : user.isFollowing === true
                                                    ? "unfollow"
                                                    : "follow"

                                                  // : "follow"
                                                )
                                              }
                                              disabled={loading}
                                            >
                                              {user.isFollow === true
                                                ? user.isFollowing === false
                                                  ? "Ping Back"
                                                  : "Ping"
                                                : user.isFollowing === true
                                                ? "Unping"
                                                : "Ping"}
                                            </button>
                                            {/* {user.isFollowing === false && ( */}
                                            <Link
                                              to={`/personalchat/${user._id}`}
                                              className="icon-wrap"
                                            >
                                              <img
                                                src={headercommenticon}
                                                alt="Chat"
                                              />
                                            </Link>
                                            {/* )} */}
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              className="btn btn-primary"
                                              onClick={() =>
                                                navigate(
                                                  `/personalchat/${user._id}`
                                                )
                                              }
                                            >
                                              Message
                                            </button>
                                          </>
                                        )
                                      ) : user.isMutualFriendWithMe ===
                                        false ? (
                                        user.isFollowing === false && (
                                          <>
                                            <button
                                              className="btn btn-primary"
                                              onClick={() =>
                                                handleFollowAction(
                                                  user._id,
                                                  "followback"
                                                )
                                              }
                                              disabled={loading}
                                            >
                                              Ping Back
                                            </button>
                                            <Link
                                              to={`/personalchat/${user._id}`}
                                              className="icon-wrap"
                                            >
                                              <img
                                                src={headercommenticon}
                                                alt="Chat"
                                              />
                                            </Link>
                                          </>
                                        )
                                      ) : (
                                        <button
                                          className="btn btn-primary"
                                          onClick={() =>
                                            navigate(
                                              `/personalchat/${user._id}`
                                            )
                                          }
                                        >
                                          Message
                                        </button>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          {loading && page > 1 && (
                            <div className="loading-more">Loading more...</div>
                          )}
                        </div>
                        <div
                          className={`tab-pane fade ${
                            activeTab === "following" ? "show active" : ""
                          }`}
                          id="pinging"
                        >
                          <div className="input-border-wrap">
                            <input
                              id="chat-enter-following"
                              type="text"
                              className="form-control"
                              placeholder="Search"
                              value={search}
                              onChange={handleSearch}
                            />
                            <button type="button" className="btn" />
                          </div>
                          {error && (
                            <div className="error alert alert-danger">
                              {getErrorMessage(error)}
                            </div>
                          )}
                          {loading && page === 1 && (
                            <div className="loading">Loading...</div>
                          )}
                          {!loading && pinging.length === 0 && !error && (
                            <div className="no-data">No following found.</div>
                          )}
                          <div className="pingers-profile-wrap">
                            <ul className="pingers-list">
                              {pinging.map((user, index) => (
                                <li key={user._id || index}>
                                  <div className="pingers-left">
                                    <Link
                                      to={
                                        user._id === authUser?._id
                                          ? "/profile"
                                          : user?.role === "customer"
                                          ? `/commanuserprofile/${user.id}`
                                          : `/commanuserviewbusiness/${user.id}`
                                      }
                                      className="profile-pic-block"
                                    >
                                      <figure>
                                        {user?.role === "customer" ? (
                                          <img
                                            src={
                                              user.profilePic
                                                ? `${user.profilePic}`
                                                : profilepic
                                            }
                                            alt={user.name || "User"}
                                          />
                                        ) : (
                                          <div className="business-profile-circle">
                                            <span>
                                              {user?.businessName
                                                ?.split(" ")
                                                .map((w) =>
                                                  w.charAt(0).toUpperCase()
                                                )
                                                .join("")}
                                            </span>{" "}
                                          </div>
                                        )}
                                      </figure>
                                      <span>
                                        {user.name ||
                                          user.firstName ||
                                          user.businessName ||
                                          "Unknown User"}
                                      </span>
                                    </Link>
                                  </div>
                                  <div className="pingers-right">
                                    {user.itsMe ? (
                                      <span className="text-muted"></span>
                                    ) : targetUserId ? (
                                      user?.isMutualFriendWithMe === false ? (
                                        user?.isFollow === true ? (
                                          <>
                                            <button
                                              className="btn btn-primary"
                                              onClick={() =>
                                                handleFollowAction(
                                                  user._id,
                                                  user?.isFollowing === false
                                                    ? "followback"
                                                    : "unfollow"
                                                )
                                              }
                                              disabled={loading}
                                            >
                                              {user?.isFollowing === false
                                                ? "Ping back"
                                                : "Unping"}
                                            </button>

                                            <Link
                                              to={`/personalchat/${user._id}`}
                                              className="icon-wrap"
                                            >
                                              <img
                                                src={headercommenticon}
                                                alt="Chat"
                                              />
                                            </Link>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              className="btn btn-primary"
                                              onClick={() =>
                                                handleFollowAction(
                                                  user._id,
                                                  user?.isFollowing === true
                                                    ? "unfollow"
                                                    : "follow"
                                                )
                                              }
                                              disabled={loading}
                                            >
                                              {user?.isFollowing === true
                                                ? "Unping"
                                                : "Ping"}
                                            </button>
                                            <Link
                                              to={`/personalchat/${user._id}`}
                                              className="icon-wrap"
                                            >
                                              <img
                                                src={headercommenticon}
                                                alt="Chat"
                                              />
                                            </Link>
                                          </>
                                        )
                                      ) : (
                                        <button
                                          className="btn btn-primary"
                                          onClick={() =>
                                            navigate(
                                              `/personalchat/${user._id}`
                                            )
                                          }
                                        >
                                          Message
                                        </button>
                                      )
                                    ) : user?.isMutualFriendWithMe === false ? (
                                      user?.isFollow === false && (
                                        <>
                                          <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                              handleFollowAction(
                                                user._id,
                                                "unfollow"
                                              )
                                            }
                                            disabled={loading}
                                          >
                                            Unping
                                          </button>
                                          <Link
                                            to={`/personalchat/${user._id}`}
                                            className="icon-wrap"
                                          >
                                            <img
                                              src={headercommenticon}
                                              alt="Chat"
                                            />
                                          </Link>
                                        </>
                                      )
                                    ) : (
                                      <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                          navigate(`/personalchat/${user._id}`)
                                        }
                                      >
                                        Message
                                      </button>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {loading && page > 1 && (
                            <div className="loading-more">Loading more...</div>
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

export default Pingers;
