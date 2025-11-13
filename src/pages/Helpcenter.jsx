import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { submitHelpRequest, clearMessages } from "../feature/helpSlice";
import ProfileHeader from "../components/ProfileHeader";
import Sidebar from "../components/Sidebar";
import { Link, useNavigate } from "react-router-dom";
import { updateProfile, getProfile } from "../feature/profileSlice";
import Header from "../components/Header";
// Validation schema matching Helpcenter
const schema = yup.object().shape({
  fullName: yup
    .string()
    .test("no-digits", "Full name must contain only characters (no numbers)", (value) => !/\d/.test(value))
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name too long")
    .required("Full name is required"),
  // mobile: yup.string().required("Mobile number is required"), 
 mobile: yup
    .string()
    .matches(/^[0-9]{6,15}$/, "Mobile number must be digits")
    .required("Mobile number is required"),

  email: yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com)$/,
      "Email must be valid (e.g., user@example.com)"
    )
    .required("Email is required"),
  message: yup.string().min(10, "Message should be at least 10 characters").required("Message is required"),
});

const Helpcenter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  // const { cards = [], cardvedio = [], loading, error } = useSelector((state) => state.savedCards || {});
  const user = useSelector((state) => state.profile?.user);
  const token = useSelector((state) => state.auth?.token);
  const userId = localStorage.getItem("userId");

  // Form setup
  const { successMessage, errorMessage, loading } = useSelector((state) => state.help);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      message: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user?.businessName
          ? user.businessName
          : `${user?.firstName || ""} ${user?.lastName || ""}`.trim(), email: user.email || "",
        mobile: user?.phoneNumber || user?.mobileNo || user?.mobile || "",
        message: "",
        userId: user._id || userId,
      });
    }
  }, [user, reset, userId]);

  const onSubmit = (data) => {
    const formData = {
      name: data.fullName,
      email: data.email,
      mobileNo: data.mobile,
      message: data.message,
      userId: user?._id || userId,
    };
    // dispatch(submitHelpRequest({ formData, token }));
    // reset({
    //   fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    //   email: user?.email || "",
    //   mobile: user?.phoneNumber || "",
    //   message: "",
    // });
    dispatch(submitHelpRequest({ formData, token }))
      .unwrap()
      .then(() => {
        // reset only after successful submission
        reset({
          fullName: user?.businessName
            ? user.businessName
            : `${user?.firstName || ""} ${user?.lastName || ""}`.trim(), email: user?.email || "",
          mobile: user?.phoneNumber || "",
          message: "",
        });
      })
      .catch(() => {
        // handle error if needed
      });
  };

  // Fetch user profile
  const getProfileInfo = async () => {
    try {
      await dispatch(getProfile(token));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    if (token) {
      getProfileInfo();
    }
  }, [token]);

  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
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
                  <div className="help-center-wrapper contact-wrap">
                    <h4 className="help-heading">Contact Us</h4>

                    {/* {successMessage && <div className="alert alert-success">{successMessage}</div>} */}
                    {/* {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} */}

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="f-name" className="form-label">
                              Full Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="f-name"
                              {...register("fullName")}
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                trigger("fullName");
                              }}
                            />
                            {errors.fullName && <div style={{ color: "red" }}>{errors.fullName.message}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="mob-no" className="form-label">
                              Mobile No.
                            </label>
<input
                              type="text"
                              className="form-control"
                              id="mob-no"
                              maxLength={15} // user sirf 15 digit hi type kar payega
                              {...register("mobile")}
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, ""); // only digits
                                trigger("mobile");
                              }}
                            />                            {errors.mobile && <div style={{ color: "red" }}>{errors.mobile.message}</div>}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="form-group">
                            <label htmlFor="email01" className="form-label">
                              Email Address
                            </label>
                            <input type="email" className="form-control" id="email01" {...register("email")} />
                            {errors.email && <div style={{ color: "red" }}>{errors.email.message}</div>}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="form-group">
                            <label htmlFor="message" className="form-label">
                              Message
                            </label>
                            <textarea className="form-control" id="message" rows="4" {...register("message")} />
                            {errors.message && <div style={{ color: "red" }}>{errors.message.message}</div>}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="btn-block">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                              {loading ? "Sending..." : "Send"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
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

export default Helpcenter;
