function parseStoredJson(key) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

export function getAdminToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("adminToken") || "";
}

export function getAdminAuthHeaders(extraHeaders = {}) {
  const token = getAdminToken();

  return token
    ? {
        ...extraHeaders,
        Authorization: `Bearer ${token}`,
      }
    : { ...extraHeaders };
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("admin");
  localStorage.removeItem("adminToken");
}

export function getVendorSession() {
  if (typeof window === "undefined") {
    return {
      vendor: null,
      token: "",
      vendorId: "",
    };
  }

  const vendor = parseStoredJson("vendor");
  const token = localStorage.getItem("vendorToken") || "";
  const vendorId = vendor?._id || vendor?.id || "";

  return {
    vendor,
    token,
    vendorId,
  };
}

export function getVendorAuthHeaders(extraHeaders = {}) {
  const { token } = getVendorSession();

  return token
    ? {
        ...extraHeaders,
        Authorization: `Bearer ${token}`,
      }
    : { ...extraHeaders };
}

export function clearVendorSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("vendor");
  localStorage.removeItem("vendorToken");
}
