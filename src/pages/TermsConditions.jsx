// TermsConditions.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLegalContent } from "../feature/termConditionSlice";
import { useParams } from "react-router-dom";

const TermsConditions = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { content, loading, error } = useSelector((state) => state.terms);
  const termsData = content?.data;

  useEffect(() => {
    if (slug) {
      dispatch(fetchLegalContent(slug));
    }
  }, [slug, dispatch]);

  return (
    <div>
      <main className="wrapper">
        <section className="middle-container">
          <div className="container-fluid">
            <div className="profile-wrapper">
              <div className="row">
                <div className="col-md-12">
                  <div className="about-qroffy-wrap">
                    {loading && <p>Loading...</p>}
                    {termsData?.content &&
                      typeof termsData.content === "string" && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: termsData.content,
                          }}
                        />
                      )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TermsConditions;
