import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BarcodeScanner from "react-qr-barcode-scanner";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import Thankyou from "../model/Thankyou";
import { showAlert } from "../utils/swalHelper";

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.token);

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setCameraPermission(true);
        stream.getTracks().forEach((track) => track.stop());
        setScanning(true);
      } catch (err) {
        setCameraPermission(false);
      }
    };
    checkCameraPermission();
  }, []);

  const restartScanner = () => {
    setScanResult(null);

    setScanning(true);
  };

  const handlePayment = async (qrData) => {
    if (!token) {
      setScanning(false);
      return;
    }
    const cleanData = qrData?.replace(/^"|"$/g, "").trim();
    const userdata = cleanData?.split("/");
    const objectId = userdata[0];
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(objectId);
    if (!isValidObjectId) {
      setScanning(false);
      navigate(-1);
      return showAlert("error", "Invalid QR");
    }

    navigate("/make-payment", {
      state: {
        _id: userdata?.[0],
        businessName: userdata[1],
      },
    });

    setScanning(false);
  };
  const handleScan = (err, result) => {
    if (result) {
      setScanResult(result.text);
      setScanning(false);
      handlePayment(result.text);
    }
    if (err && err.name !== "NotFoundError") {
      let errorMessage = "Error scanning QR code";
      if (err.name === "NotAllowedError") {
        errorMessage = "Camera access denied. Please allow camera permissions.";
      } else if (err.name === "NotReadableError") {
        errorMessage = "Unable to read QR code. Please try a clearer image.";
      }
    }
  };

  return (
    <div>
      <ProfileHeader />
      <main className="wrapper">
        <section className="middle-container">
          <div className="container-fluid">
            <div className="profile-wrapper">
              <div className="row">
                <div className="col-md-3">
                  <Sidebar />
                </div>
                <div className="col-md-9">
                  <div className="profile-wrapper-right">
                    <h3 className="main-heading text-center">
                      QR Code Scanner
                    </h3>

                    <div className="scanner-container">
                      {cameraPermission === false ? (
                        <div className="alert alert-danger text-center">
                          <p>
                            Camera access is required to scan QR codes. Please
                            enable camera permissions in your browser settings
                            and try again.
                          </p>
                          <button
                            className="btn btn-primary"
                            onClick={restartScanner}
                          >
                            Try Again
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                          }}
                        >
                          {/* <div className="text-center">
                            <h5>Scan QR Code to Pay</h5>
                            <p>Position the QR code within the frame to scan</p>
                          </div> */}
                          {scanning && (
                            <div
                              style={{
                                position: "relative",
                                width: 300,
                                height: 228,
                              }}
                            >
                              <BarcodeScanner
                                width={300}
                                height={228}
                                onUpdate={handleScan}
                                facingMode="environment"
                              />

                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  border: "2px solid rgba(255,255,255,0.6)",
                                  boxSizing: "border-box",
                                }}
                              />

                              <div className="scanner-line" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Thankyou />
      </main>
    </div>
  );
};

export default QRScanner;
