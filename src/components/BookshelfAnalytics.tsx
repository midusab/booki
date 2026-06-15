/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Book, BookStatus } from "../types";
import { 
  Plus, 
  Trash2, 
  Eye, 
  Layers, 
  BarChart2, 
  CheckCircle,
  HelpCircle,
  BookOpen
} from "lucide-react";

interface BookshelfAnalyticsProps {
  books: Book[];
  onAddBook: (book: Omit<Book, "id" | "dateAdded">) => void;
  onUpdateProgress: (id: string, currentPage: number, status?: BookStatus) => void;
  onRemoveBook: (id: string) => void;
}

export const BookshelfAnalytics: React.FC<BookshelfAnalyticsProps> = ({
  books,
  onAddBook,
  onUpdateProgress,
  onRemoveBook,
}) => {
  // Tabs
  const [activeTab, setActiveTab] = useState<BookStatus | "All" | "Analytics">("In Progress");
  const [chartMode, setChartMode] = useState<"progress" | "genres">("progress");

  // Add Book Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("Fiction");
  const [status, setStatus] = useState<BookStatus>("In Progress");
  const [totalPages, setTotalPages] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  // Canvas details
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  // Re-build Chart.js instance on data updates
  useEffect(() => {
    if (activeTab === "Analytics" && chartCanvasRef.current) {
      const ctx = chartCanvasRef.current.getContext("2d");
      if (!ctx || !(window as any).Chart) return;

      // Clean up previous Chart instance
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ChartConstructor = (window as any).Chart;

      if (chartMode === "progress") {
        // Bar Chart showing Pages Progress
        const labels = books.map((b) => b.title.length > 20 ? b.title.substring(0, 17) + "..." : b.title);
        const currentPagesData = books.map((b) => b.currentPage);
        const totalPagesData = books.map((b) => b.totalPages);

        chartInstanceRef.current = new ChartConstructor(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Pages Read",
                data: currentPagesData,
                backgroundColor: "#5A7065", // Sage Green
                borderRadius: 5,
                borderWidth: 0,
              },
              {
                label: "Total Pages",
                data: totalPagesData,
                backgroundColor: "#F5EFEB", // Cream Sand
                borderRadius: 5,
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "#E8EDE9",
                },
                ticks: {
                  font: {
                    family: "Plus Jakarta Sans",
                    size: 10,
                  },
                  color: "#2C1D11",
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: {
                    family: "Plus Jakarta Sans",
                    size: 10,
                  },
                  color: "#2C1D11",
                },
              },
            },
            plugins: {
              legend: {
                labels: {
                  font: {
                    family: "Plus Jakarta Sans",
                    size: 11,
                  },
                  color: "#2C1D11",
                },
              },
            },
          },
        });
      } else {
        // Doughnut Chart showing Genre Categories
        const genresCount: Record<string, number> = {};
        books.forEach((b) => {
          genresCount[b.genreCategory || "Fiction"] = (genresCount[b.genreCategory || "Fiction"] || 0) + 1;
        });

        const labels = Object.keys(genresCount);
        const data = Object.values(genresCount);

        chartInstanceRef.current = new ChartConstructor(ctx, {
          type: "doughnut",
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: ["#5A7065", "#C5A03A", "#2C1D11", "#A3B5A9", "#E8EDE9"],
                borderWidth: 1,
                borderColor: "#FDFBF7",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  font: {
                    family: "Plus Jakarta Sans",
                    size: 11,
                  },
                  color: "#2C1D11",
                },
              },
            },
          },
        });
      }
    }

    // Unmount safe clean up
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [books, activeTab, chartMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !totalPages) return;

    // Provide generic high quality image if none is supplied
    const fallbackImages: Record<string, string> = {
      "Fiction": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
      "Sci-Fi": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
      "Mystery": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
      "Biography": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600",
      "Poetry": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600"
    };

    onAddBook({
      title,
      author,
      genre: genre,
      genreCategory: genre,
      coverImage: coverUrl.trim() || fallbackImages[genre] || fallbackImages["Fiction"],
      status,
      currentPage: parseInt(currentPage, 10) || 0,
      totalPages: parseInt(totalPages, 10),
    });

    // Reset Form
    setTitle("");
    setAuthor("");
    setGenre("Fiction");
    setStatus("In Progress");
    setTotalPages("");
    setCurrentPage("");
    setCoverUrl("");
    setShowAddForm(false);
  };

  const handlePageScroll = (id: string, current: number, delta: number, total: number) => {
    const nextVal = Math.max(0, Math.min(total, current + delta));
    const nextStatus: BookStatus | undefined = nextVal === total ? "Completed" : undefined;
    onUpdateProgress(id, nextVal, nextStatus);
  };

  // Filter books list
  const filteredBooks = books.filter((b) => {
    if (activeTab === "All") return true;
    if (activeTab === "Analytics") return false;
    return b.status === activeTab;
  });

  return (
    <div id="saga-bookshelf-analytics" className="space-y-6 animate-fade-in">
      
      {/* Sub navigation bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-2xl border border-[#E8EDE9] shadow-xxs">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {["In Progress", "Want to Read", "Completed", "All", "Analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              type="button"
              className={`px-4 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#2C1D11] text-[#FDFBF7] font-medium shadow-xs"
                  : "text-[#5A7065] hover:bg-[#F5EFEB]"
              }`}
            >
              {tab === "Analytics" ? "🌿 Analytics" : tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-4 py-2.5 bg-[#5A7065] hover:bg-[#4A5D4E] text-[#FDFBF7] rounded-xl text-xs font-semibold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs w-full sm:w-auto justify-center"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>add book</span>
        </button>
      </div>

      {/* Add Book Sliding/Collapsible Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6.5 rounded-3xl border border-[#E8EDE9] shadow-md space-y-4 animate-slide-up">
          <h3 className="text-lg font-serif font-bold text-[#2C1D11] border-b border-[#E8EDE9] pb-2 lowercase">add new book</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1 col-span-1">
              <label htmlFor="title-field" className="block text-xxs font-semibold text-[#5A7065] lowercase">book title</label>
              <input
                id="title-field"
                type="text"
                placeholder="e.g. Klara and the Sun"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label htmlFor="author-field" className="block text-xxs font-semibold text-[#5A7065] lowercase">author</label>
              <input
                id="author-field"
                type="text"
                placeholder="e.g. Kazuo Ishiguro"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label htmlFor="genre-field" className="block text-xxs font-semibold text-[#5A7065] lowercase">genre category</label>
              <select
                id="genre-field"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              >
                <option value="Fiction">Fiction (Literary)</option>
                <option value="Sci-Fi">Sci-Fi (Science Fiction)</option>
                <option value="Mystery">Mystery & Thriller</option>
                <option value="Biography">Biography & Memoir</option>
                <option value="Poetry">Poetry & Anthologies</option>
              </select>
            </div>

            <div className="space-y-1 col-span-1">
              <label htmlFor="status-field" className="block text-xxs font-semibold text-[#5A7065] lowercase">reading status</label>
              <select
                id="status-field"
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              >
                <option value="In Progress">In Progress</option>
                <option value="Want to Read">Want to Read</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="space-y-1 col-span-1">
              <label htmlFor="total-pages-field" className="block text-xxs font-semibold text-[#5A7065] lowercase">total pages</label>
              <input
                id="total-pages-field"
                type="number"
                placeholder="e.g. 350"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                required
                min="1"
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label htmlFor="cur-pages-field" className="block text-xxs font-semibold text-[#5A7065] lowercase">current page</label>
              <input
                id="cur-pages-field"
                type="number"
                placeholder="e.g. 0"
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)}
                min="0"
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              />
            </div>

            <div className="space-y-1 md:col-span-2 lg:col-span-3">
              <label htmlFor="cover-url-field" className="block text-xxs font-semibold text-[#5A7065] lowercase">cover image url (optional)</label>
              <input
                id="cover-url-field"
                type="url"
                placeholder="https://..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#E8EDE9] rounded-xl px-3.5 py-2.5 text-xs text-[#2C1D11] focus:outline-none focus:border-[#5A7065]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => setShowAddForm(false)}
              type="button"
              className="px-4 py-2 border border-[#E8EDE9] hover:bg-[#FDFBF7] text-xs text-[#5A7065] rounded-xl transition-colors cursor-pointer lowercase"
            >
              cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2C1D11] hover:bg-[#1E100A] text-[#FDFBF7] text-xs font-semibold rounded-xl transition-colors cursor-pointer lowercase"
            >
              add book
            </button>
          </div>
        </form>
      )}

      {/* Analytics Visualization Panel */}
      {activeTab === "Analytics" ? (
        <div className="bg-white p-8 rounded-3xl border border-[#E8EDE9] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8EDE9] pb-4">
            <div>
              <h3 className="text-xl font-serif text-[#2C1D11] font-semibold lowercase">reading analytics</h3>
              <p className="text-xs text-[#5A7065] lowercase">metrics and statistics of your reading progress.</p>
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <button
                onClick={() => setChartMode("progress")}
                type="button"
                className={`px-3 py-1.5 text-xxs rounded-lg transition-all lowercase ${
                  chartMode === "progress" ? "bg-[#5A7065] text-[#FDFBF7]" : "hover:bg-[#F5EFEB] text-[#5A7065]"
                }`}
              >
                pages progress
              </button>
              <button
                onClick={() => setChartMode("genres")}
                type="button"
                className={`px-3 py-1.5 text-xxs rounded-lg transition-all lowercase ${
                  chartMode === "genres" ? "bg-[#5A7065] text-[#FDFBF7]" : "hover:bg-[#F5EFEB] text-[#5A7065]"
                }`}
              >
                genre breakdown
              </button>
            </div>
          </div>

          {/* Canvas mount area */}
          <div className="relative h-[340px] w-full flex items-center justify-center">
            {books.length === 0 ? (
              <div className="text-center text-[#5A7065] text-xs space-y-2">
                <BarChart2 className="w-8 h-8 mx-auto" />
                <p>No literary records on your shelf yet. Add a book to populate trends!</p>
              </div>
            ) : (
              <canvas ref={chartCanvasRef} />
            )}
          </div>
        </div>
      ) : (
        /* Bookshelf Cards Display Area */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBooks.length === 0 ? (
            <div className="md:col-span-2 bg-[#FDFBF7] py-16 text-center border-2 border-dashed border-[#E8EDE9] rounded-3xl text-sm italic text-[#5A7065] space-y-2 lowercase">
              <BookOpen className="w-8 h-8 text-[#A3B5A9] mx-auto animate-pulse" />
              <p>no books in this category yet. add your first book!</p>
            </div>
          ) : (
            filteredBooks.map((book) => {
              const bookPerc = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
              return (
                <div 
                  key={book.id} 
                  className="bg-white p-5 rounded-2xl border border-[#E8EDE9] shadow-xxs flex gap-5 relative group"
                >
                  {/* Absolute Remove Action */}
                  <button
                    onClick={() => onRemoveBook(book.id)}
                    type="button"
                    className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-250"
                    title="Remove from Shelf"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Elegant Cover Column */}
                  <div className="w-24 h-36 rounded-xl overflow-hidden shrink-0 border border-[#E8EDE9] bg-[#F5EFEB] shadow-xxs relative">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-350"
                    />
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-[#2C1D11]/85 backdrop-blur-xxs text-[8px] font-mono font-medium tracking-wide text-white uppercase rounded-md">
                      {book.genreCategory}
                    </span>
                  </div>

                  {/* Core Details Column */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xxxxs uppercase tracking-wider font-mono text-[#5A7065] block mb-1">
                        BY {book.author}
                      </span>
                      <h4 className="text-base font-serif font-black text-[#2C1D11] leading-snug">
                        {book.title}
                      </h4>
                      <p className="text-[10px] text-[#5A7065] italic tracking-wide">{book.genre}</p>
                    </div>

                    {/* Dynamic progress slider */}
                    <div className="space-y-2 mt-3.5">
                      <div className="flex justify-between items-center text-3xs font-mono text-[#5A7065]">
                        <span className="font-medium">{bookPerc}% Complete</span>
                        <span className="font-semibold">{book.currentPage} / {book.totalPages} pg</span>
                      </div>

                      <div className="w-full bg-[#F5EFEB] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#5A7065] h-full rounded-full transition-all"
                          style={{ width: `${bookPerc}%` }}
                        />
                      </div>

                      {/* Manual page adjustments */}
                      {book.status !== "Completed" && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => handlePageScroll(book.id, book.currentPage, -10, book.totalPages)}
                            type="button"
                            className="px-2 py-1 text-[9px] font-mono border border-[#E8EDE9] rounded-md hover:bg-[#FDFBF7] text-[#5A7065] transition-colors"
                          >
                            -10
                          </button>
                          <button
                            onClick={() => handlePageScroll(book.id, book.currentPage, 10, book.totalPages)}
                            type="button"
                            className="px-2 py-1 text-[9px] font-mono border border-[#E8EDE9] rounded-md hover:bg-[#FDFBF7] text-[#5A7065] transition-colors"
                          >
                            +10
                          </button>
                          
                          <button
                            onClick={() => onUpdateProgress(book.id, book.totalPages, "Completed")}
                            type="button"
                            className="ml-auto flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Complete</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
