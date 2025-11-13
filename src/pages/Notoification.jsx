import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import Loader from "../components/Loader";
import { notification } from "../imaUrl";
import { useSelector, useDispatch } from "react-redux";
import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase/firebaseConfig";
import { getNotifications } from "../feature/notificationSlice";

const Notification = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [firebaseNotifications, setFirebaseNotifications] = useState([]);
  const fcmToken = useSelector((state) => state.auth.fcmToken); // Get FCM token from Redux
  const token = useSelector((state) => state.auth.token);
  const permissionStatus = Notification?.permission || "default";
  const notificationState = useSelector((state) => state.notification || {});
  const [expandedIds, setExpandedIds] = useState([]);
  const { notifications = [], loading: apiLoading, error } = notificationState;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      .replace(/, (\d{4})$/, ", $1"); // Ensure format like "12:47 PM, 04 August, 2025"
  };

  // Fetch API notifications on mount
  useEffect(() => {
    if (token) {
      dispatch(getNotifications({ setLoading, token }));
    } else {
      console.warn("No auth token, skipping API notification fetch");
    }
  }, [token, dispatch]);

  // Handle foreground messages
  useEffect(() => {
    let unsubscribe;
    const initializeMessaging = async () => {
      try {
        unsubscribe = onMessage(messaging, (payload) => {
          const title =
            payload.notification?.title ||
            payload.data?.title ||
            "New Notification";
          const body =
            payload.notification?.body ||
            payload.data?.body ||
            "You have a new notification";
          const icon = payload.notification?.icon || payload.data?.icon;

          if (title && body) {
            toast.info(`${title}: ${body}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });

            setFirebaseNotifications((prev) => [
              {
                id: Date.now(),
                title,
                body,
                icon,
                timestamp: new Date().toLocaleString(),
                data: payload.data,
              },
              ...prev,
            ]);

            if (permissionStatus === "granted") {
              new Notification(title, {
                body,
                icon: icon || "/firebase-logo.png",
              });
            }
          }
        });
      } catch (error) {
        console.error("Error initializing messaging:", error);
        toast.error("Failed to initialize notifications: " + error.message);
      }
    };

    initializeMessaging();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [permissionStatus]);

  // Test notification function
  const testNotification = () => {
    if (permissionStatus === "granted") {
      new Notification("Test Notification", {
        body: "This is a test notification to verify that notifications are working.",
        icon: "/firebase-logo.png",
      });
    } else {
      toast.error("Notifications not enabled.");
    }
  };

  // Clear notifications
  const handleClearNotifications = () => {
    dispatch(clearNotifications());
  };

  const trimWords = (text, count) => {
    return text.split(" ").slice(0, count).join(" ") + "...";
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div>
      {(loading || apiLoading) && <Loader />}
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
                  <div className="notification-wrap">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="notification-details">
                          <h3 className="notification-heading">
                            Notifications
                          </h3>

                          {error && (
                            <div className="alert alert-danger">{error}</div>
                          )}

                          <div className="notification-controls mb-3">
                            {/* <p>
                              <strong>Permission Status:</strong>{" "}
                              {Notification?.permission || "default"}
                            </p> */}
                            {fcmToken && (
                              <p>
                                <strong>FCM Token:</strong>{" "}
                                {fcmToken.substring(0, 20)}...
                              </p>
                            )}
                            <div>
                              {Notification?.permission === "granted" && (
                                <button
                                  className="btn btn-secondary me-2"
                                  onClick={testNotification}
                                >
                                  Test Notification
                                </button>
                              )}
                              {/* {notifications.length > 0 && (
                                <button
                                  className="btn btn-danger"
                                  onClick={handleClearNotifications}
                                >
                                  Clear Notifications
                                </button>
                              )} */}
                            </div>
                          </div>

                          {Notification?.permission === "denied" && (
                            <div className="alert alert-danger">
                              Notifications are blocked. Please enable them in
                              your browser settings and refresh the page.
                            </div>
                          )}
                          {Notification?.permission === "unsupported" && (
                            <div className="alert alert-warning">
                              Your browser does not support notifications.
                              Please use a modern browser like Chrome, Firefox,
                              or Edge.
                            </div>
                          )}

                          <ul className="notification-list">
                            {/* {notifications.map((notify) => (
                              <li key={notify.id} className="notification-item">
                                <i>
                                  <img
                                    src={notify.icon || notification}
                                    alt="notification icon"
                                    onError={(e) => {
                                      e.target.src = notification;
                                    }}
                                  />
                                </i>
                                <div className="noti-content">
                                  <span className="noti-label">
                                    <strong>{notify.title}</strong>:{" "}
                                    {notify.body}
                                  </span>
                                  <span className="noti-label">
                                    {notify.message}: {notify.body}
                                  </span>
                                  <small className="noti-time">
                                    {formatDate(
                                      notify.createdAt || notify.timestamp
                                    )}
                                  </small>
                                </div>
                              </li>
                            ))} */}
                            {notifications.map((notify, index) => {
                              const uniqueId = notify._id || notify.id || index;
                              const isExpanded = expandedIds.includes(uniqueId);
                              const messageText = notify.message || "";
                              const shouldShowToggle =
                                messageText.split(" ").length > 2;
                              const displayedMessage = isExpanded
                                ? messageText
                                : trimWords(messageText, 2);

                              return (
                                <li
                                  key={uniqueId}
                                  className="notification-item"
                                >
                                  <i>
                                    <img
                                      src={notify.icon || notification}
                                      alt="notification icon"
                                      onError={(e) => {
                                        e.target.src = notification;
                                      }}
                                    />
                                  </i>

                                  <div className="noti-content">
                                    <span className="noti-label">
                                      <strong>{notify.title}</strong>:{" "}
                                      {notify.body}
                                    </span>

                                    {messageText && (
                                      <span className="noti-label d-block mt-1">
                                        {displayedMessage}
                                        {shouldShowToggle && (
                                          <button
                                            className="p-0 ms-2"
                                            style={{
                                              textDecoration: "none",
                                              fontWeight: "bold",
                                              fontSize: "0.875rem",
                                            }}
                                            onClick={() =>
                                              toggleExpand(uniqueId)
                                            }
                                          >
                                            {isExpanded
                                              ? "Show Less"
                                              : "Show More"}
                                          </button>
                                        )}
                                      </span>
                                    )}

                                    <small className="noti-time">
                                      {formatDate(
                                        notify.createdAt || notify.timestamp
                                      )}
                                    </small>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>

                          {notifications.length === 0 &&
                            !(loading || apiLoading) && (
                              <div className="text-center mt-4">
                                <p style={{ color: "#666" }}>
                                  No notifications received yet
                                </p>
                                {Notification?.permission === "granted" && (
                                  <small>
                                    Make sure your backend is sending
                                    notifications to this FCM token
                                  </small>
                                )}
                              </div>
                            )}
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

export default Notification;
