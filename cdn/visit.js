(function(){
var FAQ=[
  {q:'Нужно ли записываться заранее?',a:'Шоурум THE BOYS работает по\u00a0записи, потому что наши гости ценят комфорт и\u00a0камерную атмосферу. Работа по\u00a0записи позволяет каждому нашему гостю выбирать и\u00a0примерять вещи в\u00a0спокойной обстановке без присутствия посторонних.'},
  {q:'Что происходит на примерке?',a:'Сначала коротко говорим, зачем вы пришли. Дальше спокойно примеряете вещи без очереди и\u00a0посторонних: смотрим посадку, сочетания и\u00a0то, как вещь сидит именно на вас.'},
  {q:'Стоит ли заранее говорить размер и пожелания?',a:'Если уже есть ориентир по\u00a0размеру, поводу или тому, чего точно не хочется\u00a0— напишите заранее. Это не обязательно, но так к\u00a0визиту можно подготовить вещи, а\u00a0не собирать всё на ходу.'},
  {q:'Какая у вас ценовая категория?',a:'Мы не собираем гардероб на один выход: вещи рассчитаны на то, чтобы их носили долго. Точную вилку лучше назвать до визита или обсудить на месте, без сюрприза в\u00a0примерочной.'},
  {q:'Что если мне нужна помощь с подбором полного образа?',a:'Можно прийти именно за этим. Соберём образ целиком\u00a0— от базы до деталей\u00a0— исходя из того, как вы живёте, а\u00a0не из абстрактного лука.'}
];
var PLUS='<svg class="tb-pop__plus" width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path opacity=".4" d="M8 4.45669H4.48126V8H3.56608V4.45669H0V3.54331H3.56608V0H4.48126V3.54331H8V4.45669Z" fill="#04100C"/></svg>';
var XICO='<svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path d="M4 0V8" stroke="#04100C"/><path d="M8 4H0" stroke="#04100C"/></svg>';
var root,stage,openI=0,locked=0,hideT=0,built=0,rsT=0,keyOn=0;
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function ab(w){return w>=1200?1200:w>=960?960:w>=640?640:390;}
function scale(){
  if(!stage)return;
  var w=document.documentElement.clientWidth||innerWidth||320;if(w<320)w=320;
  var h=innerHeight||document.documentElement.clientHeight||700,a=ab(w),sc=w/a;
  stage.setAttribute('data-ab',a);stage.style.width=a+'px';stage.style.height=(h/sc)+'px';stage.style.transformOrigin='top left';stage.style.zoom=sc;
}
function setOpen(i){
  openI=i;var items=stage.querySelectorAll('.tb-pop__item');
  for(var n=0;n<items.length;n++){var on=n===i;items[n].classList.toggle('is-open',on);var b=items[n].querySelector('.tb-pop__q');if(b)b.setAttribute('aria-expanded',on?'true':'false');}
}
function render(){
  var h='<div class="tb-pop__card" role="dialog" aria-modal="true" aria-labelledby="tbVisitTitle"><button type="button" class="tb-pop__close" data-close><span>закрыть</span>'+XICO+'</button><div class="tb-pop__body"><div class="tb-pop__main"><h2 class="tb-pop__title" id="tbVisitTitle">Что важно знать<br>перед визитом</h2><div class="tb-pop__acc">';
  for(var i=0;i<FAQ.length;i++){var on=i===openI;h+='<div class="tb-pop__item'+(on?' is-open':'')+'"><button type="button" class="tb-pop__q" aria-expanded="'+(on?'true':'false')+'" data-i="'+i+'"><span>'+esc(FAQ[i].q)+'</span>'+PLUS+'</button><div class="tb-pop__a-wrap"><div class="tb-pop__a-inner"><p class="tb-pop__a">'+esc(FAQ[i].a)+'</p></div></div><div class="tb-pop__line"></div></div>';}
  h+='</div></div><p class="tb-pop__foot">Не знаете, что именно нужно?<br>Ничего страшного. Разберёмся на месте.</p></div></div>';
  stage.innerHTML=h;
}
function lock(on){var html=document.documentElement;if(on&&!locked){locked=1;html.classList.add('tb-visit-lock');html.style.overflow=document.body.style.overflow='hidden';}else if(!on&&locked){locked=0;html.classList.remove('tb-visit-lock');html.style.overflow=document.body.style.overflow='';}}
function noMotion(){return matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;}
function onKey(e){if(e.key==='Escape'&&root&&!root.hidden)close();}
function setKey(on){if(on===keyOn)return;keyOn=on;document[on?'addEventListener':'removeEventListener']('keydown',onKey);}
function finish(){if(!root||root.classList.contains('is-on'))return;root.hidden=1;root.classList.remove('is-out');lock(0);setKey(0);}
function open(){
  ensure();if(!root||(!root.hidden&&root.classList.contains('is-on')))return;
  clearTimeout(hideT);root.classList.remove('is-out');root.hidden=0;scale();lock(1);setKey(1);
  if(noMotion())root.classList.add('is-on');
  else{root.classList.remove('is-on');void root.offsetWidth;requestAnimationFrame(function(){root.classList.add('is-on');});}
}
function close(){if(!root||root.hidden)return;root.classList.remove('is-on');root.classList.add('is-out');clearTimeout(hideT);lock(0);if(window.__tbReleaseScroll)window.__tbReleaseScroll();if(noMotion())finish();else hideT=setTimeout(finish,720);}
function onStage(e){
  if(e.target===stage||e.target.closest('[data-close]')){close();return;}
  var q=e.target.closest('.tb-pop__q');if(!q)return;var i=+q.getAttribute('data-i');setOpen(i===openI?-1:i);
}
function popHash(e){var n=e.target;if(n&&n.nodeType===3)n=n.parentElement;if(!n||!n.closest)return'';var a=n.closest('a[href]');if(!a)return'';var h='';try{h=a.hash||'';}catch(err){}if(!h){var raw=a.getAttribute('href')||'',i=raw.indexOf('#');if(i>=0)h=raw.slice(i);}return String(h||'').replace(/^#/,'').split(/[?&\/]/)[0].toLowerCase();}function onDoc(e){var n=e.target;if(n&&n.nodeType===3)n=n.parentElement;var byClass=n&&n.closest&&n.closest('.visit');var p=n&&n.closest&&n.closest('[data-tb-pop=visit]');var h=popHash(e);if(!byClass&&!p&&h!=='visit'&&h!=='tb-visit')return;e.preventDefault();if(e.stopPropagation)e.stopPropagation();open();}
function ensure(){
  if(built)return;built=1;
  root=document.getElementById('tbVisitPop');
  if(!root){root=document.createElement('div');root.id='tbVisitPop';root.className='tb-pop uc-no-scale';root.hidden=1;stage=document.createElement('div');stage.className='tb-pop__stage';root.appendChild(stage);document.documentElement.appendChild(root);}
  else{stage=root.querySelector('.tb-pop__stage');root.classList.add('uc-no-scale');}
  render();stage.addEventListener('click',onStage);
  addEventListener('resize',function(){clearTimeout(rsT);rsT=setTimeout(function(){if(root&&!root.hidden)scale();},150);});
}
function boot(){
  document.addEventListener('click',onDoc,true);
  window.tbVisitPop={open:open,close:close,toggle:function(){root&&!root.hidden&&root.classList.contains('is-on')?close():open();}};
  var demo=document.getElementById('tbVisitDemo');
  if(document.getElementById('allrecords')){if(demo)demo.hidden=1;}
  else{ensure();open();}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();