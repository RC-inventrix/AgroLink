import { Clock, MapPin, User, Calendar, AlertCircle } from "lucide-react"

interface PendingOrder {
  id: string
  vegetableName: string
  quantity: number
  pricePerKg: number
  totalPrice: number
  buyerName: string
  orderedDate: string
  daysRemaining: number
  deliveryAddress: string
  status: "urgent" | "normal"
}

// Mock data for pending orders
const pendingOrders: PendingOrder[] = [
  {
    id: "1",
    vegetableName: "Fresh Tomatoes",
    quantity: 2.5,
    pricePerKg: 120,
    totalPrice: 300,
    buyerName: "Rajesh Kumar",
    orderedDate: "2024-12-20",
    daysRemaining: 2,
    deliveryAddress: "Bandra, Mumbai",
    status: "urgent",
  },
  {
    id: "2",
    vegetableName: "Organic Carrots",
    quantity: 1.5,
    pricePerKg: 80,
    totalPrice: 120,
    buyerName: "Priya Singh",
    orderedDate: "2024-12-21",
    daysRemaining: 4,
    deliveryAddress: "Andheri, Mumbai",
    status: "normal",
  },
  {
    id: "3",
    vegetableName: "Green Spinach",
    quantity: 1,
    pricePerKg: 60,
    totalPrice: 60,
    buyerName: "Amit Patel",
    orderedDate: "2024-12-19",
    daysRemaining: 1,
    deliveryAddress: "Dadar, Mumbai",
    status: "urgent",
  },
  {
    id: "4",
    vegetableName: "Red Onions",
    quantity: 3,
    pricePerKg: 50,
    totalPrice: 150,
    buyerName: "Neha Sharma",
    orderedDate: "2024-12-22",
    daysRemaining: 5,
    deliveryAddress: "Powai, Mumbai",
    status: "normal",
  },
  {
    id: "5",
    vegetableName: "Bell Peppers",
    quantity: 2,
    pricePerKg: 90,
    totalPrice: 180,
    buyerName: "Vikram Desai",
    orderedDate: "2024-12-18",
    daysRemaining: 3,
    deliveryAddress: "Worli, Mumbai",
    status: "normal",
  },
]

export default function PendingOrdersPage() {
  const urgentCount = pendingOrders.filter((order) => order.status === "urgent").length
  const totalPending = pendingOrders.length

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1B4D2C] to-[#2D6A3E] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">To Be Completed Orders</h1>
          <p className="text-green-100 mt-2">Manage pending vegetable deliveries</p>
        </div>
      </header>

      {/* Stats Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-slate-600 text-sm font-medium">Total Pending</p>
              <p className="text-3xl font-bold text-[#1B4D2C] mt-2">{totalPending}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <p className="text-slate-600 text-sm font-medium">Urgent (≤2 days)</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{urgentCount}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-slate-600 text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                Rs. {pendingOrders.reduce((sum, order) => sum + order.totalPrice, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-lg border-2 shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
                order.status === "urgent" ? "border-red-300 bg-gradient-to-br from-white to-red-50" : "border-slate-200"
              }`}
            >
              {/* Status Badge */}
              {order.status === "urgent" && (
                <div className="bg-red-500 text-white px-4 py-2 flex items-center gap-2 text-sm font-semibold">
                  <AlertCircle size={16} />
                  Urgent - Complete by{" "}
                  {new Date(
                    new Date(order.orderedDate).getTime() + order.daysRemaining * 24 * 60 * 60 * 1000,
                  ).toLocaleDateString("en-IN")}
                </div>
              )}

              <div className="p-6">
                {/* Vegetable Name */}
                <h2 className="text-2xl font-bold text-[#1B4D2C] mb-4">{order.vegetableName}</h2>

                {/* Buyer Information */}
                <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <User size={20} className="text-[#1B4D2C]" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Buyer</p>
                      <p className="font-semibold text-slate-800">{order.buyerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-[#1B4D2C] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Delivery Location</p>
                      <p className="text-slate-700">{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-slate-600 font-medium mb-1">Quantity</p>
                    <p className="text-xl font-bold text-[#1B4D2C]">{order.quantity} kg</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-slate-600 font-medium mb-1">Price per kg</p>
                    <p className="text-xl font-bold text-[#1B4D2C]">Rs. {order.pricePerKg}</p>
                  </div>
                </div>

                {/* Total Price */}
                <div className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg mb-4 border border-green-300">
                  <p className="text-sm text-slate-600 mb-1">Total Price</p>
                  <p className="text-3xl font-bold text-[#1B4D2C]">Rs. {order.totalPrice}</p>
                </div>

                {/* Timeline Information */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-slate-500" />
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Ordered Date</p>
                    </div>
                    <p className="font-semibold text-slate-800">
                      {new Date(order.orderedDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-slate-500" />
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Days Remaining</p>
                    </div>
                    <p
                      className={`font-semibold text-lg ${
                        order.daysRemaining <= 2 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {order.daysRemaining} day{order.daysRemaining !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-600 font-medium">Time Until Deadline</p>
                    <p className="text-xs font-semibold text-slate-700">
                      {Math.round((order.daysRemaining / 7) * 100)}%
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        order.daysRemaining <= 2
                          ? "bg-red-500"
                          : order.daysRemaining <= 4
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min((order.daysRemaining / 7) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 bg-[#1B4D2C] hover:bg-[#153D23] text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Mark as Completed
                  </button>
                  <button className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg transition-colors">
                    Contact Buyer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
