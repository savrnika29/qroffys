import { useEffect, useState } from "react";
import { aboutimg, howitworklogo } from "../imaUrl";
import Banner from "../components/Banner";
import { useDispatch } from "react-redux";
import { faqData } from "../feature/faqSlice";
import Loader from "../components/Loader";

const Index = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [faq, setFaq] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Rajveer

  useEffect(() => {
    if (faq.length > 0) {
      setActiveIndex(0);
    }
  }, [faq]);

  const getFaqs = async () => {
    try {
      const { payload } = await dispatch(faqData({ setLoading }));
      if (payload?.error === false) {
        setFaq(payload?.data?.faqs);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getFaqs();
  }, []);

  return (
    <div>
      <>
        {/* Main Wrapper : Start */}
        <main className="wrapper">
          {/* Image Banner: Start */}
          <Banner />
          {/* Image Banner: End */}
          {/* Container : Start */}
          <section className="middle-container">
            <section className="about-wrapper">
              <div className="container">
                <div className="row">
                  <div className="col-lg-6 col-md-9 about-text-col d-flex align-items-center">
                    <div className="about-left">
                      <h3 className="main-heading">About Us</h3>
                      <p>Welcome to Qroffy – your ultimate destination for smart savings and unbeatable deals!</p>
                      <p>
                        At Qroffy, we believe that everyone deserves access to the best offers without the hassle. Our mission is
                        simple: make everyday outing more affordable and rewarding. Whether you're grabbing a quick bite, shopping
                        for essentials, or planning a vacation, we help you unlock exclusive discounts, cashback, and promo codes
                        from your favorite brands – all in one place.
                      </p>
                      <a href="/about" className="btn btn-secondary">
                        Know More
                      </a>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-3 about-img-col">
                    <div className="about-right">
                      <img src={aboutimg} alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="how-it-works-wrap">
              <div className="container">
                <div className="row">
                  <div className="col-md-12">
                    <h3 className="main-heading">How It Works?</h3>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-3 col-6">
                    <div className="how-it-work-box">
                      <figure>
                        <img src={howitworklogo} alt="" />
                      </figure>
                      <div className="how-it-work-text">
                        <p>Welcome to Qroffy – your ultimate destination for smart savings and unbeatable deals!</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="how-it-work-box">
                      <figure>
                        <img src={howitworklogo} alt="" />
                      </figure>
                      <div className="how-it-work-text">
                        <p>Welcome to Qroffy – your ultimate destination for smart savings and unbeatable deals!</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="how-it-work-box">
                      <figure>
                        <img src={howitworklogo} alt="" />
                      </figure>
                      <div className="how-it-work-text">
                        <p>Welcome to Qroffy – your ultimate destination for smart savings and unbeatable deals!</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="how-it-work-box">
                      <figure>
                        <img src={howitworklogo} alt="" />
                      </figure>
                      <div className="how-it-work-text">
                        <p>Welcome to Qroffy – your ultimate destination for smart savings and unbeatable deals!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="faq-wrapper">
              <div className="container">
                <div className="row">
                  <div className="col-md-12">
                    <h3 className="main-heading">FAQs</h3>
                    <div className="accordion custom-accordion" id="accordionExample">
                      {faq?.map((question, index) => {
                        const isOpen = activeIndex === index;

                        return (
                          <div className="accordion-item" key={index}>
                            <h2 className="accordion-header" id={`heading-${index}`}>
                              <button
                                className={`accordion-button ${isOpen ? "" : "collapsed"}`}
                                type="button"
                                onClick={() =>
                                  setActiveIndex(isOpen ? null : index)
                                }
                                // onClick={() => {
                                //   if (activeIndex !== index) {
                                //     setActiveIndex(index);
                                //   }
                                // }}
                              >
                                {question?.question}
                              </button>
                            </h2>
                            <div
                              id={`collapse-${index}`}
                              className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
                              aria-labelledby={`heading-${index}`}
                            >
                              <div className="accordion-body">
                                <p>{question?.answer}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {faq?.length === 0 && <p>No faq's found</p>}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Container : End */}
          </section>{" "}
        </main>
        {/* Main Wrapper : End */}
      </>
    </div>
  );
};

export default Index;
