// JUTARAMA Tank Studio — server-side PDF service (Puppeteer)
// Renders the exact print HTML to a pixel-perfect A4 PDF.
const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());                       // allow the browser tool to POST here
app.use(express.json({ limit: "20mb" }));

app.get("/", (_req, res) => res.send("JUTARAMA PDF server is running. POST /pdf { html, filename }"));

app.post("/pdf", async (req, res) => {
  const { html, filename } = req.body || {};
  if (!html) return res.status(400).send("Missing 'html' in body");
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${(filename || "tank.pdf").replace(/[^\w.\-]/g, "_")}"`,
    });
    res.send(pdf);
  } catch (e) {
    console.error(e);
    res.status(500).send("PDF render failed: " + String(e));
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`JUTARAMA PDF server ready → http://localhost:${PORT}`));
