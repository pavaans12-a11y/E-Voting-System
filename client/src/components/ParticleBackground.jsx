import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouse = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', (e) => {
      if (e.touches[0]) {
        mouseRef.current.x = e.touches[0].clientX
        mouseRef.current.y = e.touches[0].clientY
      }
    })

    const colors = [
      { r: 212, g: 175, b: 55 },   // gold
      { r: 240, g: 180, b: 41 },   // gold-light
      { r: 61, g: 30, b: 109 },    // plum
      { r: 109, g: 62, b: 181 },   // plum-light
      { r: 13, g: 148, b: 136 },   // emerald
      { r: 21, g: 40, b: 84 },     // midnight
    ]

    const particles = Array.from({ length: 160 }, (_, i) => {
      const c = colors[Math.floor(Math.random() * colors.length)]
      const isOrb = i < 6
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (isOrb ? 0.15 : 0.4),
        vy: (Math.random() - 0.5) * (isOrb ? 0.15 : 0.4),
        r: isOrb ? Math.random() * 30 + 20 : Math.random() * 2.5 + 0.5,
        alpha: isOrb ? Math.random() * 0.06 + 0.02 : Math.random() * 0.5 + 0.15,
        color: c,
        isOrb,
        baseX: Math.random() * canvas.width,
        baseY: Math.random() * canvas.height,
        waveOffset: Math.random() * Math.PI * 2,
        waveSpeed: Math.random() * 0.002 + 0.001,
      }
    })

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // Draw orbs (large glowing circles) first
      particles.filter(p => p.isOrb).forEach(p => {
        p.x += p.vx + Math.sin(time * p.waveSpeed + p.waveOffset) * 0.3
        p.y += p.vy + Math.cos(time * p.waveSpeed + p.waveOffset) * 0.3
        if (p.x < -100) p.x = canvas.width + 100
        if (p.x > canvas.width + 100) p.x = -100
        if (p.y < -100) p.y = canvas.height + 100
        if (p.y > canvas.height + 100) p.y = -100

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2)
        gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha * 0.5})`)
        gradient.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha * 0.15})`)
        gradient.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      // Draw regular particles
      particles.filter(p => !p.isOrb).forEach(p => {
        const dx = mx - p.x
        const dy = my - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        let repelX = 0, repelY = 0
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200 * 0.15
          repelX = -(dx / dist) * force
          repelY = -(dy / dist) * force
        }

        p.x += p.vx + repelX
        p.y += p.vy + repelY
        p.vx += (Math.random() - 0.5) * 0.01
        p.vy += (Math.random() - 0.5) * 0.01
        p.vx = Math.max(-0.6, Math.min(0.6, p.vx))
        p.vy = Math.max(-0.6, Math.min(0.6, p.vy))

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`
        ctx.fill()

        // Glow on larger particles
        if (p.r > 1.5) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha * 0.08})`
          ctx.fill()
        }
      })

      // Connection lines between nearby particles
      const all = particles.filter(p => !p.isOrb)
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          const dx = all[i].x - all[j].x
          const dy = all[i].y - all[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const alpha = 0.08 * (1 - dist / 120)
            if (alpha < 0.005) continue
            ctx.beginPath()
            ctx.moveTo(all[i].x, all[i].y)
            ctx.lineTo(all[j].x, all[j].y)
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Connection lines from particles to nearby orbs
      particles.filter(p => p.isOrb).forEach(orb => {
        particles.filter(p => !p.isOrb).forEach(p => {
          const dx = orb.x - p.x
          const dy = orb.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 180) {
            const alpha = 0.04 * (1 - dist / 180)
            if (alpha < 0.003) return
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(orb.x, orb.y)
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`
            ctx.lineWidth = 0.4
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}
    />
  )
}
