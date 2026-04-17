import type { BookMeta, UserRole } from "../lib/types";

const STATUS_LABELS: Record<BookMeta["status"], string> = {
  pending: "Pending upload",
  processing: "Processing...",
  ready: "Ready",
  error: "Error",
};

const STATUS_COLORS: Record<BookMeta["status"], string> = {
  pending: "#888",
  processing: "#d97706",
  ready: "#16a34a",
  error: "#dc2626",
};

interface Props {
  books: BookMeta[];
  role: UserRole;
  selectedIds: string[];
  onToggle?: (id: string) => void;
}

export default function BookList({ books, role, selectedIds, onToggle }: Props) {
  if (books.length === 0) {
    return <p className="muted">No books found.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {books.map((book) => {
        const isSelected = selectedIds.includes(book.id);
        return (
          <div
            key={book.id}
            className="card"
            style={{
              padding: "0.75rem",
              cursor: onToggle ? "pointer" : "default",
              border: isSelected ? "2px solid var(--color-primary, #2563eb)" : undefined,
            }}
            onClick={() => onToggle?.(book.id)}
          >
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{book.title}</strong>
              {(role === "professor" || book.status !== "ready") && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: STATUS_COLORS[book.status],
                    fontWeight: 600,
                  }}
                >
                  {STATUS_LABELS[book.status]}
                </span>
              )}
            </div>
            <div className="row" style={{ gap: "1rem", marginTop: "0.25rem" }}>
              <span className="muted" style={{ fontSize: "0.8rem" }}>
                {book.subject} · {book.country}
                {book.gradeLevel ? ` · ${book.gradeLevel}` : ""}
              </span>
              {book.chunkCount !== undefined && (
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  {book.chunkCount} chunks
                </span>
              )}
            </div>
            {book.status === "error" && book.errorMessage && (
              <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>
                {book.errorMessage}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
