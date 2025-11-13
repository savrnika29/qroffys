import React from "react";
import { logo, languageicon } from "../imaUrl"; // ✅ import from centralized imgUrl.js
import { Link, useLocation } from "react-router-dom";
import Selectlanguage from "../model/Selectlanguage";
import { useSelector } from "react-redux";
import { useState } from "react";

const Header = () => {
  const { token } = useSelector((store) => store?.auth);
  const location = useLocation();
  const showLanguageIcon =
    location.pathname === "/" || location.pathname === "/login";

// Dropdown Show/Hide
  const [isOpen, setIsOpen] = useState(false);
  const toggleNavbar = () => {
    setIsOpen(!isOpen); 
  };

  return (
    <>
      <div>
        <header className="header">
          {/* Navigation */}
          <nav className="navbar navbar-expand-lg navigation-wrap">
            <div className="container-fluid">
              <Link className="navbar-brand" to="/">
                <img src={logo} alt="" />
              </Link>
              <button
                className="navbar-toggler"
                type="button"
                onClick={toggleNavbar}
                aria-expanded={isOpen}
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>
              {/* Desktop / Mobile Navigation */}
              <div
                className={`navbar-collapse ${isOpen ? "show" : "collapse"}`}
                id="navbarSupportedContent"
              >
                <div className="header-icon-btn-wrap">
                  {showLanguageIcon && (
                    <Link
                      to="#"
                      className="icon-block"
                      data-bs-toggle="modal"
                      data-bs-target="#languagepopup"
                    >
                      <img src={languageicon} alt="Language" />
                    </Link>
                  )}
                  {token ? (
                    <Link to="/home" className="btn btn-primary">
                      View Profile
                    </Link>
                  ) : (
                    <Link to="/login" className="btn btn-primary">
                      Log In / Sign Up
                    </Link>
                  )}
                </div>
              </div>
              {/* Desktop Navigation */}


            </div>
          </nav>
        </header>
        <Selectlanguage />
      </div>
    </>
  );
};

export default Header;
