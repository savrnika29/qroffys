import React from 'react'
import { useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader'
import { scanface } from "../imaUrl";
import Thankyou from "../model/Thankyou";
import Error from '../model/Makepaymenterror'


const Subsriptionfacescan = () => {
    const navigate = useNavigate();

    return (
        <div>
            <>
                <ProfileHeader />
                <>
                    <main className="wrapper">
                        {/* Container : Start */}
                        <section className="middle-container">
                            <section className="login-wrapper">
                                <div className="container">
                                    <div className="row text-center">
                                        <div className="col-md-12">
                                            <h3 className="main-heading">Scan face</h3>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="scan-face-wrap">
                                                <h3 className="scan-face-heading">Scan Your Face</h3>
                                                <div className="scan-face-box">
                                                    <img src={scanface} alt="" />
                                                </div>
                                                <div className="btn-block">
                                                    <a
                                                        href="javascript:void(0);"
                                                        className="btn btn-primary"
                                                    >
                                                        Scan Now
                                                    </a>
                                                    <a
                                                        href="#"
                                                        className="btn btn-dark"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#thankyoupopup"
                                                    // data-bs-toggle="modal"
                                                    // data-bs-target="#errorpopup"
                                                    >
                                                        Save & Continue
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </section>
                        {/* Container : End */}
                    </main>

                    {/* Main Wrapper : End */}
                    {/* ￼ Include modal */}
                    {/* <Error /> */}
                    <Thankyou />
                </>
            </>
        </div>
    );
};

export default Subsriptionfacescan;
