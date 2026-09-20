import { formatArtist, formatField } from '../../../utils/formatters.js'
import styles from './ExhibitionItem.module.css'

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ExhibitionItem({ item, onOpen, onRemove }) {
  return (
    <div className={styles.item}>
      <div className={styles.media}>
        <button type="button" className={styles.imageButton} onClick={() => onOpen(item.id)}>
          <img src={item.imageUrl} alt={item.alt} className={styles.image} loading="lazy" decoding="async" />
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
