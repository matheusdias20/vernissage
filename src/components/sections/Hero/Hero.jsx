import { useEffect, useRef, useState } from 'react'
import { getRandomArtworks } from '../../../services/artApi.js'
import { formatArtist, formatDate, formatField, getImageAlt } from '../../../utils/formatters.js'
import Button from '../../ui/Button/Button'
import ErrorMessage from '../../ui/ErrorMessage/ErrorMessage'
import SearchBar from '../../filters/SearchBar/SearchBar'
import styles from './Hero.module.css'

// reserva o espaço da imagem com a proporção real, quando conhecida
function imageAspectRatio(artwork) {
  return artwork.imageWidth && artwork.imageHeight ? `${artwork.imageWidth} / ${artwork.imageHeight}` : undefined
}

function Hero({ onSearch, onOpenArtwork }) {
  const [searchText, setSearchText] = useState('')
  const [mainArtwork, setMainArtwork] = useState(null)
  const [smallArtwork, setSmallArtwork] = useState(null)
  const [error, setError] = useState(null)
  const [resolvedKey, setResolvedKey] = useState(null)
  const [retryToken, setRetryToken] = useState(0)
  const [surpriseLoading, setSurpriseLoading] = useState(false)
  const surpriseControllerRef = useRef(null)

  // cancela a busca de "Surpreenda-me" em andamento se o Hero desmontar
  useEffect(() => {
    return () => surpriseControllerRef.current?.abort()
  }, [])

  // loading é derivado: verdadeiro até a busca do retryToken atual ser resolvida
  const loading = resolvedKey !== retryToken

  useEffect(() => {
    const key = retryToken
    const controller = new AbortController()

    getRandomArtworks({ count: 2, signal: controller.signal })
      .then(([main, small]) => {
        if (controller.signal.aborted) return
        setMainArtwork(main ?? null)
        setSmallArtwork(small ?? null)
        setError(null)
        setResolvedKey(key)
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return
        setError(err.message)
        setResolvedKey(key)
      })

    return () => controller.abort()
  }, [retryToken])

  function handleRetry() {
    setRetryToken((token) => token + 1)
  }

  const captionText = mainArtwork
    ? `${formatField(mainArtwork.title)}, ${formatArtist(mainArtwork.artist)}, ${formatDate(mainArtwork.date)}`
    : ''

  async function handleSurprise() {
    // cancela o clique anterior ainda em andamento, para o último clique sempre vencer
    surpriseControllerRef.current?.abort()
    const controller = new AbortController()
    surpriseControllerRef.current = controller

    setSurpriseLoading(true)
    try {
      const [artwork] = await getRandomArtworks({ count: 1, signal: controller.signal })
      if (controller.signal.aborted) return
      if (artwork) {
        setMainArtwork(artwork)
        onOpenArtwork(artwork.id)
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      // mantém a obra principal atual se a nova busca aleatória falhar
    } finally {
      if (!controller.signal.aborted) setSurpriseLoading(false)
    }
  }

  return (
    <section id="topo" className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <h1 className={styles.title}>Explore um dos maiores museus do mundo e monte a sua exposição</h1>

        {smallArtwork && (
          <div className={styles.small}>
            <img
              src={smallArtwork.imageUrl}
              alt={getImageAlt(smallArtwork)}
              className={styles.smallImage}
              style={{ aspectRatio: imageAspectRatio(smallArtwork) }}
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        <div className={styles.search}>
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            onSubmit={onSearch}
            placeholder="Buscar por artista, título ou tema (em inglês)"
            variant="dark"
          />
          <p className={styles.hint}>Dica: o acervo é em inglês. Experimente: Monet, landscape, portrait.</p>
        </div>

        <div className={styles.main}>
          {loading && <div className={styles.skeleton} aria-hidden="true" />}

          {!loading && error && (
            <div className={styles.errorCard}>
              <ErrorMessage message={error} onRetry={handleRetry} inverted />
            </div>
          )}

          {!loading && !error && mainArtwork && (
            <>
              <button type="button" className={styles.mainButton} onClick={() => onOpenArtwork(mainArtwork.id)}>
                <img
                  src={mainArtwork.imageUrl}
                  alt={getImageAlt(mainArtwork)}
                  className={styles.mainImage}
                  style={{ aspectRatio: imageAspectRatio(mainArtwork) }}
                  decoding="async"
                />
              </button>
              <p className={styles.caption} title={captionText}>
                {captionText}
              </p>
            </>
          )}
        </div>

        <div className={styles.text}>
          <p className={styles.lead}>Explore o acervo do Cleveland Museum of Art e monte a sua própria exposição.</p>
          <Button variant="primary" inverted icon="arrow" onClick={handleSurprise} disabled={surpriseLoading}>
            Surpreenda-me
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Hero
