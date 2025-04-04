require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Para poder procesar el cuerpo de las solicitudes POST

// Puerto de la aplicación
const port = process.env.PORT || 3000;

// Simulación de base de datos en memoria
let urlDatabase = [];
let counter = 1;

// Ruta para la página de inicio (formulario HTML)
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Ruta para generar un short URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validación de la URL
  dns.lookup(originalUrl, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Si la URL es válida, la agregamos a nuestra "base de datos"
    const shortUrl = counter++;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

    // Responder con el JSON de la URL acortada
    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

// Ruta para redirigir a la URL original usando el short URL
app.get('/api/shorturl/:short', function(req, res) {
  const shortUrl = parseInt(req.params.short, 10);

  // Buscar en la "base de datos" el short URL
  const urlRecord = urlDatabase.find((entry) => entry.short_url === shortUrl);
  
  if (urlRecord) {
    // Si se encuentra, redirigir a la URL original
    return res.redirect(urlRecord.original_url);
  }

  // Si no se encuentra el short URL, devolver error
  res.json({ error: 'No short URL found for the given input' });
});

// Iniciar el servidor
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
