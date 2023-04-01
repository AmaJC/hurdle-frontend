import { ROWS, COLS, createLetterStates } from "./utils";

let backendURL = "";
let gameID = "";

// setBackendURL sets the backend URL for the server API. It is exported for
// stores.ts to modify. This avoids a circular dependency.
export function setBackendURL(url: string) {
  backendURL = url;
}

export type ServerResponse = {
  guessedWords: Array<string>,
  boardColors: Array<string>,
  letterColors: string,
}

async function fetchAPI(path: string): Promise<ServerResponse> {
  if (backendURL === "") {
    throw new Error("backendURL not set");
  }

  if (sessionStorage && gameID == "") {
    // Try and restore the game state.
    gameID = sessionStorage.getItem("gameID");
  }

  const resp = await fetch(backendURL + path, {
    method: "GET",
    headers: { "X-Tuffle-Game-ID": gameID },
  });
  if (!resp.ok) {
    throw new Error(`fetchAPI: ${resp.status} ${resp.statusText}`);
  }

  // Update the Tuffle game ID from the server.
  const newGameID = resp.headers.get("X-Tuffle-Game-ID") || "";
  if (gameID != newGameID) {
    gameID = newGameID;

    // Persist the gameID in local storage.
    if (sessionStorage) {
      sessionStorage.setItem("gameID", gameID)
    };
  }

  const data = await resp.json();
  return cleanResponse(data);
}

export async function getGame(): Promise<ServerResponse> {
  return await fetchAPI("/game");
}

export async function wordleKeyPressed(key: string): Promise<ServerResponse> {
  return await fetchAPI(`/wordle_key_pressed/${key}`);
}

export async function checkGuess(): Promise<ServerResponse> {
  return await fetchAPI(`/enter_pressed`);
}

export async function deleteKeyPressed(): Promise<ServerResponse> {
  return await fetchAPI(`/delete_pressed`);
}

export async function newGame(): Promise<ServerResponse> {
  return await fetchAPI("/new_game");
}

function cleanResponse(data)
  : ServerResponse {
  let server_response = {
    answer: data["answer"],
    boardColors: data["boardColors"],
    guessedWords: data["guessedWords"],
    letterColors: data["letterColors"],
    gameStatus: data["gameStatus"],
    errorMessage: data["errorMessage"],
  };

  let cleanedGuesses = server_response.guessedWords.concat(
    Array(ROWS - server_response.guessedWords.length)
      .fill(""));

  let cleanedColors = server_response.boardColors.concat(
    Array(ROWS - server_response.boardColors.length)
      .fill("BBBBB"));

  let cleanedLetterColors = (server_response.letterColors
    + "BBBBBBBBBBBBBBBBBBBBBBBBBB").substring(0, 26);

  let cleaned_server_response = {
    answer: data["answer"],
    boardColors: cleanedColors,
    guessedWords: cleanedGuesses,
    letterColors: cleanedLetterColors,
    gameStatus: data["gameStatus"],
    errorMessage: data["errorMessage"],
  };
  return cleaned_server_response;
}

export function emptyResponse(): ServerResponse {
  return {
    guessedWords: Array(6).fill(""),
    boardColors: Array(6).fill("BBBBB"),
    letterColors: "BBBBBBBBBBBBBBBBBBBBBBBBBB",
  }
}

// Returns a 2D array representing the letter colors.
export function boardStateFromServerResponse(
  server_response: ServerResponse): LetterState[][] {
  let boardColors = server_response["boardColors"];
  let letterStates = [];

  for (let i = 0; i < boardColors.length; i++) {
    letterStates.push([]);
    for (let j = 0; j < boardColors[i].length; j++) {
      switch (boardColors[i][j]) {
        case "G":
          letterStates[i].push("🟩");
          break;
        case "Y":
          letterStates[i].push("🟨");
          break;
        case "B":
        default:
          letterStates[i].push("⬛");
          break;
      }
    }
  }
  return letterStates;
}

export function letterStateFromServerResponse(server_response:
  ServerResponse): { [key: string]: LetterState; } {

  let letterColors = server_response["letterColors"];
  let letterStates = createLetterStates();

  let letters = "abcdefghijklmnopqrstuvwxyz";

  for (let i = 0; i < letters.length; i++) {
    let val;
    switch (letterColors[i]) {
      case "G":
        val = "🟩";
        break;
      case "Y":
        val = "🟨";
        break;
      case "D":
        val = "⬛";
        break;
      case "B":
      default:
        val = "🔳";
        break;
    }
    letterStates[letters[i]] = val;
  }
  return letterStates;
}
