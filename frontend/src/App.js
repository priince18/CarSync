// App.js
import React from "react"; // Removed useContext as it's no longer directly used here for AuthContext
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Buy from "./pages/Buy";
import TestDrive from "./pages/TestDrive";
import TestDriveConfirmation from "./pages/TestDriveConfirmation";
import BuyCar from "./pages/BuyCar";
import Sell from "./pages/Sell";
import PricePredictionPage from "./pages/PricePredictionPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import LikedCarsPage from "./pages/LikedCarsPage";
import CriminalRecordResult from "./pages/CriminalRecordResult";
import EditCarPage from "./pages/EditCarPage"; 
import FinalDetails from "./pages/FinalDetails";


import ProtectedRoute from "./context/ProtectedRoute";
import { AuthProvider } from './context/AuthContext'; // Keep AuthProvider

const App = () => {
  return (
    <AuthProvider> {/* AuthProvider MUST wrap components that use AuthContext */}
      <Router>
        <Navbar />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/liked-cars" element={
              <ProtectedRoute>
                <LikedCarsPage />
              </ProtectedRoute>
            } />
            <Route path="/test-drive" element={
              <ProtectedRoute>
                <TestDrive />
              </ProtectedRoute>
            } />
            <Route path="/test-drive-confirmation" element={
              <ProtectedRoute>
                <TestDriveConfirmation />
              </ProtectedRoute>
            } />
            <Route path="/buy-car" element={
              <ProtectedRoute>
                <BuyCar />
              </ProtectedRoute>
            } />
            <Route path="/buy" element={<Buy />} />
            <Route path="/car-details/:carId" element={<CarDetailsPage />} />
            <Route path="/sell" element={  <ProtectedRoute>
                <Sell />
              </ProtectedRoute>} />
            <Route path="/sell/criminal-result" element={<CriminalRecordResult />} />
            <Route path="/sell/final-details" element={<FinalDetails />} />
            <Route path="/price-prediction" element={<PricePredictionPage />} />
            <Route path="/edit-car/:carId" element={
              <ProtectedRoute>
                <EditCarPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<div className="p-6 text-center">Page Not Found</div>} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;