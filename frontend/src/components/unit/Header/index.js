function renderHeader() {
  const header = document.getElementById("header-container");
  header.innerHTML = `
        <div class="header-container">
            <div class="logo">
                <img class="logoImg" src="./assets/images/Logo.svg" alt="Site Logo">
            </div>
        </div>
    `;
}

renderHeader();
