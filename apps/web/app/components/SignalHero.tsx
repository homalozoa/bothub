import { Link } from "react-router";
import { ChannelIcon } from "../features/channels/Channels";
export function SignalHero() {
  return <section className="radar-hero" aria-labelledby="signal-title">
    <div className="radar-hero-copy"><p className="radar-eyebrow">THE OPENZOO READING ROOM</p><h1 id="signal-title">世界在发生，<br /><span>好奇心有回声。</span></h1><p>从智能的下一步，到生命的细微处。<br />追踪有来源的新进展，也读懂日常生活。</p><div className="radar-hero-actions"><Link to="/channels">探索七个频道 <span aria-hidden="true">↗</span></Link><Link to="/all">阅读最新动态 →</Link></div></div>
    <div className="radar-art" aria-hidden="true"><div className="radar-orbit orbit-one" /><div className="radar-orbit orbit-two" /><div className="radar-orbit orbit-three" /><span className="art-caption">A WORLD WORTH WONDERING ABOUT</span><div className="art-object object-robot"><ChannelIcon domain="robotics" /></div><div className="art-object object-leaf"><ChannelIcon domain="biology" /></div><div className="art-object object-fossil"><ChannelIcon domain="natural-history" /></div><div className="art-object object-people"><ChannelIcon domain="sociology" /></div><span className="art-spark spark-one">✳</span><span className="art-spark spark-two">+</span><span className="art-note">INTELLIGENCE · LIFE · EVERYDAY</span></div>
  </section>;
}
