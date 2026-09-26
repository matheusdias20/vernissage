import { useExhibition } from '../../../hooks/useExhibition.js'
import { formatArtist, formatDate, formatField, getImageAlt } from '../../../utils/formatters.js'
import styles from './ArtworkCard.module.css'

function FrameIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
      <rect x="4" y="6" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 28L14 20L21 26L28 18L36 28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M10 17.5s-6.7-4.3-8.7-8.3C-0.1 6.1 1.1 2.9 4.2 2.4c2-0.3 3.7 0.8 4.8 2.3c1.1-1.5 2.8-2.6 4.8-2.3c3.1 0.5 4.3 3.7 2.9 6.8c-2 4-8.7 8.3-8.7 8.3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArtworkCard({ artwork, onOpen }) {
  const { toggle, isInExhibition } = useExhibition()
  const inExhibition = isInExhibition(artwork.id)

  // reserva o espaço da imagem com a proporção real; sem dados, cai numa proporção de retrato razoável
  const aspectRatio =
    artwork.imageWidth && artwork.imageHeight ? `${artwork.imageWidth} / ${artwork.imageHeight}` : '3 / 4'

  return (
    <div className={styles.card}>
      <div className={styles.media}>
        <button type="button" className={styles.imageButton} onClick={() => onOpen(artwork.id)}>
          {artwork.imageUrl ? (
            <img
              src={artwork.imageUrl}
              alt={getImageAlt(artwork)}
              className={styles.image}
              style={{ aspectRatio }}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className={styles.placeholder} style={{ aspectRatio }}>
              <FrameIcon />
            </div>
          )}
          <span className={styles.overlay} aria-hidden="true">
            Ver detalhes
          </span>
        </button>

        <button
          type="button"
          className={styles.heart}
          aria-pressed={inExhibition}
          aria-label={
            inExhibition ? `Remover ${artwork.title} da exposição` : `Adicionar ${artwork.title} à exposição`
          }
          onClick={() => toggle(artwork)}
        >
          <HeartIcon />
        </button>
      </div>

      <button
        type="button"
        className={styles.titleButton}
        title={formatField(artwork.title)}
        onClick={() => onOpen(artwork.id)}
      >
        {formatField(artwork.title)}
      </button>
      <p className={styles.meta}>
        {formatArtist(artwork.artist)}, {formatDate(artwork.date)}
      </p>
    </div>
  )
}

export default ArtworkCard
