const BASE_URL = '/museu-api'

const LIST_FIELDS = ['id', 'title', 'creators', 'creation_date', 'type', 'images']

const DETAIL_FIELDS = [
  ...LIST_FIELDS,
  'technique',
  'department',
  'culture',
  'measurements',
  'creditline',
  'description',
  'url',
]

const CACHE_TTL = 10 * 60 * 1000
const cache = new Map()

function buildUrl(path, params = {}) {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    searchParams.set(key, value)
  }
  const query = searchParams.toString()
  return `${BASE_URL}${path}${query ? `?${query}` : ''}`
}

async function request(url, { signal } = {}) {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  let response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Sem conexão com a internet. Verifique e tente novamente.', { cause: error })
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Muitas requisições em pouco tempo. Aguarde um minuto e tente novamente.')
    }
    throw new Error(`Não foi possível carregar os dados (código ${response.status}).`)
  }

  const data = await response.json()
  cache.set(url, { data, timestamp: Date.now() })
  return data
}

// creators[0].description costuma vir como "Nome (nacionalidade, datas)"; o artista é só o nome
function extractArtist(creators) {
  const description = creators?.[0]?.description
  if (!description) return ''
  return description.replace(/\s*\([^)]*\)\s*$/, '').trim()
}

function normalizeArtwork(raw) {
  const web = raw.images?.web

  return {
    id: raw.id,
    title: raw.title || '',
    artist: extractArtist(raw.creators),
    date: raw.creation_date || '',
    type: raw.type || '',
    imageUrl: web?.url ?? null,
    imageWidth: web?.width ? Number(web.width) : null,
    imageHeight: web?.height ? Number(web.height) : null,
    technique: raw.technique || '',
    department: raw.department || '',
    culture: Array.isArray(raw.culture) ? raw.culture.join(', ') : raw.culture || '',
    dimensions: raw.measurements || '',
    creditLine: raw.creditline || '',
    description: raw.description || '',
    museumUrl: raw.url || '',
  }
}

export async function searchArtworks({ query = '', page = 1, limit = 12, type = null, signal } = {}) {
  const skip = (page - 1) * limit

  const url = buildUrl('/artworks/', {
    cc0: 1,
    has_image: 1,
    limit,
    skip,
    fields: LIST_FIELDS.join(','),
    q: query.trim(),
    type,
  })

  const data = await request(url, { signal })
  const total = data.info?.total ?? 0

  return {
    artworks: (data.data ?? []).map(normalizeArtwork),
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  }
}

export async function getArtworkById(id, { signal } = {}) {
  const url = buildUrl(`/artworks/${id}`, { fields: DETAIL_FIELDS.join(',') })
  const data = await request(url, { signal })
  return normalizeArtwork(data.data)
}

export async function getTotal({ type = null, withImage = false, signal } = {}) {
  const url = buildUrl('/artworks/', {
    limit: 1,
    fields: 'id',
    cc0: withImage ? 1 : null,
    has_image: withImage ? 1 : null,
    type,
  })
  const data = await request(url, { signal })
  return data.info?.total ?? 0
}

export async function getRandomArtworks({ count = 1, type = 'Painting', signal } = {}) {
  const total = await getTotal({ type, withImage: true, signal })
  const maxSkip = Math.max(total - count, 0)
  const skip = Math.floor(Math.random() * (maxSkip + 1))

  const url = buildUrl('/artworks/', {
    cc0: 1,
    has_image: 1,
    type,
    limit: count,
    skip,
    fields: LIST_FIELDS.join(','),
  })

  const data = await request(url, { signal })
  return (data.data ?? []).map(normalizeArtwork)
}
