import React from "react";
import { useNavigate } from "react-router-dom";
import { images } from "../images/images"; // Your local image imports

const Footer = () => {
  const navigate = useNavigate();

  const handleCityClick = (city) => {
    navigate(`/buy?city=${encodeURIComponent(city)}`);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-customBlue text-white relative px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {/* Branding + Social */}
        <div>
          <div className="text-3xl font-bold mb-2 flex items-center gap-2">
            <img src={images.icon} alt="CarSync Logo" className="w-8 h-8" />
            CarSync
          </div>
          <p className="text-sm text-gray-300 mb-4">
            CarSync is your trusted platform for buying and selling second-hand cars.
            Explore verified cars with warranties and home test drives.
          </p>
          <p className="text-xs text-gray-400">(*Subject to terms and conditions.)</p>

          <div className="flex items-center gap-4 mt-4">
            <img src={images.facebook} alt="Facebook" className="w-8 h-7 cursor-pointer hover:opacity-80" />
            <img src={images.instagram} alt="Instagram" className="w-10 h-10 cursor-pointer hover:opacity-80" />
            <img src={images.twitter} alt="Twitter" className="w-5 h-5 cursor-pointer hover:opacity-80" />
          </div>
        </div>

        {/* About Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">ABOUT</h4>
          <ul className="space-y-1 text-gray-300 text-sm">
            <li>About CarSync</li>
            <li>How It Works</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>

        {/* Cities Section */}
        <div>
          <h4 className="text-white font-semibold mb-3">BUY USED CAR IN</h4>
          <div className="flex flex-wrap text-sm gap-2 text-gray-300">
            {["Delhi", "Mumbai", "Pune", "Bangalore", "Hyderabad", "Chennai", "Noida", "Ahmedabad", "Kolkata", "Jaipur"].map(
              (city) => (
                <button
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className="hover:underline hover:text-white"
                >
                  {city}
                </button>
              )
            )}
          </div>

          <h4 className="text-white font-semibold mt-4 mb-2">CAR REPAIR IN</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            Delhi | Hyderabad | Mumbai | Jaipur | Ghaziabad | Gurgaon
          </p>
        </div>

        {/* Call & Actions */}
        <div className="space-y-4">
          <div className="bg-[#ef3e6e] text-white px-4 py-3 rounded-lg flex items-center gap-3 font-semibold cursor-pointer">
            <img src={images.phone} alt="Phone" className="w-4 h-4" />
            727-727-7275
          </div>
          <button className="w-full border border-white py-2 rounded-lg hover:bg-white hover:text-customBlue">
            Get Instant Quotes
          </button>
          <button className="w-full border border-white py-2 rounded-lg hover:bg-white hover:text-customBlue">
            Browse Cars
          </button>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-xs text-gray-400 mt-10">
        © 2025 CarSync Technologies. All rights reserved.
      </div>

      {/* Scroll-to-Top */}
      <button
        onClick={scrollToTop}
        className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white text-customBlue shadow-lg flex items-center justify-center hover:bg-gray-200"
      >
        <img src={images.upArrow} alt="Scroll to Top" className="w-4 h-4" />
      </button>
    </footer>
  );
};

export default Footer;
