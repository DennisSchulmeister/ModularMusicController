/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import Alpine from "alpinejs";
import "bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import "./style.css";

import "./backend.js";
import "./page.js";
import "./popup.js";

window.addEventListener("DOMContentLoaded", () => {
    Alpine.store("nav", {
        visible: true,
        enabled: true,
    });

    Alpine.start();
});

