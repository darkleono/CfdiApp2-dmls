const express = require("express");
const path = require("path");
const apiRoutes = require("./routes/api");

const app = express();

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "..", "public")));

// Página de bienvenida
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Rutas de la API
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
