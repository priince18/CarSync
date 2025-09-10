import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CarCard from '../components/CarCard';

const LikedCarsPage = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { isLoggedIn, api } = authContext;
  const [likedCars, setLikedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const fetchLikedCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/user/liked-cars');
        setLikedCars(response.data || []);
      } catch (err) {
        setError('Failed to fetch liked cars.');
      } finally {
        setLoading(false);
      }
    };
    fetchLikedCars();
  }, [isLoggedIn, api, navigate]);

  const handleUnlike = async (carId) => {
    try {
      await api.delete(`/user/like-car/${carId}`);
      setLikedCars(prev => prev.filter(car => car._id !== carId));
    } catch (err) {
      alert('Failed to unlike car.');
    }
  };

  const handleCarClick = (carId) => {
    navigate(`/car-details/${carId}`);
  };

  if (loading) return <div className="text-center py-10">Loading liked cars...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (likedCars.length === 0) return <div className="text-center py-10">No liked cars found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">Your Liked Cars</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedCars.map(car => (
          <CarCard
            key={car._id}
            car={car}
            onCarClick={handleCarClick}
            isLiked={true}
            onLikeToggle={() => handleUnlike(car._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default LikedCarsPage;
