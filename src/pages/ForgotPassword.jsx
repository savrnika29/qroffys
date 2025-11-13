import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { forgotPassword } from "../feature/auth/authSlice";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  emailOrPhone: yup
    .string()
    .required("Email or phone number is required")
    .min(3, "Must be at least 3 characters"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "New password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    if (loading === false) {
      try {
        const payload = {
          emailOrPhone: data?.emailOrPhone,
          newPassword: data?.newPassword,
          confirmPassword: data?.confirmPassword,
        };

        const res = await dispatch(forgotPassword({ payload, setLoading }));
        if (res?.payload?.error === false) {
          navigate("/login");
        }
        //
      } catch (error) {}
    }
  };

  return (
    <main className="wrapper">
      {loading && <Loader />}
      <section className="middle-container">
        <section className="login-wrapper forgot-wrapper">
          <div className="container">
            <div className="row text-center">
              <div className="col-md-12">
                <h3 className="main-heading">Forgot Password?</h3>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="forgot-password-wrap">
                    <div className="form-group">
                      <label htmlFor="email-phone" className="form-label">
                        Enter Email
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="email-phone"
                        placeholder="Enter Email"
                        {...register("emailOrPhone")}
                      />
                      {errors.emailOrPhone && (
                        <div style={{ color: "red" }}>
                          {errors.emailOrPhone.message}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-pwd" className="form-label">
                        New password
                      </label>
                      {/* /// */}
                      <input
                        type={showNewPwd ? "text" : "password"}
                        className="form-control"
                        id="new-pwd"
                        placeholder="Enter New password"
                        {...register("newPassword")}
                      />
                      {errors.newPassword && (
                        <div style={{ color: "red" }}>
                          {errors.newPassword.message}
                        </div>
                      )}
                      {!showNewPwd ? (
                        <i
                          className="closed-eye-icon"
                          onClick={() => setShowNewPwd(true)}
                        ></i>
                      ) : (
                        <i
                          className="opened-eye-icon"
                          onClick={() => setShowNewPwd(false)}
                        ></i>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="cmf-pwd" className="form-label">
                        Confirm Password
                      </label>
                      <input
                        type={showConfirmPwd ? "text" : "password"}
                        className="form-control"
                        id="cmf-pwd"
                        placeholder="Enter Confirm Password"
                        {...register("confirmPassword")}
                      />
                      {errors.confirmPassword && (
                        <div style={{ color: "red" }}>
                          {errors.confirmPassword.message}
                        </div>
                      )}
                      {!showConfirmPwd ? (
                        <i
                          className="closed-eye-icon"
                          onClick={() => setShowConfirmPwd(true)}
                        ></i>
                      ) : (
                        <i
                          className="opened-eye-icon"
                          onClick={() => setShowConfirmPwd(false)}
                        ></i>
                      )}
                    </div>
                    <div className="btn-block">
                      <button type="submit" className="btn btn-primary">
                        Update
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default ForgotPassword;
