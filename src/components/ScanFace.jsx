import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { scanface } from "../imaUrl";
import { getProfile } from "../feature/profileSlice";
import { faceLogin } from "../feature/auth/authSlice";
import Loader from "../components/Loader";

const Scanface = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const token = useSelector((state) => state.auth?.token);

  /** ✅ Start camera */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current
          .play()
          .catch((err) => console.error("Error playing video:", err));
        setIsCameraActive(true);
      }
    } catch (error) {
      toast.error(
        error.name === "NotAllowedError"
          ? "Please allow camera access."
          : "Unable to access camera."
      );
    }
  };

  /** ✅ Stop camera */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
  };

  /** ✅ Capture image */
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      return canvasRef.current.toDataURL("image/png");
    }
    return null;
  };

  /** ✅ Convert base64 -> File */
  const base64ToFile = (base64String, fileName) => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], fileName, { type: mime });
  };

  /** ✅ Auto Scan + API call */
  const startAutoScan = async () => {
    if (!isCameraActive) await startCamera();
    setIsScanning(true);
    setTimeout(async () => {
      const imageDataUrl = captureImage();
      if (!imageDataUrl) {
        setIsScanning(false);
        stopCamera();
        toast.error("Failed to capture image.");
        return;
      }

      const file = base64ToFile(imageDataUrl, "face.png");
      const formData = new FormData();
      formData.append("file", file);

      try {
        setLoader(true);
        const scanFace = await dispatch(faceLogin({ formData, token }));
        await dispatch(getProfile(token));

        if (scanFace?.payload?.error === false) {
          stopCamera();
          navigate(`/makepaymnetfaceqr`, {
            state: {
              firstName: scanFace?.payload?.data?.user?.firstName,
              lastName: scanFace?.payload?.data?.user?.lastName,
              username: scanFace?.payload?.data?.user?.username,
              _id: scanFace?.payload?.data?.user?.id,
            },
          });
        } else {
          stopCamera();
          setIsScanning(false);
        }
      } catch (err) {
        stopCamera();
        setIsScanning(false);
        toast.error(err?.message || "Something went wrong");
      } finally {
        setLoader(false);
      }
    }, 5000);
  };

  useEffect(() => {
    if (token) dispatch(getProfile(token));
    return () => stopCamera();
  }, [token]);

  return (
    <div>
      <main className="wrapper">
        {/* {loader && <Loader />} */}
        <section className="middle-container">
          <section className="login-wrapper">
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
                    <h3 className="scan-face-heading">Scan Customer Face</h3>
                    <div
                      className="scan-face-box"
                      style={{ position: "relative" }}
                    >
                      {/* Placeholder */}
                      {isCameraActive && <div className="scanner-line"></div>}
                      <img
                        src={scanface}
                        alt="Scan face placeholder"
                        style={{
                          display: !isCameraActive ? "block" : "none",
                          width: "100%",
                        }}
                      />
                      {/* Live video */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          display: isCameraActive ? "block" : "none",
                          width: "100%",
                          borderRadius: "10px",
                        }}
                      />
                      <canvas ref={canvasRef} style={{ display: "none" }} />
                    </div>

                    <div className="btn-block mt-3">
                      <button
                        className="btn btn-primary"
                        onClick={startAutoScan}
                        disabled={isScanning}
                      >
                        {isScanning
                          ? "Scanning..."
                          : isCameraActive
                          ? "Scanning in 5s..."
                          : "Scan Now"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default Scanface;
