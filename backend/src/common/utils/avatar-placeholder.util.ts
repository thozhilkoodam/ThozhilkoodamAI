/**
 * Utility functions for generating local/default avatars and company placeholders.
 * Used when profilePhotoUrl or logoUrl is null under Spark Plan (Option B).
 */

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'TK';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getInitialsAvatarSvgDataUri(name?: string | null, bgHex = '3B82F6', fgHex = 'FFFFFF'): string {
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">` +
    `<rect width="128" height="128" rx="64" fill="#${bgHex}"/>` +
    `<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#${fgHex}" font-size="48" font-family="sans-serif" font-weight="bold">${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getCompanyPlaceholderSvgDataUri(companyName?: string | null): string {
  const initials = getInitials(companyName || 'Company');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">` +
    `<rect width="128" height="128" rx="16" fill="#1E293B"/>` +
    `<path d="M40 88V40h48v48H40zm8-8h8V72h-8v8zm0-16h8V56h-8v16zm16 16h8V72h-8v8zm0-16h8V56h-8v16z" fill="#94A3B8"/>` +
    `<text x="50%" y="30%" dominant-baseline="middle" text-anchor="middle" fill="#F8FAFC" font-size="18" font-family="sans-serif" font-weight="600">${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
