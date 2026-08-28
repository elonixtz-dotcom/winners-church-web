import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { db, Book } from "@/lib/db"
import { BookOpen } from "lucide-react"

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
    <div className="py-24 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-primary mb-3">Resources</span>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground mb-4">Our Books</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Explore our collection of inspirational books and resources to help you grow in your faith journey.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-14">
        <div className="relative">
          <input
            type="text"
            placeholder="Search books, authors, or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <svg className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-7 h-7 text-primary mx-auto mb-5" />
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">No books found</h3>
          <p className="text-sm text-muted-foreground">
            {search ? "Try a different search term" : "Check back soon for new books"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <Link key={book.id} to={`/books/$bookId`} params={{ bookId: book.id }} className="group">
              <div className="rounded-xl border border-border/40 bg-card overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-[0_12px_28px_-18px_oklch(0.18_0.03_30_/_22%)]">
                {book.cover_image_url ? (
                  <div className="aspect-[2/3] bg-muted/20 overflow-hidden">
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-primary/5 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-primary/35" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-heading text-base font-semibold text-foreground mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  {book.subtitle && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{book.subtitle}</p>
                  )}
                  <p className="text-xs text-primary font-semibold mb-3">
                    by {book.author}
                  </p>
                  {book.price && (
                    <p className="text-base font-semibold text-foreground">
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
