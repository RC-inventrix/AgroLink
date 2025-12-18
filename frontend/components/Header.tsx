export default function Header() {
    return (
        <header className="bg-black text-white">
            <div className="container mx-auto flex justify-between items-center px-6 py-4">
                <h1 className="text-xl font-bold">AgroLink</h1>
                <nav className="space-x-6 text-sm">
                    <a href="/">Home</a>
                    <a href="#">About</a>
                    <a href="#">Services</a>
                    <a href="#">Projects</a>
                    <a href="#">News</a>
                    <a href="#">Shop</a>
                    <a href="#">Contact</a>
                </nav>
            </div>
        </header>
    );
}
