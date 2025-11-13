import React, { useRef, useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import {
  iconclose,
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
  moreicon,
  slideimg1,
  favicon,
  headercommenticon,
  shareicon,
  saveiconblack,
  favoriteicon,
  slideimg2,
  slideimg3,
  businessprofile,
  profilepic3,
  redlike,
  saveblack,
} from "../imaUrl";
import { Link, useNavigate } from "react-router-dom";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, getProfile } from "../feature/profileSlice";
import ReportPostModal from "../model/ReportModel";
import CommentModal from "../model/CommentModel";
import { reportPost } from "../feature/homePage/reportSlice";
// import { getMyPosts } from "../feature/mypostSlice";
import { likePost } from "../feature/homePage/likeSlice";
import { savePost } from "../feature/homePage/saveSlice";
import { fetchPingers } from "../feature/followersSlice";
import axios from "axios";
import { fetchMyBusinessPosts, updatePost, getMyPosts } from "../feature/mybusinesspostSlice";
import {
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaTelegramPlane,
} from "react-icons/fa";
import { sharePost } from "../feature/homePage/postShareSlice";
import ShareModal from "../model/ShareModal";
import { toast } from "react-toastify";
import { showAlert } from "../utils/swalHelper";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import LocationModal from "../model/LocationModel";
import { deleteQastData } from "../feature/addpostSlice";
import SelectShareModal from "../model/SelectShareModal";
import InternalShareModal from "../model/InternalShareModal";
const VITE_API_URL = import.meta.env.VITE_API_URL;

const Mybusinessprofile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showShareOptions, setShowShareOptions] = useState({});
  const [likeStates, setLikeStates] = useState({});
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [text, setText] = useState("");
  const commentRefs = useRef({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const report = useSelector((state) => state.report);
  const [openSharePostId, setOpenSharePostId] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false); // State for modal visibility
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null); // State for selected post ID
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [reason, setReason] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [loader, setLoader] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  const toggleShareDropdown = (postId) => {
    setOpenSharePostId(openSharePostId === postId ? null : postId);
  };
  const [showModal, setShowModal] = useState(false);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSelectShareOpen, setIsSelectShareOpen] = useState(false);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  // Selector hooks for Redux state
  const {
    user,
    error: profileError,
    loading: profileLoading,
  } = useSelector((state) => state.profile || {});
  const {
    posts = [],
    totalPages = 1,
    currentPage = 1,
    loading: postsLoading,
    error: postsError,
  } = useSelector((state) => state.mybusinessposts || {});
  const {
    totalFollowers = 0,
    totalFollowings = 0,
    shareCount,
    loading: followersLoading,
    error: followersError,
  } = useSelector((state) => state.mybusinessposts || {});

  const {
    totalItems: totalQasts, // Use totalItems or totalFilteredItems as qast count
  } = useSelector((state) => state.mybusinessposts || {});

  const token =
    useSelector((state) => state.auth?.token) || localStorage.getItem("token");

  const observer = useRef();
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Set profile from localStorage
  useEffect(() => {
    setProfile(localStorage.getItem("profile"));
  }, []);

  // Fetch profile information
  const getProfileInfo = async () => {
    try {
      await dispatch(getProfile(token)).unwrap();
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to fetch profile information.");
    }
  };

  // Fetch qast count
  const getQastsInfo = async () => {
    try {
      if (token && user?._id) {
        await dispatch(
          fetchMyBusinessPosts({
            userId: user._id,
            page: 1,
            limit: 10,
            type: "all",
          })
        );
      }
    } catch (error) {
      console.error("Error fetching qasts:", error);
    }
  };
  // Fetch followers and following data
  const fetchFollowersData = async () => {
    if (token && user?._id) {
      try {
        await dispatch(
          fetchPingers({
            token,
            userId: user._id,
            type: "list",
            page: 1,
          })
        ).unwrap();
      } catch (error) {
        console.error("Error fetching pingers:", error);
        toast.error(error || "Failed to fetch followers data.");
      }
    }
  };

  useEffect(() => {
    if (token) {
      getProfileInfo();
      getQastsInfo();
    }
  }, [token]);

  useEffect(() => {
    if (token && user?._id) {
      fetchFollowersData();
    }
  }, [token, user?._id]);

  // Fetch posts
  useEffect(() => {
    if (token) {
      const validTypes = ["all", "video", "image", "tag"];
      const normalizedType = validTypes.includes(activeTab) ? activeTab : "all";
      dispatch(getMyPosts({ token, page: 1, type: normalizedType, limit: 10 }))
        .unwrap()
        .then((payload) => {
          const posts = payload.data?.postsDetails || [];
          const savedSet = new Set();
          posts.forEach((post) => {
            const isSaved = post.isPostSave || (post.media?.length > 0 && post.media?.[0]?.isPostSave);
            if (isSaved) {
              savedSet.add(post._id);
            }
          });
          setSavedPosts(savedSet);
        })
        .catch((err) => {
          toast.error(err.message);
        });
    }
  }, [token, activeTab, dispatch]);

  // Infinite scroll for posts
  const lastPostElementRef = useCallback(
    (node) => {
      if (postsLoading || isFetchingMore) return;
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
            .then(() => {
              setIsFetchingMore(false);
            })
            .catch((err) => {
              console.error(
                `Error fetching more posts for page ${currentPage + 1}:`,
                err
              );
              setIsFetchingMore(false);
              toast.error("Failed to load more posts.");
            });
        }
      });
      if (node) observer.current.observe(node);
    },
    [
      postsLoading,
      isFetchingMore,
      currentPage,
      totalPages,
      activeTab,
      token,
      dispatch,
    ]
  );

  // Initialize like states
  useEffect(() => {
    if (posts.length > 0) {
      const updatedLikeStates = {};
      posts.forEach((post) => {
        const likeSource = post.media?.[0] || post;
        updatedLikeStates[post._id] = {
          liked: likeSource.isPostLike || false,
          count: likeSource.likesCount || 0,
        };
      });
      setLikeStates(updatedLikeStates);
    }
  }, [posts]);

  // Handle like action
  const handleLike = (postId) => {
    const wasLiked = likeStates[postId]?.liked || false;
    const currentCount = likeStates[postId]?.count || 0;
    setLikeStates({
      ...likeStates,
      [postId]: {
        liked: !wasLiked,
        count: wasLiked ? currentCount - 1 : currentCount + 1,
      },
    });
    dispatch(likePost({ postId, token })).then((res) => {
      if (res.meta.requestStatus !== "fulfilled") {
        setLikeStates({
          ...likeStates,
          [postId]: {
            liked: wasLiked,
            count: currentCount,
          },
        });
        toast.error(res.payload?.message);
      }
    });
  };

  // Handle save action
  const handleSave = (postId) => {
    dispatch(savePost({ token, postId })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setSavedPosts((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(postId)) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
      } else {
        toast.error("Failed to save/unsave post.");
      }
    });
  };

  const handleOpenLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  // Handle closing the LocationModal
  const handleCloseLocationModal = () => {
    setIsLocationModalOpen(false);
  };
  const handleReportClick = (postId) => {
    setReportPostId(postId);
    setShowReportModal(true);
  };

  // const handleExternalShare = (postId, platform) => {
  //   const post = posts.find((p) => p._id === postId);
  //   if (!post || !post.user || !post.user._id) {
  //     toast("Cannot share.");
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

  const handleSelectOption = (option) => {
    setIsSelectShareOpen(false);
    if (option === "external") {
      setIsShareModalOpen(true);
    } else if (option === "internal") {
      setIsInternalModalOpen(true);
    }
  };

  // Initialize Swiper
  useEffect(() => {
    new Swiper(".mySwiper", {
      loop: true,
      pagination: { el: ".swiper-pagination", clickable: true },
    });
  }, [posts]);

  // Handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setShowShareOptions({});
  };

  // Render individual post
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
        m.url.match(/\.(webp|jpg|png)$/i)
      );
    } else if (activeTab === "tag") {
      renderedMedia = mediaToRender;
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
              <Link to={`/commanuserprofile/${post?.user?._id}`}>
                <figure>
                  {post?.user?.profilePicture ? (
                    <img
                      src={`${post.user.profilePicture}`}
                      alt="Profile"
                      className="profile-img"
                    />
                  ) : (
                    <div className="initial-circle">
                      <span>
                        {post?.user?.role === "business"
                          ? (() => {
                            const nameParts =
                              post?.user?.businessName?.trim().split(" ") ||
                              [];
                            const firstNameInitial =
                              nameParts[0]?.charAt(0)?.toUpperCase() || "";
                            const lastNameInitial =
                              nameParts.length > 1
                                ? nameParts[nameParts.length - 1]
                                  ?.charAt(0)
                                  ?.toUpperCase()
                                : "";
                            return firstNameInitial + lastNameInitial || "C";
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
                            return firstInitial + lastInitial || "C";
                          })()}
                      </span>
                    </div>
                  )}
                </figure>

                <span>
                  {post?.user?.businessName?.trim()
                    ? post.user.businessName
                    : `${post?.user?.firstName || "Adam"} ${post?.user?.lastName || "R."
                    }`}
                </span>
              </Link>

              {/* 🔑 show tagged users */}
              {post?.taggedUsers?.length > 0 && (
                <div className="tagged-users">
                  {post.taggedUsers.map((tagged) => (
                    <Link
                      key={tagged._id}
                      to={`/commanuserprofile/${tagged._id}`}
                    >
                      {/* <span>
                        {tagged.businessName?.trim()
                          ? tagged.businessName
                          : `${tagged.firstName || ""} ${tagged.lastName || ""}`}
                      </span> */}
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
                      href=""
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
        <div className="slider-wrapper ">
          <div className="swiper mySwiper">
            <div className="swiper-wrapper">
              {renderedMedia.length > 0 ? (
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
                          autoPlay
                          loop
                          poster={`${mediaItem?.thumbnail || ""}`}
                          disablePictureInPicture
                          controlsList="nofullscreen nodownload noplaybackrate"
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
                <div className="post-content">
                  <p>{post.content}</p>
                </div>
              ) : (
                null(
                  <div className="swiper-slide">
                    dangerouslySetInnerHTML={{
                      __html: post.content.replace(/\n/g, "<br />"),
                    }}
                  </div>

                )
              )}
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
                      href="#"
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
                      {/* <span>{post.shareCount ?? 0}</span> */}
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

  const deleteQast = async (id) => {
    try {
      if (token) {
        const { payload } = await dispatch(
          deleteQastData({ id, token, setLoader })
        );

        if (payload?.error === false) {
          dispatch(getMyPosts({ token, page: 1, type: activeTab, limit: 10 }));
        }
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
    }
  };

  const handleCommentAdded = (postId) => {
    // Update comment count optimistically
    const post = posts.find((p) => p._id === postId);
    if (!post) return;
    console.log("post", post);

    dispatch(
      updatePost({
        postId,
        updates: {
          commentsCount: (post.commentsCount || 0) + 1,
        },
      })
    );
  };

  return (
    <div>
      <ProfileHeader />
      <main className="wrapper">
        <section className="middle-container">
          <div className="container-fluid">
            <div className="profile-wrapper">
              <div className="row">
                <div className="col-lg-3 col-md-4">
                  <Sidebar />
                </div>
                <div className="col-lg-9 col-md-8">
                  <div className="profile-header business-profile-header">
                    <div className="row">
                      <div className="col-lg-2 col-md-3">
                        <div className="profile-pic-wrap">
                          <Link
                            className="thumb-picture"
                            to="/mybusinessprofile"
                          >
                            {user?.profilePicture ? (
                              <img
                                src={`${user?.profilePicture
                                  }?t=${new Date().getTime()}`}
                                alt="Profile"
                              />
                            ) : (
                              <div className="initial-circle">
                                <span>
                                  {user?.businessName
                                    ?.split(" ")
                                    .map((w) => w.charAt(0).toUpperCase())
                                    .join("")}
                                </span>
                              </div>
                            )}
                          </Link>
                          <span className="label">
                            {user?.businessName?.charAt(0).toUpperCase() +
                              user?.businessName?.slice(1).toLowerCase()}
                          </span>
                          <span className="label">
                            {user?.businessType
                              ? user?.businessType === "Both"
                                ? "Both Online & Offline"
                                : user?.businessType
                              : "-"}
                            {" business"}
                          </span>
                        </div>
                      </div>
                      <div className="col-lg-10 col-md-9">
                        <div className="profile-header-info">
                          <div className="profile-info">
                            <big>{postsLoading ? "..." : totalQasts}</big>
                            <small>Qasts</small>
                          </div>
                          <div
                            className="profile-info"
                            role="button"
                            onClick={() => navigate("/pingers?tab=pinging")}
                          >
                            {followersLoading ? (
                              <small>Loading...</small>
                            ) : followersError ? (
                              <small>Error</small>
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
                            {followersLoading ? (
                              <small>Loading...</small>
                            ) : followersError ? (
                              <small>Error</small>
                            ) : (
                              <>
                                <big>{totalFollowers || 0}</big>
                                <small>Pingers</small>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="btn-block">
                          <Link
                            to="/viewbusinesseditprofile"
                            className="btn btn-dark"
                          >
                            View Account Detail{" "}
                            <i className="icon-right-white" />
                          </Link>
                          <Link to="/scan-face" className="btn btn-secondary">
                            <i className="icon-scan-face" /> Scan Face
                          </Link>
                        </div>
                        <div className="business-profile-discount">
                          <span className="label">Offered Discount:</span>
                          <span className="gradient-text">
                            {user?.discountPercentage || 0}%
                          </span>
                        </div>
                        <div className="btn-block business-profile-btns">
                          <Link to="/myqrcode" className="btn btn-primary">
                            My QR Code
                          </Link>
                          <button
                            className="btn btn-secondary gradient-btn"
                            onClick={handleOpenLocationModal}
                          >
                            <i className="map-icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="profile-tab-wrapper business-profile-tabs business-profile-tabs-new ">
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
                        <button
                          className={`nav-link ${activeTab === "tag" ? "active" : ""
                            }`}
                          onClick={() => handleTabClick("tag")}
                          type="button"
                          role="tab"
                          aria-controls="nav-tag"
                          aria-selected={activeTab === "tag"}
                        >
                          Tagged
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
                        {postsLoading && <p>Loading posts...</p>}
                        {postsError && <p>Error: {postsError}</p>}
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
                        {postsLoading && <p>Loading posts...</p>}
                        {postsError && <p>Error: {postsError}</p>}
                        {posts.length > 0 ? (
                          posts.map((post, index) => renderPost(post, index))
                        ) : (
                          <p>No posts available</p>
                        )}
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
                        {postsLoading && <p>Loading posts...</p>}
                        {postsError && <p>Error: {postsError}</p>}
                        {posts.length > 0 ? (
                          posts.map((post, index) => renderPost(post, index))
                        ) : (
                          <p>No posts available</p>
                        )}
                        {isFetchingMore && <p>Loading more posts...</p>}
                      </div>
                      <div
                        className={`tab-pane fade ${activeTab === "tag" ? "show active" : ""
                          }`}
                        id="nav-qasts"
                        role="tabpanel"
                        aria-labelledby="nav-qasts-tab"
                        tabIndex={0}
                      >
                        {postsLoading && <p>Loading posts...</p>}
                        {postsError && <p>Error: {postsError}</p>}
                        {posts.length > 0 ? (
                          posts.map((post, index) => renderPost(post, index))
                        ) : (
                          <p>No posts available</p>
                        )}
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
            dispatch(
              reportPost({
                postId: reportPostId,
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
        onCommentAdded={handleCommentAdded}
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
        onClose={handleCloseLocationModal}
        businessData={{
          businessName: user?.businessName || "Business Location",
          address: user?.address || "Address not available",
          latitude: user?.latitude || 48.6705,
          longitude: user?.longitude || 11.0997,
        }}
      />
    </div>
  );
};

export default Mybusinessprofile;
