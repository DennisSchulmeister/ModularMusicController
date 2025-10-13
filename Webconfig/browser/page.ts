/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * Fetch HTML fragment and replace the target's content with it. So basically
 * what HTMX does most of the time with a fraction of the code. Plus this
 * integrates more easily with Alpine.js.
 * 
 * @param url HTML fragment
 * @param target Target element
 */
export async function showPage(url: string, target: string|HTMLElement): Promise<void> {
    let element: HTMLElement|null;

    if (target instanceof HTMLElement) {
        element = target;
    } else {
        element = document.querySelector(target);
    }

    if (!element) {
        console.error("Cannot load page – target element not found:", target);
        return;
    }

    let response = await fetch(url);
    element.innerHTML = await response.text();
}

// Export for usage in Alpine.js HTML components
declare global {
    interface Window {
        showPage: typeof showPage;
    }
}

window.showPage = showPage;