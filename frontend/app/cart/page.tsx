import React from 'react';
import { Button } from "@/components/ui/button"; // ඔබේ UI components භාවිතා කිරීම
import { Card } from "@/components/ui/card";

export default function CartPage() {
    const cartItems = [
        { id: 1, name: 'Fresh Carrots', price: 250, qty: '2kg' },
        { id: 2, name: 'Organic Leeks', price: 180, qty: '1kg' },
    ];

    const subtotal = 680.00;
    const deliveryFee = 150.00; // Dynamic delivery fee [cite: 89]
    const total = subtotal + deliveryFee;

    return (
        <div className="min-h-screen bg-[#04000B] text-white p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-[#FFFFFF]">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <Card key={item.id} className="bg-[#03230F] border-gray-800 p-4 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-700 rounded-md"></div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                                        <p className="text-gray-400">Quantity: {item.qty}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#EEC044] font-bold text-lg text-[#EEC044]">Rs. {item.price}.00</p>
                                    <button className="text-red-500 text-sm hover:underline">Remove</button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Order Summary Section [cite: 76, 139] */}
                    <Card className="bg-[#03230F] p-6 border-[#EEC044]/20 h-fit">
                        <h2 className="text-2xl font-semibold mb-6 text-white">Order Summary</h2>
                        <div className="space-y-4 text-gray-300">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>Rs. {subtotal}.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>Rs. {deliveryFee}.00</span>
                            </div>
                            <div className="border-t border-gray-700 pt-4 flex justify-between text-xl font-bold text-white">
                                <span>Total</span>
                                <span className="text-[#EEC044]">Rs. {total}.00</span>
                            </div>
                        </div>
                        {/* Custom Button Color [cite: 88] */}
                        <Button className="w-full bg-[#EEC044] text-[#04000B] hover:bg-[#d4ac3d] font-bold mt-8">
                            PROCEED TO CHECKOUT
                        </Button>
                    </Card>
                </div>
            </div>

        </div>
    );
}