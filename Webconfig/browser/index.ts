/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import "alpinejs";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import htmx from "htmx.org";

import "./style.css";

// Extend the Window interface to include 'htmx'
declare global {
	interface Window {
		htmx: typeof htmx;
	}
}

window.htmx = htmx;

// Initialize page
window.addEventListener("DOMContentLoaded", () => {
    // Toggle active navbar item upon navigation
    for (let navLink of document.querySelectorAll("header .nav-link")) {
        navLink.addEventListener("click", (event: Event) => {
            for (let navLink of document.querySelectorAll("header .nav-link")) {
                navLink.classList.remove("active");
                navLink.removeAttribute("aria-current");
            }

            if (!event.target) return;
            let target: HTMLElement = event.target as HTMLElement;
            target.classList.add("active");
            target.setAttribute("aria-current", "page");
        });
    }

    // Switch to first page on page load
    let firstNavLink = document.querySelector("header .nav-item:first-child a");
    if (firstNavLink) (firstNavLink as HTMLElement).click();
});

