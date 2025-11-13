import React from "react";
import ProfileHeader from "../components/ProfileHeader";
import { deactivateiconbig } from "../imaUrl";
import { Link, useNavigate } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { deactivateAccount } from "../feature/deactivateSlice";

const Deactiveteaccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token); 
  const { loading } = useSelector((state) => state.account);

  // const handleDeactivate = async () => {
  //   try {
  //     const response = await axios.patch(
  //       `${process.env.REACT_APP_API_URL}/users/account-deactivations`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `${token}`,
  //         },
  //       }
  //     );

  //     if (!response.data.error) {
  //       toast.success(response.data.message);
  //       navigate("/login");
  //     } else {
  //       toast.error("Failed to deactivate account");
  //     }
  //   } catch (error) {
  //     console.error("Error deactivating account:", error);
  //     toast.error("Something went wrong. Please try again.");
  //   }
  // };

  
  const handleDeactivate = () => {
    dispatch(deactivateAccount({ token, payload: {} }))
      .unwrap()
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {
       toast.error(err)
      });
  };

  return (
    <div>
      <>
        {/* Top Bar : Start */}
        <ProfileHeader />
        {/* Top Bar : End */}

        {/* Main Wrapper : Start */}
        <main className="wrapper">
          {/* Container : Start */}
          <section className="middle-container">
            <div className="container-fluid">
              <div className="profile-wrapper">
                <div className="row">
                  <div className="col-md-9">
                    <div className="profile-wrapper-right">
                      <div className="deactivate-account-wrap">
                        <h3 className="main-heading">Deactivate Account</h3>
                        <div className="deactivate-account-box">
                          <i>
                            <img src={deactivateiconbig} alt="" />
                          </i>
                          <div className="btn-block">
                            <p>
                              Are you sure want to deactivate your account ?
                            </p>
                            <button
                              onClick={handleDeactivate}
                              className="btn btn-primary"
                              disabled={loading} 
                            >
                               {loading ? "Processing..." : "Yes"}
                            </button>
                            <Link to="" className="btn btn-outline-secondary">
                              No
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Container : End */}
        </main>
        {/* Main Wrapper : End */}
      </>
    </div>
  );
};

export default Deactiveteaccount;
