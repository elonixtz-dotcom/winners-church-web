import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { db, Book } from "@/lib/db"
import { BookOpen, ShoppingCart } from "lucide-react"

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
        <BookOpen className="w-7 h-7 text-primary mx-auto mb-5" />
        <h3 className="font-heading text-lg font-semibold text-foreground mb-2">Book not found</h3>
        <Link to="/books" className="text-sm text-primary hover:underline">
          Back to all books
        </Link>
      </div>
    )
  }

  return (
    <div className="py-24 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Link to="/books" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to all books
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Book Cover */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {book.cover_image_url ? (
              <div className="aspect-[2/3] rounded-xl overflow-hidden border border-border/40">
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[2/3] bg-primary/5 rounded-xl border border-border/40 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-primary/35" />
              </div>
            )}
            {book.purchase_link && (
              <a
                href={book.purchase_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/95 active:translate-y-0 active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Now
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
            <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2">{book.title}</h1>
            {book.subtitle && <h2 className="text-lg md:text-xl text-muted-foreground mb-4">{book.subtitle}</h2>}
            <p className="text-base text-primary font-semibold">by {book.author}</p>
          </div>

          <div className="flex flex-wrap gap-8 mb-10 pb-8 border-b border-border/40 text-sm">
            {book.price && (
              <div>
                <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground block mb-1.5">Price</span>
                <span className="text-2xl font-semibold text-foreground">
                  {book.currency || "USD"} {book.price.toFixed(2)}
                </span>
              </div>
            )}
            {book.isbn && (
              <div>
                <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground block mb-1.5">ISBN</span>
                <span className="font-semibold text-foreground">{book.isbn}</span>
              </div>
            )}
            {book.publication_date && (
              <div>
                <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground block mb-1.5">Published</span>
                <span className="font-semibold text-foreground">{book.publication_date}</span>
              </div>
            )}
            {book.page_count && (
              <div>
                <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground block mb-1.5">Pages</span>
                <span className="font-semibold text-foreground">{book.page_count}</span>
              </div>
            )}
          </div>

          <div className="prose prose-sm max-w-none mb-10">
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{book.description}</p>
          </div>

          {book.synopsis && (
            <div className="prose prose-sm max-w-none">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Synopsis</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{book.synopsis}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="mt-24 pt-16 border-t border-border/40">
          <h3 className="font-heading text-2xl font-semibold text-foreground mb-8">You may also like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedBooks.map((relatedBook) => (
              <Link key={relatedBook.id} to={`/books/$bookId`} params={{ bookId: relatedBook.id }} className="group">
                <div className="rounded-xl border border-border/40 bg-card overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-[0_12px_28px_-18px_oklch(0.18_0.03_30_/_22%)]">
                  {relatedBook.cover_image_url ? (
                    <div className="aspect-[2/3] bg-muted/20 overflow-hidden">
                      <img
                        src={relatedBook.cover_image_url}
                        alt={relatedBook.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[2/3] bg-primary/5 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-primary/35" />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-heading text-sm font-semibold text-foreground mb-1 line-clamp-2">
                      {relatedBook.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{relatedBook.author}</p>
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
