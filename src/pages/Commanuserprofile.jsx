import React, { useCallback, useEffect, useState } from "react";
import {
  saveicon,
  profilepic,
  moreicon,
  slideimg1,
  favicon,
  headercommenticon,
  shareicon,
  saveiconblack,
  saveblack,
  favoriteicon,
  slideimg2,
  slideimg3,
  redlike,
} from "../imaUrl";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMyBusinessPosts,
  clearMyBusinessPostsData,
  updatePost, // Add this action to update a single post in Redux
  incrementBusinessPostComments,
} from "../feature/mybusinesspostSlice";
import { fetchPingers, followAction } from "../feature/followersSlice";
import { likePost } from "../feature/homePage/likeSlice";
import { getComments, postComment } from "../feature/commentSlice";
import { savePost } from "../feature/homePage/saveSlice";
import { toast } from "react-toastify";
import { sharePost } from "../feature/homePage/postShareSlice";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";
import CommentModal from "../model/CommentModel";
import ReportPostModal from "../model/ReportModel";
import { reportPost } from "../feature/homePage/reportSlice";
import ShareModal from "../model/ShareModal";
import { showAlert } from "../utils/swalHelper";
import SelectShareModal from "../model/SelectShareModal";
import InternalShareModal from "../model/InternalShareModal";
import { userDataInfo } from "../feature/auth/authSlice";
import axios from "axios";

const getMediaType = (url) => {
  if (!url) return null;
  const extension = url.split(".").pop().toLowerCase();
  const photoExtensions = ["jpg", "jpeg", "png", "webp"];
  const videoExtensions = ["mp4", "mov", "avi"];
  if (photoExtensions.includes(extension)) return "photo";
  if (videoExtensions.includes(extension)) return "video";
  return null;
};

const Commanuserprofile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId } = useParams();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState();
  const mybusinesspostState = useSelector((state) => state.mybusinessposts);
  console.log("mybusinesspostState", mybusinesspostState);

  const {
    posts,
    loading,
    error,
    currentPage,
    totalPages,
    totalFollowings,
    totalFollowers,
    profileUser: reduxProfileUser,
  } = mybusinesspostState;

  const { token, user } = useSelector((state) => state.auth);
  const { pinging } = useSelector((state) => state.followers || {});
  const { comments, loading: commentsLoading } = useSelector(
    (state) => state.comments
  );
  const [activeTab, setActiveTab] = useState("all");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPingLoading, setIsPingLoading] = useState(false);
  const loggedInUserId = user?._id;
  const targetUserId = userId || location.state?.userId || user?._id;
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null);
  const report = useSelector((state) => state.report);
  const [reportPostId, setReportPostId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reason, setReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState(null);
  const [isSelectShareOpen, setIsSelectShareOpen] = useState(false);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const authUserId =
    user?._id || user?.userId || localStorage.getItem("userId");
  const effectiveUserId = targetUserId || authUserId;

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
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
      );
    }
  }, [targetUserId, token, dispatch, authUserId]);

  useEffect(() => {
    if (loggedInUserId === targetUserId) {
      setIsFollowing(true);
    } else if (pinging?.isFollowed !== undefined) {
      setIsFollowing(pinging.isFollowed);
    } else {
      setIsFollowing(false);
    }
  }, [pinging, loggedInUserId, targetUserId]);

  const handleSelectOption = (option) => {
    setIsSelectShareOpen(false);
    if (option === "external") {
      setIsShareModalOpen(true);
    } else if (option === "internal") {
      setIsInternalModalOpen(true);
    }
  };

  useEffect(() => {
    if (targetUserId && token) {
      dispatch(
        fetchMyBusinessPosts({
          userId: targetUserId,
          page: 1,
          limit: 10,
          type: activeTab,
        })
      );
    }
    return () => {
      dispatch(clearMyBusinessPostsData());
    };
  }, [dispatch, targetUserId, activeTab, token]);

  useEffect(() => {
    if (posts.length > 0) {
      requestAnimationFrame(() => {
        const sliders = document.querySelectorAll(".mySwiper");
        sliders.forEach((slider) => {
          const slides = slider.querySelectorAll(".swiper-slide");
          const shouldLoop = slides.length > 1;
          if (!slider.classList.contains("swiper-initialized")) {
            new Swiper(slider, {
              loop: shouldLoop,
              pagination: {
                el: slider.querySelector(".swiper-pagination"),
                clickable: true,
              },
            });
          }
        });
      });
    }
  }, [posts]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePingClick = async () => {
    if (!token || !targetUserId) {
      toast.error("Unauthorized or missing user ID");
      return;
    }
    if (targetUserId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(targetUserId)) {
      toast.error("Invalid user ID format");
      return;
    }
    setIsPingLoading(true);
    const type = isFollowing ? "unfollow" : "follow";
    try {
      const resultAction = await dispatch(
        followAction({ token, userId: targetUserId, type })
      ).unwrap();
      if (resultAction?.error === false) {
        setIsFollowing(type === "follow");
        dispatch(
          fetchMyBusinessPosts({
            userId: targetUserId,
            page: 1,
            limit: 10,
            type: activeTab,
          })
        );
      } else {
        toast.error(resultAction.message || "Action failed");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsPingLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!token) {
      toast.error("Please login to like the post.");
      return;
    }

    // Optimistically update the UI
    const post = posts.find((p) => p._id === postId);
    const isLiked = post.isPostLike;
    const newLikesCount = isLiked
      ? (post.likesCount || 0) - 1
      : (post.likesCount || 0) + 1;

    // Update Redux state optimistically
    dispatch(
      updatePost({
        postId,
        updates: {
          isPostLike: !isLiked,
          likesCount: newLikesCount,
        },
      })
    );

    try {
      const result = await dispatch(likePost({ postId, token })).unwrap();
      if (result?.error) {
        // Revert on failure
        dispatch(
          updatePost({
            postId,
            updates: {
              isPostLike: isLiked,
              likesCount: post.likesCount || 0,
            },
          })
        );
        toast.error(result.message || "Failed to like post");
      }
    } catch (error) {
      // Revert on error
      dispatch(
        updatePost({
          postId,
          updates: {
            isPostLike: isLiked,
            likesCount: post.likesCount || 0,
          },
        })
      );
      toast.error(error.message || "Failed to like post");
    }
  };

  const handleSave = async (postId) => {
    if (!token) {
      toast.error("Please login to save the post.");
      return;
    }

    // Optimistically update the UI
    const post = posts.find((p) => p._id === postId);
    const isSaved = post.isPostSave;

    // Update Redux state optimistically
    dispatch(
      updatePost({
        postId,
        updates: {
          isPostSave: !isSaved,
        },
      })
    );

    try {
      const result = await dispatch(savePost({ postId, token })).unwrap();
      if (result?.error) {
        // Revert on failure
        dispatch(
          updatePost({
            postId,
            updates: {
              isPostSave: isSaved,
            },
          })
        );
        toast.error(result.message || "Failed to save post");
      }
    } catch (error) {
      // Revert on error
      dispatch(
        updatePost({
          postId,
          updates: {
            isPostSave: isSaved,
          },
        })
      );
      toast.error(error.message || "Failed to save post");
    }
  };

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

  const handleCommentAdded = (postId) => {
    // Update comment count optimistically
    const post = posts.find((p) => p._id === postId);
    if (!post) return;

    dispatch(
      updatePost({
        postId,
        updates: {
          commentsCount: (post.commentsCount || 0) + 1,
        },
      })
    );
  };

  const handleReportClick = (postId) => {
    setReportPostId(postId);
    setShowReportModal(true);
  };

  const handleOpenCommentSection = (postId) => {
    if (!token) {
      toast.error("Please login to view comments.");
      return;
    }
    setSelectedCommentPostId(postId);
    setIsCommentModalOpen(true);
  };

  const handleCommentModalClose = () => {
    setIsCommentModalOpen(false);
    setSelectedCommentPostId(null);
  };

  const getUserInfo = async () => {
    try {
      const { payload } = await dispatch(userDataInfo({ id: userId, token }));
      if (payload?.error === false) {
        setUserInfo(payload?.data);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch user info");
    }
  };

  useEffect(() => {
    if (token) {
      getUserInfo();
    }
  }, [token, userId]);

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "all") return true;
    const mediaType = post.media?.[0]?.url
      ? getMediaType(post.media[0].url)
      : null;
    return mediaType === activeTab;
  });

  const profileUser =
    reduxProfileUser || location.state?.user || posts[0]?.user || null;

  const renderPost = (post) => {
    const mediaType = post.media?.[0]?.url
      ? getMediaType(post.media[0].url)
      : null;
    return (
      <div className="tab-profile-content" key={post._id}>
        <div className="tab-profile-header">
          <div className="tab-profile-pic-wrap">
            <div className="tab-profile">
              <Link to={`/commanuserprofile/${post.user._id}`}>
                <figure>
                  <img
                    src={`${post.user.profilePicture || "/default.png"}`}
                    alt="profile"
                  />
                </figure>
                <span>
                  {post.user.role === "business"
                    ? post.user.businessName
                    : `${post.user.firstName || ""} ${post.user.lastName || ""
                    }`}
                </span>
              </Link>
            </div>
            <div className="more-dropdown">
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
        <div className="slider-wrapper">
          <div className="swiper mySwiper">
            <div className="swiper-wrapper">
              {post.media.length > 0 ? (
                post.media.map((mediaItem, index) => {
                  const isVideo = mediaItem.url?.match(/\.(mp4|webm|ogg)$/i);
                  return (
                    <div className="swiper-slide" key={index}>
                      {isVideo ? (
                        <video
                          controls
                          width="100%"
                          playsInline
                          autoPlay
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
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{
                    __html: post.content.replace(/\n/g, "<br />"),
                  }}
                />
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
                          src={post.isPostLike ? redlike : favoriteicon}
                          alt="like"
                        />
                      </i>
                      <span>{post.likesCount || 0}</span>
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
                      <span>{post.shareCount || 0}</span>
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
                          src={post.isPostSave ? saveblack : saveiconblack}
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
                        {userInfo && (
                          <div className="profile-pic-wrap">
                            <a>
                              <img
                                src={userInfo?.profilePicture || "/default.png"}
                                alt="profile"
                              />
                            </a>
                            <span className="label">
                              {userInfo.role === "business"
                                ? userInfo.businessName
                                : `${userInfo.firstName || ""} ${userInfo.lastName || ""
                                }`}
                            </span>
                          </div>
                        )}
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
                            onClick={() =>
                              navigate(
                                `/pingers/${effectiveUserId}?tab=pingers`,
                                {
                                  state: {
                                    totalFollowers,
                                    totalFollowings,
                                  },
                                }
                              )
                            }
                          >
                            <big>{totalFollowers || 0}</big>
                            <small>Pingers</small>
                          </div>
                          <div
                            className="profile-info"
                            role="button"
                            onClick={() =>
                              navigate(
                                `/pingers/${effectiveUserId}?tab=pinging`,
                                {
                                  state: {
                                    totalFollowers,
                                    totalFollowings,
                                  },
                                }
                              )
                            }
                          >
                            <big>{totalFollowings || 0}</big>
                            <small>Pinging</small>
                          </div>
                        </div>
                        <div className="btn-block">
                          <button
                            onClick={handlePingClick}
                            className="btn btn-dark"
                            disabled={isPingLoading}
                          >
                            {isPingLoading
                              ? "Loading..."
                              : isFollowing
                                ? "Unping"
                                : "Ping"}
                          </button>
                          <Link
                            to={`/personalchat/${targetUserId}`}
                            className="btn btn-secondary"
                          >
                            Message
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="profile-tab-wrapper">
                    <nav>
                      <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <button
                          className={`nav-link ${activeTab === "all" ? "active" : ""
                            }`}
                          id="nav-qasts-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-qasts"
                          type="button"
                          role="tab"
                          aria-controls="nav-qasts"
                          aria-selected={activeTab === "all"}
                          onClick={() => handleTabChange("all")}
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
                        {error && <p>Error: {error}</p>}
                        {!loading && filteredPosts.length === 0 && (
                          <p>No posts available.</p>
                        )}
                        {filteredPosts.map((post) => renderPost(post))}
                      </div>
                      <div
                        className={`tab-pane fade ${activeTab === "video" ? "show active" : ""
                          }`}
                        id="nav-video"
                        role="tabpanel"
                        aria-labelledby="nav-video-tab"
                        tabIndex={0}
                      >
                        {loading && <p>Loading videos...</p>}
                        {error && <p>Error: {error}</p>}
                        {!loading && filteredPosts.length === 0 && (
                          <p>No videos available.</p>
                        )}
                        {filteredPosts.map((post) => renderPost(post))}
                      </div>
                      <div
                        className={`tab-pane fade ${activeTab === "photo" ? "show active" : ""
                          }`}
                        id="nav-photo"
                        role="tabpanel"
                        aria-labelledby="nav-photo-tab"
                        tabIndex={0}
                      >
                        {loading && <p>Loading photos...</p>}
                        {error && <p>Error: {error}</p>}
                        {!loading && filteredPosts.length === 0 && (
                          <p>No photos available.</p>
                        )}
                        {filteredPosts.map((post) => renderPost(post))}
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
              toast.error("Missing required fields for reporting.");
              return;
            }
            const post = posts.find((p) => p._id === reportPostId);
            if (!post || !post.user || !post.user._id) {
              return;
            }
            dispatch(
              reportPost({
                reportedUserId: post.user._id,
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
    </div>
  );
};

export default Commanuserprofile;