import { useEffect, useRef, useState } from "react";
import type { RobotSceneController } from "./robot-scene";
import "./robot-scene.css";

export function RobotScene({ compact = false }: { compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<RobotSceneController | null>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    let gone = false;
    void import("./robot-scene").then(({ mountRobotScene }) => {
      if (!gone && host.current) controller.current = mountRobotScene(host.current, { compact });
    }).catch(() => { if (host.current) host.current.dataset.sceneState = "fallback"; });
    return () => { gone = true; controller.current?.dispose(); controller.current = null; };
  }, [compact]);
  return (
    <div ref={host} className={`robot-stage${compact ? " robot-stage-compact" : ""}`} role="group" aria-label="三维机械伙伴概念视觉，带发光光学传感器和轨道网格">
      <div className="robot-fallback" aria-hidden="true">
        <div className="robot-fallback-orbit" />
        <svg viewBox="0 0 360 300" fill="none">
          <path d="M60 235h240M84 253h192M100 267h160" stroke="currentColor" opacity=".22" />
          <path d="m96 235 84-36 84 36-84 36-84-36Z" stroke="currentColor" opacity=".45" />
          <rect x="132" y="119" width="96" height="81" rx="8" fill="#bca6e5" stroke="currentColor" />
          <rect x="111" y="60" width="138" height="87" rx="13" fill="#a58bdc" stroke="currentColor" />
          <rect x="121" y="79" width="118" height="35" rx="6" fill="#392b4a" />
          <path d="M139 95h19m44 0h19" stroke="#48c9ad" strokeWidth="8" strokeLinecap="round" />
          <circle cx="180" cy="163" r="17" stroke="currentColor" /><circle cx="180" cy="163" r="8" fill="currentColor" />
          <path d="m127 140-24 39 10 34m120-73 24 39-10 34M157 200v29m46-29v29" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
          <path d="M144 238h27m19 0h27M227 60V43" stroke="currentColor" strokeWidth="5" />
          <circle cx="227" cy="39" r="5" fill="#ffad83" />
        </svg>
      </div>
      <span className="robot-annotation robot-annotation-top" aria-hidden="true">HELLO, ROBOT!</span>
      <span className="robot-annotation robot-annotation-bottom" aria-hidden="true">一起探索机器人 · 3D</span>
      <button className="robot-motion-control" type="button" aria-pressed={paused} onClick={() => { controller.current?.setPaused(!paused); setPaused(!paused); }}>{paused ? "恢复动态" : "暂停动态"}</button>
    </div>
  );
}
