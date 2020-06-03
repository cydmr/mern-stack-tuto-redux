const express = require("express");
const connectDB = require("./config/db");
const app = express();

connectDB();

app.use(express.json({ extended: true }));
app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/user", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
