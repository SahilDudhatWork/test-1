const fs = require("fs");
const RepositoryFactory = require("../services/repositories/repositoryFactory");
const productRepository = RepositoryFactory.get("product");

const travisPerkinsVauxhall = async () => {
  try {
    console.log("Travis Perkins Vauxhall scraping is Trigerd...");
    let body = {
      operationName: "searchProducts",
      variables: {
        brandId: "tp",
        input: {
          salesChannel: "ECOMMERCE",
          categoryId: null,
          excludeFacets: [],
          facets: [
            {
              name: "localised",
              values: ["0320"],
            },
          ],
          first: 30,
          after: null,
          term: "se1",
        },
      },
      query:
        "query searchProducts($brandId: ID!, $input: TpplcProductSearchInput!) {\n  tpplcBrand(brandId: $brandId) {\n    searchProducts(input: $input) {\n      totalCount\n      autoCorrectQuery\n      searchRedirect\n      pageInfo {\n        endCursor\n        hasNextPage\n        __typename\n      }\n      edges {\n        product {\n          ...TPPLCProductFields\n          __typename\n        }\n        __typename\n      }\n      facets {\n        name\n        values {\n          value\n          count\n          ... on TpplcCategoryFacetValue {\n            category {\n              code\n              id\n              name\n              parentCategories {\n                code\n                __typename\n              }\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment TPPLCProductFields on TpplcProduct {\n  id\n  sku\n  name\n  description\n  minimumHirePeriod\n  type\n  baseProductId\n  review {\n    averageRating\n    numberOfReviews\n    __typename\n  }\n  primaryImage {\n    id\n    images {\n      type\n      url\n      altText\n      __typename\n    }\n    __typename\n  }\n  otherImages {\n    id\n    images {\n      type\n      url\n      altText\n      __typename\n    }\n    __typename\n  }\n  vatRate\n  parentCategories {\n    ...TPPLCParentCategoriesTree\n    __typename\n  }\n  technicalSpecifications {\n    name\n    value\n    __typename\n  }\n  featuresAndBenefits\n  variants {\n    product {\n      id\n      baseProductId\n      sku\n      name\n      description\n      review {\n        averageRating\n        numberOfReviews\n        __typename\n      }\n      vatRate\n      type\n      primaryImage {\n        id\n        images {\n          type\n          url\n          altText\n          __typename\n        }\n        __typename\n      }\n      otherImages {\n        id\n        images {\n          type\n          url\n          altText\n          __typename\n        }\n        __typename\n      }\n      parentCategories {\n        ...TPPLCParentCategoriesTree\n        __typename\n      }\n      ...TPPLCProductPriceFields\n      __typename\n    }\n    features {\n      name\n      value\n      __typename\n    }\n    __typename\n  }\n  dataSheets {\n    name\n    type\n    url\n    __typename\n  }\n  type\n  hireable\n  ...TPPLCProductPriceFields\n  __typename\n}\n\nfragment TPPLCProductPriceFields on TpplcProduct {\n  price {\n    price {\n      ... on TpplcBuyPrice {\n        promotionalPriceTiers {\n          finalPrice {\n            valueExVat\n            valueIncVat\n            __typename\n          }\n          minimumQuantity\n          promotionEndDate\n          promotionMessages\n          promotionType\n          __typename\n        }\n        retailPrice {\n          valueExVat\n          valueIncVat\n          __typename\n        }\n        tradePrice {\n          valueExVat\n          valueIncVat\n          __typename\n        }\n        typicalTradePrice {\n          valueExVat\n          valueIncVat\n          __typename\n        }\n        tradePriceType\n        __typename\n      }\n      ... on TpplcHirePrice {\n        retailHireRates {\n          period\n          rate {\n            valueExVat\n            valueIncVat\n            __typename\n          }\n          __typename\n        }\n        tradeHireRates {\n          period\n          rate {\n            valueExVat\n            valueIncVat\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    priceOnApplication\n    priceUom {\n      code\n      name\n      prefix\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment TPPLCParentCategories on TpplcCategory {\n  code\n  name\n  __typename\n}\n\nfragment TPPLCParentCategoriesTree on TpplcCategory {\n  ...TPPLCParentCategories\n  parentCategories {\n    ...TPPLCParentCategories\n    parentCategories {\n      ...TPPLCParentCategories\n      parentCategories {\n        ...TPPLCParentCategories\n        parentCategories {\n          ...TPPLCParentCategories\n          parentCategories {\n            ...TPPLCParentCategories\n            parentCategories {\n              ...TPPLCParentCategories\n              parentCategories {\n                ...TPPLCParentCategories\n                parentCategories {\n                  ...TPPLCParentCategories\n                  __typename\n                }\n                __typename\n              }\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}",
    };
    const response = await productRepository.getProducts(body);
    const productIds = response.data.data.tpplcBrand.searchProducts.edges
      .filter((el) => el?.product?.variants?.length == 0)
      .map((el) => el?.product?.id);

    let qtyData = {
      operationName: "stockTpplc",
      variables: {
        branchIds: ["0320"],
        productIds: productIds,
      },
      query:
        "query stockTpplc($branchIds: [ID!]!, $productIds: [ID!]!) {\n  tpplcStock(branchIds: $branchIds, productIds: $productIds) {\n    stock {\n      branchId\n      productId\n      quantity\n      uom\n      __typename\n    }\n    __typename\n  }\n}",
    };
    const qtyResponse = await productRepository.getProductsQty(qtyData);
    const productQtyMap = new Map();
    qtyResponse.data.data.tpplcStock.stock.forEach((stockItem) => {
      productQtyMap.set(stockItem.productId, stockItem.quantity);
    });
    let productArray = [];
    response.data.data.tpplcBrand.searchProducts.edges.forEach((el) => {
      if (el?.product?.variants?.length == 0) {
        let thumbnailImage = el?.product?.primaryImage?.images.find(
          (image) => image.type === "thumbnail"
        )?.url;

        if (thumbnailImage) {
          thumbnailImage = thumbnailImage.split("?")[0];
        }

        let inventoryQty = productQtyMap.get(el?.product.id) || 0;
        productArray.push({
          id: el?.product.sku,
          name: el?.product.name,
          image: `https:${thumbnailImage}`,
          description: el?.product.description,
          sku: el?.product.sku,
          min: 1,
          max: inventoryQty,
          sellingPrice: el?.product.price.price.typicalTradePrice.valueIncVat,
          status: inventoryQty > 0 ? "ACTIVE" : "INACTIVE",
          inventory: inventoryQty,
        });
      }
    });
    const csvHeaders =
      "PRODUCT.ID,PRODUCT.NAME,PRODUCT.IMAGES,PRODUCT.DESCRIPTION,PRODUCT.SKU,PRODUCT.MIN.MAX.QUANTITY,PRODUCT.PRICE.SELLING,PRODUCT.STATUS,PRODUCT.INVENTORY,PRODUCT.CATEGORY,PRODUCT.PRICE.COST,PRODUCT.TAGS,PRODUCT.PRICE.COMPARE,PRODUCT.TAX_PERCENT,PRODUCT.LABELS\n";

    let csvContent = productArray
      .map((product) => {
        let percentageAmount = (15 / 100) * product.sellingPrice;
        let totalSellingPrice = product.sellingPrice + percentageAmount;
        let formattedTotalSellingPrice = totalSellingPrice.toFixed(2);

        const row = [
          `""`, // PRODUCT.ID (if not available, leave it empty)
          `"${product.name.replace(/"/g, '""')}"`, // PRODUCT.NAME (escaping double quotes)
          `"${product.image}"`, // PRODUCT.IMAGES
          `"${product.description.replace(/"/g, '""')}"`, // PRODUCT.DESCRIPTION (escaping double quotes)
          `"${product.sku}"`, // PRODUCT.SKU
          `"${product.min},${product.max}"`, // PRODUCT.MAX
          `${formattedTotalSellingPrice}`, // PRODUCT.PRICE.SELLING
          `"${product.status}"`, // PRODUCT.STATUS
          `${product.inventory}`, // PRODUCT.INVENTORY
          `"test"`, // PRODUCT.CATEGORY (dummy value)
          `${product.sellingPrice}`, // PRODUCT.PRICE.COST (reuse selling price for now)
        ];
        return row.join(",");
      })
      .join("\n");

    const csvFileContent = csvHeaders + csvContent;

    const path = require("path");

    const csvFilePath = path.join(__dirname, "../travisPerkinsVauxhall.csv");

    if (fs.existsSync(csvFilePath)) {
      fs.unlinkSync(csvFilePath);
      console.log("Existing file removed.");
    }

    fs.writeFile(csvFilePath, csvFileContent, (err) => {
      if (err) {
        console.error("Error writing file", err);
      } else {
        console.log("Successfully wrote productArray to product.csv");
      }
    });
  } catch (error) {
    console.error("Error fetching data :-", error.message);
  }
};

module.exports = travisPerkinsVauxhall;
