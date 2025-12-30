"use client"

export function Header() {
  return (
    <header className="bg-[#1a5f3f] text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-[#1a5f3f] font-bold text-lg">🌱</span>
          </div>
          <h1 className="text-2xl font-bold">AgroLink</h1>
        </div>
        <nav className="flex items-center gap-6">
          <a href="#" className="hover:opacity-80 transition-opacity">
            Dashboard
          </a>
        </nav>
      </div>
    </header>
  )
}
