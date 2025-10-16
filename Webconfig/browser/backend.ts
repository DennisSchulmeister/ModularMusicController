/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import Alpine from "alpinejs";

export type APIClientOptions = {
    errorHandler?(error: Error): Promise<void>;
};

/**
 * Basic API client that is able to call functions and read and update
 * configuration values. This is the most basic class from all in this
 * file, since it does nothing more than talking to the backend.
 */
export class APIClient {
    options: APIClientOptions = {};
    abortController = new AbortController();

    /**
     * Initialize the API client with additional options.
     * @param options Additional options
     */
    constructor(options?: APIClientOptions) {
        if (options) this.options = options;
    }

    /**
     * Read saved configuration values. Note that the remote API is built
     * so that this always either returns an object or an array.
     * 
     * @param config Configuration to read
     * @returns Configuration data
     */
    async readConfig<ConfigData>(config: string): Promise<ConfigData|undefined> {
        return await this.fetch<ConfigData>(`/api/config/${config}`);
    }

    /**
     * Save updated configuration values and return the saved data as sent
     * back by the remote API. Note that backend implements no patching logic.
     * Instead the whole configuration object must be sent including all changed
     * and unchanged properties.
     * 
     * @param config Configuration to save
     * @param data Updated configuration data
     * @returns Saved configuration data
     */
    async saveConfig<ConfigData>(config: string, data: ConfigData): Promise<ConfigData|undefined> {
        return await this.fetch<ConfigData>(`/api/config/${config}`, {
            method:  "post",
            headers: {"content-type": "application/json"},
            body:    JSON.stringify(data),
        });
    }

    async getFunction<ResponseData>(func: string): Promise<ResponseData|undefined> {
        return await this.fetch<ResponseData>(`/api/function/${func}`);
    }
    
    async postFunction<RequestData, ResponseData>(func: string, data?: RequestData): Promise<ResponseData|undefined> {
        return await this.fetch<ResponseData>(`/api/function/${func}`, {
            method:  "post",
            headers: {"content-type": "application/json"},
            body:    JSON.stringify(data),
        });
    }

    /**
     * Abort the currently running request, if any.
     */
    abort() {
        this.abortController.abort();
    }

    /**
     * Handle error that occurred during a remote API call. By default this will
     * simple log and throw the error. But the API client options can specify a
     * custom error handler, that will be called, instead of rethrowing the error.
     * 
     * @param error Error object
     */
    protected async handleError(error: Error): Promise<void> {
        console.error(error);

        if (this.options.errorHandler) {
            await this.options.errorHandler(error);
        } else {
            throw error;
        }
    }

    /**
     * Error handler function that displays an alert instead of rethrowing the error.
     * Use it like this:
     * 
     * ```javascript
     * let api = new APIClient({
     *     errorHandler: APIClient.alertErrorHandler,
     * });
     * ```
     * 
     * @param error Error object
     */
    static async alertErrorHandler(error: Error) {
        let message = "Remote Error – ";
        
        if (typeof error === "object" && error !== null && "message" in error) {
            message += String((error as { message?: unknown }).message);
        } else {
            message += String(error);
        }

        alert(message);
    }

    /**
     * Call the remote API and return its result. In case of an error (except for
     * the `AbortError` which is silently ignored), `handleError()` will be called.
     * 
     * @param url The URL to call
     * @param options Options for the `fetch()` call
     * @returns Response data
     */
    private async fetch<ResponseData>(url: string, options?: RequestInit): Promise<ResponseData|undefined> {
        try {
            let response = await fetch(url, {...options, signal: this.abortController.signal});

            if (response.status == 200) {
                let result = await response.json() as ResponseData;
                return result;
            } else if (response.status == 201) {
                return;
            } else {
                let text = await response.text();
                
                try {
                    let result = JSON.parse(text);
                    if (result.message) text = result.message;
                } catch {
                    // Nothing to do
                }

                throw new Error(text);
            }
        } catch (error) {
            if ((error as Error).name === "AbortError") {
                return;
            }

            await this.handleError(error as Error);
        }
    }
}

declare global {
    interface Window {
        APIClient: typeof APIClient;
    }
}

window.APIClient = APIClient;

/**
 * Constructor options for config forms.
 */
export interface ConfigFormOptions<ConfigData> {
    /** Configuration to display and edit  */
    config: string,

    /** Fallback data until the data has been loaded (required by Alpine.js to avoid rendering errors) */
    initial: ConfigData,

    /** Additional private data accessible in the HTML code  */
    extra?: any,

    /** Whether editing the data is possible */
    canEdit: boolean,
}

/**
 * Data class for Alpine.js components that display and edit configuration data.
 * This class handles the simple case where the configuration data is a single
 * object (possibly deeply nested) that can be read with a GET request and updated
 * with a POST request.
 */
export class ConfigForm<ConfigData> {
    api:      APIClient;                // API-Client to talk to the backend
    data:     ConfigData;               // Form data to be displayed/edited
    extra?:   any;                      // Additional private data for the HTML component

    protected _canEdit:  boolean;       // Whether editing the data is possible
    protected _editMode: boolean;       // Whether to view or edit the form data
    protected config:    string;        // Name of the configuration data
    protected savedData: ConfigData;    // Copy of the unchanged and saved form data

    /**
     * Initialize the object.
     * @param options Initialization options
     */
    constructor(options: ConfigFormOptions<ConfigData>) {
        this.api = new APIClient({errorHandler: APIClient.alertErrorHandler});

        this.data      = options.initial;
        this.extra     = options.extra;
        this._editMode = false;
        this._canEdit  = options.canEdit;

        this.config    = options.config;
        this.savedData = JSON.parse(JSON.stringify(options.initial));
    }

    /**
     * Load saved configuration data during initialization of the Alpine.js component.
     * Note that this method is automatically called by Alpine.
     */
    async init() {
        let data = await this.api.readConfig<ConfigData>(this.config);
        if (!data) return;

        this.data      = data;
        this.savedData = JSON.parse(JSON.stringify(data));
        this.setEditMode(false);
    }

    /**
     * Get the `canEdit` flag that determines whether editing the data is allowed.
     */
    get canEdit(): boolean {
        return this._canEdit;
    }

    /**
     * Get the `editMode` flag that determines whether the form data is displayed or
     * being edited.
     */
    get editMode(): boolean {
        return this._editMode;
    }

    /**
     * Set the `editMode` flag and enable/disable the site navigation accordingly.
     * This prevents the user from navigating away from a form in edit mode and
     * as a consequence loosing their data.
     * 
     * Note that the HTML code cannot directly set the flag but must use the
     * `enterEditMode()` and `leaveEditMode()` methods, instead to reduce the
     * risk of an invalid state.
     */
    protected setEditMode(editMode: boolean) {
        this._editMode = editMode;
        (Alpine.store("nav") as any).enabled = !editMode;
    }

    /**
     * Switch the form into edit mode, if that is allowed.
     */
    enterEditMode() {
        if (!this._canEdit) return;
        this.setEditMode(true);
    }

    /**
     * Switch the form back into display mode and save or dismiss the changes.
     * When the changes are to be dismissed the user is asked for confirmation
     * before actually changing the mode.
     * 
     * @param save Save changes
     */
    async leaveEditMode(save: boolean) {
        if (save) {
            let data = await this.api.saveConfig<ConfigData>(this.config, this.data);

            if (data) {
                this.data = data;
                this.savedData = JSON.parse(JSON.stringify(data));
            }
        } else {
            if (!confirm("All changes will be lost. Are you sure?")) return;
            this.data = JSON.parse(JSON.stringify(this.savedData));
        }

        this.setEditMode(false);
    }
}

declare global {
    interface Window {
        ConfigForm: typeof ConfigForm;
    }
}

window.ConfigForm = ConfigForm;

/**
 * Constructor options for config tables.
 */
export interface ConfigTableOptions<ConfigData> extends ConfigFormOptions<ConfigData[]> {
    /** Whether creating new lines is possible */
    canCreate: boolean;

    /** Whether deleting lines is possible */
    canDelete: boolean;

    /** Template of an empty line when creating new entries */
    emptyLine: ConfigData;

    /**
     * Comparator function to keep the table sorted after any changes.
     * If missing new lines will be appended at the end and the order
     * will remain unchanged after any change otherwise.
     * 
     * @param lhs Left-hand-side table entry
     * @param rhs Right-hand-side table entry
     * @returns -1, 0 or 1 depending on which side should come first
     */
    sortFn?(lhs: ConfigData, rhs: ConfigData): number;
}

/**
 * View mode of a config table to control what is displayed: The table, details
 * of a single line or a form to create a new line.
 */
export type ConfigTableViewMode = "table" | "details" | "create";

/**
 * Extended data class for Alpine.js components with tabular configuration data.
 * The working principle is the same as for `ConfigForm` since the table is always
 * read and saved as a whole. But on top of that the form allows to create, edit
 * and delete table lines.
 */
export class ConfigTable<ConfigData> extends ConfigForm<ConfigData[]> {
    selected: string[];                         // Indices of the selected table lines (set as strings by Alpine!)
    currentLine?: ConfigData;                   // Data of the currently viewed/edited/created line

    protected _canCreate: boolean;              // Whether creating new lines is possible
    protected _canDelete: boolean;              // Whether deleting lines is possible
    protected _viewMode: ConfigTableViewMode;   // What to display (table, single line, creation form)
    protected emptyLine: ConfigData;            // Template of an empty line when creating new entries
    protected detailsIndex: number;             // Index of the currently viewed line when in details mode

    protected sortFn?(lhs: ConfigData, rhs: ConfigData): number;

    /**
     * Initialize the object.
     * @param options Initialization options
     */
    constructor(options: ConfigTableOptions<ConfigData>) {
        super(options);

        this.selected     = [];
        this._canCreate   = options.canCreate;
        this._canDelete   = options.canDelete;
        this._viewMode    = "table";
        this.emptyLine    = options.emptyLine;
        this.detailsIndex = -1;
        this.sortFn       = options.sortFn;
    }

    /**
     * Get the `canCreate` flag that determines whether creating new lines is allowed.
     */
    get canCreate(): boolean {
        return this._canCreate;
    }

    /**
     * Get the `canDelete` flag that determines whether deleting lines is allowed.
     */
    get canDelete(): boolean {
        return this._canDelete;
    }

    /**
     * Get the current view mode.
     */
    get viewMode(): ConfigTableViewMode {
        return this._viewMode;
    }

    /**
     * Delete selected lines from the table. Only possible in edit mode
     * and when deletion is allowed. The change will only be made in the
     * internal buffer and saved on the device when leaving edit mode.
     */
    deleteSelected() {
        if (!this.editMode || !this.canDelete) return;
        if (!confirm("Do you really want to delete the selected items?")) return;

        this.data = this.data.filter((v, i) => !this.selected.includes(`${i}`));
        this.selected = [];
    }

    /**
     * Enter details view mode to display the details of a single line.
     * Only allowed in the table view mode to prevent accidental data loss
     * and invalid state.
     * 
     * @param index Selected line
     */
    viewDetails(index: number) {
        if (this.viewMode !== "table") return;
        if (index < 0 || index >= this.data.length) return;

        this._viewMode    = "details";
        this.detailsIndex = index;
        this.currentLine  = JSON.parse(JSON.stringify(this.data[index]));
        this.selected     = [];
    }

    /**
     * Enter creation view mode to create new table entries. Only allowed in
     * table view mode  to prevent accidental data loss and invalid state.
     */
    viewCreationForm() {
        if (this.viewMode !== "table") return;

        this._viewMode    = "create";
        this.detailsIndex = -1;
        this.currentLine  = JSON.parse(JSON.stringify(this.emptyLine));
        this.selected     = [];
    }

    /**
     * Switch back to table view mode and either accept or dismiss any changes
     * to the current table line. If edit mode is active and changes are to be
     * dismissed the user will be asked for confirmation.
     * 
     * @param acceptChanges Update table data
     */
    viewTable(acceptChanges: boolean) {
        if (this.editMode && this.currentLine) {
            if  (!acceptChanges) {
                if (!confirm("All changes will be lost. Are you sure?")) return;
            } else {
                if (this._viewMode === "details") {
                    this.data[this.detailsIndex] = this.currentLine;
                } else if (this._viewMode === "create") {
                    this.data.push(this.currentLine)
                }

                if (this.sortFn) this.data.sort(this.sortFn);
            }
        }

        this._viewMode    = "table";
        this.detailsIndex = -1;
        this.currentLine  = undefined;
    }
}

declare global {
    interface Window {
        ConfigTable: typeof ConfigTable;
    }
}

window.ConfigTable = ConfigTable;
