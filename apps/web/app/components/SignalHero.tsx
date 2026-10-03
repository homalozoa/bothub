import { Link } from "react-router";
import { SITE } from "@aihot/industry/site";
import { RobotScene } from "../visuals/RobotScene";

export function SignalHero() {
  return <section className="signal-hero workshop-panel relative mb-7 grid overflow-hidden border border-line-strong bg-surface sm:grid-cols-[1fr_260px] xl:grid-cols-[1fr_320px]" aria-labelledby="signal-title">
    <div className="signal-hero-copy relative z-10 flex flex-col justify-center px-5 py-6 sm:px-7">
      <p className="workshop-kicker mb-3 text-accent">{SITE.englishName} · 机器人与 AI</p>
      <h1 id="signal-title" className="text-[28px] font-bold leading-tight tracking-tight text-ink sm:text-[32px] xl:text-[38px]">发现机器人，<br /><span className="text-accent">让好奇发生。</span></h1>
      <p className="mt-3 max-w-[460px] text-[13px] leading-[1.85] text-ink-3">硬件与系统、研究与开源、产品与商业化。<br />沿着原始来源，发现值得关注的变化。</p>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px]">
        <Link to="/all" className="inline-flex items-center gap-3 rounded-control border border-accent bg-accent px-4 py-2 font-semibold text-accent-contrast transition-colors hover:opacity-90">开始阅读 <span aria-hidden="true">↗</span></Link>
        <Link to="/daily" className="text-ink-3 hover:text-accent">每日简报 ↗</Link>
        <Link to="/topics" className="text-ink-3 hover:text-accent">主题索引 ↗</Link>
      </div>
    </div>
    <div className="signal-hero-stage relative border-t border-line bg-bg/30 sm:border-l sm:border-t-0"><RobotScene compact /></div>
  </section>;
}
