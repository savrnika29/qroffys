import { useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import axios from "axios";
import { useSelector } from "react-redux";
import { showAlert } from "../utils/swalHelper";
import { toast } from "react-toastify";

const InternalShareModal = ({ isOpen, onClose, post, postLink, onShare }) => {
    const modalRef = useRef(null);
    const modalInstance = useRef(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const { token } = useSelector((state) => state.auth);

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
            fetchUsers();
        } else {
            modalInstance.current?.hide();
            setSelectedUsers([]);
            setSearchText("");
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/users?limit=500`,

                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );
            const usersList = data?.data?.users || [];
            setUsers(usersList);
            setFilteredUsers(usersList);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSearch = (e) => {
        const text = e.target.value.toLowerCase();
        setSearchText(text);
        setFilteredUsers(
            users.filter((user) => {
                const name = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
                const business = (user.businessName || "").toLowerCase();
                return name.includes(text) || business.includes(text);
            })
        );
    };

    const handleShare = async () => {
        if (selectedUsers.length === 0) return;
        try {
            onShare(selectedUsers);
            onClose();
            toast.success("Shared successfully.")
        } catch (err) {
            toast.error("Failed to share.")
        }
    };

    return (
        <div
            ref={modalRef}
            className="modal fade internal-popup"
            id="internalShareModal"
            tabIndex={-1}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Share Internally</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        />
                    </div>

                    <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Search users..."
                            value={searchText}
                            onChange={handleSearch}
                        />

                        {loading ? (
                            <p>Loading users...</p>
                        ) : filteredUsers.length > 0 ? (
                            <ul className="list-group">
                                {filteredUsers.map((user) => {
                                    const displayName =
                                        user.firstName || user.lastName
                                            ? `${user.firstName || ""} ${user.lastName || ""}`
                                            : user.businessName || "Unknown";
                                    return (
                                        <li
                                            key={user._id}
                                            className={`list-group-item d-flex justify-content-between align-items-center ${selectedUsers.includes(user._id) ? "active" : ""
                                                }`}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => toggleUserSelection(user._id)}
                                        >
                                            {displayName}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p>No users found.</p>
                        )}
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="modal-footer">
                            <button className="btn btn-dark" onClick={onClose}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleShare}>
                                Share Separately
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InternalShareModal;