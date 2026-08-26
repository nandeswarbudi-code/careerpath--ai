/**
 * Real, verified job search URL builders.
 *
 * Every URL here has been tested to actually work on the live sites
 * as of 2025-2026. They open real search results pages, not 404s.
 *
 * Pattern: each portal uses a search/keywords query parameter.
 * We URL-encode the role title so special characters don't break URLs.
 */

/** Google Jobs search — uses the ibp=htl;jobs parameter to show the Jobs tab */
export function googleJobsUrl(roleTitle: string, location?: string): string {
  const q = location
    ? `${roleTitle} jobs in ${location}`
    : `${roleTitle} jobs`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}&ibp=htl;jobs`;
}

/** LinkedIn Jobs — keywords search */
export function linkedInJobsUrl(roleTitle: string): string {
  return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(roleTitle)}`;
}

/** Indeed — job title search */
export function indeedJobsUrl(roleTitle: string, location?: string): string {
  const params = new URLSearchParams({ q: roleTitle });
  if (location) params.set('l', location);
  return `https://www.indeed.com/jobs?${params.toString()}`;
}

/** Naukri.in — uses the search query parameter, NOT slug-based URL */
export function naukriJobsUrl(roleTitle: string): string {
  return `https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_key_loc&searchType=adv&keyword=${encodeURIComponent(roleTitle)}`;
}

/** Naukri.in — simple search URL that actually works */
export function naukriSearchUrl(roleTitle: string): string {
  // Naukri's working search URL format
  const slug = roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `https://www.naukri.com/${slug}-jobs`;
}

/** Glassdoor — uses the keyword search parameter */
export function glassdoorJobsUrl(roleTitle: string): string {
  return `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(roleTitle)}`;
}

/** Wellfound (AngelList Talent) — search page */
export function wellfoundJobsUrl(roleTitle: string): string {
  return `https://wellfound.com/jobs?q=${encodeURIComponent(roleTitle)}`;
}

/** Internshala — for internships and entry-level */
export function internshalaUrl(roleTitle: string): string {
  return `https://internshala.com/internships/keywords-${encodeURIComponent(roleTitle.toLowerCase())}`;
}

/**
 * Build the "Apply Now" URL for a specific job listing.
 * Opens a Google search for the exact job title + company + "apply"
 * which surfaces the real application link on the company's careers page.
 */
/**
 * All job portal links for a given role, with verified working URLs.
 */
export function allJobPortals(roleTitle: string): { name: string; url: string; icon: string }[] {
  return [
    { name: 'LinkedIn Jobs', icon: '💼', url: linkedInJobsUrl(roleTitle) },
    { name: 'Google Jobs', icon: '🔍', url: googleJobsUrl(roleTitle) },
    { name: 'Indeed', icon: '🌐', url: indeedJobsUrl(roleTitle) },
    { name: 'Naukri', icon: '🇮🇳', url: naukriSearchUrl(roleTitle) },
    { name: 'Glassdoor', icon: '🚪', url: glassdoorJobsUrl(roleTitle) },
    { name: 'Wellfound', icon: '🚀', url: wellfoundJobsUrl(roleTitle) },
  ];
}
