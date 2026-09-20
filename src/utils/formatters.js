export function formatArtist(artist) {
  return artist?.trim() ? artist : 'Artista desconhecido'
}

export function formatDate(date) {
  return date?.trim() ? date : 'Data não informada'
}

export function formatField(value) {
  const text = value === null || value === undefined ? '' : String(value).trim()
  return text ? text : 'Não informado'
}

export function formatNumber(value) {
  return value.toLocaleString('pt-BR')
}

export function getImageAlt(artwork) {
  const title = artwork?.title || ''
  const artist = artwork?.artist || ''
  return artist ? `${title}, ${artist}` : title
}
