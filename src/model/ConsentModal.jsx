import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CookiePolicyModal = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookieConsent="));

    if (consent) {
      const value = consent.split("=")[1];
      if (value === "accept" || value === "deny") {
        setShow(false);
        return;
      }
    }
    setShow(true);
  }, []);

  const handleAccept = () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days
    document.cookie = `cookieConsent=accept; expires=${expiryDate.toUTCString()}; path=/`;
    setShow(false);
  };

  const handleDeny = () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days
    document.cookie = `cookieConsent=deny; expires=${expiryDate.toUTCString()}; path=/`;
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-popup">
      <div className="cookie-header">
        <span className="cookie-title">🍪 Cookie Policy</span>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={handleDeny}
        >
          {/* × */}
        </button>
      </div>
      <div className="cookie-body">
        By continuing to use this site, you agree to our terms and conditions.{" "}
        <Link to="/cookies" target="_blank" className="cookie-link">
          Read Cookie Policy
        </Link>
      </div>
      <div className="cookie-footer">
        <button className="btn btn-dark btn-sm" onClick={handleDeny}>
          Deny
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleAccept}>
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookiePolicyModal;