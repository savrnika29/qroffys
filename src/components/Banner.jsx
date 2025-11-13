import React, { useEffect } from "react";
import { imagebanner } from "../imaUrl";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Banner = () => {
  const { token } = useSelector((store) => store?.auth);

  useEffect(() => {}, []);
  return (
    <div>
      {/* Image Banner: Start */}
      <section className="image-banner-wrap">
        <figure>
          <img src={imagebanner} alt="" />
        </figure>

        <div className="image-banner-content">
          <h1 className="banner-heading">Think Discount, Think Qroffy</h1>
          {!token && (
            <Link
              to="/login"
              className="btn btn-primary"
              onClick={() => console.log("Log In / Sign Up clicked")}
            >
              Log In / Sign Up
            </Link>
          )}
          {token && (
            <Link
              to="/home"
              className="btn btn-primary"
              onClick={() => console.log("Log In / Sign Up clicked")}
            >
              View Profile
            </Link>
          )}
        </div>
        {/* )}{" "} */}
      </section>
      {/* Image Banner: End */}
    </div>
  );
};

export default Banner;
