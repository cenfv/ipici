document.addEventListener("DOMContentLoaded", function() {
    const mapContainer = document.getElementById("id_location-map");
    if (mapContainer && !window.map) {
        window.map = L.map("id_location-map", {
            center: [-23.185391, -50.648520],
            zoom: 15,
            zoomControl: true
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "Map data &copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors"
        }).addTo(window.map);
        L.Control.geocoder({
            position: 'topleft'
        }).addTo(window.map);
        L.control.layers({
            "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "Map data &copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors"
            }),
            "Google Satellite": L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
                attribution: "Map data &copy; <a href='https://google.com'>Google Maps</a> contributors"
            }),
            "Google Maps": L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
                attribution: "Map data &copy; <a href='https://google.com'>Google Maps</a> contributors"
            }),
            "Google Terrain": L.tileLayer("https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
                attribution: "Map data &copy; <a href='https://google.com'>Google Maps</a> contributors"
            }),
            "Google Hybrid": L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
                attribution: "Map data &copy; <a href='https://google.com'>Google Maps</a> contributors"
            })
        }, null, {
            position: 'bottomleft'
        }).addTo(window.map);
    }

    let marker;
    const locationInput = document.getElementById("id_location");

    window.map.on("click", function(e) {
        const { lat, lng } = e.latlng;
        if (marker) {
            window.map.removeLayer(marker);
        }
        marker = L.marker([lat, lng], { draggable: true }).addTo(window.map);
        if (locationInput) {
            locationInput.value = `POINT(${lng} ${lat})`;
        }
    });

    if (marker) {
        marker.on("dragend", function(e) {
            const { lat, lng } = e.target.getLatLng();
            if (locationInput) {
                locationInput.value = `POINT(${lng} ${lat})`;
            }
        });
    }

    const zoneSelect = $("#id_zone");
    if (zoneSelect.length) {
        if (!zoneSelect.hasClass("select2-hidden-accessible")) {
            zoneSelect.select2();
        }
        function createPolygon(geometry) {
            let coords;
            if (geometry.type === "Polygon") {
                coords = geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
            } else if (geometry.type === "MultiPolygon") {
                coords = geometry.coordinates[0][0].map(coord => [coord[1], coord[0]]);
            } else {
                return;
            }
            if (window.zonePolygon) {
                window.map.removeLayer(window.zonePolygon);
            }
            if (coords && coords.length > 0) {
                window.zonePolygon = L.polygon(coords).addTo(window.map);
                window.map.fitBounds(window.zonePolygon.getBounds());
            }
        }
        zoneSelect.on("select2:select", function(e) {
            const zoneId = e.params.data.id;
            if (zoneId) {
                fetch(`/maps/get-zone-geometry/${zoneId}/`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erro na resposta da API: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const feature = data.features && data.features[0];
                    const geometry = feature && feature.geometry;
                    if (geometry && geometry.coordinates) {
                        createPolygon(geometry);
                    }
                })
                .catch(error => {
                    console.error("Erro ao obter geometria da zona:", error);
                });
            }
        });
    }
});
