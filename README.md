# 📖 Versículos Bíblicos - Aplicación de Práctica

App interactiva para practicar el orden de versículos bíblicos usando drag & drop. Perfecto para estudiantes de biblia que necesitan memorizar versículos en un orden específico.

## ✨ Características

- **Drag & Drop**: Arrastra las tarjetas para ordenar los versículos
- **Verificación instantánea**: Comprueba si tu orden es correcto
- **Administración fácil**: Agrega tus propios sermones, capítulos y versículos
- **Almacenamiento local**: Los datos se guardan en tu dispositivo (sin conexión a internet)
- **Interfaz limpia**: Diseño intuitivo y fácil de usar

## 🚀 Instalación

### Requisitos
- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) en tu teléfono (para probar en dispositivo)

### Pasos

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/bible-verse-app.git
   cd bible-verse-app
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Inicia la app**
   ```bash
   npx expo start
   ```

4. **Abre en tu teléfono**
   - Escanea el código QR con la app **Expo Go**
   - O presiona `i` para iOS Simulator / `a` para Android Emulator

## 📱 Cómo usar

### Agregar contenido
1. Presiona **⚙ Admin** en la esquina superior derecha
2. Haz clic en **+ Nuevo** para crear un sermón
3. Escribe el título (ej: "Sermón 1 — La fe")
4. Presiona **Crear sermón**
5. En la edición, haz clic en **+ Agregar capítulo**
6. Agreg los versículos en el orden correcto (ese será el orden a practicar)

### Practicar
1. En la pantalla principal, expande un sermón
2. Presiona el ▶ de un capítulo
3. Las tarjetas de versículos aparecen mezcladas
4. **Mantén presionado y arrastra** para reordenar
5. Presiona **Verificar orden ✓**
6. Verás qué versículos quedaron correctos (✓) e incorrectos (✗)
7. Presiona **Reintentar** para volver a intentar

## 🛠️ Tech Stack

- **React Native** + **Expo** — Framework multiplataforma
- **TypeScript** — Tipado estricto
- **Drag & Drop** — `react-native-draggable-flatlist`
- **Navegación** — `@react-navigation/native`
- **Almacenamiento local** — `@react-native-async-storage/async-storage`

## 📂 Estructura del proyecto

```
bible-verse-app/
├── App.tsx                     # Punto de entrada principal
├── src/
│   ├── types/
│   │   └── index.ts           # Tipos TypeScript (Verse, Chapter, Sermon)
│   ├── storage/
│   │   └── dataService.ts     # Persistencia de datos (AsyncStorage)
│   └── screens/
│       ├── HomeScreen.tsx     # Lista de sermones y capítulos
│       ├── PracticeScreen.tsx # Pantalla de práctica con drag & drop
│       ├── AdminScreen.tsx    # Gestión de sermones
│       ├── SermonEditorScreen.tsx      # Editor de sermón
│       └── ChapterEditorScreen.tsx     # Editor de capítulo y versículos
├── package.json
└── babel.config.js
```

## 🎨 Diseño

- **Color primario**: Azul marino (#1a3c6e) - académico y serio
- **Color secundario**: Dorado (#c4a35a) - acentos y énfasis
- **Fondo**: Beige (#f5f0e8) - apariencia de pergamino
- **Feedback**: Verde (#4caf50) correcto, Rojo (#f44336) incorrecto

## 📝 Tipos de datos

Cada **Verso** tiene:
- `text` — el contenido del versículo
- `reference` — referencia bíblica (ej: "Juan 3:16") — opcional
- El **orden** se determina por la posición en el array

```typescript
interface Verse {
  id: string;
  text: string;
  reference?: string;
}

interface Chapter {
  id: string;
  title: string;
  verses: Verse[];  // orden = posición en array
}

interface Sermon {
  id: string;
  title: string;
  chapters: Chapter[];
}
```

## 🔒 Privacidad

Todos los datos se guardan **localmente en tu dispositivo**. No se envía información a servidores externos.

## 🐛 Reportar problemas

Si encuentras un bug, abre un [Issue](https://github.com/tu-usuario/bible-verse-app/issues) describiendo:
- Qué intentabas hacer
- Qué salió mal
- Pasos para reproducir el problema

## 💡 Ideas futuras

- [ ] Exportar/importar datos en JSON
- [ ] Estadísticas de práctica
- [ ] Modo oscuro
- [ ] Sonidos de feedback
- [ ] Temas personalizables
- [ ] Base de datos con versículos bíblicos populares

## 📄 Licencia

Este proyecto está bajo licencia **MIT**. Siéntete libre de usarlo, modificarlo y compartirlo.

## 👤 Autor

Creado con ❤️ para estudiantes de la Biblia.

---

**¿Preguntas?** Abre un [Discussion](https://github.com/tu-usuario/bible-verse-app/discussions) o un [Issue](https://github.com/tu-usuario/bible-verse-app/issues).
