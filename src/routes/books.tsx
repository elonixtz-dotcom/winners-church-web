import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { db, Book } from "@/lib/db"

export const Route = createFileRoute("/books")({
  component: BooksPage,
})

function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const allBooks = await db.getBooks()
        setBooks(allBooks.filter(b => b.is_approved))
      } catch (error) {
        console.error("Failed to load books:", error)
      } finally {
        setLoading(false)
      }
    }
    loadBooks()
  }, [])

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author.toLowerCase().includes(search.toLowerCase()) ||
    (book.categories && book.categories.some(cat => cat.toLowerCase().includes(search.toLowerCase())))
  )

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Our Books</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our collection of inspirational books and resources to help you grow in your faith journey.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search books, authors, or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3 rounded-full border border-border/40 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            🔍
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-foreground mb-2">No books found</h3>
          <p className="text-muted-foreground">
            {search ? "Try a different search term" : "Check back soon for new books"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredBooks.map((book) => (
            <Link key={book.id} to={`/books/$bookId`} params={{ bookId: book.id }} className="group">
              <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                {book.cover_image_url ? (
                  <div className="aspect-[2/3] bg-muted/20 overflow-hidden">
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-6xl">📖</span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  {book.subtitle && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{book.subtitle}</p>
                  )}
                  <p className="text-sm text-primary font-semibold mb-3">
                    by {book.author}
                  </p>
                  {book.price && (
                    <p className="text-lg font-bold text-foreground">
                      {book.currency || "USD"} {book.price.toFixed(2)}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {book.categories?.slice(0, 2).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-semibold rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
