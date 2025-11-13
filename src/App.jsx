import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/Resetpassword";
import Profile from "./pages/Profile";
import Allrequest from "./pages/Allrequest";
import About from "./pages/About";
import Header from "./components/Header";
import Footer from "./components/Footer";
// import Billing from "./pages/Billing";
import Chatlist from "./pages/Chatlist";
import Commanuserprofile from "./pages/Commanuserprofile";
import Commanuserviewbusiness from "./pages/Commanuserviewbusiness";
import Helpcenter from "./pages/Helpcenter";
import Languagesetting from "./pages/Languagesetting";
import Makepayment from "./pages/Makepayment";
import Newquastcommanuser from "./pages/Newquastcommanuser";
import Newstorycommonuser from "./pages/Newstorycommonuser";
import Notoification from "./pages/Notoification";
import Paymenthistory from "./pages/Paymenthistory";
import Personalchat from "./pages/Personalchat";
import Pingers from "./pages/Pingers";
import Qroffydiscountbusinessprofile from "./pages/Qroffydiscountbusinessprofile";
import Saved from "./pages/Saved";
import Savedqastview from "./pages/Savedqastview";
import Scanface from "./pages/Scanface";
import Shortfeeds from "./pages/Shortfeeds";
import Subscription from "./pages/Subscription";
import Verificationcode from "./pages/Verificationcode";
import Editprofile from "./pages/Editprofile";
import Homeindex from "./pages/Homeindex";
import Deactiveteaccount from "./pages/Deactiveteaccount";
import Myqrcode from "./pages/Myqrcode";
import Paymentrequestsendsuccessful from "./pages/Paymentrequestsendsuccessful";
import Makepaymentfaceqr from "./pages/Makepaymentfaceqr";
import Carddetail from "./pages/Carddetail";
import Billingverificationotp from "./pages/Billingverificationotp";
import Sendrequest from "./pages/Sendrequest";
import Subsriptionfacescan from "./pages/Subsriptionfacescan";
import Mybusinessprofile from "./pages/Mybusinessprofile";
import Viewbusinesseditprofile from "./pages/Viewbusinesseditprofile";
import Paymenthistorybusiness from "./pages/Paymenthistorybusiness";
import Approveforgotpage from "./pages/Approveforgotpage";
import Paymenthistorycustomer from "./pages/Paymenthistorycustomer";
import Businesssendrequest from "./pages/Businesssendrequest";
import Privacypolicy from "./components/Privacypolicy";
import TermsConditions from "./pages/TermsConditions";
import { messaging } from "./firebase/firebaseConfig";
import { getToken, onMessage } from "firebase/messaging";
import "./i18n";
import PrivateRoute from "./components/PrivateRoute";
import ScanQrLogin from "./pages/ScanQrLogin";
import Scanner from "./pages/Scanner";
import DetectFace from "./pages/DetectFace";
import QRScanner from "./pages/QrScanner";
import MakeYourPayment from "./pages/MakeYourpayment";
import SendQRrequest from "./pages/sendqrrequest";
import ConsentModal from "./model/ConsentModal";
import CookiePolicyModal from "./model/ConsentModal";
import CookiesPolicy from "./pages/Cookie";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppRoutes = () => {
  const location = useLocation();
  const stripePubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = loadStripe(stripePubKey);
  const token = useSelector((state) => state.auth?.token);

  // Define routes where header should be hidden
  const noHeaderRoutes = [
    "/profile",
    "/allrequest",
    "/about",
    "/billing",
    "/chatlist",
    "/commanuserprofile", // Added for current user profile
    "/commanuserprofile/:userId",
    "/commanuserviewbusiness/:userId",
    "/enteramount",
    "/helpcenter",
    "/languagesetting",
    "/makepayment",
    "/newquastcommanuser",
    "/newstorycommonuser",
    "/notification",
    "/paymenthistory",
    "/personalchat/:receiverId",
    "/pingers/:targetUserId",
    "/qroffydiscountbusinessprofile",
    "/saved",
    "/savedqastview",
    "/scanface",
    "/shortfeeds",
    "/subscription",
    "/editprofile",
    "/home",
    "/deactiveteaccount",
    "/myqrcode",
    "/paymentrequestsendsuccessful",
    "/makepaymnetfaceqr",
    "/carddetail",
    "/billingverificationotp",
    "/sendrequest",
    "/subsriptionfacescan",
    "/mybusinessprofile",
    "/viewbusinesseditprofile",
    "/paymenthistorybusiness",
    "/forgot-password/confirm",
    "/paymenthistorycustomer",
    "/businesssendrequest",
    "/sccaner",
    "/make-payment",
    "/qr-scanner",
    "/discount",
  ];

  // const hideHeader = noHeaderRoutes.some((route) =>
  //   location.pathname.startsWith(route.split("/:")[0])
  // ) && location.pathname !== "/helpcenter";
  const hideHeader = noHeaderRoutes.some((route) =>
    location.pathname.startsWith(route.split("/:")[0])
  );
  return (
    <>
      <Elements stripe={stripePromise}>
        {!hideHeader && <Header />}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          // style={{ marginTop: "100px" }}
        />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Homeindex />} />
          <Route path="/login" element={<Login />} />
          <Route path="/scanqr" element={<ScanQrLogin />} />
          <Route path="/privacy-policy" element={<Privacypolicy />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/:slug" element={<TermsConditions />} />{" "}
          <Route path="/:slug" element={<CookiesPolicy />} />{" "}
          <Route path="/helpcenter" element={<Helpcenter />} />
          {/* <Route path="/billing" element={<Billing />} /> */}
          {/* //private Route */}
          <Route path="/home" element={<PrivateRoute element={<Home />} />} />
          <Route
            path="/profile"
            element={<PrivateRoute element={<Profile />} />}
          />
          <Route
            path="/allrequest"
            element={<PrivateRoute element={<Allrequest />} />}
          />
          <Route
            path="/chatlist"
            element={<PrivateRoute element={<Chatlist />} />}
          />
          <Route
            path="/commanuserprofile"
            element={<PrivateRoute element={<Commanuserprofile />} />}
          />
          {/* Added for current user */}
          <Route
            path="/commanuserprofile/:userId"
            element={<PrivateRoute element={<Commanuserprofile />} />}
          />
          <Route
            path="/commanuserviewbusiness/:userId"
            element={<PrivateRoute element={<Commanuserviewbusiness />} />}
          />
          <Route
            path="/sendrequest"
            element={<PrivateRoute element={<Sendrequest />} />}
          />
          <Route
            path="/helpcenter"
            element={<PrivateRoute element={<Helpcenter />} />}
          />
          <Route
            path="/languagesetting"
            element={<PrivateRoute element={<Languagesetting />} />}
          />
          <Route
            path="/makepayment"
            element={<PrivateRoute element={<Makepayment />} />}
          />
          <Route
            path="/newquastcommanuser"
            element={<PrivateRoute element={<Newquastcommanuser />} />}
          />
          <Route
            path="/newstorycommonuser"
            element={<PrivateRoute element={<Newstorycommonuser />} />}
          />
          <Route
            path="/notification"
            element={<PrivateRoute element={<Notoification />} />}
          />
          <Route
            path="/paymenthistory"
            element={<PrivateRoute element={<Paymenthistory />} />}
          />
          {/* <Route path="/personalchat/:userId" element={<Personalchat />} /> */}
          <Route
            path="/personalchat/:receiverId"
            element={<PrivateRoute element={<Personalchat />} />}
          />
          <Route
            path="/pingers"
            element={<PrivateRoute element={<Pingers />} />}
          />
          <Route
            path="/discount"
            element={<PrivateRoute element={<SendQRrequest />} />}
          />
          <Route
            path="/scan-face"
            element={<PrivateRoute element={<DetectFace />} />}
          />
          <Route
            path="/pingers/:targetUserId"
            element={<PrivateRoute element={<Pingers />} />}
          />
          {/* For other users */}
          <Route
            path="/qroffydiscountbusinessprofile"
            element={
              <PrivateRoute element={<Qroffydiscountbusinessprofile />} />
            }
          />
          <Route path="/saved" element={<PrivateRoute element={<Saved />} />} />
          <Route path="/savedqastview/:id" element={<PrivateRoute element={<Savedqastview />} />} />
          {/* <Route path="/savedqastview" element={<Savedqastview />} /> */}
          <Route
            path="/scanface"
            element={<PrivateRoute element={<Scanface />} />}
          />
          <Route
            path="/shortfeeds"
            element={<PrivateRoute element={<Shortfeeds />} />}
          />
          <Route
            path="/subscription"
            element={<PrivateRoute element={<Subscription />} />}
          />
          <Route
            path="/verificationcode"
            element={<PrivateRoute element={<Verificationcode />} />}
          />
          <Route
            path="/editprofile"
            element={<PrivateRoute element={<Editprofile />} />}
          />
          <Route
            path="/deactiveteaccount"
            element={<PrivateRoute element={<Deactiveteaccount />} />}
          />
          <Route
            path="/myqrcode"
            element={<PrivateRoute element={<Myqrcode />} />}
          />
          <Route
            path="/paymentrequestsendsuccessful"
            element={
              <PrivateRoute element={<Paymentrequestsendsuccessful />} />
            }
          />
          <Route
            path="/makepaymnetfaceqr"
            element={<PrivateRoute element={<Makepaymentfaceqr />} />}
          />
          <Route
            path="/carddetail"
            element={<PrivateRoute element={<Carddetail />} />}
          />
          <Route
            path="/billingverificationotp"
            element={<PrivateRoute element={<Billingverificationotp />} />}
          />
          <Route
            path="/subsriptionfacescan"
            element={<PrivateRoute element={<Subsriptionfacescan />} />}
          />
          <Route
            path="/mybusinessprofile"
            element={<PrivateRoute element={<Mybusinessprofile />} />}
          />
          <Route
            path="/viewbusinesseditprofile"
            element={<PrivateRoute element={<Viewbusinesseditprofile />} />}
          />
          <Route
            path="/paymenthistorybusiness"
            element={<PrivateRoute element={<Paymenthistorybusiness />} />}
          />
          <Route
            path="/forgot-password/confirm"
            element={<Approveforgotpage />}
          />
          <Route
            path="/paymenthistorycustomer"
            element={<PrivateRoute element={<Paymenthistorycustomer />} />}
          />
          <Route
            path="/businesssendrequest"
            element={<PrivateRoute element={<Businesssendrequest />} />}
          />
          <Route
            path="/sccaner"
            element={<PrivateRoute element={<Scanner />} />}
          />
          <Route
            path="/qr-scanner"
            element={<PrivateRoute element={<QRScanner />} />}
          />
          <Route
            path="/make-payment"
            element={<PrivateRoute element={<MakeYourPayment />} />}
          />
        </Routes>
        <Footer />
      </Elements>
    </>
  );
};

const App = () => {
  const setupNotifications = () => {
    // Request permission for notifications
    Notification.requestPermission().then((permission) => {
      // if (permission === "granted") {
      //   console.log("Notification permission granted.");
      // } else {
      //   console.log("Notification permission denied.");
      // }
    });

    // Get token (for example, for sending notifications to this device)
    getToken(messaging, {
      vapidKey:
        "BMJ-r6kwxqKutQi71-teUTWFd7Co3UyvczCRkZWaxMxhzIFR2jmL54MD0dlfbGElHOTIckVj7LCN3tUUWEHgjFc",
      // "BHDphtAs7Jj17WgSM1frvesFcitFU4DP-VvJzCigWKpV21lbmUfm4ite81S4K48HMgfMV5xrhHgxI7KU-JE_IYQ",
    })
      .then((currentToken) => {
        if (currentToken) {
          // Send this token to your server, if needed
          localStorage.setItem("fcmToken", currentToken);
        } else {
        }
      })
      .catch((err) => {
        console.error("An error occurred while retrieving token. ", err);
      });

    // Listen for messages while the app is in the foreground
    onMessage(messaging, (payload) => {
      // You can show in-app notifications or handle them however you need
    });
  };

  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <Router>
      <CookiePolicyModal />
      <AppRoutes />
    </Router>
  );
};

export default App;
