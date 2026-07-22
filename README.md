# Singularity - Black Hole Galaxy

Proyecto web interactivo en Three.js que renderiza una galaxia procedural de alta densidad con un agujero negro activo en el nucleo. Incluye animacion en tiempo real, panel de configuracion, calidad adaptativa y despliegue automatizado para GitHub Pages.

## Vista previa

Coloca aqui tu GIF o captura:

- `assets/preview.gif` (recomendado)
- `assets/screenshot.png`

## Caracteristicas principales

- Galaxia procedural con `BufferGeometry` y `Points`.
- Entre 30,000 y 100,000 particulas segun calidad.
- Brazos espirales, polvo espacial y campo de estrellas lejanas.
- Agujero negro con horizonte de sucesos, disco de acrecion animado y halo.
- Particulas orbitales con absorcion y respawn (simulacion estable).
- Distorsion artistica y glow aditivo configurable.
- Chorros de energia opcionales.
- Camara cinematografica automatica con control manual (`OrbitControls`).
- Interfaz minimalista con atajos de teclado.
- Calidad automatica (`low`, `medium`, `high`) + degradacion por bajo FPS.
- Respeta `prefers-reduced-motion`.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript moderno (ES modules)
- Three.js
- GLSL shaders
- lil-gui
- Vite

## Requisitos

- Node.js 18+ (recomendado Node.js 20)
- npm 9+

## Instalacion

```bash
npm install
```

## Ejecucion local

```bash
npm run dev
```

## Compilar para produccion

```bash
npm run build
```

## Vista previa del build

```bash
npm run preview
```

## Controles

### Interfaz

- `Pause / Start`: pausa o reanuda simulacion.
- `Reset Camera`: restablece posicion de camara.
- `Fullscreen`: alterna pantalla completa.
- `Hide UI`: muestra/oculta interfaz.
- `Config`: muestra/oculta panel de `lil-gui`.

### Atajos de teclado

- `Space`: pausa/reanuda.
- `R`: reset de camara.
- `F`: fullscreen.
- `H`: mostrar/ocultar UI.
- `G`: mostrar/ocultar panel de configuracion.

### Navegacion 3D

- Arrastrar mouse: orbitar.
- Rueda del mouse: zoom.

## Estructura de carpetas

```text
black-hole-galaxy/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js
│   ├── styles.css
│   ├── config.js
│   ├── scene/
│   │   ├── createScene.js
│   │   ├── createGalaxy.js
│   │   ├── createBlackHole.js
│   │   ├── createStarField.js
│   │   └── createPostProcessing.js
│   ├── controls/
│   │   ├── cameraController.js
│   │   └── guiController.js
│   ├── shaders/
│   │   ├── galaxyVertex.glsl
│   │   ├── galaxyFragment.glsl
│   │   ├── accretionVertex.glsl
│   │   └── accretionFragment.glsl
│   └── utils/
│       ├── performance.js
│       └── dispose.js
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── LICENSE
└── README.md
```

## Publicar en GitHub Pages

Este proyecto ya incluye workflow en `.github/workflows/deploy.yml`.

1. Sube el proyecto a un repositorio llamado `black-hole-galaxy` (o ajusta `repoName` en `vite.config.js`).
2. Haz push a `main`.
3. Ve a GitHub > `Settings` > `Pages`.
4. En `Build and deployment`, selecciona `GitHub Actions`.
5. Ve a la pestaña `Actions` y verifica el workflow `Deploy to GitHub Pages`.
6. Al finalizar, GitHub mostrara la URL publicada.

## Personalizacion

Desde el panel `lil-gui` puedes ajustar:

- Cantidad de particulas.
- Tamano de estrellas.
- Numero de brazos.
- Velocidad de rotacion.
- Intensidad de glow.
- Radio del horizonte de sucesos.
- Tamano del disco de acrecion.
- Colores principales.
- Intensidad de distorsion.
- Camara automatica.
- Calidad grafica.
- Visibilidad de jets.

## Consideraciones de rendimiento

- Se limita `pixelRatio` por nivel de calidad.
- Se usa `BufferGeometry` + `TypedArray` para alto rendimiento.
- Si el FPS promedio cae durante varios segundos, el sistema baja automaticamente la calidad.
- En dispositivos moviles o de baja capacidad se inicia en calidad reducida.

## Futuras mejoras

- Distorsion gravitacional por postprocesado dedicado (pass custom de lensing).
- Audio reactivo procedural.
- Captura de frames para exportar loops.
- Modo fotografia con presets cinematicos.

## Autor

Israel Diaz

## Licencia

MIT
