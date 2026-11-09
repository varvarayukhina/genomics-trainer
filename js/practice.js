/* ---------- PRACTICE: Python in the browser (Pyodide in a Web Worker) ---------- */
const PYO='https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
let pendingTask=null,selectTaskFn=null;
function openTask(id){pendingTask=id;if(currentId()==='practice'&&selectTaskFn)selectTaskFn(id);else location.hash='practice'}

INIT.practice=function(){
  const lst=$('#prac-list'),panel=$('#prac-task'),code=$('#prac-code');
  let cur=null,hintN=0,attempted=false,worker=null,readyP=null,jobId=0,jobs=new Map(),resetArm=null;
  const solved=id=>store.get('gt:solved:'+id)==='1';
  function progress(){const n=TASKS.filter(t=>solved(t.id)).length;$('#prac-progress').textContent='Решено: '+n+' из '+TASKS.length;if(n>=Math.ceil(TASKS.length*.7))markDone('practice')}
  function drawList(){clearEl(lst);
    [...new Set(TASKS.map(t=>t.track))].forEach(tr=>{
      const h=document.createElement('h3');h.textContent=tr;lst.appendChild(h);
      const row=document.createElement('div');row.className='field-inline';
      TASKS.filter(t=>t.track===tr).forEach(t=>{const b=document.createElement('button');b.type='button';b.className='chip';b.setAttribute('aria-pressed',cur&&cur.id===t.id?'true':'false');b.textContent=t.title+(solved(t.id)?' (решена)':'');b.addEventListener('click',()=>select(t.id));row.appendChild(b)});
      lst.appendChild(row)})}
  function short(s,n){s=String(s);return s.length>n?s.slice(0,n)+'…':s}
  function select(id){
    cur=TASKS.find(t=>t.id===id);if(!cur)return;hintN=0;attempted=false;
    panel.hidden=false;$('#prac-title').textContent=cur.title;$('#prac-bio').textContent='Зачем в биологии: '+cur.bio;
    $('#prac-statement').innerHTML=cur.statement;
    const ex=cur.cases.find(c=>!c.hidden)||cur.cases[0];
    $('#prac-example').textContent='Вход: '+short(JSON.stringify(ex.args).slice(1,-1),160)+'  →  ожидается: '+short(JSON.stringify(ex.expected),160);
    code.value=store.get('gt:code:'+id)||cur.starter;
    $('#prac-hints').innerHTML='';$('#prac-out').innerHTML='';$('#prac-solution').hidden=true;$('#prac-solution').innerHTML='';
    $('#prac-hint').textContent='Подсказка';$('#prac-hint').disabled=false;$('#prac-sol').disabled=true;$('#prac-state').textContent=solved(id)?'Эта задача решена.':'';
    drawList();panel.scrollIntoView({block:'start',behavior:'smooth'})}
  selectTaskFn=select;

  /* worker */
  function startWorker(){
    const src="importScripts('"+PYO+"pyodide.js');\nconst HARNESS="+JSON.stringify(HARNESS)+";\nconst ready=loadPyodide({indexURL:'"+PYO+"'});\nready.then(()=>self.postMessage({type:'ready'}),e=>self.postMessage({type:'fail',error:String(e)}));\nself.onmessage=async e=>{const m=e.data;try{const py=await ready;py.globals.set('USER_CODE',m.code);py.globals.set('FN',m.fn);py.globals.set('CASES_JSON',m.cases);py.globals.set('TOL',m.tol);const out=await py.runPythonAsync(HARNESS);self.postMessage({type:'done',id:m.id,out:out})}catch(err){self.postMessage({type:'done',id:m.id,error:String(err)})}};";
    const url=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));
    worker=new Worker(url);
    readyP=new Promise((res,rej)=>{
      worker.onmessage=e=>{const d=e.data;
        if(d.type==='ready')res();
        else if(d.type==='fail')rej(new Error(d.error));
        else if(d.type==='done'){const j=jobs.get(d.id);if(j){jobs.delete(d.id);clearTimeout(j.timer);j.resolve(d)}}};
      worker.onerror=ev=>rej(new Error('не удалось загрузить Python: '+(ev.message||'нет сети')))})}
  function kill(){if(worker){worker.terminate();worker=null;readyP=null}}
  async function execute(cases){
    if(!worker)startWorker();
    $('#prac-state').textContent='Загружаю Python (первый раз до минуты, дальше быстро)…';
    try{await readyP}catch(err){kill();throw err}
    $('#prac-state').textContent='Запускаю…';
    const id=++jobId;
    return new Promise(resolve=>{
      const timer=setTimeout(()=>{jobs.delete(id);kill();resolve({timeout:true})},10000);
      jobs.set(id,{timer,resolve});
      worker.postMessage({id:id,code:code.value,fn:cur.fn,cases:JSON.stringify(cases),tol:cur.tol})})}

  function render(res,all){
    const out=$('#prac-out');
    if(res.timeout){out.innerHTML='<div class="fb no"><b class="no">Код работает дольше 10 секунд.</b> Похоже на бесконечный цикл или слишком медленное решение.</div>';return false}
    if(res.error){out.innerHTML='<div class="fb no"><b class="no">Ошибка запуска.</b></div><pre class="readout">'+esc(res.error)+'</pre>';return false}
    const r=JSON.parse(res.out);let h='';
    if(r.error){h+='<div class="fb no"><b class="no">Ошибка в коде.</b></div><pre class="readout">'+esc(r.error)+'</pre>'}
    const okN=r.tests.filter(t=>t.ok).length;
    if(r.tests.length){h+='<p class="score">Пройдено '+okN+' из '+r.tests.length+'.</p>';
      r.tests.forEach((t,i)=>{
        const head=t.hidden?'Скрытый тест '+(i+1):'Тест '+(i+1);
        if(t.ok)h+='<div class="fb ok"><b class="ok">'+head+': пройден.</b></div>';
        else{h+='<div class="fb no"><b class="no">'+head+': не пройден.</b>';
          if(!t.hidden)h+='<br>Вход: <code>'+esc(t.args)+'</code><br>Ожидалось: <code>'+esc(t.want)+'</code><br>Получено: <code>'+esc(t.got===null?'(ошибка)':t.got)+'</code>';
          if(t.error)h+='<pre class="readout">'+esc(t.error)+'</pre>';
          h+='</div>'}
        h+='<div style="height:6px"></div>'})}
    if(r.stdout)h+='<p><b>Вывод print():</b></p><pre class="readout">'+esc(r.stdout)+'</pre>';
    out.innerHTML=h;
    return !r.error&&r.tests.length>0&&okN===r.tests.length}

  async function go(all){
    if(!cur)return;attempted=true;$('#prac-sol').disabled=false;store.set('gt:code:'+cur.id,code.value);
    const btns=[$('#prac-run'),$('#prac-check')];btns.forEach(b=>{b.disabled=true});
    let res;
    try{res=await execute(all?cur.cases:cur.cases.filter(c=>!c.hidden))}
    catch(err){res={error:String(err.message||err)}}
    btns.forEach(b=>{b.disabled=false});$('#prac-state').textContent='';
    const ok=render(res,all);
    if(ok&&all){store.set('gt:solved:'+cur.id,'1');$('#prac-state').textContent='Задача решена. '+cur.why;drawList();progress()}
    else if(ok){$('#prac-state').textContent='Примеры прошли. Нажми «Проверить всё»: там ещё скрытые тесты.'}}
  $('#prac-run').addEventListener('click',()=>go(false));
  $('#prac-check').addEventListener('click',()=>go(true));
  code.addEventListener('input',()=>{if(cur)store.set('gt:code:'+cur.id,code.value)});
  code.addEventListener('keydown',e=>{
    if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();const s=code.selectionStart;code.value=code.value.slice(0,s)+'    '+code.value.slice(code.selectionEnd);code.selectionStart=code.selectionEnd=s+4}
    else if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();go(false)}});
  $('#prac-hint').addEventListener('click',()=>{
    if(!cur||hintN>=cur.hints.length)return;const box=$('#prac-hints');const p=document.createElement('p');p.className='note';p.innerHTML='<b>Подсказка '+(hintN+1)+'.</b> '+esc(cur.hints[hintN]);box.appendChild(p);hintN++;
    $('#prac-hint').textContent='Подсказка ('+hintN+' из '+cur.hints.length+')';if(hintN>=cur.hints.length)$('#prac-hint').disabled=true});
  $('#prac-sol').addEventListener('click',()=>{
    if(!cur)return;const box=$('#prac-solution');box.hidden=false;
    box.innerHTML='<figure class="code"><figcaption><span>Эталонное решение<small>одно из возможных</small></span></figcaption><pre><code>'+esc(cur.solution)+'</code></pre></figure>'});
  $('#prac-reset').addEventListener('click',e=>{
    if(!cur)return;const b=e.currentTarget;
    if(resetArm){clearTimeout(resetArm);resetArm=null;b.textContent='Сбросить код';code.value=cur.starter;store.set('gt:code:'+cur.id,cur.starter)}
    else{b.textContent='Точно сбросить?';resetArm=setTimeout(()=>{resetArm=null;b.textContent='Сбросить код'},3000)}});
  drawList();progress();
  if(pendingTask){select(pendingTask);pendingTask=null}};
