import { useLocation } from 'react-router';

interface BreadcrumbEntry {
  label: string;
  path: string;
}

function toTitleCase(segment: string) {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function useBreadcrumbs(): BreadcrumbEntry[] {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const looksLikeId = /^[0-9a-fA-F-]{6,}$/.test(segment);
    const label = looksLikeId ? 'Details' : toTitleCase(segment);
    return { label, path };
  });
}
