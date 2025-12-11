import LoginForm from "@/components/auth/login-form" // Fixed Import Path

export const metadata = {
    title: "Login - AgroLink",
    description: "Connect with farmers and buyers on AgroLink",
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#03230F] p-4">
            <LoginForm />
        </div>
    )
}