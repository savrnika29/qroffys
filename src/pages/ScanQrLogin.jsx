import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import QRCode from "react-qr-code";
import { setUserInfo } from "../feature/auth/authSlice";

const ScanQrLogin = () => {
  const [sessionId] = useState(() => crypto.randomUUID());
  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env.VITE_SOCKET_URL;

  const dispatch = useDispatch();

  useEffect(() => {
    // const socket = io(VITE_API_URL);

    const socket = io(VITE_API_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socket.on("connect", () => {
      socket.emit("request-new-session", sessionId);
    });

    socket.on("login-success", (userData) => {
      dispatch(setUserInfo(userData));

      navigate("/home");
    });

    return () => {
      socket.off("connect");
      socket.off("login-success");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center pb-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold">Qroffy QR Web</h1>
        {/* <p className="text-muted">Scan QR code with your mobile app to login</p> */}
      </div>
      <div
        className="card shadow-lg rounded w-100"
        style={{ maxWidth: "950px" }}
      >
        <div className="row g-0">
          <div className="col-md-6 d-flex flex-column justify-content-center p-4">
            <h3 className="mb-3">Use your mobile app to scan the QR code</h3>
            <ul
              className="list-unstyled mt-3 text-muted"
              style={{ listStyleType: "disc", paddingLeft: "20px" }}
            >
              <li>Open Qroffy on your phone.</li>
              <li>Then tap on the menu button.</li>
              <li>Tap Linked devices, then Link device.</li>
              <li>Scan the QR code to confirm.</li>
            </ul>
          </div>
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-4 bg-light">
            <div className="p-3 border rounded d-flex justify-content-center align-items-center bg-white">
              {sessionId && <QRCode value={sessionId} size={220} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanQrLogin;
