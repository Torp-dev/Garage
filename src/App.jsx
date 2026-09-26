import { useEffect, useRef, useState } from 'react'

const LOCATIONS = [
  'Shop 12, MG Road, Pune, Maharashtra 411001',
  'Plot 45, MIDC Industrial Area, Chakan, Pune 410501',
  '88 Garage Lane, Andheri West, Mumbai 400053',
  '23 Motor Nagar, Pimpri, Pune 411018',
]

const LUX_BRANDS = [
  { name: 'Rolls-Royce', logo: '/logos/rolls-royce.svg' },
  { name: 'Bentley', logo: '/logos/bentley.svg' },
  { name: 'Ferrari', logo: '/logos/ferrari.svg' },
  { name: 'Lamborghini', logo: '/logos/lamborghini.svg' },
  { name: 'Porsche', logo: '/logos/porsche.svg' },
  { name: 'Maserati', logo: '/logos/maserati.svg' },
  { name: 'Aston Martin', logo: '/logos/aston-martin.svg' },
  { name: 'Bugatti', logo: '/logos/bugatti.svg' },
  { name: 'McLaren', logo: '/logos/mclaren.svg' },
  { name: 'Jaguar', logo: '/logos/jaguar.svg' },
  { name: 'Land Rover', logo: '/logos/land-rover.svg' },
  { name: 'Mercedes-Benz', logo: '/logos/mercedes-benz.svg' },
  { name: 'BMW', logo: '/logos/bmw.svg' },
  { name: 'Audi', logo: '/logos/audi.svg' },
  { name: 'Lexus', logo: '/logos/lexus.svg' },
]

const mono = (brand) =>
  brand
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const pad = (n) => String(n).padStart(2, '0')
const dateKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const DAYPARTS = [
  { label: 'Morning', times: ['09:00', '10:30'] },
  { label: 'Noon', times: ['12:00', '13:30'] },
  { label: 'Evening', times: ['16:00', '17:30'] },
  { label: 'Night', times: ['18:30', '19:30', '20:30'] },
]

const hashStr = (s) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const bookedFor = (y, m, d) => {
  const dt = new Date(y, m, d)
  if (dt.getDay() === 0) return []
  let seed = hashStr(dateKey(y, m, d))
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  const all = DAYPARTS.flatMap((p) => p.times)
  const n = 2 + Math.floor(rnd() * 3)
  const picked = new Set()
  while (picked.size < n) picked.add(all[Math.floor(rnd() * all.length)])
  return [...picked]
}

const availableFor = (y, m, d) => {
  const open = slotsFor(y, m, d)
  if (!open.length) return []
  const booked = new Set(bookedFor(y, m, d))
  return open.filter((t) => !booked.has(t))
}

const slotsFor = (y, m, d) => {
  const dt = new Date(y, m, d)
  if (dt.getDay() === 0) return []
  const all = DAYPARTS.flatMap((p) => p.times)
  const now = new Date()
  if (dt.toDateString() === now.toDateString()) {
    return all.filter((t) => {
      const [hh, mi] = t.split(':').map(Number)
      return new Date(y, m, d, hh, mi) > now
    })
  }
  return all
}

const earliestSlot = () => {
  const now = new Date()
  for (let i = 0; i < 14; i++) {
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    const slots = availableFor(dt.getFullYear(), dt.getMonth(), dt.getDate())
    if (slots.length) {
      return {
        y: dt.getFullYear(),
        m: dt.getMonth(),
        d: dt.getDate(),
        key: dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate()),
        time: slots[0],
      }
    }
  }
  return null
}

const prettyKey = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const ICONS = {
  oil: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16l-6.5 7.5V19l-3 2v-9.5L4 4Z" />
    </svg>
  ),
  brake: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="5.8" r="0.6" fill="currentColor" />
      <circle cx="18.2" cy="12" r="0.6" fill="currentColor" />
      <circle cx="12" cy="18.2" r="0.6" fill="currentColor" />
      <circle cx="5.8" cy="12" r="0.6" fill="currentColor" />
    </svg>
  ),
  battery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="8" width="16" height="9" rx="2" />
      <path d="M22.5 11v3" />
      <path d="M10.5 10.8v3.4M8.8 12.5h3.4" />
    </svg>
  ),
  ac: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M5 7.5l14 9M19 7.5l-14 9" />
      <path d="M12 3L10 5.5M12 3l2 2.5M12 21l-2-2.5M12 21l2-2.5" />
    </svg>
  ),
}

const SERVICES = [
  { name: 'Oil Change', desc: 'Engine oil + oil filter replacement', price: 89, icon: ICONS.oil },
  { name: 'Filter Change', desc: 'Air filter + cabin filter replacement', price: 39, icon: ICONS.filter },
  { name: 'Brake Service', desc: 'Brake pads, discs check & service', price: 149, icon: ICONS.brake },
  { name: 'Battery Check', desc: 'Battery health test & terminal cleaning', price: 29, icon: ICONS.battery },
  { name: 'AC Service', desc: 'AC cooling check + gas refill', price: 119, icon: ICONS.ac },
]

function App() {
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [entered, setEntered] = useState(false)
  const [started, setStarted] = useState(false)
  const [service, setService] = useState(null)
  const [slot, setSlot] = useState(null)
  const [calYM, setCalYM] = useState(() => {
    const n = new Date()
    return { y: n.getFullYear(), m: n.getMonth() }
  })
  const [day, setDay] = useState(null)
  const [timeSel, setTimeSel] = useState(null)
  const ready = name.trim() !== '' && phone.trim() !== ''
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef(null)
  const drag = useRef({ active: false, startA: 0, startR: 0, moved: false })
  const samples = useRef([])
  const spinRaf = useRef(0)
  const audioCtx = useRef(null)
  const tickTock = useRef(false)
  const firstTick = useRef(true)
  const lastTickT = useRef(0)
  const [logoOk, setLogoOk] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const activeIndex =
    Math.floor((((rotation % 360) + 360) % 360) / (360 / LUX_BRANDS.length)) %
    LUX_BRANDS.length

  const ensureAudio = () => {
    if (!audioCtx.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (Ctx) audioCtx.current = new Ctx()
    }
    if (audioCtx.current && audioCtx.current.state === 'suspended') {
      audioCtx.current.resume()
    }
    return audioCtx.current
  }

  const playTick = () => {
    const ctx = ensureAudio()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    tickTock.current = !tickTock.current
    osc.type = 'square'
    osc.frequency.value = tickTock.current ? 2200 : 1750
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.06)
  }

  const shiftService = (dir) => {
    setSelectedIdx((cur) => {
      const n = Math.min(SERVICES.length - 1, Math.max(0, cur + dir))
      if (n !== cur) playTick()
      return n
    })
  }

  const pickService = (i) => {
    if (i !== selectedIdx) playTick()
    setSelectedIdx(i)
  }

  useEffect(() => {
    setLogoOk(true)
  }, [activeIndex])

  useEffect(() => {
    if (firstTick.current) {
      firstTick.current = false
      return
    }
    const now = performance.now()
    if (now - lastTickT.current < 40) return
    lastTickT.current = now
    playTick()
  }, [activeIndex])

  const pointerAngle = (x, y) => {
    const rect = wheelRef.current.getBoundingClientRect()
    return (
      (Math.atan2(
        y - (rect.top + rect.height / 2),
        x - (rect.left + rect.width / 2),
      ) *
        180) /
      Math.PI
    )
  }

  const onWheelDown = (e) => {
    cancelAnimationFrame(spinRaf.current)
    ensureAudio()
    samples.current = []
    drag.current = {
      active: true,
      startA: pointerAngle(e.clientX, e.clientY),
      startR: rotation,
      moved: false,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onWheelMove = (e) => {
    const d = drag.current
    if (!d.active) return
    const a = pointerAngle(e.clientX, e.clientY)
    const delta = ((a - d.startA + 540) % 360) - 180
    if (Math.abs(delta) > 3) d.moved = true
    const r = d.startR + delta
    setRotation(r)
    samples.current.push({ r, t: performance.now() })
    if (samples.current.length > 6) samples.current.shift()
  }

  const onWheelUp = () => {
    const d = drag.current
    if (!d.active) return
    d.active = false
    const s = samples.current
    if (s.length >= 2) {
      const first = s[0]
      const last = s[s.length - 1]
      const dt = (last.t - first.t) / 1000
      const vel = dt > 0 ? (last.r - first.r) / dt : 0
      if (Math.abs(vel) > 30) {
        let v = vel
        let r = last.r
        let prev = performance.now()
        const step = (now) => {
          const dtf = (now - prev) / 1000
          prev = now
          r += v * dtf
          v *= Math.exp(-2.5 * dtf)
          if (Math.abs(v) < 8) {
            setRotation(((r % 360) + 360) % 360)
            return
          }
          setRotation(r)
          spinRaf.current = requestAnimationFrame(step)
        }
        spinRaf.current = requestAnimationFrame(step)
      }
    }
  }

  if (!started) {
    return (
      <div className="intro">
        <div className="intro-body">
          <h1>Riya Auto Repair</h1>
          <p>Premium car care &amp; service</p>
        </div>
        <div className="intro-foot">
          <button
            className="book-btn intro-btn"
            type="button"
            onClick={() => setStarted(true)}
          >
            Book Service
          </button>
        </div>
      </div>
    )
  }

  if (!entered) {
    return (
      <div className="landing">
        <div className="landing-text">
          <p className="landing-label">Choose your vehicle</p>
        </div>
        <div className="landing-wheel">
          <div
            className="wheel"
            ref={wheelRef}
            onPointerDown={onWheelDown}
            onPointerMove={onWheelMove}
            onPointerUp={onWheelUp}
            onPointerCancel={onWheelUp}
            onClick={() => {
              if (!drag.current.moved) setEntered(true)
            }}
          >
          <div className="tyre" />
          <div className="sidewall" />
          <div className="rim" />
          <div className="well" />
          <div
            className="spokes"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="spoke"
                style={{ transform: `rotate(${i * 72}deg)` }}
              >
                <span className="spoke-line" />
              </div>
            ))}
          </div>
          <div className="brand-cap">
            {logoOk ? (
              <img
                className="brand-logo"
                src={LUX_BRANDS[activeIndex].logo}
                alt={LUX_BRANDS[activeIndex].name}
                onError={() => setLogoOk(false)}
              />
            ) : (
              <span className="brand-mono">
                {mono(LUX_BRANDS[activeIndex].name)}
              </span>
            )}
          </div>
        </div>
        <button
          className="book-btn"
          type="button"
          onClick={() => setEntered(true)}
        >
          Confirm
        </button>
      </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="services">
        <div className="services-inner">
          <button
            className="back-btn"
            type="button"
            onClick={() => setEntered(false)}
          >
            ← Brands
          </button>
          <h1>Choose a service</h1>
          <p className="services-sub">
            for your {LUX_BRANDS[activeIndex].name}
          </p>
          <div className="services-body">
            <div className="service-list">
              <span
                className="service-indicator"
                style={{ transform: `translateY(${selectedIdx * 96}px)` }}
              />
              {SERVICES.map((s, i) => (
                <button
                  key={s.name}
                  className={
                    i === selectedIdx ? 'service-card active' : 'service-card'
                  }
                  type="button"
                  onClick={() => pickService(i)}
                >
                  <span className="service-icon">{s.icon}</span>
                  <span className="service-info">
                    <strong>{s.name}</strong>
                    <small>{s.desc}</small>
                  </span>
                  <span className="service-price">€{s.price}</span>
                </button>
              ))}
            </div>
            <div className="shifter">
              <div className="shifter-display">{selectedIdx + 1}</div>
              <button
                className="shifter-btn"
                type="button"
                aria-label="Next service"
                onClick={() => shiftService(1)}
              >
                +
              </button>
              <div className="shifter-gate">
                {[0, 1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className="gate-notch"
                    style={{ top: `${17 + n * 41}px` }}
                  >
                    {n + 1}
                  </span>
                ))}
                <span
                  className="shifter-knob"
                  style={{ top: `${12 + selectedIdx * 41}px` }}
                />
              </div>
              <button
                className="shifter-btn"
                type="button"
                aria-label="Previous service"
                onClick={() => shiftService(-1)}
              >
                −
              </button>
            </div>
          </div>
          <button
            className="book-btn services-confirm"
            type="button"
            onClick={() => setService(SERVICES[selectedIdx])}
          >
            Confirm Service
          </button>
        </div>
      </div>
    )
  }

  if (!slot) {
    const now = new Date()
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const { y: cy, m: cm } = calYM
    const offset = (new Date(cy, cm, 1).getDay() + 6) % 7
    const daysInMonth = new Date(cy, cm + 1, 0).getDate()
    const atMin = cy === now.getFullYear() && cm === now.getMonth()
    const selKey = day ? dateKey(cy, cm, day) : null
    const daySlots = day ? availableFor(cy, cm, day) : []
    const bookedSlots = day
      ? bookedFor(cy, cm, day).filter((t) => {
          const [hh, mi] = t.split(':').map(Number)
          return new Date(cy, cm, day, hh, mi) > new Date()
        })
      : []
    const earliest = earliestSlot()
    const pickDay = (d) => {
      setDay(d)
      setTimeSel(null)
    }

    return (
      <div className="services appt">
        <div className="services-inner appt-inner">
          <button
            className="back-btn"
            type="button"
            onClick={() => setService(null)}
          >
            ← Services
          </button>
          <h1>Book an appointment</h1>
          <p className="services-sub">
            {LUX_BRANDS[activeIndex].name} · {service.name}
          </p>
          <div className="dash-readout">
            <span>{selKey ? prettyKey(selKey) : '— SELECT DAY —'}</span>
            <span>{day ? `${daySlots.length} SLOTS` : '···'}</span>
          </div>
          <div className="appt-grid">
          <div className="cal-card">
            <div className="cal-head">
              <button
                className="cal-nav"
                type="button"
                aria-label="Previous month"
                disabled={atMin}
                onClick={() =>
                  setCalYM(
                    cm === 0 ? { y: cy - 1, m: 11 } : { y: cy, m: cm - 1 },
                  )
                }
              >
                ‹
              </button>
              <strong>
                {MONTHS[cm]} {cy}
              </strong>
              <button
                className="cal-nav"
                type="button"
                aria-label="Next month"
                onClick={() =>
                  setCalYM(
                    cm === 11 ? { y: cy + 1, m: 0 } : { y: cy, m: cm + 1 },
                  )
                }
              >
                ›
              </button>
            </div>
            <div className="cal-grid">
              {DOW.map((d) => (
                <span key={d} className="cal-dow">
                  {d}
                </span>
              ))}
              {Array.from({ length: offset }).map((_, i) => (
                <span key={`b${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1
                const isPast = new Date(cy, cm, d) < startToday
                const isSun = new Date(cy, cm, d).getDay() === 0
                const isToday = new Date(cy, cm, d).getTime() === startToday.getTime()
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={isPast || isSun}
                    title={isSun ? 'Closed on Sundays' : undefined}
                    className={
                      'cal-day' +
                      (isToday ? ' today' : '') +
                      (day === d ? ' sel' : '')
                    }
                    onClick={() => pickDay(d)}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="times-panel">
          {earliest && (
            <button
              className="earliest"
              type="button"
              onClick={() => {
                setCalYM({ y: earliest.y, m: earliest.m })
                setDay(earliest.d)
                setTimeSel(earliest.time)
              }}
            >
              <span>Earliest available</span>
              <strong>
                {prettyKey(earliest.key)} · {earliest.time}
              </strong>
            </button>
          )}
          {day ? (
            daySlots.length ? (
              DAYPARTS.map((part) => {
                const open = part.times.filter((t) => daySlots.includes(t))
                const taken = part.times.filter((t) => bookedSlots.includes(t))
                if (!open.length && !taken.length) return null
                return (
                  <div key={part.label} className="daypart">
                    <p className="daypart-label">{part.label}</p>
                    <div className="slots">
                      {open.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={
                            t === timeSel ? 'slot-chip sel' : 'slot-chip'
                          }
                          onClick={() => setTimeSel(t)}
                        >
                          {t}
                        </button>
                      ))}
                      {taken.map((t) => (
                        <button
                          key={t}
                          type="button"
                          disabled
                          title="Already booked"
                          className="slot-chip booked"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="closed-note">
                Closed on Sundays — please pick another day.
              </p>
            )
          ) : (
            <p className="slots-hint">Select a day to see available times</p>
          )}
          </div>
          </div>
          {selKey && timeSel && daySlots.includes(timeSel) && (
            <button
              className="book-btn services-confirm"
              type="button"
              onClick={() => setSlot({ key: selKey, time: timeSel })}
            >
              Confirm Appointment
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="left">
        <h1>Riya Auto Repair</h1>
        <p>{location}</p>
      </div>
      <div className="right">
        <button
          className="back-btn"
          type="button"
          onClick={() => setSlot(null)}
        >
          ← Appointment
        </button>
        <div className="book-card">
        <div className="selected-car">
          {logoOk && (
            <img src={LUX_BRANDS[activeIndex].logo} alt="" />
          )}
          <span>{LUX_BRANDS[activeIndex].name}</span>
        </div>
        <div className="selected-service">
          <span>{service.name}</span>
          <strong>€{service.price}</strong>
        </div>
        <div className="selected-service">
          <span>
            {prettyKey(slot.key)} · {slot.time}
          </span>
        </div>
        <div className="plate">
          <div className="plate-eu">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <defs>
                <path
                  id="eu-star"
                  d="M0,-3.2 L0.717,-0.987 L3.043,-0.989 L1.161,0.377 L1.881,2.589 L0,1.22 L-1.881,2.589 L-1.161,0.377 L-3.043,-0.989 L-0.717,-0.987 Z"
                />
              </defs>
              {[...Array(12)].map((_, i) => (
                <use
                  key={i}
                  href="#eu-star"
                  transform={`rotate(${i * 30} 20 20) translate(20 7)`}
                  fill="#FFDD00"
                />
              ))}
            </svg>
            <span>EU</span>
          </div>
          <span
            className={name.trim() === '' ? 'plate-text empty' : 'plate-text'}
          >
            {name.trim() === '' ? 'Your Name' : name}
          </span>
        </div>
        <label className="field">
          <span>Your name</span>
          <input
            className="line-input"
            type="text"
            placeholder="e.g. Alex Morgan"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Phone number</span>
          <input
            className="line-input"
            type="tel"
            placeholder="+49 170 000 000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        {ready && (
          <button
            className="book-btn"
            type="button"
            onClick={() => setShowConfirm(true)}
          >
            Confirm Booking
          </button>
        )}
        </div>
      </div>
      {showConfirm && (
        <div className="overlay" onClick={() => setShowConfirm(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <div className="card-check">✓</div>
            <h2>Booking Confirmed</h2>
            <p className="card-shop">Riya Auto Repair</p>
            <div className="card-row">
              <span>Name</span>
              <strong>{name}</strong>
            </div>
            <div className="card-row">
              <span>Phone</span>
              <strong>{phone}</strong>
            </div>
            <div className="card-row">
              <span>When</span>
              <strong>
                {prettyKey(slot.key)} · {slot.time}
              </strong>
            </div>
            <div className="card-row">
              <span>Service</span>
              <strong>
                {service.name} · €{service.price}
              </strong>
            </div>
            <div className="card-row">
              <span>Shop</span>
              <strong>{location}</strong>
            </div>
            <button
              className="book-btn"
              type="button"
              onClick={() => setShowConfirm(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
