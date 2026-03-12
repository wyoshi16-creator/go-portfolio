'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const solutions = [
  {
    number: '01',
    label: '転用',
    title: 'デジタルフォトフレームを動画端末へ',
    body: '汎用部品で構成されたデジタルフォトフレームをMP4専用再生端末に変更。モバイルバッテリー内蔵でケーブルレス化。ブック型筐体を中国ネットワークから調達し、医療現場にふさわしい質感を実現した。'
  },
  {
    number: '02',
    label: '統合',
    title: 'SDカード1枚で全新薬に対応する仕組み',
    body: 'MRが定期訪問のたびにSDカードを差し込むだけでUIと動画が書き換わるシステムを設計。プログラムで鍵をかけ流用不可とした。端末は「特定薬品のツール」から「情報インターフェイスの基盤」へ変わった。'
  },
  {
    number: '03',
    label: '拡張',
    title: '複数薬品の予算を束ねる構造を設計',
    body: '単一薬品の予算では開発が成立しない制約を逆手に取り、「全新薬のプラットフォーム」として複数部門の予算を統合。開発原資を構造的に生み出した。'
  }
]

function SolutionCard({ solution, index }: { solution: typeof solutions[0], index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })

  return (
    <motion.div
      ref={ref}
      className="border border-white/10 p-8 cursor-default"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.25)' }}
    >
      <div className="flex items-start justify-between mb-6">
        <p className="text-xs text-white/20 tracking-widest">{solution.number}</p>
        <span className="text-xs text-white/30 border border-white/10 px-2 py-1">
          {solution.label}
        </span>
      </div>
      <h3 className="text-lg font-light mb-4 leading-snug">{solution.title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{solution.body}</p>
    </motion.div>
  )
}

export default function SolutionSection() {
  const imageRef = useRef(null)
  const imageInView = useInView(imageRef, { once: true })

  return (
    <section className="px-8 md:px-16 py-32 bg-white/[0.02]">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-xs tracking-[0.3em] text-white/20 uppercase mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Solution Design
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          {/* 左：ソリューションカード */}
          <div className="flex flex-col gap-6">
            {solutions.map((s, i) => (
              <SolutionCard key={s.number} solution={s} index={i} />
            ))}
          </div>

          {/* 右：端末レンダリング画像（プレースホルダー） */}
          <motion.div
            ref={imageRef}
            className="flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={imageInView ? { opacity: 1 } : {}}
            transition={{ duration: 1.0, delay: 0.3 }}
          >
            <div className="w-full aspect-square bg-white/5 border border-white/10 flex items-center justify-center">
              <p className="text-white/20 text-xs">render-device.png</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
