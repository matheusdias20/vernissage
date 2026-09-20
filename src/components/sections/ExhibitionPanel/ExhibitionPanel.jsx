import { useEffect, useId, useRef, useState } from 'react'
import { useExhibition } from '../../../hooks/useExhibition.js'
import { formatArtist, formatDate, formatField } from '../../../utils/formatters.js'
import SectionHeader from '../../ui/SectionHeader/SectionHeader'
import Button from '../../ui/Button/Button'
import ExhibitionItem from './ExhibitionItem.jsx'
import styles from './ExhibitionPanel.module.css'

const TITLE_MAX_LENGTH = 80
const SHARE_MESSAGE_DURATION = 2000

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

function scrollToGallery() {
  document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' })
}

function buildShareText(title, items) {
  const heading = title.trim() ? title.trim() : 'Minha exposição'
  const lines = items.map(
    (item, index) => `${index + 1}. ${formatField(item.title)}, ${formatArtist(item.artist)}, ${formatDate(item.date)}`,
  )
  return [heading, ...lines, 'Montada no Vernissage'].join('\n')
}

function ExhibitionPanel({ onOpenArtwork }) {
  const { title, items, count, setTitle, remove, clear } = useExhibition()
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [shareMessage, setShareMessage] = useState('')

  const titleInputId = useId()
  const confirmRef = useRef(null)
  const shareTimeoutRef = useRef(null)

  useEffect(() => {
    // Button não repassa ref para o <button>; busca o primeiro botão do bloco de confirmação
    if (confirmingClear) confirmRef.current?.querySelector('button')?.focus()
  }, [confirmingClear])

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current)
    }
  }, [])

  function handleAskClear() {
    setConfirmingClear(true)
  }

  function handleCancelClear() {
    setConfirmingClear(false)
  }

  function handleConfirmClear() {
    clear()
    setConfirmingClear(false)
  }

  function showShareMessage(message) {
    setShareMessage(message)
    if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current)
    shareTimeoutRef.current = setTimeout(() => setShareMessage(''), SHARE_MESSAGE_DURATION)
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(buildShareText(title, items))
      showShareMessage('Copiado!')
    } catch {
      showShareMessage('Não foi possível copiar.')
    }
  }

  return (
    <section id="exposicao" className={styles.section}>
      <div className="container">
        <SectionHeader eyebrow="Sua curadoria" title="Minha exposição" />

        {count === 0 ? (
          <div className={styles.empty}>
            <FrameIcon />
            <p className={styles.emptyTitle}>Sua exposição ainda está vazia</p>
            <p className={styles.emptyMessage}>Clique no coração de uma obra para começar</p>
            <Button variant="primary" icon="arrow" onClick={scrollToGallery}>
              Explorar a galeria
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.titleField}>
              <label htmlFor={titleInputId} className={styles.titleLabel}>
                Título da exposição
              </label>
              <input
                id={titleInputId}
                type="text"
                className={styles.titleInput}
                value={title}
                onChange={(event) => setTitle(event.target.value.slice(0, TITLE_MAX_LENGTH))}
                placeholder="Dê um nome à sua exposição..."
                maxLength={TITLE_MAX_LENGTH}
              />
            </div>

            <div className={styles.items}>
              {items.map((item) => (
                <ExhibitionItem key={item.id} item={item} onOpen={onOpenArtwork} onRemove={remove} />
              ))}
            </div>

            <div className={styles.footer}>
              <p className={styles.count}>{count === 1 ? '1 obra' : `${count} obras`}</p>

              {confirmingClear ? (
                <div className={styles.confirm} ref={confirmRef}>
                  <span className={styles.confirmMessage}>Limpar toda a exposição?</span>
                  <Button variant="outline" onClick={handleConfirmClear}>
                    Confirmar
                  </Button>
                  <Button variant="outline" onClick={handleCancelClear}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className={styles.actions}>
                  <Button variant="outline" onClick={handleAskClear}>
                    Limpar exposição
                  </Button>
                  <Button variant="primary" icon="arrow" onClick={handleShare}>
                    Compartilhar
                  </Button>
                </div>
              )}
            </div>

            <p className={styles.liveRegion} role="status" aria-live="polite">
              {shareMessage}
            </p>
          </>
        )}
      </div>
    </section>
  )
}

export default ExhibitionPanel
