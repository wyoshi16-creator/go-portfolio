'use client'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-end pb-24 px-8 md:px-16 overflow-hidden">
      {/* 背景画像 */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      >
        <img
          src="/cases/case2/sketch.png"
          alt="端末スケッチ"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </motion.div>

      {/* テキスト */}
      <div className="relative z-10 max-w-3xl">
        <motion.p
          className="text-xs tracking-[0.3em] text-white/40 mb-6 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Case 01
        </motion.p>

        <motion.h1
          className="text-4xl md:text-6xl font-light leading-tight mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          数百万の依頼を、<br />
          <span className="text-white/50">4億円の基盤に変えた。</span>
        </motion.h1>

        <motion.p
          className="text-base md:text-lg text-white/60 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          依頼は、ノベルティグッズだった。<br />
          私は、別の問いを立てた。
        </motion.p>

        <motion.div
          className="flex gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          {['製薬業界', 'BizDev', 'プロダクト設計', '製造ディレクション'].map((tag) => (
            <span key={tag} className="text-xs text-white/30 border border-white/10 px-3 py-1">
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* スクロール矢印 */}
      <motion.div
        className="absolute bottom-8 right-8 text-white/20 text-xs tracking-widest"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 2.0 }}
      >
        SCROLL ↓
      </motion.div>
    </section>
  )
}
