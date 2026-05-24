import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.js";
import type { Book } from "../../types/index.js";
import Layout from "../../components/shared/Layout.js";

const SubmitTicket = () => {
  const { author } = useAuth();
  const navigate = useNavigate();

  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const books: Book[] = author?.books || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (subject.trim().length < 5) {
      toast.error("Subject must be at least 5 characters");
      return;
    }

    if (description.trim().length < 10) {
      toast.error("Please describe your issue in more detail");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/tickets", {
        book_id: bookId || undefined,
        subject: subject.trim(),
        description: description.trim(),
      });

      toast.success(
        "Ticket submitted. We will get back to you within 24-48 hours.",
      );
      setTimeout(() => navigate("/author/tickets"), 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to submit ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>

      <div className="max-w-2xl mx-auto px-6 py-9">
        {/* page header */}
        <div className="mb-7 pb-5 border-b border-slate-200">
          <p className="text-xs uppercase tracking-widest text-blue-700 font-medium mb-1">
            Support
          </p>
          <h1
            className="text-2xl font-medium text-slate-800 mb-1"
            style={{ fontFamily: "Lora, serif" }}
          >
            Raise a Support Ticket
          </h1>
          <p className="text-sm text-slate-400">
            Our team typically responds within 24–48 hours
          </p>
        </div>

        {/* form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-7 flex flex-col gap-6"
        >
          {/* book selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Which book is this about?
            </label>
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">General / Account Level</option>
              {books.map((book) => (
                <option key={book.book_id} value={book.book_id}>
                  {book.title} — {book.book_id}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1.5">
              Select a specific book or choose General for account-level queries
            </p>
          </div>

          {/* subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Royalty payment not received for Q3"
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Describe your issue
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please include relevant details — dates, amounts, platform names, order numbers..."
              required
              rows={5}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 transition-colors resize-y leading-relaxed"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Be specific — dates, amounts, and platform names help us resolve
              faster
            </p>
          </div>

          {/* attachment — UI only */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attachment
              <span className="font-normal text-slate-400 ml-1">
                (optional)
              </span>
            </label>
            <div
              onClick={() =>
                toast.info("File attachment coming soon in the next version")
              }
              className="border border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50 cursor-pointer hover:border-blue-400 transition-colors"
            >
              <p className="text-sm text-slate-500">
                Drag and drop or{" "}
                <span className="text-blue-700 font-medium">browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Screenshots, invoices, PDFs — max 5MB
              </p>
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Your ticket will be auto-classified by our system
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
      </Layout>
  );
};

export default SubmitTicket;
