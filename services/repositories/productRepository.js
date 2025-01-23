const createAxiosInstance = require("./axiosInstance");

const productRepository = {
  getProducts(payload) {
    const axiosInstance = createAxiosInstance();
    const url = `/graphql?op=searchProducts`;
    return axiosInstance.post(url, payload);
  },
  getProductsQty(payload) {
    const axiosInstance = createAxiosInstance();
    const url = `/graphql?op=stockTpplc`;
    return axiosInstance.post(url, payload);
  },
};

module.exports = productRepository;
