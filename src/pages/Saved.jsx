import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSavedPostandStories } from "../feature/savedPostandStoriesSlice";
import { Link } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader";
import Sidebar from "../components/Sidebar";

const Saved = () => {
  const videoRefs = useRef([]);
  const dispatch = useDispatch();

  const { items, loading } = useSelector((state) => state?.savedPostandStories);
  const { postsDetails = [], currentPage = 1, totalPages = 1 } = items || {};

  const token = useSelector((state) => state.auth?.token);

  // Load first page
  useEffect(() => {
    if (token) {
      dispatch(getSavedPostandStories({ token, page: 1 }));
    }
  }, [dispatch, token]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loading) return;
    if (currentPage >= totalPages) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      dispatch(getSavedPostandStories({ token, page: currentPage + 1 }));
    }
  }, [dispatch, token, currentPage, totalPages, loading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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
                  <div className="profile-wrapper-right saved-qlip-videos-wrap">
                    <h3 className="main-heading">
                      Saved Qlip Videos/Saved Qasts
                    </h3>

                    <div className="saved-qlip-videos">
                      {postsDetails.map((post, postIndex) => {
                        const mediaArray = Array.isArray(post.media)
                          ? post.media
                          : [];

                        // No media → show text
                        if (mediaArray.length === 0) {
                          return (
                            <Link
                              to={`/savedqastview/${post._id}`}
                              key={post._id}
                              className="saved-video saved-text"
                            >
                              <p>{post.content || "No media available."}</p>
                            </Link>
                          );
                        }

                        // Media → render each item
                        // return mediaArray.map((media, mediaIndex) => {
                        // const fullUrl = media.url;

                        // if (media.url?.endsWith(".mp4")) {
                        //   return (
                        //     <Link
                        //       to={`/savedqastview/${post._id}`}
                        //       key={`${post._id}-${mediaIndex}`}
                        //       className="saved-video"
                        //     >
                        //       <video
                        //         controls
                        //         disablePictureInPicture
                        //         controlsList="nodownload noremoteplayback noplaybackrate"
                        //         width="100%"
                        //         poster={media.thumbnail || ""}
                        //         ref={(el) => {
                        //           if (el) {
                        //             videoRefs.current[`${postIndex}-${mediaIndex}`] = el;
                        //           }
                        //         }}
                        //       >
                        //         <source src={fullUrl} type="video/mp4" />
                        //       </video>
                        //     </Link>
                        //   );
                        // }

                        // if (/\.(jpg|jpeg|png|webp|gif)$/i.test(media.url)) {
                        //   return (
                        //     <Link
                        //       to={`/savedqastview/${post._id}`}
                        //       key={`${post._id}-${mediaIndex}`}
                        //       className="saved-image"
                        //     >
                        //       <img src={fullUrl} alt="Saved media" />
                        //     </Link>
                        //   );
                        // }

                        // return null;
                        // });

                        const firstMedia = mediaArray[0];
                        const fullUrl = firstMedia?.url;

                        if (firstMedia) {
                          if (fullUrl?.endsWith(".mp4")) {
                            return (
                              <Link
                                to={`/savedqastview/${post._id}`}
                                key={`${post._id}-0`}
                                className="saved-video"
                              >
                                <video
                                  controls
                                  disablePictureInPicture
                                  controlsList="nodownload noremoteplayback noplaybackrate"
                                  width="100%"
                                  poster={firstMedia.thumbnail || ""}
                                  ref={(el) => {
                                    if (el) {
                                      videoRefs.current[`${postIndex}-0`] = el;
                                    }
                                  }}
                                >
                                  <source src={fullUrl} type="video/mp4" />
                                </video>
                              </Link>
                            );
                          }

                          if (/\.(jpg|jpeg|png|webp|gif)$/i.test(fullUrl)) {
                            return (
                              <Link
                                to={`/savedqastview/${post._id}`}
                                key={`${post._id}-0`}
                                className="saved-image"
                              >
                                <img src={fullUrl} alt="Saved media" />
                              </Link>
                            );
                          }
                        }

                        return null;
                      })}

                      {loading && <p>Loading more...</p>}
                    </div>
                    {/* {currentPage >= totalPages && (
                      <p style={{ textAlign: "center" }}>
                        No more saved items.
                      </p>
                    )} */}
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

export default Saved;