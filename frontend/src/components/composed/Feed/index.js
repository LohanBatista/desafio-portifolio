async function fetchNews(page) {
  try {
    const response = await fetch(`http://localhost:3000/feed/page/${page}`);
    const newsData = await response.json();
    renderFeed(newsData);
  } catch (error) {
    console.error("Erro ao buscar as notícias:", error);
  }
}

const firstHighlightIndex = 0;
const secondHighlightIndex = 1;
const isHighlight = (index) =>
  index === firstHighlightIndex || index === secondHighlightIndex;

function renderFeed(newsItems) {
  const feedContainer = document.getElementById("feed-container");
  feedContainer.innerHTML = "";

  const highlightContainer = document.createElement("div");
  highlightContainer.classList.add("highlight-container");

  const gridContainer = document.createElement("div"); // Contêiner para grid layout
  gridContainer.classList.add("grid-container");

  let nonHighlightItems = "";
  let groupedItems = "";

  newsItems.forEach((item, index) => {
    let feedItem = "";

    switch (item.type) {
      case "agrupador-materia":
        feedItem = renderGroupOfSubjects(item);
        groupedItems += feedItem; // Acumula agrupador-materia
        break;
      case "materia":
        if (isHighlight(index)) {
          feedItem = renderSubjects(item, index);
          highlightContainer.innerHTML += feedItem; // Adiciona os destaques ao contêiner de destaques
        } else {
          feedItem = renderSubjects(item, index);
          nonHighlightItems += feedItem; // Acumula os itens materia (não-destaque)
        }
        break;
      default:
        console.error("Tipo de item desconhecido:", item.type);
    }

    if ((index + 1) % 8 === 0) {
      const adItem = renderAdItem();
      nonHighlightItems += adItem; // Acumula os anúncios a cada 8 itens
    }
  });

  // Adiciona a estrutura em grid
  gridContainer.innerHTML = `
    <div class="grid-column materia-column">${nonHighlightItems}</div>
    <div class="grid-column agrupador-column">${groupedItems}</div>
  `;

  // Primeiro adiciona os destaques, depois o grid com materias e agrupadores
  feedContainer.innerHTML += highlightContainer.outerHTML;
  feedContainer.appendChild(gridContainer); // Adiciona o grid ao contêiner principal

  // Reatribui os eventos de clique para cada item
  newsItems.forEach((item, index) => {
    const element = document.getElementById(`feed-item-${index}`);
    if (element) {
      element.addEventListener("click", () => handleClick(item));
    }
  });
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
  if (index === firstHighlightIndex) {
    return ` <div class="feed-item highlight no-image" id="feed-item-${index}">
        <span class="feed-item.highlight.no-image-label">${item.section}</span>
        <h1>${item.title}</h1>
        <p>${item.summary}</p>
      </div>`;
  }

  if (index === secondHighlightIndex) {
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

document.addEventListener("DOMContentLoaded", function () {
  fetchNews(1);
});
