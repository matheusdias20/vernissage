import { formatArtist, formatField } from '../../../utils/formatters.js'
import styles from './ExhibitionItem.module.css'

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FrameIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
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

function ExhibitionItem({ item, onOpen, onRemove }) {
  return (
    <div className={styles.item}>
      <div className={styles.media}>
        <button type="button" className={styles.imageButton} onClick={() => onOpen(item.id)}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.alt} className={styles.image} loading="lazy" decoding="async" />
          ) : (
            <div className={styles.placeholder}>
              <FrameIcon />
            </div>
          )}
        </button>

        <button
          type="button"
          className={styles.remove}
          aria-label={`Remover ${item.title} da exposição`}
          onClick={() => onRemove(item.id)}
        >
          <CloseIcon />
        </button>
      </div>

      <p className={styles.title}>{formatField(item.title)}</p>
      <p className={styles.artist}>{formatArtist(item.artist)}</p>
    </div>
  )
}

export default ExhibitionItem
