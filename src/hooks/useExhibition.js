import { useContext } from 'react'
import { ExhibitionContext } from '../context/exhibitionContext.js'

export function useExhibition() {
  const context = useContext(ExhibitionContext)
  if (!context) {
    throw new Error('useExhibition precisa ser usado dentro de um ExhibitionProvider')
  }
  return context
}
