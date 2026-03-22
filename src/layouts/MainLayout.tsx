import { Link, Outlet } from 'react-router-dom'

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4">
          <Link to="/" className="text-xl font-semibold">
            Narzędzia księgowe
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        Narzędzia księgowe
      </footer>
    </div>
  )
}
