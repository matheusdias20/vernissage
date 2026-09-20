import styles from './Pagination.module.css'

function ArrowIcon({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// no máximo 5 números visíveis: janela em torno da página atual, com reticências para o restante
function getPageItems(page, totalPages) {
  const maxVisible = 5

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(page - 1, 1)
  const rightSibling = Math.min(page + 1, totalPages)
  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    return [1, 2, 3, '...', totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, '...', totalPages - 2, totalPages - 1, totalPages]
  }

  if (showLeftEllipsis && showRightEllipsis) {
    return [1, '...', page, '...', totalPages]
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1)
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const items = getPageItems(page, totalPages)

  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <button
        type="button"
        className={styles.arrowButton}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ArrowIcon className={styles.prevIcon} />
      </button>

      <ul className={styles.list}>
        {items.map((item, index) =>
          item === '...' ? (
            <li key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={item === page ? `${styles.pageButton} ${styles.active}` : styles.pageButton}
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={styles.arrowButton}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Próxima página"
      >
        <ArrowIcon />
      </button>
    </nav>
  )
}

export default Pagination
