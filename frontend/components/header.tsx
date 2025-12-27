export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-6 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-3xl font-bold">AgroLink.</h1>
        <nav className="flex items-center gap-8">
          <a href="#" className="hover:opacity-80 transition-opacity">
            Vegetables
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity">
            Checkout
          </a>
        </nav>
      </div>
    </header>
  )
}
