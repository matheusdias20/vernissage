const IIIF_BASE = 'https://www.artic.edu/iiif/2'
const SRCSET_WIDTHS = [200, 400, 843]

export function getImageUrl(imageId, width = 400) {
  if (!imageId) return null
  return `${IIIF_BASE}/${imageId}/full/${width},/0/default.jpg`
}

export function getImageSrcSet(imageId) {
  if (!imageId) return ''
  return SRCSET_WIDTHS.map((width) => `${getImageUrl(imageId, width)} ${width}w`).join(', ')
}
