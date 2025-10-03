<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Demo Widget (Lite)</title>
  <!-- Usamos vite-plugin-css-injected-by-js para que el css vaya incluido en el .js y no sea necesario incluir el style.css -->
  <!-- <link rel="stylesheet" href="/style.css"> -->
</head>
<body>
  <div id="chat-widget"></div>

  <!-- Vue global: necesario en modo no-standalone -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>

  <!-- Tu bundle en modo lite (sin Vue embebido) -->
  <script src="/chat-widget.iife.js" data-chat-widget="1" data-backend="https://chatbot-backend.suggero.asmws.net"></script>


  <!-- Para que esto funcionara deberiamos modificar el vite.config.js para que se monte 
  el build no-standalone sin el wrapper mount.js
  En concreto habria que cambiar esta línea:
  entry: standalone ? './src/mount.js' : './src/mount.js',
  
  Por esto:

  entry: standalone ? './src/mount.js' : './src/ChatWidget.vue',

  Pero mejor que se lancen igual la version standalone y la no-standalone
  -->  
  <!-- <script>
    const app = Vue.createApp(ChatWidget, {
      user: 'Demo',
      iconWidth: 260
    }) // ChatWidget es el componente
    app.mount('#chat-widget')
  </script> -->


  <script>
    // Igual que en standalone: tu widget expone ChatWidget
    ChatWidget.init({
      target: '#chat-widget',
      user: 'Demo',
      iconWidth: 60
    })
  </script>
</body>
</html>
