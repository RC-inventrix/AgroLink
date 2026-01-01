export default function Footer() {
    return (
        <footer className="bg-black text-white mt-16">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6 py-10 text-sm">
                <div>
                    <h3 className="font-bold mb-2">AgroLink</h3>
                    <p>There are many variations of passages of lorem ipsum available.</p>
                </div>

                <div>
                    <h3 className="font-bold mb-2">Explore</h3>
                    <p>About</p>
                    <p>Services</p>
                    <p>Projects</p>
                    <p>Meet the Farmers</p>
                </div>

                <div>
                    <h3 className="font-bold mb-2">News</h3>
                    <p>Bringing Food Production Back To Cities</p>
                    <p>The Future of Farming</p>
                </div>

                <div>
                    <h3 className="font-bold mb-2">Contact</h3>
                    <p>📞 666 888 0000</p>
                    <p>✉️ needhelp@company.com</p>
                    <p>📍 New York, USA</p>
                </div>
            </div>
        </footer>
    );
}
