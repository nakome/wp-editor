let wpClient = null;
let currentPosts = [];
let allCategories = [];
let allTags = [];
let selectedCategories = [];
let categoryFilterQuery = '';

const postsPagination = {
  page: 1,
  perPage: 20,
  total: 0,
  totalPages: 0,
};

const tagSearchState = {
  debounceTimer: null,
  suggestions: [],
  activeIndex: -1,
};

const elements = {
  configModal: document.getElementById('configModal'),
  configBtn: document.getElementById('configBtn'),
  configForm: document.getElementById('configForm'),
  cancelConfig: document.getElementById('cancelConfig'),
  apiUrl: document.getElementById('apiUrl'),
  username: document.getElementById('username'),
  appPassword: document.getElementById('appPassword'),
  configAlert: document.getElementById('configAlert'),
  themeToggle: document.getElementById('themeToggle'),
  newPostBtn: document.getElementById('newPostBtn'),
  editorModal: document.getElementById('editorModal'),
  editorTitle: document.getElementById('editorTitle'),
  postForm: document.getElementById('postForm'),
  cancelEditor: document.getElementById('cancelEditor'),
  postId: document.getElementById('postId'),
  postTitle: document.getElementById('postTitle'),
  postContent: document.getElementById('postContent'),
  postStatus: document.getElementById('postStatus'),
  categoriesFilter: document.getElementById('categoriesFilter'),
  categoriesContainer: document.getElementById('categoriesContainer'),
  postTags: document.getElementById('postTags'),
  tagSuggestions: document.getElementById('tagSuggestions'),
  tagsPreview: document.getElementById('tagsPreview'),
  postsContainer: document.getElementById('postsContainer'),
  postsPagination: document.getElementById('postsPagination'),
  postsCountInfo: document.getElementById('postsCountInfo'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  pageInfo: document.getElementById('pageInfo'),
  loading: document.getElementById('loading'),
  emptyState: document.getElementById('emptyState'),
  toast: document.getElementById('toast'),
  previewModal: document.getElementById('previewModal'),
  previewTitle: document.getElementById('previewTitle'),
  previewDate: document.getElementById('previewDate'),
  previewStatus: document.getElementById('previewStatus'),
  previewContent: document.getElementById('previewContent'),
  previewCategories: document.getElementById('previewCategories'),
  previewTags: document.getElementById('previewTags'),
  closePreview: document.getElementById('closePreview'),
  progressBar: document.getElementById('progressBar'),
};

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadConfig() {
  const config = localStorage.getItem('wpConfig');
  if (config) {
    const { apiUrl, username, appPassword } = JSON.parse(config);
    elements.apiUrl.value = apiUrl;
    elements.username.value = username;
    elements.appPassword.value = appPassword;
    initWPClient(apiUrl, username, appPassword);
    return true;
  }
  return false;
}

function saveConfig(apiUrl, username, appPassword) {
  localStorage.setItem(
    'wpConfig',
    JSON.stringify({ apiUrl, username, appPassword })
  );
  initWPClient(apiUrl, username, appPassword);
}

async function initWPClient(apiUrl, username, appPassword) {
  try {
    wpClient = new WordPressAPIClient(apiUrl, null, username, appPassword);
    elements.configAlert.classList.add('hidden');
    await loadCategories();
    await loadPosts(1);
  } catch (error) {
    showToast('Error al inicializar la conexión: ' + error.message, 'error');
  }
}

function showModal(modal) {
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

function showToast(message, type = 'success') {
  const bgColor =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
        ? 'bg-red-500'
        : 'bg-blue-500';

  elements.toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${bgColor} text-white`;
  elements.toast.textContent = message;
  elements.toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    elements.toast.style.transform = 'translateY(200%)';
  }, 3000);
}

function startProgress() {
  elements.progressBar.classList.remove('hidden', 'fade-out', 'complete');
  elements.progressBar.style.width = '10%';
}

function completeProgress() {
  elements.progressBar.classList.add('complete');
  elements.progressBar.style.width = '100%';

  setTimeout(() => {
    elements.progressBar.classList.add('fade-out');
    setTimeout(() => {
      elements.progressBar.classList.add('hidden');
    }, 500);
  }, 300);
}

function renderSkeletonLoaders(count = 6) {
  const skeletons = Array.from({ length: count })
    .map(
      () => `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div class="flex items-start justify-between mb-3">
        <div class="skeleton h-6 w-3/4 rounded"></div>
        <div class="skeleton h-6 w-16 rounded-full"></div>
      </div>
      <div class="skeleton h-4 w-32 rounded mb-4"></div>
      <div class="flex gap-2 mb-3">
        <div class="skeleton h-5 w-20 rounded"></div>
        <div class="skeleton h-5 w-24 rounded"></div>
      </div>
      <div class="space-y-2 mb-4">
        <div class="skeleton h-4 w-full rounded"></div>
        <div class="skeleton h-4 w-full rounded"></div>
        <div class="skeleton h-4 w-2/3 rounded"></div>
      </div>
      <div class="flex gap-2">
        <div class="skeleton h-10 flex-1 rounded-lg"></div>
        <div class="skeleton h-10 flex-1 rounded-lg"></div>
        <div class="skeleton h-10 flex-1 rounded-lg"></div>
      </div>
    </div>
  `
    )
    .join('');

  elements.postsContainer.innerHTML = skeletons;
}

function mergeUniqueTerms(existing, incoming) {
  const byId = new Map(existing.map((item) => [item.id, item]));
  incoming.forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values());
}

async function ensureTagsLoadedByIds(tagIds) {
  if (!wpClient || tagIds.length === 0) return;

  const existingIds = new Set(allTags.map((tag) => tag.id));
  const missingIds = tagIds.filter((id) => !existingIds.has(id));

  if (missingIds.length === 0) return;

  try {
    const fetchedTags = await wpClient.get('tags', null, {
      include: missingIds.join(','),
      per_page: 100,
      _fields: 'id,name',
    });
    allTags = mergeUniqueTerms(allTags, fetchedTags);
  } catch (error) {
    console.error('Error al hidratar etiquetas por ID:', error);
  }
}

function updatePaginationUI() {
  const hasPrev = postsPagination.page > 1;
  const hasNext =
    postsPagination.totalPages > 0 &&
    postsPagination.page < postsPagination.totalPages;

  elements.prevPageBtn.disabled = !hasPrev;
  elements.nextPageBtn.disabled = !hasNext;

  elements.pageInfo.textContent =
    postsPagination.totalPages > 0
      ? `Página ${postsPagination.page} de ${postsPagination.totalPages}`
      : `Página ${postsPagination.page}`;

  elements.postsCountInfo.textContent =
    postsPagination.total > 0
      ? `${postsPagination.total} posts en total`
      : '0 posts';

  if (postsPagination.total === 0) {
    elements.postsPagination.classList.add('hidden');
  } else {
    elements.postsPagination.classList.remove('hidden');
  }
}

async function loadPosts(page = 1) {
  if (!wpClient) {
    elements.configAlert.classList.remove('hidden');
    return;
  }

  startProgress();
  elements.emptyState.classList.add('hidden');
  elements.postsPagination.classList.remove('hidden');
  renderSkeletonLoaders(6);

  try {
    const params = {
      page,
      per_page: postsPagination.perPage,
      _fields: 'id,title,excerpt,status,date,link,categories,tags',
    };
    const { data, meta } = await wpClient.getWithMeta('posts', params);
    currentPosts = data;

    postsPagination.page = page;
    postsPagination.total = meta.total;
    postsPagination.totalPages = meta.totalPages;

    const allTagIdsOnPage = [
      ...new Set(
        currentPosts
          .flatMap((post) => post.tags || [])
          .filter((tagId) => Number.isInteger(tagId))
      ),
    ];
    await ensureTagsLoadedByIds(allTagIdsOnPage);

    completeProgress();
    updatePaginationUI();

    if (currentPosts.length === 0) {
      if (page > 1) {
        await loadPosts(page - 1);
        return;
      }
      elements.postsContainer.innerHTML = '';
      elements.emptyState.classList.remove('hidden');
    } else {
      renderPosts(currentPosts);
    }
  } catch (error) {
    completeProgress();
    elements.postsContainer.innerHTML = '';
    elements.postsPagination.classList.add('hidden');
    showToast('Error al cargar los posts: ' + error.message, 'error');
  }
}

async function loadCategories() {
  if (!wpClient) return;

  try {
    const params = { per_page: 100, _fields: 'id,name' };
    allCategories = await wpClient.get('categories', null, params);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

function renderCategories() {
  if (allCategories.length === 0) {
    elements.categoriesContainer.innerHTML =
      '<div class="text-gray-500 dark:text-gray-400 text-sm">No hay categorías disponibles</div>';
    return;
  }

  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categoryFilterQuery.toLowerCase())
  );

  if (filteredCategories.length === 0) {
    elements.categoriesContainer.innerHTML =
      '<div class="text-gray-500 dark:text-gray-400 text-sm">No hay categorías que coincidan con el filtro</div>';
    return;
  }

  elements.categoriesContainer.innerHTML = filteredCategories
    .map(
      (cat) => `
    <label class="flex items-center mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded">
      <input
        type="checkbox"
        value="${cat.id}"
        class="category-checkbox w-4 h-4 rounded text-blue-600"
        ${selectedCategories.includes(cat.id) ? 'checked' : ''}
      />
      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">${cat.name
        }</span>
    </label>
  `
    )
    .join('');

  document.querySelectorAll('.category-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      const categoryId = parseInt(e.target.value);
      if (e.target.checked) {
        if (!selectedCategories.includes(categoryId)) {
          selectedCategories.push(categoryId);
        }
      } else {
        selectedCategories = selectedCategories.filter(
          (id) => id !== categoryId
        );
      }
    });
  });
}

function updateTagsPreview() {
  const tags = elements.postTags.value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  elements.tagsPreview.innerHTML = tags
    .map(
      (tag) => `
    <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
      ${tag}
    </span>
  `
    )
    .join('');
}

function hideTagSuggestions() {
  elements.tagSuggestions.classList.add('hidden');
  elements.tagSuggestions.innerHTML = '';
  tagSearchState.suggestions = [];
  tagSearchState.activeIndex = -1;
}

function getCurrentTagFragment() {
  const value = elements.postTags.value;
  const parts = value.split(',');
  return parts[parts.length - 1].trim();
}

function replaceCurrentTagFragment(selectedTagName) {
  const rawValue = elements.postTags.value;
  const parts = rawValue.split(',');
  parts[parts.length - 1] = ` ${selectedTagName}`;

  const normalized = parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(', ');

  elements.postTags.value = `${normalized}, `;
  updateTagsPreview();
}

function renderTagSuggestions() {
  if (tagSearchState.suggestions.length === 0) {
    hideTagSuggestions();
    return;
  }

  elements.tagSuggestions.innerHTML = tagSearchState.suggestions
    .map(
      (tag, index) => `
      <button
        type="button"
        data-tag-name="${tag.name.replace(/"/g, '&quot;')}"
        class="tag-suggestion-item w-full text-left px-3 py-2 text-sm transition-colors ${index === tagSearchState.activeIndex
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
          : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
        }"
      >
        ${tag.name}
      </button>
    `
    )
    .join('');

  elements.tagSuggestions.classList.remove('hidden');

  document.querySelectorAll('.tag-suggestion-item').forEach((button) => {
    button.addEventListener('mousedown', (event) => {
      event.preventDefault();
      const tagName = button.getAttribute('data-tag-name');
      replaceCurrentTagFragment(tagName);
      hideTagSuggestions();
      elements.postTags.focus();
    });
  });
}

async function searchTagsRemotely(query) {
  if (!wpClient || query.length < 2) {
    hideTagSuggestions();
    return;
  }

  try {
    const suggestions = await wpClient.get('tags', null, {
      search: query,
      per_page: 20,
      _fields: 'id,name',
    });

    allTags = mergeUniqueTerms(allTags, suggestions);

    const currentTagSet = new Set(
      elements.postTags.value
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0)
    );

    tagSearchState.suggestions = suggestions.filter(
      (tag) => !currentTagSet.has(tag.name.toLowerCase())
    );
    tagSearchState.activeIndex = -1;
    renderTagSuggestions();
  } catch (error) {
    console.error('Error en búsqueda remota de etiquetas:', error);
    hideTagSuggestions();
  }
}

function scheduleTagSearch() {
  if (tagSearchState.debounceTimer) {
    clearTimeout(tagSearchState.debounceTimer);
  }

  const fragment = getCurrentTagFragment();
  if (fragment.length < 2) {
    hideTagSuggestions();
    return;
  }

  tagSearchState.debounceTimer = setTimeout(() => {
    searchTagsRemotely(fragment);
  }, 250);
}

function handleTagInputKeydown(event) {
  if (elements.tagSuggestions.classList.contains('hidden')) return;
  const maxIndex = tagSearchState.suggestions.length - 1;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    tagSearchState.activeIndex =
      tagSearchState.activeIndex >= maxIndex ? 0 : tagSearchState.activeIndex + 1;
    renderTagSuggestions();
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    tagSearchState.activeIndex =
      tagSearchState.activeIndex <= 0 ? maxIndex : tagSearchState.activeIndex - 1;
    renderTagSuggestions();
  }

  if (event.key === 'Enter' && tagSearchState.activeIndex >= 0) {
    event.preventDefault();
    const selectedTag = tagSearchState.suggestions[tagSearchState.activeIndex];
    replaceCurrentTagFragment(selectedTag.name);
    hideTagSuggestions();
  }

  if (event.key === 'Escape') {
    hideTagSuggestions();
  }
}

function renderPosts(posts) {
  elements.postsContainer.innerHTML = posts
    .map(
      (post) => `
    <div class="relative overflow-visible bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <details class="post-actions-menu absolute top-3 right-3 z-20">
        <summary
          class="list-none flex h-8 w-8 items-center justify-center cursor-pointer bg-transparent"
          aria-label="Abrir acciones del post"
          aria-haspopup="menu"
          onclick="event.preventDefault(); const menu = this.parentElement; const wasOpen = menu.hasAttribute('open'); document.querySelectorAll('.post-actions-menu[open]').forEach((item) => item.removeAttribute('open')); if (!wasOpen) { menu.setAttribute('open', ''); }"
        >
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <circle cx="10" cy="4" r="1.5"></circle>
            <circle cx="10" cy="10" r="1.5"></circle>
            <circle cx="10" cy="16" r="1.5"></circle>
          </svg>
        </summary>

        <div class="post-actions-panel absolute right-0 top-full mt-1 w-32 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg overflow-hidden" role="menu">
          <button
            type="button"
            onclick="this.closest('details').removeAttribute('open'); previewPost(${post.id});"
            class="w-full text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Ver
          </button>
          <button
            type="button"
            onclick="this.closest('details').removeAttribute('open'); editPost(${post.id});"
            class="w-full text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Editar
          </button>
          <button
            type="button"
            onclick="this.closest('details').removeAttribute('open'); confirmDelete(${post.id}, '${post.title.rendered.replace(
        /'/g,
        "\\'"
      )}');"
            class="w-full text-left text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            Borrar
          </button>
        </div>
      </details>

      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex-1">
          ${post.title.rendered || 'Sin título'}
        </h3>
        <span class="ml-2 mr-10 px-2 py-1 text-xs rounded-full ${post.status === 'publish'
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }">
          ${post.status === 'publish' ? 'Publicado' : 'Borrador'}
        </span>
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
        ${new Date(post.date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
      ${post.categories && post.categories.length > 0
          ? `<div class="flex flex-wrap gap-1 mb-2">
        ${post.categories
            .map(
              (catId) => `
          <span class="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
            ${allCategories.find((c) => c.id === catId)?.name || ''}
          </span>
        `
            )
            .join('')}
      </div>`
          : ''
        }
      ${post.tags && post.tags.length > 0
          ? `<div class="flex flex-wrap gap-1 mb-3">
        ${post.tags
            .slice(0, 3)
            .map((tagId) => {
              // USAR allTags para mostrar el NOMBRE
              const tagName =
                allTags.find((t) => t.id === tagId)?.name ||
                'Etiqueta Desconocida';
              return `
                <span class="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded">
                  ${tagName}
                </span>
              `;
            })
            .join('')}
      </div>`
          : ''
        }
      <div class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
        ${post.excerpt.rendered.replace(/<[^>]*>/g, '')}
      </div>
    </div>
  `
    )
    .join('');
}

async function previewPost(postId) {
  if (!wpClient) return;

  try {
    startProgress();
    const params = { _fields: 'id,title,content,status,date,categories,tags' };
    const post = await wpClient.get('posts', postId, params);
    await ensureTagsLoadedByIds(post.tags || []);
    completeProgress();

    elements.previewTitle.textContent = post.title.rendered;
    elements.previewDate.textContent = new Date(post.date).toLocaleDateString(
      'es-ES',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );

    const statusClass =
      post.status === 'publish'
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    elements.previewStatus.className = `ml-4 px-2 py-1 rounded-full text-xs ${statusClass}`;
    elements.previewStatus.textContent =
      post.status === 'publish' ? 'Publicado' : 'Borrador';

    elements.previewContent.innerHTML = post.content.rendered;

    elements.previewCategories.innerHTML = (post.categories || [])
      .map(
        (catId) => `
      <span class="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
        ${allCategories.find((c) => c.id === catId)?.name || 'Categoría'}
      </span>
    `
      )
      .join('');

    elements.previewTags.innerHTML = (post.tags || [])
      .map(
        (tagId) => `
      <span class="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded">
        ${allTags.find((t) => t.id === tagId)?.name || 'Etiqueta'}
      </span>
    `
      )
      .join('');

    showModal(elements.previewModal);
  } catch (error) {
    completeProgress();
    showToast('Error al cargar el post: ' + error.message, 'error');
  }
}

async function editPost(postId) {
  if (!wpClient) return;

  try {
    startProgress();
    const params = { _fields: 'id,title,content,status,categories,tags' };
    const post = await wpClient.get('posts', postId, params);
    await ensureTagsLoadedByIds(post.tags || []);
    completeProgress();

    elements.editorTitle.textContent = 'Editar Post';
    elements.postId.value = post.id;
    elements.postTitle.value = post.title.rendered;
    elements.postStatus.value = post.status;

    // Mapear IDs de etiquetas a NOMBRES para la edición
    const tagNames = (post.tags || [])
      .map((tagId) => allTags.find((t) => t.id === tagId)?.name)
      .filter((name) => name);
    elements.postTags.value = tagNames.join(', ');

    selectedCategories = post.categories || [];
    categoryFilterQuery = '';
    elements.categoriesFilter.value = '';
    renderCategories();
    updateTagsPreview();
    hideTagSuggestions();

    tinymce.get('postContent').setContent(post.content.rendered);

    showModal(elements.editorModal);
  } catch (error) {
    completeProgress();
    showToast('Error al cargar el post: ' + error.message, 'error');
  }
}

function confirmDelete(postId, postTitle) {
  if (confirm(`¿Estás seguro de que quieres eliminar "${postTitle}"?`)) {
    deletePost(postId);
  }
}

async function deletePost(postId) {
  if (!wpClient) return;

  try {
    startProgress();
    await wpClient.delete('posts', postId, true);
    completeProgress();

    showToast('Post eliminado correctamente', 'success');
    loadPosts(postsPagination.page);
  } catch (error) {
    completeProgress();
    showToast('Error al eliminar el post: ' + error.message, 'error');
  }
}

function openNewPostEditor() {
  elements.editorTitle.textContent = 'Nuevo Post';
  elements.postId.value = '';
  elements.postTitle.value = '';
  elements.postTags.value = '';
  elements.postStatus.value = 'draft';

  selectedCategories = [];
  categoryFilterQuery = '';
  elements.categoriesFilter.value = '';
  renderCategories();
  updateTagsPreview();
  hideTagSuggestions();

  tinymce.get('postContent').setContent('');

  showModal(elements.editorModal);
}

// NUEVO: Función para mapear nombres a IDs y crear tags si es necesario
async function mapTagNamesToIds(tagNames) {
  const ids = [];

  for (const tagName of tagNames) {
    if (!tagName) continue;

    let tag = allTags.find(
      (t) => t.name.toLowerCase() === tagName.toLowerCase()
    );

    if (tag) {
      ids.push(tag.id);
    } else {
      try {
        const possibleMatches = await wpClient.get('tags', null, {
          search: tagName,
          per_page: 20,
          _fields: 'id,name',
        });

        const exactMatch = possibleMatches.find(
          (item) => item.name.toLowerCase() === tagName.toLowerCase()
        );

        if (exactMatch) {
          allTags = mergeUniqueTerms(allTags, [exactMatch]);
          ids.push(exactMatch.id);
          continue;
        }

        const newTag = await wpClient.create('tags', { name: tagName });
        allTags = mergeUniqueTerms(allTags, [newTag]);
        ids.push(newTag.id);
        showToast(`Etiqueta "${tagName}" creada.`, 'info');
      } catch (error) {
        console.error(`Error al crear la etiqueta "${tagName}":`, error);
      }
    }
  }

  return ids;
}

async function savePost(event) {
  event.preventDefault();

  if (!wpClient) return;

  const postId = elements.postId.value;
  const title = elements.postTitle.value;
  const content = tinymce.get('postContent').getContent();
  const status = elements.postStatus.value;

  // VALIDACIÓN DE CONTENIDO DEL EDITOR
  if (!title.trim()) {
    showToast('El título no puede estar vacío.', 'error');
    elements.postTitle.focus();
    return;
  }
  if (!content.trim()) {
    showToast('El contenido del post no puede estar vacío.', 'error');
    tinymce.get('postContent').focus();
    return;
  }

  // 1. Obtener nombres de tags
  const tagNames = elements.postTags.value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  // 2. Convertir nombres de tags a IDs (Creando tags nuevos si es necesario)
  const tagIds = await mapTagNamesToIds(tagNames);

  const postData = {
    title: title,
    content: content,
    status: status,
    categories: selectedCategories,
  };

  if (tagIds.length > 0) {
    postData.tags = tagIds; // Usar IDs numéricos
  }

  try {
    startProgress();

    if (postId) {
      await wpClient.update('posts', postId, postData);
      showToast('Post actualizado correctamente', 'success');
    } else {
      await wpClient.create('posts', postData);
      showToast('Post creado correctamente', 'success');
    }

    completeProgress();
    hideModal(elements.editorModal);
    hideTagSuggestions();
    loadPosts(postsPagination.page);
  } catch (error) {
    completeProgress();
    showToast('Error al guardar el post: ' + error.message, 'error');
  }
}

function initTinyMCE() {
  tinymce.init({
    selector: '.tinymce-editor',
    height: 400,
    menubar: false,
    plugins: 'lists link image code',
    toolbar:
      'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
    skin: localStorage.getItem('theme') === 'dark' ? 'oxide-dark' : 'oxide',
    content_css: localStorage.getItem('theme') === 'dark' ? 'dark' : 'default',
    content_style:
      'body { font-family:Segoe UI,Tahoma,Arial,sans-serif; font-size:14px }',
  });
}


elements.postTags.addEventListener('input', () => {
  updateTagsPreview();
  scheduleTagSearch();
});

elements.postTags.addEventListener('keydown', handleTagInputKeydown);

elements.postTags.addEventListener('blur', () => {
  setTimeout(() => hideTagSuggestions(), 120);
});

elements.categoriesFilter.addEventListener('input', (event) => {
  categoryFilterQuery = event.target.value.trim();
  renderCategories();
});

elements.prevPageBtn.addEventListener('click', () => {
  if (postsPagination.page > 1) {
    loadPosts(postsPagination.page - 1);
  }
});

elements.nextPageBtn.addEventListener('click', () => {
  if (
    postsPagination.totalPages > 0 &&
    postsPagination.page < postsPagination.totalPages
  ) {
    loadPosts(postsPagination.page + 1);
  }
});

elements.closePreview.addEventListener('click', () => {
  hideModal(elements.previewModal);
});

elements.themeToggle.addEventListener('click', toggleTheme);

elements.configBtn.addEventListener('click', () => {
  showModal(elements.configModal);
});

elements.cancelConfig.addEventListener('click', () => {
  hideModal(elements.configModal);
});

elements.configForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const apiUrl = elements.apiUrl.value.trim();
  const username = elements.username.value.trim();
  const appPassword = elements.appPassword.value.trim();

  saveConfig(apiUrl, username, appPassword);
  hideModal(elements.configModal);
  showToast('Configuración guardada correctamente', 'success');
});

elements.newPostBtn.addEventListener('click', openNewPostEditor);

elements.cancelEditor.addEventListener('click', () => {
  hideModal(elements.editorModal);
});

elements.postForm.addEventListener('submit', savePost);

initTheme();
initTinyMCE();


const hasConfig = loadConfig();

if (!hasConfig) {
  elements.configAlert.classList.remove('hidden');
  showModal(elements.configModal);
}
