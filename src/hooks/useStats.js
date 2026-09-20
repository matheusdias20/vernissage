import { useEffect, useState } from 'react'
import { getTotal } from '../services/artApi.js'

const REQUEST_KEY = 'stats'

export function useStats() {
  const [totalArtworks, setTotalArtworks] = useState(null)
  const [totalWithImage, setTotalWithImage] = useState(null)
  const [totalPaintings, setTotalPaintings] = useState(null)
  const [error, setError] = useState(null)
  const [resolvedKey, setResolvedKey] = useState(null)

  // loading é derivado: verdadeiro até a única requisição possível ser resolvida
  const loading = resolvedKey !== REQUEST_KEY

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      getTotal({ signal: controller.signal }),
      getTotal({ withImage: true, signal: controller.signal }),
      getTotal({ type: 'Painting', withImage: true, signal: controller.signal }),
    ])
      .then(([total, totalImage, totalPaint]) => {
        if (controller.signal.aborted) return
        setTotalArtworks(total)
        setTotalWithImage(totalImage)
        setTotalPaintings(totalPaint)
        setError(null)
        setResolvedKey(REQUEST_KEY)
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return
        setTotalArtworks(null)
        setTotalWithImage(null)
        setTotalPaintings(null)
        setError(err.message)
        setResolvedKey(REQUEST_KEY)
      })

    return () => controller.abort()
  }, [])

  return { totalArtworks, totalWithImage, totalPaintings, loading, error }
}
