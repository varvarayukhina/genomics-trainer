/* ---------- WIDGETS 1: genome, assembly, formats, alignment ---------- */
const BASES='TCAG',AMINO='FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
const CODON={};{let i=0;for(const a of BASES)for(const b of BASES)for(const c of BASES)CODON[a+b+c]=AMINO[i++]}
function translate(d){let p='';for(let i=0;i+3<=d.length;i+=3){const aa=CODON[d.slice(i,i+3)]||'?';p+=aa;if(aa==='*')break}return p}

function hatchDef(svg,id){const d=sv('defs',{},svg);const p=sv('pattern',{id:id,width:6,height:6,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},d);
  sv('rect',{width:6,height:6,style:'fill:var(--surface)'},p);sv('line',{x1:0,y1:0,x2:0,y2:6,style:'stroke:var(--ink);stroke-width:2'},p)}
function geneBox(svg,x,y,w,h,kind,col,hatch){
  if(kind==='gene')sv('rect',{x:x,y:y,width:w,height:h,rx:3,style:'fill:var('+col+')'},svg);
  else if(kind==='pseudo')sv('rect',{x:x,y:y,width:w,height:h,rx:3,style:'fill:url(#'+hatch+');stroke:var('+col+');stroke-width:3'},svg);
  else sv('rect',{x:x,y:y,width:w,height:h,rx:3,style:'fill:none;stroke:var(--line-strong);stroke-width:2;stroke-dasharray:5 4'},svg)}

/* ---- genome ---- */
INIT.genome=function(){
  const steps=[
   ['≈ 2 000 000 000','геном','У летучих мышей из пилота один набор хромосом (один гаплотип) около 2 миллиардов букв: 1,99 млрд у Eidolon, 2,28 млрд у Rhinolophus (hap1).'],
   ['10⁷–10⁸','хромосома','Хромосомы — сотни и десятки миллионов букв. Scaffold N50 в сборках пилота: около 93 млн у Rhinolophus и 130 млн у Eidolon.'],
   ['≈ 10⁶','локус / регион','Регион с кластером рецепторов NK у Myotis sodalis (NKC, хромосома 3, hap1): примерно 1,7 млн букв. В нём 11 найденных локусов.'],
   ['10³–10⁵','ген','Ген вместе с интронами занимает от тысяч до сотен тысяч букв.'],
   ['≈ 10²','экзон','Экзон — кусок, остающийся в зрелой РНК: обычно десятки или сотни букв.'],
   ['3','кодон','Три буквы кодируют одну аминокислоту. Сдвиг на одну букву меняет все следующие кодоны.']];
  const r=$('#scale-range');
  function upd(){const s=steps[Number(r.value)];$('#scale-size').textContent=s[0];$('#scale-name').textContent=s[1];$('#scale-text').textContent=s[2]}
  r.addEventListener('input',upd);upd();
  /* tracks */
  const a=$('#tracks-hap');hatchDef(a,'hx1');
  const rows=[['hap1','--h1',50,['gene','gene','gene','pseudo','gene','gene']],['hap2','--h2',130,['gene','gene','missing','gene','gene','gene']]];
  rows.forEach(([name,col,y,items])=>{
    sv('text',{x:8,y:y+23,style:'font-weight:700'},a,name);
    sv('line',{x1:70,y1:y+17,x2:735,y2:y+17,class:'axis'},a);
    items.forEach((k,i)=>geneBox(a,90+i*100,y,70,34,k,col,'hx1'))});
  sv('text',{x:390,y:50+34+24,'text-anchor':'middle'},a,'поломка');
  sv('text',{x:290,y:130+34+24,'text-anchor':'middle'},a,'копии нет');
  const t=$('#tracks-tandem');hatchDef(t,'hx2');
  sv('line',{x1:20,y1:47,x2:740,y2:47,class:'axis'},t);
  ['gene','gene','pseudo','gene','gene','pseudo','gene','gene'].forEach((k,i)=>geneBox(t,30+i*90,30,70,34,k,'--ink',k==='pseudo'?'hx2':'hx2'));
  sv('text',{x:65,y:96},t,'работает');sv('text',{x:65+2*90,y:96},t,'псевдоген');sv('text',{x:65+5*90,y:96},t,'псевдоген')
  t.querySelectorAll('text').forEach(x=>x.setAttribute('text-anchor','middle'))};

/* ---- assembly: N50 ---- */
INIT.assembly=function(){
  const inp=$('#n50-in');
  function calc(){
    const L=parseNums(inp.value).filter(x=>x>0).sort((a,b)=>b-a);const svg=$('#n50-bar');clearEl(svg);
    if(!L.length){['n50-total','n50-val','n50-l'].forEach(i=>{$('#'+i).textContent='—'});return}
    const total=L.reduce((a,b)=>a+b,0),half=total/2;let run=0,n50=0,l50=0;
    for(let i=0;i<L.length;i++){run+=L[i];if(run>=half){n50=L[i];l50=i+1;break}}
    $('#n50-total').textContent=fmt(total,1);$('#n50-val').textContent=fmt(n50,1);$('#n50-l').textContent=l50;
    const x0=20,W=720;let x=x0;
    L.forEach((v,i)=>{const w=Math.max(v/total*W,1.5);
      sv('rect',{x:x,y:34,width:w,height:30,style:'fill:var('+(i===l50-1?'--h2':(i%2?'--ink-2':'--ink'))+');stroke:var(--surface);stroke-width:1.5'},svg);
      if(i===l50-1)sv('text',{x:x+w/2,y:26,'text-anchor':'middle',style:'font-weight:700'},svg,'N50');x+=w});
    sv('line',{x1:x0+W/2,y1:30,x2:x0+W/2,y2:72,style:'stroke:var(--ink);stroke-width:2;stroke-dasharray:4 3'},svg);
    sv('text',{x:x0+W/2,y:88,'text-anchor':'middle'},svg,'половина сборки');
    sv('text',{x:x0,y:88},svg,'0');sv('text',{x:x0+W,y:88,'text-anchor':'end'},svg,fmt(total,1)+' Мб')}
  inp.addEventListener('input',calc);calc()};

/* ---- formats ---- */
INIT.formats=function(){
  const q=$('#phred-q'),s=$('#phred-str');
  function ph(){const Q=Number(q.value);$('#phred-qv').textContent=Q;const p=Math.pow(10,-Q/10);
    $('#phred-p').textContent=p>=0.001?fmt(p,4):sci(p);$('#phred-a').textContent=fmt((1-p)*100,Q>=40?4:2)+' %';$('#phred-ch').textContent=String.fromCharCode(33+Q)}
  function dec(){const out=[];let bad=false;[...s.value].forEach(c=>{const code=c.charCodeAt(0);if(code<33||code>126){bad=true;return}const Q=code-33;out.push(c+' → Q'+Q+' (ошибка '+fmt(Math.pow(10,-Q/10),4)+')')});
    $('#phred-dec').textContent=(bad?'Есть недопустимые символы (допустимы коды 33–126).\n':'')+(out.join('\n')||'Введи строку качества.')}
  q.addEventListener('input',ph);s.addEventListener('input',dec);ph();dec();
  /* CIGAR */
  const ci=$('#cigar-in'),cp=$('#cigar-pos');
  const OPS={M:['выровнено (совпадение или замена)',1,1],I:['вставка в прочтении',0,1],D:['выпадение в прочтении',1,0],N:['пропуск (интрон)',1,0],S:['мягкая обрезка',0,1],H:['жёсткая обрезка',0,0],P:['padding',0,0],'=':['точное совпадение',1,1],X:['замена',1,1]};
  function cg(){const str=ci.value.trim().toUpperCase();const tbl=$('#cigar-tbl');
    if(!/^(\d+[MIDNSHP=X])+$/.test(str)){tbl.innerHTML='<tbody><tr><td>Формат: число и буква, например 40M2I30M.</td></tr></tbody>';['cigar-ref','cigar-qry','cigar-end'].forEach(i=>{$('#'+i).textContent='—'});return}
    const ops=[...str.matchAll(/(\d+)([MIDNSHP=X])/g)].map(m=>[Number(m[1]),m[2]]);let ref=0,qry=0;
    let html='<thead><tr><th>Операция</th><th>Длина</th><th>Смысл</th><th>Референс (накоп.)</th><th>Прочтение (накоп.)</th></tr></thead><tbody>';
    ops.forEach(([n,o])=>{const d=OPS[o];ref+=d[1]*n;qry+=d[2]*n;html+='<tr><td><code>'+o+'</code></td><td>'+n+'</td><td>'+d[0]+'</td><td>'+ref+'</td><td>'+qry+'</td></tr>'});
    tbl.innerHTML=html+'</tbody>';const pos=Number(cp.value)||1;
    $('#cigar-ref').textContent=ref;$('#cigar-qry').textContent=qry;$('#cigar-end').textContent=(pos+ref-1).toLocaleString('ru-RU')}
  ci.addEventListener('input',cg);cp.addEventListener('input',cg);cg();
  /* coordinates */
  const f=$('#coord-fmt'),cs=$('#coord-s'),ce=$('#coord-e');
  function co(){const s0=Number(cs.value),e0=Number(ce.value),o=$('#coord-out');
    if(!(e0>=s0)){o.textContent='Конец не может быть меньше начала.';return}
    let gs,ge,bs,be;if(f.value==='gff'){gs=s0;ge=e0;bs=s0-1;be=e0}else{bs=s0;be=e0;gs=s0+1;ge=e0}
    o.textContent='GFF3 / VCF / SAM (с 1, конец включён): '+gs+' – '+ge+'  (длина '+(ge-gs+1)+')\nBED / PAF (с 0, конец не включён): '+bs+' – '+be+'  (длина '+(be-bs)+')\nsamtools faidx genome.fa chr3:'+gs+'-'+ge}
  [f,cs,ce].forEach(e=>e.addEventListener('input',co));co()};

/* ---- alignment ---- */
INIT.alignment=function(){
  const A=$('#sw-a'),B=$('#sw-b'),M=$('#sw-m'),X=$('#sw-x'),G=$('#sw-g');
  function sw(){const a=A.value.toUpperCase().replace(/[^A-Z]/g,''),b=B.value.toUpperCase().replace(/[^A-Z]/g,'');const m=Number(M.value),x=Number(X.value),g=Number(G.value);
    const out=$('#sw-out'),mx=$('#sw-matrix');
    if(!a||!b){out.textContent='Введи обе последовательности.';mx.innerHTML='';return}
    if(a.length>20||b.length>20){out.textContent='Для матрицы нужно не больше 20 букв в каждой.';mx.innerHTML='';return}
    const R=a.length+1,C=b.length+1,H=Array.from({length:R},()=>Array(C).fill(0));let best=0,bi=0,bj=0;
    for(let i=1;i<R;i++)for(let j=1;j<C;j++){const d=H[i-1][j-1]+(a[i-1]===b[j-1]?m:x);H[i][j]=Math.max(0,d,H[i-1][j]+g,H[i][j-1]+g);if(H[i][j]>best){best=H[i][j];bi=i;bj=j}}
    let i=bi,j=bj;const t=[],bt=[],mid=[],path=new Set();
    while(i>0&&j>0&&H[i][j]>0){path.add(i+','+j);const s=a[i-1]===b[j-1]?m:x;
      if(H[i][j]===H[i-1][j-1]+s){t.push(a[i-1]);bt.push(b[j-1]);mid.push(a[i-1]===b[j-1]?'|':' ');i--;j--}
      else if(H[i][j]===H[i-1][j]+g){t.push(a[i-1]);bt.push('-');mid.push(' ');i--}
      else{t.push('-');bt.push(b[j-1]);mid.push(' ');j--}}
    out.textContent='Счёт: '+best+'\n'+t.reverse().join('')+'\n'+mid.reverse().join('')+'\n'+bt.reverse().join('');
    let h='<table class="matrix"><tr><th></th><th></th>'+[...b].map(c=>'<th>'+c+'</th>').join('')+'</tr>';
    for(let r=0;r<R;r++){h+='<tr><th>'+(r?a[r-1]:'')+'</th>';for(let c=0;c<C;c++)h+='<td'+(path.has(r+','+c)?' class="path"':'')+'>'+H[r][c]+'</td>';h+='</tr>'}
    mx.innerHTML=h+'</table>'}
  [A,B,M,X,G].forEach(e=>e.addEventListener('input',sw));sw();
  /* frameshift */
  const dna=$('#fs-dna'),pos=$('#fs-pos');let size=1;
  function fs(){const d=dna.value.toUpperCase().replace(/[^ACGT]/g,'');const o=$('#fs-out');
    pos.max=Math.max(d.length-1,0);if(Number(pos.value)>Number(pos.max))pos.value=pos.max;const p=Number(pos.value);$('#fs-posv').textContent=p;
    if(d.length<6){o.textContent='Введи последовательность из A, C, G, T (не меньше 6 букв).';return}
    const mut=d.slice(0,p)+d.slice(p+size);const orig=translate(d),np=translate(mut);
    const cod=s=>(s.match(/.{1,3}/g)||[]).join(' ');
    let msg;
    if(size===0)msg='Ничего не выпало.';
    else if(size%3!==0){
      if(np.endsWith('*')&&np.length<orig.length)msg='Сдвиг рамки. Преждевременный стоп: белок короче на '+(orig.length-np.length)+' аминокислот.';
      else if(np.endsWith('*'))msg='Сдвиг рамки. Стоп найден, но не раньше исходного.';
      else msg='Сдвиг рамки. Стоп до конца последовательности не найден: после точки выпадения белок совсем другой.'}
    else msg=np===orig?'Выпадение в рамке, белок не изменился.':'Выпадение в рамке: белок отличается от исходного, но рамка считывания сохранена.';
    o.innerHTML='ДНК до:     <span class="dna">'+esc(cod(d))+'</span>\nБелок до:   <span class="prot">'+esc(orig.replace(/\*/g,'*'))+'</span>\nВыпало:     <span class="dna">'+(size?esc(d.slice(p,p+size))+' (с позиции '+p+')':'—')+'</span>\nДНК после:  <span class="dna">'+esc(cod(mut))+'</span>\nБелок после: <span class="prot">'+esc(np)+'</span>\n\n<b>'+esc(msg)+'</b>'}
  dna.addEventListener('input',fs);pos.addEventListener('input',fs);
  $$('#fs-widget .chip').forEach(b=>b.addEventListener('click',()=>{size=Number(b.dataset.size);$$('#fs-widget .chip').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));fs()}));
  fs()};
