const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('access_token') || null;
  } catch {
    return null;
  }
}

async function uploadRequest(endpoint: string, file: File, extraFields?: Record<string, string>) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  if (extraFields) {
    Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Upload failed: ${res.statusText}`);
  }

  return res.json();
}

async function jsonRequest(endpoint: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.statusText}`);
  }

  return res.json();
}

export const documentStorageService = {
  uploadResume: (file: File) => uploadRequest('/files/resume', file),

  uploadCertificate: (file: File) => uploadRequest('/files/certificate', file),

  uploadProfileImage: (file: File) => uploadRequest('/files/profile-image', file),

  uploadCompanyLogo: (file: File, companyId?: string) =>
    uploadRequest('/files/company-logo', file, companyId ? { companyId } : undefined),

  getMetadata: (documentId: string) =>
    jsonRequest(`/files/${documentId}/metadata`),

  getDownloadUrl: (documentId: string) =>
    jsonRequest(`/files/${documentId}/download`),

  deleteDocument: (documentId: string) =>
    jsonRequest(`/files/${documentId}`, { method: 'DELETE' }),

  replaceDocument: async (documentId: string, file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/files/${documentId}/replace`, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Replace failed: ${res.statusText}`);
    }

    return res.json();
  },
};
