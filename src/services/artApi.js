const BASE_URL = 'https://api.artic.edu/api/v1'

const LIST_FIELDS = [
  'id',
  'title',
  'artist_title',
  'date_display',
  'image_id',
  'is_public_domain',
  'artwork_type_title',
  'thumbnail',
]

const DETAIL_FIELDS = [
  ...LIST_FIELDS,
  'artist_display',
  'medium_display',
  'dimensions',
  'place_of_origin',
  'credit_line',
  'description',
  'short_description',
  'subject_titles',
  'style_title',
  'department_title',
]

const SEARCH_FIELDS = [
  'title^3',
  'artist_title^3',
  'subject_titles',
  'category_titles',
  'style_title',
  'classification_title',
  'medium_display',
]

// A API rejeita com 403 quando offset + limit ultrapassa 1000 (deep pagination),
// mesmo que pagination.total_pages, devolvido por ela, ignore esse limite real.
const MAX_PAGINATED_RESULTS = 1000

const CACHE_TTL = 10 * 60 * 1000
const cache = new Map()

async function request(url, { signal, ...options } = {}) {
  const cacheKey = url + (options.body ?? '')
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  let response
  try {
    response = await fetch(url, { ...options, signal })
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
  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

export async function searchArtworks({
  query = '',
  page = 1,
  limit = 12,
  artworkTypeId = null,
  publicDomainOnly = true,
  signal,
} = {}) {
  const must = [{ exists: { field: 'image_id' } }]

  if (publicDomainOnly) {
    must.push({ term: { is_public_domain: true } })
  }

  if (artworkTypeId) {
    must.push({ term: { artwork_type_id: artworkTypeId } })
  }

  const trimmedQuery = query.trim()
  if (trimmedQuery) {
    // o campo "q" de nível superior não filtra de fato, só reordena por relevância;
    // o multi_match dentro de bool.must é o que realmente restringe os resultados.
    must.push({ multi_match: { query: trimmedQuery, fields: SEARCH_FIELDS } })
  }

  const body = {
    fields: LIST_FIELDS,
    limit,
    page,
    query: { bool: { must } },
  }

  const data = await request(`${BASE_URL}/artworks/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  const maxPages = Math.floor(MAX_PAGINATED_RESULTS / limit)

  return {
    artworks: data.data,
    pagination: {
      total: data.pagination.total,
      totalPages: Math.min(data.pagination.total_pages, maxPages),
      currentPage: page,
      limit,
    },
  }
}

export async function getArtworkById(id, { signal } = {}) {
  const params = new URLSearchParams({ fields: DETAIL_FIELDS.join(',') })
  const data = await request(`${BASE_URL}/artworks/${id}?${params.toString()}`, { signal })
  return data.data
}

export async function getArtworkTypes({ signal } = {}) {
  const data = await request(`${BASE_URL}/artwork-types?limit=100`, { signal })
  return data.data
    .map((type) => ({ id: type.id, title: type.title }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

export async function getTotal({ publicDomainOnly = false, signal } = {}) {
  if (!publicDomainOnly) {
    const data = await request(`${BASE_URL}/artworks?limit=1&fields=id`, { signal })
    return data.pagination.total
  }

  const body = {
    limit: 1,
    fields: ['id'],
    query: { bool: { must: [{ term: { is_public_domain: true } }] } },
  }

  const data = await request(`${BASE_URL}/artworks/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  return data.pagination.total
}

export async function getRandomArtworks({ count = 1, signal } = {}) {
  const first = await searchArtworks({ page: 1, limit: count, signal })
  const maxPage = Math.max(
    1,
    Math.floor(Math.min(first.pagination.total, MAX_PAGINATED_RESULTS) / count),
  )
  const randomPage = Math.floor(Math.random() * maxPage) + 1

  if (randomPage === 1) {
    return first.artworks
  }

  const result = await searchArtworks({ page: randomPage, limit: count, signal })
  return result.artworks
}
