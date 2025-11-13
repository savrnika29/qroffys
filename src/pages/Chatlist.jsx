import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { clientChatUsers } from "../feature/chat";
import { clientChatUsers } from "../feature/chatSlice";
import { profilepic } from "../imaUrl";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

const Chatlist = () => {
  const dispatch = useDispatch();
  const { chatList, loadingUsers, errorUsers, unreadCounts } = useSelector(
    (state) => state.chat
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    dispatch(clientChatUsers({ setLoading: (value) => {} }));
  }, [dispatch]);

  // Filter users based on search query
  // useEffect(() => {
  //   if (chatList?.users) {
  //     setFilteredUsers(
  //       chatList.users.filter((user) =>
  //         (user.userName || user.firstName || user.businessName || "")
  //           .toLowerCase()
  //           .includes(searchQuery.toLowerCase())
  //       )
  //     );
  //   }
  // }, [searchQuery, chatList]);
  useEffect(() => {
    if (chatList?.users) {
      const sortedUsers = [...chatList.users].sort(
        (a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime)
      );
      setFilteredUsers(
        sortedUsers.filter((user) =>
          (user.userName || user.firstName || user.businessName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, chatList]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Format latest message time
  const formatTime = (time) => {
    return new Date(time).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasUnreadMessages = (userId) => {
    return chatList?.messages?.some(
      (message) => message.receiverId === userId && !message.isRead
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
                {/* <div className="col-md-3">
                  <Sidebar />
                </div> */}
                <div className="col-md-12">
                  <div className="personal-chat-wrap chat-list-main-wrap">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="personal-chat-details">
                          <div className="input-border-wrap">
                            <input
                              id="chat-enter"
                              type="text"
                              className="form-control"
                              placeholder="Search"
                              value={searchQuery}
                              onChange={handleSearchChange}
                            />
                            <button type="submit" className="btn" />
                          </div>
                          {loadingUsers && <Loader />}
                          {errorUsers && (
                            <div className="alert alert-danger">
                              {typeof errorUsers === "string"
                                ? errorUsers
                                : errorUsers.message ||
                                  "Failed to load chat list"}
                            </div>
                          )}
                          <div className="chat-list-wrap">
                            {chatList?.users?.length > 0 ? (
                              <ul className="chat-list">
                                {filteredUsers.map((user) => (
                                  <li key={user._id}>
                                    <Link
                                      to={`/personalchat/${user._id}`}
                                      state={{ user }} // Pass the user object
                                    >
                                      <div className="personal-chat-profile">
                                        {/* <figure>
                                          <img
                                            src={
                                              user.profilePicture
                                                ? `${VITE_API_URL}${user.profilePicture}`
                                                : profilepic
                                            }
                                            alt={`${
                                              user.userName ||
                                              user.firstName ||
                                              user.businessName
                                            }`}
                                            onError={(e) => {
                                              e.target.src = profilepic;
                                            }}
                                          />
                                        </figure>
                                        <div className="chat-info">
                                          <span>
                                            {user.businessName ||
                                              `${user.firstName || ""} ${
                                                user.lastName || ""
                                              }`.trim() ||
                                              user.userName}
                                          </span>
                                         
                                          <small className="chat-time">
                                            {user.latestMessageTime
                                              ? formatTime(
                                                  user.latestMessageTime
                                                )
                                              : ""}
                                          </small>
                                          </div> */}
                                        {/* <i className="dot"></i> */}
                                        {user.role === "customer" ||
                                        user.role === "admin" ? (
                                          // CUSTOMER: Always show profile picture (or default)
                                          <figure>
                                            <img
                                              src={
                                                user.profilePicture
                                                  ? `${user.profilePicture}`
                                                  : profilepic
                                              }
                                              alt={
                                                user.userName ||
                                                user.firstName ||
                                                user.businessName ||
                                                "Profile"
                                              }
                                              onError={(e) => {
                                                e.target.src = profilepic;
                                              }}
                                            />
                                            {user.isOnline && (
                                              <i className="online-dot"></i>
                                            )}
                                          </figure>
                                        ) : user.role === "business" ? (
                                          user.profilePicture ? (
                                            // BUSINESS: Show profile picture if available
                                            <figure>
                                              <img
                                                src={`${user.profilePicture}`}
                                                alt={
                                                  user.businessName ||
                                                  "Business"
                                                }
                                                onError={(e) => {
                                                  e.target.src = profilepic;
                                                }}
                                              />
                                              {user.isOnline && (
                                                <i className="online-dot"></i>
                                              )}
                                            </figure>
                                          ) : (
                                            // BUSINESS: Show initials if no profile picture
                                            <div className="initial-circle">
                                              <span>
                                                {user.businessName
                                                  ? (() => {
                                                      const nameParts =
                                                        user.businessName
                                                          .trim()
                                                          .split(" ");
                                                      const firstInitial =
                                                        nameParts[0]
                                                          ?.charAt(0)
                                                          ?.toUpperCase() || "";
                                                      const lastInitial =
                                                        nameParts.length > 1
                                                          ? nameParts[
                                                              nameParts.length -
                                                                1
                                                            ]
                                                              ?.charAt(0)
                                                              ?.toUpperCase()
                                                          : "";
                                                      return (
                                                        firstInitial +
                                                          lastInitial || "B"
                                                      );
                                                    })()
                                                  : "B"}
                                              </span>
                                            </div>
                                          )
                                        ) : null}

                                        <div className="chat-info">
                                          <span>
                                            {user.businessName ||
                                              `${user.firstName || ""} ${
                                                user.lastName || ""
                                              }`.trim() ||
                                              user.userName}
                                          </span>
                                          {unreadCounts &&
                                            unreadCounts?.[user._id] > 0 && (
                                              <span className="unread-badge">
                                                {unreadCounts[user._id]}
                                              </span>
                                            )}
                                          <small className="chat-time">
                                            {user.latestMessageTime
                                              ? formatTime(
                                                  user.latestMessageTime
                                                )
                                              : ""}
                                          </small>
                                          {/* <i className="dot"></i> */}
                                        </div>
                                      </div>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              !loadingUsers && (
                                <div className="text-center mt-4">
                                  <p style={{ color: "#666" }}>
                                    No chats found
                                  </p>
                                </div>
                              )
                            )}
                          </div>
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

export default Chatlist;
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { clientChatUsers } from "../feature/chatSlice";
// import { profilepic } from "../imaUrl";
// import Sidebar from "../components/Sidebar";
// import ProfileHeader from "../components/ProfileHeader";
// import { Link } from "react-router-dom";
// import Loader from "../components/Loader";
// import { toast } from "react-toastify";

// const Chatlist = () => {
//   const dispatch = useDispatch();
//   const { chatList, loadingUsers, errorUsers } = useSelector(
//     (state) => state.chat
//   );
//   // Get current user from auth state - try different possible paths
//   const authState = useSelector((state) => state.auth);
//   const currentUser =
//     authState?.user || authState?.currentUser || authState?.userInfo;

//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const VITE_API_URL = import.meta.env.VITE_API_URL;

//   // Debug logs - check user object structure
//   console.log("Auth State:", authState);
//   console.log("Current User:", currentUser);
//   console.log("Full Chat List Object:", chatList);
//   console.log("First User Object:", chatList?.users?.[0]);
//   console.log("Current User ID:", currentUser?._id);

//   useEffect(() => {
//     dispatch(clientChatUsers({ setLoading: (value) => {} }));
//   }, [dispatch]);

//   // Filter users based on search query
//   useEffect(() => {
//     if (chatList?.users) {
//       setFilteredUsers(
//         chatList.users.filter((user) =>
//           (user.userName || user.firstName || user.businessName || "")
//             .toLowerCase()
//             .includes(searchQuery.toLowerCase())
//         )
//       );
//     }
//   }, [searchQuery, chatList]);

//   // Handle search input change
//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   // Format latest message time
//   const formatTime = (time) => {
//     return new Date(time).toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Check for unread messages - updated to work with available data
//   const hasUnreadMessages = (user) => {
//     if (!currentUser?._id) return false;

//     // Check if user object has unread message info
//     // Common patterns in chat APIs:
//     if (user.unreadCount && user.unreadCount > 0) {
//       return true;
//     }

//     if (user.hasUnreadMessage) {
//       return true;
//     }

//     if (user.unreadMessages && user.unreadMessages > 0) {
//       return true;
//     }

//     // Check if there's unread status in latest message
//     if (
//       user.latestMessage &&
//       !user.latestMessage.isRead &&
//       user.latestMessage.senderId !== currentUser._id
//     ) {
//       return true;
//     }

//     // If none of the above, return false for now
//     // We'll adjust based on what we see in the user object
//     console.log("User object for unread check:", user);
//     return false;
//   };

//   // Alternative function if the above doesn't work
//   const hasUnreadMessagesAlt = (userId) => {
//     if (!chatList?.messages || !currentUser?._id) return false;

//     // Check all combinations to debug
//     const result = chatList.messages.some((message) => {
//       const isSenderMatch = message.senderId === userId;
//       const isReceiverMatch = message.receiverId === currentUser._id;
//       const isUnread = !message.isRead;

//       if (isSenderMatch && isReceiverMatch) {
//         console.log("Message match found:", {
//           messageId: message._id,
//           senderId: message.senderId,
//           receiverId: message.receiverId,
//           isRead: message.isRead,
//           content: message.content,
//         });
//       }

//       return isSenderMatch && isReceiverMatch && isUnread;
//     });

//     return result;
//   };

//   return (
//     <div>
//       <ProfileHeader />
//       <main className="wrapper">
//         <section className="middle-container">
//           <div className="container-fluid">
//             <div className="profile-wrapper">
//               <div className="row">
//                 {/* <div className="col-md-3">
//                   <Sidebar />
//                 </div> */}
//                 <div className="col-md-12">
//                   <div className="personal-chat-wrap chat-list-main-wrap">
//                     <div className="row">
//                       <div className="col-md-12">
//                         <div className="personal-chat-details">
//                           <div className="input-border-wrap">
//                             <input
//                               id="chat-enter"
//                               type="text"
//                               className="form-control"
//                               placeholder="Search by username, first name, or business name"
//                               value={searchQuery}
//                               onChange={handleSearchChange}
//                             />
//                             <button type="submit" className="btn" />
//                           </div>
//                           {loadingUsers && <Loader />}
//                           {errorUsers && (
//                             <div className="alert alert-danger">
//                               {typeof errorUsers === "string"
//                                 ? errorUsers
//                                 : errorUsers.message ||
//                                   "Failed to load chat list"}
//                             </div>
//                           )}
//                           <div className="chat-list-wrap">
//                             {chatList?.users?.length > 0 ? (
//                               <ul className="chat-list">
//                                 {filteredUsers.map((user) => (
//                                   <li key={user._id}>
//                                     <Link
//                                       to={`/personalchat/${user._id}`}
//                                       state={{ user }} // Pass the user object
//                                     >
//                                       <div className="personal-chat-profile">
//                                         <figure>
//                                           <img
//                                             src={
//                                               user.profilePicture
//                                                 ? `${VITE_API_URL}${user.profilePicture}`
//                                                 : profilepic
//                                             }
//                                             alt={`${
//                                               user.userName ||
//                                               user.firstName ||
//                                               user.businessName
//                                             }`}
//                                             onError={(e) => {
//                                               e.target.src = profilepic;
//                                             }}
//                                           />
//                                         </figure>
//                                         <div className="chat-info">
//                                           <span>
//                                             {user.businessName ||
//                                               `${user.firstName || ""} ${
//                                                 user.lastName || ""
//                                               }`.trim() ||
//                                               user.userName}
//                                           </span>
//                                           <small className="chat-time">
//                                             {user.latestMessageTime
//                                               ? formatTime(
//                                                   user.latestMessageTime
//                                                 )
//                                               : ""}
//                                           </small>
//                                           {hasUnreadMessages(user) && (
//                                             <i className="dot"></i>
//                                           )}
//                                         </div>
//                                       </div>
//                                     </Link>
//                                   </li>
//                                 ))}
//                               </ul>
//                             ) : (
//                               !loadingUsers && (
//                                 <div className="text-center mt-4">
//                                   <p style={{ color: "#666" }}>
//                                     No chats found
//                                   </p>
//                                 </div>
//                               )
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default Chatlist;
