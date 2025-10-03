<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Demo Widget</title>
  <!-- Usamos vite-plugin-css-injected-by-js para que el css vaya incluido en el .js y no sea necesario incluir el style.css -->
  <!-- <link rel="stylesheet" href="/style.css"> -->
</head>
<body>
  <div id="chat-widget"></div>

  <!-- Tu bundle expone la función global definida en el build -->
  <script src="/chat-widget.standalone.iife.js" data-chat-widget="1" data-icon-width="60" data-backend="https://chatbot-backend.suggero.asmws.net"></script>
  <script>
    // Supongamos que tu widget expone algo como "ChatWidget.init"
    ChatWidget.init({
      target: '#chat-widget',
      user: 'Demo',
      // iconWidth: '550'
    })
  </script>
</body>
</html>
