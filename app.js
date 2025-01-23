const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeProductLinks() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  await page.goto(
    "https://www.selcobw.com/products/bathrooms/shower-enclosures-trays-accessories/wet-room-panelling",
    {
      waitUntil: "networkidle2",
    }
  );

  // Extract all product links
  const productLinks = await page.evaluate(() => {
    const links = [];
    const linkElements = document.querySelectorAll(
      "a.ProductListItem-link-3ot"
    );

    linkElements.forEach((linkElement) => {
      const href = linkElement.getAttribute("href");
      links.push(`https://www.selcobw.com${href}`);
    });

    return links;
  });

  const productDetails = [];
  const failedLinks = [];

  const fetchProductDetails = async (link) => {
    const productPage = await browser.newPage();
    await productPage.goto(link, { waitUntil: "networkidle2" });

    // Scroll down to the bottom of the page to load all content
    await autoScroll(productPage);

    const details = await productPage.evaluate(() => {
      const productId =
        document
          .querySelector(".yotpo-main-widget")
          ?.getAttribute("data-product-id") || "No product ID found";
      const title =
        document.querySelector("h1.page-title--product")?.innerText ||
        "No title found";
      const itemCode =
        document.querySelector("p.Sku-root-v0w")?.innerText ||
        "No item code found";
      const rating =
        document
          .querySelector(".ReviewStars-stars-QxU")
          ?.getAttribute("data-stars") || "No rating found";
      const reviews =
        document.querySelector(".ReviewStars-root-m2r a")?.innerText ||
        "No reviews found";
      const priceExVat =
        document.querySelector(".PriceBox-itemExVat-skf span:first-child")
          ?.innerText || "No price (Ex VAT) found";
      const priceIncVat =
        document.querySelector(".PriceBox-itemIncVat-vQr span:first-child")
          ?.innerText || "No price (Inc VAT) found";

      return {
        productId,
        title,
        itemCode,
        rating,
        reviews,
        priceExVat,
        priceIncVat,
      };
    });

    details.link = link;

    productDetails.push(details);
    await productPage.close();
  };

  for (let link of productLinks) {
    try {
      await fetchProductDetails(link);
    } catch (error) {
      console.error(`Failed to fetch details for ${link}:`, error);
      failedLinks.push(link);
    }
  }

  if (failedLinks.length > 0) {
    console.log("Retrying failed links...");
    for (let link of failedLinks) {
      try {
        await fetchProductDetails(link);
      } catch (error) {
        console.error(`Failed again for ${link}:`, error);
      }
    }
  }

  console.log("Total Product Links:", productLinks.length);
  console.log("Total Product Details:", productDetails.length);
  // Write the productDetails to a JSON file
  fs.writeFileSync(
    "productDetails.json",
    JSON.stringify(productDetails, null, 2)
  );

  console.log("Product details saved to productDetails.json");

  await browser.close();
}

// Auto-scroll function to scroll down the page
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

scrapeProductLinks().catch((error) => {
  console.log("error :>> ", error);
});
