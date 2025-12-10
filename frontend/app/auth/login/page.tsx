import LoginForm from "@/components/auth/login-form" // <-- Point to the file you actually have

export const metadata = {
    title: "Login - AgroLink",
    description: "Connect with farmers and buyers on AgroLink",
}

export default function LoginPage() {
    return (
        // We add the centering styles here directly since we skipped the wrapper component
        <div className="min-h-screen flex items-center justify-center bg-[#03230F] p-4">
            <LoginForm />
        </div>
    )
}