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
    renderFeed(newsData, page);
  } catch (error) {
    console.error("Erro ao buscar as notícias:", error);
  }
}

function loadMoreNews() {
  currentPage++;
  fetchNews(currentPage);
}

function renderFeed(newsItems, page) {
  const feedContainer = document.getElementById("feed-container");

  const highlightContainer =
    page === INITIAL_PAGE ? document.createElement("div") : null;
  if (highlightContainer) {
    highlightContainer.classList.add("highlight-container");
  }

  const gridContainer = document.querySelector(".grid-container");
  let nonHighlightItems = gridContainer
    ? gridContainer.querySelector(".materia-column").innerHTML
    : "";
  let groupedItems = gridContainer
    ? gridContainer.querySelector(".agrupador-column").innerHTML
    : "";

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

document.addEventListener("DOMContentLoaded", function () {
  fetchNews(currentPage);
});
