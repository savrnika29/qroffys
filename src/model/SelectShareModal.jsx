import { useEffect, useRef } from "react";
import { Modal } from "bootstrap";

const SelectShareModal = ({ isOpen, onClose, onSelectOption, post }) => {
    const modalRef = useRef(null);
    const modalInstance = useRef(null);

    useEffect(() => {
        if (modalRef.current) {
            modalInstance.current = new Modal(modalRef.current, {
                backdrop: "static",
                keyboard: false,
            });
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            modalInstance.current?.show();
        } else {
            modalInstance.current?.hide();
        }
    }, [isOpen]);

    return (
        <div
            ref={modalRef}
            className="modal fade share-post-popup"
            id="selectShareModal"
            tabIndex={-1}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Share Post</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        />
                    </div>
                    <div className="modal-body">
                        <ul className="list-unstyled mb-3">
                            <li className="mb-2">
                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={() => onSelectOption("internal")}
                                >
                                    Internal Share
                                </button>
                            </li>
                            <li className="mb-2">
                                <button
                                    type="button"
                                    className="btn btn-dark w-100"
                                    onClick={() => onSelectOption("external")}
                                >
                                    External Share
                                </button>
                            </li>
                        </ul>
                        {/* <button
                            type="button"
                            className="btn btn-light w-100"
                            onClick={onClose}
                        >
                            Cancel
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectShareModal;
