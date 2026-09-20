export function formatArtist(artistTitle) {
  return artistTitle?.trim() ? artistTitle : 'Artista desconhecido'
}

export function formatDate(dateDisplay) {
  return dateDisplay?.trim() ? dateDisplay : 'Data não informada'
}

export function formatField(value) {
  const text = value === null || value === undefined ? '' : String(value).trim()
  return text ? text : 'Não informado'
}

export function formatNumber(value) {
  return value.toLocaleString('pt-BR')
}

export function getImageAlt(artwork) {
  if (artwork?.thumbnail?.alt_text) return artwork.thumbnail.alt_text
  return `${formatField(artwork?.title)}, ${formatArtist(artwork?.artist_title)}`
}
