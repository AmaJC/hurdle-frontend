import { writable } from "svelte/store";
import type { GameMode } from "./enums";
import { createDefaultSettings, createLetterStates } from "./utils";
import { setBackendURL as serverSetBackendURL, emptyResponse } from "./server_api";
import * as config from "../config";

export const mode = writable<GameMode>();

export const letterStates = writable(createLetterStates());

export const settings = writable(createDefaultSettings());

export const server_response = writable(emptyResponse());

// backendURL is a pubsub variable that stores the backend URL.
export const backendURL = writable(getBackendURL());
backendURL.subscribe(url => localStorage.setItem("backendURL", url));
backendURL.subscribe(url => serverSetBackendURL(url)); 

function getBackendURL(): string {
  if (localStorage) {
    return localStorage.getItem("backendURL") || config.BACKEND_URL;
  }
  return config.BACKEND_URL;
}
