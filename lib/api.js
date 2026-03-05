const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getHalls() {
  const res = await fetch(`${API_URL}/api/halls`);
  return res.json();
}

export async function getVendors() {
  const res = await fetch(`${API_URL}/api/vendor`);
  return res.json();
}