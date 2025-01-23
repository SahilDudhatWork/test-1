const axios = require("axios");

const createAxiosInstance = () => {
  const $axios = axios.create({
    baseURL: `https://www.travisperkins.co.uk`,

  });

  $axios.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return {
        data: {
          statusCode: error.response ? error.response.data.statusCode : 500,
          message: error.response
            ? error.response.data.message
            : "Internal Server Error",
        },
      };
    }
  );

  $axios.interceptors.response.use(
    (response) => {
      //   console.log("response", response);
      return response;
    },
    (error) => {
      console.log(error.response);
      return {
        data: {
          statusCode: error.response ? error.response.data.statusCode : 500,
          message: error.response
            ? error.response.data.message
            : "Internal Server Error",
        },
      };
    }
  );
  return $axios;
};

module.exports = createAxiosInstance;
