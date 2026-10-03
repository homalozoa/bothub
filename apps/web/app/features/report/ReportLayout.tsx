import type { ReactNode } from "react";
import type { ReportNavigationEntry, ReportKind } from "@aihot/contracts/site";
import { ReportArchive, ReportPhoneNav } from "./ReportNav";

/**
 * Report pages sit beside their own archive column (desktop), flush against the site sidebar; phones
 * get the kind tabs and recent issues above the page instead. The paper is centred beside the archive,
 * on white in the light theme, up to 1160px.
 */
export function ReportLayout({ kind, index, current, today, children }: { kind: ReportKind; index: ReportNavigationEntry[]; current: string | null; today: string; children: ReactNode }) {
  return (
    <div className="report-shell grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-8">
      <ReportArchive kind={kind} index={index} current={current} />
      <div className="min-w-0 pb-6">
        <ReportPhoneNav kind={kind} index={index} current={current} today={today} />
        <div className="w-full lg:max-w-[1160px]">{children}</div>
      </div>
    </div>
  );
}
