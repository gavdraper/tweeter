const state = {
  feed: [],
  trends: [],
  whoToFollow: [],
  currentUser: null
};

const API_BASE = '/api';

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

async function loadFeed(){
  try {
    const response = await fetch(`${API_BASE}/posts`);
    if (response.ok) {
      state.feed = await response.json();
      renderFeed();
    }
  } catch (error) {
    console.error('Failed to load feed:', error);
  }
}

function renderFeed(){
  const feed = document.getElementById('feed');
  feed.innerHTML = '';
  state.feed.forEach(item => feed.appendChild(renderItem(item)));
}

function renderItem(item){
  const avatar = el('div', { class: 'avatar' }, initials(item.author.name));
  const header = el('div', { class: 'content-header' },
    el('span', { class: 'name' }, item.author.name),
    el('span', { class: 'handle' }, '@'+item.author.handle),
    item.author.verified ? el('span', { class: 'badge' }, 'VIP') : null,
    el('span', { class: 'handle' }, '· '+formatTime(new Date(item.created)))
  );
  const text = el('div', { class: 'text' }, item.text);
  const actions = el('div', { class: 'actions' },
    actionBtn('💬', item.replies?.length || 0, () => replyTo(item.id)),
    actionBtn('🔁', item.reposts, (e)=> toggleRepost(item, e), item.reposted, 'reposted'),
    actionBtn('❤️', item.likes, (e)=> toggleLike(item, e), item.liked, 'liked'),
    actionBtn('📤', '', ()=> shareItem(item))
  );
  const meta = el('div', { class: 'meta' }, item.id < 5 ? 'Top chirp' : 'ID '+item.id);
  const replies = item.replies?.length ? el('div', { class:'replies' }, ...item.replies.map(r=>renderItem(r))) : null;
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

async function toggleLike(item, btn){
  if (!state.currentUser) return;
  
  try {
    const response = await fetch(`${API_BASE}/posts/${item.id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: state.currentUser.id })
    });
    
    if (response.ok) {
      item.liked = !item.liked;
      item.likes += item.liked ? 1 : -1;
      renderFeed();
    }
  } catch (error) {
    console.error('Failed to toggle like:', error);
  }
}

async function toggleRepost(item){
  if (!state.currentUser) return;
  
  try {
    const response = await fetch(`${API_BASE}/posts/${item.id}/repost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: state.currentUser.id })
    });
    
    if (response.ok) {
      item.reposted = !item.reposted;
      item.reposts += item.reposted ? 1 : -1;
      renderFeed();
    }
  } catch (error) {
    console.error('Failed to toggle repost:', error);
  }
}
function shareItem(item){
  navigator.clipboard?.writeText(location.origin+'/?id='+item.id);
  alert('Link copied');
}

async function addPost(text){
  if (!state.currentUser) return;
  
  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        text: text.trim(), 
        userId: state.currentUser.id 
      })
    });
    
    if (response.ok) {
      await loadFeed();
    }
  } catch (error) {
    console.error('Failed to create post:', error);
  }
}

async function loadCurrentUser(){
  try {
    const response = await fetch(`${API_BASE}/users/current`);
    if (response.ok) {
      state.currentUser = await response.json();
    }
  } catch (error) {
    console.error('Failed to load current user:', error);
  }
}

async function loadTrends(){
  try {
    const response = await fetch(`${API_BASE}/trending`);
    if (response.ok) {
      state.trends = await response.json();
      renderTrends();
    }
  } catch (error) {
    console.error('Failed to load trends:', error);
  }
}

async function loadWhoToFollow(){
  try {
    const response = await fetch(`${API_BASE}/users/suggestions`);
    if (response.ok) {
      state.whoToFollow = await response.json();
      renderWhoToFollow();
    }
  } catch (error) {
    console.error('Failed to load user suggestions:', error);
  }
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

async function initializeApp() {
  await loadCurrentUser();
  await loadFeed();
  await loadTrends();
  await loadWhoToFollow();
}

initializeApp();
