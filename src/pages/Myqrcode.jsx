import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProfileHeader from '../components/ProfileHeader'
import { profilepic3, qrcode } from '../imaUrl'
import { onboardBusiness } from '../feature/businessOnboardSlice'
import { getProfile } from '../feature/profileSlice';
import { Link } from 'react-router-dom';

const Myqrcode = () => {

  const dispatch = useDispatch();
  const { Onboard, loading, error } = useSelector((state) => state.businessOnboard);
  const token = useSelector((state) => state.auth?.token);

  const user = useSelector((state) => state.profile);

  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {

    dispatch(getProfile(token));

  }, [token, dispatch]);


  const handleHeadingClick = () => {
    setShowQRCode(!showQRCode);
  };


  const [clicked, setClicked] = useState(false);

  const handleBusinessOnboard = () => {
    if (user?.user?._id) {
      setClicked(true); // mark that user actually clicked
      dispatch(onboardBusiness(user.user._id));
    } else {
      console.error('User ID is not available');
    }
  };
  useEffect(() => {
    if (clicked && Onboard?.data?.onboardingUrl && !loading) {
      // Reset clicked to prevent multiple redirects
      setClicked(false);
      window.location.href = Onboard.data.onboardingUrl;
    }
  }, [Onboard?.data?.onboardingUrl, clicked, loading]);


  // const handleBusinessOnboard = () => {
  //   dispatch(onboardBusiness(user.user._id));

  //   if (Onboard && Onboard?.data?.onboardingUrl) {
  //     window.location.href = Onboard?.data?.onboardingUrl;
  //   }

  // };

  return (
    <div>
      <>
        <ProfileHeader />
        {/* Main Wrapper : Start */}
        <main className="wrapper">
          {/* Container : Start */}
          <section className="middle-container">
            <section className="login-wrapper edit-profile-wrap">
              <div className="container">
                <div className="row">
                  <div className="col-md-12">
                    <div className="signup-wrapper">
                      <div className="signup-customer">

                        <div className="view-account-header qr-code-wrapper">
                          <div className="edit-profile-pic ">
                            {user?.user?.profilePicture ?
                              <figure>
                                <img src={user?.use?.profilePicture} alt="profilePicture" />
                              </figure>
                              :

                              <div className="initial-circle">
                                <span>
                                  {user?.user?.businessName
                                    ? (() => {
                                      const words =
                                        user?.user?.businessName?.split(" ");
                                      const firstInitial =
                                        words[0]?.charAt(0)?.toUpperCase() ||
                                        "";
                                      const lastInitial =
                                        words[words.length - 1]
                                          ?.charAt(0)
                                          ?.toUpperCase() || "";
                                      return firstInitial + lastInitial;
                                    })()
                                    : "N/A"}
                                </span>
                              </div>}
                            <p className="profile-name">{user?.user.businessName}</p>
                            <p className='online-business'>{user?.user.businessType} Business</p>


                          </div>

                          {/* Clickable Heading */}
                          {/* <h3
                            className="main-heading"
                            onClick={handleHeadingClick}
                            style={{ cursor: 'pointer' }}
                          >
                            
                          </h3> */}

                          {/* {user?.user?.qrCode ? (
                            <figure style={{ marginTop: '20px' }}>
                              <img
                                src={user?.user?.qrCode}
                                alt="QR Code"
                                style={{ maxWidth: '200px', border: '1px solid #ccc' }}
                              />
                            </figure>
                          ) : (
                            <>
                              <p>No QR code available.</p>
                              <div className="btn-block business-profile-btns mt-4" onClick={handleBusinessOnboard}>
                                <button className="p-2 btn btn-primary">
                                  Business Onboard
                                </button>
                              </div>
                            </>
                          )} */}
                          <div className='my-qr-code'>
                            <h1 className='main-heading'>My QR Code</h1>
                            {user?.user?.onboardingStatus === "completed" ? (
                              <figure style={{ marginTop: '20px' }}>
                                <img
                                  src={user?.user?.qrCode || qrcode} // fallback if qrCode missing
                                  alt="QR Code"
                                  style={{ maxWidth: '400px', border: '1px solid #ccc' }}
                                />
                              </figure>
                            ) : user?.user?.onboardingStatus === "pending" ? (
                              <div className="btn-block business-profile-btns mt-4" onClick={handleBusinessOnboard}>
                                <button
                                  className="p-2 btn btn-primary"
                                  onClick={handleBusinessOnboard}
                                  disabled={loading}
                                >
                                  {loading ? 'Processing...' : 'Business Onboard'}
                                </button>
                              </div>
                            ) : (
                              <p>No onboarding status available.</p>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
          {/* Container : End */}
        </main>
      </>
    </div>
  )
}

export default Myqrcode
