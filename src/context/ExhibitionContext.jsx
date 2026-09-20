import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExhibitionContext } from './exhibitionContext.js'
import { getImageAlt } from '../utils/formatters.js'

const STORAGE_KEY = 'vernissage:exhibition'

function isValidItem(item) {
  return Boolean(item) && Number.isInteger(item.id) && typeof item.title === 'string'
}

// mantém só a primeira ocorrência de cada id
function dedupeById(items) {
  const seenIds = new Set()
  return items.filter((item) => {
    if (seenIds.has(item.id)) return false
    seenIds.add(item.id)
    return true
  })
}

// lê e valida o localStorage uma única vez; conteúdo corrompido ou fora do formato esperado é ignorado
function readStoredExhibition() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { title: '', items: [] }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { title: '', items: [] }

    return {
      title: typeof parsed.title === 'string' ? parsed.title : '',
      items: Array.isArray(parsed.items) ? dedupeById(parsed.items.filter(isValidItem)) : [],
    }
  } catch {
    return { title: '', items: [] }
  }
}

export function ExhibitionProvider({ children }) {
  const [initial] = useState(readStoredExhibition)
  const [title, setTitle] = useState(initial.title)
  const [items, setItems] = useState(initial.items)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ title, items }))
    } catch {
      // localStorage indisponível (modo privado, cota excedida etc.): a exposição segue funcionando em memória
    }
  }, [title, items])

  const toggle = useCallback((artwork) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === artwork.id)) {
        return prev.filter((item) => item.id !== artwork.id)
      }
      const { id, title: artworkTitle, artist_title: artistTitle, date_display: dateDisplay, image_id: imageId } = artwork
      return [
        ...prev,
        {
          id,
          title: artworkTitle,
          artist_title: artistTitle,
          date_display: dateDisplay,
          image_id: imageId,
          alt: getImageAlt(artwork),
        },
      ]
    })
  }, [])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const isInExhibition = useCallback((id) => items.some((item) => item.id === id), [items])

  const value = useMemo(
    () => ({ title, items, count: items.length, toggle, remove, clear, setTitle, isInExhibition }),
    [title, items, toggle, remove, clear, isInExhibition],
  )

  return <ExhibitionContext.Provider value={value}>{children}</ExhibitionContext.Provider>
}
