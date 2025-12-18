"use client"
import LoginForm from "./login-form"

export default function LoginPage() {
    return (
        <div className="min-h-screen max-h-screen overflow-hidden flex bg-background">
            {/* Left side - Login Form with dark green background */}
            <div
                className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8"
                style={{ backgroundColor: "#03230F" }}
            >
                <LoginForm />
            </div>

            {/* Right side - Background Image (hidden on mobile/tablet) */}
            <div
                // Added "relative" here to contain the absolute overlay inside this div
                className="hidden lg:flex lg:w-1/2 items-center justify-center bg-cover bg-center bg-no-repeat relative"
                style={{
                    backgroundImage: "url(/images/farming-background.png)",
                }}
            >
                {/* Dark overlay for better form contrast on left */}
                <div className="absolute inset-0 bg-black/20"></div>
            </div>
        </div>
    )
}