import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface Props {
  value: string;
  onChange: (countryCode: string) => void;
}

/**
 * Built-in list so the picker works even without any seeded curricula.
 * When Firestore has curated profiles we merge them in so the user can see
 * which ones have enhanced curriculum guidance.
 */
const DEFAULT_COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "US", name: "United States" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "MA", name: "Morocco" },
  { code: "TN", name: "Tunisia" },
  { code: "EG", name: "Egypt" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];

export default function CountryPicker({ value, onChange }: Props) {
  const [curated, setCurated] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "curricula"),
      (snap) => {
        setCurated(new Set(snap.docs.map((d) => d.id)));
      },
      () => {
        /* non-fatal: picker still works with defaults */
      },
    );
    return unsub;
  }, []);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {DEFAULT_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name} ({c.code}){curated.has(c.code) ? " ✓" : ""}
        </option>
      ))}
    </select>
  );
}
