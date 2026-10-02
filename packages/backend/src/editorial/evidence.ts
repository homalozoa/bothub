// Narrow contradiction checks, not a fact checker. Only explicit exclusions trigger these rules.
export interface EvidenceGuard { outcome: "review"; reasons: string[] }
const REAL_VALIDATION = /(?:通过|完成|实现|已|获得|展示了).{0,16}(?:真机|真实机器人|真实环境).{0,4}(?:测试|验证|部署|运行)|(?:validated|tested|deployed).{0,40}(?:on|in) (?:real robots|(?:the )?real world)/i;
const COMPLETE_OPEN = /(?:完整|全面|全部|全量)(?:开源|开放)|(?:模型|项目)(?:已)?完全开源|fully open[- ]source|all (?:code|weights|data).{0,20}(?:released|available)/i;

function affirmative(text: string, claim: RegExp): boolean {
  return text.split(/[。！？!?;；\n，,]|但是|然而|但|\bbut\b/u).some((sentence) => {
    // Negated or unknown evidence is a limitation, not a positive claim.
    const match = claim.exec(sentence);
    if (!match) return false;
    const context = sentence.slice(Math.max(0, match.index - 16), match.index + match[0].length);
    return !/(?:未|无|没有|尚未|不代表|不能|并非|未知|有待|待验证|not |no |without |unknown)/i.test(context);
  });
}

export function evidenceContradictions(source: string, draft: string): EvidenceGuard | null {
  const reasons: string[] = [];
  // Mixed evidence may describe a later release. These narrow rules only reject a clear exclusion
  // with no positive support anywhere in the material; they cannot resolve mixed-version claims.
  const realSupport = affirmative(source, REAL_VALIDATION);
  const completeSupport = affirmative(source, COMPLETE_OPEN) || affirmative(source.replace(/,/g, " "), /(?:release(?:s|d)?|available|open(?:s|ed)?).{0,40}(?:code).{0,30}weights.{0,30}data/i);
  if (/(?:simulation[- ]only|only (?:evaluated|tested|validated) in simulation|(?:evaluated|tested|validated) only in simulation|仅(?:在仿真|做仿真|有仿真|仿真)|尚未(?:进行)?真机(?:测试|验证))/i.test(source)
    && !realSupport && affirmative(draft, REAL_VALIDATION)) {
    reasons.push("原材料明确限定仿真，摘要却宣称真实机器人验证");
  }
  if (/(?:code[- ]only|only (?:the )?(?:source )?code (?:is|was|has been) (?:released|available)|(?:weights|datasets?) (?:are|were|have) not (?:released|available)|仅(?:发布|开放|提供)代码|(?:权重|数据集)(?:尚未|未|不)(?:开放|发布|提供))/i.test(source)
    && !completeSupport && affirmative(draft, COMPLETE_OPEN)) {
    reasons.push("原材料仅开放部分资产，摘要却宣称完整开源");
  }
  return reasons.length ? { outcome: "review", reasons } : null;
}
