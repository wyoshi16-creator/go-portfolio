import HeroSection from './_components/HeroSection'
import ProblemSection from './_components/ProblemSection'
import SolutionSection from './_components/SolutionSection'
import ResultSection from './_components/ResultSection'
import ThinkingSection from './_components/ThinkingSection'

export default function Case2Page() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ResultSection />
      <ThinkingSection />
    </main>
  )
}
