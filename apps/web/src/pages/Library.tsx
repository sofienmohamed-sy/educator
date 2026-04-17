import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProvider";
import SubjectPicker from "../components/SubjectPicker";
import BookList from "../components/BookList";
import CountryPicker from "../components/CountryPicker";
import { listBooksFn } from "../lib/callables";
import { uploadBook } from "../lib/books";
import { getProfileFn } from "../lib/callables";
import type { BookMeta, Subject, UserRole } from "../lib/types";

export default function Library() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>("student");
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [filterSubject, setFilterSubject] = useState<Subject>("math");
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Upload form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("math");
  const [country, setCountry] = useState("US");
  const [gradeLevel, setGradeLevel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfileFn({})
      .then(({ data }) => { if (data) setRole(data.role); })
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    setLoadingBooks(true);
    listBooksFn({ subject: filterSubject })
      .then(({ data }) => setBooks(data.books))
      .catch(console.error)
      .finally(() => setLoadingBooks(false));
  }, [filterSubject]);

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      await uploadBook(
        { title, subject, country, gradeLevel: gradeLevel || undefined },
        file,
      );
      setUploadMsg({ type: "success", text: "Book uploaded and queued for processing." });
      setTitle("");
      setFile(null);
      // Refresh list
      const { data } = await listBooksFn({ subject: filterSubject });
      setBooks(data.books);
    } catch (err) {
      setUploadMsg({ type: "error", text: (err as Error).message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {role === "professor" && (
        <form onSubmit={onUpload} className="card">
          <h2 style={{ marginTop: 0 }}>Upload a scientific book</h2>
          <div className="row" style={{ flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <div>
              <label>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Transmath Terminale"
                required
              />
            </div>
            <SubjectPicker value={subject} onChange={setSubject} />
            <div>
              <label>Country</label>
              <CountryPicker value={country} onChange={setCountry} />
            </div>
            <div>
              <label>Grade / level (optional)</label>
              <input
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="e.g. Terminale"
              />
            </div>
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label>PDF file (max 50 MB)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFile(e.target.files?.[0] ?? null)
              }
              required
            />
          </div>
          {uploadMsg && (
            <p className={uploadMsg.type === "error" ? "error" : "muted"}>
              {uploadMsg.text}
            </p>
          )}
          <button type="submit" className="primary" disabled={uploading || !file}>
            {uploading ? "Uploading…" : "Upload book"}
          </button>
        </form>
      )}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Book library</h2>
        <div style={{ marginBottom: "0.75rem" }}>
          <SubjectPicker
            value={filterSubject}
            onChange={setFilterSubject}
            label="Filter by subject"
          />
        </div>
        {loadingBooks ? (
          <p className="muted">Loading…</p>
        ) : (
          <BookList
            books={books}
            role={role}
            selectedIds={[]}
          />
        )}
      </div>
    </div>
  );
}
