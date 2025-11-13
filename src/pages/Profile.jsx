import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  saveicon,
  profilepic,
  moreicon,
  slideimg1,
  favoriteicon,
  shareicon,
  headercommenticon,
  saveiconblack,
  redlike,
  saveblack,
} from "../imaUrl";
import ProfileHeader from "../components/ProfileHeader";
import Sidebar from "../components/Sidebar";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, getProfile } from "../feature/profileSlice";
import { getMyPosts, updatePost } from "../feature/mypostSlice";
import { savePost } from "../feature/homePage/saveSlice";
import SelectShareModal from "../model/SelectShareModal";
import InternalShareModal from "../model/InternalShareModal";
import {
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaTelegramPlane,
} from "react-icons/fa";
import Loader from "../components/Loader";
import { likePost } from "../feature/homePage/likeSlice";
import { getComments, postComment } from "../feature/commentSlice";
import { sharePost } from "../feature/homePage/postShareSlice";
import ReportPostModal from "../model/ReportModel";
import CommentModal from "../model/CommentModel";
import { reportPost } from "../feature/homePage/reportSlice";
import { debounce } from "lodash";
import { fetchMyBusinessPosts } from "../feature/mybusinesspostSlice";
import ShareModal from "../model/ShareModal";
import { toast } from "react-toastify";
import { deleteQastData } from "../feature/addpostSlice";
import { showAlert, showPayAlert } from "../utils/swalHelper";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isCardAdded, isSubscribed } = useSelector(
    (state) => state?.auth?.user
  );
  const [profile, setProfile] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showShareOptions, setShowShareOptions] = useState({});
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [likeStates, setLikeStates] = useState({});
  const [openSharePostId, setOpenSharePostId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const report = useSelector((state) => state.report);
  const [loader, setLoader] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [reason, setReason] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const observer = useRef();
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSelectShareOpen, setIsSelectShareOpen] = useState(false);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  const toggleShareDropdown = (postId) => {
    setOpenSharePostId(openSharePostId === postId ? null : postId);
  };
  const [showModal, setShowModal] = useState(false);

  // Access profile, posts, and followers from Redux
  const {
    user,
    error: profileError,
    loading: profileLoading,
  } = useSelector((state) => state.profile || {});

  const {
    posts = [],
    totalPages = 1,
    currentPage = 1,
    loading = false,
    error: profilePostsError,
  } = useSelector((state) => state.profilePosts || {});

  const {
    totalItems,
    totalFollowers,
    totalFollowings,
    shareCount,
    loading: postsLoading,
    error: postsError,
  } = useSelector((state) => state.mybusinessposts || {});

  const token =
    useSelector((state) => state.auth?.token) || localStorage.getItem("token");
  const userId = localStorage.getItem("userId") || user?._id;

  useEffect(() => {
    setProfile(localStorage.getItem("profile"));
  }, []);

  const getProfileInfo = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await dispatch(getProfile(token)).unwrap();
    } catch (error) {
      console.error("Error fetching profile:", error);
      navigate("/login"); // Redirect to login on error
    }
  };

  const handleSelectOption = (option) => {
    setIsSelectShareOpen(false);
    if (option === "external") {
      setIsShareModalOpen(true);
    } else if (option === "internal") {
      setIsInternalModalOpen(true);
    }
  };

  useEffect(() => {
    if (token && userId) {
      getProfileInfo();
      dispatch(
        fetchMyBusinessPosts({ userId, page: 1, limit: 10, type: "all" })
      );
    } else {
      console.warn("Waiting for token and userId", { token, userId });
    }
  }, [token, userId, dispatch]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || isFetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setIsFetchingMore(true);
          dispatch(
            getMyPosts({
              token,
              page: currentPage + 1,
              type: activeTab,
              limit: 10,
            })
          )
            .unwrap()
            .then((payload) => {
              setIsFetchingMore(false);
            })
            .catch((err) => {
              console.error(
                `Error fetching more posts for page ${currentPage + 1}:`,
                err
              );
              setIsFetchingMore(false);
            });
        }
      });
      if (node) observer.current.observe(node);
    },
    [
      loading,
      isFetchingMore,
      currentPage,
      totalPages,
      activeTab,
      token,
      dispatch,
    ]
  );

  // const handleExternalShare = (postId, platform) => {
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
  //       toast.error(err.message);
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

  const handleReportClick = (postId) => {
    setReportPostId(postId);
    setShowReportModal(true);
  };

  const commentRef = useRef(null);

  const deleteQast = async (id) => {
    try {
      if (token) {
        const { payload } = await dispatch(
          deleteQastData({ id, token, setLoader })
        );

        if (payload?.error === false) {
          getMyPost();
          setLoader(false);
        }
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
    }
  };

  // Check if current path is "/profile"
  const isProfilePage = location.pathname === "/profile";

  const renderPost = (post, index) => {
    const isLastElement = index === posts.length - 1;
    const mediaToRender = post.media || [];

    let renderedMedia = [];
    if (activeTab === "all") {
      renderedMedia = mediaToRender;
    } else if (activeTab === "video") {
      renderedMedia = mediaToRender.filter((m) =>
        m.url.match(/\.(mp4|webm|ogg)$/i)
      );
    } else if (activeTab === "image") {
      renderedMedia = mediaToRender.filter((m) =>
        m.url.match(/\.(webp|jpg|jpeg|png|gif)$/i)
      );
    }

    return (
      <div
        className="tab-profile-content"
        key={post._id}
        ref={isLastElement ? lastPostElementRef : null}
      >
        <div className="tab-profile-header">
          <div className="tab-profile-pic-wrap">
            <div className="tab-profile">
              <Link>
                <figure>
                  <img
                    src={
                      user?.profilePicture
                        ? `${user.profilePicture}`
                        : profilepic
                    }
                    alt="Profile"
                  />
                </figure>
                <span>
                  {user?.businessName?.trim()
                    ? user.businessName
                    : `${user?.firstName || "Adam"} ${user?.lastName || "R."}`}
                </span>
              </Link>
            </div>
            <div className="more-dropdown">
              <button
                className="dropdown-toggle btn btn-link"
                type="button"
                onClick={() => {
                  toggleDropdown(post?._id);
                }}
              >
                <img src={moreicon} alt="" />
              </button>
              {activeDropdown === post._id && (
                <ul className="custom-dropdown-menu">
                  <li>
                    <a
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteQast(post?._id);
                        setActiveDropdown(null);
                      }}
                    >
                      Delete
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="slider-wrapper">
          <div className="swiper mySwiper">
            <div className="swiper-wrapper">
              {renderedMedia && renderedMedia.length > 0 ? (
                renderedMedia.map((mediaItem, index) => {
                  const isVideo = mediaItem.url?.match(/\.(mp4|webm|ogg)$/i);
                  return (
                    <div className="swiper-slide" key={index}>
                      {isVideo ? (
                        <video
                          controls
                          width="100%"
                          playsInline
                          muted
                          disablePictureInPicture
                          controlsList="nofullscreen nodownload noplaybackrate"
                          poster={`${mediaItem?.thumbnail || ""}`}
                        >
                          <source src={`${mediaItem?.url}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img
                          src={`${mediaItem?.url}`}
                          alt="media"
                          width="100%"
                        />
                      )}
                    </div>
                  );
                })
              ) : post.content ? (
                <div className="swiper-slide">

                  <div
                    className="post-content"
                    dangerouslySetInnerHTML={{
                      __html: post.content.replace(/\n/g, "<br />"),
                    }}
                  />
                </div>
              ) : null}
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
                            likeStates[post._id]?.liked ? redlike : favoriteicon
                          }
                          alt="like"
                        />
                      </i>
                      <span>{likeStates[post._id]?.count ?? 0}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      // href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenCommentSection(post._id);
                      }}
                    >
                      <i>
                        <img src={headercommenticon} alt="comment icon" />
                      </i>
                      <span>{post.commentsCount || 0}</span>
                    </a>
                  </li>
                  <li style={{ position: "relative" }}>
                    <a
                      // href="#"
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
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          zIndex: 1000,
                          left: 0,
                        }}
                      >
                        <button
                          onClick={() =>
                            handleExternalShare(post._id, "whatsapp")
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <FaWhatsapp size={24} color="#25D366" />
                        </button>
                        <button
                          onClick={() =>
                            handleExternalShare(post._id, "facebook")
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <FaFacebookF size={24} color="#1877F2" />
                        </button>
                        <button
                          onClick={() =>
                            handleExternalShare(post._id, "twitter")
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <FaTwitter size={24} color="#1DA1F2" />
                        </button>
                        <button
                          onClick={() =>
                            handleExternalShare(post._id, "telegram")
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <FaTelegramPlane size={24} color="#0088cc" />
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
                            savedPosts.has(post._id) ? saveblack : saveiconblack
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
                <p>
                  {expandedPosts[post._id]
                    ? post.text
                    : truncateText(post.text)}
                  {post.text?.length > 110 && !expandedPosts[post._id] && (
                    <span
                      className="see-more"
                      style={{
                        color: "#282828",
                        cursor: "pointer",
                        marginLeft: "5px",
                        fontSize: "0.9rem",
                      }}
                      onClick={() => toggleSeeMore(post._id)}
                    >
                      See More
                    </span>
                  )}
                  {expandedPosts[post._id] && post.text?.length > 110 && (
                    <span
                      className="see-less"
                      style={{
                        color: "#282828",
                        cursor: "pointer",
                        marginLeft: "5px",
                        fontSize: "0.9rem",
                      }}
                      onClick={() => toggleSeeMore(post._id)}
                    >
                      See Less
                    </span>
                  )}
                </p>
                <time className="date">
                  {new Date(post.createdAt).toLocaleDateString("en-GB", {
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
    );
  };

  useEffect(() => {
    new Swiper(".mySwiper", {
      loop: true,
      pagination: { el: ".swiper-pagination", clickable: true },
    });
  }, [posts]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setShowShareOptions({});
  };

  useEffect(() => {
    if (posts.length > 0) {
      const updatedLikeStates = {};
      const savedSet = new Set();

      posts.forEach((post) => {
        updatedLikeStates[post._id] = {
          liked: post.isPostLike || false,
          count: post.likesCount || 0,
        };

        // Check if isPostSave exists and is true
        if (post.isPostSave) {
          savedSet.add(post._id);
        }
      });

      setLikeStates(updatedLikeStates);
      setSavedPosts(savedSet); // 🛠 set initial saved posts
    }
  }, [posts]);

  const handleLike = (postId) => {
    if (!token) {
      alert("Please login to like the post.");
      return;
    }

    const wasLiked = likeStates[postId]?.liked || false;
    const currentCount = likeStates[postId]?.count || 0;

    // Optimistically update UI
    const optimisticUpdate = {
      ...likeStates,
      [postId]: {
        liked: !wasLiked,
        count: wasLiked ? currentCount - 1 : currentCount + 1,
      },
    };
    setLikeStates(optimisticUpdate);

    // Dispatch like action to backend
    dispatch(likePost({ postId, token })).then((res) => {
      if (res.meta.requestStatus !== "fulfilled") {
        // Revert on failure
        setLikeStates((prev) => ({
          ...prev,
          [postId]: {
            liked: wasLiked,
            count: currentCount,
          },
        }));
        toast.error(res.payload?.message || "Failed to like post");
      }
    });
  };

  const handleSave = (postId) => {
    if (!token) {
      return alert("Please login to save the post.");
    }

    // Optimistically update savedPosts state
    setSavedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    // Dispatch savePost action
    dispatch(savePost({ postId, token }))
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          // Update the posts array in Redux
          const updatedPosts = posts.map((post) =>
            post._id === postId
              ? {
                ...post,
                media: post.media
                  ? [
                    {
                      ...post.media[0],
                      isPostSave: !post.media[0]?.isPostSave,
                    },
                    ...post.media.slice(1),
                  ]
                  : post.media,
              }
              : post
          );
          dispatch({ type: "profilePosts/setPosts", payload: updatedPosts });
        } else {
          // Revert savedPosts on failure
          setSavedPosts((prev) => {
            const newSet = new Set(prev);
            console.log("newSet", newSet);

            if (newSet.has(postId)) {
              newSet.delete(postId);
            } else {
              newSet.add(postId);
            }
            return newSet;
          });
        }
      })
      .catch((err) => {
        console.error("Error saving post:", err);
        setSavedPosts((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(postId)) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
        alert("Failed to save post.");
      });
  };

  const truncateText = (text, maxLength = 110) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Toggle "See More" for a specific post
  const toggleSeeMore = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleQrCode = () => {
    try {
      if (isSubscribed !== true) {
        return showPayAlert(
          "info",
          "You need an active subscription to access this page!"
        ).then((result) => {
          if (result.isConfirmed) {
            navigate("/subscription");
          }
        });
      }
      if (!isCardAdded) {
        return showAlert("error", "Add card first");
        // navigate("/scanface");
      }
      if (token) {
        navigate("/qr-scanner");
      } else {
        showAlert("error", "Please login first");
      }
    } catch (error) { }
  };

  const getMyPost = () => {
    const validTypes = ["all", "video", "image"];
    const normalizedType = validTypes.includes(activeTab) ? activeTab : "all";
    dispatch(getMyPosts({ token, page: 1, type: normalizedType, limit: 10 }))
      .unwrap()
      .then((payload) => {
      })
      .catch((err) =>
        console.error(`Error fetching posts for ${normalizedType}:`, err)
      );
  };

  useEffect(() => {
    // if (token) {
    getMyPost();
    // }
  }, [token, activeTab, dispatch, selectedCommentPostId]);

  const handleInternalShare = async (selectedUsers) => {
    if (selectedUsers.length === 0) return;

    const post = posts.find((p) => p._id === selectedSharePost?._id);
    if (!post) return;

    // Optimistically update share count
    const newShareCount = (post.shareCount || 0) + selectedUsers.length;

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
      {loader === true && <Loader />}
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
                          <Link className="thumb-picture">
                            {user?.profilePicture ? (
                              <img
                                src={`${user?.profilePicture
                                  }?t=${new Date().getTime()}`}
                                alt="Profile"
                              />
                            ) : (
                              <img src={profilepic} alt="Profile" />
                            )}
                          </Link>
                          <span className="label">
                            {user?.firstName?.charAt(0).toUpperCase() +
                              user?.firstName?.slice(1).toLowerCase()}{" "}
                            {user?.lastName?.charAt(0).toUpperCase() +
                              user?.lastName?.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-10">
                        <div className="profile-header-info">
                          <div className="profile-info">
                            <big>{posts.length || 0}</big>
                            <small>Qasts</small>
                          </div>
                          <div
                            className="profile-info"
                            role="button"
                            onClick={() => navigate("/pingers?tab=pinging")}
                          >
                            {postsLoading ? (
                              <small>Loading...</small>
                            ) : (
                              <>
                                <big>{totalFollowings || 0}</big>
                                <small>Pinging</small>
                              </>
                            )}
                          </div>
                          <div
                            className="profile-info"
                            role="button"
                            onClick={() => navigate("/pingers?tab=pingers")}
                          >
                            {postsLoading ? (
                              <small>Loading...</small>
                            ) : (
                              <>
                                <big>{totalFollowers || 0}</big>
                                <small>Pingers</small>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="btn-block">
                          <Link to="/editprofile" className="btn btn-dark">
                            View Account Detail{" "}
                            <i className="icon-right-white" />
                          </Link>

                          <button
                            className="btn btn-secondary"
                            onClick={handleQrCode}
                          >
                            Scan QR Code <i className="icon-right-black" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`profile-tab-wrapper ${!isProfilePage ? "business-profile-tabs" : ""
                      }`}
                  >
                    <nav>
                      <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <button
                          className={`nav-link ${activeTab === "all" ? "active" : ""
                            }`}
                          onClick={() => handleTabClick("all")}
                          type="button"
                          role="tab"
                          aria-controls="nav-qasts"
                          aria-selected={activeTab === "all"}
                        >
                          Qasts
                        </button>
                        <button
                          className={`nav-link ${activeTab === "video" ? "active" : ""
                            }`}
                          onClick={() => handleTabClick("video")}
                          type="button"
                          role="tab"
                          aria-controls="nav-video"
                          aria-selected={activeTab === "video"}
                        >
                          Videos
                        </button>
                        <button
                          className={`nav-link ${activeTab === "image" ? "active" : ""
                            }`}
                          onClick={() => handleTabClick("image")}
                          type="button"
                          role="tab"
                          aria-controls="nav-photo"
                          aria-selected={activeTab === "image"}
                        >
                          Photos
                        </button>
                      </div>
                    </nav>
                    <div className="tab-content" id="nav-tabContent">
                      <div
                        className={`tab-pane fade ${activeTab === "all" ? "show active" : ""
                          }`}
                        id="nav-qasts"
                        role="tabpanel"
                        aria-labelledby="nav-qasts-tab"
                        tabIndex={0}
                      >
                        {loading && <p>Loading posts...</p>}
                        {postsError && <p>Error: {postsError}</p>}
                        {/* {profilePostsError && <p>Error: {followersError}</p>} */}
                        {/* {posts.length > 0 ? posts.map((post, index) => renderPost(post, index)) : <p>No posts available</p>} */}

                        {posts.length > 0 ? (
                          posts.map((post, index) => renderPost(post, index))
                        ) : (
                          <p>No posts available</p>
                        )}

                        {isFetchingMore && <p>Loading more posts...</p>}
                      </div>
                      <div
                        className={`tab-pane fade ${activeTab === "video" ? "show active" : ""
                          }`}
                        id="nav-video"
                        role="tabpanel"
                        aria-labelledby="nav-video-tab"
                        tabIndex={0}
                      >
                        {loading && <p>Loading posts...</p>}
                        {postsError && <p>Error: {postsError}</p>}
                        {/* {profilePostsError && <p>Error: {followersError}</p>} */}
                        {/* {posts.length > 0 ? posts.map((post, index) => renderPost(post, index)) : <p>No posts available</p>} */}
                        {(() => {
                          let filteredPosts = posts.filter((post) =>
                            (post.media || []).some((m) =>
                              m.url.match(/\.(mp4|webm|ogg)$/i)
                            )
                          );
                          return filteredPosts.length > 0 ? (
                            filteredPosts.map((post, index) =>
                              renderPost(post, index)
                            )
                          ) : (
                            <p>No posts available</p>
                          );
                        })()}
                        {isFetchingMore && <p>Loading more posts...</p>}
                      </div>
                      <div
                        className={`tab-pane fade ${activeTab === "image" ? "show active" : ""
                          }`}
                        id="nav-photo"
                        role="tabpanel"
                        aria-labelledby="nav-photo-tab"
                        tabIndex={0}
                      >
                        {loading && <p>Loading posts...</p>}
                        {postsError && <p>Error: {postsError}</p>}
                        {/* {profilePostsError && <p>Error: {followersError}</p>} */}
                        {/* {posts.length > 0 ? posts.map((post, index) => renderPost(post, index)) : <p>No posts available</p>} */}
                        {(() => {
                          let filteredPosts = posts.filter((post) =>
                            (post.media || []).some((m) =>
                              m.url.match(/\.(webp|jpg|jpeg|png|gif)$/i)
                            )
                          );
                          return filteredPosts.length > 0 ? (
                            filteredPosts.map((post, index) =>
                              renderPost(post, index)
                            )
                          ) : (
                            <p>No posts available</p>
                          );
                        })()}
                        {isFetchingMore && <p>Loading more posts...</p>}
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
    </div>
  );
};

export default Profile;
