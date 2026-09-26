import { useEffect, useState, useSyncExternalStore } from 'react'
import { useExhibition } from '../../../hooks/useExhibition.js'
import styles from './Header.module.css'

function subscribeToScroll(callback) {
  window.addEventListener('scroll', callback, { passive: true })
  return () => window.removeEventListener('scroll', callback)
}

function getScrolledSnapshot() {
  return window.scrollY > 0
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M3 6H17M3 10H17M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
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

const NAV_LINKS = [
  { href: '#temas', label: 'Explorar' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#exposicao', label: 'Exposição' },
]

function Header() {
  const { count } = useExhibition()
  const scrolled = useSyncExternalStore(subscribeToScroll, getScrolledSnapshot)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={scrolled ? `${styles.header} ${styles.scrolled}` : styles.header}>
      <div className={`container ${styles.bar}`}>
        <a href="#topo" className={styles.brand}>
          <img src="/vernissage-wordmark.svg" alt="Vernissage" className={styles.brandImage} />
        </a>

        <nav
          id="header-menu"
          className={menuOpen ? `${styles.nav} ${styles.navOpen}` : styles.nav}
          aria-label="Principal"
        >
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href="#exposicao" className={styles.exhibitionLink}>
            <span className={styles.exhibitionLabel}>Minha exposição</span>
            <span>({count})</span>
            <ArrowIcon />
          </a>

          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="header-menu"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
