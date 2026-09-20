import { useCallback, useEffect, useRef, useState } from 'react'
import { searchArtworks } from '../services/artApi.js'

const INITIAL_PAGINATION = { total: 0, totalPages: 0, currentPage: 1, limit: 12 }

function buildRequestKey({ query, page, type, retryToken }) {
  return JSON.stringify({ query, page, type, retryToken })
}

export function useArtworks({ query = '', page = 1, type = null, append = false } = {}) {
  const [artworks, setArtworks] = useState([])
  const [pagination, setPagination] = useState(INITIAL_PAGINATION)
  const [error, setError] = useState(null)
  const [resolvedKey, setResolvedKey] = useState(null)
  const [retryToken, setRetryToken] = useState(0)

  // guarda os filtros da busca anterior para saber se a lista precisa ser reiniciada
  const filtersKeyRef = useRef(null)

  // loading é derivado: verdadeiro enquanto a chave da última requisição
  // resolvida (sucesso ou erro) não corresponder aos parâmetros atuais
  const requestKey = buildRequestKey({ query, page, type, retryToken })
  const loading = resolvedKey !== requestKey

  useEffect(() => {
    const key = buildRequestKey({ query, page, type, retryToken })
    const filtersKey = JSON.stringify({ query, type })
    const filtersChanged = filtersKeyRef.current !== null && filtersKeyRef.current !== filtersKey
    filtersKeyRef.current = filtersKey
    const shouldAppend = append && page > 1 && !filtersChanged

    const controller = new AbortController()

    searchArtworks({ query, page, type, signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return
        setArtworks((prev) => {
          if (!shouldAppend) return result.artworks
          const existingIds = new Set(prev.map((art) => art.id))
          return [...prev, ...result.artworks.filter((art) => !existingIds.has(art.id))]
        })
        setPagination(result.pagination)
        setError(null)
        setResolvedKey(key)
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return
        setError(err.message)
        setResolvedKey(key)
      })

    return () => controller.abort()
  }, [query, page, type, append, retryToken])

  const retry = useCallback(() => setRetryToken((token) => token + 1), [])

  return { artworks, pagination, loading, error: loading ? null : error, retry }
}
