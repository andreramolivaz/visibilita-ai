// Genera il white paper in PDF da docs/white-paper/white-paper.html con Chromium (Playwright):
//   node docs/white-paper/genera.mjs
// Scrive public/white-paper-visibilita-ai.pdf, servito dal sito e linkato dalla pagina Metodo.
// Il marchio è nell'intestazione di ogni pagina; il numero di pagina a piè di pagina.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const qui = path.dirname(fileURLToPath(import.meta.url));
const sorgente = path.join(qui, "white-paper.html");
const uscita = path.resolve(qui, "../../public/white-paper-visibilita-ai.pdf");

const marchio =
  "<svg width='14' height='14' viewBox='0 0 64 64' style='vertical-align:-2px'><path d='M14 6h36a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10H40l-8 9-8-9H14A10 10 0 0 1 4 42V16A10 10 0 0 1 14 6z' fill='#0e5a47'/><circle cx='17' cy='19' r='3' fill='#fff' opacity='.4'/><rect x='24' y='16.5' width='18' height='5' rx='2.5' fill='#fff' opacity='.4'/><circle cx='17' cy='29' r='3.5' fill='#9fe8c6'/><rect x='24' y='26' width='26' height='6' rx='3' fill='#fff'/><circle cx='17' cy='39' r='3' fill='#fff' opacity='.4'/><rect x='24' y='36.5' width='14' height='5' rx='2.5' fill='#fff' opacity='.4'/></svg>";

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
try {
  const page = await browser.newPage();
  await page.goto(`file://${sorgente}`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: uscita,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="width:100%;font-family:system-ui,sans-serif;font-size:8px;color:#5b6b65;padding:0 18mm;display:flex;justify-content:space-between;align-items:center;margin-top:6mm"><span>${marchio} <span style="font-weight:600;color:#14201c">Visibilità AI</span> · white paper</span><span>ottobre 2026</span></div>`,
    footerTemplate: `<div style="width:100%;font-family:system-ui,sans-serif;font-size:8px;color:#5b6b65;padding:0 18mm;display:flex;justify-content:space-between;margin-bottom:6mm"><span>visibilita-ai-beta.vercel.app/metodo</span><span>Pagina <span class="pageNumber"></span> di <span class="totalPages"></span></span></div>`,
    margin: { top: "20mm", bottom: "18mm", left: "18mm", right: "18mm" },
  });
  console.log(`scritto ${uscita}`);
} finally {
  await browser.close();
}
