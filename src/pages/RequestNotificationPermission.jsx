import React, { useEffect } from "react";
import { messaging, getToken } from "../utils/firebase";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import axios from "axios";

const RequestNotificationPermission = () => {
  const dispatch = useDispatch();
  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const authToken = localStorage.getItem("token"); // Use localStorage to match Notification.js

  useEffect(() => {
    const requestPermission = async () => {
      try {
        if (
          !window.isSecureContext &&
          window.location.hostname !== "localhost"
        ) {
          console.error(
            "Notifications require a secure context (HTTPS or localhost)"
          );
          toast.error(
            "Notifications require a secure connection (HTTPS or localhost)."
          );
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
          const token = await getToken(messaging, { vapidKey });

          dispatch(setFCMToken(token)); // Save in Redux
          await saveFCMToken(token); // Send to backend
          toast.success("Notifications enabled successfully!");
        } else if (permission === "denied") {
          toast.error(
            "Notifications are blocked. Enable them in browser settings."
          );
        } else {
          toast.error("Please enable notifications.");
        }
      } catch (error) {
        console.error("FCM error:", error);
        toast.error("Failed to setup notifications: " + error.message);
      }
    };

    if (Notification?.permission !== "granted") {
      requestPermission();
    }
  }, [dispatch]);

  async function saveFCMToken(fcmToken) {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/notifications/save-fcm-token`,
        { fcmToken },
        {
          headers: {
            Authorization: `${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error saving FCM token:", error);
      if (error.response) {
        console.error("Backend error:", error.response.data);
      }
      toast.error("Failed to save FCM token to backend.");
    }
  }

  return (
    <div style={{ display: "none" }}>Requesting notification permission...</div>
  );
};

export default RequestNotificationPermission;
