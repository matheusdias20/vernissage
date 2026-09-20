export function stripHtml(html) {
  if (!html) return ''
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent || ''
  return text.replace(/\s+/g, ' ').trim()
}
