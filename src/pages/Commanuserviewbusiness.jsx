import React, { useEffect, useState, useRef, useCallback } from "react";
import { profilepic, moreicon, favicon, headercommenticon, shareicon, saveiconblack, favoriteicon, redlike, saveblack, } from "../imaUrl";
import ProfileHeader from "../components/ProfileHeader";
import Sidebar from "../components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Moreinfo from "../model/Moreinfo";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";
import { fetchBusinessById, clearBusinessData } from "../feature/businessSlice";
import { fetchMyBusinessPosts, clearMyBusinessPostsData, updatePost, toggleLike, toggleSave, } from "../feature/mybusinesspostSlice";
import { likePost } from "../feature/homePage/likeSlice";
import { savePost } from "../feature/homePage/saveSlice";
import { fetchPingers, followAction } from "../feature/followersSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReportPostModal from "../model/ReportModel";
import CommentModal from "../model/CommentModel";
import { reportPost } from "../feature/homePage/reportSlice";
import { sharePost } from "../feature/homePage/postShareSlice";
import { FaWhatsapp, FaFacebookF, FaTwitter, FaTelegramPlane, } from "react-icons/fa";
import { getComments, postComment } from "../feature/commentSlice";
import { debounce } from "lodash";
import ShareModal from "../model/ShareModal";
import LocationModal from "../model/LocationModel";
import { showAlert, showPayAlert } from "../utils/swalHelper";
import SelectShareModal from "../model/SelectShareModal";
import InternalShareModal from "../model/InternalShareModal";
import { userDataInfo } from "../feature/auth/authSlice";
import axios from "axios";

const Commanuserviewbusiness = () => {
  const { userId } = useParams();

  //   const navigate = useNavigate();

  //   const dispatch = useDispatch();
  //   const {
  //     businessData,
  //     loading: businessLoading,
  //     error: businessError,
  //   } = useSelector((state) => state.business);

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const {
    businessData,
    loading: businessLoading,
    error: businessError,
  } = useSelector((state) => state.business);

  const {
    posts,
    currentPage,
    totalPages,
    shareCount,
    loading: postsLoading,
    error: postsError,
    totalFollowings,
  } = useSelector((state) => state.mybusinessposts);
  const {
    pingers,
    loading: followersLoading,
    error: followersError,
  } = useSelector((state) => state.followers);
  const { token, user } = useSelector((state) => state.auth);
  const { pinging, totalFollowers, totalFollowing } = useSelector(
    (state) => state.followers || {}
  );

  const loggedInUserId = user?._id;
  const targetUserId = userId || user?._id;
  const [isPingLoading, setIsPingLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("qast");
  const [hasMoreStories, setHasMore] = useState(true);
  const [likeStates, setLikeStates] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const report = useSelector((state) => state.report);
  const [openSharePostId, setOpenSharePostId] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [reason, setReason] = useState("");
  const limit = 5;
  const [userInfo, setUserInfo] = useState();
  const [localFollowers, setLocalFollowers] = useState(0);
  const [localFollowings, setLocalFollowings] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState(null);
  const [isSelectShareOpen, setIsSelectShareOpen] = useState(false);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const authUserId =
    user?._id || user?.userId || localStorage.getItem("userId");
  const effectiveUserId = targetUserId || authUserId;
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const toggleShareDropdown = (postId) => {
    setOpenSharePostId(openSharePostId === postId ? null : postId);
  };

  useEffect(() => {
    if (targetUserId) {
      dispatch(fetchBusinessById(targetUserId));
    }
    return () => {
      dispatch(clearBusinessData());
    };
  }, [targetUserId, dispatch]);

  const handleMoreInfo = () => {
    // e.preventDefault();

    setSelectedBusiness(businessData);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (targetUserId && token) {
      dispatch(
        fetchPingers({
          token,
          userId: authUserId,
          targetUserId,
          type: "following",
        })
      ).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          setLocalFollowers(res.payload.totalFollowers || 0);
          setLocalFollowings(res.payload.totalFollowing || 0);
        }
      });
    }
  }, [targetUserId, token, dispatch, authUserId]);

  const handleSelectOption = (option) => {
    setIsSelectShareOpen(false);
    if (option === "external") {
      setIsShareModalOpen(true);
    } else if (option === "internal") {
      setIsInternalModalOpen(true);
    }
  };

  const handleLike = (postId) => {
    if (!token) {
      alert("Please login to like the post.");
      return;
    }
    dispatch(toggleLike({ postId, userId: user?._id }));
    dispatch(likePost({ postId, token }))
      .unwrap()
      .then((res) => { })
      .catch((error) => {
        dispatch(toggleLike({ postId, userId: user?._id }));
        alert(`Failed to like post: ${error.message || "Unknown error"}`);
      });
  };

  const handleSave = debounce((postId) => {
    if (!token) return;
    dispatch(toggleSave({ postId }));
    dispatch(savePost({ postId, token })).then((res) => {
      if (res.meta.requestStatus !== "fulfilled") {
        dispatch(toggleSave({ postId }));
      }
    });
  }, 300);

  const handleReportClick = (postId) => {
    setReportPostId(postId);
    setShowReportModal(true);
  };

  // const handleExternalShare = (postId, platform) => {
  //   if (!token) {
  //     toast("You must be logged in to share a post.");
  //     return;
  //   }
  //   const post = posts.find((p) => p._id === postId);
  //   if (!post || !post.user || !post.user._id) {
  //     toast("Cannot share post: Post or user information is missing.");
  //     return;
  //   }
  //   const baseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
  //   const shareUrl = `${baseUrl}/commanuserprofile/${post.user._id}?highlight=${postId}`;
  //   const text = encodeURIComponent("Check out this post!");
  //   const shareData = {
  //     type: "external",
  //     postId,
  //     platform,
  //     sharedToUserId: "",
  //   };
  //   const updatedPosts = posts.map((p) =>
  //     p._id === postId ? { ...p, totalShares: (p.totalShares || 0) + 1 } : p
  //   );
  //   dispatch({ type: "homepost/setPosts", payload: updatedPosts });
  //   dispatch(sharePost({ shareData, token }))
  //     .unwrap()
  //     .then((res) => {
  //       if (res?.error === false) {
  //         setOpenSharePostId(null);
  //         setIsShareModalOpen(false);
  //         setSelectedSharePost(null);
  //       }
  //     })
  //     .catch((err) => {
  //       toast("Failed to share the post. Please try again.");
  //       const revertedPosts = posts.map((p) =>
  //         p._id === postId ? { ...p, totalShares: p.totalShares || 0 } : p
  //       );
  //       dispatch({ type: "homepost/setPosts", payload: revertedPosts });
  //     });
  // };

  const handleExternalShare = async (postId, platform) => {
    if (!token) {
      toast.error("You must be logged in to share a post.");
      return;
    }
    const post = posts.find((p) => p._id === postId);
    if (!post || !post.user || !post.user._id) {
      toast.error("Cannot share post: Post or user information is missing.");
      return;
    }

    // Optimistically update share count
    const newShareCount = (post.shareCount || 0) + 1;
    dispatch(
      updatePost({
        postId,
        updates: {
          shareCount: newShareCount,
        },
      })
    );

    const shareData = {
      type: "external",
      postId,
      platform,
      sharedToUserId: "",
    };

    try {
      const result = await dispatch(sharePost({ shareData, token })).unwrap();
      if (result?.error) {
        // Revert on failure
        dispatch(
          updatePost({
            postId,
            updates: {
              shareCount: post.shareCount || 0,
            },
          })
        );
        toast.error(result.message || "Failed to share post");
      } else {
        setIsShareModalOpen(false);
        setSelectedSharePost(null);
      }
    } catch (error) {
      // Revert on error
      dispatch(
        updatePost({
          postId,
          updates: {
            shareCount: post.shareCount || 0,
          },
        })
      );
      toast.error(error.message || "Failed to share post");
    }
  };

  const getShareLink = (platform, shareUrl, text) => {
    switch (platform) {
      case "whatsapp":
        return `https://api.whatsapp.com/send?text=${text}%20${shareUrl}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      case "twitter":
        return `https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`;
      case "telegram":
        return `https://t.me/share/url?url=${shareUrl}`;
      default:
        return "";
    }
  };

  const handleOpenCommentSection = (postId) => {
    if (!token) {
      alert("Please login to view comments.");
      return;
    }
    setSelectedCommentPostId(postId);
    setIsCommentModalOpen(true);
  };

  const handleCommentModalClose = () => {
    setIsCommentModalOpen(false);
    setSelectedCommentPostId(null);
  };

  // Fetch business data
  // useEffect(() => {
  //   if (userId) {
  //     dispatch(fetchBusinessById(userId));
  //   }
  //   return () => {
  //     dispatch(clearBusinessData());
  //   };
  // }, [userId, dispatch]);

  // Fetch posts
  useEffect(() => {
    if (targetUserId && token) {
      dispatch(
        fetchMyBusinessPosts({
          userId: targetUserId,
          page: 1,
          limit: 10,
          type: activeTab,
        })
      ).then((res) => {
        if (
          res.meta.requestStatus === "fulfilled" &&
          res.payload?.data?.postsDetails
        ) {
          setLocalFollowers(res.payload.data.totalFollowers || 0);
          setLocalFollowings(res.payload.data.totalFollowings || 0);

          const updatedLikeStates = {};
          res.payload.data.postsDetails.forEach((post) => {
            const media = post.isPostLike || (post.media?.length > 0 && post.media?.[0]);
            updatedLikeStates[post._id] = {
              liked: media?.isPostLike || false,
              count: media?.likesCount || 0,
            };
          });

          setLikeStates(updatedLikeStates);
        } else {
          toast.error(res.payload?.message || "Failed to fetch posts");
        }
      });
    }
    return () => {
      dispatch(clearMyBusinessPostsData());
    };
  }, [dispatch, targetUserId, activeTab, loggedInUserId, token]);

  // Fetch followers and following
  useEffect(() => {
    if (userId && token) {
      dispatch(fetchPingers({ token, userId, type: "list", page: 1 }));
    }
  }, [userId, token, dispatch]);

  // Initialize follow status
  useEffect(() => {
    if (loggedInUserId === targetUserId) {
      setIsFollowing(true);
      return;
    }

    if (userId && token && loggedInUserId) {
      setIsPingLoading(true);

      dispatch(fetchPingers({ token, userId, type: "list", page: 1 }))
        .unwrap()
        .then((response) => {
          // Check if current user is in the followers list
          const isUserFollowing =
            response?.pingers?.some(
              (follower) => follower._id === loggedInUserId
            ) || false;

          setIsFollowing(isUserFollowing);
        })
        .catch((err) => {
          setIsFollowing(false);
          toast.error("Failed to load follow status");
        })
        .finally(() => {
          setIsPingLoading(false);
        });
    }
  }, [userId, token, loggedInUserId, targetUserId, dispatch]);

  // Initialize Swiper
  useEffect(() => {
    const swipers = document.querySelectorAll(".mySwiper");
    swipers.forEach((swiperEl) => {
      new Swiper(swiperEl, {
        loop: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      });
    });
  }, [posts]);

  // Initialize Bootstrap dropdowns
  useEffect(() => {
    const dropdownTriggerList = document.querySelectorAll(
      '[data-bs-toggle="dropdown"]'
    );
    dropdownTriggerList.forEach((dropdownToggleEl) => {
      new bootstrap.Dropdown(dropdownToggleEl);
    });
  }, []);

  // Infinite scroll observer
  const observer = useRef();
  const lastItemRef = useCallback(
    (node) => {
      if (postsLoading || followersLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [postsLoading, followersLoading, currentPage, totalPages]
  );

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Determine media type
  const isImage = (url) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  const isVideo = (url) => /\.(mp4|mov|avi)$/i.test(url);

  // Handle ping/unping
  // Handle ping/unping

  const handlePingClick = () => {
    if (!token) {
      toast.error("Please login to follow");
      return;
    }

    if (loggedInUserId === userId) {
      toast.info("You cannot follow yourself");
      return;
    }

    if (isPingLoading) {
      return;
    }

    setIsPingLoading(true);

    // Determine action based on current state
    const actionType = userInfo?.isFollowed === true ? "unfollow" : "follow";

    // Perform the follow/unfollow action directly
    dispatch(followAction({ token, userId, type: actionType }))
      .unwrap()
      .then((response) => {
        getUserInfo();

        const newFollowingState = actionType === "follow";
        setIsFollowing(newFollowingState);

        if (actionType === "follow") {
          setLocalFollowers((prev) => prev + 1);
          // toast.success("Ping successfully");
        } else {
          setLocalFollowers((prev) => Math.max(0, prev - 1));
          // toast.success("Unping successfully");
        }

        // Optionally refresh the followers list to get updated data
        dispatch(fetchPingers({ token, userId, type: "list", page: 1 }));
      })
      .catch((err) => {
        console.error("Follow action error:", err);

        // Handle specific error cases
        if (err.status === 400) {
          if (err.message === "You are already following this user.") {
            toast.error("You are already following this user");
            setIsFollowing(true);
          } else if (err.message === "You are not following this user.") {
            toast.error("You are not following this user");
            setIsFollowing(false);
          } else {
            toast.error(err.message || "Something went wrong");
          }
        } else {
          toast.error(err.message || "Network error occurred");
        }
      })
      .finally(() => {
        setIsPingLoading(false);
      });
  };
  const getUserInfo = async () => {
    try {
      const { payload } = await dispatch(userDataInfo({ id: userId, token }));

      if (payload?.error === false) {
        setUserInfo(payload?.data);
      }
    } catch (error) { }
  };
  useEffect(() => {
    if (token) {
      getUserInfo();
    }
  }, []);
  // Debounced handlePingClick
  const debouncedHandlePingClick = useCallback(debounce(handlePingClick, 300), [
    token,
    loggedInUserId,
    userId,
    isPingLoading,
    dispatch,
  ]);

  if (businessLoading) return <div>Loading...</div>;
  if (businessError) return <div>Error: {businessError}</div>;
  if (!businessData) return <div>No user data found</div>;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const handleClick = (e) => {
    if (user?.isSubscribed === false) {
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
      if (businessData?.onboardingStatus === "pending") {
        showAlert("error", "Business account details are not available yet.");
      } else {
        navigate(
          `/makepaymnetfaceqr?businessid=${businessData?._id}&businessname=${businessData?.businessName}`
        );
      }
    }
  };

  const handleInternalShare = async (selectedUsers) => {
    if (selectedUsers.length === 0) return;

    const post = posts.find((p) => p._id === selectedSharePost?._id);
    if (!post) return;

    // Optimistically update share count
    const newShareCount = (post.shareCount || 0) + selectedUsers.length;
    console.log("newShareCount", newShareCount);

    dispatch(
      updatePost({
        postId: selectedSharePost._id,
        updates: {
          shareCount: newShareCount,
        },
      })
    );

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/shares/internal`,
        {
          link: selectedSharePost?.shareLink,
          postId: selectedSharePost?._id,
          sharedToUserId: selectedUsers,
        },
        { headers: { Authorization: `${token}` } }
      );

      if (response.status === 200 || response.data.error === false) {
        setIsInternalModalOpen(false);
        setSelectedSharePost(null);
      } else {
        // Revert on failure
        dispatch(
          updatePost({
            postId: selectedSharePost._id,
            updates: {
              shareCount: post.shareCount || 0,
            },
          })
        );
        toast.error(response.data.message || "Failed to share.");
      }
    } catch (err) {
      // Revert on error
      dispatch(
        updatePost({
          postId: selectedSharePost._id,
          updates: {
            shareCount: post.shareCount || 0,
          },
        })
      );
      toast.error(err.response?.data?.message || "Failed to share.");
    }
  };

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
                  <div className="profile-header">
                    <div className="row">
                      <div className="col-md-2">
                        <div className="profile-pic-wrap">
                          {businessData?.profilePicture ? (
                            <figure className="profile-image">
                              <img
                                src={`${businessData.profilePicture}`}
                                alt="Profile"
                                className="profile-img"
                              />
                            </figure>
                          ) : (
                            <div className="initial-circle">
                              <span>
                                {businessData?.businessName
                                  ? (() => {
                                    const nameParts =
                                      businessData.businessName
                                        .trim()
                                        .split(" ");
                                    const firstNameInitial =
                                      nameParts[0]
                                        ?.charAt(0)
                                        ?.toUpperCase() || "";
                                    const lastNameInitial =
                                      nameParts.length > 1
                                        ? nameParts[nameParts.length - 1]
                                          ?.charAt(0)
                                          ?.toUpperCase()
                                        : "";
                                    return (
                                      firstNameInitial + lastNameInitial ||
                                      "C"
                                    );
                                  })()
                                  : "C"}
                              </span>
                            </div>
                          )}
                          <span className="label">
                            {businessData?.role === "business"
                              ? businessData?.businessName
                              : `${businessData?.firstName || ""} ${businessData?.lastName || ""
                                }`.trim() || "Customer"}
                          </span>
                          <span className="label-business">
                            {businessData?.role === "business"
                              ? "Online business"
                              : "Customer"}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-10">
                        <div className="profile-header-info">
                          <div className="profile-info">
                            <big>{posts.length}</big>
                            <small>Qasts</small>
                          </div>
                          <div
                            className="profile-info"
                            role="button"
                            onClick={() =>
                              navigate(
                                `/pingers/${effectiveUserId}?tab=pinging`
                              )
                            }
                          >
                            {/* Use Redux values first, then fallback to local state */}
                            <big>{localFollowings}</big>
                            <small>Pinging</small>
                          </div>
                          <div
                            className="profile-info"
                            role="button"
                            onClick={() =>
                              navigate(
                                `/pingers/${effectiveUserId}?tab=pingers`
                              )
                            }
                          >
                            {/* Use Redux values first, then fallback to local state */}
                            <big>{localFollowers || 0}</big>
                            <small>Pingers</small>
                          </div>
                        </div>
                        <div className="btn-block">
                          <button
                            onClick={handlePingClick}
                            className={`btn ${isFollowing ? "btn-dark" : "btn-dark"
                              }`}
                            disabled={
                              isPingLoading || loggedInUserId === userId
                            }
                          >
                            {isPingLoading ? (
                              <>
                                <span
                                  className=""
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Loading...
                              </>
                            ) : loggedInUserId === userId ? (
                              "Your Profile"
                            ) : userInfo?.isFollowed ? (
                              "Unping"
                            ) : (
                              "Ping"
                            )}
                          </button>
                          <a
                            href={`/personalchat/${targetUserId}`}
                            className="btn btn-secondary"
                          >
                            Message
                          </a>
                        </div>
                        {/* //// */}
                        <div className="business-btns">
                          {user?.role !== "business" && (
                            <div className="btn-block">
                              <a
                                href="#"
                                className="btn btn-primary"
                                onClick={handleClick}
                              >
                                Pay
                              </a>
                            </div>
                          )}
                          <div
                            className={
                              user?.role !== "business"
                                ? "business-profile-discount "
                                : "business-profile-discount full-width"
                            }
                          >
                            <span className="label">Offered Discount:</span>
                            <span className="gradient-text">
                              {businessData?.discountPercentage
                                ? `${businessData.discountPercentage}%`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="btn-block">
                          <a
                            href="#"
                            className="btn btn-dark"
                            data-bs-toggle="modal"
                            data-bs-target="#moreinfopopup"
                            onClick={handleMoreInfo}
                          >
                            More Info
                          </a>
                          {/* {showModal && (
                            <Moreinfo
                              onClose={handleClose}
                              businessData={selectedBusiness}
                            />
                          )} */}
                          <Moreinfo
                            onClose={handleClose}
                            businessData={selectedBusiness}
                          />
                          <button
                            onClick={() => setIsLocationModalOpen(true)}
                            className="btn btn-secondary gradient-btn"
                          >
                            <i className="map-icon" />
                            Map
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="profile-tab-wrapper business-profile-tabs">
                    <nav>
                      <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <button
                          className={`nav-link ${activeTab === "qast" ? "active" : ""
                            }`}
                          id="nav-qasts-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-qasts"
                          type="button"
                          role="tab"
                          aria-controls="nav-qasts"
                          aria-selected={activeTab === "qast"}
                          onClick={() => handleTabChange("qast")}
                        >
                          Qasts
                        </button>
                        <button
                          className={`nav-link ${activeTab === "video" ? "active" : ""
                            }`}
                          id="nav-video-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-video"
                          type="button"
                          role="tab"
                          aria-controls="nav-video"
                          aria-selected={activeTab === "video"}
                          onClick={() => handleTabChange("video")}
                        >
                          Videos
                        </button>
                        <button
                          className={`nav-link ${activeTab === "photo" ? "active" : ""
                            }`}
                          id="nav-photo-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-photo"
                          type="button"
                          role="tab"
                          aria-controls="nav-photo"
                          aria-selected={activeTab === "photo"}
                          onClick={() => handleTabChange("photo")}
                        >
                          Photos
                        </button>
                        <button
                          className={`nav-link ${activeTab === "tag" ? "active" : ""
                            }`}
                          id="nav-tag-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-tag"
                          type="button"
                          role="tab"
                          aria-controls="nav-tag"
                          aria-selected={activeTab === "tag"}
                          onClick={() => handleTabChange("tag")}
                        >
                          Tagged
                        </button>
                      </div>
                    </nav>
                    <div className="tab-content" id="nav-tabContent">
                      <div
                        className={`tab-pane fade ${activeTab === "qast" ? "show active" : ""
                          }`}
                        id="nav-qasts"
                        role="tabpanel"
                        aria-labelledby="nav-qasts-tab"
                        tabIndex={0}
                      >
                        {posts.map((post, index) => (
                          <div
                            key={post._id}
                            ref={
                              index === posts.length - 1 ? lastItemRef : null
                            }
                            className="tab-profile-content"
                          >
                            <div className="tab-profile-header">
                              <div className="tab-profile-pic-wrap">
                                <div className="tab-profile">
                                  <a href="">
                                    {businessData?.profilePicture ? (
                                      <figure>
                                        <img
                                          src={`${businessData.profilePicture}`}
                                          alt="Profile"
                                          className="profile-img"
                                        />
                                      </figure>
                                    ) : (
                                      <div className="initial-circle">
                                        <span>
                                          {businessData?.role === "business"
                                            ? (() => {
                                              const nameParts =
                                                businessData?.businessName
                                                  ?.trim()
                                                  .split(" ") || [];
                                              const firstNameInitial =
                                                nameParts[0]
                                                  ?.charAt(0)
                                                  ?.toUpperCase() || "";
                                              const lastNameInitial =
                                                nameParts.length > 1
                                                  ? nameParts[
                                                    nameParts.length - 1
                                                  ]
                                                    ?.charAt(0)
                                                    ?.toUpperCase()
                                                  : "";
                                              return (
                                                firstNameInitial +
                                                lastNameInitial || "C"
                                              );
                                            })()
                                            : (() => {
                                              const firstInitial =
                                                businessData?.firstName
                                                  ?.charAt(0)
                                                  ?.toUpperCase() || "";
                                              const lastInitial =
                                                businessData?.lastName
                                                  ?.charAt(0)
                                                  ?.toUpperCase() || "";
                                              return (
                                                firstInitial + lastInitial ||
                                                "C"
                                              );
                                            })()}
                                        </span>
                                      </div>
                                    )}
                                    <span>
                                      {businessData?.role === "business"
                                        ? businessData?.businessName
                                        : `${businessData?.firstName || ""} ${businessData?.lastName || ""
                                          }`.trim() || "Customer"}
                                    </span>
                                  </a>
                                </div>
                                <div className="more-dropdown">
                                  <div className="more-dropdown dropdown">
                                    <button
                                      className="dropdown-toggle btn btn-link"
                                      type="button"
                                      onClick={() => {
                                        toggleDropdown(post._id);
                                      }}
                                    >
                                      <img src={moreicon} alt="" />
                                    </button>
                                    {activeDropdown === post._id && (
                                      <ul className="custom-dropdown-menu">
                                        <li>
                                          <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleReportClick(post._id);
                                              setActiveDropdown(null);
                                            }}
                                          >
                                            Report User
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleSave(post._id);
                                              setActiveDropdown(null); // <-- close dropdown
                                            }}
                                          >
                                            Save Qast
                                          </a>
                                        </li>
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {post.media && post.media.length > 0 ? (
                              <div className="slider-wrapper">
                                <div className="swiper mySwiper">
                                  <div className="swiper-wrapper">
                                    {post.media.map((media, mediaIndex) => (
                                      <div
                                        key={mediaIndex}
                                        className="swiper-slide"
                                      >
                                        {isImage(media.url) ? (
                                          <img src={`${media.url}`} alt="" />
                                        ) : isVideo(media.url) ? (
                                          <video controls autoPlay muted

                                            disablePictureInPicture
                                            controlsList="nofullscreen nodownload noplaybackrate"
                                          >
                                            <source src={`${media.url}`} />
                                          </video>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="swiper-pagination" />
                                </div>
                              </div>
                            ) : post.content ? (
                              <div
                                className="post-content"
                                dangerouslySetInnerHTML={{
                                  __html: post.content.replace(/\n/g, "<br />"),
                                }}
                              />
                            ) : null}
                            <div className="tab-profile-footer">
                              <div className="row">
                                <div className="tab-profile-icons-row">
                                  <div className="profile-icons-left">
                                    <ul className="tab-profile-icons">
                                      <li>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleLike(post._id);
                                          }}
                                        >
                                          <i>
                                            <img
                                              src={
                                                post.isPostLike
                                                  ? redlike
                                                  : favoriteicon
                                              }
                                              alt="like"
                                            />
                                          </i>
                                          <span>
                                            {post.likesCount ||
                                              0}
                                          </span>
                                        </a>
                                      </li>
                                      <li>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleOpenCommentSection(post._id);
                                          }}
                                        >
                                          <i>
                                            <img
                                              src={headercommenticon}
                                              alt="comment icon"
                                            />
                                          </i>
                                          <span>{post.commentsCount || 0}</span>
                                        </a>
                                      </li>
                                      <li>
                                        <a
                                          href="#"
                                          // onClick={(e) => {
                                          //   e.preventDefault();
                                          //   // toggleShareDropdown(post._id);
                                          //   setSelectedSharePost(post);
                                          //   setIsShareModalOpen(true);
                                          // }}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedSharePost(post);
                                            setIsSelectShareOpen(true);
                                          }}
                                        >
                                          <i>
                                            <img src={shareicon} alt="Share" />
                                          </i>
                                          <span>{post.shareCount ?? 0}</span>
                                        </a>
                                        {openSharePostId === post._id && (
                                          <div
                                            className="share-dropdown"
                                            style={{
                                              position: "absolute",
                                              display: "flex",
                                              gap: "10px",
                                              marginTop: "5px",
                                              background: "white",
                                              padding: "10px",
                                              borderRadius: "8px",
                                              boxShadow:
                                                "0 2px 8px rgba(0,0,0,0.1)",
                                              zIndex: 1000,
                                              left: 0,
                                            }}
                                          >
                                            <button
                                              onClick={() =>
                                                handleExternalShare(
                                                  post._id,
                                                  "whatsapp"
                                                )
                                              }
                                              style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                              }}
                                            >
                                              <FaWhatsapp
                                                size={24}
                                                color="#25D366"
                                              />
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleExternalShare(
                                                  post._id,
                                                  "facebook"
                                                )
                                              }
                                              style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                              }}
                                            >
                                              <FaFacebookF
                                                size={24}
                                                color="#1877F2"
                                              />
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleExternalShare(
                                                  post._id,
                                                  "twitter"
                                                )
                                              }
                                              style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                              }}
                                            >
                                              <FaTwitter
                                                size={24}
                                                color="#1DA1F2"
                                              />
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleExternalShare(
                                                  post._id,
                                                  "telegram"
                                                )
                                              }
                                              style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                              }}
                                            >
                                              <FaTelegramPlane
                                                size={24}
                                                color="#0088cc"
                                              />
                                            </button>
                                          </div>
                                        )}
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="profile-icons-right">
                                    <ul className="tab-profile-icons">
                                      <li>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleSave(post._id);
                                          }}
                                        >
                                          <i>
                                            <img
                                              src={
                                                post.isPostSave
                                                  ? saveblack
                                                  : saveiconblack
                                              }
                                              alt="save"
                                            />
                                          </i>
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="tab-profile-text">
                                    <p>{post.text}</p>
                                    <time className="date">
                                      {new Date(
                                        post.createdAt
                                      ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </time>{" "}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {postsLoading && <p>Loading more...</p>}
                        {postsError && <p>Error: {postsError}</p>}
                        {posts.length === 0 && !postsLoading && (
                          <p>No posts available</p>
                        )}
                      </div>
                      <div
                        className={`tab-pane fade ${activeTab === "video" ? "show active" : ""
                          }`}
                        id="nav-video"
                        role="tabpanel"
                        aria-labelledby="nav-video-tab"
                        tabIndex={0}
                      >
                        {posts
                          .filter((post) =>
                            post.media.some((media) => isVideo(media.url))
                          )
                          .map((post, index) => (
                            <div
                              key={post._id}
                              ref={
                                index === posts.length - 1 ? lastItemRef : null
                              }
                              className="tab-profile-content"
                            >
                              <div className="tab-profile-header">
                                <div className="tab-profile-pic-wrap">
                                  <div className="tab-profile">
                                    <a href={`/commanuserprofile/${post?.user?._id}`}>
                                      {businessData?.profilePicture ? (
                                        <figure>
                                          <img
                                            src={`${businessData.profilePicture}`}
                                            alt="Profile"
                                            className="profile-img"
                                          />
                                        </figure>
                                      ) : (
                                        <div className="initial-circle">
                                          <span>
                                            {businessData?.role === "business"
                                              ? (() => {
                                                const nameParts =
                                                  businessData?.businessName
                                                    ?.trim()
                                                    .split(" ") || [];
                                                const firstNameInitial =
                                                  nameParts[0]
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "";
                                                const lastNameInitial =
                                                  nameParts.length > 1
                                                    ? nameParts[
                                                      nameParts.length - 1
                                                    ]
                                                      ?.charAt(0)
                                                      ?.toUpperCase()
                                                    : "";
                                                return (
                                                  firstNameInitial +
                                                  lastNameInitial || "C"
                                                );
                                              })()
                                              : (() => {
                                                const firstInitial =
                                                  businessData?.firstName
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "";
                                                const lastInitial =
                                                  businessData?.lastName
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "";
                                                return (
                                                  firstInitial +
                                                  lastInitial || "C"
                                                );
                                              })()}
                                          </span>
                                        </div>
                                      )}
                                      <span>
                                        {businessData?.role === "business"
                                          ? businessData?.businessName
                                          : `${businessData?.firstName || ""} ${businessData?.lastName || ""
                                            }`.trim() || "Customer"}
                                      </span>
                                    </a>
                                  </div>
                                  <div className="more-dropdown">
                                    <div className="more-dropdown dropdown">
                                      <button
                                        className="dropdown-toggle btn btn-link"
                                        type="button"
                                        onClick={() => toggleDropdown(post._id)}
                                      >
                                        <img src={moreicon} alt="" />
                                      </button>
                                      {activeDropdown === post._id && (
                                        <ul className="custom-dropdown-menu">
                                          <li>
                                            <a
                                              className="dropdown-item"
                                              href="#"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleReportClick(post._id);
                                                setActiveDropdown(null);
                                              }}
                                            >
                                              Report User
                                            </a>
                                          </li>
                                          <li>
                                            <a
                                              className="dropdown-item"
                                              href="#"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleSave(post._id);
                                                setActiveDropdown(null);
                                              }}
                                            >
                                              Save Qast
                                            </a>
                                          </li>
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="slider-wrapper">
                                <div className="swiper mySwiper">
                                  <div className="swiper-wrapper">
                                    {post.media
                                      .filter((media) => isVideo(media.url))
                                      .map((media, mediaIndex) => (
                                        <div
                                          key={mediaIndex}
                                          className="swiper-slide"
                                        >
                                          <video controls autoPlay muted>
                                            <source src={`${media.url}`} />
                                          </video>
                                        </div>
                                      ))}
                                  </div>
                                  <div className="swiper-pagination" />
                                </div>
                              </div>
                              <div className="tab-profile-footer">
                                <div className="row">
                                  <div className="tab-profile-icons-row">
                                    <div className="profile-icons-left">
                                      <ul className="tab-profile-icons">
                                        <li>
                                          <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleLike(post._id);
                                            }}
                                          >
                                            <i>
                                              <img
                                                src={
                                                  post.isPostLike
                                                    ? redlike
                                                    : favoriteicon
                                                }
                                                alt="like"
                                              />
                                            </i>
                                            <span>
                                              {post.likesCount || 0}
                                            </span>
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleOpenCommentSection(post._id);
                                            }}
                                          >
                                            <i>
                                              <img
                                                src={headercommenticon}
                                                alt="comment icon"
                                              />
                                            </i>
                                            <span>{post.commentsCount || 0}</span>
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setSelectedSharePost(post);
                                              setIsSelectShareOpen(true);
                                            }}
                                          >
                                            <i>
                                              <img src={shareicon} alt="Share" />
                                            </i>
                                            <span>{post.shareCount ?? 0}</span>
                                          </a>
                                        </li>
                                      </ul>
                                    </div>
                                    <div className="profile-icons-right">
                                      <ul className="tab-profile-icons">
                                        <li>
                                          <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleSave(post._id);
                                            }}
                                          >
                                            <i>
                                              <img
                                                src={
                                                  post.isPostSave
                                                    ? saveblack
                                                    : saveiconblack
                                                }
                                                alt="save"
                                              />
                                            </i>
                                          </a>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="tab-profile-text">
                                      <p>{post.text}</p>
                                      <time className="date">
                                        {new Date(
                                          post.createdAt
                                        ).toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        })}
                                      </time>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        {postsLoading && <p>Loading more...</p>}
                        {postsError && <p>Error: {postsError}</p>}
                        {posts.filter((post) =>
                          post.media.some((media) => isVideo(media.url))
                        ).length === 0 &&
                          !postsLoading && <p>No videos available</p>}
                      </div>

                      {/* Photos Tab */}
                      <div
                        className={`tab-pane fade ${activeTab === "photo" ? "show active" : ""
                          }`}
                        id="nav-photo"
                        role="tabpanel"
                        aria-labelledby="nav-photo-tab"
                        tabIndex={0}
                      >
                        {posts
                          .filter((post) =>
                            post.media.some((media) => isImage(media.url))
                          )
                          .map((post, index) => (
                            <div
                              key={post._id}
                              ref={
                                index === posts.length - 1 ? lastItemRef : null
                              }
                              className="tab-profile-content"
                            >
                              <div className="tab-profile-header">
                                <div className="tab-profile-pic-wrap">
                                  <div className="tab-profile">
                                    <a href={`/commanuserprofile/${post?.user?._id}`}>
                                      {businessData?.profilePicture ? (
                                        <figure>
                                          <img
                                            src={`${businessData.profilePicture}`}
                                            alt="Profile"
                                            className="profile-img"
                                          />
                                        </figure>
                                      ) : (
                                        <div className="initial-circle">
                                          <span>
                                            {businessData?.role === "business"
                                              ? (() => {
                                                const nameParts =
                                                  businessData?.businessName
                                                    ?.trim()
                                                    .split(" ") || [];
                                                const firstNameInitial =
                                                  nameParts[0]
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "";
                                                const lastNameInitial =
                                                  nameParts.length > 1
                                                    ? nameParts[
                                                      nameParts.length - 1
                                                    ]
                                                      ?.charAt(0)
                                                      ?.toUpperCase()
                                                    : "";
                                                return (
                                                  firstNameInitial +
                                                  lastNameInitial || "C"
                                                );
                                              })()
                                              : (() => {
                                                const firstInitial =
                                                  businessData?.firstName
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "";
                                                const lastInitial =
                                                  businessData?.lastName
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "";
                                                return (
                                                  firstInitial +
                                                  lastInitial || "C"
                                                );
                                              })()}
                                          </span>
                                        </div>
                                      )}
                                      <span>
                                        {businessData?.role === "business"
                                          ? businessData?.businessName
                                          : `${businessData?.firstName || ""} ${businessData?.lastName || ""
                                            }`.trim() || "Customer"}
                                      </span>
                                    </a>
                                  </div>
                                  <div className="more-dropdown">
                                    <div className="more-dropdown dropdown">
                                      <button
                                        className="dropdown-toggle btn btn-link"
                                        type="button"
                                        onClick={() => toggleDropdown(post._id)}
                                      >
                                        <img src={moreicon} alt="" />
                                      </button>
                                      {activeDropdown === post._id && (
                                        <ul className="custom-dropdown-menu">
                                          <li>
                                            <a
                                              className="dropdown-item"
                                              href="#"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleReportClick(post._id);
                                                setActiveDropdown(null);
                                              }}
                                            >
                                              Report User
                                            </a>
                                          </li>
                                          <li>
                                            <a
                                              className="dropdown-item"
                                              href="#"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleSave(post._id);
                                                setActiveDropdown(null);
                                              }}
                                            >
                                              Save Qast
                                            </a>
                                          </li>
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="slider-wrapper">
                                <div className="swiper mySwiper">
                                  <div className="swiper-wrapper">
                                    {post.media
                                      .filter((media) => isImage(media.url))
                                      .map((media, mediaIndex) => (
                                        <div
                                          key={mediaIndex}
                                          className="swiper-slide"
                                        >
                                          <img src={`${media.url}`} alt="" />
                                        </div>
                                      ))}
                                  </div>
                                  <div className="swiper-pagination" />
                                </div>
                              </div>
                              <div className="tab-profile-footer">
                                <div className="row">
                                  <div className="tab-profile-icons-row">
                                    <div className="profile-icons-left">
                                      <ul className="tab-profile-icons">
                                        <li>
                                          <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleLike(post._id);
                                            }}
                                          >
                                            <i>
                                              <img
                                                src={
                                                  post.isPostLike
                                                    ? redlike
                                                    : favoriteicon
                                                }
                                                alt="like"
                                              />
                                            </i>
                                            <span>
                                              {post.likesCount || 0}
                                            </span>
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleOpenCommentSection(post._id);
                                            }}
                                          >
                                            <i>
                                              <img
                                                src={headercommenticon}
                                                alt="comment icon"
                                              />
                                            </i>
                                            <span>{post.commentsCount || 0}</span>
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setSelectedSharePost(post);
                                              setIsSelectShareOpen(true);
                                            }}
                                          >
                                            <i>
                                              <img src={shareicon} alt="Share" />
                                            </i>
                                            <span>{post.shareCount ?? 0}</span>
                                          </a>
                                        </li>
                                      </ul>
                                    </div>
                                    <div className="profile-icons-right">
                                      <ul className="tab-profile-icons">
                                        <li>
                                          <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleSave(post._id);
                                            }}
                                          >
                                            <i>
                                              <img
                                                src={
                                                  post.isPostSave
                                                    ? saveblack
                                                    : saveiconblack
                                                }
                                                alt="save"
                                              />
                                            </i>
                                          </a>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="tab-profile-text">
                                      <p>{post.text}</p>
                                      <time className="date">
                                        {new Date(
                                          post.createdAt
                                        ).toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        })}
                                      </time>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        {postsLoading && <p>Loading more...</p>}
                        {postsError && <p>Error: {postsError}</p>}
                        {posts.filter((post) =>
                          post.media.some((media) => isImage(media.url))
                        ).length === 0 &&
                          !postsLoading && <p>No photos available</p>}
                      </div>

                      {/* Tagged Tab */}
                      <div
                        className={`tab-pane fade ${activeTab === "tag" ? "show active" : ""
                          }`}
                        id="nav-tag"
                        role="tabpanel"
                        aria-labelledby="nav-tag-tab"
                        tabIndex={0}
                      >
                        {posts.map((post, index) => (
                          <div
                            key={post._id}
                            ref={
                              index === posts.length - 1 ? lastItemRef : null
                            }
                            className="tab-profile-content"
                          >
                            <div className="tab-profile-header">
                              <div className="tab-profile-pic-wrap">
                                <div className="tab-profile">
                                  <a
                                    href={
                                      post?.user?._id === authUserId
                                        ? "/profile"
                                        : `/commanuserprofile/${post?.user?._id}`
                                    }

                                  >

                                    {post?.user?.profilePicture ? (
                                      <figure>
                                        <img
                                          src={`${post.user.profilePicture}`}
                                          alt="Profile"
                                          className="profile-img"
                                        />
                                      </figure>
                                    ) : (
                                      <div className="initial-circle">
                                        <span>
                                          {post?.user?.role === "business"
                                            ? (() => {
                                              const nameParts =
                                                post?.user?.businessName
                                                  ?.trim()
                                                  .split(" ") || [];
                                              const firstNameInitial =
                                                nameParts[0]
                                                  ?.charAt(0)
                                                  ?.toUpperCase() || "";
                                              const lastNameInitial =
                                                nameParts.length > 1
                                                  ? nameParts[
                                                    nameParts.length - 1
                                                  ]
                                                    ?.charAt(0)
                                                    ?.toUpperCase()
                                                  : "";
                                              return (
                                                firstNameInitial +
                                                lastNameInitial || "C"
                                              );
                                            })()
                                            : (() => {
                                              const firstInitial =
                                                post?.user?.firstName
                                                  ?.charAt(0)
                                                  ?.toUpperCase() || "";
                                              const lastInitial =
                                                post?.user?.lastName
                                                  ?.charAt(0)
                                                  ?.toUpperCase() || "";
                                              return (
                                                firstInitial + lastInitial ||
                                                "C"
                                              );
                                            })()}
                                        </span>
                                      </div>
                                    )}
                                    <span>
                                      {post?.user?.role === "business"
                                        ? post?.user?.businessName
                                        : `${post?.user?.firstName || ""} ${post?.user?.lastName || ""
                                          }`.trim() || "Customer"}
                                    </span>
                                  </a>
                                </div>
                                <div className="more-dropdown">
                                  <div className="more-dropdown dropdown">
                                    <button
                                      className="dropdown-toggle btn btn-link"
                                      type="button"
                                      onClick={() => toggleDropdown(post._id)}
                                    >
                                      <img src={moreicon} alt="" />
                                    </button>
                                    {activeDropdown === post._id && (
                                      <ul className="custom-dropdown-menu">
                                        <li>
                                          <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleReportClick(post._id);
                                              setActiveDropdown(null);
                                            }}
                                          >
                                            Report User
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleSave(post._id);
                                              setActiveDropdown(null);
                                            }}
                                          >
                                            Save Qast
                                          </a>
                                        </li>
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {post.media && post.media.length > 0 ? (
                              <div className="slider-wrapper tab-slider">
                                <div className="swiper mySwiper">
                                  <div className="swiper-wrapper">
                                    {post.media.map((media, mediaIndex) => (
                                      <div
                                        key={mediaIndex}
                                        className="swiper-slide"
                                      >
                                        {isImage(media.url) ? (
                                          <img src={`${media.url}`} alt="" />
                                        ) : isVideo(media.url) ? (
                                          <video controls autoPlay muted>
                                            <source src={`${media.url}`} />
                                          </video>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="swiper-pagination" />
                                </div>
                              </div>
                            ) : post.content ? (
                              <div
                                className="post-content"
                                dangerouslySetInnerHTML={{
                                  __html: post.content.replace(/\n/g, "<br />"),
                                }}
                              />
                            ) : null}
                            <div className="tab-profile-footer">
                              <div className="row">
                                <div className="tab-profile-icons-row">
                                  <div className="profile-icons-left">
                                    <ul className="tab-profile-icons">
                                      <li>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleLike(post._id);
                                          }}
                                        >
                                          <i>
                                            <img
                                              src={
                                                post.isPostLike
                                                  ? redlike
                                                  : favoriteicon
                                              }
                                              alt="like"
                                            />
                                          </i>
                                          <span>
                                            {post.likesCount || 0}
                                          </span>
                                        </a>
                                      </li>
                                      <li>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleOpenCommentSection(post._id);
                                          }}
                                        >
                                          <i>
                                            <img
                                              src={headercommenticon}
                                              alt="comment icon"
                                            />
                                          </i>
                                          <span>{post.commentsCount || 0}</span>
                                        </a>
                                      </li>
                                      <li>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedSharePost(post);
                                            setIsSelectShareOpen(true);
                                          }}
                                        >
                                          <i>
                                            <img src={shareicon} alt="Share" />
                                          </i>
                                          <span>{post.shareCount ?? 0}</span>
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="profile-icons-right">
                                    <ul className="tab-profile-icons">
                                      <li>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleSave(post._id);
                                          }}
                                        >
                                          <i>
                                            <img
                                              src={
                                                post.isPostSave
                                                  ? saveblack
                                                  : saveiconblack
                                              }
                                              alt="save"
                                            />
                                          </i>
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="col-md-12">
                                  <div className="tab-profile-text">
                                    <p>{post.text}</p>
                                    <time className="date">
                                      {new Date(
                                        post.createdAt
                                      ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {postsLoading && <p>Loading more...</p>}
                        {postsError && <p>Error: {postsError}</p>}
                        {posts.length === 0 && !postsLoading && (
                          <p>No posts available</p>
                        )}
                      </div>
                      <div
                        className={`tab-pane fade ${activeTab === "pinging" ? "show active" : ""
                          }`}
                        id="nav-pinging"
                        role="tabpanel"
                        aria-labelledby="nav-pinging-tab"
                        tabIndex={0}
                      >
                        {pinging.map((user, index) => (
                          <div
                            key={user._id}
                            ref={
                              index === pinging.length - 1 ? lastItemRef : null
                            }
                            className="tab-profile-content"
                          >
                            <div className="tab-profile-header">
                              <div className="tab-profile-pic-wrap">
                                <div className="tab-profile">
                                  <a href={`/profile/${user._id}`}>
                                    <figure>
                                      <img
                                        src={`${user.profilePicture || profilepic
                                          }`}
                                        alt=""
                                      />
                                    </figure>
                                    <span>
                                      {user.role === "business"
                                        ? user.businessName
                                        : `${user.firstName || ""} ${user.lastName || ""
                                          }`.trim() || "User"}
                                    </span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {followersLoading && <p>Loading more...</p>}
                        {followersError && <p>Error: {followersError}</p>}
                        {pinging.length === 0 && !followersLoading && (
                          <p>No pinging users available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {showReportModal && (
        <ReportPostModal
          onClose={() => setShowReportModal(false)}
          onSubmit={({ reason, additionalDetails }) => {
            if (!reportPostId || !reason || !token) {
              return;
            }
            // Find the post to get the reportedUserId
            const post = posts.find((p) => p._id === reportPostId);
            if (!post || !post.user || !post.user._id) {
              return;
            }
            dispatch(
              reportPost({
                reportedUserId: post.user._id, // Use the user ID from the post
                reason,
                additionalDetails,
                token,
              })
            );
            toast.success("Report submitted successfully");
            setShowReportModal(false);
          }}
          reason={reason}
          setReason={setReason}
          additionalDetails={additionalDetails}
          setAdditionalDetails={setAdditionalDetails}
        />
      )}
      <CommentModal
        postId={selectedCommentPostId}
        token={token}
        isOpen={isCommentModalOpen}
        onClose={handleCommentModalClose}
      />
      <SelectShareModal
        isOpen={isSelectShareOpen}
        onClose={() => setIsSelectShareOpen(false)}
        onSelectOption={handleSelectOption}
        post={selectedSharePost}
      />
      <InternalShareModal
        isOpen={isInternalModalOpen}
        post={selectedSharePost}
        postLink={selectedSharePost?.shareLink}
        onClose={() => setIsInternalModalOpen(false)}
        onShare={handleInternalShare}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        post={selectedSharePost}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedSharePost(null);
        }}
        onShare={handleExternalShare}
      />
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        businessData={businessData}
      />
    </div>
  );
};

export default Commanuserviewbusiness;