import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { logobig } from "../imaUrl";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../feature/auth/authSlice";
import Loader from "../components/Loader";
import { useTranslation } from "react-i18next";

const schema = yup.object().shape({
  userName: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmit = async (data) => {
    if (loading === false) {
      try {
        const fulldata = {
          userName: data?.userName,
          password: data?.password,
          device_type: "web",
          fcmToken: localStorage.getItem("fcmToken"),
        };

        const { payload } = await dispatch(
          login({ payload: fulldata, setLoading })
        );

        if (payload?.error === false) {
          navigate("/home");
          localStorage.setItem(
            "profile",
            payload?.data?.role === "customer" ? "customer" : "business"
          );
        }
      } catch (error) { }
    }
    // localStorage.setItem("profile", "customer");
    // navigate("/home"); // Navigate to subscription page
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div>
      <>
        {/* Top Bar : End */}
        {/* Main Wrapper : Start */}
        <main className="wrapper">
          {loading && <Loader />}
          {/* Container : Start */}
          <section className="middle-container">
            <section className="login-wrapper">
              <div className="container">
                <div className="row">
                  <div className="col-md-6">
                    <div className="login-left">
                      <h2 className="login-heading">{t('Welcome to ')} </h2>
                      <img src={logobig} alt="" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="login-right">
                      <form
                        className="login-form"
                        onSubmit={handleSubmit(onSubmit)}
                      >
                        <div className="row">
                          <div className="col-md-12">
                            <div className="form-group">
                              <label htmlFor="username" className="form-label">
                                {t("Username")}
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="username"
                                placeholder={t("Enter Username") || "Enter Username"}
                                {...register("userName")}
                              // onInput={(e) => {
                              //   e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                              //   trigger("username");
                              // }}
                              />
                              {errors.userName && (
                                <div style={{ color: "red" }}>
                                  {errors.userName.message}
                                </div>
                              )}
                            </div>
                            <div className="col-md-12">
                              <div className="form-group">
                                <label
                                  htmlFor="password"
                                  className="form-label"
                                >
                                  {t("Password")}                                </label>
                                <input
                                  type={showPassword ? "text" : "password"}
                                  className="form-control"
                                  id="password"
                                  placeholder={t("Enter Password") || "Enter Password"}
                                  {...register("password")}
                                />
                                {errors.password && (
                                  <div style={{ color: "red" }}>
                                    {errors.password.message}
                                  </div>
                                )}
                                {showPassword ? (
                                  <i
                                    className="opened-eye-icon"
                                    onClick={togglePasswordVisibility}
                                  />
                                ) : (
                                  <i
                                    className="closed-eye-icon"
                                    onClick={togglePasswordVisibility}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="btn-block">
                                <button
                                  type="submit"
                                  className="btn btn-primary"
                                >
                                  {t("Log In")}
                                </button>

                                <div className="separator">
                                  <span>OR</span>
                                </div>

                                <Link
                                  to="/scanqr"
                                  className="btn btn-dark"
                                >
                                  {t("Log In with QR")}
                                </Link>

                                <Link
                                  to="/forgotpassword"
                                  className="forgot-text"
                                >
                                  {t("Forgot password?")}
                                </Link>
                                <label className="signup-text">
                                  Don’t have an account?{" "}
                                  <Link to="/signup">{t("Sign Up")}</Link>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
          {/* Container : End */}
        </main>
        {/* Main Wrapper : End */}
      </>
    </div>
  );
};

export default Login;








// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { logobig } from "../imaUrl";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { login } from "../feature/auth/authSlice";
// import Loader from "../components/Loader";
// import { useTranslation } from 'react-i18next';

// const Login = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const { t } = useTranslation();

//   // Dynamic schema with translations
//   const schema = yup.object().shape({
//     userName: yup
//       .string()
//       .required(t("Username is required") || "Username is required")
//       .min(3, t("Username must be at least 3 characters") || "Username must be at least 3 characters"),
//     password: yup
//       .string()
//       .required(t("Password is required") || "Password is required")
//       .min(6, t("Password must be at least 6 characters") || "Password must be at least 6 characters"),
//   });

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(schema),
//   });

//   const onSubmit = async (data) => {
//     if (loading === false) {
//       try {
//         const fulldata = {
//           userName: data?.userName,
//           password: data?.password,
//           device_type: "web",
//           fcmToken: localStorage.getItem("fcmToken"),
//         };

//         const { payload } = await dispatch(
//           login({ payload: fulldata, setLoading })
//         );

//         if (payload?.error === false) {
//           navigate("/home");
//           localStorage.setItem(
//             "profile",
//             payload?.data?.role === "customer" ? "customer" : "business"
//           );
//         }
//       } catch (error) { }
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };

//   return (
//     <div>
//       <>
//         <main className="wrapper">
//           {loading && <Loader />}
//           <section className="middle-container">
//             <section className="login-wrapper">
//               <div className="container">
//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="login-left">
//                       <h2 className="login-heading">{t('Welcome to ')}</h2>
//                       <img src={logobig} alt="" />
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="login-right">
//                       <form
//                         className="login-form"
//                         onSubmit={handleSubmit(onSubmit)}
//                       >
//                         <div className="row">
//                           <div className="col-md-12">
//                             <div className="form-group">
//                               <label htmlFor="username" className="form-label">
//                                 {t("Username")}
//                               </label>
//                               <input
//                                 type="text"
//                                 className="form-control"
//                                 id="username"
//                                 placeholder={t("Enter Username") || "Enter Username"}
//                                 {...register("userName")}
//                               />
//                               {errors.userName && (
//                                 <div style={{ color: "red" }}>
//                                   {errors.userName.message}
//                                 </div>
//                               )}
//                             </div>
//                             <div className="col-md-12">
//                               <div className="form-group">
//                                 <label
//                                   htmlFor="password"
//                                   className="form-label"
//                                 >
//                                   {t("Password")}
//                                 </label>
//                                 <input
//                                   type={showPassword ? "text" : "password"}
//                                   className="form-control"
//                                   id="password"
//                                   placeholder={t("Enter Password") || "Enter Password"}
//                                   {...register("password")}
//                                 />
//                                 {errors.password && (
//                                   <div style={{ color: "red" }}>
//                                     {errors.password.message}
//                                   </div>
//                                 )}
//                                 {showPassword ? (
//                                   <i
//                                     className="opened-eye-icon"
//                                     onClick={togglePasswordVisibility}
//                                   />
//                                 ) : (
//                                   <i
//                                     className="closed-eye-icon"
//                                     onClick={togglePasswordVisibility}
//                                   />
//                                 )}
//                               </div>
//                             </div>
//                             <div className="col-md-12">
//                               <div className="btn-block">
//                                 <button
//                                   type="submit"
//                                   className="btn btn-primary"
//                                 >
//                                   {t("Log In")}
//                                 </button>
//                                 <Link
//                                   to="/forgotpassword"
//                                   className="forgot-text"
//                                 >
//                                   {t("Forgot password?")}
//                                 </Link>
//                                 <label className="signup-text">
//                                   {t("Don't have an account?")}{" "}
//                                   <Link to="/signup">{t("Sign Up")}</Link>
//                                 </label>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </form>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </section>
//           </section>
//         </main>
//       </>
//     </div>
//   );
// };

// export default Login;