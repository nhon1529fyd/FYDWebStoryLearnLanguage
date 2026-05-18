(() => {
  let deferredInstallPrompt = null;

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function isIosDevice() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }

  function isZaloWebView() {
    return /zalo/i.test(window.navigator.userAgent);
  }

  function emitState() {
    if (!window.PWAInstall) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("pwa:statechange", {
        detail: window.PWAInstall.getState()
      })
    );
  }

  window.PWAInstall = {
    getState() {
      const standalone = isStandalone();
      const ios = isIosDevice();

      return {
        isStandalone: standalone,
        canInstall: Boolean(deferredInstallPrompt) && !standalone,
        needsIosInstructions: ios && !standalone,
        isZaloWebView: isZaloWebView(),
        isSupported: Boolean(deferredInstallPrompt) || ios,
        label: standalone ? "" : isZaloWebView() ? "Mo ngoai" : ios ? "Them vao man hinh" : "Cai app"
      };
    },
    async requestInstall() {
      const state = this.getState();

      if (state.isStandalone) {
        return { status: "installed" };
      }

      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        emitState();
        return { status: choice && choice.outcome ? choice.outcome : "dismissed" };
      }

      if (state.isZaloWebView) {
        window.alert("Ban dang mo trong Zalo. Hay bam menu cua Zalo va chon Mo bang trinh duyet, sau do bam lai nut Cai app.");
        return { status: "zalo-instructions" };
      }

      if (state.needsIosInstructions) {
        window.alert("Tren iPhone/iPad, ban bam Share roi chon Add to Home Screen.");
        return { status: "ios-instructions" };
      }

      window.alert("Trinh duyet nay chua hien hop cai dat tu dong. Ban hay mo menu cua trinh duyet va chon Install app hoac Add to Home Screen.");
      return { status: "manual-instructions" };
    }
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    emitState();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    emitState();
  });

  window.addEventListener("load", () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch((error) => {
        console.warn("PWA service worker registration failed:", error);
      });
    }

    emitState();
  });
})();
