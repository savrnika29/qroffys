import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store, persistor } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../public/swiper-bundle.min.css";
import "../public/businessmain.css";
import "../public/main.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./i18n";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css'
// import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* <ToastContainer position="top-right" autoClose={3000} theme="colored" /> */}
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
