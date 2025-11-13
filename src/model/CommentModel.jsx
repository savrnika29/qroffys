// import React, { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getComments, postComment } from "../feature/commentSlice";
// import { toast } from "react-toastify";
// import { incrementBusinessPostComments } from "../feature/mybusinesspostSlice"

// const CommentModal = ({ postId, token, isOpen, onClose, onCommentAdded }) => {
//   const dispatch = useDispatch();
//   const {
//     comments,
//     loading: commentsLoading,
//     error,
//   } = useSelector((state) => state.comments);
//   const [text, setText] = React.useState("");
//   const commentRef = useRef(null);
//   const VITE_API_URL = import.meta.env.VITE_API_URL;

//   // Fetch comments when modal opens
//   useEffect(() => {
//     if (isOpen && postId && token) {
//       dispatch(getComments({ postId, token }));
//     }
//   }, [isOpen, postId, token, dispatch]);

//   // Handle click outside to close modal
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (commentRef.current && !commentRef.current.contains(event.target)) {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isOpen, onClose]);

//   // Handle comment submission
//   const handleSubmitComment = (e) => {
//     e.preventDefault();
//     if (!text.trim()) {
//       toast.error("Comment cannot be empty.");
//       return;
//     }

//     // The comment count will be automatically updated by the extraReducers
//     // in the home post slice when postComment.fulfilled is dispatched
//     dispatch(postComment({ postId, text, token })).then((res) => {
//       if (res.meta.requestStatus === "fulfilled") {
//         setText("");
//         // Refresh comments to get the latest list
//         dispatch(getComments({ postId, token }));
//         dispatch(incrementBusinessPostComments({ postId }));

//         if (onCommentAdded) {
//           onCommentAdded();
//         }
//       } else {
//         console.error("Comment post failed:", res.error);
//       }
//     });
//   };

//   // Format timestamp to readable date and time
//   const formatDateTime = (timestamp) => {
//     return new Date(timestamp).toLocaleString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="modal fade show comment-popup"
//       style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
//       tabIndex="-1"
//       role="dialog"
//     >
//       <div
//         className="modal-dialog modal-dialog-centered"
//         role="document"
//         ref={commentRef}
//       >
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title">Comments</h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={onClose}
//               aria-label="Close"
//             ></button>
//           </div>
//           <div className="modal-body">
//             {/* {commentsLoading && <p>Loading comments...</p>} */}
//             {error && <p className="text-danger">Error: {error.message}</p>}
//             {comments.length > 0 ? (
//               <ul className="list-unstyled">
//                 {comments?.map((c) => (
//                   // <li key={c._id} className="mb-3 d-flex align-items-start">
//                   //   <img
//                   //     src={`${c.userId?.profilePicture || "/default.png"}`}
//                   //     alt="profile"
//                   //     style={{
//                   //       width: "40px",
//                   //       height: "40px",
//                   //       borderRadius: "50%",
//                   //       marginRight: "10px",
//                   //       objectFit: "cover",
//                   //     }}
//                   //   />
//                   //   <div>
//                   //     <strong>{c.text}</strong>
//                   //     <p className="mb-1">
//                   //       <small className="smaller-font-size">
//                   //         {c.userId?.role === "business"
//                   //           ? c.userId?.businessName
//                   //           : `${c.userId?.firstName} ${c.userId?.lastName}`}
//                   //       </small>

//                   //     </p>
//                   //     <small className="text-muted date-time">
//                   //       {formatDateTime(c.createdAt)}
//                   //     </small>
//                   //   </div>
//                   // </li> 
//                   <li key={c?._id} className="mb-3 d-flex align-items-start">
//                     {c?.userId?.profilePicture ? (
//                       <img
//                         src={c.userId.profilePicture}
//                         alt="profile"
//                         style={{
//                           width: "40px",
//                           height: "40px",
//                           borderRadius: "50%",
//                           marginRight: "10px",
//                           objectFit: "cover",
//                         }}
//                       />
//                     ) : (
//                       <div className="business-profile-circle"
//                         style={{
//                           width: "40px",
//                           height: "40px",
//                           borderRadius: "50%",
//                           marginRight: "10px",
//                           backgroundColor: "#6c757d",
//                           color: "#fff",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           fontWeight: "bold",
//                           fontSize: "14px",
//                           textTransform: "uppercase",
//                         }}
//                       >
//                         <span>
//                           {c?.userId?.role === "business"
//                             ? c?.userId?.businessName?.[0] || "B"
//                             : `${c?.userId?.firstName?.[0] || ""}${c?.userId?.lastName?.[0] || ""}`}
//                         </span>
//                       </div>
//                     )}
//                     <div>
//                       <strong>{c?.text}</strong>
//                       <p className="mb-1">
//                         <small>
//                           {c?.userId?.role === "business"
//                             ? c?.userId?.businessName
//                             : `${c?.userId?.firstName} ${c?.userId?.lastName}`}
//                         </small>
//                       </p>
//                       <small className="text-muted date-time">
//                         {formatDateTime(c.createdAt)}
//                       </small>
//                     </div>
//                   </li>

//                 ))}
//               </ul>
//             ) : (
//               <p>No comments yet.</p>
//             )}
//           </div>
//           <div className="modal-footer">
//             <form onSubmit={handleSubmitComment} className="d-flex w-100">
//               <input
//                 type="text"
//                 className="form-control me-2"
//                 placeholder="Write a comment..."
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//               />
//               <button
//                 type="submit"
//                 className="btn btn-primary"
//                 disabled={commentsLoading}
//               >
//                 Post
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CommentModal;


import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getComments, postComment } from "../feature/commentSlice";
import { incrementBusinessPostComments as incrementSavedPostComments } from "../feature/savedPostandStoriesSlice";
import { incrementBusinessPostComments } from "../feature/mybusinesspostSlice";
import { toast } from "react-toastify";

const CommentModal = ({ postId, token, isOpen, onClose, onCommentSubmit }) => {
  const dispatch = useDispatch();
  const {
    comments,
    loading: commentsLoading,
    error,
  } = useSelector((state) => state.comments);
  const [text, setText] = React.useState("");
  const commentRef = useRef(null);
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && postId && token) {
      console.log(`CommentModal: Fetching comments for postId: ${postId}`);
      dispatch(getComments({ postId, token }));
    }
  }, [isOpen, postId, token, dispatch]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentRef.current && !commentRef.current.contains(event.target)) {
        console.log("CommentModal: Clicked outside, closing modal");
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      console.log("CommentModal: Comment is empty, showing error");
      toast.error("Comment cannot be empty.");
      return;
    }
    if (!postId || !token) {
      console.error(`CommentModal: Missing postId or token, postId: ${postId}, token: ${token}`);
      toast.error("Missing post ID or token.");
      return;
    }

    console.log(`CommentModal: Dispatching postComment for postId: ${postId}, text: ${text}`);
    try {
      const result = await dispatch(postComment({ postId, text, token })).unwrap();
      console.log(`CommentModal: postComment succeeded, result:`, result);
      setText("");
      dispatch(getComments({ postId, token }));
      
      // Dispatch to both slices
      const payload = { postId, commentsCount: result.commentsCount || null };
      console.log(`CommentModal: Dispatching incrementBusinessPostComments to both slices with payload:`, payload);
      dispatch(incrementSavedPostComments(payload));
      dispatch(incrementBusinessPostComments(payload));
      
      if (onCommentSubmit) {
        console.log(`CommentModal: Calling onCommentSubmit with postId: ${postId}, commentsCount: ${result.commentsCount}`);
        onCommentSubmit({ postId, commentsCount: result.commentsCount });
      }
    } catch (err) {
      console.error(`CommentModal: postComment failed with error:`, err);
      toast.error(err.message || "Failed to post comment");
    }
  };

  // Format timestamp to readable date and time
  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show comment-popup"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        ref={commentRef}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Comments</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {commentsLoading && <p>Loading comments...</p>}
            {error && <p className="text-danger">Error: {error.message}</p>}
            {comments.length > 0 ? (
              <ul className="list-unstyled">
                {comments?.map((c) => (
                  <li key={c?._id} className="mb-3 d-flex align-items-start">
                    {c?.userId?.profilePicture ? (
                      <img
                        src={c.userId.profilePicture}
                        alt="profile"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          marginRight: "10px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="business-profile-circle"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          marginRight: "10px",
                          backgroundColor: "#6c757d",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "14px",
                          textTransform: "uppercase",
                        }}
                      >
                        <span>
                          {c?.userId?.role === "business"
                            ? c?.userId?.businessName?.[0] || "B"
                            : `${c?.userId?.firstName?.[0] || ""}${c?.userId?.lastName?.[0] || ""}`}
                        </span>
                      </div>
                    )}
                    <div>
                      <strong>{c?.text}</strong>
                      <p className="mb-1">
                        <small>
                          {c?.userId?.role === "business"
                            ? c?.userId?.businessName
                            : `${c?.userId?.firstName} ${c?.userId?.lastName}`}
                        </small>
                      </p>
                      <small className="text-muted date-time">
                        {formatDateTime(c.createdAt)}
                      </small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments yet.</p>
            )}
          </div>
          <div className="modal-footer">
            <form onSubmit={handleSubmitComment} className="d-flex w-100">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={commentsLoading}
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;