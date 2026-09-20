import { useEffect, useState } from 'react'
import { searchArtworks } from '../../../services/artApi.js'
import styles from './ThemeCard.module.css'

function ThemeCard({ theme, onSelect }) {
  const [cover, setCover] = useState(null)
  const [resolvedKey, setResolvedKey] = useState(null)

  // loading é derivado: verdadeiro até a busca da capa deste tema ser resolvida
  const loading = resolvedKey !== theme.query

  useEffect(() => {
    const key = theme.query
    const controller = new AbortController()

    searchArtworks({ query: key, limit: 1, type: 'Painting', signal: controller.signal })
      .then((result) => {
        if (result.artworks[0]) return result.artworks[0]
        // sem pintura para o tema: repete a busca sem restringir o tipo
        return searchArtworks({ query: key, limit: 1, signal: controller.signal }).then(
          (fallback) => fallback.artworks[0] ?? null,
        )
      })
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
  }, [theme.query])

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
