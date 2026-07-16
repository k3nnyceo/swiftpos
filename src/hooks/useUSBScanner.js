import { useEffect, useRef } from 'react'

export default function useUSBScanner(onScan, enabled = true) {
  const buffer  = useRef('')
  const timer   = useRef(null)
  const lastKey = useRef(Date.now())

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e) {
      const tag = e.target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return

      const now = Date.now()
      const gap = now - lastKey.current
      lastKey.current = now

      if (gap > 100 && buffer.current.length > 0) buffer.current = ''

      if (e.key === 'Enter') {
        const code = buffer.current.trim()
        if (code.length >= 4) onScan(code)
        buffer.current = ''
        return
      }

      if (e.key.length === 1) buffer.current += e.key

      clearTimeout(timer.current)
      timer.current = setTimeout(() => { buffer.current = '' }, 500)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer.current)
    }
  }, [onScan, enabled])
}
