async function fetchNews(page) {
  try {
    const response = await fetch(`http://localhost:3000/feed/page/${page}`);
    const newsData = await response.json();
    renderFeed(newsData);
  } catch (error) {
    console.error("Erro ao buscar as notícias:", error);
  }
}

function renderFeed(newsItems) {
  const feedContainer = document.getElementById("feed-container");
  feedContainer.innerHTML = "";

  newsItems.forEach((item, index) => {
    let feedItem = "";

    if (item.type === "materia") {
      feedItem = `
                  <div class="feed-item materia" onclick="window.location.href='${
                    item.url
                  }'">
                      <div class="label">${item.section}</div>
                      <h2>${item.title}</h2>
                      <p>${item.summary}</p>
                      ${
                        item.image
                          ? `<img src="${item.image}" alt="${item.title}">`
                          : ""
                      }
                  </div>
              `;
    }

    if (item.video) {
      feedItem = `
                  <div class="feed-item video" onclick="openVideoModal('${item.video.source}')">
                      <h2>${item.title}</h2>
                      <p>${item.summary}</p>
                      <img src="${item.image}" alt="Thumbnail do vídeo">
                  </div>
              `;
    }

    if (item.type === "agrupador-materia") {
      let groupContent = "";
      item.group.forEach((subItem) => {
        groupContent += `<li><a href="${subItem.content.url}">${subItem.content.title}</a></li>`;
      });

      feedItem = `
                  <div class="feed-item agrupador-materia">
                      <div class="header">${item.header}</div>
                      <ul>${groupContent}</ul>
                      <div class="footer"><a href="${item.footer.url}">${item.footer.label}</a></div>
                  </div>
              `;
    }

    // Inserir o item no feed
    feedContainer.innerHTML += feedItem;

    // Adicionar anúncio a cada 8 posts
    if ((index + 1) % 8 === 0) {
      const adItem = `
                  <div class="feed-item anuncio">
                      <div class="label">Anúncio</div>
                      <img src="https://picsum.photos/400/200" alt="Anúncio Publicitário">
                  </div>
              `;
      feedContainer.innerHTML += adItem;
    }
  });
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

fetchNews(1);
