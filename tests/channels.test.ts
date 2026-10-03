// Synthetic responses test program routing and compatibility, never editorial accuracy.
import { stub, tag } from "./setup.ts";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { sql, closeDb } from "@aihot/backend/db";
import { config } from "@aihot/backend/config";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { analyzeArticle } from "@aihot/backend/editorial/analyze";
import { publishArticle } from "@aihot/backend/publication/publish";
import { loadPool } from "@aihot/backend/publication/pool";
import { loadTimeline } from "@aihot/backend/publication/timeline";
import { itemFeed } from "@aihot/backend/publication/feeds";
import { v1Items } from "@aihot/backend/publication/v1";
import { overrideFields, setVisibility } from "@aihot/backend/admin/content";
import { candidates } from "@aihot/backend/reports/compose";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { domainInfo, type DomainKey } from "@aihot/industry/channels";
import { parseFilters } from "../apps/api/src/routes/site.ts";
import { buildApp } from "../apps/api/src/app.ts";
const T=tag(), source=`channels-${T}`, now=new Date();
const samples: Record<string, { domain: DomainKey; title: string; text: string }> = {
  BEE_SAMPLE: { domain:"biology", title:"蜜蜂的学习行为研究", text:"Bumblebees learn a foraging task. Researchers compare trained and untrained groups under controlled conditions and report observations and limitations." },
  FOSSIL_SAMPLE: { domain:"natural-history", title:"标本改变化石分类解释", text:"Late Jurassic specimens from a dated sedimentary layer change the classification of a fossil species. The paper explains material, dating and alternative phylogenetic interpretations." },
  CARE_SAMPLE: { domain:"sociology", title:"家庭照护的田野访谈", text:"Fieldwork interviews examine household care and work routines in one region. The study describes its interview period, qualitative methods, context and limits of generalisation." },
};
const calls: string[]=[];
const provider=await stub((_hit,req)=>{
  const request=JSON.parse(req.body); const system=String(request.messages[0]?.content??""); const user=String(request.messages.at(-1)?.content??"");
  const marker=Object.keys(samples).find(k=>user.includes(k))!; const s=samples[marker]!;
  let content: unknown;
  if(system.includes("宽召回")){calls.push("prefilter");content={label:"PASS",reason:"领域研究",primaryChannel:s.domain,relatedChannels:s.domain==="biology"?["play"]:[]};}
  else if(system.includes("事件注意力评分器")){calls.push("score");assert.match(user,new RegExp(s.domain));content={attentionScore:82};}
  else if(system.includes("资料结构化助手")){calls.push("structure");content={primaryChannel:s.domain,relatedChannels:s.domain==="biology"?["play"]:[],category:"research",tags:["论文/研究"],subjects:[],fact:{title:s.title,subject:marker,action:"研究",object:marker,occurredAt:null}};}
  else {calls.push("writing");content={itemType:"research_paper",authorRole:"principal",tags:["论文/研究"],editorialJudgment:"合成测试说明",titleZh:s.title,summaryZh:`${s.title}。材料说明研究对象、方法与适用范围。`};}
  return {choices:[{message:{content:JSON.stringify(content)}}],usage:{prompt_tokens:10,completion_tokens:5}};
});
for(const env of ["DASHSCOPE_BASE_URL","ZHIPU_BASE_URL","DEEPSEEK_BASE_URL"])process.env[env]=`${provider.url}/v1`;
for(const env of ["DASHSCOPE_API_KEY","ZHIPU_API_KEY","DEEPSEEK_API_KEY"])process.env[env]="local-test-key";
const ids: Record<string,string>={};
const filters=(domain:DomainKey|"all")=>({domain,channel:"all" as const,category:null,tag:null,now});
before(async()=>{
  config.modelCallsEnabled=true;
  await sql`INSERT INTO sources(id,name,kind,tier,participation_mode,channel_hints,enabled,next_fetch_at) VALUES(${source},'测试领域来源','rss','T1','editorial',${['biology','natural-history','sociology']},false,'2100-01-01')`;
});
after(async()=>{await provider.close();await stopBoss();await closeDb();});
test("non-AI materials traverse shared prefilter, scoring, writing and publication with five calls, including an independent qualitative study",async()=>{
  for(const [marker,s] of Object.entries(samples)){
    assert.doesNotMatch(s.text,/\bAI\b|robot|机器人/i);
    const {articleId}=await upsertMaterial({sourceId:source,url:`https://example.org/${T}/${marker}`,title:marker,bodyText:`${marker} ${s.text.repeat(3)}`,bodyStatus:"ok",via:"fetch",publishedAt:now});ids[marker]=articleId;
    const before=calls.length;const r=await analyzeArticle(articleId);
    assert.equal(r!.output!.primaryChannel,s.domain);assert.equal(r!.output!.selected,true);assert.equal(calls.length-before,5);
    await publishArticle(articleId,{now,releasedAt:new Date(now.getTime()-1000)});
    const data=await loadPool(filters(s.domain));assert.ok(data.items.some(i=>i.id===articleId));assert.equal(data.items.find(i=>i.id===articleId)!.primaryChannel,s.domain);
  }
});
test("channels are independent of paper filters and preserve one canonical article in two domains",async()=>{
  const bee=ids.BEE_SAMPLE!;
  for(const d of ["biology","play"] as const){const data=await loadPool({...filters(d),tag:"论文/研究",q:"蜜蜂"});assert.deepEqual(data.items.map(i=>i.id),[bee]);}
  const all=await loadTimeline(filters("all"));assert.equal(all.cards.filter(c=>c.item.id===bee).length,1);
  const biology=await loadTimeline({...filters("biology"),limit:1});assert.equal(biology.cards[0]!.item.id,bee);
  assert.equal((await sql`SELECT count(*)::int AS n FROM publications WHERE article_id=${bee}`)[0]!.n,1);
});
test("pagination, cursor bindings, source/time filters and count caches cannot leak a different domain",async()=>{
  const first=await loadTimeline({...filters("all"),limit:1});assert.ok(first.nextCursor);
  await assert.rejects(loadTimeline({...filters("biology"),cursor:first.nextCursor}),/cursor does not match/);
  const bio=await loadPool({...filters("biology"),page:2});assert.equal(bio.items.length,0);assert.equal(bio.total,1);
  const future=await loadPool({...filters("biology"),since:"2099-01-01"});assert.equal(future.total,0);
  for(const domain of ["biology","sociology"] as const){const result=await loadPool({...filters(domain),now:undefined});assert.equal(result.total,1);assert.ok(result.items.every(i=>i.primaryChannel===domain));}
});
test("legacy RSS, API, selected sync and reports retain robotics scope; explicit comprehensive and channel feeds include new material",async()=>{
  const bee=ids.BEE_SAMPLE!;
  assert.ok(!(await itemFeed("selected",null,now)).includes(bee));
  assert.ok((await itemFeed("selected",null,now,"biology",true)).includes(bee));
  assert.ok((await itemFeed("selected",null,now,"all",true)).includes(bee));
  const q={mode:"selected" as const,window:"7d" as const,by:"published" as const,category:null,q:null,limit:30,cursor:null};
  assert.ok(!(await v1Items(q,new Date(now.getTime()+1))).items.some(i=>i.id===bee));
  assert.ok((await v1Items({...q,domain:"biology"},new Date(now.getTime()+1))).items.some(i=>i.id===bee));
  assert.equal((await sql`SELECT 1 FROM selected_ledger WHERE article_id=${bee}`).length,0);
  assert.ok(!(await candidates(new Date(now.getTime()-1000),new Date(now.getTime()+1000))).some(c=>c.itemId===bee));
});
test("old material remains dated archive content; domain windows do not turn old discoveries into today",async()=>{
  const {articleId}=await upsertMaterial({sourceId:source,url:`https://example.org/${T}/old`,title:"历史研究",bodyText:"旧材料",bodyStatus:"ok",via:"fetch",publishedAt:new Date(now.getTime()-100*86400000)});
  await sql`INSERT INTO analyses(article_id,input_revision,origin,relevance,primary_channel,category,title_zh,summary_zh,score,selected) VALUES(${articleId},1,'rule','pass','biology','research','历史研究','历史材料摘要',99,true)`;
  const r=await publishArticle(articleId,{now,releasedAt:now});assert.equal(r!.selected,false);
  assert.ok((await loadPool(filters("biology"))).items.find(i=>i.id===articleId)!.historical);
  assert.ok(!(await itemFeed("all",null,now,"biology",true)).includes(articleId));
});
test("human channel corrections survive automatic republishing, avoid duplicate publication and are audited",async()=>{
  const id=ids.CARE_SAMPLE!;
  await overrideFields(id,{fields:{primaryChannel:"interaction",relatedChannels:["sociology"]},reason:"测试主问题修正",version:0},"test");
  await publishArticle(id,{now});const again=await publishArticle(id,{now});assert.equal(again!.changed,false);
  assert.equal((await loadPool(filters("interaction"))).items.find(i=>i.id===id)!.primaryChannel,"interaction");
  assert.ok((await loadPool(filters("sociology"))).items.some(i=>i.id===id));
});
test("withdrawal disappears from domain pages, comprehensive search, feeds, API and canonical detail without model calls",async()=>{
  const id=ids.BEE_SAMPLE!,count=calls.length;await setVisibility(id,{visibility:"withdrawn",reason:"测试撤回",version:0},"test");
  for(const domain of ["biology","play","all"] as const){assert.ok(!(await loadPool({...filters(domain),q:"蜜蜂"})).items.some(i=>i.id===id));assert.ok(!(await loadTimeline(filters(domain))).cards.some(c=>c.item.id===id));assert.ok(!(await itemFeed("selected",null,now,domain,true)).includes(id));}
  const app=await buildApp();const detail=await app.inject({method:"GET",url:`/api/site/items/${id}`});assert.equal(detail.statusCode,404);await app.close();assert.equal(calls.length,count);
});
test("new endpoints reject invalid channels/dates and administrative writes remain protected",async()=>{
  await assert.rejects(parseFilters({domain:"unknown"}),/invalid domain/);await assert.rejects(parseFilters({since:"2026-02-30"}),/invalid since/);
  const app=await buildApp();assert.equal((await app.inject({url:"/feed/channels/biology.xml"})).statusCode,200);assert.equal((await app.inject({url:"/feed/channels/unknown.xml"})).statusCode,404);
  assert.equal((await app.inject({method:"POST",url:`/api/admin/content/${ids.CARE_SAMPLE}/override`,payload:{fields:{primaryChannel:"play"}}})).statusCode,401);await app.close();
  assert.equal(domainInfo("biology").label,"生物学");
});
