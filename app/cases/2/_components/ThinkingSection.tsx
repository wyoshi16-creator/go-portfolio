'use client'
import { motion } from 'framer-motion'

const lines = [
  'ノベルティの依頼を受けた瞬間、',
  '私は「何を売るか」より「なぜ売れていないか」を先に考えた。',
  '',
  '問題は端末ではなかった。',
  'MRと医師の間にある、情報の摩擦だった。',
  '',
  '医師が患者への説明から解放されれば、薬品を導入する。',
  'MRの営業は加速する。端末の需要は広がる。',
  '',
  '私は、このループを設計した。',
  '',
  '予算の制約も同じように解いた。',
  '「この薬品だけでは足りない」を',
  '「全新薬に対応できる基盤を作る理由」に変換した。',
  '',
  '依頼の再定義が、事業の規模を変えた。'
]

export default function ThinkingSection() {
  return (
    <section className="px-8 md:px-16 py-32 bg-white/[0.01]">
      <div className="max-w-3xl mx-auto">
        <motion.p
          className="text-xs tracking-[0.3em] text-white/20 uppercase mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Thinking Log
        </motion.p>

        <div className="space-y-2">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              className={`text-base md:text-lg leading-relaxed ${
                line === '' ? 'h-4' :
                line.includes('設計した') || line.includes('変えた')
                  ? 'text-white font-light'
                  : 'text-white/50'
              }`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5% 0px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-24 pt-16 border-t border-white/10 flex justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <a href="/cases/1" className="text-xs text-white/20 hover:text-white/40 transition-colors tracking-widest">
            ← PREV CASE
          </a>
          <a href="/cases/3" className="text-xs text-white/20 hover:text-white/40 transition-colors tracking-widest">
            NEXT CASE →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
