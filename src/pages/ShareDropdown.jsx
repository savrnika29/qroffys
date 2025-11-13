import React, { useState } from "react";
import { Whatsapp, Facebook, Twitter, Send } from "lucide-react"; // Optional: icons
import { shareicon } from "../imaUrl";
import { FaWhatsapp, FaFacebook, FaTwitter, FaTelegramPlane } from "react-icons/fa";

const ShareDropdown = ({ postId, token, dispatch, sharePost }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleExternalShare = (platform) => {
    if (!token) {
      alert("You must be logged in to share a post.");
      return;
    }

    dispatch(sharePost({ type: "external", postId, platform, token }))
      .unwrap()
      .then(() => {
        const shareUrl = window.location.href;
        const text = encodeURIComponent("Check out this post!");

        let url = "";
        switch (platform) {
          case "whatsapp":
            url = `https://api.whatsapp.com/send?text=${text}%20${shareUrl}`;
            break;
          case "facebook":
            url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
            break;
          case "twitter":
            url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`;
            break;
          case "telegram":
            url = `https://t.me/share/url?url=${shareUrl}&text=${text}`;
            break;
          default:
            return;
        }
        window.open(url, "_blank");
      })
      .catch((err) => {
        console.error("Share error:", err);
        alert("Failed to share the post.");
      });
  };

  return (
    <div style={{ position: "relative" }}>
      <img
        src={shareicon}
        alt="Share"
        onClick={() => setShowOptions(!showOptions)}
        style={{ cursor: "pointer", width: "24px" }}
      />

      {showOptions && (
        <div
          style={{
            position: "absolute",
            top: "30px",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            zIndex: 1000,
          }}
        >
             <div onClick={() => handleExternalShare("whatsapp")} style={{ cursor: "pointer" }}>
                     <FaWhatsapp size={16} /> WhatsApp
                     </div>

          <div onClick={() => handleExternalShare("facebook")} style={{ cursor: "pointer" }}>
            <Facebook size={16} /> Facebook
          </div>
          <div onClick={() => handleExternalShare("twitter")} style={{ cursor: "pointer" }}>
            <Twitter size={16} /> Twitter
          </div>
          <div onClick={() => handleExternalShare("telegram")} style={{ cursor: "pointer" }}>
            <Send size={16} /> Telegram
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareDropdown;
