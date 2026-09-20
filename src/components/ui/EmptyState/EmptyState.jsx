import Chip from '../Chip/Chip'
import styles from './EmptyState.module.css'

function FrameIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
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

function EmptyState({ title, message, suggestions = [], onSuggestionClick }) {
  return (
    <div className={styles.emptyState}>
      <FrameIcon />
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <Chip key={suggestion} label={suggestion} onClick={() => onSuggestionClick?.(suggestion)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default EmptyState
