import { useDispatch } from "react-redux";
import { logo } from "../imaUrl";
import { useLocation, useNavigate } from "react-router-dom";
import { ApproveLink } from "../feature/auth/authSlice";
import { useState } from "react";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

const Approveforgotpage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const token = searchParams?.get("token");
  const action = searchParams?.get("action");

  const submitButton = async () => {
    if (loading === false) {
      if (token && action) {
        try {
          const { payload } = await dispatch(
            ApproveLink({ token, action, setLoading })
          );
          if (payload?.error === false) {
            navigate("/login");
          }
        } catch (error) {}
      } else {
        toast.error("Token and action are missing");
      }
    }
  };
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: "20px",
        maxWidth: "600px",
        margin: "auto",
        background: "#f9f9f9",
        border: "1px solid #eee",
      }}
    >
      {loading && <Loader />}
      <img
        src={logo}
        alt="Waya Logo"
        style={{ width: "120px", marginBottom: "20px" }}
      />

      <h2>Email Verification</h2>
      <p>Hello,</p>
      <p>Please confirm your verification below:</p>

      <button
        type="button"
        onClick={() => {
          submitButton();
        }}
        style={{
          display: "inline-block",
          padding: "10px 20px",
          margin: "10px",
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#28a745",
          textDecoration: "none",
          borderRadius: "5px",
        }}
      >
        Confirm Verification
      </button>

      {/* <button
        type="button"
        onClick={() => {
          navigate("/login");
        }}
        style={{
          display: "inline-block",
          padding: "10px 20px",
          margin: "10px",
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#dc3545",
          textDecoration: "none",
          borderRadius: "5px",
        }}
      >
        Decline
      </button> */}

      <p>If you didn’t request this, please ignore this email.</p>
      <p>Thank you</p>
    </div>
  );
};

export default Approveforgotpage;
