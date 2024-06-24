const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware para analizar JSON en el cuerpo de la solicitud
app.use(express.json());

// Servir archivos estáticos con Content-Type correcto
app.use(express.static(path.join(__dirname, '..', 'public'), {
  setHeaders: function(res, path, stat) {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'text/javascript');
    }
  }
}));

// Página de bienvenida
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Ruta para valida-status.html
app.get('/valida-status', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'valida-status.html'));
});

// Rutas de la API
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3600;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});