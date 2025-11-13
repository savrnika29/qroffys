import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { payCharge } from "../feature/paymentSlice";
import { toast } from "react-toastify";
import { scanface } from "../imaUrl";
import { getSavedCardvedio } from "../feature/savedCardSlice";
import { getProfile } from "../feature/profileSlice";
import { faceRegister, faceLogin } from "../feature/auth/authSlice";
import Makepayment from "./Makepayment";
import Loader from "../components/Loader";
import ProfileHeader from "../components/ProfileHeader";
import Thankyou from "../model/Thankyou";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

const Scanface = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [loader, setLoader] = useState(false);
  const [searchParams] = useSearchParams();

  const [faceDetector, setFaceDetector] = useState(null);

  const planIdFromQuery = searchParams.get("planId");
  const getAmount = searchParams.get("amount");
  const requestId = searchParams.get("requestId");
  const businessId = searchParams.get("businessId");
  const pay = searchParams.get("pay");

  const [profile, setProfile] = useState("");
  const [userData, setuserData] = useState("");
  const [openModel, setopenModel] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { isCardAdded, isFaceRegistered } = useSelector(
    (state) => state?.profile?.user
  );
  const token = useSelector((state) => state.auth?.token);
  const { savedCardDetails } = useSelector((state) => state.savedCardsvedio);
  const { cardvedio: savedCards = [], loading } = useSelector(
    (state) => state.savedCards || {}
  );
  const { amount } = location.state || {};
  const data = { businessId, amount };

  const paymentMethodId =
    savedCards.length > 0
      ? savedCards[0].id || savedCards[0]._id || savedCards[0].card?.id
      : null;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(detectFaces);
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Camera access is required!");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCapturedImage(null);
  };

  const base64ToFile = (base64String, fileName) => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  const startAutoScan = async () => {
    if (!isCameraActive) {
      await startCamera();
    }

    setScanning(true);

    // Run scan after 15 seconds
    setTimeout(async () => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageDataUrl = canvasRef.current.toDataURL("image/png");
        setCapturedImage(imageDataUrl);

        const file = base64ToFile(imageDataUrl, "scan.png");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userData._id);

        try {
          let scanFace;
          if (isFaceRegistered === false) {
            scanFace = await dispatch(faceRegister({ formData, token }));
          } else {
            scanFace = await dispatch(faceLogin({ formData, token }));
          }

          await dispatch(getProfile(token));

          if (scanFace?.payload?.error === false) {
            stopCamera();
            setopenModel(true);

            if (isCardAdded && pay === "true") {
              await handleSelectedCard(
                savedCardDetails[savedCardDetails?.length - 1].id,
                planIdFromQuery,
                getAmount,
                userData.customerId,
                businessId
              );
            }
          } else {
            stopCamera();
            setScanning(false);
          }
        } catch (err) {
          console.error("Face scan failed:", err);
          stopCamera();
          setScanning(false);
        }
      } else {
        // No video/canvas available
        stopCamera();
        setScanning(false);
      }
    }, 5000);
  };

  const getUserProfile = () => {
    dispatch(getProfile(token))
      .unwrap()
      .then((userData) => {
        setProfile(userData.role);
        setuserData(userData);

        if (userData?.customerId) {
          dispatch(
            getSavedCardvedio({ token, customerId: userData.customerId })
          );
        } else {
          toast.error("Customer ID not found in profile");
        }
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
      });
  };

  useEffect(() => {
    if (userData.customerId && token) {
      dispatch(getSavedCardvedio({ customerId: userData.customerId, token }));
    }
  }, [dispatch, userData.customerId, token]);

  useEffect(() => {
    if (token) {
      getUserProfile();
    }
  }, [dispatch, token]);

  const handleSelectedCard = async (
    selectedCard,
    planIdFromQuery,
    getAmount,
    customerId,
    businessId
  ) => {
    try {
      setLoader(true);
      const result = await dispatch(
        payCharge({
          token,
          planId: planIdFromQuery ? planIdFromQuery : "",
          amount: getAmount,
          paymentMethodId: selectedCard,
          businessId: businessId || "",
          requestId: requestId ? requestId : "",
        })
      );

      if (result?.payload?.error === false) {
        setopenModel(true);
        const modalEl = document.getElementById("thankyoupopup");
        if (modalEl && window.bootstrap && window.bootstrap.Modal) {
          const modalInstance = new window.bootstrap.Modal(modalEl);
          modalInstance.show();
        }
        stopCamera();
      }
      setLoader(false);
    } catch (err) {
      console.error("Payment failed:", err);
      toast.error(`Payment failed: ${err.message || "Unknown error"}`);
      setLoader(false);
    }
  };

  useEffect(() => {
    async function initFaceDetector() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );
      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_detector/face_detector/float16/1/face_detector.tflite",
        },
        runningMode: "VIDEO",
      });
      setFaceDetector(detector);
    }
    initFaceDetector();
  }, []);

  const detectFaces = async () => {
    if (!videoRef.current || !faceDetector) return;

    const detections = await faceDetector.detectForVideo(
      videoRef.current,
      performance.now()
    );

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    detections?.detections?.forEach((det) => {
      const box = det.boundingBox;
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 3;
      ctx.strokeRect(box.originX, box.originY, box.width, box.height);
    });

    requestAnimationFrame(detectFaces);
  };

  return (
    <div>
      <ProfileHeader />

      <main className="wrapper">
        {loader === true && <Loader />}
        <section className="middle-container">
          <section className="login-wrapper select-card-wrap">
            {openModel === false ? (
              <div className="container">
                <div className="row text-center">
                  <div className="col-md-12">
                    <h3 className="main-heading scan-face-main-heading">
                      Scan Face
                    </h3>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="scan-face-wrap">
                      <div
                        className="scan-face-box"
                        style={{ position: "relative" }}
                      >
                        {isCameraActive && <div className="scanner-line"></div>}
                        <img
                          src={scanface}
                          alt="Scan face placeholder"
                          style={{
                            display: !isCameraActive ? "block" : "none",
                            width: "100%",
                            height: "auto",
                          }}
                        />
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            display: isCameraActive ? "block" : "none",
                            width: "100%",
                            height: "auto",
                            borderRadius: "10px",
                          }}
                        />
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                      </div>

                      <div className="btn-block">
                        {!scanning && (
                          <a
                            href="#"
                            className="btn btn-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              startAutoScan();
                            }}
                            style={{
                              opacity: loading ? 0.7 : 1,
                              pointerEvents: loading ? "none" : "auto",
                            }}
                          >
                            Scan Now
                          </a>
                        )}
                        {scanning && (
                          <button className="btn btn-secondary" disabled>
                            Scanning...
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : pay !== "true" &&
              isCardAdded &&
              savedCardDetails?.length > 0 ? (
              <>
                <h2 className="main-heading text-center">Select Card</h2>
                {savedCardDetails?.map((card, index) => (
                  <div
                    className="billing-box m-auto"
                    key={card._id || card.id || index}
                    onClick={() =>
                      handleSelectedCard(
                        card.id,
                        planIdFromQuery,
                        getAmount,
                        userData.customerId,
                        businessId
                      )
                    }
                  >
                    <div className="billing-head">
                      <h3>
                        {(
                          card.card?.brand ||
                          card.brand ||
                          "CARD"
                        ).toUpperCase()}
                      </h3>
                    </div>
                    <div className="card-no">
                      **** **** **** {card.card?.last4 || card.last4 || "****"}
                    </div>
                    <div className="card-date">
                      Expiry Date:{" "}
                      {card.card?.exp_month || card.exp_month || "MM"}/
                      {card.card?.exp_year || card.exp_year || "YY"}
                    </div>
                  </div>
                ))}
              </>
            ) : !isCardAdded ? (
              <Makepayment />
            ) : (
              ""
            )}
          </section>
        </section>
      </main>
      <Thankyou />
    </div>
  );
};

export default Scanface;
