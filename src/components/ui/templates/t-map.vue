<template>
  <div>
    <div class="overflow-hidden fixed inset-0 bg-cover" id="map"></div>
    <!-- v-if="makerPopup" -->
      <!-- Insertamos el SVG directamente sobre el mapa -->
    <svg 
      id="overlay-svg" 
      viewBox="0 0 1200 800" 
      xmlns="http://www.w3.org/2000/svg"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;"
    >
      <!-- Aquí va el código SVG del mapa sombreado -->
      <path 
        class="leaflet-interactive" 
        stroke="#3388ff" 
        stroke-opacity="1" 
        stroke-width="3" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="#3388ff" 
        fill-opacity="0.2" 
        fill-rule="evenodd" 
        d="M1118 422L1108 422L1106 424L1105 429L1101 430L1097 434L1095 442L1092 445L1093 448L1091 450L1090 449L1079 454L1075 458L1076 461L1072 465L1073 468L1077 470L1077 472L1074 473L1077 476L1078 473L1080 475L1079 480L1081 480L1085 486L1085 494L1087 494L1086 495L1089 498L1089 500L1092 502L1091 507L1092 506L1092 510L1095 515L1094 518L1098 522L1100 528L1107 537L1106 538L1108 540L1109 538L1113 538L1111 534L1113 532L1113 526L1120 528L1120 530L1116 532L1114 538L1116 536L1120 536L1118 538L1122 540L1121 548L1124 545L1130 545L1130 542L1135 537L1139 537L1140 532L1145 527L1147 527L1148 524L1152 524L1151 517L1153 517L1156 514L1156 510L1152 500L1150 498L1148 500L1145 495L1150 490L1150 486L1154 478L1155 477L1155 479L1158 482L1160 480L1160 476L1157 471L1150 469L1146 465L1144 465L1141 460L1140 461L1140 457L1136 453L1136 449L1134 449L1135 446L1131 442L1129 442L1126 433L1123 430L1121 430L1122 427L1120 427L1118 422z">
      </path>
    </svg>
  </div>
</template>

<script>
import axios from "axios";
import * as L from "leaflet/dist/leaflet-src.js";
import Papa from "papaparse";
/*import { DateTime } from "luxon";*/
/*import * as XLSX from "xlsx";*/
//import "leaflet.pattern";
import "leaflet/dist/leaflet.css";
import { useGeojsonStore } from "@/stores/geojson.js";

export default {
  
  data() {
    return {
      map: null,
      useGeojson: useGeojsonStore(),
      initialCenter: [10, 0], // Coordenadas iniciales
      initialZoom: 1, // Zoom inicial*/
      /*initialZoom: null,*/
      initialLatLeng: null,
      setData: null,
      csvLayer: null,
      flashInterval: null, // Para almacenar el intervalo de destello
      sumarProf: 0,
      intervalId: null,
      isGeoJSONProcessing: false,
    };
  },
  mounted() {
    var attribution =
      '&copy; <a href="httpS://osm.org/copyright">OpenStreetMap</a> contributors';
    var terreno = L.tileLayer(
        "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
        { attribution: attribution }
      ),
      google = L.tileLayer(
        "https://mt1.google.com/vt/lyrs=m@113&hl=en&&x={x}&y={y}&z={z}",
        {
          attribution: attribution,
        }
      ),
      openstreet = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: attribution }
      ),
      satelital = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }
      ),
      luzNotable = L.tileLayer(
        "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        { attribution: attribution }
      ),
      viajero = L.tileLayer(
        "https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
        { attribution: attribution }
      ),
      gris = L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { attribution: attribution }
      ),
      workstreet = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
        }
      ),
      worktopo = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
        }
      ),
      dark = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      ),
      delimitaciones = L.tileLayer(
        "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { attribution: attribution }
      );
    const windowWidth = window.innerWidth;
    if (windowWidth <= 600) {
      this.initialZoom = 0.45;
      this.initialLatLeng = [10, 0]; // O cualquier otra coordenada que desees para esta condición
    } else if (windowWidth <= 1920) {
      this.initialZoom = 2;
      this.initialLatLeng = [10, 0];
    } else {
      this.initialZoom = 1;
      this.initialLatLeng = [37, 0];
    }

    // Define límites (bounds) para evitar la repetición del mapa
    const southWest = L.latLng(-75, -270);
    const northEast = L.latLng(90, 210);
    const bounds = L.latLngBounds(southWest, northEast);
    // Inicializa el mapa
    this.map = L.map("map", {
      minZoom: this.initialZoom,
      maxZoom: 18,
      center: this.initialLatLeng,
      zoom: this.initialZoom,
      layers: [gris], // cambiar favorito
      fullscreenControlOptions: { position: "bottomright" },
      preferCanvas: false,
      maxBounds: bounds, // Fija los límites del mapa
      maxBoundsViscosity: 1.0,
    });

    const that = this;
    this.map.removeControl(this.map.zoomControl);
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(this.map);

    L.control
      .layers(
        {
          Satélite: satelital,
          Terreno: terreno,
          "Google maps": google,
          OpenStreetMap: openstreet,
          "Luz Notable": luzNotable,
          "Lona gris claro": gris,
          Viajero: viajero,
          Workstreet: workstreet,
          WorkTopography: worktopo,
          Noche: dark,
        },
        { Delimitaciones: delimitaciones },
        { position: "bottomright" }
      )
      .addTo(this.map);

    // Cargar el archivo GeoJSON usando axios
    axios
      .get("/peru-sismico/placas.json")

      .then((response) => {
        // Crear clones del GeoJSON para simular repetición
        const repeatOffsets = [
          [0, -360],
          [0, 360],
          [0, 0],
          [360, 0],
          [-360, 0], // Estas son longitudes para replicar el GeoJSON (puedes ajustar más offsets)
        ];

        repeatOffsets.forEach((offset) => {
          const geoJSONLayerClone = L.geoJSON(response.data, {
            style: function () {
              return {
                color: "#fff", // Color del borde
                weight: 0.5, // Grosor del borde más delgado (ajústalo a tu gusto)
                opacity: 1, // Opacidad del borde
                fillOpacity: 0.5, // Opacidad del relleno (ajústalo si lo deseas)
              };
            },
            onEachFeature: function (feature, layer) {
              if (feature.properties && feature.properties.name) {
                layer.bindPopup(feature.properties.name); // Muestra un popup con la propiedad 'name'
              }
            },
          }).addTo(that.map);
          // Mueve el clon de la capa por las coordenadas
          geoJSONLayerClone.eachLayer((layer) => {
            layer.setLatLngs(
              layer.getLatLngs().map((point) => [
                point.lat,
                point.lng + offset[0], // Desplaza longitudinalmente para repetir
              ])
            );
          });
        });
      });

    // Cargar el archivo CSV
    axios
      .get("/peru-sismico/datas/data.csv")
      .then((response1) => {
        
        axios.get("/peru-sismico/datas/historicos.csv").then((response2) => {
          // Procesar el primer CSV
          Papa.parse(response1.data, {
            header: true,
            dynamicTyping: true,
            complete: (result1) => {
              const dataDiciembre = result1.data;

              // Procesar el segundo CSV
              Papa.parse(response2.data, {
                header: true,
                dynamicTyping: true,
                complete: (result2) => {
                  const dataEnero = result2.data.map((row) => {
                    // Unir fecha y hora, y agregar campos faltantes
                    return {
                      time: `${row.fecha}T${row.hora}Z`,
                      latitude: row.latitude,
                      longitude: row.longitude,
                      depth: row.depth,
                      mag: row.mag,
                      place: "-", // Asignar "-" si no hay lugar
                      magType: "-", // Asignar "-" si no hay tipo de magnitud
                    };
                  });
                  // Combinar los datos
                  const combinedData = [...dataDiciembre, ...dataEnero];

                  // Convertir a GeoJSON
                  const geoJSONData = this.convertCSVToGeoJSON(combinedData);

                  // Actualizar datos y mapa
                  this.setData = combinedData;
                  this.addGeoJSONToMap(geoJSONData);
                },
              });
            },
          });
          
        });
      })
      .catch((error) => {
        console.error("Error al cargar los datos:", error);
      });

    /*    axios.get("/datas/data_diciembre.csv").then((response) => {
      Papa.parse(response.data, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          const transformedData = result.data.map((row) => {
            if (row.date && row.hour) {
              // Crear la columna "time" a partir de "date" y "hour"
              const datetime = DateTime.fromFormat(
                '${row.date} ${row.hour}',
                "dd/MM/yyyy HH:mm:ss"
              );
              row.time = datetime.toISO(); // Crear la propiedad "time" con formato ISO
            }
            // Eliminar columnas originales si existen
            delete row.date;
            delete row.hour;
            return row;
          });

          console.log(transformedData);

          const geoJSONData = this.convertCSVToGeoJSON(transformedData);
          this.setData = transformedData;
          this.addGeoJSONToMap(geoJSONData);
        },
      });
    });

        axios
      .get("/datas/data_diciembre.xlsx", { responseType: "arraybuffer" })
      .then((response) => {
        const workbook = XLSX.read(response.data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(
          workbook.Sheets[firstSheetName]
        );
        console.log(sheetData);
        // Convertir `date` y `hour` a un formato ISO 8601 para la columna `time`
        const formattedData = sheetData.map((row) => {
          const { date, hour, ...rest } = row;
          const formattedTime = DateTime.fromFormat(
            `${date} ${hour}`,
            "dd/MM/yyyy HH:mm:ss"
          ).toISO();

          console.log(formattedData);
          return {
            ...rest,
            time: formattedTime,
          };
        });

        const geoJSONData = convertCSVToGeoJSON(formattedData); // Usa tu función existente
        this.setData = formattedData;
        this.addGeoJSONToMap(geoJSONData); // Usa tu lógica existente
      });

 */
  },

  watch: {
    "useGeojson.continente": "handleGeoJSONUpdate",
    "useGeojson.rangoFechas": "handleGeoJSONUpdate",
    "useGeojson.rangoMagnitud": "handleGeoJSONUpdate",
    "useGeojson.profundidad": "handleGeoJSONUpdate",
    "useGeojson.setZoom": function (newVal) {
      if (newVal) {
        // Cuando setZoom es true, aumenta el zoom y guarda el valor previo
        this.zoomIn();
      } else {
        // Cuando setZoom es false, regresa al zoom previo
        this.zoomOut();
      }
    },
  },

  methods: {
    zoomIn() {
      if (this.map) {
        // Guardamos el zoom actual antes de aumentar el zoom
        this.previousZoom = this.map.getZoom();

        // Aumentamos el zoom en 2 niveles
        let newZoom = this.previousZoom + 1; // CAMBIAR AQUI LA CANTIDAD DEL ZOOM
        // Asegurarse de no exceder el zoom máximo
        newZoom = Math.min(newZoom, this.map.getMaxZoom());

        // Establecemos el nuevo zoom
        this.map.setZoom(newZoom);
      }
    },
    zoomOut() {
      if (this.map && this.previousZoom !== null) {
        // Si existe un zoom previo, regresamos a ese valor
        this.map.setZoom(this.previousZoom);
      }
    },
    async handleGeoJSONUpdate() {
      if (this.isGeoJSONProcessing) return;
      this.isGeoJSONProcessing = true;

      const geoJSONData = await this.convertCSVToGeoJSON(this.setData);
      this.addGeoJSONToMap(geoJSONData);

      // Reset after processing
      this.isGeoJSONProcessing = false;
    },
    convertCSVToGeoJSON(data) {
      // Filtrar por latitud y longitud
      const filteredByCoordinates = data.filter((row) => {
        return (
          !isNaN(row.latitude) &&
          !isNaN(row.longitude) &&
          row.latitude !== null &&
          row.longitude !== null &&
          row.latitude >= this.useGeojson.continente.minLatitude &&
          row.latitude <= this.useGeojson.continente.maxLatitude &&
          row.longitude >= this.useGeojson.continente.minLongitude &&
          row.longitude <= this.useGeojson.continente.maxLongitude
        );
      });

      // Filtrar por magnitud
      const filteredByMagnitude = filteredByCoordinates.filter((row) => {
        const mag = row.mag;
        return (
          mag >= this.useGeojson.rangoMagnitud.maxMag &&
          mag <= this.useGeojson.rangoMagnitud.minMag
        );
      });

      // Filtrar por fecha
      const filteredByDate = filteredByMagnitude.filter((row) => {
        const eventDate = new Date(row.time);
        return (
          eventDate >= this.useGeojson.rangoFechas.startDate &&
          eventDate <= this.useGeojson.rangoFechas.endDate
        );
      });
      // Filtrar por profunidad
      const filteredByDepth = filteredByDate.filter((row) => {
        const depth = row.depth;

        if (this.useGeojson.profundidad.isSuperficial && depth <= 60) {
          return true;
        }
        if (
          this.useGeojson.profundidad.isIntermediate &&
          depth > 60 &&
          depth <= 300
        ) {
          return true;
        }
        if (this.useGeojson.profundidad.isDeep && depth > 300) {
          return true;
        }
        return false; // No cumple con las condiciones de profundidad
      });

      return {
        type: "FeatureCollection",
        features: filteredByDepth.map((row) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
          },
          properties: {
            mag: row.mag,
            place: row.place,
            time: row.time,
            depth: row.depth,
            magType: row.magType,
          },
        })),
      };
    },

    addGeoJSONToMap(geoJSON) {
      // Eliminar la capa CSV anterior si existe
      if (this.csvLayer) {
        this.map.removeLayer(this.csvLayer); // Elimina la capa anterior
        this.csvLayer = null; // Limpia la referencia
      }

      // Detener cualquier intervalo en ejecución
      if (this.intervalId) {
        clearInterval(this.intervalId); // Detener el intervalo anterior
        this.intervalId = null; // Reiniciar la variable
      }

      // Crear una nueva capa GeoJSON vacía
      this.csvLayer = L.geoJSON(null, {
        pointToLayer: (feature, latlng) => {
          // Definir el color basado en la profundidad
          let color = "#ff0000"; // Color por defecto RED

          if (feature.properties.depth > 300) {
            color = "#002FEF"; // Profundos (> 300 km) BLUE
          } else if (
            feature.properties.depth > 60 &&
            feature.properties.depth <= 300
          ) {
            color = "#0AB427"; // Intermedios (61 km - 300 km) GREEN
          } else if (feature.properties.depth <= 60) {
            color = "#ff0000"; // Superficiales (< 60 km) RED
          }

          // Definir el radio basado en la magnitud
          let radius = 1; // Radio por defecto
          const magnitude = feature.properties.mag;

          if (magnitude >= 4 && magnitude <= 5) {
            radius = 3.5;
          } else if (magnitude > 5 && magnitude <= 6) {
            radius = 5.5;
          } else if (magnitude > 6 && magnitude <= 7) {
            radius = 8.5;
          } else if (magnitude > 7 && magnitude <= 8) {
            radius = 15;
          } else if (magnitude > 8 && magnitude <= 9.5) {
            radius = 23;
          }

          return L.circleMarker(latlng, {
            className: "pulse",
            radius: radius + this.sumarProf,
            fillColor: color,
            /* CIRCULO COMPLETO
            opacity: 0.5,
            fillOpacity: 0.9,*/

            /* CIRCULO HUECO  */
            fillOpacity: 0,
            color: color,
          });
        },

        onEachFeature: (feature, layer) => {
          // Muestra un popup con la información del sismo
          layer.bindPopup(
            `Lugar: ${feature.properties.place}
            <br>
            Magnitud: ${feature.properties.mag}
            <br>
            Profundidad: ${feature.properties.depth} km
            <br>
            Fecha: ${new Date(feature.properties.time).toLocaleString()}`
          );
        },
      }).addTo(this.map);

      // Ajustar el mapa a los límites definidos
      const bounds = L.latLngBounds([
        [
          this.useGeojson.continente.minLatitude,
          this.useGeojson.continente.minLongitude,
        ],
        [
          this.useGeojson.continente.maxLatitude,
          this.useGeojson.continente.maxLongitude,
        ],
      ]);

      // Verifica si hay datos y ajusta el mapa a los límites
      if (geoJSON.features.length > 0) {
        this.map.fitBounds(bounds);
      }

      // Reiniciar `features` con los datos actuales
      const features = geoJSON.features; // Datos filtrados actuales
      const chunkSize = 1; // Tamaño del grupo - 10 en 10
      const segundos = 0.05; //cantidad de segundos - 1 segundo
      let index = 0; // Índice inicial

      // Añadir los puntos en intervalos
      const addPointsInChunks = () => {
        if (
          index >= features.length ||
          this.useGeojson.estadoPl === "disable"
        ) {
          clearInterval(this.intervalId); // Detener el intervalo al finalizar
          this.useGeojson.estadoPl = "disable";
          return;
        }

        // Seleccionar el siguiente grupo de puntos
        const chunk = features.slice(index, index + chunkSize);
        chunk.forEach((feature) => {
          this.csvLayer.addData(feature); // Agregar los puntos al mapa
        });

        index += chunkSize; // Avanzar el índice
      };

      // Iniciar un nuevo intervalo
      this.intervalId = setInterval(addPointsInChunks, segundos * 1000);
    },

    /*  addGeoJSONToMap(geoJSON) {
      // Eliminar la capa CSV anterior si existe
      if (this.csvLayer) {
        this.map.removeLayer(this.csvLayer);
      }

      // Crear un grupo de capas vacío para los puntos
      this.csvLayer = L.layerGroup().addTo(this.map);

      // Dividir los puntos en bloques de 10
      const features = geoJSON.features;
      const chunkSize = 1; // CANTIDAD DE PUNTOS APARECER
      let currentIndex = 0;

      const addChunk = () => {
        const chunk = features.slice(currentIndex, currentIndex + chunkSize);

        chunk.forEach((feature) => {
          const latlng = [
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0],
          ];

          // Definir el color basado en la profundidad
          let color = "#ff0000"; // Color por defecto RED
          if (feature.properties.depth > 300) {
            color = "#007aff"; // Profundos (> 300 km) BLUE
          } else if (
            feature.properties.depth >= 61 &&
            feature.properties.depth <= 300
          ) {
            color = "#39ff14"; // Intermedios (61 km - 300 km) GREEN
          } else if (feature.properties.depth <= 60) {
            color = "#ff0000"; // Superficiales (< 60 km) RED
          }

          // Definir el radio basado en la magnitud
          let radius = 1; // Radio por defecto
          const magnitude = feature.properties.mag;
          if (magnitude >= 4 && magnitude <= 5) {
            radius = 3.5;
          } else if (magnitude > 5 && magnitude <= 6) {
            radius = 4.5;
          } else if (magnitude > 6 && magnitude <= 7) {
            radius = 5.5;
          } else if (magnitude > 7 && magnitude <= 9.5) {
            radius = 13;
          }

          // Crear el marcador
          var marker = L.circleMarker(latlng, {
            radius: radius + this.sumarProf,
            fillColor: color,
            className: "pulse",
            color: "#000",
            weight: 0.5, // Borde
            opacity: 1,
            fillOpacity: 0.9,
          });
          // Agregar un popup
          marker.bindPopup(
            `Lugar: ${feature.properties.place}<br>Magnitud: ${
              feature.properties.mag
            }<br>Profundidad: ${
              feature.properties.depth
            } km<br>Fecha: ${new Date(
              feature.properties.time
            ).toLocaleString()}`
          );

          // Agregar el marcador al grupo
          this.csvLayer.addLayer(marker);
        });

        // Actualizar el índice y verificar si quedan más puntos
        currentIndex += chunkSize;
        if (currentIndex < features.length) {
          setTimeout(addChunk, 100); // CAMBIAR TIEMPO DE APARECION DE PUNTOS
        }
      };

      // Iniciar la animación
      addChunk();

      // Ajustar el mapa a los límites definidos
      const bounds = L.latLngBounds([
        [
          this.useGeojson.continente.minLatitude,
          this.useGeojson.continente.minLongitude,
        ],
        [
          this.useGeojson.continente.maxLatitude,
          this.useGeojson.continente.maxLongitude,
        ],
      ]);

      if (features.length > 0) {
        this.map.fitBounds(bounds);
      }
    }, */
  },
  beforeUnmount() {
    // Detener cualquier intervalo en ejecución al desmontar
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Eliminar capas del mapa si es necesario
    if (this.csvLayer) {
      this.map.removeLayer(this.csvLayer);
      this.csvLayer = null;
    }

    // Limpiar el mapa
    if (this.map) {
      this.map.off(); // Desvincula todos los eventos
      this.map.remove(); // Elimina el mapa
      this.map = null;
    }
  },
};
</script>

<style>
#map {
  width: 100%; /* Asegúrate de que el mapa ocupe todo el ancho */
  z-index: 0; /* Asegúrate de que no esté siendo cubierto por otros elementos */
}

.pulse {
  animation: pulsate 1s ease-out;
  opacity: 1;
  stroke-width: 1px;

  /*stroke: white;  CIRCULO COMPLETO*/
}
@keyframes pulsate {
  0% {
    fill: white;
    opacity: 1;
    stroke-width: 15px;
    stroke: white;
  }
  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>