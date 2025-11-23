document.addEventListener('DOMContentLoaded', () => {
  const categorySelect = document.getElementById('categorySelect');
  const contentArea = document.getElementById('contentArea');
  const homeLink = document.getElementById('homeLink');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const clearFilterButton = document.getElementById('clearFilterButton');

  let allData = [];

  // Ordem e metadados fixos das categorias
  const CATEGORY_META = [
    {
      value: 'Reputação',
      label: 'Reputação',
      iconClass: 'fa-scale-balanced'
    },
    {
      value: 'Mailing de Imprensa',
      label: 'Mailing de Imprensa',
      iconClass: 'fa-envelope-open-text'
    },
    {
      value: 'Publieditorial',
      label: 'Publieditorial',
      iconClass: 'fa-newspaper'
    },
    {
      value: 'Social Listening',
      label: 'Social Listening',
      iconClass: 'fa-headphones'
    },
    {
      value: 'Marketing de Influência',
      label: 'Marketing de Influência',
      iconClass: 'fa-user-group'
    }
  ];

  // --- Carga de dados ---

  async function loadData() {
    try {
      // Certifique-se de que o arquivo está nomeado exatamente como "data.json"
      const response = await fetch('data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allData = await response.json();

      populateCategorySelect();
      renderHomeCategories();
    } catch (error) {
      console.error('Erro ao carregar os dados:', error);
      contentArea.innerHTML =
        '<p>Não foi possível carregar as ferramentas. Tente novamente mais tarde.</p>';
    }
  }

  // --- Dropdown de categorias ---

  function populateCategorySelect() {
    // Remove opções antigas (mantém apenas "Todas as categorias")
    categorySelect
      .querySelectorAll('option:not(:first-child)')
      .forEach((opt) => opt.remove());

    CATEGORY_META.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat.value;
      option.textContent = cat.label;
      categorySelect.appendChild(option);
    });
  }

  // --- Home: boxes de categorias (2 em cima, 1 central, 2 embaixo) ---

  function renderHomeCategories() {
    contentArea.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'home-categories-grid';

    CATEGORY_META.forEach((cat, index) => {
      const box = document.createElement('div');
      box.className = 'category-box';
      // 3º box centralizado (layout 2–1–2)
      if (index === 2) {
        box.classList.add('center-row');
      }

      // Ícone
      const icon = document.createElement('i');
      icon.className = `fa-solid ${cat.iconClass}`;
      box.appendChild(icon);

      // Título
      const title = document.createElement('h3');
      title.textContent = cat.label;
      box.appendChild(title);

      // Botão
      const btnWrapper = document.createElement('div');
      btnWrapper.className = 'tool-link-wrapper';

      const btn = document.createElement('a');
      btn.href = '#';
      btn.className = 'tool-link';
      btn.textContent = 'Acessar';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        categorySelect.value = cat.value;
        handleFilterAndSearch();
        contentArea.scrollIntoView({ behavior: 'smooth' });
      });

      btnWrapper.appendChild(btn);
      box.appendChild(btnWrapper);

      // Clique no box inteiro também filtra
      box.addEventListener('click', (e) => {
        // evita duplo disparo se o clique for no link
        if (e.target.tagName.toLowerCase() === 'a') return;
        categorySelect.value = cat.value;
        handleFilterAndSearch();
        contentArea.scrollIntoView({ behavior: 'smooth' });
      });

      grid.appendChild(box);
    });

    contentArea.appendChild(grid);
  }

  // --- Renderiza a lista de ferramentas (filtrada ou não) ---

  function renderToolList(items, title) {
    toggleClearButton();

    contentArea.innerHTML = '';

    if (!items.length) {
      const noRes = document.createElement('div');
      noRes.className = 'no-results';
      noRes.textContent = 'Nenhuma ferramenta encontrada para os critérios selecionados.';
      contentArea.appendChild(noRes);
      return;
    }

    const table = document.createElement('table');

    const headerRow = document.createElement('tr');
    const th = document.createElement('th');
    th.textContent = title || 'Resultados da busca';
    headerRow.appendChild(th);
    table.appendChild(headerRow);

    items.forEach((item) => {
      const row = document.createElement('tr');
      const td = document.createElement('td');

      const name = document.createElement('strong');
      name.textContent = item.name;
      td.appendChild(name);

      const desc = document.createElement('span');
      desc.className = 'tool-content';
      desc.textContent = item.description;
      td.appendChild(desc);

      // Botão/link para o site da ferramenta
      const linkWrapper = document.createElement('div');
      linkWrapper.className = 'tool-link-wrapper';

      const link = document.createElement('a');
      link.href = item.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'tool-link';
      link.textContent = 'Acessar';

      linkWrapper.appendChild(link);
      td.appendChild(linkWrapper);

      row.appendChild(td);
      table.appendChild(row);
    });

    contentArea.appendChild(table);
  }

  // --- Lógica de filtro e busca ---

  function handleFilterAndSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect.value;

    // Se não há filtro nem busca, mostra a home
    if (!searchTerm && !selectedCategory) {
      renderHomeCategories();
      toggleClearButton();
      return;
    }

    let filteredItems = allData;

    // Filtra por categoria, se selecionada
    if (selectedCategory) {
      filteredItems = filteredItems.filter(item => item.category === selectedCategory);
    }

    // Filtra por termo de busca
    if (searchTerm) {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }

    renderToolList(filteredItems, selectedCategory || 'Resultados da busca');
  }

  // --- Visibilidade do botão Limpar ---

  function toggleClearButton() {
    const hasSearchTerm = searchInput.value.trim() !== '';
    const hasCategory = categorySelect.value !== '';
    clearFilterButton.style.display = (hasSearchTerm || hasCategory) ? 'inline-block' : 'none';
  }

  // --- Eventos ---

  // Clique no título volta à home (boxes)
  if (homeLink) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      searchInput.value = '';
      categorySelect.value = '';
      renderHomeCategories();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mudança no dropdown
  categorySelect.addEventListener('change', handleFilterAndSearch);

  // Eventos da busca por texto
  searchButton.addEventListener('click', handleFilterAndSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      handleFilterAndSearch();
    }
    toggleClearButton(); // Mostra/esconde o botão ao digitar
  });

  // Evento do botão Limpar
  clearFilterButton.addEventListener('click', () => {
    searchInput.value = '';
    categorySelect.value = '';
    renderHomeCategories();
    toggleClearButton();
  });

  // Inicializa
  loadData();
});
