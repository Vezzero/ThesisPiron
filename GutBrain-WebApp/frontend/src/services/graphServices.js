const API_BASE = "http://localhost:8000/api";

export async function fetchTermMentions(term = "") {
  const params = new URLSearchParams();
  if (term) {
    params.set("term", term);
  }
  const url = `${API_BASE}/sparql/search/?${params.toString()}`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkErr) {
    console.error("Network error while fetching mentions:", networkErr);
    throw new Error("Unable to reach the server. Please check your connection.");
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonErr) {
    console.error("Failed to parse JSON response:", jsonErr);
    throw new Error(`Invalid JSON received from server (status ${response?.status}).`);
  }

  if (!response.ok) {
    const msg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(msg);
  }

  return data.mentions;
}
