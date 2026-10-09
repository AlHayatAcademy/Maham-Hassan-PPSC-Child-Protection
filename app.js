(function(){
'use strict';
var KEY='ppscCPO_v1';
var $=function(id){return document.getElementById(id)};
var REG=window.REGISTRY||[];
window.TESTS=window.TESTS||{};
var store=load();
var S={tid:null,qs:[],idx:0,t0:0,tick:null,filter:'All',exam:null};
function R(){return S.exam?S.exam.rec:rec(S.tid)}

function load(){try{return JSON.parse(localStorage.getItem(KEY))||{tests:{}}}catch(e){return {tests:{}}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}}
function rec(id){return store.tests[id]||(store.tests[id]={ans:[],done:false,best:0,last:0,time:0})}
function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function show(v){['home','quiz','result','analysis'].forEach(function(x){$(x).classList.toggle('hidden',x!==v)});window.scrollTo(0,0)}
function fmt(s){var m=Math.floor(s/60),r=s%60;return (m<10?'0':'')+m+':'+(r<10?'0':'')+r}
function score(id){var r=rec(id),qs=window.TESTS[id]||[],c=0;r.ans.forEach(function(a,i){if(qs[i]&&a===qs[i].a)c++});return c}

/* ---------- HOME ---------- */
function groups(){var g=['All'];REG.forEach(function(t){if(g.indexOf(t.group)<0)g.push(t.group)});return g}
function renderHome(){
  var att=0,cor=0,done=0,best=0;
  REG.forEach(function(t){
    var r=store.tests[t.id];if(!r)return;
    var n=r.ans.filter(function(a){return a!=null}).length;att+=n;
    cor+=r.correct||0;if(r.done){done++;best=Math.max(best,r.best||0)}
  });
  $('st-att').textContent=att;
  $('st-acc').textContent=att?Math.round(cor/att*100)+'%':'0%';
  $('st-done').textContent=done+'/'+REG.length;
  $('st-best').textContent=best+'%';
  $('overall').textContent=att+' / '+(REG.length*50)+' done';
  var ex=store.exams||[];$('ex-hist').textContent=ex.length?('Last exam: '+ex[ex.length-1].s+'/100 · best '+Math.max.apply(null,ex.map(function(x){return x.s}))+' · attempts '+ex.length):'No exam attempted yet.';
  var f=$('filters');f.innerHTML='';
  groups().forEach(function(g){
    var b=document.createElement('button');b.className='tab'+(g===S.filter?' on':'');b.textContent=g;
    b.onclick=function(){S.filter=g;renderHome()};f.appendChild(b);
  });
  var grid=$('grid');grid.innerHTML='';
  REG.forEach(function(t){
    if(S.filter!=='All'&&t.group!==S.filter)return;
    var r=store.tests[t.id]||{ans:[],done:false};
    var n=r.ans.filter(function(a){return a!=null}).length;
    var d=document.createElement('div');d.className='tcard';d.style.setProperty('--c',t.color);
    d.innerHTML='<span class="badge">Test '+t.id+'</span><h3>'+esc(t.title)+'</h3><p>'+esc(t.desc)+'</p>'+
      '<div class="tbar"><i style="width:'+(n/50*100)+'%"></i></div>'+
      '<div class="tmeta"><span>'+n+'/50 attempted</span><span>'+(r.done?'Best '+r.best+'%':'50 MCQs')+'</span></div>';
    d.onclick=function(){start(t.id)};
    grid.appendChild(d);
  });
  show('home');
}

/* ---------- QUIZ ---------- */
function loadData(id,cb){
  if(window.TESTS[id])return cb();
  var s=document.createElement('script');
  s.src='data/t'+(id<10?'0':'')+id+'.js';
  s.onload=cb;
  s.onerror=function(){alert('Could not load test data. Check your connection and reload.')};
  document.body.appendChild(s);
}
function start(id,fresh){
  S.exam=null;$('finish').textContent='Finish & See Result';$('timer').classList.remove('low');$('r-retry').onclick=function(){start(S.tid,true)};
  loadData(id,function(){
    S.tid=id;S.qs=window.TESTS[id];
    var r=rec(id);
    if(fresh){r.ans=[];r.done=false;r.correct=0;r.time=0;save()}
    var first=0;for(var i=0;i<S.qs.length;i++){if(r.ans[i]==null){first=i;break}if(i===S.qs.length-1)first=0}
    S.idx=first;S.t0=Date.now()-(r.time||0)*1000;
    var meta=REG.filter(function(t){return t.id===id})[0];
    $('qtitle').textContent='Test '+id+' · '+meta.title;
    clearInterval(S.tick);
    S.tick=setInterval(function(){$('timer').textContent=fmt(Math.floor((Date.now()-S.t0)/1000))},1000);
    buildPalette();renderQ();show('quiz');
  });
}
function buildPalette(){
  var p=$('palette');p.innerHTML='';
  S.qs.forEach(function(q,i){
    var b=document.createElement('button');b.className='pd';b.textContent=i+1;b.id='pd'+i;
    b.onclick=function(){S.idx=i;renderQ()};p.appendChild(b);
  });
}
function paintPalette(){
  var r=R();
  S.qs.forEach(function(q,i){
    var b=$('pd'+i);b.className='pd'+(r.ans[i]==null?'':(S.exam?' ans':(r.ans[i]===q.a?' ok':' no')))+(i===S.idx?' cur':'');
  });
}
function renderQ(){
  var q=S.qs[S.idx],r=R(),a=r.ans[S.idx];
  $('qnum').textContent='Question '+(S.idx+1)+' of '+S.qs.length;
  $('qcat').textContent=q.c||'';
  $('qtext').textContent=q.q;
  $('pbar').style.width=((S.idx+1)/S.qs.length*100)+'%';
  var o=$('opts');o.innerHTML='';
  q.o.forEach(function(t,i){
    var b=document.createElement('button');b.className='opt';
    b.innerHTML='<span class="l">'+'ABCD'[i]+'</span><span>'+esc(t)+'</span>';
    b.onclick=function(){pick(i)};
    if(S.exam&&a===i)b.classList.add('sel');
    o.appendChild(b);
  });
  var ex=$('expl');
  if(S.exam){ex.classList.add('hidden')}
  else if(a!=null){lock(a)}else{ex.classList.add('hidden')}
  $('prev').disabled=S.idx===0;
  $('next').disabled=S.idx===S.qs.length-1;
  paintPalette();
}
function pick(i){
  if(S.exam){var er=S.exam.rec;er.ans[S.idx]=(er.ans[S.idx]===i?null:i);renderQ();return}
  var r=rec(S.tid);if(r.ans[S.idx]!=null)return;
  r.ans[S.idx]=i;r.time=Math.floor((Date.now()-S.t0)/1000);
  r.correct=0;S.qs.forEach(function(q,k){if(r.ans[k]===q.a)r.correct++});save();
  lock(i);paintPalette();
}
function lock(a){
  var q=S.qs[S.idx],bs=$('opts').children;
  for(var i=0;i<bs.length;i++){
    bs[i].disabled=true;
    if(i===q.a)bs[i].classList.add('right');
    else if(i===a)bs[i].classList.add('wrong');
  }
  var ex=$('expl');
  ex.innerHTML='<b class="t">'+(a===q.a?'✅ Correct!':'❌ Wrong — correct answer: '+'ABCD'[q.a]+'. '+esc(q.o[q.a]))+'</b>'+esc(q.e);
  ex.classList.remove('hidden');
}

/* ---------- RESULT ---------- */
function finish(){
  if(S.exam)return finishExam();
  var r=rec(S.tid),n=S.qs.length,ans=r.ans;
  var un=0;for(var i=0;i<n;i++)if(ans[i]==null)un++;
  if(un&&!confirm(un+' question(s) unattempted. Finish anyway?'))return;
  clearInterval(S.tick);
  var c=0,w=0;S.qs.forEach(function(q,i){if(ans[i]==null)return;if(ans[i]===q.a)c++;else w++});
  var pct=Math.round(c/n*100);
  r.done=true;r.last=pct;r.best=Math.max(r.best||0,pct);r.correct=c;
  r.time=Math.floor((Date.now()-S.t0)/1000);save();
  $('r-title').textContent='Test '+S.tid+' Result';
  $('r-pct').textContent=pct+'%';
  $('ring').style.setProperty('--deg',(pct*3.6)+'deg');
  $('r-c').textContent=c;$('r-w').textContent=w;$('r-s').textContent=un;$('r-t').textContent=fmt(r.time);
  $('r-line').textContent=pct>=80?'🏆 Outstanding! You are exam-ready on this topic.':pct>=60?'👍 Good — revise the wrong ones and retry.':pct>=40?'📚 Keep going — read each explanation carefully.':'💪 Don’t worry. Review all answers and try again.';
  buildReview();show('result');
}
function buildReview(){
  var r=R(),rv=$('review');rv.innerHTML='';
  S.qs.forEach(function(q,i){
    var a=r.ans[i];
    var d=document.createElement('div');d.className='card';
    var st=a==null?'⚪ Skipped':(a===q.a?'✅ Correct':'❌ Wrong');
    d.innerHTML='<div class="qmeta"><span>Q'+(i+1)+' · '+st+'</span><span class="cat">'+esc(q.c||'')+'</span></div>'+
      '<div class="rv-q">'+esc(q.q)+'</div><div class="opts" style="margin-top:8px"></div><div class="expl">'+esc(q.e)+'</div>';
    var o=d.querySelector('.opts');
    q.o.forEach(function(t,k){
      var b=document.createElement('div');b.className='opt'+(k===q.a?' right':(k===a?' wrong':''));
      b.innerHTML='<span class="l">'+'ABCD'[k]+'</span><span>'+esc(t)+'</span>';o.appendChild(b);
    });
    rv.appendChild(d);
  });
}


/* ---------- EXAM SIMULATOR ---------- */
var BLUEPRINTS={
  A:{name:'Exam Simulator A — Real-pattern mix',desc:'Mirrors the analysed 94-100 MCQ CPO paper: GK & current affairs 35, Pakistan Studies 16, English 13, Urdu 11, Science & Computer 10, Maths & Reasoning 8, Islamic Studies 7.',
     mix:{'Current Affairs':18,'GK & Geography':17,'Pakistan Studies':16,'English':13,'Urdu':11,'Science & Computer':10,'Maths & Reasoning':8,'Islamic Studies':7}},
  B:{name:'Exam Simulator B — Child-protection-heavy mix',desc:'Hedge if the paper includes the subject/Act: Act 20, Child Rights & Law 15, Social Sciences 15, plus a general-ability spread.',
     mix:{'Child Protection Act':20,'Child Rights & Law':15,'Social Sciences':15,'Pakistan Studies':10,'Islamic Studies':5,'Current Affairs':10,'GK & Geography':5,'Science & Computer':5,'English':8,'Urdu':4,'Maths & Reasoning':3}}
};
var EXAM_SECS=90*60,NEG=0.25;
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function loadAll(cb){
  var ids=REG.map(function(t){return t.id}),i=0;
  (function nxt(){if(i>=ids.length)return cb();loadData(ids[i++],nxt)})();
}
function startExam(key){
  var bp=BLUEPRINTS[key];
  $('exam-load').classList.remove('hidden');
  loadAll(function(){
    $('exam-load').classList.add('hidden');
    var pool={};
    REG.forEach(function(t){(pool[t.group]=pool[t.group]||[]).push.apply(pool[t.group],window.TESTS[t.id])});
    var qs=[];
    Object.keys(bp.mix).forEach(function(g){qs=qs.concat(shuffle((pool[g]||[]).slice()).slice(0,bp.mix[g]))});
    shuffle(qs);
    S.exam={key:key,rec:{ans:[]},end:Date.now()+EXAM_SECS*1000,bp:bp};
    S.tid='exam';S.qs=qs;S.idx=0;
    $('qtitle').textContent=bp.name+' · '+qs.length+' MCQs';
    clearInterval(S.tick);
    function tk(){var left=Math.max(0,Math.round((S.exam.end-Date.now())/1000));$('timer').textContent=fmt(left);$('timer').classList.toggle('low',left<600);if(left<=0){clearInterval(S.tick);finishExam(true)}}
    tk();S.tick=setInterval(tk,1000);
    $('finish').textContent='Submit Exam';
    buildPalette();renderQ();show('quiz');
  });
}
function finishExam(auto){
  var r=S.exam.rec,n=S.qs.length,c=0,w=0,u=0;
  S.qs.forEach(function(q,i){var a=r.ans[i];if(a==null)u++;else if(a===q.a)c++;else w++});
  if(!auto&&u&&!confirm(u+' question(s) unanswered. Submit the exam?'))return;
  clearInterval(S.tick);
  var sc=Math.round((c-w*NEG)*100)/100;
  var used=Math.min(EXAM_SECS,EXAM_SECS-Math.max(0,Math.round((S.exam.end-Date.now())/1000)));
  store.exams=store.exams||[];
  store.exams.push({d:Date.now(),k:S.exam.key,c:c,w:w,u:u,s:sc});save();
  $('r-title').textContent=S.exam.bp.name;
  var pct=Math.max(0,Math.round(sc/n*100));
  $('r-pct').textContent=pct+'%';
  $('ring').style.setProperty('--deg',(pct*3.6)+'deg');
  $('r-c').textContent=c;$('r-w').textContent=w;$('r-s').textContent=u;$('r-t').textContent=fmt(used);
  var pass=sc>=n*0.4;
  $('r-line').textContent='Net score '+sc+' / '+n+' (correct − '+NEG+' × wrong). '+(sc>=n*0.7?'🏆 Strong — well above the usual cut-off.':pass?'👍 Above 40% (reported pass mark) but aim for 70%+ to be safe.':'📚 Below 40%. Study the explanations and retake.');
  $('r-retry').onclick=function(){startExam(S.exam.key)};
  buildReview();show('result');
}

/* ---------- wiring ---------- */
$('prev').onclick=function(){if(S.idx>0){S.idx--;renderQ()}};
$('next').onclick=function(){if(S.idx<S.qs.length-1){S.idx++;renderQ()}};
$('finish').onclick=finish;
$('back').onclick=function(){if(S.exam&&!confirm('Leave the exam? Your attempt will be lost.'))return;clearInterval(S.tick);S.exam=null;$('finish').textContent='Finish & See Result';renderHome()};
$('home-link').onclick=function(){if(S.exam&&!confirm('Leave the exam? Your attempt will be lost.'))return;clearInterval(S.tick);S.exam=null;$('finish').textContent='Finish & See Result';renderHome()};
$('r-home').onclick=function(){S.exam=null;$('finish').textContent='Finish & See Result';$('r-retry').onclick=function(){start(S.tid,true)};renderHome()};
$('r-retry').onclick=function(){start(S.tid,true)};
$('r-review').onclick=function(){$('review').scrollIntoView({behavior:'smooth'})};
$('ex-a').onclick=function(){startExam('A')};
$('ex-b').onclick=function(){startExam('B')};
$('go-analysis').onclick=function(){show('analysis')};
$('an-back').onclick=renderHome;
$('reset-all').onclick=function(){if(confirm('Erase ALL progress and scores?')){store={tests:{}};save();renderHome()}};
document.addEventListener('keydown',function(e){
  if($('quiz').classList.contains('hidden'))return;
  var k=e.key.toLowerCase();
  if('abcd'.indexOf(k)>-1&&k.length===1)pick('abcd'.indexOf(k));
  else if(e.key==='ArrowRight')$('next').click();
  else if(e.key==='ArrowLeft')$('prev').click();
});
renderHome();
})();
