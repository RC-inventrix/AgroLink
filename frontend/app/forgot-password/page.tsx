"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

import logo from "../../public/images/Group-6.png"
const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwordData, setPasswordData] = useState({ password: '', repeatPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Brand-consistent styling
  const inputStyles = "w-full bg-transparent border border-zinc-600 rounded-md py-3 px-4 text-white focus:outline-none focus:border-[#facc15] transition-colors placeholder:text-zinc-500";
  const labelStyles = "block text-sm font-medium text-white mb-2";
  const buttonStyles = "w-full bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-3 rounded-md transition-colors mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Replace this with your actual Gateway or Identity Service URL
  const BASE_URL = "http://localhost:8080/forgotPassword";

  // Step 1: Send OTP to Email
  // Step 1: Send OTP to Email
  const handleSendEmail = async (e: { preventDefault: () => void; }) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    const response = await fetch(`${BASE_URL}/verifyMail/${email}`, {
      method: 'POST'
    });

    if (!response.ok) {
      // 1. Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        // 2. Extract the specific detail field from your screenshot
        throw new Error(errorData.detail || "User not found");
      } else {
        // Fallback for plain text errors
        const textError = await response.text();
        throw new Error(textError || "Failed to send email");
      }
    }

    setStep(2);
  } catch (err) {
    // 3. This will now show only the clean string in your red box
    setError(err instanceof Error ? err.message : "An error occurred");
  } finally {
    setLoading(false);
  }
};

  // Step 2: Verify the 6-digit OTP
  const handleVerifyOtp = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/verifyOtp/${otp}/${email}`, {
        method: 'POST'
      });
      const data = await response.text();

      if (!response.ok) throw new Error(data || "Invalid or expired OTP");
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Change Password
  const handleChangePassword = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/changePassword/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordData.password,
          repeatPassword: passwordData.repeatPassword
        })
      });
      const data = await response.text();

      if (!response.ok) throw new Error(data || "Failed to reset password");
      
      alert("Password changed successfully! You can now login.");
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061c0e] flex font-sans selection:bg-[#facc15] selection:text-black">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 relative">
        {/* Brand Logo */}
        <Image src={logo} alt="Agrolink Logo" className='w-35' />

        <div className="max-w-md w-full mt-12">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}
            className="flex items-center text-zinc-400 hover:text-white mb-6 text-sm transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <h2 className="text-3xl font-bold text-white mb-2">
            {step === 1 && "Forgot password?"}
            {step === 2 && "OTP Verification"}
            {step === 3 && "Reset password"}
          </h2>
          <p className="text-[#facc15] text-sm mb-8 font-medium">
            {step === 1 && "Enter your email address to receive a 6-digit verification code."}
            {step === 2 && `We've sent a code to ${email}. Please enter it below.`}
            {step === 3 && "Please enter your new secure password."}
          </p>

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md mb-6 text-sm flex items-start gap-3 animate-in fade-in zoom-in duration-200">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={step === 1 ? handleSendEmail : step === 2 ? handleVerifyOtp : handleChangePassword}>
            {/* Step 1: Email Input */}
            {step === 1 && (
              <div className="space-y-2">
                <label className={labelStyles}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-zinc-500 h-5 w-5" />
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    className={`${inputStyles} pl-12`}
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            )}

            {/* Step 2: OTP Input */}
            {step === 2 && (
              <div className="space-y-4 text-center">
                <label className={labelStyles}>Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  maxLength={6} 
                  placeholder="XXXXXX" 
                  className={`${inputStyles} text-center tracking-[0.5em] font-mono text-2xl placeholder:tracking-normal`}
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))} 
                  required 
                />
                <p className="text-zinc-500 text-xs mt-4">
                  Code expires in 70 seconds. 
                  <button type="button" onClick={handleSendEmail} className="text-[#facc15] ml-1 hover:underline">Resend Code</button>
                </p>
              </div>
            )}

            {/* Step 3: Password Reset */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className={labelStyles}>New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-zinc-500 h-5 w-5" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className={`${inputStyles} pl-12`}
                      value={passwordData.password} 
                      onChange={(e) => setPasswordData({...passwordData, password: e.target.value})} 
                      required 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-zinc-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelStyles}>Repeat Password</label>
                  <div className="relative">
                     <CheckCircle2 className="absolute left-4 top-3.5 text-zinc-500 h-5 w-5" />
                     <input 
                       type="password" 
                       className={`${inputStyles} pl-12`}
                       value={passwordData.repeatPassword} 
                       onChange={(e) => setPasswordData({...passwordData, repeatPassword: e.target.value})} 
                       required 
                     />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className={buttonStyles}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Processing...
                </>
              ) : (
                <>
                  {step === 1 && "Send Reset Link"}
                  {step === 2 && "Verify OTP"}
                  {step === 3 && "Update Password"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1595009552535-be753447727e?q=80&w=2070&auto=format&fit=crop")',
            filter: 'brightness(0.4)' 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061c0e] to-transparent w-1/2" />
        <div className="absolute bottom-12 left-12 right-12">
           
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;