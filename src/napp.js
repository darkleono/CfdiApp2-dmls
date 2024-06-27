const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware para analizar JSON en el cuerpo de la solicitud
app.use(express.json());

// Middleware para analizar texto plano en el cuerpo de la solicitud, específicamente XML
app.use(express.text({ type: 'application/xml' }));

// Servir archivos estáticos con Content-Type correcto
app.use(express.static(path.join(__dirname, '..', 'public'), {
  setHeaders: function (res, path) {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Middleware para log de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Middleware para log de datos recibidos en la llamada a la API
app.use('/api', (req, res, next) => {
  console.log(`API request received at ${new Date()}:`);
  console.log(`Request Method: ${req.method}`);
  console.log(`Request URL: ${req.originalUrl}`);
  console.log(`Request Body:`);
  console.log(req.body); // Log del cuerpo de la solicitud
  next(); // Continuar con el siguiente middleware/ruta
});

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

const PORT = process.env.PORT || 8287;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
