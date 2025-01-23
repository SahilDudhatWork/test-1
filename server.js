const express = require("express");
const app = express();
const cron = require("node-cron");
const BuildgoPimlico = require("./croneJob/BuildgoPimlico");
const travisPerkinsVauxhall = require("./scrapeProducts/travisPerkinsVauxhall");
const BuildgoLondonBridge = require("./croneJob/BuildgoLondonBridge");
const TravisPerkinsLondonBridge = require("./scrapeProducts/TravisPerkinsLondonBridge");
const PORT = process.env.PORT || 3000;

// // crons
// cron.schedule("*/2 * * * *", async () => {
//   console.log("Running BuildgoPimlico and travisPerkinsVauxhall every 2 minutes");
//   try {
//     await travisPerkinsVauxhall(); // Ensure this function is awaited
//     await BuildgoPimlico(); // Ensure this function is awaited
//   } catch (error) {
//     console.error("Error during cron job execution:", error);
//   }
// });

// Uncomment the below function if you want to execute it immediately when the server starts
(async () => {
  try {
    await travisPerkinsVauxhall();
    await BuildgoPimlico();

    await TravisPerkinsLondonBridge();
    await BuildgoLondonBridge();
  } catch (error) {
    console.error("Error during initial execution:", error);
  }
})();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
