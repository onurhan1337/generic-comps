import "./stil.css";

/** Sayfadaki tüm "kopyala" butonlarını çalışır hale getirir. */
export function kopyalamaKur(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-kopyala]").forEach((buton) => {
    buton.addEventListener("click", async () => {
      const hedefSecici = buton.getAttribute("data-kopyala");
      const hedef = hedefSecici ? document.querySelector(hedefSecici) : null;
      if (!hedef) return;
      try {
        await navigator.clipboard.writeText(hedef.textContent ?? "");
        const eski = buton.textContent;
        buton.textContent = "Kopyalandı";
        window.setTimeout(() => {
          buton.textContent = eski;
        }, 1800);
      } catch {
        // Pano izni yoksa kullanıcı metni elle seçebilir.
      }
    });
  });
}

kopyalamaKur();
