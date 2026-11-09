/* ---------- WIDGETS 2: copies, stats, single cell, pipelines, glossary ---------- */
const FAM=['KLRC','KLRD1','KLRK1','KLRF','LILR','MHC-I','CD1','NCR1','MR1'];

INIT.copies=function(){
  /* ---- simulator ---- */
  const thr=$('#sim-thr'),svg=$('#sim-svg'),tbl=$('#sim-tbl'),msg=$('#sim-msg'),tb=$('#sim-truth'),nb=$('#sim-new');
  let seed=11,truth=false,world;
  function make(s){const r=rng(s),N=12;const dec=new Set();while(dec.size<2)dec.add(Math.floor(r()*N));
    const base=[],type=[];for(let i=0;i<N;i++){const d=dec.has(i);type.push(d?'decoy':'gene');base.push(d?34+r()*16:52+r()*43)}
    const genes=type.map((t,i)=>t==='gene'?i:-1).filter(i=>i>=0);const del=genes[Math.floor(r()*genes.length)];
    const hap=h=>type.map((t,i)=>({t:(h===2&&i===del)?'none':t,id:base[i]+(r()-.5)*10,fs:t==='gene'&&r()<.16}));
    return {h1:hap(1),h2:hap(2),N:N}}
  function ev(h,t){return h.map(s=>{if(s.t==='none')return 'none';if(s.t==='decoy')return s.id>=t?'false':'quiet';return s.id>=t?(s.fs?'pseudo':'intact'):'missed'})}
  function count(st){const c={intact:0,pseudo:0,false:0,missed:0};st.forEach(x=>{if(c[x]!=null)c[x]++});c.found=c.intact+c.pseudo+c.false;return c}
  function draw(){const t=Number(thr.value);$('#sim-thrv').textContent=t;clearEl(svg);hatchDef(svg,'hx3');
    const e1=ev(world.h1,t),e2=ev(world.h2,t);
    [[e1,world.h1,'hap1',40],[e2,world.h2,'hap2',130]].forEach(([e,h,name,y])=>{
      sv('text',{x:8,y:y+23,style:'font-weight:700'},svg,name);sv('line',{x1:60,y1:y+17,x2:745,y2:y+17,class:'axis'},svg);
      e.forEach((st,i)=>{const x=72+i*56;
        if(st==='intact')sv('rect',{x:x,y:y,width:44,height:34,rx:3,style:'fill:var(--ink)'},svg);
        else if(st==='pseudo')sv('rect',{x:x,y:y,width:44,height:34,rx:3,style:'fill:url(#hx3);stroke:var(--warn);stroke-width:3'},svg);
        else if(st==='false')sv('rect',{x:x,y:y,width:44,height:34,rx:3,style:'fill:var(--bad)'},svg);
        else sv('rect',{x:x,y:y,width:44,height:34,rx:3,style:'fill:none;stroke:var(--line-strong);stroke-width:2;stroke-dasharray:5 4'},svg);
        if(truth){const k=h[i].t;sv('text',{x:x+22,y:y+58,'text-anchor':'middle'},svg,k==='gene'?'ген':(k==='decoy'?'шум':'нет'))}})});
    const c1=count(e1),c2=count(e2);
    const real1=world.h1.filter(s=>s.t==='gene').length,real2=world.h2.filter(s=>s.t==='gene').length;
    const rows=[['hap1',c1,real1],['hap2',c2,real2]];
    let h='<thead><tr><th>Гаплотип</th><th>Найдено локусов</th><th>целых</th><th>с поломкой</th><th>ложных</th>'+(truth?'<th>настоящих копий</th><th>пропущено</th>':'')+'</tr></thead><tbody>';
    rows.forEach(([n,c,r])=>{h+='<tr><td><b class="'+(n==='hap1'?'hap1':'hap2')+'">'+n+'</b></td><td>'+c.found+'</td><td>'+c.intact+'</td><td>'+c.pseudo+'</td><td>'+c.false+'</td>'+(truth?'<td>'+r+'</td><td>'+c.missed+'</td>':'')+'</tr>'});
    tbl.innerHTML=h+'</tbody>';
    msg.textContent='Порог '+t+' %: найдено '+c1.found+' и '+c2.found+' локусов (разница '+(c2.found-c1.found)+'). '+(truth?'Настоящих копий: '+real1+' и '+real2+'.':'Нажми «Показать правду», чтобы увидеть, сколько копий было на самом деле.')}
  world=make(seed);thr.addEventListener('input',draw);
  tb.addEventListener('click',()=>{truth=!truth;tb.setAttribute('aria-pressed',truth?'true':'false');tb.textContent=truth?'Скрыть правду':'Показать правду';draw()});
  nb.addEventListener('click',()=>{seed++;world=make(seed);draw()});draw();

  /* ---- pilot explorer ---- */
  let cur=0;const sp=$('#pilot-sp');
  PILOT.pairs.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=p.name;b.setAttribute('aria-pressed',i===0?'true':'false');
    b.addEventListener('click',()=>{cur=i;$$('#pilot-sp .chip').forEach((x,k)=>x.setAttribute('aria-pressed',k===i?'true':'false'));drawPilot()});sp.appendChild(b)});
  function drawPilot(){const P=PILOT.pairs[cur];const s=$('#pilot-svg');clearEl(s);
    const g=(f,h)=>(P.rows[f]&&P.rows[f][h])||{loci:0,intact:0};
    let max=0;FAM.forEach(f=>['hap1','hap2'].forEach(h=>{max=Math.max(max,g(f,h).loci)}));max=Math.max(10,Math.ceil(max/10)*10);
    const L=50,B=300,T=20,W=700,H=B-T,gw=W/FAM.length;
    [0,.5,1].forEach(k=>{const y=B-k*H;sv('line',{x1:L,y1:y,x2:L+W,y2:y,class:'grid'},s);sv('text',{x:L-8,y:y+5,'text-anchor':'end',class:'muted'},s,String(Math.round(max*k)))});
    sv('line',{x1:L,y1:B,x2:L+W,y2:B,class:'axis'},s);
    FAM.forEach((f,i)=>{const gx=L+i*gw;
      [['hap1','--h1',gx+gw/2-30],['hap2','--h2',gx+gw/2+2]].forEach(([h,col,x])=>{const d=g(f,h),ht=d.loci/max*H,hi=d.intact/max*H;
        if(d.loci>0)sv('rect',{x:x,y:B-ht,width:28,height:ht,style:'fill:var('+col+');fill-opacity:.28;stroke:var('+col+');stroke-width:1.5'},s);
        if(d.intact>0)sv('rect',{x:x,y:B-hi,width:28,height:hi,style:'fill:var('+col+')'},s);
        sv('text',{x:x+14,y:B-ht-6,'text-anchor':'middle'},s,String(d.loci))});
      sv('text',{x:gx+gw/2,y:B+26,'text-anchor':'middle'},s,f)});
    let h='<thead><tr><th>Семейство</th><th><span class="sw h1"></span>hap1: локусы (intact)</th><th><span class="sw h2"></span>hap2: локусы (intact)</th><th>hap2 − hap1, локусы</th></tr></thead><tbody>';
    FAM.forEach(f=>{const a=g(f,'hap1'),b=g(f,'hap2'),d=b.loci-a.loci;h+='<tr><td>'+f+'</td><td>'+a.loci+' ('+a.intact+')</td><td>'+b.loci+' ('+b.intact+')</td><td>'+(d>0?'+':'')+d+'</td></tr>'});
    $('#pilot-tbl').innerHTML=h+'</tbody>'}
  drawPilot()};

INIT.stats=function(){
  /* ---- Poisson coverage ---- */
  const cm=$('#cov-mean');
  function cov(){const lam=Number(cm.value);$('#cov-meanv').textContent=lam;const K=Math.ceil(lam*2);const pm=[Math.exp(-lam)];for(let k=1;k<=K;k++)pm.push(pm[k-1]*lam/k);
    let cdf=0;for(let k=0;k<=9;k++)cdf+=pm[k]||0;
    $('#cov-frac').textContent=cdf>=0.001?fmt(cdf*100,1)+' %':sci(cdf);
    const n=cdf*2e9;$('#cov-mb').textContent=n>=1e6?fmt(n/1e6,1)+' млн':(n>=1e3?fmt(n/1e3,0)+' тыс.':fmt(n,0));
    const s=$('#cov-svg');clearEl(s);const L=40,B=180,H=150,W=700,mx=Math.max(...pm),bw=W/(K+1);
    sv('line',{x1:L,y1:B,x2:L+W,y2:B,class:'axis'},s);
    pm.forEach((p,k)=>{const h=p/mx*H;sv('rect',{x:L+k*bw+1,y:B-h,width:Math.max(bw-2,1),height:h,style:'fill:var('+(k<10?'--bad':'--line-strong')+')'},s)});
    [0,10,Math.round(lam),K].filter((v,i,a)=>a.indexOf(v)===i).forEach(k=>{sv('text',{x:L+k*bw+bw/2,y:B+24,'text-anchor':'middle'},s,String(k))});
    sv('text',{x:L+W,y:20,'text-anchor':'end'},s,'красные столбцы — покрытие меньше 10')}
  cm.addEventListener('input',cov);cov();
  /* ---- permutation ---- */
  $('#perm-run').addEventListener('click',()=>{
    const a=parseNums($('#perm-a').value),b=parseNums($('#perm-b').value);const s=$('#perm-svg');clearEl(s);
    if(a.length<2||b.length<2){$('#perm-obs').textContent='—';$('#perm-p').textContent='нужно ≥2 числа в группе';return}
    const mean=x=>x.reduce((p,c)=>p+c,0)/x.length;const obs=mean(b)-mean(a);const pool=a.concat(b),na=a.length,r=rng(42),N=5000,ds=[];let cnt=0;
    for(let t=0;t<N;t++){for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const tmp=pool[i];pool[i]=pool[j];pool[j]=tmp}
      const d=mean(pool.slice(na))-mean(pool.slice(0,na));ds.push(d);if(Math.abs(d)>=Math.abs(obs)-1e-12)cnt++}
    const p=(cnt+1)/(N+1);$('#perm-obs').textContent=fmt(obs,2);$('#perm-p').textContent=p<0.0001?'< 0,0001':fmt(p,4);
    const lim=Math.max(Math.abs(obs)*1.25,...ds.map(Math.abs))||1,nb=31,bins=Array(nb).fill(0);ds.forEach(d=>{bins[Math.min(nb-1,Math.floor((d+lim)/(2*lim)*nb))]++});
    const L=30,B=185,H=140,W=700,bw=W/nb,mx=Math.max(...bins);
    sv('line',{x1:L,y1:B,x2:L+W,y2:B,class:'axis'},s);
    bins.forEach((c,i)=>{const h=c/mx*H;const xc=-lim+(i+.5)*2*lim/nb;sv('rect',{x:L+i*bw+1,y:B-h,width:bw-2,height:h,style:'fill:var('+(Math.abs(xc)>=Math.abs(obs)?'--bad':'--line-strong')+')'},s)});
    [obs,-obs].forEach(v=>{const x=L+(v+lim)/(2*lim)*W;sv('line',{x1:x,y1:20,x2:x,y2:B,style:'stroke:var(--ink);stroke-width:2;stroke-dasharray:5 4'},s)});
    sv('text',{x:L+(obs+lim)/(2*lim)*W,y:16,'text-anchor':'middle'},s,'наблюдаемая');sv('text',{x:L,y:B+24},s,fmt(-lim,1));sv('text',{x:L+W,y:B+24,'text-anchor':'end'},s,fmt(lim,1));sv('text',{x:L+W/2,y:B+24,'text-anchor':'middle'},s,'0')});
  $('#perm-run').click();
  /* ---- multiple testing ---- */
  function erfc(x){const z=Math.abs(x),t=1/(1+.5*z);const r=t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(.37409196+t*(.09678418+t*(-.18628806+t*(.27886807+t*(-1.13520398+t*(1.48851587+t*(-.82215223+t*.17087277)))))))));return x>=0?r:2-r}
  function mt(){const m=Math.max(200,Math.min(50000,Number($('#mt-m').value)||10000)),fr=Math.max(0,Math.min(50,Number($('#mt-true').value)||0))/100,eff=Number($('#mt-eff').value)||3;
    const r=rng(1),nt=Math.round(m*fr);const p=new Float64Array(m),tr=new Uint8Array(m);
    for(let i=0;i<m;i++){const u1=r()||1e-12,u2=r();let z=Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);if(i<nt){z+=eff;tr[i]=1}p[i]=erfc(Math.abs(z)/Math.SQRT2)}
    const ord=Array.from(p.keys()).sort((a,b)=>p[a]-p[b]);let k=0;for(let i=0;i<m;i++){if(p[ord[i]]<=.05*(i+1)/m)k=i+1}
    const bh=new Uint8Array(m);for(let i=0;i<k;i++)bh[ord[i]]=1;
    const row=(name,f)=>{let a=0,b=0;for(let i=0;i<m;i++)if(f(i)){a++;if(tr[i])b++}const fp=a-b;return '<tr><td>'+name+'</td><td>'+a+'</td><td>'+b+'</td><td>'+fp+'</td><td>'+(a?fmt(fp/a*100,1)+' %':'—')+'</td></tr>'};
    $('#mt-tbl').innerHTML='<thead><tr><th>Метод</th><th>Найдено</th><th>настоящих</th><th>ложных</th><th>доля ложных</th></tr></thead><tbody>'+row('p < 0,05 без поправки',i=>p[i]<.05)+row('Бонферрони',i=>p[i]<.05/m)+row('Бенджамини–Хохберг, 5 %',i=>bh[i])+'</tbody>'}
  $('#mt-run').addEventListener('click',mt);mt()};

INIT.singlecell=function(){
  const st=MARK_GENES.map(()=>'?');
  function render(){
    let h='<thead><tr><th>Ген</th><th>Статус в наборе</th></tr></thead><tbody>';
    MARK_GENES.forEach((g,i)=>{h+='<tr><td><code>'+g+'</code></td><td><div class="field-inline" role="group" aria-label="'+g+'">'+['+','?','−'].map(v=>'<button type="button" class="chip" data-g="'+i+'" data-v="'+v+'" aria-pressed="'+((st[i]===v)?'true':'false')+'">'+v+'</button>').join('')+'</div></td></tr>'});
    $('#marker-genes').innerHTML=h+'</tbody>';
    $$('#marker-genes .chip').forEach(b=>b.addEventListener('click',()=>{st[Number(b.dataset.g)]=b.dataset.v;render()}));
    const any=st.some(v=>v!=='?');let ok=0,res='<thead><tr><th>Тип клеток</th><th>Подходит ли</th><th>Почему</th></tr></thead><tbody>';
    MARK_TYPES.forEach(([name,lv])=>{let excl=[],poss=[];
      st.forEach((v,i)=>{if(v==='?')return;const l=lv[i];if(v==='+'){if(l===0)excl.push(MARK_GENES[i]+' обычно нет');else if(l===.5)poss.push(MARK_GENES[i]+' бывает')}else{if(l===1)excl.push(MARK_GENES[i]+' обычно есть');else if(l===.5)poss.push(MARK_GENES[i]+' бывает')}});
      let s,why;if(!any){s='—';why='Набор пуст'}else if(excl.length){s='исключён';why=excl.join('; ')}else if(poss.length){s='возможно';why=poss.join('; ');ok++}else{s='совместим';why='Все выбранные признаки сходятся';ok++}
      res+='<tr><td>'+name+'</td><td><b class="'+(s==='исключён'?'hap2':(s==='—'?'':'hap1'))+'">'+s+'</b></td><td>'+esc(why)+'</td></tr>'});
    $('#marker-res').innerHTML=res+'</tbody>';
    $('#marker-msg').textContent=any?('Под набор подходит или возможен тип клеток: '+ok+' из '+MARK_TYPES.length+'. Чем больше, тем слабее подпись.'):'Выбери «+» или «−» хотя бы для одного гена.'}
  render()};

INIT.pipelines=function(){
  const tabs=$('#pipe-tabs'),steps=$('#pipe-steps'),det=$('#pipe-detail');let key='exome',cur=0;
  Object.keys(PIPES).forEach(k=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=PIPES[k].name;b.dataset.k=k;b.setAttribute('aria-pressed',k===key?'true':'false');
    b.addEventListener('click',()=>{key=k;cur=0;$$('#pipe-tabs .chip').forEach(x=>x.setAttribute('aria-pressed',x.dataset.k===k?'true':'false'));draw()});tabs.appendChild(b)});
  function draw(){clearEl(steps);const P=PIPES[key];
    P.steps.forEach((s,i)=>{const li=document.createElement('li');const b=document.createElement('button');b.type='button';b.className='chip';b.style.width='100%';b.style.justifyContent='flex-start';b.style.textAlign='left';b.textContent=s.t;b.setAttribute('aria-pressed',i===cur?'true':'false');
      b.addEventListener('click',()=>{cur=i;draw()});li.appendChild(b);li.style.marginBottom='6px';steps.appendChild(li)});
    const s=P.steps[cur];det.innerHTML='<h3 style="margin-top:0">'+esc(s.t)+'</h3><p><b>Вход:</b> '+esc(s.i)+'<br><b>Выход:</b> '+esc(s.o)+'</p><p><b>Что проверять:</b> '+esc(s.c)+'</p><p><b>Как ломается:</b> '+esc(s.f)+'</p>'}
  draw()};

INIT.glossary=function(){
  const q=$('#gl-q'),list=$('#gl-list'),cnt=$('#gl-count');const items=GLOSS.slice().sort((a,b)=>a[0].localeCompare(b[0],'ru'));
  function draw(){const t=q.value.trim().toLowerCase();const f=items.filter(([a,b])=>!t||(a+' '+b).toLowerCase().includes(t));
    list.innerHTML=f.map(([a,b,m])=>'<dt style="font-weight:700;margin-top:1rem">'+esc(a)+'</dt><dd style="margin:.1rem 0 0">'+esc(b)+' <a href="#'+m+'">Где разбирается</a></dd>').join('')||'<p>Ничего не найдено.</p>';
    cnt.textContent='Найдено: '+f.length+' из '+items.length}
  q.addEventListener('input',draw);draw()};
