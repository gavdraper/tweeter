const state = {
  feed: [],
  trends: [
    { tag: '#DotNet9', count: 1234 },
    { tag: '#AI', count: 987 },
    { tag: '#CSharp', count: 654 },
    { tag: '#TweeterClone', count: 420 },
  ],
  whoToFollow: [
    { name: 'Ada Lovelace', handle: 'ada', followed: false },
    { name: 'Linus Torvalds', handle: 'linus', followed: false },
    { name: 'Grace Hopper', handle: 'grace', followed: false },
  ]
};

let nextId = 1;

function el(tag, props = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k,v]) => {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.substring(2).toLowerCase(), v);
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  });
  for (const c of children) {
    if (c == null) continue;
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  }
  return e;
}

function initials(name){
  return name.split(/\s+/).map(p=>p[0]).join('').substring(0,2).toUpperCase();
}

function formatTime(d){
  const diff = (Date.now() - d.getTime())/1000;
  if(diff < 60) return Math.floor(diff)+'s';
  if(diff < 3600) return Math.floor(diff/60)+'m';
  if(diff < 86400) return Math.floor(diff/3600)+'h';
  return d.toLocaleDateString();
}

function renderFeed(){
  const feed = document.getElementById('feed');
  feed.innerHTML = '';
  state.feed.sort((a,b)=>b.created - a.created);
  state.feed.forEach(item => feed.appendChild(renderItem(item)));
}

function renderItem(item){
  const avatar = el('div', { class: 'avatar' }, initials(item.author.name));
  const header = el('div', { class: 'content-header' },
    el('span', { class: 'name' }, item.author.name),
    el('span', { class: 'handle' }, '@'+item.author.handle),
    item.author.verified ? el('span', { class: 'badge' }, 'VIP') : null,
    el('span', { class: 'handle' }, '· '+formatTime(item.created))
  );
  const text = el('div', { class: 'text' }, item.text);
  const actions = el('div', { class: 'actions' },
    actionBtn('💬', item.replies.length, () => replyTo(item.id)),
    actionBtn('🔁', item.reposts, (e)=> toggleRepost(item, e), item.reposted, 'reposted'),
    actionBtn('❤️', item.likes, (e)=> toggleLike(item, e), item.liked, 'liked'),
    actionBtn('📤', '', ()=> shareItem(item))
  );
  const meta = el('div', { class: 'meta' }, item.id < 5 ? 'Top chirp' : 'ID '+item.id);
  const replies = item.replies.length ? el('div', { class:'replies' }, ...item.replies.map(r=>renderItem(r))) : null;
  const content = el('div', { class: 'content' }, header, text, actions, meta, replies);
  return el('li', { class: 'feed-item', 'data-id': item.id }, avatar, content);
}

function actionBtn(icon, count, handler, active=false, activeClass=''){
  return el('button', { class: active ? activeClass : '', onclick: handler }, icon, count? el('span', {}, count): null);
}

function replyTo(id){
  const parent = state.feed.find(f=>f.id===id);
  if(!parent) return;
  openModal('@'+parent.author.handle+' ');
}

function toggleLike(item, btn){
  item.liked = !item.liked;
  item.likes += item.liked ? 1 : -1;
  renderFeed();
}
function toggleRepost(item){
  item.reposted = !item.reposted;
  item.reposts += item.reposted ? 1 : -1;
  renderFeed();
}
function shareItem(item){
  navigator.clipboard?.writeText(location.origin+'/?id='+item.id);
  alert('Link copied');
}

function addPost(text){
  const author = currentUser();
  state.feed.push({
    id: nextId++,
    text,
    author,
    created: new Date(),
    likes: 0,
    reposts: 0,
    replies: [],
    liked:false,
    reposted:false
  });
  renderFeed();
}

function currentUser(){
  return { name: 'Demo User', handle: 'demo', verified: true };
}

function seed(){
  addPost('Welcome to Tweeter – a totally original microblogging platform.');
  addPost('Hot take: Semicolons are just punctuation privilege.');
  addPost('This timeline intentionally left blank.');
}

function renderTrends(){
  const ul = document.getElementById('trends');
  ul.innerHTML = '';
  state.trends.forEach(t=> ul.appendChild(el('li', {}, el('a', { href:'#' }, t.tag), el('div', { class:'meta' }, t.count+' posts'))));
}
function renderWhoToFollow(){
  const ul = document.getElementById('whoToFollow');
  ul.innerHTML='';
  state.whoToFollow.forEach(p=> ul.appendChild(el('li', {},
    el('div', { class:'content-header' }, el('span', { class:'name' }, p.name), el('span', { class:'handle' }, '@'+p.handle)),
    el('button', { class:'follow-btn', onclick: ()=> toggleFollow(p) }, p.followed? 'Following' : 'Follow')
  )));
}
function toggleFollow(p){
  p.followed = !p.followed;
  renderWhoToFollow();
}

// Composer inline
const composeBtn = document.getElementById('composeBtn');
const composer = document.getElementById('composer');
const composerText = document.getElementById('composerText');
const charCount = document.getElementById('charCount');
const sendBtn = document.getElementById('sendBtn');
composeBtn.addEventListener('click', ()=> {
  composer.classList.toggle('hidden');
  if(!composer.classList.contains('hidden')) composerText.focus();
});
composerText.addEventListener('input', ()=> {
  const remaining = 280 - composerText.value.length;
  charCount.textContent = remaining;
  sendBtn.disabled = !composerText.value.trim();
});
sendBtn.addEventListener('click', ()=> {
  addPost(composerText.value.trim());
  composerText.value='';
  sendBtn.disabled=true;
  charCount.textContent=280;
  composer.classList.add('hidden');
});

// Modal compose
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModal');
const modalComposerText = document.getElementById('modalComposerText');
const modalCharCount = document.getElementById('modalCharCount');
const modalSendBtn = document.getElementById('modalSendBtn');

function openModal(prefill=''){
  modal.classList.remove('hidden');
  modalComposerText.value = prefill;
  modalComposerText.focus();
  updateModalCount();
}
function closeModal(){ modal.classList.add('hidden'); }
closeModalBtn.addEventListener('click', closeModal);
modalComposerText.addEventListener('input', updateModalCount);
function updateModalCount(){
  const remaining = 280 - modalComposerText.value.length;
  modalCharCount.textContent = remaining;
  modalSendBtn.disabled = !modalComposerText.value.trim();
}
modalSendBtn.addEventListener('click', ()=> {
  addPost(modalComposerText.value.trim());
  modalComposerText.value='';
  updateModalCount();
  closeModal();
});
window.addEventListener('keydown', e=> { if(e.key==='Escape') closeModal(); });

// Nav switching (placeholder views)
const navBtns = document.querySelectorAll('.nav-btn');
navBtns.forEach(b=> b.addEventListener('click', ()=> {
  navBtns.forEach(n=> n.classList.remove('active'));
  b.classList.add('active');
  document.getElementById('viewTitle').textContent = b.textContent || b.dataset.view;
}));

seed();
renderFeed();
renderTrends();
renderWhoToFollow();
