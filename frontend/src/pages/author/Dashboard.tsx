import { useAuth } from "../../context/AuthContext.js";
import Layout from "../../components/shared/Layout.js";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { author } = useAuth();

  const totalCopiesSold =
    author?.books.reduce((sum, book) => sum + book.total_copies_sold, 0) || 0;

  const totalEarned =
    author?.books.reduce((sum, book) => sum + book.total_royalty_earned, 0) ||
    0;

  const totalPending =
    author?.books.reduce((sum, book) => sum + book.royalty_pending, 0) || 0;

  const publishedBooks =
    author?.books.filter((book) => book.status === "Published & Live").length ||
    0;

  return (
    <Layout>
      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 24px" }}
      >
        {/* header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: "Lora, serif",
              fontSize: "24px",
              fontWeight: 500,
              color: "var(--ink-dark)",
              margin: "0 0 6px",
            }}
          >
            Welcome back, {author?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize: "13px", color: "var(--ink-mid)", margin: 0 }}>
            Here is a summary of your publishing activity
          </p>
        </div>

        {/* stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: "Published Books",
              value: publishedBooks,
              color: "var(--ink-dark)",
            },
            {
              label: "Copies Sold",
              value: totalCopiesSold.toLocaleString(),
              color: "var(--ink-dark)",
            },
            {
              label: "Total Earned",
              value: `₹${totalEarned.toLocaleString()}`,
              color: "#16A34A",
            },
            {
              label: "Royalty Pending",
              value: `₹${totalPending.toLocaleString()}`,
              color: "#D97706",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "white",
                borderRadius: "10px",
                border: "0.5px solid var(--border-subtle)",
                padding: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--ink-light)",
                  margin: "0 0 8px",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  fontSize: "26px",
                  fontWeight: 500,
                  color: stat.color,
                  margin: 0,
                  fontFamily: "Lora, serif",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* quick actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          <Link
            to="/author/books"
            style={{
              background: "white",
              borderRadius: "10px",
              border: "0.5px solid var(--border-subtle)",
              padding: "20px",
              textDecoration: "none",
              display: "block",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-subtle)")
            }
          >
            <div style={{ fontSize: "22px", marginBottom: "10px" }}>📚</div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--ink-dark)",
                margin: "0 0 4px",
              }}
            >
              My Books
            </h3>
            <p
              style={{ fontSize: "12px", color: "var(--ink-light)", margin: 0 }}
            >
              View all your published books and sales data
            </p>
          </Link>

          <Link
            to="/author/tickets"
            style={{
              background: "white",
              borderRadius: "10px",
              border: "0.5px solid var(--border-subtle)",
              padding: "20px",
              textDecoration: "none",
              display: "block",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-subtle)")
            }
          >
            <div style={{ fontSize: "22px", marginBottom: "10px" }}>🎫</div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--ink-dark)",
                margin: "0 0 4px",
              }}
            >
              My Tickets
            </h3>
            <p
              style={{ fontSize: "12px", color: "var(--ink-light)", margin: 0 }}
            >
              Track your support requests and responses
            </p>
          </Link>

          <Link
            to="/author/tickets/new"
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 transition-colors block no-underline"
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--primary)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
          >
            <div className="text-2xl mb-2">✉️</div>
            <h3 className="text-sm font-medium text-slate-800 mb-1">
              New Support Ticket
            </h3>
            <p className="text-xs text-slate-400">
              Raise a query with the BookLeaf team
            </p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
