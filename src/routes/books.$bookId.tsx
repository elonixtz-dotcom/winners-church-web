import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { db, Book } from "@/lib/db"

export const Route = createFileRoute("/books/$bookId")({
  component: BookDetailPage,
})

function BookDetailPage() {
  const { bookId } = Route.useParams()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([])

  useEffect(() => {
    const loadBook = async () => {
      try {
        const foundBook = await db.getBookById(bookId)
        if (foundBook && foundBook.is_approved) {
          setBook(foundBook)
          // Load related books
          const allBooks = await db.getBooks()
          const related = allBooks.filter(
            b => b.id !== bookId && b.is_approved &&
              (b.author === foundBook.author ||
                (b.categories && foundBook.categories &&
                  b.categories.some(cat => foundBook.categories!.includes(cat))))
          ).slice(0, 4)
          setRelatedBooks(related)
        }
      } catch (error) {
        console.error("Failed to load book:", error)
      } finally {
        setLoading(false)
      }
    }
    loadBook()
  }, [bookId])

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="py-20 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-bold text-foreground mb-2">Book not found</h3>
        <Link to="/books" className="text-primary hover:underline">
          Back to all books
        </Link>
      </div>
    )
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Link to="/books" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
        ← Back to all books
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Book Cover */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {book.cover_image_url ? (
              <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-9xl">📖</span>
              </div>
            )}
            {book.purchase_link && (
              <a
                href={book.purchase_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/95 transition-colors"
              >
                🛒 Buy Now
              </a>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            {book.categories && book.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {book.categories.map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            )}
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">{book.title}</h1>
            {book.subtitle && <h2 className="text-xl md:text-2xl text-muted-foreground mb-4">{book.subtitle}</h2>}
            <p className="text-xl text-primary font-semibold">by {book.author}</p>
          </div>

          <div className="flex flex-wrap gap-6 mb-8 text-sm">
            {book.price && (
              <div>
                <span className="text-muted-foreground block mb-1">Price</span>
                <span className="text-3xl font-bold text-foreground">
                  {book.currency || "USD"} {book.price.toFixed(2)}
                </span>
              </div>
            )}
            {book.isbn && (
              <div>
                <span className="text-muted-foreground block mb-1">ISBN</span>
                <span className="font-semibold text-foreground">{book.isbn}</span>
              </div>
            )}
            {book.publication_date && (
              <div>
                <span className="text-muted-foreground block mb-1">Published</span>
                <span className="font-semibold text-foreground">{book.publication_date}</span>
              </div>
            )}
            {book.page_count && (
              <div>
                <span className="text-muted-foreground block mb-1">Pages</span>
                <span className="font-semibold text-foreground">{book.page_count}</span>
              </div>
            )}
          </div>

          <div className="prose prose-lg max-w-none mb-10">
            <h3 className="text-2xl font-bold text-foreground mb-4">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{book.description}</p>
          </div>

          {book.synopsis && (
            <div className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-foreground mb-4">Synopsis</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{book.synopsis}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="mt-20">
          <h3 className="font-heading text-2xl font-bold text-foreground mb-8">You may also like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedBooks.map((relatedBook) => (
              <Link key={relatedBook.id} to={`/books/$bookId`} params={{ bookId: relatedBook.id }} className="group">
                <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                  {relatedBook.cover_image_url ? (
                    <div className="aspect-[2/3] bg-muted/20 overflow-hidden">
                      <img
                        src={relatedBook.cover_image_url}
                        alt={relatedBook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-4xl">📖</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-heading text-base font-bold text-foreground mb-1 line-clamp-2">
                      {relatedBook.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{relatedBook.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
