import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import BarcodeScanner from "react-qr-barcode-scanner";
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import Thankyou from "../model/Thankyou";
import { payCharge } from "../feature/paymentSlice";
import { getSavedCardvedio } from "../feature/savedCardSlice";
import { showAlert } from "../utils/swalHelper";

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [allCards, setCards] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.auth?.token);
  const { customerId } = useSelector((state) => state.auth?.user);
  const { businessId, amount, discountedPrice } = location.state || {};
  const [showModal, setShowModal] = useState(false);
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
        setError(
          "Camera access denied. Please allow camera permissions in your browser settings."
        );
      }
    };
    checkCameraPermission();
  }, []);

  const restartScanner = () => {
    setScanResult(null);
    setError(null);
    setPaymentProcessing(false);
    setScanning(true);
  };

  const handlePayment = async (qrData) => {
    if (!token) {
      setError("Please log in first");
      setScanning(false);
      return;
    }

    if (!businessId || !amount) {
      setError("Missing payment details");
      setScanning(false);
      return;
    }

    let cleanedQrData = qrData?.replace(/^"|"$/g, ""); // remove leading/trailing quotes
    const splitData = cleanedQrData?.split("/");

    if (businessId !== splitData[0]) {
      setPaymentProcessing(false);
      setError("Invalid QR");

      setScanning(false);
      navigate(-1);
      return showAlert("error", "Invalid QR");
    }
    setPaymentProcessing(true);
    setScanning(false);

    try {
      const { payload } = await dispatch(
        payCharge({
          token,
          planId: null,
          amount: discountedPrice,
          paymentMethodId: allCards?.id,
          businessId,
          requestId: null,
        })
      );

      if (payload?.error === false) {
        setPaymentProcessing(false);
        // showAlert("success", "Payment Successfull");
        // navigate("/home");
        setShowModal(true);
        const modalEl = document.getElementById("thankyoupopup");
        if (modalEl && window.bootstrap && window.bootstrap.Modal) {
          const modalInstance = new window.bootstrap.Modal(modalEl);
          modalInstance.show();
        }
      }
      setPaymentProcessing(false);
      setScanning(true);
    } catch (error) {
      setPaymentProcessing(false);
      setScanning(true);
    }
  };

  const goBack = () => {
    navigate(-1);
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

  const getMyCardsDetails = async () => {
    try {
      const { payload } = await dispatch(
        getSavedCardvedio({ token, customerId })
      );
      if (payload?.length > 0) {
        setCards(payload[payload?.length - 1]);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (token) {
      getMyCardsDetails();
    }
  }, []);

  if (!businessId || !amount) {
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
                      <h3 className="main-heading">Scanner</h3>
                      <div className="alert alert-danger">
                        <p>
                          Payment details are missing. Please go back and try
                          again.
                        </p>
                        <button className="btn btn-secondary" onClick={goBack}>
                          Go Back
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

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
                  <div className="profile-wrapper-right scanner-wrap">
                    <h3 className="main-heading text-center">
                      QR Code Scanner
                    </h3>
                    {/* 
                    <div className="payment-details mb-4">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">Payment Details</h5>
                          <p>
                            <strong>Amount:</strong> ${amount} USD
                          </p>
                          <p>
                            <strong>Discounted Price:</strong> $
                            {discountedPrice} USD
                          </p>
                          <p>
                            <strong>Business ID:</strong> {businessId}
                          </p>
                        </div>
                      </div>
                    </div> */}

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
                      ) : paymentProcessing ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">
                              Processing...
                            </span>
                          </div>
                          <p className="mt-3">Processing your payment...</p>
                          <p className="text-success">
                            QR Code scanned successfully!
                          </p>
                          <p>Amount: ${discountedPrice} USD will be deducted</p>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                          }}
                        >
                          <div className="text-center"></div>
                          {scanning && (
                            // <BarcodeScanner
                            //   width={300}
                            //   height={300}
                            //   onUpdate={handleScan}
                            //   //   stopStream={!scanning}
                            //   facingMode="environment"
                            //   torch={true} // Enable torch if available
                            // />
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

                              {/* 🔹 Overlay box */}
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

                              {/* 🔹 Scanning line */}
                              <div className="scanner-line" />
                            </div>
                          )}

                          {/* <div className="text-center mt-3">
                            <button
                              className="btn btn-secondary me-2"
                              onClick={goBack}
                            >
                              Cancel
                            </button>
                            {error && (
                              <button
                                className="btn btn-primary"
                                onClick={restartScanner}
                              >
                                Restart Scanner
                              </button>
                            )}
                          </div> */}
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

export default Scanner;
