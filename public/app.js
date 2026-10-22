const FAILURE_MESSAGE = 'Não foi possível concluir a ação. Tente novamente.';
const NOT_FOUND_MESSAGE = 'Criadora não encontrada.';

const loading = document.getElementById('loading');
const content = document.getElementById('content');
const select = document.getElementById('user-select');
const avatar = document.getElementById('avatar');
const creatorName = document.getElementById('creator-name');
const followerCount = document.getElementById('follower-count');
const button = document.getElementById('follow-button');
const errorArea = document.getElementById('error');

const rawCreatorId = new URLSearchParams(window.location.search).get(
  'creatorId',
);
const creatorId =
  rawCreatorId === null || rawCreatorId === '' ? '1' : rawCreatorId;

let following = false;
let busy = false;

async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(String(response.status));
  }
  return response.json();
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function renderCount(count) {
  followerCount.textContent =
    count === 1 ? '1 seguidor' : `${count} seguidores`;
}

function renderButton() {
  button.setAttribute('aria-pressed', String(following));
  button.textContent = following ? 'Deixar de seguir' : 'Seguir';
}

function showError(message) {
  errorArea.textContent = message;
}

async function readFollowing(userId) {
  const status = await readJson(`/creators/${creatorId}/followers/${userId}`);
  return status.following === true;
}

async function onUserChange() {
  const userId = select.value;
  showError('');
  button.disabled = true;
  try {
    const result = await readFollowing(userId);
    if (userId === select.value) {
      following = result;
      renderButton();
      showError('');
    }
  } catch {
    showError(FAILURE_MESSAGE);
  } finally {
    if (!busy) {
      button.disabled = false;
    }
  }
}

async function onButtonClick() {
  if (busy) {
    return;
  }
  busy = true;
  showError('');
  button.setAttribute('aria-disabled', 'true');
  button.setAttribute('aria-busy', 'true');
  select.disabled = true;
  const userId = select.value;
  const nextFollowing = !following;
  try {
    const response = following
      ? await fetch(`/creators/${creatorId}/followers/${userId}`, {
          method: 'DELETE',
        })
      : await fetch(`/creators/${creatorId}/followers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: Number(userId) }),
        });
    if (!response.ok) {
      throw new Error(String(response.status));
    }
    const { count } = await readJson(`/creators/${creatorId}/followers/count`);
    if (userId === select.value) {
      following = nextFollowing;
      renderButton();
      renderCount(count);
    }
  } catch {
    showError(FAILURE_MESSAGE);
  } finally {
    busy = false;
    select.disabled = false;
    button.removeAttribute('aria-disabled');
    button.removeAttribute('aria-busy');
  }
}

async function load() {
  if (!/^[1-9]\d*$/.test(creatorId)) {
    return showFailure(NOT_FOUND_MESSAGE);
  }
  try {
    const [users, creatorResult, countResult] = await Promise.all([
      readJson('/users'),
      fetch(`/creators/${creatorId}`),
      fetch(`/creators/${creatorId}/followers/count`),
    ]);
    if (creatorResult.status === 404 || creatorResult.status === 400) {
      return showFailure(NOT_FOUND_MESSAGE);
    }
    if (!creatorResult.ok || !countResult.ok || users.length === 0) {
      return showFailure(FAILURE_MESSAGE);
    }
    const creator = await creatorResult.json();
    const { count } = await countResult.json();
    for (const user of users) {
      const option = document.createElement('option');
      option.value = String(user.id);
      option.textContent = user.name;
      select.append(option);
    }
    following = await readFollowing(select.value);
    creatorName.textContent = creator.name;
    avatar.textContent = initials(creator.name);
    renderCount(count);
    renderButton();
    loading.remove();
    content.hidden = false;
  } catch {
    showFailure(FAILURE_MESSAGE);
  }
}

function showFailure(message) {
  loading.remove();
  content.hidden = true;
  showError(message);
}

select.addEventListener('change', onUserChange);
button.addEventListener('click', onButtonClick);
load();
