import logo from "../../public/images/Group-6.png"

export default function Example() {
    return (
        <footer className="w-full bg-gradient-to-b from-[#03230F] to-[#124326] text-white">
            <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
                <div className="flex items-center space-x-3 mb-6">
                    <img src={logo.src} alt="Logo" />
                        
                </div>
                <p className="text-center max-w-xl text-sm font-normal leading-relaxed">
                    Empowering farmers and buyers through seamless connections and trusted transactions. Join AgroLink today to revolutionize your agricultural experience!

                </p>
            </div>
            <div className="border-t border-[#03230F]">
                <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm font-normal">
                    <a href="https://prebuiltui.com">AgroLink</a> ©2025. All rights reserved.
                </div>
            </div>
        </footer>
    );
};