import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PARTICLE_COUNT = 5
const PARTICLE_RADIUS = 16
const BURST_DURATION = 0.7

export default function HeartSaveButton({ saved, onToggleSave, id }) {
  const [justSaved, setJustSaved] = useState(false)
  const prevSaved = useRef(saved)

  useEffect(() => {
    if (!prevSaved.current && saved) {
      setJustSaved(true)
      const t = setTimeout(() => setJustSaved(false), BURST_DURATION * 1000)
      return () => clearTimeout(t)
    }
    prevSaved.current = saved
  }, [saved])

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      onClick={e => { e.stopPropagation(); onToggleSave?.(id) }}
      title={saved ? 'Unsave' : 'Save'}
    >
      {/* Radial burst */}
      <AnimatePresence>
        {justSaved && (
          <motion.div
            key="burst"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0, 0.4, 0] }}
            transition={{ duration: BURST_DURATION, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 16, height: 16,
              marginTop: -8, marginLeft: -8,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--rose) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Particles */}
      <AnimatePresence>
        {justSaved && (
          <motion.div
            key="particles"
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
          >
            {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
              const angle = (i / PARTICLE_COUNT) * 2 * Math.PI
              const r = PARTICLE_RADIUS + Math.random() * 6
              const size = 3 + Math.random() * 2
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0.3, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 0.8 + Math.random() * 0.4, 0],
                    opacity: [0.3, 0.8, 0],
                    x: [0, Math.cos(angle) * r],
                    y: [0, Math.sin(angle) * r * 0.75],
                  }}
                  transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    width: size, height: size,
                    borderRadius: '50%',
                    background: 'var(--rose)',
                    filter: 'blur(0.5px)',
                  }}
                />
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heart SVG */}
      <motion.svg
        width="16" height="16" viewBox="0 0 24 24"
        style={{ flexShrink: 0, position: 'relative' }}
        whileTap={{ scale: 0.85 }}
        animate={{ scale: justSaved ? 1.15 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={saved ? 'var(--rose)' : 'none'}
          stroke={saved ? 'var(--rose)' : 'var(--ghost)'}
          strokeWidth="1.5"
          style={{ transition: 'fill 120ms ease, stroke 120ms ease' }}
        />
      </motion.svg>
    </div>
  )
}
