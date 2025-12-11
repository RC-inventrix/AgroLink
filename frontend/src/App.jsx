import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Leaf } from 'lucide-react'; // Ensure you installed lucide-react

// --- 1. HOME PAGE COMPONENT ---
function HomePage() {
    return (
        <div className="min-h-screen bg-white text-[#03230F]">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-[#03230F] h-16 flex items-center px-8 justify-between">
                <div className="text-white font-bold text-xl flex items-center gap-2">
                    <Leaf className="text-[#EEC044]" /> AgroLink
                </div>
                <div className="flex gap-4">
                    <Link to="/login">
                        <button className="px-4 py-2 border border-[#EEC044] text-white rounded-full">Login</button>
                    </Link>
                    <Link to="/register">
                        <button className="px-4 py-2 bg-[#EEC044] text-[#03230F] rounded-full font-bold">Register</button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="pt-24 px-8 text-center">
                <h1 className="text-5xl font-bold mb-6">Welcome to AgroLink</h1>
                <p className="text-xl mb-8">Connecting Farmers and Buyers</p>
                <Link to="/register">
                    <button className="px-8 py-3 bg-[#EEC044] text-lg font-bold rounded-lg">Get Started</button>
                </Link>
            </div>
        </div>
    );
}

// --- 2. REGISTRATION (STEP 1) COMPONENT ---
function RegisterStep1() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullname: "", email: "", phone: "", password: "", role: "Farmer"
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Save to Session Storage
        sessionStorage.setItem("registerDataStep1", JSON.stringify(formData));

        if(formData.role === "Farmer") navigate("/register/farmer");
        else navigate("/register/buyer");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#03230F]">
            <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-xl w-96 space-y-4">
                <h2 className="text-3xl text-white font-bold mb-4">Sign Up</h2>
                <input className="w-full p-3 rounded" placeholder="Full Name" onChange={e => setFormData({...formData, fullname: e.target.value})} required />
                <input className="w-full p-3 rounded" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input className="w-full p-3 rounded" placeholder="Password" type="password" onChange={e => setFormData({...formData, password: e.target.value})} required />
                <input className="w-full p-3 rounded" placeholder="Phone" onChange={e => setFormData({...formData, phone: e.target.value})} required />

                <div className="flex gap-4 text-white">
                    <label><input type="radio" name="role" checked={formData.role === "Farmer"} onChange={() => setFormData({...formData, role: "Farmer"})} /> Farmer</label>
                    <label><input type="radio" name="role" checked={formData.role === "Buyer"} onChange={() => setFormData({...formData, role: "Buyer"})} /> Buyer</label>
                </div>

                <button className="w-full py-3 bg-[#EEC044] font-bold rounded">Next</button>
            </form>
        </div>
    );
}

// --- 3. FARMER REGISTRATION (STEP 2) COMPONENT ---
function RegisterFarmer() {
    const navigate = useNavigate();
    const [data, setData] = useState({ businessName: "", district: "", nic: "", address: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const step1 = JSON.parse(sessionStorage.getItem("registerDataStep1") || "{}");

        const finalPayload = {
            ...step1,
            businessName: data.businessName,
            district: data.district,
            businessRegOrNic: data.nic,
            streetAddress: data.address
        };

        // CALL BACKEND
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload)
        });

        if(res.ok) {
            alert("Success!");
            navigate("/");
        } else {
            alert("Error registering");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#03230F]">
            <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-xl w-96 space-y-4">
                <h2 className="text-2xl text-white font-bold">Farmer Details</h2>
                <input className="w-full p-3 rounded" placeholder="Business Name" onChange={e => setData({...data, businessName: e.target.value})} required />
                <input className="w-full p-3 rounded" placeholder="Address" onChange={e => setData({...data, address: e.target.value})} required />
                <input className="w-full p-3 rounded" placeholder="District" onChange={e => setData({...data, district: e.target.value})} required />
                <input className="w-full p-3 rounded" placeholder="NIC / Reg No" onChange={e => setData({...data, nic: e.target.value})} required />
                <button className="w-full py-3 bg-[#EEC044] font-bold rounded">Complete Registration</button>
            </form>
        </div>
    );
}

// --- MAIN APP COMPONENT ---
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterStep1 />} />
                <Route path="/register/farmer" element={<RegisterFarmer />} />
                <Route path="/login" element={<div className="text-center mt-20">Login Page Coming Soon</div>} />
            </Routes>
        </Router>
    );
}

export default App;