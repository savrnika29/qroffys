// src/model/ShareModal.jsx

import React, { useEffect, useRef } from "react";
import { FaWhatsapp, FaFacebookF, FaTwitter, FaTelegramPlane } from "react-icons/fa";

const ShareModal = ({ post, isOpen, onClose, onShare }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
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

  const getShareUrl = (platform) => {
    const shareText = encodeURIComponent(post?.text || "Check out this post!");
    const shareUrl = encodeURIComponent(`${window.location.origin}/post/${post?._id}`);

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

  if (!isOpen || !post) return null;

  return (
    <div
      className="modal fade show comment-popup"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document" ref={modalRef}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Share this post</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body d-flex justify-content-around text-center">
            <a
              href={getShareUrl("whatsapp")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onShare(post._id, "whatsapp")}
            >
              <FaWhatsapp size={30} color="#25D366" className="mb-2"/>
              {/* <div>WhatsApp</div> */}
            </a>
            <a
              href={getShareUrl("facebook")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onShare(post._id, "facebook")}
            >
              <FaFacebookF size={30} color="#1877F2"  className="mb-2" />
              {/* <div>Facebook</div> */}
            </a>
            <a
              href={getShareUrl("twitter")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onShare(post._id, "twitter")}
            >
              <FaTwitter size={30} color="#1DA1F2"  className="mb-2" />
              {/* <div>Twitter</div> */}
            </a>
            <a
              href={getShareUrl("telegram")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onShare(post._id, "telegram")}
            >
              <FaTelegramPlane size={30} color="#0088cc"   className="mb-2"/>
              {/* <div>Telegram</div> */}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default ShareModal;
