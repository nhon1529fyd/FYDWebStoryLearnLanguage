(function () {
  const mountPoint = document.getElementById("appShell");
  if (!mountPoint) return;

  const meta = window.PAGE_META || {};
  const links = [
    { id: "home", label: "Trang chủ", href: "aetheria_english_quest_homepage.html" },
    { id: "method", label: "Phương pháp", href: "aetheria_english_quest_homepage.html#method" },
    { id: "world", label: "Thế giới", href: "aetheria_english_quest_homepage.html#world" },
    { id: "characters", label: "Nhân vật", href: "aetheria_english_quest_homepage.html#characters" },
    { id: "missions", label: "Nhiệm vụ", href: "aetheria_english_quest_homepage.html#missions" },
    { id: "demo", label: "Màn chơi thử", href: "gameplay_intro.html" }
  ];

  const currentPage = meta.currentPage || "";

  function isActive(link) {
    return link.id === currentPage;
  }

  function renderLinks(className) {
    return links.map((link) => {
      const activeClass = isActive(link) ? " is-active" : "";
      return `<a class="${className}${activeClass}" href="${link.href}">${link.label}</a>`;
    }).join("");
  }

  mountPoint.innerHTML = `
    <div class="app-shell">
      <div class="app-shell__inner">
        <a class="app-shell__brand" href="aetheria_english_quest_homepage.html">
          <span class="app-shell__mark"></span>
          <span class="app-shell__copy">
            <span class="app-shell__title">Aetheria English Quest</span>
            <span class="app-shell__subtitle">Nền tảng học tiếng Anh theo cốt truyện</span>
          </span>
        </a>

        <nav class="app-shell__nav" aria-label="Điều hướng chính">
          ${renderLinks("app-shell__link")}
        </nav>

        <div class="app-shell__right">
          ${meta.badge ? `<div class="app-shell__badge">${meta.badge}</div>` : ""}
          <button class="app-shell__button" id="appShellAuthButton" type="button">Đăng nhập</button>
        </div>

        <button class="app-shell__menu-toggle" id="appShellMenuToggle" type="button" aria-label="Mở menu">☰</button>
      </div>
    </div>

    <div class="app-shell__mobile" id="appShellMobileMenu" hidden>
      <div class="app-shell__mobile-panel">
        <div class="app-shell__mobile-links">
          ${renderLinks("app-shell__mobile-link")}
        </div>
        <div class="app-shell__mobile-actions">
          <button class="app-shell__mobile-button" id="appShellMobileAuthButton" type="button">Đăng nhập</button>
        </div>
      </div>
    </div>
  `;

  document.body.classList.add("has-app-shell");

  const rightActions = mountPoint.querySelector(".app-shell__right");
  const mobileActions = mountPoint.querySelector(".app-shell__mobile-actions");

  if (rightActions) {
    const installButtonMarkup = document.createElement("button");
    installButtonMarkup.className = "app-shell__button app-shell__button--accent";
    installButtonMarkup.id = "appShellInstallButton";
    installButtonMarkup.type = "button";
    installButtonMarkup.hidden = true;
    installButtonMarkup.textContent = "Cai app";
    rightActions.insertBefore(installButtonMarkup, rightActions.lastElementChild);
  }

  if (mobileActions) {
    const mobileInstallButtonMarkup = document.createElement("button");
    mobileInstallButtonMarkup.className = "app-shell__mobile-button app-shell__mobile-button--accent";
    mobileInstallButtonMarkup.id = "appShellMobileInstallButton";
    mobileInstallButtonMarkup.type = "button";
    mobileInstallButtonMarkup.hidden = true;
    mobileInstallButtonMarkup.textContent = "Cai app";
    mobileActions.insertBefore(mobileInstallButtonMarkup, mobileActions.firstElementChild);
  }

  const shellInner = mountPoint.querySelector(".app-shell__inner");
  const menuToggleElement = mountPoint.querySelector("#appShellMenuToggle");

  if (shellInner && menuToggleElement) {
    const quickInstallButtonMarkup = document.createElement("button");
    quickInstallButtonMarkup.className = "app-shell__quick-install";
    quickInstallButtonMarkup.id = "appShellQuickInstallButton";
    quickInstallButtonMarkup.type = "button";
    quickInstallButtonMarkup.hidden = true;
    quickInstallButtonMarkup.textContent = "Cai app";
    shellInner.insertBefore(quickInstallButtonMarkup, menuToggleElement);
  }

  const authButton = document.getElementById("appShellAuthButton");
  const installButton = document.getElementById("appShellInstallButton");
  const mobileAuthButton = document.getElementById("appShellMobileAuthButton");
  const mobileInstallButton = document.getElementById("appShellMobileInstallButton");
  const quickInstallButton = document.getElementById("appShellQuickInstallButton");
  const menuToggle = document.getElementById("appShellMenuToggle");
  const mobileMenu = document.getElementById("appShellMobileMenu");
  const mobileMenuLinks = mobileMenu.querySelectorAll(".app-shell__mobile-link");

  let isAuthenticated = false;

  function openMobileMenu() {
    mobileMenu.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      mobileMenu.classList.add("is-open");
    });
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    window.setTimeout(() => {
      mobileMenu.hidden = true;
      document.body.style.overflow = "";
    }, 220);
  }

  function emitAuthAction() {
    window.dispatchEvent(new CustomEvent("app-shell:auth-action", {
      detail: { isAuthenticated }
    }));
  }

  async function handleInstallAction() {
    if (window.PWAInstall && typeof window.PWAInstall.requestInstall === "function") {
      closeMobileMenu();
      await window.PWAInstall.requestInstall();
    }
  }

  function renderInstallState() {
    if (!installButton || !mobileInstallButton || !quickInstallButton) {
      return;
    }

    if (!window.PWAInstall || typeof window.PWAInstall.getState !== "function") {
      installButton.hidden = true;
      mobileInstallButton.hidden = true;
      quickInstallButton.hidden = true;
      return;
    }

    const state = window.PWAInstall.getState();
    const shouldShow = !state.isStandalone;
    const label = state.label || "Cai app";

    installButton.hidden = !shouldShow;
    mobileInstallButton.hidden = !shouldShow;
    quickInstallButton.hidden = !shouldShow;
    installButton.textContent = label;
    mobileInstallButton.textContent = label;
    quickInstallButton.textContent = label;
  }

  authButton.addEventListener("click", emitAuthAction);
  mobileAuthButton.addEventListener("click", emitAuthAction);
  if (installButton) {
    installButton.addEventListener("click", handleInstallAction);
  }
  if (mobileInstallButton) {
    mobileInstallButton.addEventListener("click", handleInstallAction);
  }
  if (quickInstallButton) {
    quickInstallButton.addEventListener("click", handleInstallAction);
  }

  menuToggle.addEventListener("click", () => {
    if (mobileMenu.hidden) {
      openMobileMenu();
    } else {
      closeMobileMenu();
    }
  });

  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  window.addEventListener("pwa:statechange", renderInstallState);
  renderInstallState();

  window.AppShell = {
    closeMobileMenu,
    setAuthState(nextState = {}) {
      isAuthenticated = Boolean(nextState.isAuthenticated);
      const label = nextState.label || (isAuthenticated ? "Đăng xuất" : "Đăng nhập");
      authButton.textContent = label;
      mobileAuthButton.textContent = label;
    }
  };

  window.AppShell.setAuthState({ isAuthenticated: false, label: "Đăng nhập" });
})();
