import { Link } from "react-router";
import { SITE } from "@aihot/industry/site";
import { RobotScene } from "../visuals/RobotScene";

export function SignalHero() {
  return <section className="workshop-panel relative mb-7 grid overflow-hidden border border-line-strong bg-surface sm:grid-cols-[1fr_260px] xl:grid-cols-[1fr_320px]" aria-labelledby="signal-title">
    <div className="relative z-10 flex flex-col justify-center px-5 py-6 sm:px-7">
      <p className="workshop-kicker mb-3 text-accent">OPENZOO / ROBOTICS SIGNAL</p>
      <h1 id="signal-title" className="text-[28px] font-bold leading-tight tracking-tight text-ink sm:text-[32px] xl:text-[38px]">读懂机器人，<br /><span className="text-accent">下一步的进展。</span></h1>
      <p className="mt-3 max-w-[460px] text-[13px] leading-[1.85] text-ink-3">硬件与系统、研究与开源、产品与商业化。<br />沿着原始来源，发现值得关注的变化。</p>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px]">
        <Link to="/all" className="inline-flex items-center gap-3 border border-accent/40 bg-accent-soft px-4 py-2 font-semibold text-accent transition-colors hover:bg-accent hover:text-bg">全部动态 <span aria-hidden="true">↗</span></Link>
        <Link to="/daily" className="text-ink-3 hover:text-accent">每日简报 ↗</Link>
        <Link to="/topics" className="text-ink-3 hover:text-accent">主题索引 ↗</Link>
      </div>
    </div>
    <div className="relative border-t border-line bg-bg/30 sm:border-l sm:border-t-0"><RobotScene compact /></div>
    <span className="pointer-events-none absolute right-3 top-2 font-mono text-[8px] tracking-[.18em] text-ink-4" aria-hidden="true">{SITE.mcpPrefix.toUpperCase()}_</span>
  </section>;
}
