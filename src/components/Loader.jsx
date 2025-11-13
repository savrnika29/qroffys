import React from "react";

const Loader = () => {
  return (
    <div
      className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "rgba(255,255,255,0.7)",
        zIndex: 9999,
      }}
    >
      <div
        className="spinner-border text-danger"
        style={{ width: "3rem", height: "3rem" }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
