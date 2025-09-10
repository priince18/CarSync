import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { images } from '../images/images'; // Adjust path if needed

const HomePage = () => {
  const navigate = useNavigate();
  // Ensure featuredCars is always an array
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [errorCars, setErrorCars] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCars, setTotalCars] = useState(null);

  // Fetch featured cars from the backend
  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Fetch only available cars for the home page featured section
        const response = await fetch('http://localhost:5000/api/cars'); // Ensure this fetches available cars
        const data = await response.json();
        if (response.ok) {
          // IMPORTANT: Ensure data is an array, or default to an empty array
          setFeaturedCars(Array.isArray(data) ? data : []);
          console.log("Home.js: Fetched featured cars:", data.length); // Debug log
        } else {
          setErrorCars(data.message || 'Failed to fetch featured cars.');
          setFeaturedCars([]); // In case of error, ensure it's an empty array
          console.error("Home.js: Error fetching featured cars:", data.message); // Debug log
        }
      } catch (err) {
        console.error("Home.js: Network error fetching featured cars:", err); // Debug error
        setErrorCars('Network error or server unavailable.');
        setFeaturedCars([]); // On network error, ensure it's an empty array
      } finally {
        setLoadingCars(false);
      }
    };
    fetchCars();

    const fetchTotalCars = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cars/count');
        const data = await response.json();
        if (response.ok) {
          setTotalCars(data.total_cars);
        } else {
          console.error("Home.js: Failed to fetch car count", data.message);
        }
      } catch (err) {
        console.error("Home.js: Network error fetching car count:", err);
      }
    };
    fetchTotalCars();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const url = `/buy?search=${encodeURIComponent(searchQuery)}`;
    console.log("Home.js: Navigating to:", url); // Debug log
    navigate(url);
  };

  const handleExploreCategory = (categoryType, value) => {
    //     if (categoryType === 'brand') {
    //       navigate(`/buy?brand=${encodeURIComponent(value)}`);
    //     } else {
    //       navigate(`/buy?city=${encodeURIComponent(value)}`);
    //  }
    navigate(`/buy`);
  };

  // Dummy data for categories (ideally fetched from backend or config)

  const popularBrands = [
    { name: 'Maruti Suzuki', logo: images.maruti_logo || 'MS' },
    { name: 'Hyundai', logo: images.hyundai_logo || 'HY' },
    { name: 'Tata', logo: images.tata_logo || 'TA' },
    { name: 'Mahindra', logo: images.mahindra_logo || 'MA' },
    { name: 'Kia', logo: images.kia_logo || 'KI' },
    { name: 'Toyota', logo: images.toyota_logo || 'TO' },
  ];

  const cities = [
    'Delhi', 'rajkot', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kolkata'
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-inter text-gray-800">
      {/* Hero Section */}
      <section className="relative h-screen bg-cover bg-center flex items-center justify-center text-white p-6"
        style={{ backgroundImage: `url(${images.home})` }}>
        <div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 animate-fade-in-down">
            Find Your Perfect Ride
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90 animate-fade-in-up">
            Your trusted marketplace for buying and selling pre-owned cars.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10 animate-fade-in-up">
            <button
              onClick={() => navigate('/buy')}
              className="bg-customBlue hover:bg-customGold text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
            >
              Buy a Car
            </button>
            <button
              onClick={() => navigate('/sell')}
              className="bg-transparent border-2 border-white hover:bg-white hover:text-customBlue text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
            >
              Sell Your Car
            </button>
          </div>
          {/* Search Bar */}
          {/* <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto bg-white rounded-full shadow-xl flex items-center p-2 animate-fade-in-up">
            <input
              type="text"
              placeholder="Search by make, model, or city..."
              className="flex-grow py-3 px-5 text-gray-800 rounded-l-full focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-customBlue hover:bg-customGold text-white rounded-full p-3 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
          </form> */}
        </div>
      </section>

      {/* CarSync Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12 text-customBlue">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="text-customGold mb-4">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">200-Points Inspection</h3>
              <p className="text-gray-600">Every car undergoes a rigorous quality check for your peace of mind.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="text-customGold mb-4">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M19 12h-2V7h-4V5h4V3h2v2h2v2h-2v5zm-7 7c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Fixed Price Assurance</h3>
              <p className="text-gray-600">Transparent, non-negotiable prices mean no surprises.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="text-customGold mb-4">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">5-Day Money Back</h3>
              <p className="text-gray-600">Not satisfied? Get a full refund within 5 days, no questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12 text-customBlue">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-customBlue rounded-full flex items-center justify-center mb-4 shadow-md">
                <svg className="w-10 h-10 text-customGold" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Find Your Car</h3>
              <p className="text-gray-600">Browse a wide selection of quality pre-owned vehicles.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-customBlue rounded-full flex items-center justify-center mb-4 shadow-md">
                <svg className="w-10 h-10 text-customGold" fill="currentColor" viewBox="0 0 24 24"><path d="M17 18H7V6h10v12zm-3.5-8h-3v-3h3v3zm0 4h-3v-3h3v3zm4.5 0h-3v-3h3v3zm0-4h-3v-3h3v3zM20 4h-3V2h-2v2H9V2H7v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Easy Process</h3>
              <p className="text-gray-600">Simple steps for purchase, financing, and paperwork.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-customBlue rounded-full flex items-center justify-center mb-4 shadow-md">
                <svg className="w-10 h-10 text-customGold" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 2.01C18.72 1.42 18.16 1 17.5 1h-11c-.66 0-1.21.42-1.42 1.01L3 8v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5S16.67 12 17.5 12s1.5.67 1.5 1.5S18.33 15 17.5 15zM5 10h14V8H5v2z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Drive Away</h3>
              <p className="text-gray-600">Get your new car delivered or pick it up at your convenience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured CarSync Cars Section - MODIFIED FOR HORIZONTAL SCROLL */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-customBlue">Featured CarSync Cars</h2>
          {loadingCars ? (
            <div className="text-center text-lg">Loading amazing cars...</div>
          ) : errorCars ? (
            <div className="text-center text-red-600 text-lg">{errorCars}</div>
          ) : featuredCars.length === 0 ? (
            <div className="text-center text-lg text-gray-600">No featured cars available at the moment.</div>
          ) : (
            <div className="flex overflow-x-auto pb-4 space-x-6 custom-scrollbar"> {/* Changed to flex, added overflow-x-auto, space-x */}
              {featuredCars.map(car => (
                <div
                  key={car._id}
                  className="flex-none w-80 bg-gray-50 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer" // Added flex-none, fixed width
                  onClick={() => navigate(`/car-details/${car._id}`)}
                >
                  <img
                    src={car.imageUrl || `https://placehold.co/400x250/E0BBE4/FFFFFF?text=${(car.make || 'Car').replace(/\s/g, '+')}+${(car.model || '').replace(/\s/g, '+')}`}
                    alt={car.make ? `${car.make} ${car.model}` : 'Car Image'}
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x250/E0BBE4/FFFFFF?text=Image+Not+Found`; }}
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{car.make} {car.model}</h3> {/* Changed to make and model */}
                    <p className="text-2xl font-bold text-customGold mb-4">₹ {parseInt(car.price_in_inr || car.price).toLocaleString('en-IN')}</p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{car.year}</span>
                      <span>{parseInt(car.kms_driven || car.kmDriven).toLocaleString('en-IN')} Kms</span>
                      <span>{car.fuel_type || car.fuelType}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/car-details/${car._id}`); }}
                      className="mt-6 w-full bg-customBlue hover:bg-customGold text-white py-2 rounded-md font-medium transition-colors duration-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Custom Scrollbar Style (add this to your main CSS or index.css if not already present) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>


      {/* Explore Popular Brands */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12 text-customBlue">Explore Popular Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            {popularBrands.map(brand => (
              <div
                key={brand.name}
                className="bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
                onClick={() => handleExploreCategory('brand', brand.name)}
              >
                {typeof brand.logo === 'string' ? (
                  <span className="text-4xl font-bold text-customGold mb-3">{brand.logo}</span>
                ) : (
                  <img src={brand.logo} alt={brand.name} className="w-20 h-16 object-contain mb-3" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">{brand.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cars Across India (by City) */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12 text-customBlue">Cars Across India</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {cities.map(city => (
              <div
                key={city}
                className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
                onClick={() => handleExploreCategory('city', city)}
              >
                <svg className="w-12 h-12 text-customGold mb-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
                <h3 className="text-lg font-semibold text-gray-900">{city}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore More Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12 text-customBlue">Explore More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              className="bg-gray-50 p-8 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
            >
              <svg className="w-16 h-16 text-customGold mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99c-1.77 0-3.25-1.48-3.25-3.25S10.23 5.5 12 5.5s3.25 1.48 3.25 3.25-1.48 3.24-3.25 3.24z" /></svg>
              <h3 className="text-xl font-semibold mb-2">Car Price Prediction</h3>
              <p className="text-gray-600 text-sm">Get an estimated value for your car.</p>
            </div>
            <div
              className="bg-gray-50 p-8 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
            >
              <svg className="w-16 h-16 text-customGold mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              <h3 className="text-xl font-semibold mb-2">Loan Amount Calculator</h3>
              <p className="text-gray-600 text-sm">Calculate your EMI and loan eligibility.</p>
            </div>
            <div
              className="bg-gray-50 p-8 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
            >
              <svg className="w-16 h-16 text-customGold mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
              <h3 className="text-xl font-semibold mb-2">Car Insurance</h3>
              <p className="text-gray-600 text-sm">Hassle-free car insurance solutions.</p>
            </div>
            <div
              className="bg-gray-50 p-8 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition duration-300"

            >
              <svg className="w-16 h-16 text-customGold mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
              <h3 className="text-xl font-semibold mb-2">Pro Service</h3>
              <p className="text-gray-600 text-sm">Expert car maintenance and repairs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action for Selling */}
      <section className="py-16 bg-customBlue text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Ready to Sell Your Car?</h2>
          <p className="text-lg opacity-90 mb-8">
            Get a fair price and a hassle-free selling experience.
          </p>
          <button
            onClick={() => navigate('/sell')}
            className="bg-white hover:bg-gray-100 text-customBlue font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
          >
            Sell Your Car Now
          </button>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
