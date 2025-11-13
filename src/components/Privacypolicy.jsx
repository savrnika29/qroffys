import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { fetchTerms } from '../features/terms/termsSlice';
import { fetchTerms } from '../feature/legal/termsSlice';

const Privacypolicy = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem('token'); // Get your auth token here

  const { termsData, loading, error } = useSelector((state) => state.terms);

  useEffect(() => {
    if (token) {
      dispatch(fetchTerms(token));
    }
  }, [dispatch, token]);

  return (
    <div className="container mt-4">
      <h2>Terms & Conditions</h2>
      {loading && <p>Loading terms...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && (
        <div
          dangerouslySetInnerHTML={{ __html: termsData }}
          style={{ marginTop: '20px' }}
        />
      )}
    </div>
  );
};

export default Privacypolicy;
