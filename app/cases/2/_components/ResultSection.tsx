'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const step = target / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else { setCount(Math.floor(start)) }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [trigger, target, duration])
  return count
}

function ResultMetric({ value, unit, suffix, label, sub, delay, duration }:
  { value: number, unit: string, suffix: string, label: string, sub: string, delay: number, duration: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(value, duration, inView)

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
    >
      <p className="text-xs text-white/20 mb-2">{suffix}</p>
      <p className="text-6xl md:text-8xl font-thin tracking-tighter">
        {count}
        <span className="text-3xl md:text-4xl text-white/40 ml-1">{unit}</span>
      </p>
      <p className="text-sm text-white/50 mt-4 mb-2">{label}</p>
      <p className="text-xs text-white/20">{sub}</p>
    </motion.div>
  )
}

export default function ResultSection() {
  return (
    <section className="px-8 md:px-16 py-32">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-xs tracking-[0.3em] text-white/20 uppercase mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Outcome
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          <ResultMetric value={4} unit="倍" suffix="" label="初回納品からの増産倍率" sub="半年後に4倍の増産依頼を獲得" delay={0} duration={1.5} />
          <ResultMetric value={5} unit="億円" suffix="累計" label="累計売上（社内最高水準）" sub="数百万の提案依頼からの転換" delay={0.2} duration={2.0} />
          <ResultMetric value={1} unit="人" suffix="" label="担当人数" sub="企画・製造管理・UIデザイン全工程" delay={0.4} duration={0.5} />
        </div>
      </div>
    </section>
  )
}
