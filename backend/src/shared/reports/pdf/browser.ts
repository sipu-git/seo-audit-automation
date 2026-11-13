import puppeteer, { type Browser } from "puppeteer";

let browserPromise: Promise<Browser> | undefined;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    const pending = puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    browserPromise = pending;
    void pending.then((browser) => {
      browser.once("disconnected", () => {
        if (browserPromise === pending) browserPromise = undefined;
      });
    }, () => {
      if (browserPromise === pending) browserPromise = undefined;
    });
    return pending;
  }
  return browserPromise;
}

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const bytes = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: "<div style='width:100%;padding:0 15mm;color:#87958d;font:8px Arial;text-align:right'><span class='pageNumber'></span> / <span class='totalPages'></span></div>",
      margin: { top: "14mm", right: "15mm", bottom: "19mm", left: "15mm" },
    });
    return Buffer.from(bytes);
  } finally {
    await page.close();
  }
}

export async function closePdfBrowser(): Promise<void> {
  if (!browserPromise) return;
  const current = browserPromise;
  browserPromise = undefined;
  try {
    const browser = await current;
    await browser.close();
  } catch {
    // Browser launch may have failed; there is nothing left to close.
  }
}
