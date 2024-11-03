document.addEventListener("DOMContentLoaded", function () {
    const colorInput = document.getElementById("id_boundary_color");
    const mapElement = document.querySelector(".leaflet-container");

    function updateMapColor() {
        const color = colorInput.value;
        if (mapElement) {
            mapElement.style.borderColor = color;
        }
    }

    colorInput.addEventListener("input", updateMapColor);
    updateMapColor();
});
