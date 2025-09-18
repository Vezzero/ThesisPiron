const API_BASE =
  (import.meta.env.VITE_API_BASE?.replace(/\/$/, '')) || '/app/gutbrainkb/api';

export async function fetchTermMentions(term = "") {
  const params = new URLSearchParams();
  if (term) params.set("term", term);
  const url = `${API_BASE}/list_everything/?${params.toString()}`;

  const res = await fetch(url, { credentials: 'same-origin' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.mentions;
}
