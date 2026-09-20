import { useRef } from 'react'
import { THEMES } from '../../../constants/themes.js'
import SectionHeader from '../../ui/SectionHeader/SectionHeader'
import ThemeCard from '../ThemeCard/ThemeCard'
import styles from './ThemeCarousel.module.css'

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

function ThemeCarousel({ onSelectTheme }) {
  const trackRef = useRef(null)

  function scroll(direction) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section id="temas" className={styles.section}>
      <div className="container">
        <div className={styles.headerRow}>
          <SectionHeader eyebrow="Descubra por tema" title="Explorar por tema" />
          <div className={styles.arrows}>
            <button type="button" className={styles.arrowButton} aria-label="Tema anterior" onClick={() => scroll(-1)}>
              <ArrowIcon className={styles.prevIcon} />
            </button>
            <button type="button" className={styles.arrowButton} aria-label="Próximo tema" onClick={() => scroll(1)}>
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.track} ref={trackRef}>
        {THEMES.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} onSelect={onSelectTheme} />
        ))}
      </div>
    </section>
  )
}

export default ThemeCarousel
