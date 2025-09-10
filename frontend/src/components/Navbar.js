import React, { useState, useContext , useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Adjust the path as needed
import { images } from "../images/images";

const Navbar = () => {
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLocalLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };
  useEffect(() => {
    console.log("Navbar: User from context:", user);
    console.log("Navbar: Is Logged In:", isLoggedIn);
  }, [user, isLoggedIn]);


  return (
    <nav className="bg-customBlue text-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <NavLink to="/" className="flex items-center ml-8 gap-2">
          <img src={images.logo} alt="Logo" className="h-12 w-30" />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10 font-medium text-md">
          <div className="relative group cursor-pointer">
            <div className="flex items-center">
              <NavLink to="/buy" className="block px-4 py-2 hover:text-customGold">View all cars</NavLink>
            </div>
          </div>

          <div className="relative group cursor-pointer">
            <div className="flex items-center">
              <NavLink to="/sell" className="block px-4 py-2 hover:text-customGold">Sell car online</NavLink>
            </div>
          </div>

          <div className="relative group cursor-pointer">
            <div className="flex items-center">
              <NavLink to="/price-prediction" className="block px-4 py-2 hover:text-customGold">Price Prediction</NavLink>
            </div>
          </div>

          
          
        </div>


        {/* Profile / Auth */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <NavLink to='/liked-cars'>
            <img src={images.heart} alt="Wishlist" className="w-5  h-5 cursor-pointer hover:opacity-75" />
          </NavLink>

          {!isLoggedIn ? (
            <>
              <NavLink to="/login" className="hover:text-customGold">Login</NavLink>
              <NavLink to="/signup" className="hover:text-customGold">Sign Up</NavLink>
            </>
          ) : (
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  // Use user.userProfilePic from backend response
                  src={user?.userProfilePic ? `http://localhost:5000${user.userProfilePic}` : "https://placehold.co/24x24/CCCCCC/000000?text=User"}
                  // Use user.username from backend response
                  alt={user?.username || "User"}
                  className="w-6 h-6 rounded-full object-cover"
                />
                {/* Use user.username from backend response */}
                <span>{"Profile"}</span> {/* Added "Profile" fallback for clarity */}
              </div>
              <div className="absolute top-full right-0 bg-white text-black shadow-md rounded-md py-2 w-32 z-20 hidden group-hover:block">
                <NavLink to="/dashboard" className="block px-4 py-2 hover:bg-customGold">Dashboard</NavLink>
                <div onClick={handleLocalLogout} className="px-4 py-2 hover:bg-customGold cursor-pointer">Logout</div>
              </div>
            </div>
          )}

          <button
            className="lg:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <img src={images.menu_icon} alt="Menu" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-6 py-4 space-y-4 bg-customBlue text-white font-medium text-sm">
          <div>
            <div className="font-semibold">Buy Car</div>
            <NavLink to="/buy" className="block ml-4 mt-1" onClick={() => setMobileMenuOpen(false)}>View all cars</NavLink>
          </div>

          <div>
            <div className="font-semibold">Sell Car</div>
            <NavLink to="/sell" className="block ml-4 mt-1" onClick={() => setMobileMenuOpen(false)}>Sell car online</NavLink>
          </div>

          <div>
            <div className="font-semibold">Price Prediction</div>
            <NavLink to="/price-prediction" className="block ml-4 mt-1" onClick={() => setMobileMenuOpen(false)}>Price Prediction</NavLink>
          </div>

          <div>
            <div className="font-semibold">Tools</div>
            <NavLink to="/loan" className="block ml-4 mt-1" onClick={() => setMobileMenuOpen(false)}>Loan Calculator</NavLink>
            <NavLink to="/insurance" className="block ml-4" onClick={() => setMobileMenuOpen(false)}>Insurance</NavLink>
          </div>

          <NavLink to="/rent" className="block" onClick={() => setMobileMenuOpen(false)}>Rentals</NavLink>

          {!isLoggedIn ? (
            <>
              <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className="block">Login</NavLink>
              <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)} className="block">Sign Up</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block">Dashboard</NavLink>
              <span onClick={handleLocalLogout} className="block cursor-pointer">Logout</span>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;