const app = require("./app");
const mongoose = require("mongoose");

const DB = process.env.MONGODB_URI;
// DB Connection
mongoose
  .connect(DB)
  .then(() => {
    console.log("DB has been connected successfuly!");
  })
  .catch((err) => {
    console.error(err);
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
