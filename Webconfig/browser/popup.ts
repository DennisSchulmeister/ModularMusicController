/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import Alpine     from "alpinejs";
import {Modal}    from "bootstrap";
import {showPage} from "./page.js";

export type PopupButton = {
    id:    string;
    class: string;
    text:  string;
}

export type PopupOptions = {
    title:    string;
    body?:    HTMLElement;
    url?:     string;
    buttons?: PopupButton[];
};

export type EventListener = (event: Event) => void;

export type ButtonEventListener = {
    buttonId: string;
    event:    string;
    listener: EventListener;
};

/**
 * Utility class to show a modal popup e.g. with an error message or a list of
 * data for the user to choose from. Contained data can be given as a DOM element
 * that will be placed inside the popup or fetched fromm a HTML fragment. Due to
 * the way modal popups work in Bootstrap only one can be shown at a time.
 */
export class Popup {
    popup:    HTMLElement;
    body:     HTMLElement;
    options:  PopupOptions;
    bsModal?: Modal;

    loadEventListeners:   EventListener[]       = [];
    closeEventListeners:  EventListener[]       = [];
    buttonEventListeners: ButtonEventListener[] = [];
    
    /**
     * Create new popup window but don't show it, yet.
     * @param options Popup options
     */
    constructor(options: PopupOptions) {
        this.popup   = document.getElementById("popup") as HTMLElement;
        this.body    = document.getElementById("popup-body") as HTMLElement;
        this.options = options;
    }

    /**
     * Show the window and wait until its content is fully loaded.
     */
    async show() {
        // Render popup content
        let popupData = Alpine.store("popup") as PopupData;
        popupData.title   = this.options.title;
        popupData.buttons = [];
        popupData.obj     = this;
        popupData.result  = undefined;

        for (let button of this.options.buttons || []) {
            popupData.buttons.push({
                id:    button.id,
                class: button.class,
                text:  button.text,

                // Called via x-init in the HTML code to register the event listeners
                init: (buttonElement: HTMLElement) => {
                    let listeners = this.buttonEventListeners.filter(e => e.buttonId = buttonElement.id);

                    for (let listener of listeners) {
                        buttonElement.addEventListener(listener.event, listener.listener);
                    }
                }
            } as PopupButton);
        }

        this.body.innerHTML = "";

        if (this.options.body) {
            this.body.appendChild(this.options.body);
        } else if (this.options.url) {    
            await showPage(this.options.url, this.body);
        }

        // Dispatch popup-load event
        for (let listener of this.loadEventListeners) {
            this.popup.addEventListener("popup-load", listener);
        }

        this.popup.dispatchEvent(new Event("popup-load"));

        for (let listener of this.loadEventListeners) {
            this.popup.removeEventListener("popup-load", listener);
        }

        // Show modal window
        this.bsModal = new Modal("#popup");
        this.bsModal.show();

        let onModalHidden = (() => {
            // Remove event listener
            this.popup.removeEventListener("hidden.bs.modal", onModalHidden);

            // Remove popup content
            popupData.title   = "";
            popupData.buttons = [];
            popupData.obj     = undefined;

            // Dispatch popup-close event
            for (let listener of this.closeEventListeners) {
                this.popup.addEventListener("popup-close", listener);
            }

            this.popup.dispatchEvent(new Event("popup-close"));

            for (let listener of this.closeEventListeners) {
                this.popup.removeEventListener("popup-close", listener);
            }

            // Dispose bootstrap modal object
            if (this.bsModal) {
                this.bsModal.dispose();
                this.bsModal = undefined;
            }
        }).bind(this);

        this.popup.addEventListener("hidden.bs.modal", onModalHidden);
    }

    /**
     * Close the popup window.
     */
    close() {
        if (this.bsModal) this.bsModal.hide();
    }

    /**
     * Set result data for the caller from within the popup.
     * @param result Result data
     */
    setResult(result: any) {
        (Alpine.store("popup") as PopupData).result = result;
    }

    /**
     * Get the popup result, if any,
     * @returns The popup result or `undefined`.
     */
    getResult(): any {
        return (Alpine.store("popup") as PopupData).result;
    }

    /**
     * Register event listener for when the popup content has been fully loaded. The event
     * target will be the popup's HTML element so that e.g. additional event listeners can
     * be added on individual elements.
     * 
     * @param listener Event listener
     */
    onLoad(listener: EventListener) {
        this.loadEventListeners.push(listener);
    }

    /**
     * Register event listener for when the popup has been dismissed and closed. The event
     * target will be the popup's HTML element.
     * 
     * @param listener Event listener
     */
    onClose(listener: EventListener) {
        this.closeEventListeners.push(listener);
    }

    /**
     * Register event handler for one of the popup buttons. The button ID is the same
     * is in the button list given to the constructor.
     * 
     * @param buttonId Button ID
     * @param event Event name, e.g. "click"
     * @param listener Event listener
     */
    onButton(buttonId: string, event: string, listener: EventListener) {
        this.buttonEventListeners.push({buttonId, event, listener});
    }
}

type PopupData = {obj?: Popup, result: any, title: string, buttons: PopupButton[]};

Alpine.store("popup", {
    obj:     undefined,
    result:  undefined,
    title:   "",
    buttons: [],
});

// Export for usage in Alpine.js HTML components
declare global {
    interface Window {
        Popup: typeof Popup;
    }
}

window.Popup = Popup;