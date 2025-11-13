import React, { useEffect } from "react";
import { footerlogo, linkedin, x, youtube } from "../imaUrl";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getSocialLinks } from "../feature/socialLinksSlice";

const VITE_API_URL = import.meta.env.VITE_API_URL;
const Footer = () => {
  const dispatch = useDispatch();

  const socialLinksContent = useSelector(
    (state) => state.socialLinks?.content?.data?.socialLinks || []
  );

  const error = useSelector((state) => state.socialLinks?.error);
  const token = useSelector((state) => state.auth?.token || null);

  useEffect(() => {
    dispatch(getSocialLinks());
  }, [dispatch]);

  useEffect(() => {
    // console.log("Social Links:", socialLinksContent);
    if (error) {
      console.error("Error loading social links:", error);
    }
  }, [socialLinksContent, error]);

  return (
    <div>
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <figure className="footer-logo">
                <img src={footerlogo} alt="" />
              </figure>
            </div>
            <div className="col-md-9">
              <div className="row g-0">
                <div className="col-md-5">
                  <ul className="footer-links">
                    <li>
                      <Link
                        to={token ? "/qroffydiscountbusinessprofile" : "/login"}
                      >
                        Business
                      </Link>
                    </li>
                    <li>
                      <Link to="/about" >

                        How It Works?
                      </Link>
                    </li>
                    <li>
                      <a target="_blank" href="/about">About</a>
                    </li>
                    <li>
                      <a target="_blank" href="/helpcenter">Contact</a>
                    </li>
                  </ul>
                </div>
                <div className="col-md-5">
                  <ul className="footer-links">
                    <li>
                      <a target="_blank" href="/privacy">Privacy Policy</a>
                    </li>
                    <li>
                      <a target="_blank" href="/terms">Terms Of Use</a>
                    </li>
                  </ul>
                </div>
                <div className="col-md-2">
                  <div className="footer-contact">
                    <span>Contact Email:</span>
                    <a href="mailto:example@mail.com">example@mail.com</a>
                  </div>
                  {/* <div className="footer-social">
              <span>Social</span>
              <ul className="social-icons">
                <li>
                  <a href="#">
                  <img src={linkedin} alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                  <img src={youtube} alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                  <img src={x} alt="" />
                  </a>
                </li>
              </ul>
            </div> */}
                  <div className="footer-social">
                    <span>Social</span>
                    <ul className="social-icons">
                      {socialLinksContent.map((link) => (
                        <li key={link._id}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {/* <img src={link.icon} alt={link.name} /> */}
                            <img
                              src={`${link.icon}`}
                              alt={link.name}
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Copyright Row */}
          <div className="row copyright-row">
            <div className="col-md-12">Copyright 2025</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
