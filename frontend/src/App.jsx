import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import FindMedicines from './pages/FindMedicines';
import SubmitMedicine from './pages/SubmitMedicine';
import MedicineDetails from './pages/MedicineDetails';
import TrackActivity from './pages/TrackActivity';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminCommandCenter from './pages/AdminCommandCenter';
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';
import { useAuth } from './context/AuthContext';

function AdminRoute({ defaultTab }) {
  const { isPharmacist, isAdmin } = useAuth();
  if (isPharmacist && !isAdmin) {
    return <Navigate to="/pharmacist" replace />;
  }
  return <AdminCommandCenter defaultTab={defaultTab} />;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <main className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/find-medicines" element={<FindMedicines />} />
                <Route path="/browse" element={<FindMedicines />} />
                <Route path="/donate-medicine" element={<SubmitMedicine />} />
                <Route path="/submit" element={<SubmitMedicine />} />
                <Route path="/medicines/:id" element={<MedicineDetails />} />
                <Route path="/track-activity" element={<TrackActivity />} />
                <Route path="/my-donations" element={<TrackActivity defaultTab="donations" pageTitle="My Medicine Donations" />} />
                <Route path="/my-requests" element={<TrackActivity defaultTab="requests" pageTitle="My Medicine Requests" />} />
                <Route path="/activity" element={<TrackActivity />} />
                <Route path="/dashboard" element={<TrackActivity />} />
                <Route path="/profile" element={<UserProfile />} />

                {/* MediCycle Admin Command Center Routes */}
                <Route path="/admin" element={<AdminRoute defaultTab="overview" />} />
                <Route path="/admin/overview" element={<AdminRoute defaultTab="overview" />} />
                <Route path="/admin/people" element={<AdminRoute defaultTab="people" />} />
                <Route path="/admin/medicines" element={<AdminRoute defaultTab="medicines" />} />
                <Route path="/admin/requests" element={<AdminRoute defaultTab="requests" />} />
                <Route path="/admin/activity" element={<AdminRoute defaultTab="activity" />} />
                <Route path="/admin/alerts" element={<AdminRoute defaultTab="alerts" />} />

                {/* Clinical Pharmacist Portal Routes */}
                <Route path="/pharmacist" element={<LandingPage />} />
                <Route path="/pharmacist/verification" element={<AdminDashboard defaultTab="verification" />} />
                <Route path="/pharmacist/requests" element={<AdminDashboard defaultTab="requests" />} />
                <Route path="/pharmacist/inventory" element={<AdminDashboard defaultTab="all-medicines" />} />
                <Route path="/pharmacist/expiry-alerts" element={<AdminDashboard defaultTab="expiry-alerts" />} />
                <Route path="/pharmacist/activity" element={<AdminDashboard defaultTab="impact" />} />
                <Route path="/pharmacist-dashboard" element={<AdminDashboard defaultTab="verification" />} />
                <Route path="/expiry-alerts" element={<AdminDashboard defaultTab="expiry-alerts" />} />

                <Route path="/login" element={<Login />} />
                <Route path="/signin" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
