import { useCallback, useEffect, useState } from 'react'
import { getArtworkById } from '../services/artApi.js'

function buildRequestKey(id, retryToken) {
  return JSON.stringify({ id, retryToken })
}

export function useArtworkDetails(id) {
  const [artwork, setArtwork] = useState(null)
  const [error, setError] = useState(null)
  const [resolvedKey, setResolvedKey] = useState(null)
  const [retryToken, setRetryToken] = useState(0)

  const hasId = id !== null && id !== undefined

  // loading é derivado: verdadeiro enquanto a chave da última requisição
  // resolvida (sucesso ou erro) não corresponder ao id/retry atuais
  const requestKey = hasId ? buildRequestKey(id, retryToken) : null
  const loading = hasId && resolvedKey !== requestKey

  useEffect(() => {
    if (id === null || id === undefined) return undefined

    const key = buildRequestKey(id, retryToken)
    const controller = new AbortController()

    getArtworkById(id, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setArtwork(data)
        setError(null)
        setResolvedKey(key)
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return
        setError(err.message)
        setResolvedKey(key)
      })

    return () => controller.abort()
  }, [id, retryToken])

  const retry = useCallback(() => setRetryToken((token) => token + 1), [])

  // sem id ou ainda carregando, não expõe dados da obra anterior
  return {
    artwork: hasId && !loading ? artwork : null,
    loading,
    error: hasId && !loading ? error : null,
    retry,
  }
}
