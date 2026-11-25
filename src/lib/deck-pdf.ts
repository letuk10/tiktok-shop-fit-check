// Builds the deck PDF in the browser: one 1920 x 1080 landscape page per slide.
// Browser print dialogs ignore the page size on some systems (Safari, macOS "Save as PDF") and
// rotate the slides onto portrait Letter paper, so the PDF is drawn directly instead.
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
export const PAGE_W = 1920, PAGE_H = 1080;

export async function downloadDeckPdf(filename: string, onProgress?: (done: number, total: number) => void) {
  const deck = document.querySelector<HTMLElement>(".print-deck");
  const pages = deck ? [...deck.querySelectorAll<HTMLElement>(".print-page")] : [];
  if (!deck || !pages.length) throw new Error("No slides to export.");
  const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
  const previous = deck.style.visibility;
  deck.style.visibility = "visible";
  try {
    await document.fonts?.ready;
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [PAGE_W, PAGE_H], hotfixes: ["px_scaling"], compress: true });
    for (let i = 0; i < pages.length; i++) {
      const url = await toJpeg(pages[i]!, {
        quality: 0.9, pixelRatio: 1.5, width: PAGE_W, height: PAGE_H, backgroundColor: "#ffffff",
        imagePlaceholder: BLANK, cacheBust: true,
        filter: (node) => !(node instanceof HTMLElement && node.classList.contains("no-print")),
      });
      if (i > 0) pdf.addPage([PAGE_W, PAGE_H], "landscape");
      pdf.addImage(url, "JPEG", 0, 0, PAGE_W, PAGE_H, undefined, "FAST");
      onProgress?.(i + 1, pages.length);
    }
    pdf.save(filename);
  } finally {
    deck.style.visibility = previous;
  }
}
