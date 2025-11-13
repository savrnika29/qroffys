import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAbout } from "../feature/aboutSlice";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import Header from "../components/Header";
const About = () => {
  const dispatch = useDispatch();
  const { aboutData, loading, error } = useSelector((state) => state.about);
  const token = useSelector((state) => state.auth?.token || null);

  useEffect(() => {
    dispatch(fetchAbout());
  }, [dispatch]);

  return (
    <>
      {/* Conditionally render ProfileHeader */}
      {token ? <ProfileHeader /> : <Header />}
      <main className="wrapper">
        <section className="middle-container">
          <div className="container-fluid">
            <div className="profile-wrapper">
              <div className="row">
                {/* Conditionally render Sidebar */}
                {token && (
                  <div className="col-md-3">
                    <Sidebar />
                  </div>
                )}
                {/* Adjust column width based on token */}
                <div className={token ? "col-md-9" : "col-md-12"}>
                  <div className="about-qroffy-wrap">
                    <h3>{aboutData?.title || "About Qroffy"}</h3>
                    {loading && <p>Loading...</p>}
                    {error && (
                      <p className="text-danger">{error.message || error}</p>
                    )}
                    <p>
                      {aboutData?.description?.split("\n").map((line, idx) => (
                        <span key={idx}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
