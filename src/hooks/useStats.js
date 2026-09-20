import { useEffect, useState } from 'react'
import { getTotal, getArtworkTypes } from '../services/artApi.js'

const REQUEST_KEY = 'stats'

export function useStats() {
  const [totalArtworks, setTotalArtworks] = useState(null)
  const [totalPublicDomain, setTotalPublicDomain] = useState(null)
  const [totalTypes, setTotalTypes] = useState(null)
  const [error, setError] = useState(null)
  const [resolvedKey, setResolvedKey] = useState(null)

  // loading é derivado: verdadeiro até a única requisição possível ser resolvida
  const loading = resolvedKey !== REQUEST_KEY

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      getTotal({ signal: controller.signal }),
      getTotal({ publicDomainOnly: true, signal: controller.signal }),
      getArtworkTypes({ signal: controller.signal }),
    ])
      .then(([total, totalPublic, types]) => {
        if (controller.signal.aborted) return
        setTotalArtworks(total)
        setTotalPublicDomain(totalPublic)
        setTotalTypes(types.length)
        setError(null)
        setResolvedKey(REQUEST_KEY)
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return
        setTotalArtworks(null)
        setTotalPublicDomain(null)
        setTotalTypes(null)
        setError(err.message)
        setResolvedKey(REQUEST_KEY)
      })

    return () => controller.abort()
  }, [])

  return { totalArtworks, totalPublicDomain, totalTypes, loading, error }
}
