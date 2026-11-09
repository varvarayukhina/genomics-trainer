/* ---------- CORE: helpers, router, theme, copy, quiz ---------- */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const NS='http://www.w3.org/2000/svg';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function sv(tag,attrs,parent,text){const e=document.createElementNS(NS,tag);for(const k in attrs){e.setAttribute(k,attrs[k])}if(text!=null)e.textContent=text;if(parent)parent.appendChild(e);return e}
function clearEl(e){while(e.firstChild)e.removeChild(e.firstChild)}
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function sci(x){const [m,e]=x.toExponential(1).split('e');const sup=String(Number(e)).replace(/[-0-9]/g,c=>({'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}[c]));return m.replace('.',',')+'×10'+sup}
function fmt(x,d=2){return Number(x).toLocaleString('ru-RU',{maximumFractionDigits:d})}
function parseNums(s){return String(s).split(/[\s,;]+/).filter(x=>x!=='').map(Number).filter(x=>isFinite(x))}
const INIT={};const inited={};

/* theme: auto -> light -> dark */
const THEMES=['auto','light','dark'];let themeIdx=0;
function applyTheme(){const t=THEMES[themeIdx];const r=document.documentElement;if(t==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t);
  const label={'auto':'Тема: авто','light':'Тема: светлая','dark':'Тема: тёмная'}[t];
  const b1=$('#theme-btn'),b2=$('#theme-btn-m');if(b1)b1.textContent=label;if(b2)b2.textContent=label.replace('Тема: ','')}
function initTheme(){const s=store.get('gt:theme');if(s&&THEMES.includes(s))themeIdx=THEMES.indexOf(s);applyTheme();
  const cycle=()=>{themeIdx=(themeIdx+1)%3;store.set('gt:theme',THEMES[themeIdx]);applyTheme()};
  $('#theme-btn').addEventListener('click',cycle);$('#theme-btn-m').addEventListener('click',cycle)}

/* progress */
const doneKey=id=>'gt:done:'+id;
const isDone=id=>store.get(doneKey(id))==='1';
function markDone(id){store.set(doneKey(id),'1');renderNav()}
function currentId(){const h=(location.hash||'').slice(1);return MODS.some(m=>m[0]===h)?h:'start'}
function renderNav(){
  const cur=currentId();const ol=$('#mods');clearEl(ol);const sel=$('#mods-select');clearEl(sel);
  let n=0;
  MODS.forEach(([id,title])=>{
    const d=isDone(id);if(d)n++;
    const li=document.createElement('li');const a=document.createElement('a');a.href='#'+id;if(id===cur)a.setAttribute('aria-current','page');if(d)a.className='done';
    a.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><circle class="ring" cx="10" cy="10" r="8"/><path class="tick" d="M6 10.5l3 3 5-6"/></svg><span>'+esc(title)+(d?'<span style="position:absolute;left:-9999px"> (пройден)</span>':'')+'</span>';
    li.appendChild(a);ol.appendChild(li);
    const o=document.createElement('option');o.value=id;o.textContent=(d?'✓ ':'')+title;if(id===cur)o.selected=true;sel.appendChild(o)});
  $('#progress-text').textContent='Пройдено: '+n+' из '+MODS.length}
function show(){
  const id=currentId();
  $$('.view').forEach(v=>{v.hidden=v.id!=='view-'+id});
  const noQuiz=!$('#view-'+id+' .quiz');if(noQuiz&&id!=='start'&&id!=='practice')markDone(id);
  if(!inited[id]){inited[id]=true;if(INIT[id])INIT[id]()}
  renderNav();window.scrollTo(0,0)}

/* copy buttons */
function initCopy(){document.addEventListener('click',e=>{const b=e.target.closest('button.copy');if(!b)return;
  const fig=b.closest('figure');const text=b.dataset.copy||(fig&&$('pre code',fig)?$('pre code',fig).textContent:'');
  const done=()=>{const old=b.textContent;b.textContent='Скопировано';setTimeout(()=>{b.textContent=old},1500)};
  const fallback=()=>{const pre=fig&&$('pre',fig);if(pre){const r=document.createRange();r.selectNodeContents(pre);const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Выделено, нажми Ctrl+C'}};
  try{navigator.clipboard.writeText(text).then(done,fallback)}catch(err){fallback()}})}

/* quiz */
function initQuizzes(){$$('.quiz[data-quiz]').forEach(initQuiz)}
function initQuiz(box){
  {
    const id=box.dataset.quiz;const qs=QUIZ[id];if(!qs)return;
    box.innerHTML='<h2 style="margin-top:0">Самопроверка</h2><p class="score" id="score-'+id+'" aria-live="polite">Выбери ответ: проверка сразу.</p>';
    const prev=store.get('gt:q:'+id);if(prev){const p=document.createElement('p');p.className='meta';p.textContent='Прошлый результат: '+prev;box.appendChild(p)}
    const answered={};
    qs.forEach((q,i)=>{
      const wrap=document.createElement('div');wrap.className='q';
      const fs=document.createElement('fieldset');
      fs.innerHTML='<legend>'+esc(q.q)+'</legend>'+q.o.map((t,j)=>'<label><input type="radio" name="q-'+id+'-'+i+'" value="'+j+'"><span>'+esc(t)+'</span></label>').join('')+'<div class="fb" hidden aria-live="polite"></div>';
      wrap.appendChild(fs);box.appendChild(wrap);
      fs.addEventListener('change',e=>{
        if(answered[i]!=null)return;const j=Number(e.target.value);answered[i]=j===q.a;
        $$('label',fs).forEach((l,k)=>{$('input',l).disabled=true;if(k===q.a)l.classList.add('is-right');else if(k===j)l.classList.add('is-wrong')});
        const fb=$('.fb',fs);fb.hidden=false;fb.className='fb '+(j===q.a?'ok':'no');fb.innerHTML='<b class="'+(j===q.a?'ok':'no')+'">'+(j===q.a?'Верно.':'Не совсем.')+'</b> '+esc(q.why);
        const n=Object.keys(answered).length;const right=Object.values(answered).filter(Boolean).length;
        const sc=$('#score-'+id);
        if(n===qs.length){const pass=right>=Math.ceil(qs.length*.75);
          sc.textContent='Итог: '+right+' из '+qs.length+(pass?'. Модуль пройден.':'. Перечитай раздел и попробуй ещё раз.');
          store.set('gt:q:'+id,right+'/'+qs.length);if(pass)markDone(id);
          if(!$('.retry',box)){const b=document.createElement('button');b.type='button';b.className='retry';b.textContent='Пройти заново';b.addEventListener('click',()=>{box.innerHTML='';initQuiz(box)});box.appendChild(b)}}
        else sc.textContent='Отвечено: '+n+' из '+qs.length})})}}

/* start view */
const DECODE={
 copies:['Копия','Копия — ещё один экземпляр того же гена в геноме. В семействах генов их бывает от одного до нескольких десятков.','copies'],
 assembly:['Одна сборка','Сборка — геном, собранный программой из коротких кусков прочтений. Одна сборка — один файл FASTA. Подсчёт делали отдельно в каждом файле, поэтому в каждой сборке своё число.','assembly'],
 tandem:['Тандемное семейство','Семейство генов — группа похожих генов общего происхождения (KLR, LILR, MHC-I). Тандемное — копии стоят подряд, как одинаковые страницы в тетради. Такие участки трудно собрать и трудно посчитать.','genome'],
 hap:['Гаплотипы','У диплоидного животного два набора хромосом: от мамы и от папы. Один такой набор — гаплотип. NCBI хранит hap1 и hap2 как две отдельные сборки. Это не обязательно материнский и отцовский: чей именно, без родителей неизвестно.','genome'],
 one:['Одно животное','Обе сборки сделаны из одного образца (одинаковый BioSample в NCBI). Значит, различия не между видами и не между особями, а внутри одного организма.','assembly'],
 loci:['Единицы локусов','Локус — место в геноме, где программа нашла ген или его остатки. «Единицы» — несколько штук: в пилоте разница между hap1 и hap2 чаще 0–3 локуса, максимум 7.','copies']
};
function initStart(){
  const ul=$('#plan');MODS.slice(1).forEach(([id,t,d])=>{const li=document.createElement('li');li.innerHTML='<a href="#'+id+'">'+esc(t)+'</a><span>'+esc(d)+'</span>';ul.appendChild(li)});
  const box=$('#decode');
  $$('#sentence button').forEach(b=>b.addEventListener('click',()=>{
    $$('#sentence button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
    const [t,txt,mod]=DECODE[b.dataset.k];const m=MODS.find(x=>x[0]===mod);
    box.innerHTML='<b>'+esc(t)+'</b>'+esc(txt)+' <a href="#'+mod+'">Подробнее: '+esc(m[1])+'</a>'}))}
INIT.start=initStart;

function boot(){
  initTheme();initCopy();initQuizzes();
  $('#mods-select').addEventListener('change',e=>{location.hash=e.target.value});
  window.addEventListener('hashchange',show);
  if(!location.hash)history.replaceState(null,'','#start');
  show()}
