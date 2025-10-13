/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import {Popup} from "./popup.js";

/**
 * Utility class to exchange data with the backend API.
 */
export class Backend<Data> {
    url:    string;
    popup:  boolean;
    error:  string;
    ready:  boolean;
    edit:   boolean;
    data?:  Data;
    saved?: Data;

    /**
     * Initialize the object.
     * 
     * @param url API route to call (without the "/api/" prefix)
     * @param initial Empty initial data object (required by Alpine.js to avoid rendering errors)
     * @param popup Show popup on error (otherwise `error` must be manually rendered)
     */
    constructor(url: string, initial: Data, popup = true) {
        this.url   = url;
        this.popup = popup;
        this.error = "";
        this.ready = false;
        this.edit  = false;
        this.data  = JSON.parse(JSON.stringify(initial));
        this.saved = JSON.parse(JSON.stringify(initial));
    }

    /**
     * Call a function endpoint.
     * 
     * @param method HTTP method
     * @param func Function route to call (without the "/api/function/" prefix)
     * @returns Response data
     */
    async call_function<Result>(method: "get"|"post", func: string, data?: any): Promise<Result|undefined> {
        let options: RequestInit = {method: method};

        if (method !== "get" && data) {
            options.headers = {"content-type": "application/json"}
            options.body    = JSON.stringify(data);
        }

        return await this._fetch(`/api/function${func}`, options);
    }

    /**
     * Load saved data from the backend. Should be called shortly after the constructor.
     * Note that Alpine.js will call this method automatically due to the name `init()`.
     */
    async init() {
        let result = await this._fetch(`/api${this.url}`) as Data|undefined;

        if (result) {
            this.saved = result;
            this.data  = JSON.parse(JSON.stringify(this.saved));
            this.edit  = false;
            this.ready = true;
        }
    }

    /**
     * Apply changes and save the changed data on the backend.
     */
    async save() {
        let result = await this._fetch(`/api${this.url}`, {
            method:  "post",
            headers: {"content-type": "application/json"},
            body:    JSON.stringify(this.data),
        }) as Data|undefined;

        if (result) {
            this.saved = result;
            this.data  = JSON.parse(JSON.stringify(this.saved));
            this.edit  = false;
        }
    }

    /**
     * Ask the user for confirmation and change to view mode, reverting all changes.
     */
    cancel() {
        if (confirm("All changes will be lost. Are you sure?")) {
            this.data = JSON.parse(JSON.stringify(this.saved));
            this.edit = false;
        }
    }

    /**
     * Call the remote API and return its result. In case of an error populate the
     * `error` property and show a popup, if this is enabled.
     * 
     * @param url The URL to call
     * @param options Options for the `fetch()` call
     * @returns Result data
     */
    async _fetch<Result>(url: string, options?: RequestInit): Promise<Result|undefined> {
        try {
            let response = await fetch(url, options);
            let result: Result = await response.json() as Result;
            return result;
        } catch (error) {
            if (typeof error === "object" && error !== null && "message" in error) {
                this.error = String((error as { message?: unknown }).message);
            } else {
                this.error = String(error);
            }

            if (this.popup) {
                let popup_body = document.createElement("div");
                popup_body.textContent = this.error;
                new Popup({"title": "Remote Error", "body": popup_body}).show();
            }
        }
    }
}

declare global {
    interface Window {
        Backend: typeof Backend;
    }
}

window.Backend = Backend;