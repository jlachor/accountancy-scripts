import { Link } from 'react-router-dom'

interface Script {
  name: string
  path: string
  description: string
}

const scripts: Script[] = [
  { name: 'Przelicznik walut na PLN', path: '/currency-to-pln', description: 'Przelicz kwoty w USD i EUR na PLN według kursów wymiany' },
]

export function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Narzędzia księgowe</h1>
      <p className="text-muted-foreground mb-8">
        Zbiór prostych narzędzi do zadań księgowych.
      </p>

      {scripts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scripts.map((script) => (
            <Link
              key={script.path}
              to={script.path}
              className="block p-6 border rounded-lg hover:border-primary transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{script.name}</h2>
              <p className="text-muted-foreground">{script.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">
          Brak narzędzi. Dodaj pierwsze narzędzie, aby rozpocząć.
        </p>
      )}
    </div>
  )
}
