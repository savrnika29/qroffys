import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { qlipadd, profilepic, moreicon, favoriteicon, shareicon, headercommenticon, saveiconblack, redlike, saveblack, } from "../imaUrl";
import ProfileHeader from "../components/ProfileHeader";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilteredPosts, resetPosts, toggleLike, toggleSave, } from "../feature/homePage/homePostslice";
import { getStories } from "../feature/storiesSlice";
import { likePost } from "../feature/homePage/likeSlice";
import { savePost } from "../feature/homePage/saveSlice";
import { getBackgroundImages } from "../feature/backgroundSlice";
import ReportPostModal from "../model/ReportModel";
import CommentModal from "../model/CommentModel"; // Import CommentModal
import { reportPost } from "../feature/homePage/reportSlice";
import { sharePost } from "../feature/homePage/postShareSlice";
import { FaWhatsapp, FaFacebookF, FaTwitter, FaTelegramPlane, } from "react-icons/fa";
import { debounce } from "lodash";
import ShareModal from "../model/ShareModal";
import SelectShareModal from "../model/SelectShareModal";
import InternalShareModal from "../model/InternalShareModal";
import { toast, ToastContainer } from "react-toastify";
import { showAlert } from "../utils/swalHelper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // core Swiper
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/pagination";

import SwiperCore from "swiper";
import { FreeMode, Navigation, Pagination } from "swiper/modules";

const Home = () => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState("");
  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const [page, setPage] = useState(1);
  const { token, user } = useSelector((state) => state.auth);
  const loggedInUserId = user?._id;
  const { posts, loading, hasMore, totalPages, shareCount } = useSelector(
    (state) => state.homepost
  );
  const [showModal, setShowModal] = useState(false);
  const [stories, setStories] = useState([]);
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [selectedBg, setSelectedBg] = useState(null);
  const userId = localStorage.getItem("userId");
  const observerRef = useRef();
  const [storyLoading, setLoading] = useState(false);
  const [hasMoreStories, setHasMore] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const report = useSelector((state) => state.report);
  const [openSharePostId, setOpenSharePostId] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false); // State for modal visibility
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null); // State for selected post ID
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [reason, setReason] = useState("");
  const [expandedPosts, setExpandedPosts] = useState({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState(null);
  const [isSelectShareOpen, setIsSelectShareOpen] = useState(false);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  // install modules
  SwiperCore.use([FreeMode, Navigation, Pagination]);
  const [isTouchEnabled, setIsTouchEnabled] = useState(true);
  const swiperRef = useRef(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // API body for fetching posts
  const getPostsBody = (pageNum, type = "post") => ({
    page: pageNum.toString(),
    limit: "10",
    search: "",
    type: "post",
  });
  const handleSelectOption = (option) => {
    setIsSelectShareOpen(false);
    if (option === "external") {
      setIsShareModalOpen(true);
    } else if (option === "internal") {
      setIsInternalModalOpen(true);
    }
  };

  const getProfileLink = (user) => {
    if (!user || !user._id) return null; // Handle undefined user
    // if (user._id === loggedInUserId) return null; // Prevent navigation for self user
    if (user._id === loggedInUserId) {
      if (user.role === "business") return "/mybusinessprofile";
      if (user.role === "customer") return "/profile";
      return "/my-profile"; // default route for regular users
    }
    if (user.role === "business") return `/commanuserviewbusiness/${user._id}`;
    return `/commanuserprofile/${user._id}`;
  };

  // const fetchPostsForPage = useCallback(
  //   debounce(async () => {
  //     if (loading || !hasMore) return;
  //     // const filter = { limit: "10", search: "", type: "post" };
  //     try {
  //       const body = getPostsBody(page);
  //       const { payload } = await dispatch(fetchFilteredPosts({ token, body }));
  //     } catch (error) {
  //       // console.error("Error fetching posts:", error);
  //     }
  //   }, 300),
  //   [token, page, dispatch, loading, hasMore]
  // );

  // useEffect(() => {
  //   if (token && !loading && hasMore) {
  //     fetchPostsForPage();
  //   }
  // }, [token, page]);


  const fetchPostsForPage = async (pageNum) => {
    try {
      const body = getPostsBody(pageNum);
      await dispatch(fetchFilteredPosts({ token, body }));
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Debounced for infinite scroll
  const fetchMorePosts = useCallback(
    debounce((nextPage) => {
      fetchPostsForPage(nextPage);
    }, 300),
    [token, dispatch]
  );

  useEffect(() => {
    if (token && page === 1) {
      fetchPostsForPage(1);   // 🚀 run immediately on mount
    }
  }, [token]);

  useEffect(() => {
    if (token && page > 1) {
      fetchMorePosts(page);   // 🚀 debounced for scrolling
    }
  }, [token, page, fetchMorePosts]);


  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      }, { threshold: 0.1 });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore] // removed `page` from here
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // Fetch stories
  const getStoriesInfo = async (pageNum = 1) => {
    if (storyLoading) return;
    try {
      const { payload } = await dispatch(
        getStories({ token, setLoading, page: pageNum })
      );
      if (payload?.error === false) {
        const newStory = payload?.data?.stories || [];
        if (newStory.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        if (pageNum === 1) {
          setStories(newStory);
        } else {
          setStories((prev) => [...prev, ...newStory]);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      // console.error("Error fetching stories:", error);
    }
  };

  useEffect(() => {
    if (token) {
      getStoriesInfo(page);
    }
  }, [token, page]);

  // Fetch background images
  useEffect(() => {
    const fetchBackgrounds = async () => {
      const { payload } = await dispatch(
        getBackgroundImages({ setLoading, token })
      );
      if (payload?.length > 0) {
        setBackgroundImages(payload);
        setSelectedBg(payload[0]);
      }
    };
    fetchBackgrounds();
  }, [token, dispatch]);

  // Initialize Bootstrap dropdowns
  useEffect(() => {
    const dropdownTriggerList = document.querySelectorAll(
      '[data-bs-toggle="dropdown"]'
    );
    dropdownTriggerList.forEach((el) => new bootstrap.Dropdown(el));
  }, []);

  // Set profile from localStorage
  useEffect(() => {
    setProfile(localStorage.getItem("profile"));
  }, []);

  const getImageUrl = (imagePath) => {
    return `${imagePath}`;
  };

  const handleLike = (postId) => {
    if (!token) {
      return;
    }
    dispatch(toggleLike({ postId, userId: user?._id }));
    dispatch(likePost({ postId, token }))
    // .unwrap()
    // .then((res) => {
    //   console.log("Like API response:", res);
    // })
    // .catch((error) => {
    //   dispatch(toggleLike({ postId, userId: user?._id }));
    //   alert(`Failed to like post: ${error.message || "Unknown error"}`);
    // });
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

  const scrollPositionRef = useRef(0);

  const handleReportClick = (postId) => {
    scrollPositionRef.current = window.scrollY;
    setReportPostId(postId);
    setShowReportModal(true);
  };

  const handleExternalShare = (postId, platform) => {
    setIsShareModalOpen(null);
    if (!token) {
      toast.error("You must be logged in to share a post.");
      return;
    }

    const post = posts.find((p) => p._id === postId);
    if (!post || !post.user || !post.user._id) {
      toast.error("Cannot share post: Post or user information is missing.");
      return;
    }

    const shareData = {
      type: "external",
      postId,
      platform,
      sharedToUserId: "",
    };

    // Optimistic UI update
    const updatedPosts = posts.map((p) =>
      p._id === postId ? { ...p, shareCount: (p.shareCount || 0) + 1 } : p
    );
    dispatch({ type: "homepost/setPosts", payload: updatedPosts });

    dispatch(sharePost({ shareData, token }))
      .unwrap()
      .then((res) => {
        if (res?.error === false && res?.data?.shareCount !== undefined) {
          // Update Redux with correct shareCount from server
          const postsWithServerShareCount = posts.map((p) =>
            p._id === postId ? { ...p, shareCount: res.data.shareCount } : p
          );
          dispatch({
            type: "homepost/setPosts",
            payload: postsWithServerShareCount,
          });

          setOpenSharePostId(null);
          setIsShareModalOpen(false);
          setSelectedSharePost(null);
        }
      })
      .catch((err) => {
        toast.error("Failed to share the post. Please try again.");
        // Revert optimistic update
        const revertedPosts = posts.map((p) =>
          p._id === postId ? { ...p, shareCount: p.shareCount || 0 } : p
        );
        dispatch({ type: "homepost/setPosts", payload: revertedPosts });
      });
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

  // Function to truncate text to approximately two lines (100 characters as a fallback)
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

  const handleInternalShare = async (selectedUsers) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/shares/internal`,
        {
          link: selectedSharePost?.shareLink,
          postId: selectedSharePost?._id,
          sharedToUserId: selectedUsers, // array
        },
        { headers: { Authorization: `${token}` } }
      );

      if (response.status === 200 || response.data.error === false) {

        // Update Redux with latest shareCount from server if provided
        const updatedPosts = posts.map((p) =>
          p._id === selectedSharePost._id
            ? {
              ...p,
              shareCount: response.data.shareCount || (p.shareCount || 0) + selectedUsers.length,
            }
            : p
        );
        dispatch({ type: "homepost/setPosts", payload: updatedPosts });

        setIsInternalModalOpen(false);
        setSelectedSharePost(null);
      } else {
        toast.error(response.data.message || "Failed to share.");
      }
    } catch (err) {
      console.log("share error:", err);

      // console.error("Failed to share post:", err);
      // toast.error(err.response?.data?.message || "Failed to share.");
    }
  };

  const updateTouchControl = (swiper) => {
    const screenWidth = window.innerWidth;

    let maxVisibleSlides = 6.5; // default for >= 1200
    if (screenWidth < 1666) maxVisibleSlides = 6.5;
    if (screenWidth < 1200) maxVisibleSlides = 3.5;
    if (screenWidth < 768) maxVisibleSlides = 3;
    if (screenWidth < 576) maxVisibleSlides = 2.2;

    const shouldEnableTouch = stories.length + 1 > maxVisibleSlides;
    swiper.allowTouchMove = shouldEnableTouch;
    setIsTouchEnabled(shouldEnableTouch);
  };
  useEffect(() => {
    const handleResize = () => {
      if (swiperRef.current) {
        updateTouchControl(swiperRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [stories.length]);
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
                    {stories.length === 0 ? (
                      // Case: No stories, only show "Create Qlip" box
                      <div className="create-clip-wrap" style={{ position: "relative" }}>
                        <div className="create-clip-box">
                          <Link to="/newstorycommonuser">
                            <div className="icon-wrap">
                              <i>
                                <img src={qlipadd} alt="Create Qlip" />
                              </i>
                              <span className="label">Create Qlip</span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    ) : stories.length === 1 ? (
                      // Case: One story, show static layout with "Create Qlip" and single story
                      <div className="create-clip-wrap" style={{ position: "relative", display: "flex", gap: "10px" }}>
                        {/* Create Qlip Box */}
                        <div className="create-clip-box">
                          <Link to="/newstorycommonuser">
                            <div className="icon-wrap">
                              <i>
                                <img src={qlipadd} alt="Create Qlip" />
                              </i>
                              <span className="label">Create Qlip</span>
                            </div>
                          </Link>
                        </div>
                        {/* Single Story */}
                        <div className="create-clip-box">
                          <Link to={`/shortfeeds?storyId=${stories[0]._id}`}>
                            <div className="profile-thumb">
                              {stories[0]?.user?.profilePicture ? (
                                <img src={stories[0]?.user?.profilePicture} alt="profile" />
                              ) : (
                                <div className="business-profile-circle">
                                  <span>
                                    {(stories[0]?.user?.businessName || "")
                                      .split(" ")
                                      .map((w) => w.charAt(0).toUpperCase())
                                      .join("")}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="qlip-text">
                              <p>{stories[0]?.text || ""}</p>
                            </div>
                            <figure className="qlip-pic">
                              <video
                                width="100%"
                                playsInline
                                muted
                                loop={false} // Disable loop for single video
                                autoPlay={false} // Disable autoplay for single video
                                poster={stories[0]?.media[0]?.thumbnail || ""}
                                onLoadedMetadata={(e) => {
                                  const video = e.target;
                                  if (video.duration > 60) {
                                    video.addEventListener("timeupdate", () => {
                                      if (video.currentTime >= 60) {
                                        video.pause();
                                        video.currentTime = 0;
                                      }
                                    });
                                  }
                                }}
                              >
                                <source src={stories[0]?.media[0]?.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </figure>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      // Case: Multiple stories, use Swiper
                      <div className="create-clip-wrap" style={{ position: "relative" }}>
                        {/* Custom navigation buttons */}
                        <div className="swiper-button-prev custom-prev"></div>
                        <div className="swiper-button-next custom-next"></div>

                        <Swiper
                          key={stories.length}
                          spaceBetween={10}
                          slidesPerView={Math.min(stories.length + 1, 6.5)} // 👈 show 4.5 max
                          allowTouchMove={stories.length > 4} // 👈 allow swipe only if more than 4
                          autoplay={false}
                          modules={[Navigation]}
                          navigation={
                            stories.length > 3
                              ? { prevEl: ".custom-prev", nextEl: ".custom-next" }
                              : false
                          }
                          observer={true}
                          observeParents={true}
                          breakpoints={{
                            0: {
                              slidesPerView: Math.min(stories.length + 1, 2.2), // mobile
                            },
                            576: {
                              slidesPerView: Math.min(stories.length + 1, 3), // tablet
                            },
                            768: {
                              slidesPerView: Math.min(stories.length + 1, 3.5), // medium
                            },
                            1200: {
                              slidesPerView: Math.min(stories.length + 1, 4.5), // desktop (4.5)
                            },
                            1666: {
                              slidesPerView: Math.min(stories.length + 1, 6.5),
                            },
                          }}
                          className="mySwiper"
                          onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                            updateTouchControl(swiper);
                            console.log("Swiper initialized", swiper);
                          }}
                        >
                          {/* Create Qlip Box */}
                          <SwiperSlide>
                            <div className="create-clip-box">
                              <Link to="/newstorycommonuser">
                                <div className="icon-wrap">
                                  <i>
                                    <img src={qlipadd} alt="Create Qlip" />
                                  </i>
                                  <span className="label">Create Qlip</span>
                                </div>
                              </Link>
                            </div>
                          </SwiperSlide>

                          {/* Stories Slider */}
                          {stories.map((story, index) => (
                            <SwiperSlide key={story._id || index}>
                              <div className="create-clip-box">
                                <Link to={`/shortfeeds?storyId=${story._id}`}>
                                  <div className="profile-thumb">
                                    {story?.user?.profilePicture ? (
                                      <img
                                        src={story?.user?.profilePicture}
                                        alt="profile"
                                      />
                                    ) : (
                                      <div className="business-profile-circle">
                                        <span>
                                          {(story?.user?.businessName || "")
                                            .split(" ")
                                            .map((w) =>
                                              w.charAt(0).toUpperCase()
                                            )
                                            .join("")}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="qlip-text">
                                    <p>{story?.text || ""}</p>
                                  </div>
                                  <figure className="qlip-pic">
                                    <video
                                      width="100%"
                                      playsInline
                                      muted
                                      loop={false} // Disable loop for consistency
                                      autoPlay={false} // Disable autoplay to prevent unintended sliding
                                      poster={story?.media[0]?.thumbnail || ""}
                                      onLoadedMetadata={(e) => {
                                        const video = e.target;
                                        if (video.duration > 60) {
                                          video.addEventListener(
                                            "timeupdate",
                                            () => {
                                              if (video.currentTime >= 60) {
                                                video.pause();
                                                video.currentTime = 0;
                                              }
                                            }
                                          );
                                        }
                                      }}
                                    >
                                      <source
                                        src={story?.media[0]?.url}
                                        type="video/mp4"
                                      />
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                  </figure>
                                </Link>
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    )}

                    <div
                      className="qlips-home-wrap"
                      style={{
                        backgroundImage: selectedBg
                          ? `url(${getImageUrl(selectedBg)})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundAttachment: "fixed",
                        minHeight: "100vh",
                      }}
                    >
                      {posts.length > 0 ? (
                        <div className="tab-profile-content">
                          {posts?.map((post, index) => (
                            <div className="" key={index}>
                              <div
                                className="tab-profile-content"
                                key={post._id}
                                ref={
                                  index === posts.length - 1
                                    ? lastPostElementRef
                                    : null
                                }
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
                                                      const words =
                                                        post.user.businessName
                                                          .trim()
                                                          .split(/\s+/);
                                                      const firstLetter =
                                                        words[0]?.charAt(0) ||
                                                        "";
                                                      const lastLetter =
                                                        words.length > 1
                                                          ? words[
                                                            words.length - 1
                                                          ]?.charAt(0)
                                                          : "";
                                                      return (
                                                        (
                                                          firstLetter +
                                                          lastLetter
                                                        ).toUpperCase() ||
                                                        "BN"
                                                      );
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
                                              {(post?.user?.firstName?.charAt(
                                                0
                                              ) || "") +
                                                (post?.user?.lastName?.charAt(
                                                  0
                                                ) || "") || "UN"}
                                            </div>
                                          )}
                                        </figure>
                                        {post?.user?.role === "business" ? (
                                          <span>
                                            {post?.user?.businessName ||
                                              "Business Name"}
                                          </span>
                                        ) : (
                                          <span>
                                            {post?.user?.firstName || ""}{" "}
                                            {post?.user?.lastName || ""}
                                          </span>
                                        )}
                                      </Link>
                                    </div>
                                    <div className="more-dropdown ">
                                      <button
                                        className="dropdown-toggle btn btn-link"
                                        type="button"
                                        onClick={() => toggleDropdown(post._id)}
                                      >
                                        <img src={moreicon} alt="" />
                                      </button>
                                      {activeDropdown === post._id && (
                                        <ul className="custom-dropdown-menu">
                                          {post?.user?._id !==
                                            loggedInUserId && (
                                              <li>
                                                <a
                                                  className="dropdown-item"
                                                  href="#"
                                                  // onClick={() => handleReportClick(post._id)}
                                                  onClick={(e) => {
                                                    e.preventDefault(); // <-- Add this
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
                                {post?.media?.length > 0 ? (
                                  <div className="slider-wrapper tab-slider">
                                    <Swiper
                                      modules={[FreeMode, Pagination]} // ✅ keep only what you need
                                      pagination={{ clickable: true }}
                                      spaceBetween={10}
                                      slidesPerView={1}
                                    >
                                      {post?.media?.map((mediaItem, index) => {
                                        const isVideo = mediaItem.url?.match(/\.(mp4|webm|ogg)$/i);
                                        return (
                                          <SwiperSlide key={index}>
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
                                              >
                                                <source src={mediaItem?.url} type="video/mp4" />
                                                Your browser does not support the video tag.
                                              </video>
                                            ) : (
                                              <img src={mediaItem?.url} alt="media" width="100%" />
                                            )}
                                          </SwiperSlide>
                                        );
                                      })}
                                    </Swiper>
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
                                                  // src={
                                                  //   post.media?.[0]?.isPostLike
                                                  //     ? redlike
                                                  //     : favoriteicon
                                                  // }
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
                                                handleOpenCommentSection(
                                                  post._id
                                                );
                                              }}
                                            >
                                              <i>
                                                <img
                                                  src={headercommenticon}
                                                  alt="comment icon"
                                                />
                                              </i>
                                              <span>
                                                {post.commentsCount || 0}
                                              </span>
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
                                                <img
                                                  src={shareicon}
                                                  alt="Share"
                                                />
                                              </i>
                                              <span>
                                                {post.shareCount ?? 0}
                                              </span>
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
                                                {/* <img
                                                  src={
                                                    post.media?.[0]?.isPostSave
                                                      ? saveblack
                                                      : saveiconblack
                                                  }
                                                  alt="save"
                                                /> */}
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
                                        {/* <p>{post.text}</p> */}
                                        <p>
                                          {expandedPosts[post._id]
                                            ? post.text
                                            : truncateText(post.text)}
                                          {post.text?.length > 110 &&
                                            !expandedPosts[post._id] && (
                                              <span
                                                className="see-more"
                                                style={{
                                                  color: "#282828",
                                                  cursor: "pointer",
                                                  marginLeft: "5px",
                                                  fontSize: "0.9rem",
                                                }}
                                                onClick={() =>
                                                  toggleSeeMore(post._id)
                                                }
                                              >
                                                See More
                                              </span>
                                            )}
                                          {expandedPosts[post._id] &&
                                            post.text?.length > 110 && (
                                              <span
                                                className="see-less"
                                                style={{
                                                  color: "#282828",
                                                  cursor: "pointer",
                                                  marginLeft: "5px",
                                                  fontSize: "0.9rem",
                                                }}
                                                onClick={() =>
                                                  toggleSeeMore(post._id)
                                                }
                                              >
                                                See Less
                                              </span>
                                            )}
                                        </p>
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
                            </div>
                          ))}

                          {loading && (
                            <div className="load-more">
                              Loading more posts...
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className="d-flex justify-content-center align-items-center text-center m-4"
                          style={{ height: "100vh" }}
                        >
                          <h3 className="bg-light">No data found</h3>
                        </div>
                      )}
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
              // console.log("Post or user data missing");
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
      {/* <ToastContainer /> */}
    </div>
  );
};

export default Home;
