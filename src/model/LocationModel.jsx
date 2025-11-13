import React from "react";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";

const LocationModal = ({ isOpen, onClose, businessData }) => {
    if (!isOpen) return null;

    const businessName = businessData?.businessName || "Business Location";
    const businessAddress = businessData?.address || "Address not available";

    // Agar lat/lng API se mile to use karo
    const latitude = businessData?.latitude || 48.6705; // Example default
    const longitude = businessData?.longitude || 11.0997;

    const mapContainerStyle = {
        width: "100%",
        height: "200px",
        borderRadius: "8px",
    };

    const center = { lat: latitude, lng: longitude };

    return (
        <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-lg modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">📍 Location & Contact</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <h6>{businessName}</h6>
                        <p>{businessAddress}</p>

                        {/* Google Map */}
                        <LoadScript googleMapsApiKey="AIzaSyBtpr1ZlktXKQf10oJG06USMK3mw43k8Pc">
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={center}
                                zoom={14}
                            >
                                <Marker position={center} />
                            </GoogleMap>
                        </LoadScript>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
