import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useArtworkDetails } from '../../../hooks/useArtworkDetails.js'
import { useExhibition } from '../../../hooks/useExhibition.js'
import { FEATURED_TYPES } from '../../../constants/artworkTypes.js'
import { formatArtist, formatField, getImageAlt } from '../../../utils/formatters.js'
import { stripHtml } from '../../../utils/stripHtml.js'
import Button from '../../ui/Button/Button'
import ErrorMessage from '../../ui/ErrorMessage/ErrorMessage'
import styles from './ArtworkModal.module.css'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function CloseIcon() {
  return (
    <svg className={styles.closeIcon} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg className={styles.backIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M13 8H3M3 8L7 4M3 8L7 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function typeLabel(type) {
  const featured = FEATURED_TYPES.find((item) => item.value === type)
  return featured ? featured.label : type
}

// esqueleto decorativo enquanto os detalhes carregam; o h2 acessível fica fora daqui
function FieldsSkeleton() {
  return (
    <div className={styles.skeletonFields} aria-hidden="true">
      <span className={styles.skeletonLine} style={{ width: '50%' }} />
      <span className={styles.skeletonLine} style={{ width: '85%' }} />
      <span className={styles.skeletonLine} style={{ width: '85%' }} />
      <span className={styles.skeletonLine} style={{ width: '70%' }} />
      <span className={styles.skeletonLine} style={{ width: '60%' }} />
    </div>
  )
}

function ArtworkModal({ artworkId, onClose }) {
  const titleId = useId()
  const { artwork, loading, error, retry } = useArtworkDetails(artworkId)
  const { toggle, isInExhibition } = useExhibition()

  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  // guarda o foco anterior, trava o body/#root e devolve tudo ao fechar
  useEffect(() => {
    previousFocusRef.current = document.activeElement
    closeButtonRef.current?.focus()

    const root = document.getElementById('root')
    root?.setAttribute('inert', '')

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      root?.removeAttribute('inert')
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus()
      }
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const inExhibition = artwork ? isInExhibition(artwork.id) : false
  const aspectRatio =
    artwork?.imageWidth && artwork?.imageHeight ? `${artwork.imageWidth} / ${artwork.imageHeight}` : undefined

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" ref={closeButtonRef} className={styles.closeButton} aria-label="Fechar" onClick={onClose}>
          <BackIcon />
          <span className={styles.backLabel}>Voltar</span>
          <CloseIcon />
        </button>

        <div className={styles.body}>
          <div className={styles.imageColumn}>
            {!loading && !error && artwork ? (
              <img
                src={artwork.imageUrl}
                alt={getImageAlt(artwork)}
                className={styles.image}
                style={{ aspectRatio }}
                decoding="async"
              />
            ) : (
              <div className={styles.imageSkeleton} aria-hidden="true" />
            )}
          </div>

          <div className={styles.infoColumn}>
            {!loading && !error && artwork?.type ? (
              <span className={styles.typeChip}>{typeLabel(artwork.type)}</span>
            ) : (
              loading && <span className={styles.skeletonChip} aria-hidden="true" />
            )}

            <h2 id={titleId} className={loading || error ? 'visually-hidden' : styles.title}>
              {loading
                ? 'Carregando obra'
                : error
                  ? 'Não foi possível carregar a obra'
                  : formatField(artwork?.title)}
            </h2>

            {loading && <FieldsSkeleton />}

            {!loading && error && (
              <div className={styles.errorWrap}>
                <ErrorMessage message={error} onRetry={retry} />
              </div>
            )}

            {!loading && !error && artwork && (
              <>
                <p className={styles.artist}>{formatArtist(artwork.artist)}</p>

                <dl className={styles.factList}>
                  <div className={styles.factRow}>
                    <dt>Data</dt>
                    <dd>{formatField(artwork.date)}</dd>
                  </div>
                  <div className={styles.factRow}>
                    <dt>Técnica</dt>
                    <dd>{formatField(artwork.technique)}</dd>
                  </div>
                  <div className={styles.factRow}>
                    <dt>Dimensões</dt>
                    <dd>{formatField(artwork.dimensions)}</dd>
                  </div>
                  <div className={styles.factRow}>
                    <dt>Origem</dt>
                    <dd>{formatField(artwork.culture)}</dd>
                  </div>
                  <div className={styles.factRow}>
                    <dt>Créditos</dt>
                    <dd>{formatField(artwork.creditLine)}</dd>
                  </div>
                </dl>

                {artwork.description && <p className={styles.description}>{stripHtml(artwork.description)}</p>}

                <a href={artwork.museumUrl} target="_blank" rel="noopener noreferrer" className={styles.museumLink}>
                  Ver no site do museu
                </a>

                <div className={styles.actions}>
                  {inExhibition ? (
                    <Button variant="outline" onClick={() => toggle(artwork)}>
                      Remover da exposição
                    </Button>
                  ) : (
                    <Button variant="primary" icon="arrow" onClick={() => toggle(artwork)}>
                      Adicionar à minha exposição
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ArtworkModal
