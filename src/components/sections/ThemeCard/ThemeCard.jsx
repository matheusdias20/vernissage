import { useEffect, useState } from 'react'
import { getArtworkById, searchArtworks } from '../../../services/artApi.js'
import styles from './ThemeCard.module.css'

// busca por tema usada como alternativa quando a capa fixa (coverId) falha
function searchByTheme(query, signal) {
  return searchArtworks({ query, limit: 1, type: 'Painting', signal }).then((result) => {
    if (result.artworks[0]) return result.artworks[0]
    return searchArtworks({ query, limit: 1, signal }).then((fallback) => fallback.artworks[0] ?? null)
  })
}

function ThemeCard({ theme, onSelect }) {
  const [cover, setCover] = useState(null)
  const [resolvedKey, setResolvedKey] = useState(null)

  const requestKey = `${theme.coverId}:${theme.query}`
  // loading é derivado: verdadeiro até a busca da capa deste tema ser resolvida
  const loading = resolvedKey !== requestKey

  useEffect(() => {
    const key = `${theme.coverId}:${theme.query}`
    const controller = new AbortController()

    getArtworkById(theme.coverId, { signal: controller.signal })
      .catch(() => searchByTheme(theme.query, controller.signal))
      .then((artwork) => {
        if (controller.signal.aborted) return
        setCover(artwork ?? null)
        setResolvedKey(key)
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return
        setCover(null)
        setResolvedKey(key)
      })

    return () => controller.abort()
  }, [theme.coverId, theme.query])

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onSelect(theme)}
      aria-label={`Explorar tema ${theme.label}`}
    >
      {loading && <div className={styles.skeleton} aria-hidden="true" />}

      {!loading && (
        <div className={cover ? styles.cover : `${styles.cover} ${styles.fallback}`}>
          {cover && <img src={cover.imageUrl} alt="" className={styles.image} loading="lazy" decoding="async" />}
        </div>
      )}

      <span className={styles.label}>{theme.label}</span>
    </button>
  )
}

export default ThemeCard
