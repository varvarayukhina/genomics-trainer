/* ---------- MAP of tasks and CODE-READING list ---------- */
const MAP=[
 {q:'Сколько копий у гена или семейства генов в геноме?',
  data:'Сборка генома (FASTA) и белки-запросы (FASTA).',
  method:'Выравнивание белка с геномом, отбор хитов, группировка хитов в локусы, оценка целости (сдвиги, стопы).',
  tools:'miniprot, tblastn (BLAST); сборки и белки из NCBI Datasets.',
  out:'Таблица локусов: координаты, статус (целый, частичный, псевдоген).',
  check:'Просмотр локусов в браузере генома, повтор при другом пороге чувствительности, данные РНК.',
  trap:'Схлопнутые повторы в сборке, зависимость числа от порога и от набора запросов. «Не найден» не значит «нет гена».',
  mods:[['copies','Семейства генов и копии'],['alignment','Выравнивание и поиск генов']],tasks:['translate','premature','hapdiff']},
 {q:'Чем отличаются два генома или два гаплотипа одной особи?',
  data:'Две сборки (FASTA), лучше хромосомного уровня.',
  method:'Выравнивание геном-с-геномом по регионам, поиск пропусков, вставок, инверсий.',
  tools:'minimap2 (режим asm5 или asm10), MUMmer.',
  out:'Файл выравнивания (PAF) и таблица различий.',
  check:'Края контигов и N-пробелы, перекартирование исходных длинных прочтений на оба гаплотипа.',
  trap:'Ошибки сборки выглядят как биологические различия. Фаза может переключаться.',
  mods:[['assembly','Сборка генома'],['copies','Семейства генов и копии']],tasks:['overlap','cigar']},
 {q:'Какие варианты есть у образца?',
  data:'Прочтения (FASTQ) и референсный геном.',
  method:'Выравнивание, пометка дубликатов, вызов вариантов, фильтрация.',
  tools:'BWA-MEM2 или minimap2, samtools, GATK HaplotypeCaller, bcftools.',
  out:'Файл VCF с вариантами и генотипами.',
  check:'Ti/Tv, доля гетерозигот, пол по X/Y, контаминация, покрытие.',
  trap:'Неверный референс, мало покрытия, слишком мягкие фильтры.',
  mods:[['formats','Форматы файлов'],['pipelines','Пайплайны']],tasks:['vcf','het','cigar','meanq']},
 {q:'Какие варианты связаны с признаком или болезнью?',
  data:'VCF когорты, фенотипы, сведения о происхождении.',
  method:'Ассоциативный анализ: логистическая регрессия, регрессия Фёрса для редких вариантов, SKAT-O для наборов редких вариантов.',
  tools:'PLINK; R: SKAT, logistf.',
  out:'Таблица p-значений и размеров эффекта.',
  check:'QQ-график, поправка на множественные сравнения, главные компоненты происхождения.',
  trap:'Структура популяции, малые выборки, множественные сравнения.',
  mods:[['stats','Статистика для омики']],tasks:['bh','perm']},
 {q:'Какие гены экспрессируются по-разному между условиями?',
  data:'Таблица счётов RNA-seq (гены × образцы) и план эксперимента.',
  method:'Модель на отрицательном биномиальном распределении, поправка Бенджамини–Хохберга.',
  tools:'DESeq2, edgeR (R); pydeseq2 (Python).',
  out:'Таблица log2FC и скорректированных p (padj) по генам.',
  check:'PCA образцов, MA-график, учёт батча.',
  trap:'При n = 3 мощность низка. Если батч совпал с группой, эффекты неразделимы.',
  mods:[['stats','Статистика для омики']],tasks:['bh','boot']},
 {q:'Какие клетки есть в образце и чем они отличаются?',
  data:'Матрица scRNA-seq (клетки × гены).',
  method:'Контроль качества, нормализация, PCA, граф соседей, кластеризация, маркеры, аннотация.',
  tools:'Scanpy (Python), Seurat (R).',
  out:'Кластеры клеток, списки маркеров, метки типов.',
  check:'Независимые маркеры или белки, референсные атласы, несколько значений resolution.',
  trap:'Метки по маркерам хрупкие, UMAP не количественный, клетки одного животного не независимы.',
  mods:[['singlecell','Одноклеточные данные'],['stats','Статистика для омики']],tasks:[]},
 {q:'Хорошая ли получилась сборка?',
  data:'Сборка (FASTA) и исходные прочтения.',
  method:'Связность (N50), полнота набора ожидаемых генов (BUSCO), точность по k-мерам (QV).',
  tools:'BUSCO, merqury, QUAST.',
  out:'Отчёт с набором метрик.',
  check:'Смотреть несколько метрик вместе и сравнивать с родственной сборкой.',
  trap:'Высокий N50 не гарантирует правильность.',
  mods:[['assembly','Сборка генома']],tasks:['n50','kmer']},
 {q:'Как гены и виды связаны эволюционно?',
  data:'Последовательности ортологов и паралогов.',
  method:'Множественное выравнивание, построение дерева, сопоставление с деревом видов.',
  tools:'MAFFT, IQ-TREE.',
  out:'Филогенетическое дерево с поддержкой ветвей.',
  check:'Поддержка ветвей (bootstrap), проверка выравнивания глазами.',
  trap:'Путаница ортологов и паралогов, плохое выравнивание.',
  mods:[['interview','Собеседование (ортолог и паралог)']],tasks:['sw'],
  note:'Модуля про филогению в тренажёре пока нет, есть только определения и задача на выравнивание.'},
 {q:'Достаточно ли у меня данных?',
  data:'Дизайн эксперимента и ожидаемый размер эффекта.',
  method:'Оценка мощности и нужного числа образцов или покрытия, чаще симуляцией.',
  tools:'Python или R, любой скрипт-симулятор.',
  out:'Нужное число образцов, покрытие.',
  check:'Считать на реалистичных, а не оптимистичных эффектах.',
  trap:'Опираться на самый большой эффект из литературы.',
  mods:[['stats','Статистика для омики']],tasks:['poisson','perm']},
 {q:'Где взять публичные данные?',
  data:'Название вида, нужный тип данных.',
  method:'Поиск по базам и скачивание через сайт или командную строку.',
  tools:'NCBI Datasets, SRA Toolkit, ENA, Ensembl.',
  out:'Файлы сборок, аннотаций, прочтений с метаданными.',
  check:'Версии сборки и аннотации, одинаковый ли BioSample у hap1 и hap2.',
  trap:'Разные версии сборок и аннотаций, перепутанные образцы.',
  mods:[['assembly','Сборка генома']],tasks:[]}
];
INIT.map=function(){
  const box=$('#map-list');
  MAP.forEach(m=>{
    const d=document.createElement('details');d.className='qa';
    const rows=[['Данные',m.data],['Метод',m.method],['Инструменты',m.tools],['Результат',m.out],['Как проверить',m.check],['Ловушка',m.trap]];
    let h='<summary>'+esc(m.q)+'</summary><div><dl style="margin:0">'+rows.map(r=>'<dt style="font-weight:700;margin-top:.6rem">'+r[0]+'</dt><dd style="margin:0">'+esc(r[1])+'</dd>').join('')+'</dl>';
    if(m.note)h+='<p class="meta" style="margin-top:.6rem">'+esc(m.note)+'</p>';
    h+='<p style="margin-top:.8rem"><b>Где в тренажёре:</b> '+m.mods.map(x=>'<a href="#'+x[0]+'">'+esc(x[1])+'</a>').join(', ')+'</p>';
    if(m.tasks.length)h+='<div class="field-inline">'+m.tasks.map(id=>{const t=TASKS.find(x=>x.id===id);return t?'<button type="button" class="chip" data-task="'+id+'">Задача: '+esc(t.title)+'</button>':''}).join('')+'</div>';
    d.innerHTML=h+'</div>';box.appendChild(d)});
  box.addEventListener('click',e=>{const b=e.target.closest('[data-task]');if(b)openTask(b.dataset.task)})};

INIT.code=function(){
  const box=$('#code-list');
  if(!Array.isArray(CODEREAD)||!CODEREAD.length){box.innerHTML='<p class="note warn">Подборка репозиториев ещё собирается.</p>';return}
  const link=(u,t)=>u?'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(t)+'</a>':esc(t);
  CODEREAD.forEach(r=>{
    const s=document.createElement('section');s.className='bench';
    const p=r.paper||{};
    let h='<h3>'+link(r.repo_url,r.name)+'</h3><p class="hint">'+esc(r.topic||'')+'</p>';
    h+='<p><b>Статья:</b> '+(p.title?esc(p.title)+', '+esc(p.journal||'')+' '+esc(p.year||'')+(p.doi?' ('+link('https://doi.org/'+p.doi,'doi:'+p.doi)+')':''):'не проверено')+'</p>';
    h+='<p><b>Язык:</b> '+esc(r.language||'?')+' · <b>лицензия:</b> '+esc(r.license||'не указана')+' · <b>сложность:</b> '+esc(r.difficulty||'?')+' из 3</p>';
    h+='<p><b>Что читать:</b> '+(r.permalink?link(r.permalink,r.file_path+(r.line_range?' (строки '+(Array.isArray(r.line_range)?r.line_range.join('–'):r.line_range)+')':'')):esc(r.file_path||'не указано'))+'</p>';
    if(r.what)h+='<p>'+esc(r.what)+'</p>';
    if(r.skill)h+='<p class="meta">Чему учит: '+esc(r.skill)+'</p>';
    if(Array.isArray(r.questions))h+=r.questions.map(q=>'<details class="qa"><summary>'+esc(q.q)+'</summary><div><p>'+esc(q.a)+'</p>'+(q.lines?'<p class="meta">Строки: '+esc(q.lines)+'</p>':'')+'</div></details>').join('');
    if(Array.isArray(r.unverified)&&r.unverified.length)h+='<p class="note warn"><b>Не проверено</b>'+esc(r.unverified.join('; '))+'</p>';
    s.innerHTML=h;box.appendChild(s)})};
