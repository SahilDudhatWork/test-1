const productRepository = require("./productRepository");

const repositories = {
  product: productRepository,
};

module.exports = {
  get: (name) => repositories[name],
};
