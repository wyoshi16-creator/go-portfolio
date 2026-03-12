'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const insights = [
  {
    number: '01',
    title: '医師の負荷',
    body: '新薬導入に伴う患者説明の手間を、医師は本質的に嫌っていた。薬品の優位性より、「説明しなくて済む」設計が刺さる。'
  },
  {
    number: '02',
    title: 'MRのUSP不在',
    body: '外資系・新規参入ゆえに競合との差別化根拠が薄かった。営業トークではなく、「見せるだけでいい武器」が必要だった。'
  },
  {
    number: '03',
    title: '予算の構造的制約',
    body: '特定薬品に割ける販促予算は限られていた。単品で閉じる設計では成立しない。複数薬品の予算を束ねる仕組みが必要だった。'
  }
]

function InsightCard({ insight, index }: { insight: typeof insights[0], index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })

  return (
    <motion.div
      ref={ref}
      className="border-l border-white/10 pl-8 py-6 mb-16"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15 }}
    >
      <p className="text-xs text-white/20 tracking-widest mb-3">{insight.number}</p>
      <h3 className="text-xl font-light mb-4">{insight.title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{insight.body}</p>
    </motion.div>
  )
}

export default function ProblemSection() {
  return (
    <section className="px-8 md:px-16 py-32">
      <div className="max-w-5xl mx-auto">
        {/* セクションラベル */}
        <motion.p
          className="text-xs tracking-[0.3em] text-white/20 uppercase mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Problem Definition
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* 左：表面の依頼（sticky） */}
          <div className="md:sticky md:top-32 md:h-fit">
            <p className="text-xs text-white/20 tracking-widest mb-4 uppercase">Surface Request</p>
            <p className="text-3xl font-light leading-snug mb-6 text-white/40">
              MRのセールスを<br />強化する<br />ノベルティが欲しい
            </p>
            <p className="text-xs text-white/20 border border-white/10 inline-block px-3 py-1">
              予算：数百万円
            </p>
          </div>

          {/* 右：インサイト3つ */}
          <div className="pt-2">
            <p className="text-xs text-white/20 tracking-widest mb-12 uppercase">
              Insights Behind the Brief
            </p>
            {insights.map((insight, i) => (
              <InsightCard key={insight.number} insight={insight} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
