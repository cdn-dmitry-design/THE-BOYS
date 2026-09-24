(function(){
if(window.__tbStory)return;
window.__tbStory=1;
var PHOTO='https://static.tildacdn.com/tild6435-6634-4266-b836-373062653064/story-1.png';
var STORIES=[
  {
    id:'1',
    hash:'story-1',
    cls:'story-1',
    photo:PHOTO,
    chapter:'Глава 1',
    title:'С чего<br>всё началось',
    left:'Всё начинается не с одежды. Вы приезжаете к нам по записи. Мы уже знаем, с чем вы пришли, и заранее готовимся к встрече. Всё начинается не с одежды. Вы приезжаете к нам по записи. Мы уже знаем, с чем вы пришли, и заранее готовимся к встрече. Вы приезжаете&nbsp;&nbsp;&nbsp;&nbsp;к нам по записи. Мы уже знаем, с чем вы пришли, и заранее готовимся к встрече. Мы уже знаем, с чем вы пришли, и заранее готовимся к встрече. Мы уже знаем, с чем вы пришли, и заранее готовимся к встрече.',
    right:'Всё начинается не с одежды. Вы приезжаете к нам по записи. Мы уже знаем, с чем вы пришли, и заранее готовимся к встрече. Всё начинается не с одежды. Вы приезжаете к нам по записи. Мы уже знаем, с чем вы пришли, и заранее готовимся к встрече. Вы приезжаете&nbsp;&nbsp;&nbsp;&nbsp;к нам по записи. Мы уже знаем, с чем вы пришли, и заранее готовимся к встрече.'
  }
];
var ARR='<svg class="tb-story__arr" width="16" height="6" viewBox="0 0 16 6" aria-hidden="true"><path d="M12.669 5.71357L14.6827 3.21106L7.08063 3.43719L0 3.43719V2.56281L7.08063 2.56281L14.6827 2.78895L12.669 0.286432L12.987 0L16 3L12.987 6L12.669 5.71357Z" fill="#04100C"/></svg>';
var ARRBACK=ARR.replace('tb-story__arr','tb-story__arr is-back');
var XICO='<svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path d="M4 0V8" stroke="#04100C"/><path d="M8 4H0" stroke="#04100C"/></svg>';
var root,stage,iCur=0,hideT=0,built=0,rsT=0,bound=0,scrollY=0,bodyTop='',recOverflow=null;
function storyById(id){
  id=normId(id);
  if(!id)return -1;
  for(var n=0;n<STORIES.length;n++)if(STORIES[n].id===id)return n;
  return -1;
}
function normId(id){
  if(id==null||id==='')return '';
  var s=String(id).toLowerCase();
  var m=s.match(/^story-(\d+)$/);
  return m?m[1]:s;
}
function idFromHash(h){
  h=String(h||'').toLowerCase();
  for(var n=0;n<STORIES.length;n++)if(STORIES[n].hash===h)return STORIES[n].id;
  return '';
}
function frame(){return stage&&stage.querySelector('.tb-story__scroll');}
function nativeScrollTo(y){
  var fn=window.__tbNativeScrollTo||window.scrollTo;
  try{fn.call(window,0,y);}catch(e){try{window.scrollTo(0,y);}catch(err){}}
  document.documentElement.scrollTop=y;
  if(document.body)document.body.scrollTop=y;
}
function restoreY(){
  var y=window.__tbKeepY!=null?window.__tbKeepY:scrollY;
  if(y<0)y=0;
  nativeScrollTo(y);
  requestAnimationFrame(function(){nativeScrollTo(y);});
  setTimeout(function(){nativeScrollTo(y);},0);
  setTimeout(function(){nativeScrollTo(y);},50);
  setTimeout(function(){nativeScrollTo(y);},120);
}
function render(){
  var s=STORIES[iCur]||STORIES[0];
  var prevOff=iCur<=0,nextOff=iCur>=STORIES.length-1;
  var h='<div class="tb-story__card" role="dialog" aria-modal="true" aria-labelledby="tbStoryTitle">';
  h+='<div class="tb-story__bar">';
  h+='<button type="button" class="tb-story__nav'+(prevOff?' is-dim':'')+'" data-nav="prev"'+(prevOff?' aria-disabled="true" tabindex="-1"':'')+'>'+ARRBACK+'<span>пред</span></button>';
  h+='<button type="button" class="tb-story__x" data-close><span>закрыть</span>'+XICO+'</button>';
  h+='<button type="button" class="tb-story__nav'+(nextOff?' is-dim':'')+'" data-nav="next"'+(nextOff?' aria-disabled="true" tabindex="-1"':'')+'>'+'<span>след</span>'+ARR+'</button>';
  h+='</div><div class="tb-story__scroll">';
  h+='<p class="tb-story__kicker">'+s.chapter+'</p>';
  h+='<h2 class="tb-story__title" id="tbStoryTitle">'+s.title+'</h2>';
  h+='<div class="tb-story__cols"><p class="tb-story__col">'+s.left+'</p><p class="tb-story__col">'+s.right+'</p></div>';
  h+='<img class="tb-story__pic" src="'+s.photo+'" alt="'+s.chapter+'" decoding="async">';
  h+='</div></div>';
  stage.innerHTML=h;
}
function go(dir){
  var n=iCur+dir;
  if(n<0||n>=STORIES.length)return;
  iCur=n;render();
  var sc=frame();
  if(sc)sc.scrollTop=0;
}
function noMotion(){return matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;}
function onKey(e){
  if(!root||root.hidden||!root.classList.contains('is-on'))return;
  if(e.key==='Escape'){close();return;}
  var sc=frame();
  if(!sc)return;
  var dy=0;
  if(e.key==='ArrowDown')dy=72;
  else if(e.key==='ArrowUp')dy=-72;
  else if(e.key==='PageDown'||e.key===' ')dy=sc.clientHeight*0.85*(e.shiftKey&&e.key===' '?-1:1);
  else if(e.key==='PageUp')dy=-sc.clientHeight*0.85;
  else if(e.key==='Home'){sc.scrollTop=0;e.preventDefault();return;}
  else if(e.key==='End'){sc.scrollTop=sc.scrollHeight;e.preventDefault();return;}
  if(!dy)return;
  sc.scrollTop+=dy;
  e.preventDefault();
}
function bind(on){
  if(!!on===!!bound)return;
  bound=on?1:0;
  var m=on?'addEventListener':'removeEventListener';
  document[m]('keydown',onKey);
}
function lock(on){
  var html=document.documentElement,rec=document.getElementById('allrecords');
  if(on){
    if(html.classList.contains('tb-story-lock'))return;
    scrollY=window.__tbKeepY!=null?window.__tbKeepY:(pageYOffset||html.scrollTop||0);
    if(scrollY<0)scrollY=0;
    window.__tbKeepY=scrollY;
    bodyTop=document.body.style.top;
    document.body.style.top=-scrollY+'px';
    if(rec){recOverflow=rec.style.overflow;rec.style.overflow='hidden';}
    html.classList.add('tb-story-lock');
    bind(1);
    return;
  }
  if(!html.classList.contains('tb-story-lock'))return;
  html.classList.remove('tb-story-lock');
  document.body.style.top=bodyTop||'';
  if(rec&&recOverflow!=null){rec.style.overflow=recOverflow;recOverflow=null;}
  bind(0);
  restoreY();
}
function finish(){
  if(!root||root.classList.contains('is-on'))return;
  root.hidden=1;
  root.classList.remove('is-out');
  var sc=frame();
  if(sc)sc.scrollTop=0;
  lock(0);
}
function open(id){
  ensure();if(!root)return;
  if(id!=null&&id!==''){
    var n=storyById(id);
    if(n<0)return;
    iCur=n;
  }
  if(!root.hidden&&root.classList.contains('is-on')){render();var sc0=frame();if(sc0)sc0.scrollTop=0;return;}
  render();
  clearTimeout(hideT);
  root.classList.remove('is-out');
  root.hidden=0;
  lock(1);
  var sc=frame();if(sc)sc.scrollTop=0;
  if(noMotion())root.classList.add('is-on');
  else{root.classList.remove('is-on');void root.offsetWidth;requestAnimationFrame(function(){root.classList.add('is-on');});}
}
function close(){
  if(!root||root.hidden)return;
  root.classList.remove('is-on');
  root.classList.add('is-out');
  clearTimeout(hideT);
  if(noMotion())finish();
  else hideT=setTimeout(finish,420);
}
function onStage(e){
  if(e.target.closest('[data-close]')){close();return;}
  if(e.target.closest('.tb-story__card')){
    var nav=e.target.closest('[data-nav]');
    if(!nav||nav.classList.contains('is-dim'))return;
    go(nav.getAttribute('data-nav')==='next'?1:-1);
    return;
  }
  close();
}
function popHash(e){
  var n=e.target;
  if(n&&n.nodeType===3)n=n.parentElement;
  if(!n||!n.closest)return '';
  var a=n.closest('a[href],a[data-tb-hash]');
  if(!a)return '';
  var dh=a.getAttribute('data-tb-hash');
  if(dh)return String(dh).toLowerCase();
  var h='';
  try{h=a.hash||'';}catch(err){}
  if(!h){var raw=a.getAttribute('href')||'',i=raw.indexOf('#');if(i>=0)h=raw.slice(i);}
  return String(h||'').replace(/^#/,'').split(/[?&\/]/)[0].toLowerCase();
}
function onDoc(e){
  var n=e.target;
  if(n&&n.nodeType===3)n=n.parentElement;
  var p=n&&n.closest&&n.closest('[data-tb-pop=story]');
  var id=p?(p.getAttribute('data-tb-story')||'1'):idFromHash(popHash(e));
  if(!id||storyById(id)<0)return;
  e.preventDefault();
  if(e.stopPropagation)e.stopPropagation();
  if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  open(id);
}
function ensure(){
  if(built)return;
  built=1;
  root=document.getElementById('tbStoryPop');
  if(!root){
    root=document.createElement('div');
    root.id='tbStoryPop';
    root.className='tb-story uc-no-scale';
    root.hidden=1;
    stage=document.createElement('div');
    stage.className='tb-story__stage';
    root.appendChild(stage);
    document.documentElement.appendChild(root);
  }else{
    stage=root.querySelector('.tb-story__stage');
    root.classList.add('uc-no-scale');
  }
  render();
  stage.addEventListener('click',onStage);
  addEventListener('resize',function(){clearTimeout(rsT);rsT=setTimeout(function(){},120);});
}
function boot(){
  document.addEventListener('click',onDoc,true);
  window.tbStoryPop={open:open,close:close,toggle:function(){root&&!root.hidden&&root.classList.contains('is-on')?close():open('1');}};
  var demo=document.getElementById('tbStoryDemo');
  if(document.getElementById('allrecords')){if(demo)demo.hidden=1;}
  else{ensure();open('1');}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
