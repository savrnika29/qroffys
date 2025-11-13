import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import { chaticon, profilepic } from "../imaUrl";
import {
  fetchChatMessages,
  addMessage,
  clearUnreadForUser,
  setLastChatId,
} from "../feature/chatSlice";
import { clientChatUsers } from "../feature/chatSlice";
import {
  fetchMyBusinessPosts,
  clearMyBusinessPostsData,
} from "../feature/mybusinesspostSlice";

const VITE_API_URL = import.meta.env.VITE_API_URL;
const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(VITE_SOCKET_URL, {
  transports: ["websocket"], // ensures stability
});

const Personalchat = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);
  const userId = useSelector((state) => state.auth?.user?._id);
  const { messages, loading, error } = useSelector((state) => state.chat);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);
  const { receiverId } = useParams();
  const { state } = useLocation();
  const selectedUser = state?.user;
  const {
    businessData,
    loading: businessLoading,
    error: businessError,
  } = useSelector((state) => state.business);
  const [userDetails, setUserDetails] = useState(selectedUser || null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    dispatch(clientChatUsers({ setLoading: (value) => {} })); // Dispatch clientChatUsers
  }, [dispatch]);
  // Fetch user details if not provided
  useEffect(() => {
    if (!selectedUser && receiverId) {
      const fetchUserDetails = async () => {
        try {
          const response = await fetch(`${VITE_API_URL}/users/${receiverId}`);
          const data = await response.json();
          setUserDetails(data.data);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };
      fetchUserDetails();
    }
  }, [receiverId, selectedUser]);

  // Fetch initial messages
  useEffect(() => {
    if (userId && receiverId) {
      dispatch(fetchChatMessages({ userId, receiverId, token }));
    }
  }, [dispatch, userId, receiverId, token]);

  // Handle incoming socket messages
  // useEffect(() => {
  //   socket.on("connect", () => {
  //     socket.emit("join", userId); // Register the userId on the server
  //   });

  //   socket.on("private-message", (data) => {
  //     if (!data.createdAt) {
  //       data.createdAt = new Date().toISOString(); // fallback for missing server timestamp
  //     }
  //     dispatch(addMessage(data));
  //     if (data.senderId !== receiverId) {
  //       dispatch(incrementUnreadCount(data.senderId));
  //     }
  //   });

  //   return () => {
  //     socket.off("private-message");
  //   };
  // }, [dispatch, userId, receiverId]);

  useEffect(() => {
    socketRef.current = io(VITE_SOCKET_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join", userId);
    });

    socketRef.current.on("private-message", (data) => {
      if (!data.createdAt) {
        data.createdAt = new Date().toISOString();
      }
      dispatch(addMessage(data));
      if (data.senderId !== receiverId) {
        dispatch(incrementUnreadCount(data.senderId));
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId, receiverId, dispatch]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (messageInput.trim() && userDetails?._id) {
      const tempId = uuidv4();
      const now = new Date().toISOString();
      const payload = {
        tempId,
        senderId: userId,
        receiverId: userDetails._id,
        content: messageInput,
        message: messageInput,
        timestamp: now,
        createdAt: now,
        // timestamp: new Date().toISOString(),
        read: false,
      };

      socket.emit("private-message", payload);
      dispatch(addMessage(payload));
      setMessageInput("");
    }
  };

  useEffect(() => {
    if (receiverId) {
      dispatch(setLastChatId(receiverId));
    }
  }, [receiverId, dispatch]);

  useEffect(() => {
    if (receiverId) {
      dispatch(clearUnreadForUser(receiverId));
    }
  }, [receiverId, dispatch]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    const time = date.toLocaleString("en-US", options);

    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${time} | ${day} ${month} ${year}`;
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
                  <div className="personal-chat-wrap">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="personal-chat-profile">
                          {/* <figure className="chat-thumb">
                            {userDetails?.profilePicture ? (
                              <img
                                src={`${userDetails.profilePicture}`}
                                alt={userDetails?.userName || userDetails?.firstName || userDetails?.businessName || "Profile"}
                                onError={(e) => {
                                  e.target.style.display = "none"; // Hide if image fails
                                }}
                              />
                            ) : (
                              <div className="initial-circle">
                                {userDetails?.businessName || userDetails?.firstName ? (
                                  <span>
                                    {userDetails?.businessName || userDetails?.firstName
                                      ? (() => {
                                        const name = userDetails?.businessName || userDetails?.firstName;
                                        const nameParts = name.trim().split(" ");
                                        const firstNameInitial = nameParts[0]?.charAt(0)?.toUpperCase() || "";
                                        const lastNameInitial =
                                          nameParts.length > 1 ? nameParts[nameParts.length - 1]?.charAt(0)?.toUpperCase() : "";
                                        return firstNameInitial + lastNameInitial || "C";
                                      })()
                                      : "C"}
                                  </span>
                                ) : (
                                  <span>C</span>
                                )}
                              </div>
                            )}
                            <span className="label">
                              {userDetails?.role === "business"
                                ? userDetails?.businessName
                                : `${userDetails?.firstName || ""} ${userDetails?.lastName || ""}`.trim() || "Customer"}
                            </span>
                          </figure> */}
                          <figure
                            className={
                              userDetails?.role === "business"
                                ? "chat-thumb"
                                : "customer-thumb"
                            }
                          >
                            {userDetails?.role === "business" ? (
                              userDetails?.profilePicture ? (
                                <img
                                  src={userDetails.profilePicture}
                                  alt={userDetails?.businessName || "Profile"}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="initial-circle">
                                  <span>
                                    {(() => {
                                      const name =
                                        userDetails?.businessName || "";
                                      const nameParts = name.trim().split(" ");
                                      const firstInitial =
                                        nameParts[0]
                                          ?.charAt(0)
                                          ?.toUpperCase() || "";
                                      const lastInitial =
                                        nameParts.length > 1
                                          ? nameParts[nameParts.length - 1]
                                              ?.charAt(0)
                                              ?.toUpperCase()
                                          : "";
                                      return firstInitial + lastInitial || "B";
                                    })()}
                                  </span>
                                </div>
                              )
                            ) : userDetails?.role === "admin" ? (
                              <img
                                src={userDetails?.profilePicture || profilepic}
                                alt={userDetails?.firstName || "Admin"}
                                style={{
                                  marginRight: "8px",
                                  verticalAlign: "middle",
                                }}
                              />
                            ) : (
                              <img
                                src={userDetails?.profilePicture || profilepic}
                                alt={
                                  `${userDetails?.firstName || ""} ${
                                    userDetails?.lastName || ""
                                  }`.trim() || "Customer"
                                }
                                style={{
                                  marginRight: "8px",
                                  verticalAlign: "middle",
                                }} // add space
                              />
                            )}

                            <span
                              className="label"
                              style={{ verticalAlign: "middle" }}
                            >
                              {userDetails?.role === "business"
                                ? userDetails?.businessName
                                : `${userDetails?.firstName || ""} ${
                                    userDetails?.lastName || ""
                                  }`.trim() || "Customer"}
                            </span>
                          </figure>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-12">
                        <div className="personal-chat-details">
                          <div
                            className="personal-chat-block-wrap"
                            ref={messagesContainerRef}
                            style={{
                              maxHeight: "400px",
                              overflowY: "auto",
                              overflowX: "hidden",
                            }}
                          >
                            {loading && <p>Loading messages...</p>}
                            {error && <p>Error: {error}</p>}
                            {messages.length === 0 && !loading && !error && (
                              <p>No messages yet.</p>
                            )}
                            {/* {messages.map((msg, index) => (
                              <div key={index} className={`personal-chat-block ${msg.senderId === userId ? "end" : ""}`}>
                                <div className="personal-chat-box">
                                  <p>{msg.content || msg.message}</p>
                                  <time>
                                    {msg.createdAt && !isNaN(new Date(msg.createdAt))
                                      ? new Date(msg.createdAt).toLocaleString()
                                      : "Invalid Date"}
                                  </time>
                                  {msg.senderId === userId && (
                                    <span className="read-receipt">{msg.read ? "✓✓" : msg.delivered ? "✓✓" : "✓"}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} /> */}
                            {messages.map((msg, index) => (
                              <div
                                key={index}
                                className={`personal-chat-block ${
                                  msg.senderId === userId ? "end" : ""
                                }`}
                              >
                                <div className="personal-chat-box">
                                  <p>{msg.content || msg.message}</p>
                                  <time>{formatDate(msg?.createdAt)}</time>
                                  {/* {msg.senderId === userId && (
                                    <span className="read-receipt">{msg.read ? "✓✓" : msg.delivered ? "✓✓" : "✓"}</span>
                                  )} */}
                                </div>
                              </div>
                            ))}
                          </div>

                          <form onSubmit={handleSendMessage}>
                            <div className="input-border-wrap">
                              <input
                                id="chat-enter"
                                type="text"
                                className="form-control"
                                value={messageInput}
                                onChange={(e) =>
                                  setMessageInput(e.target.value)
                                }
                                placeholder="Type a message..."
                              />
                              <button type="submit" className="btn">
                                <img src={chaticon} alt="Send" />
                              </button>
                            </div>
                          </form>
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

export default Personalchat;
