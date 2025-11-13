import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import ProfileHeader from "../components/ProfileHeader";
import Sidebar from "../components/Sidebar";
import { moreicon, morewhiteicon } from "../imaUrl";
import {
  closeiconbig,
  commenticonwhite,
  favicon,
  profilepic,
  saveiconwhite,
  shareiconwhite,
  storylike,
  storysave,
} from "../imaUrl";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { getStories } from "../feature/storiesSlice";
import { useDispatch, useSelector } from "react-redux";
import { likePost } from "../feature/homePage/likeSlice";
import { savePost } from "../feature/homePage/saveSlice";
import {
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaTelegramPlane,
} from "react-icons/fa";
import { getComments, postComment } from "../feature/commentSlice";
import { getVideos } from "../feature/videoSlice";
import { FaBookmark } from "react-icons/fa";
import CommentModal from "../model/CommentModel";
import { sharePost } from "../feature/homePage/postShareSlice";
import { toast } from "react-toastify";
import ShareModal from "../model/ShareModal";
import SelectShareModal from "../model/SelectShareModal";
import InternalShareModal from "../model/InternalShareModal";
import { fetchPingers, followAction } from "../feature/followersSlice";
import { deleteQastData } from "../feature/addpostSlice";
import Loader from "../components/Loader";
import { showAlert } from "../utils/swalHelper";
import ReportPostModal from "../model/ReportModel";
import { reportPost } from "../feature/homePage/reportSlice";

const Shortfeeds = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { token, user } = useSelector((state) => state.auth);
  const userdata = useSelector((state) => state.auth?.user);
  const [stories, setStories] = useState([]);
  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const observer = useRef();
  const [likeStates, setLikeStates] = useState({});
  const [savedStory, setSavedStory] = useState(new Set());
  const [showShareOptions, setShowShareOptions] = useState({});
  const { comments, loading: commentsLoading } = useSelector(
    (state) => state.comments
  );

  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const commentRefs = useRef({});
  const [searchParams] = useSearchParams();
  const storyId = searchParams.get("storyId");
  const postId = searchParams.get("postId");
  const [videos, setVideos] = useState([]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState(null);
  const [isSelectShareOpen, setIsSelectShareOpen] = useState(false);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const scrollPositionRef = useRef(0);
  const sharedPostRef = useRef(null);
  const { pinging, totalFollowers, totalFollowing } = useSelector(
    (state) => state.followers || {}
  );

  const [isFollowing, setIsFollowing] = useState(false);
  const [isPingLoading, setIsPingLoading] = useState(false);
  const [localFollowers, setLocalFollowers] = useState(0);

  const [followStates, setFollowStates] = useState({});

  const videoRefs = useRef({});
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [shareCount, setshareCount] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const toggleDropdown = (id, e) => {
    if (e) e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleTogglePlay = (id, e) => {
    if (e) e.stopPropagation();
    const video = videoRefs.current[id];
    if (!video) return;

    if (currentPlaying === id && !video.paused) {
      video.pause();
      setCurrentPlaying(null);
    } else {
      if (currentPlaying && videoRefs.current[currentPlaying]) {
        videoRefs.current[currentPlaying].pause();
      }
      video.play().catch(() => { });
      setCurrentPlaying(id);
    }
  };

  const { userId } = useParams();

  const loggedInUserId = useSelector((state) => state.auth.user?._id);

  // Fetch stories
  const getStoriesInfo = async (pageNum = 1) => {
    if (loading) return;
    setLoading(true);
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
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos
  const getVideosInfo = async (pageNum = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const { payload } = await dispatch(
        getVideos({ token, setLoading, page: pageNum })
      );
      if (payload?.error === false) {
        const newVideo = payload?.data?.stories || [];
        if (newVideo.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        if (pageNum === 1) {
          setVideos(newVideo);
        } else {
          setVideos((prev) => [...prev, ...newVideo]);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll observer
  const lastStoryElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    setPage(1);
    setStories([]);
    setVideos([]);
  }, [storyId, postId]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (storyId) {
      getStoriesInfo(page);
    } else {
      getVideosInfo(page);
    }
  }, [page, token, navigate, storyId, postId, shareCount, trigger, isShareModalOpen]);

  useEffect(() => {
    if (storyId && stories.length > 0) {
      const matchedIndex = stories.findIndex((s) => s._id === storyId);
      if (matchedIndex > -1 && matchedIndex !== 0) {
        const matched = stories[matchedIndex];
        const others = stories.filter((_, idx) => idx !== matchedIndex);
        setStories([matched, ...others]);
      }
    }
  }, [stories, storyId]);

  useEffect(() => {
    if (postId && videos.length > 0) {
      const matchedIndex = videos.findIndex((v) => v._id === postId);
      if (matchedIndex > -1 && matchedIndex !== 0) {
        const matched = videos[matchedIndex];
        const others = videos.filter((_, idx) => idx !== matchedIndex);
        setVideos([matched, ...others]);
      }
    }
  }, [videos, postId]);

  useEffect(() => {
    if (stories.length > 0 && storyId && stories[0]?._id === storyId) {
      const id = storyId;
      if (videoRefs.current[id]) {
        if (currentPlaying && videoRefs.current[currentPlaying]) {
          videoRefs.current[currentPlaying].pause();
        }
        videoRefs.current[id].play().catch(() => { });
        setCurrentPlaying(id);
      }
    }
  }, [stories, storyId]);

  useEffect(() => {
    if (videos.length > 0 && postId && videos[0]?._id === postId) {
      const id = postId;
      if (videoRefs.current[id]) {
        if (currentPlaying && videoRefs.current[currentPlaying]) {
          videoRefs.current[currentPlaying].pause();
        }
        videoRefs.current[id].play().catch(() => { });
        setCurrentPlaying(id);
      }
    }
  }, [videos, postId]);

  // Handle like button
  const handleLike = (postId, e) => {
    // if (e) e.stopPropagation();
    if (!token) {
      return;
    }
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
        setLikeStates((prev) => ({
          ...prev,
          [postId]: {
            liked: wasLiked,
            count: currentCount,
          },
        }));
      }
    });
  };

  // Handle save button
  const handleSave = (postId, e) => {
    // if (e) e.stopPropagation();
    if (!token) {
      return;
    }
    dispatch(savePost({ postId, token })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setSavedStory((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(postId)) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
      } else {
      }
    });
  };

  const handleShare = async (postId, platform) => {
    setIsShareModalOpen(null);
    if (!token) {
      toast.error("Please login to share the post.");
      return;
    }

    const shareData = {
      type: "external",
      postId,
      platform,
      sharedToUserId: "",
    };

    try {
      const response = await dispatch(sharePost({ shareData, token })).unwrap();
      const sharedPost = response?.data;

      if (sharedPost && sharedPost.postId) {
        const shareUrl = getShareUrl(platform, sharedPost.postId);
        // window.open(shareUrl, "_blank");
        const updateSharedList = (list, setList) => {
          const updated = list.map((item) => {
            if (item._id === sharedPost.postId) {
              const newCount = (item.shareCount || item.sharesCount || 0) + 1;
              return { ...item, shareCount: newCount };
            }
            return item;
          });

          setList(updated);
        };

        sharedPostRef.current = sharedPost;
        if (storyId) {
          updateSharedList(stories, setStories);
        } else {
          updateSharedList(videos, setVideos);
        }

        setSelectedSharePost((prev) => ({
          ...prev,
          shareCount: (prev?.shareCount || prev?.sharesCount || 0) + 1,
        }));
      } else {
        toast.error(response?.data?.message || "Failed to share the post.");
      }
    } catch (error) {
      toast.error(error?.message || "An error occurred while sharing.");
    }
  };

  const toggleShareOptions = (postId) => {
    setShowShareOptions((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  useEffect(() => {
    const items = storyId ? stories : videos;
    if (items.length > 0) {
      const updatedLikeStates = {};
      const savedSet = new Set();
      const updatedFollowStates = {};
      items.forEach((item) => {
        const likeSource = item.media?.[0] || item;
        updatedLikeStates[item._id] = {
          liked: likeSource.isPostLike || false,
          count: likeSource.likesCount || 0,
        };
        if (item.isPostSave) {
          savedSet.add(item._id);
        }

        if (item?.user?._id) {
          updatedFollowStates[item.user._id] = item.user.isFollowed || false;
        }
      });
      setLikeStates(updatedLikeStates);
      setSavedStory(savedSet);
      setFollowStates((prev) => ({ ...prev, ...updatedFollowStates }));
    }
  }, [stories, videos, storyId, postId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeCommentPostId &&
        commentRefs.current[activeCommentPostId] &&
        !commentRefs.current[activeCommentPostId].contains(event.target)
      ) {
        setActiveCommentPostId(null);
      }
    };
    if (activeCommentPostId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeCommentPostId]);

  const getShareUrl = (platform, post) => {
    const shareText = encodeURIComponent(post.text || "Check out this post!");
    const shareUrl = encodeURIComponent(
      `${window.location.origin}/post/${post._id}`
    );
    switch (platform) {
      case "whatsapp":
        return `https://wa.me/?text=${shareText}%20${shareUrl}`;
      case "facebook":
        return `https://www.facebook.com/sharing/share-offsite/?url=${shareUrl}`;
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
      case "twitter":
        return `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
      case "telegram":
        return `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
      default:
        return "#";
    }
  };

  const handleCommentAdded = (postId) => {
    if (storyId) {
      setStories((prev) =>
        prev.map((story) =>
          story._id === postId
            ? { ...story, commentsCount: (story.commentsCount || 0) + 1 }
            : story
        )
      );
    } else {
      setVideos((prev) =>
        prev.map((video) =>
          video._id === postId
            ? { ...video, commentsCount: (video.commentsCount || 0) + 1 }
            : video
        )
      );
    }
  };

  // Handle inline comment change
  const handleCommentChange = (postId, value) => {
    setCommentTexts((prev) => ({ ...prev, [postId]: value }));
  };

  // Handle inline comment submit
  const handleSubmitComment = async (e, postId) => {
    e.preventDefault();
    if (!commentTexts[postId]?.trim()) {
      alert("Comment cannot be empty");
      return;
    }
    try {
      const { payload } = await dispatch(
        postComment({ postId, text: commentTexts[postId], token })
      );
      if (payload?.success) {
        setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
        handleCommentAdded(postId);
        dispatch(getComments({ postId, token }));
      } else {
        alert("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment");
    }
  };

  const handleOpenCommentSection = (postId, e) => {
    setSelectedCommentPostId(postId);
    setIsCommentModalOpen(true);
  };

  const handleCommentModalClose = () => {
    setIsCommentModalOpen(false);
    setSelectedCommentPostId(null);
  };

  useEffect(() => {
    if (loggedInUserId) {
      setIsFollowing(true);
      return;
    }

    if (userId && token && loggedInUserId) {
      setIsPingLoading(true);

      dispatch(fetchPingers({ token, userId, type: "list", page: 1 }))
        .unwrap()
        .then((response) => {
          const isUserFollowing =
            response?.pingers?.some(
              (follower) => follower._id === loggedInUserId
            ) || false;

          setIsFollowing(isUserFollowing);
          setLocalFollowers(response?.totalFollowers || 0);
        })
        .catch((err) => {
          console.error("Error fetching follow status:", err);
          setIsFollowing(false);
          toast.error("Failed to load follow status");
        })
        .finally(() => {
          setIsPingLoading(false);
        });
    }
  }, [token, loggedInUserId, dispatch]);

  const handlePingClick = (targetUserId, e) => {
    // if (e) e.stopPropagation();
    if (!token) {
      toast.error("Please login to follow");
      return;
    }

    if (loggedInUserId === targetUserId) {
      toast.info("You cannot follow yourself");
      return;
    }

    const isCurrentlyFollowing = followStates[targetUserId] || false;
    const actionType = isCurrentlyFollowing ? "unfollow" : "follow";

    setFollowStates((prev) => ({
      ...prev,
      [targetUserId]: !isCurrentlyFollowing,
    }));

    dispatch(followAction({ token, userId: targetUserId, type: actionType }))
      .unwrap()
      .then(() => {
        // toast.success(
        //   actionType === "follow" ? "Ping successfully" : "Unping successfully"
        // );
      })
      .catch((err) => {
        console.error("Follow action error:", err);
        setFollowStates((prev) => ({
          ...prev,
          [targetUserId]: isCurrentlyFollowing,
        }));
        toast.error(err.message || "Something went wrong");
      });
  };

  const deleteQast = async (id, e) => {
    // if (e) e.stopPropagation();
    try {
      if (!token) return;
      setLoader(true);

      const { payload } = await dispatch(
        deleteQastData({ id, token, setLoader })
      );

      if (payload?.error === false) {
        setStories((prev) => prev.filter((story) => story._id !== id));
        setVideos((prev) => prev.filter((video) => video._id !== id));
        // toast.success(payload?.message);
      } else {
        toast.error(payload?.message || "Failed to delete Qast");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoader(false);
    }
  };

  const handleReportClick = (postId, e) => {
    if (e) e.stopPropagation();
    scrollPositionRef.current = window.scrollY;
    setReportPostId(postId);
    setShowReportModal(true);
  };

  const handleSelectOption = (option) => {
    setIsSelectShareOpen(false);
    if (option === "external") {
      setIsShareModalOpen(true);
    } else if (option === "internal") {
      setIsInternalModalOpen(true);
    }
  };

  const updateShareCount = (postId, shareCountIncrement) => {
    const updateSharedList = (list, setList) => {
      const updated = list.map((item) => {
        if (item._id === postId) {
          const newCount =
            (item.shareCount || item.sharesCount || 0) + shareCountIncrement;
          return { ...item, shareCount: newCount };
        }
        return item;
      });
      setList(updated);
    };

    if (storyId) {
      updateSharedList(stories, setStories);
    } else {
      updateSharedList(videos, setVideos);
    }

    setSelectedSharePost((prev) => ({
      ...prev,
      shareCount:
        (prev?.shareCount || prev?.sharesCount || 0) + shareCountIncrement,
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
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setshareCount(true);
      setTrigger((prev) => prev + 1);
      if (response.status === 200 || response.data.error === false) {
        updateShareCount(selectedSharePost._id, selectedUsers.length);
      } else {
        toast.error(response.data.message || "Failed to share.");
      }
    } catch (err) {
      console.error("Failed to share post:", err);
      toast.error(err.response?.data?.message || "Failed to share.");
    }
  };

  const handleSelectShare = (post, e) => {
    // e.preventDefault();
    setSelectedSharePost(post);
    setIsSelectShareOpen(true);
  };

  const handlePlayEvent = (id) => {
    Object.entries(videoRefs.current).forEach(([key, v]) => {
      if (key !== id && v) {
        v.pause();
      }
    });
    setCurrentPlaying(id);
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
                <div className="col-md-8">
                  <div className="profile-wrapper-right">
                    <div className="short-feed-wrap">
                      {storyId ? (
                        stories?.length > 0 ? (
                          stories.map((story, index) => {
                            const isLast = index === stories.length - 1;
                            const user = story?.user || {};
                            const targetUserId = story.user?._id;
                            const id = story._id;
                            return (
                              <div
                                className="short-feed-box"
                                key={story._id || index}
                                ref={isLast ? lastStoryElementRef : null}
                              >
                                <div className="more-dropdown">
                                  <button
                                    className="dropdown-toggle btn btn-link"
                                    type="button"
                                    onClick={(e) =>
                                      toggleDropdown(story._id, e)
                                    }
                                  >
                                    <img src={morewhiteicon} alt="" />
                                  </button>
                                  {activeDropdown === story._id && (
                                    <ul className="dot-dropdown-menu">
                                      {user?._id === loggedInUserId ? (
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={(e) => {
                                              deleteQast(story._id, e);
                                              setActiveDropdown(null);
                                            }}
                                          >
                                            Delete
                                          </button>
                                        </li>
                                      ) : (
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={(e) => {
                                              handleReportClick(story._id, e);
                                              setActiveDropdown(null);
                                            }}
                                          >
                                            Report User
                                          </button>
                                        </li>
                                      )}
                                    </ul>
                                  )}
                                </div>
                                {/* <Link to={`/shortfeeds?storyId=${story._id}`}> */}
                                <div className="video-wrap">
                                  {story?.media?.[0]?.url ? (
                                    <>
                                      <video
                                        ref={(el) =>
                                          (videoRefs.current[id] = el)
                                        }
                                        width="100%"
                                        controls
                                        muted
                                        playsInline
                                        disablePictureInPicture
                                        controlsList="nofullscreen nodownload noplaybackrate"
                                        poster={`${story?.media?.[0]?.thumbnail || ""
                                          }`}
                                        onClick={(e) => e.stopPropagation()}
                                        onPlay={() => handlePlayEvent(id)}
                                        onError={(e) =>
                                          console.error("Video error:", e)
                                        }
                                        onLoadedMetadata={(e) => {
                                          const video = e.target;
                                          if (
                                            video.duration &&
                                            video.duration > 60
                                          ) {
                                            video.addEventListener(
                                              "timeupdate",
                                              () => {
                                                if (video.currentTime >= 60) {
                                                  video.pause();
                                                }
                                              }
                                            );
                                          }
                                        }}
                                      >
                                        <source
                                          src={`${story?.media?.[0]?.url}`}
                                          type="video/mp4"
                                        />
                                        <source
                                          src={`${story?.media?.[0]?.url.replace(
                                            ".mp4",
                                            ".webm"
                                          )}`}
                                          type="video/webm"
                                        />
                                        Your browser does not support the
                                        video tag.
                                      </video>
                                      <button
                                        className="play-btn"
                                        onClick={(e) =>
                                          handleTogglePlay(id, e)
                                        }
                                      ></button>
                                    </>
                                  ) : (
                                    <p>No video available</p>
                                  )}
                                </div>

                                <ul className="short-feed-icons mt-4">
                                  <li className="mt-4">
                                    <button
                                      className="d-flex"
                                      onClick={(e) =>
                                        handleLike(story._id, e)
                                      }
                                    >
                                      <img
                                        src={
                                          likeStates[story._id]?.liked
                                            ? storylike
                                            : favicon
                                        }
                                        alt="Like icon"
                                        style={{
                                          width: "24px",
                                          height: "24px",
                                          objectFit: "contain",
                                          display: "block",
                                        }}
                                      />
                                      <span>
                                        {likeStates[story._id]?.count || 0}
                                      </span>
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={(e) =>
                                        handleOpenCommentSection(story._id, e)
                                      }
                                    >
                                      <img
                                        src={commenticonwhite}
                                        alt="Comment icon"
                                      />
                                      <span>{story?.commentsCount || 0}</span>
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={(e) =>
                                        handleSelectShare(story, e)
                                      }
                                    >
                                      <img
                                        src={shareiconwhite}
                                        alt="Share icon"
                                      />
                                      <span>{story?.sharesCount || 0}</span>
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={(e) =>
                                        handleSave(story._id, e)
                                      }
                                    >
                                      {savedStory.has(story._id) ? (
                                        <FaBookmark size={24} color="white" />
                                      ) : (
                                        <img
                                          src={saveiconwhite}
                                          alt="Save icon"
                                          style={{
                                            width: "24px",
                                            height: "24px",
                                            objectFit: "contain",
                                            display: "block",
                                          }}
                                        />
                                      )}
                                    </button>
                                  </li>
                                </ul>
                                <div className="short-feed-footer">
                                  <div className="profilemain">
                                    <div className="profile-pic-wrap">
                                      <Link
                                        // to={
                                        //   user?.role === "customer"
                                        //     ? `/commanuserprofile/${user?._id}`
                                        //     : `/commanuserviewbusiness/${user?._id}`
                                        // }

                                        to={
                                          story.user?._id === userdata?._id
                                            ? userdata.role === "business"
                                              ? "/mybusinessprofile"
                                              : "/profile"
                                            : user?.role === "customer"
                                              ? `/commanuserprofile/${user?._id}`
                                              : `/commanuserviewbusiness/${user?._id}`
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {user?.profilePicture ? (
                                          <img
                                            src={user.profilePicture}
                                            className={
                                              user?.role === "business"
                                                ? "Businesso"
                                                : "Profileo"
                                            }
                                            alt="profile"
                                          />
                                        ) : (
                                          <div
                                            className={
                                              user?.role === "business"
                                                ? "Businesso initials"
                                                : "Profileo initials"
                                            }
                                          >
                                            <span>
                                              {user?.role === "business"
                                                ? `${user?.businessName?.charAt(
                                                  0
                                                ) || ""
                                                }${user?.businessName
                                                  ?.split(" ")[1]
                                                  ?.charAt(0) || ""
                                                }`
                                                : `${user?.firstName?.charAt(
                                                  0
                                                ) || ""
                                                }${user?.lastName?.charAt(
                                                  0
                                                ) || ""
                                                }`}
                                            </span>
                                          </div>
                                        )}
                                      </Link>
                                      <span>
                                        <Link
                                          // to={
                                          //   user?.role === "customer"
                                          //     ? `/commanuserprofile/${user?._id}`
                                          //     : `/commanuserviewbusiness/${user?._id}`
                                          // }

                                          to={
                                            story.user?._id === userdata?._id
                                              ? userdata.role === "business"
                                                ? "/mybusinessprofile"
                                                : "/profile"
                                              : user?.role === "customer"
                                                ? `/commanuserprofile/${user?._id}`
                                                : `/commanuserviewbusiness/${user?._id}`
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {user?.role === "business"
                                            ? user?.businessName
                                            : `${user?.firstName || "Unknown"
                                            } ${user?.lastName || ""}`}
                                        </Link>
                                      </span>
                                    </div>
                                    <div>
                                      {story.user?._id !== userdata?._id && (
                                        <a
                                          className="btn btn-outline-secondary"
                                          onClick={(e) =>
                                            handlePingClick(targetUserId, e)
                                          }
                                        >
                                          {story.user?._id === userdata?._id
                                            ? ""
                                            : followStates[targetUserId]
                                              ? "Unping"
                                              : "Ping"}
                                        </a>
                                      )}
                                    </div>

                                  </div>
                                  <div className="qlip-text">
                                    <p>{story?.text || ""}</p>
                                  </div>
                                  {activeCommentPostId === story._id && (
                                    <div
                                      className="comment-section"
                                      ref={(el) =>
                                        (commentRefs.current[story._id] = el)
                                      }
                                    >
                                      <form
                                        onSubmit={(e) =>
                                          handleSubmitComment(e, story._id)
                                        }
                                      >
                                        <input
                                          type="text"
                                          value={
                                            commentTexts[story._id] || ""
                                          }
                                          onChange={(e) =>
                                            handleCommentChange(
                                              story._id,
                                              e.target.value
                                            )
                                          }
                                          placeholder="Write a comment..."
                                        />
                                        <button type="submit">Post</button>
                                      </form>
                                      {commentsLoading ? (
                                        <p>Loading comments...</p>
                                      ) : (
                                        <ul>
                                          {comments?.map((comment) => (
                                            <li key={comment._id}>
                                              {comment.text}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {/* </Link> */}
                              </div>
                            );
                          })
                        ) : (
                          <p>No stories available</p>
                        )
                      ) : videos?.length > 0 ? (
                        videos.map((video, index) => {
                          const isLast = index === videos.length - 1;
                          const user = video?.user || {};
                          const targetUserId = video.user?._id;
                          const id = video._id;
                          return (
                            <div
                              className="short-feed-box"
                              key={video._id || index}
                              ref={isLast ? lastStoryElementRef : null}
                            >
                              <div className="more-dropdown">
                                <button
                                  className="dropdown-toggle btn btn-link"
                                  type="button"
                                  onClick={(e) => toggleDropdown(video._id, e)}
                                >
                                  <img src={morewhiteicon} alt="" />
                                </button>
                                {activeDropdown === video._id && (
                                  <ul className="dot-dropdown-menu">
                                    {user?._id === loggedInUserId ? (
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={(e) => {
                                            deleteQast(video._id, e);
                                            setActiveDropdown(null);
                                          }}
                                        >
                                          Delete
                                        </button>
                                      </li>
                                    ) : (
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={(e) => {
                                            handleReportClick(video._id, e);
                                            setActiveDropdown(null);
                                          }}
                                        >
                                          Report User
                                        </button>
                                      </li>
                                    )}
                                  </ul>
                                )}
                              </div>
                              {/* <Link to={`/shortfeeds?postId=${video._id}`}> */}
                              <div className="video-wrap">
                                {video?.media?.[0]?.url ? (
                                  <>
                                    <video
                                      ref={(el) =>
                                        (videoRefs.current[id] = el)
                                      }
                                      width="100%"
                                      controls
                                      muted
                                      playsInline
                                      disablePictureInPicture
                                      controlsList="nofullscreen nodownload noplaybackrate"
                                      poster={`${video?.media?.[0]?.thumbnail || ""
                                        }`}
                                      onClick={(e) => e.stopPropagation()}
                                      onPlay={() => handlePlayEvent(id)}
                                      onError={(e) =>
                                        console.error("Video error:", e)
                                      }
                                      onLoadedMetadata={(e) => {
                                        const videoEl = e.target;
                                        if (
                                          videoEl.duration &&
                                          videoEl.duration > 60
                                        ) {
                                          videoEl.addEventListener(
                                            "timeupdate",
                                            () => {
                                              if (videoEl.currentTime >= 60) {
                                                videoEl.pause();
                                              }
                                            }
                                          );
                                        }
                                      }}
                                    >
                                      <source
                                        src={`${video?.media?.[0]?.url}`}
                                        type="video/mp4"
                                      />
                                      <source
                                        src={`${video?.media?.[0]?.url.replace(
                                          ".mp4",
                                          ".webm"
                                        )}`}
                                        type="video/webm"
                                      />
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                    <button
                                      className="play-btn"
                                      onClick={(e) => handleTogglePlay(id, e)}
                                    ></button>
                                  </>
                                ) : (
                                  <p>No video available</p>
                                )}
                              </div>
                              <div className="short-feed-footer">
                                <div className="profilemain">
                                  <div className="profile-pic-wrap">
                                    <Link
                                      // to={
                                      //   user?.role === "customer"
                                      //     ? `/commanuserprofile/${user?._id}`
                                      //     : `/commanuserviewbusiness/${user?._id}`
                                      // }

                                      to={
                                        video.user?._id === userdata?._id
                                          ? userdata.role === "business"
                                            ? "/mybusinessprofile"
                                            : "/profile"
                                          : user?.role === "customer"
                                            ? `/commanuserprofile/${user?._id}`
                                            : `/commanuserviewbusiness/${user?._id}`
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {user?.profilePicture ? (
                                        <img
                                          src={user.profilePicture}
                                          className={
                                            user?.role === "business"
                                              ? "Businesso"
                                              : "Profileo"
                                          }
                                          alt="profile"
                                        />
                                      ) : (
                                        <div
                                          className={
                                            user?.role === "business"
                                              ? "Businesso initials"
                                              : "Profileo initials"
                                          }
                                        >
                                          <span>
                                            {user?.role === "business"
                                              ? `${user?.businessName?.charAt(
                                                0
                                              ) || ""
                                              }${user?.businessName
                                                ?.split(" ")[1]
                                                ?.charAt(0) || ""
                                              }`
                                              : `${user?.firstName?.charAt(
                                                0
                                              ) || ""
                                              }${user?.lastName?.charAt(0) ||
                                              ""
                                              }`}
                                          </span>
                                        </div>
                                      )}
                                    </Link>
                                    <span>
                                      <Link
                                        // to={
                                        //   user?.role === "customer"
                                        //     ? `/commanuserprofile/${user?._id}`
                                        //     : `/commanuserviewbusiness/${user?._id}`
                                        // }

                                        to={
                                          video.user?._id === userdata?._id
                                            ? userdata.role === "business"
                                              ? "/mybusinessprofile"
                                              : "/profile"
                                            : user?.role === "customer"
                                              ? `/commanuserprofile/${user?._id}`
                                              : `/commanuserviewbusiness/${user?._id}`
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {user?.role === "business"
                                          ? user?.businessName
                                          : `${user?.firstName || "Unknown"
                                          } ${user?.lastName || ""}`}
                                      </Link>
                                    </span>
                                  </div>
                                  <div>

                                  </div>
                                  {video.user?._id !== userdata?._id && (
                                    <a
                                      className="btn btn-outline-secondary"
                                      onClick={(e) =>
                                        handlePingClick(targetUserId, e)
                                      }
                                    >
                                      {video.user?._id === userdata?._id
                                        ? ""
                                        : followStates[targetUserId]
                                          ? "Unping"
                                          : "Ping"}
                                    </a>
                                  )}
                                </div>
                                <div className="qlip-text">
                                  <p>{video?.text || ""}</p>
                                </div>
                                {activeCommentPostId === video._id && (
                                  <div
                                    className="comment-section"
                                    ref={(el) =>
                                      (commentRefs.current[video._id] = el)
                                    }
                                  >
                                    <form
                                      onSubmit={(e) =>
                                        handleSubmitComment(e, video._id)
                                      }
                                    >
                                      <input
                                        type="text"
                                        value={commentTexts[video._id] || ""}
                                        onChange={(e) =>
                                          handleCommentChange(
                                            video._id,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Write a comment..."
                                      />
                                      <button type="submit">Post</button>
                                    </form>
                                    {commentsLoading ? (
                                      <p>Loading comments...</p>
                                    ) : (
                                      <ul>
                                        {comments?.map((comment) => (
                                          <li key={comment._id}>
                                            {comment.text}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div>
                                <ul className="short-feed-icons">
                                  <li>
                                    <button
                                      onClick={(e) =>
                                        handleLike(video._id, e)
                                      }
                                    >
                                      <img
                                        src={
                                          likeStates[video._id]?.liked
                                            ? storylike
                                            : favicon
                                        }
                                        alt="Like icon"
                                      />
                                      <span>
                                        {likeStates[video._id]?.count || 0}
                                      </span>
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={(e) =>
                                        handleOpenCommentSection(video._id, e)
                                      }
                                    >
                                      <img
                                        src={commenticonwhite}
                                        alt="Comment icon"
                                      />
                                      <span>{video?.commentsCount || 0}</span>
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={(e) =>
                                        handleSelectShare(video, e)
                                      }
                                    >
                                      <img
                                        src={shareiconwhite}
                                        alt="Share icon"
                                      />
                                      <span>{video?.shareCount || 0}</span>
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={(e) =>
                                        handleSave(video._id, e)
                                      }
                                    >
                                      <img
                                        src={
                                          savedStory.has(video._id)
                                            ? storysave
                                            : saveiconwhite
                                        }
                                        alt="Save icon"
                                      />
                                    </button>
                                  </li>
                                </ul>
                              </div>
                              {/* </Link> */}
                            </div>
                          );
                        })
                      ) : (
                        <p>No videos available</p>
                      )}
                      {loading && <p>Loading more video and Story...</p>}
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
            const sourceArray = storyId ? stories : videos;
            const post = sourceArray.find((p) => p._id === reportPostId);

            if (!post || !post.userId) {
              return;
            }
            dispatch(
              reportPost({
                reportedUserId: post?.userId,
                reason,
                additionalDetails,
                token,
              })
            );
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
        onCommentAdded={() => handleCommentAdded(selectedCommentPostId)}
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
        onShare={handleShare}
      />
    </div>
  );
};

export default Shortfeeds;