const INITIAL_PAGE = 1;
const ITEMS_PER_AD = 8;
const FIRST_HIGHLIGHT_INDEX = 0;
const SECOND_HIGHLIGHT_INDEX = 1;

let currentPage = INITIAL_PAGE;
let hasHighlighted = false;

async function fetchNews(page) {
  try {
    const response = await fetch(`http://localhost:3000/feed/page/${page}`);
    const newsData = await response.json();

    if (newsData.length === 0) {
      hideLoadMoreButton();
      return;
    }

    renderFeed(newsData, page);
  } catch (error) {
    console.error("Erro ao buscar as notícias:", error);
  }
}

function loadMoreNews() {
  currentPage++;
  fetchNews(currentPage);
}

function hideLoadMoreButton() {
  const loadMoreButton = document.querySelector(".load-more-button");
  if (loadMoreButton) {
    loadMoreButton.style.display = "none";
  }
}

function renderFeed(newsItems, page) {
  const feedContainer = document.getElementById("feed-container");

  const highlightContainer =
    page === INITIAL_PAGE ? document.createElement("div") : null;
  if (highlightContainer) {
    highlightContainer.classList.add("highlight-container");
  }

  const gridContainer = document.querySelector(".grid-container");
  let nonHighlightItems = "";
  let groupedItems = "";

  newsItems.forEach((item, index) => {
    let feedItem = "";

    switch (item.type) {
      case "agrupador-materia":
        feedItem = renderGroupOfSubjects(item);
        groupedItems += feedItem;
        break;
      case "materia":
        if (page === INITIAL_PAGE && isHighlight(index)) {
          feedItem = renderSubjects(item, index);
          highlightContainer.innerHTML += feedItem;
        } else {
          feedItem = renderDefaultItem(item, index);
          nonHighlightItems += feedItem;
        }
        break;
      default:
        console.error("Tipo de item desconhecido:", item.type);
    }

    if ((index + 1) % ITEMS_PER_AD === 0) {
      const adItem = renderAdItem();
      nonHighlightItems += adItem;
    }
  });

  if (page === INITIAL_PAGE) {
    feedContainer.innerHTML = highlightContainer.outerHTML;
    const newGridContainer = document.createElement("div");
    newGridContainer.classList.add("grid-container");
    newGridContainer.innerHTML = `
      <div class="grid-column materia-column">${nonHighlightItems}</div>
      <div class="grid-column agrupador-column">${groupedItems}</div>
    `;
    feedContainer.appendChild(newGridContainer);
  } else {
    document.querySelector(".materia-column").innerHTML += nonHighlightItems;
    document.querySelector(".agrupador-column").innerHTML += groupedItems;
  }

  newsItems.forEach((item, index) => {
    const element = document.getElementById(`feed-item-${index}`);
    if (element) {
      element.addEventListener("click", () => handleClick(item));
    }
  });
}

function isHighlight(index) {
  return index === FIRST_HIGHLIGHT_INDEX || index === SECOND_HIGHLIGHT_INDEX;
}

function renderGroupOfSubjects(item) {
  let groupContent = "";
  item.group.forEach((subItem) => {
    groupContent += `<li><a href="${subItem.content.url}">${subItem.content.title}</a></li>`;
  });

  return `
        <div class="feed-item agrupador-materia">
          <div class="header">${item.header}</div>
          <ul>${groupContent}</ul>
          <div class="footer"><a href="${item.footer.url}">${item.footer.label}</a></div>
        </div>
      `;
}

function renderSubjects(item, index) {
  if (isHighlight(index)) {
    return renderHighlightItem(item, index);
  } else {
    return renderDefaultItem(item, index);
  }
}

function renderHighlightItem(item, index) {
  if (index === FIRST_HIGHLIGHT_INDEX) {
    return ` <div class="feed-item highlight no-image" id="feed-item-${index}">
        <span class="feed-item.highlight.no-image-label">${item.section}</span>
        <h1>${item.title}</h1>
        <p>${item.summary}</p>
      </div>`;
  }

  if (index === SECOND_HIGHLIGHT_INDEX) {
    return `
        <div class="feed-item highlight" style="background-image: url(${item.image}); background-size: cover; color: white; padding: 20px;" id="feed-item-${index}">
          <h1>${item.title}</h1>
          <p>${item.summary}</p>
        </div>
      `;
  }
}

function renderDefaultItem(item, index) {
  return `
    <div class="feed-item materia" id="feed-item-${index}">
      ${
        item.image
          ? `<img class="" src="${item.image}" alt="${item.title}">`
          : ""
      }  
      <div class="label">${item.section}
        <h2>${item.title}</h2>
      <p>${item.summary}</p>
      </div>       
    </div>
  `;
}

function renderAdItem() {
  return `
      <div class="feed-item materia">
       <img src="https://picsum.photos/400/200" alt="Anúncio Publicitário">
        <div class="label">Anúncio</div>       
      </div>
    `;
}

function handleClick(item) {
  if (item.video) {
    openVideoModal(item.video.source);
    return;
  }
  window.location.href = item.url;
}

function openVideoModal(videoUrl) {
  const modal = document.getElementById("videoModal");
  const videoPlayer = document.getElementById("videoPlayer");

  if (videoPlayer) {
    videoPlayer.src = videoUrl;
    modal.style.display = "flex";
  } else {
    console.error("Video player element not found");
  }
}

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  const videoPlayer = document.getElementById("videoPlayer");

  if (videoPlayer) {
    videoPlayer.src = "";
  }

  modal.style.display = "none";
}

const loadMoreButton = document.createElement("button");
loadMoreButton.textContent = "Ver Mais";
loadMoreButton.classList.add("load-more-button");
loadMoreButton.addEventListener("click", loadMoreNews);
document.body.appendChild(loadMoreButton);

// TESTS
function assert(condition, description) {
  if (condition) {
    console.log(`✅ ${description}`);
  } else {
    console.error(`❌ ${description}`);
  }
}

function testarIsHighlight() {
  assert(isHighlight(0) === true, "Índice 0 deve ser destaque");

  assert(isHighlight(1) === true, "Índice 1 deve ser destaque");

  assert(isHighlight(2) === false, "Índice 2 não deve ser destaque");
}

async function testarFetchNews() {
  const fetchMock = {
    calls: [],
    fetch: async (url) => {
      fetchMock.calls.push([url]);
      return {
        json: async () => [{ title: "Notícia Teste", type: "materia" }],
      };
    },
  };

  window.fetch = fetchMock.fetch;

  await fetchNews(1);

  assert(fetchMock.calls.length === 1, "Fetch foi chamado uma vez");
  assert(
    fetchMock.calls[0][0] === "http://localhost:3000/feed/page/1",
    "URL correta para o fetch"
  );

  fetchMock.calls = [];
}

function testarRenderDefaultItem() {
  const testItem = {
    image: "https://example.com/image.jpg",
    title: "Notícia de Teste",
    section: "Tecnologia",
    summary: "Resumo da notícia de teste",
  };

  const renderedItem = renderDefaultItem(testItem, 0);

  assert(
    renderedItem.includes("https://example.com/image.jpg"),
    "Renderização contém a imagem correta"
  );
  assert(
    renderedItem.includes("Notícia de Teste"),
    "Renderização contém o título correto"
  );
  assert(
    renderedItem.includes("Tecnologia"),
    "Renderização contém a seção correta"
  );
}

function testarRenderDefaultItem() {
  const testItem = {
    image: "https://example.com/image.jpg",
    title: "Notícia de Teste",
    section: "Tecnologia",
    summary: "Resumo da notícia de teste",
  };

  const renderedItem = renderDefaultItem(testItem, 0);

  assert(
    renderedItem.includes("https://example.com/image.jpg"),
    "Renderização contém a imagem correta"
  );
  assert(
    renderedItem.includes("Notícia de Teste"),
    "Renderização contém o título correto"
  );
  assert(
    renderedItem.includes("Tecnologia"),
    "Renderização contém a seção correta"
  );
}

function testarRenderAdItem() {
  const adItem = renderAdItem();

  assert(
    adItem.includes("Anúncio Publicitário"),
    "Renderiza corretamente o anúncio"
  );
  assert(
    adItem.includes("https://picsum.photos/400/200"),
    "Contém a imagem correta do anúncio"
  );
}

document.addEventListener("DOMContentLoaded", function () {
  fetchNews(currentPage);

  // Executando testes unitários
  testarIsHighlight();
  testarFetchNews();
  testarRenderDefaultItem();
  testarRenderAdItem();
});
