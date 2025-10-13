/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import Alpine from "alpinejs";

/**
 * Utility class to exchange data with the backend API.
 */
export class Backend<Data> {
    url?:   string;
    ready:  boolean;
    edit:   boolean;
    data?:  Data;
    saved?: Data;

    abortController = new AbortController();

    /**
     * Initialize the object.
     * 
     * @param url API route to call (without the "/api/" prefix)
     * @param initial Empty initial data object (required by Alpine.js to avoid rendering errors)
     * @param popup Show popup on error (otherwise `error` must be manually rendered)
     */
    constructor(url?: string, initial?: Data) {
        this.url   = url;
        this.ready = false;
        this.edit  = false;

        if (initial) {
            this.data  = JSON.parse(JSON.stringify(initial));
            this.saved = JSON.parse(JSON.stringify(initial));
        }
    }

    /**
     * Call a function endpoint.
     * 
     * @param method HTTP method
     * @param func Function route to call (without the "/api/function/" prefix)
     * @returns Response data
     */
    async callFunction<Result>(method: "get"|"post", func: string, data?: any): Promise<Result|undefined> {
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
        if (this.url) {
            let result = await this._fetch(`/api${this.url}`) as Data|undefined;
    
            if (result) {
                this.saved = result;
                this.data  = JSON.parse(JSON.stringify(this.saved));
                this.edit  = false;
                this.ready = true;
            }
        } else {
            this.edit  = false;
            this.ready = true;
        }
    }

    /**
     * Toggle edit and display mode
     * @param edit Edit mode, if `true`.
     */
    editMode(edit: boolean) {
        this.edit = edit;
        (Alpine.store("nav") as any).enabled = !edit;
    }

    /**
     * Apply changes and save the changed data on the backend.
     */
    async save() {
        if (this.url) {
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
        } else {
            this.edit = false;
        }

        (Alpine.store("nav") as any).enabled = true;
    }

    /**
     * Ask the user for confirmation and change to view mode, reverting all changes.
     */
    cancel() {
        if (confirm("All changes will be lost. Are you sure?")) {
            this.data = JSON.parse(JSON.stringify(this.saved));
            this.edit = false;
            (Alpine.store("nav") as any).enabled = true;
        }
    }

    /**
     * Abort the currently running request, if any.
     */
    abort() {
        this.abortController.abort();
    }

    /**
     * Call the remote API and return its result. In case of an error show an alert().
     * 
     * @param url The URL to call
     * @param options Options for the `fetch()` call
     * @returns Result data
     */
    async _fetch<Result>(url: string, options?: RequestInit): Promise<Result|undefined> {
        try {
            let response = await fetch(url, {...options, signal: this.abortController.signal});

            if (response.status == 201) {
                return;
            } else {
                let result: Result = await response.json() as Result;
                return result;
            }
        } catch (error) {
            if ((error as Error).name === "AbortError") {
                return;
            }

            console.error(error);
            let message = "Remote Error – ";
            
            if (typeof error === "object" && error !== null && "message" in error) {
                message += String((error as { message?: unknown }).message);
            } else {
                message += String(error);
            }

            alert(message);
        }
    }
}

declare global {
    interface Window {
        Backend: typeof Backend;
    }
}

window.Backend = Backend;