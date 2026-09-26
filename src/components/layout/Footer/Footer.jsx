import styles from './Footer.module.css'

const NAV_LINKS = [
  { href: '#temas', label: 'Explorar' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#exposicao', label: 'Exposição' },
]

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandColumn}>
          <img src="/vernissage-wordmark-claro.svg" alt="Vernissage" className={styles.brandImage} />
          <p className={styles.tagline}>Explore o acervo do Cleveland Museum of Art e monte a sua própria exposição.</p>
        </div>

        <div className={styles.column}>
          <p className={styles.columnTitle}>Navegação</p>
          <ul className={styles.linkList}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.link}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.column}>
          <p className={styles.columnTitle}>Sobre os dados</p>
          <ul className={styles.linkList}>
            <li>
              <a
                href="https://www.clevelandart.org"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Cleveland Museum of Art
              </a>
            </li>
            <li>
              <a
                href="https://openaccess-api.clevelandart.org"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                API aberta
              </a>
            </li>
          </ul>
          <p className={styles.note}>Dados e imagens em domínio público (CC0), cortesia do Cleveland Museum of Art.</p>
        </div>
      </div>

      <div className={`container ${styles.bottomRow}`}>
        <span>Projeto acadêmico</span>
        <a
          href="https://github.com/matheusdias20/vernissage"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          GitHub
        </a>
        <span>Feito com React + Vite</span>
      </div>
    </footer>
  )
}

export default Footer
