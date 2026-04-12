## ⚙️ Requisitos Previos

* **Node.js** (v18 o superior recomendado)
* **npm** (Gestor de paquetes de Node)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
Abra su terminal y ubícate en el directorio del proyecto:
\`\`\`bash
cd ruta/a/tu/proyecto/bio-alignment-app
\`\`\`

### 2. Instalar dependencias
El proyecto requiere `express` para el servidor web y `better-sqlite3` para la base de datos local. Instálelos ejecutando:
\`\`\`bash
npm install express better-sqlite3
\`\`\`

### 3. Inicializar la Base de Datos
Antes de ejecutar la aplicación por primera vez, debe crear la base de datos SQLite y sembrar los datos de prueba (taxonomía y secuencias). Ejecute el script de inicialización:
\`\`\`bash
node src/backend/db_init.js
\`\`\`
> **Nota:** Verás un mensaje confirmando que la base de datos y las tablas fueron creadas exitosamente en la carpeta `/data`. Solo necesitas ejecutar este comando una vez.

### 4. Levantar el Servidor
Inicie el servidor web local y la API REST:
\`\`\`bash
node src/backend/server.js
\`\`\`

### 5. Acceder a la Aplicación
Abra su navegador web de preferencia y dirígete a:
**[http://localhost:3000](http://localhost:3000)**

---

## 📂 Estructura del Proyecto

\`\`\`text
bio-alignment-app/
├── data/
│   └── bio_database.sqlite    # BD local (Generada automáticamente)
├── src/
│   ├── backend/
│   │   ├── db_init.js         # Script de creación y sembrado de la BD
│   │   ├── db_manager.js      # Lógica de consultas a SQLite
│   │   └── server.js          # Servidor Express y API REST
│   ├── bio_core/
│   │   ├── matrices.js        # Reglas físico-químicas y puntuaciones PAM
│   │   └── needleman.js       # Motor matemático del alineamiento
│   └── frontend/
│       ├── index.html         # Interfaz de usuario
│       ├── css/styles.css     # Estilos y renderizado de colores
│       └── js/app.js          # Consumo de API y lógica visual
└── README.md
\`\`\`

## 🧪 Uso
1. Al cargar la página web, el sistema calculará instantáneamente el nivel de identidad de todos los organismos de la base de datos contra la secuencia humana.
2. se puede observar el panel izquierdo para ver el **Ranking Evolutivo**, ordenado de mayor a menor similitud, con barras indicadoras de color.
3. Haga click en cualquier organismo del ranking para ver el **Alineamiento Detallado** en el panel derecho, donde cada aminoácido está coloreado según su grupo químico para facilitar el análisis visual.