import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const BusinessOnBord = () => {
    const [loading, setLoading] = useState(false);
    const { token } = useSelector((store) => store?.auth);

    const handleOnboard = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post('http://localhost:5500/api/v1/stripe/business-onboard',
                {
                    businessId: '68906c2d7fdc665d1e3e04c7'
                },
                {
                    headers: {
                        Authorization: `${token}`, // add Bearer token
                        "Content-Type": "application/json",
                    },
                }
            );

            if (data?.data?.onboardingUrl) {
                window.location.href = data.data.onboardingUrl; // Redirect to Stripe onboarding
            }
        } catch (err) {
            console.error(err);
            alert("Failed to start onboarding");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Business Onboarding</h2>
            <button onClick={handleOnboard} disabled={loading}>
                {loading ? "Processing..." : "Start Onboarding"}
            </button>
        </div>
    );
};

export default BusinessOnBord;
