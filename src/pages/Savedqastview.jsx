import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSavedPostandStories, toggleLike, updateSavedPost, toggleSave, updatePost } from "../feature/savedPostandStoriesSlice";
import ProfileHeader from "../components/ProfileHeader";
import Sidebar from "../components/Sidebar";
import {
  moreicon,
  favoriteicon,
  shareicon,
  headercommenticon,
  saveiconblack,
  redlike,
  saveblack,
} from "../imaUrl";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SwiperCore from "swiper";
import { FreeMode, Navigation } from "swiper/modules";
import { likePost } from "../feature/homePage/likeSlice";
import CommentModal from "../model/CommentModel";
import { savePost } from "../feature/homePage/saveSlice";
import SelectShareModal from "../model/SelectShareModal";
import InternalShareModal from "../model/InternalShareModal";
import ShareModal from "../model/ShareModal";
import { toast } from "react-toastify";
import { sharePost } from "../feature/homePage/postShareSlice";
import axios from "axios";
import ReportPostModal from "../model/ReportModel";
import { reportPost } from "../feature/homePage/reportSlice";

SwiperCore.use([FreeMode, Navigation]);

const Savedqastview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const videoRefs = useRef([]);
  const observerRef = useRef();
  const [page, setPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState(null);
  const [isSelectShareOpen, setIsSelectShareOpen] = useState(false);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [reason, setReason] = useState("");

  const { items, loading, error, hasMore } = useSelector(
    (state) => state?.savedPostandStories || {}
  );
  const { token, user } = useSelector((state) => state.auth || {});
  const loggedInUserId = user?._id;

  const posts = Array.isArray(items?.postsDetails) ? items.postsDetails : [];
  const singlePost = id ? posts.find((post) => String(post._id) === String(id)) : null;

  useEffect(() => {
    if (token) {
      dispatch(getSavedPostandStories({ token, body: { page: page.toString(), limit: "10", search: "", type: "post" } }));
    }
  }, [dispatch, token, page]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { threshold: 0.1 }
      );
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const toggleDropdown = (postId) => {
    setActiveDropdown(activeDropdown === postId ? null : postId);
  };

  const getProfileLink = (user) => {
    if (!user || !user._id) return null;
    if (user._id === loggedInUserId) {
      if (user.role === "business") return "/mybusinessprofile";
      if (user.role === "customer") return "/profile";
      return "/my-profile";
    }
    if (user.role === "business") return `/commanuserviewbusiness/${user._id}`;
    return `/commanuserprofile/${user._id}`;
  };

  const handleLike = (postId) => {
    if (!token) {
      toast("Please login to like the post.");
      return;
    }

    dispatch(toggleLike(postId));
    dispatch(likePost({ postId, token }))
      .unwrap()
      .then((updatedPost) => {
        dispatch(updateSavedPost(updatedPost));
      })
      .catch(() => {
        dispatch(toggleLike(postId));
      });
  };

  const handleSave = (postId) => {
    if (!token) return;
    dispatch(toggleSave({ postId }));
    dispatch(savePost({ postId, token })).then((res) => {
      if (res.meta.requestStatus !== "fulfilled") {
        dispatch(toggleSave({ postId }));
      }
    });
    navigate("/saved");
  };

  const handleReportClick = (postId) => {
    setReportPostId(postId);
    setShowReportModal(true);
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

  const handleSelectOption = (option) => {
    setIsSelectShareOpen(false);
    if (option === "external") {
      setIsShareModalOpen(true);
    } else if (option === "internal") {
      setIsInternalModalOpen(true);
    }
  };

  const truncateText = (text, maxLength = 110) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const toggleSeeMore = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const renderPost = (post, index, isSinglePost = false) => (
    <div className="tab-profile-content" key={post._id}>
      <div
        className="tab-profile-content"
        ref={!isSinglePost && index === posts.length - 1 ? lastPostElementRef : null}
      >
        <div className="tab-profile-header">
          <div className="tab-profile-pic-wrap">
            <div className="tab-profile">
              <Link
                to={getProfileLink(post.user)}
                onClick={(e) => {
                  if (!getProfileLink(post.user)) {
                    e.preventDefault();
                  }
                }}
              >
                <figure>
                  {post?.user?.role === "business" ? (
                    post?.user?.profilePicture ? (
                      <img
                        src={`${post?.user?.profilePicture}`}
                        className="Businesso"
                        alt="business profile"
                      />
                    ) : (
                      <div className="initial-circle">
                        <span>
                          {post?.user?.businessName
                            ? (() => {
                                const words = post.user.businessName.trim().split(/\s+/);
                                const firstLetter = words[0]?.charAt(0) || "";
                                const lastLetter =
                                  words.length > 1 ? words[words.length - 1]?.charAt(0) : "";
                                return (firstLetter + lastLetter).toUpperCase() || "BN";
                              })()
                            : "BN"}
                        </span>
                      </div>
                    )
                  ) : post?.user?.profilePicture ? (
                    <img
                      src={`${post?.user?.profilePicture}`}
                      className="Profileo"
                      alt="user profile"
                    />
                  ) : (
                    <div className="Profileo initials-placeholder">
                      {(post?.user?.firstName?.charAt(0) || "") +
                        (post?.user?.lastName?.charAt(0) || "") || "UN"}
                    </div>
                  )}
                </figure>
                {post?.user?.role === "business" ? (
                  <span>{post?.user?.businessName || "Business Name"}</span>
                ) : (
                  <span>
                    {post?.user?.firstName || ""} {post?.user?.lastName || ""}
                  </span>
                )}
              </Link>
            </div>
            <div className="more-dropdown">
              <button
                className="dropdown-toggle btn btn-link"
                type="button"
                onClick={() => toggleDropdown(post._id)}
              >
                <img src={moreicon} alt="More" />
              </button>
              {activeDropdown === post._id && (
                <ul className="custom-dropdown-menu">
                  {post?.user?._id !== loggedInUserId && (
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
                  )}
                  <li>
                    <a
                      className="dropdown-item"
                      onClick={() => {
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
        {post.media?.length > 0 ? (
          <div className="slider-wrapper">
            <Swiper
              className="mySwiper"
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              modules={[FreeMode, Navigation]}
            >
              {post.media.map((mediaItem, mediaIndex) => {
                const isVideo = mediaItem.url?.match(/\.(mp4|webm|ogg)$/i);
                return (
                  <SwiperSlide key={mediaIndex}>
                    {isVideo ? (
                      <video
                        controls
                        width="100%"
                        playsInline
                        autoPlay
                        muted
                        poster={mediaItem?.thumbnail || ""}
                        disablePictureInPicture
                        controlsList="nofullscreen nodownload noplaybackrate"
                        ref={(el) => {
                          if (el) {
                            videoRefs.current[`${index}-${mediaIndex}`] = el;
                          }
                        }}
                      >
                        <source src={`${mediaItem?.url}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img src={`${mediaItem?.url}`} alt="media" width="100%" />
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        ) : post.content ? (
          <div className="post-content">
            <p>{post.content}</p>
          </div>
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
                  <li style={{ position: "relative" }}>
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
                <p>
                  {expandedPosts[post._id] ? post.text : truncateText(post.text)}
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
    </div>
  );

  if (loading) {
    return <div className="text-center p-4">Loading saved posts…</div>;
  }

  if (error) {
    return <div className="text-center p-4">Error: {error.message || "Failed to load posts"}</div>;
  }

  if (id && !singlePost) {
    return <div className="text-center p-4">Post not found</div>;
  }

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
                  <div className="qlips-main-wrapper">
                    {id ? (
                      <>
                        {/* <button
                          onClick={() => navigate("/saved")}
                          className="btn btn-secondary mb-3"
                        >
                          Back to Saved Posts
                        </button> */}
                        {renderPost(singlePost, 0, true)}
                      </>
                    ) : (
                      <>
                        <h3 className="main-heading">Saved Qlip Videos/Saved Qasts</h3>
                        <div className="saved-qlip-videos">
                          {posts.length > 0 ? (
                            posts.map((post, index) => renderPost(post, index))
                          ) : (
                            <div className="text-center p-4">No saved posts found</div>
                          )}
                          {loading && <div className="load-more">Loading more posts...</div>}
                        </div>
                      </>
                    )}
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

export default Savedqastview;