import seedrandom from "seedrandom";
import { GameMode, ms } from "./enums";

export const ROWS = 6;
export const COLS = 5;

class Tile {
  public value: string;
  public notSet: Set<string>;
  constructor() {
    this.notSet = new Set<string>();
  }
  not(char: string) {
    this.notSet.add(char);
  }
}

class WordData {
  public letterCounts: Map<string, [number, boolean]>;
  private notSet: Set<string>;
  public word: Tile[];
  constructor() {
    this.notSet = new Set<string>();
    this.letterCounts = new Map<string, [number, boolean]>();
    this.word = [];
    for (let col = 0; col < COLS; ++col) {
      this.word.push(new Tile());
    }
  }
  confirmCount(char: string) {
    let c = this.letterCounts.get(char);
    if (!c) {
      this.not(char);
    } else {
      c[1] = true;
    }
  }
  countConfirmed(char: string) {
    const val = this.letterCounts.get(char);
    return val ? val[1] : false;
  }
  setCount(char: string, count: number) {
    let c = this.letterCounts.get(char);
    if (!c) {
      this.letterCounts.set(char, [count, false]);
    } else {
      c[0] = count;
    }
  }
  incrementCount(char: string) {
    ++this.letterCounts.get(char)[0];
  }
  not(char: string) {
    this.notSet.add(char);
  }
  inGlobalNotList(char: string) {
    return this.notSet.has(char);
  }
  lettersNotAt(pos: number) {
    return new Set([...this.notSet, ...this.word[pos].notSet]);
  }
}

export function getRowData(n: number, board: GameBoard) {
  const wd = new WordData();
  for (let row = 0; row < n; ++row) {
    const occured = new Set<string>();
    for (let col = 0; col < COLS; ++col) {
      const state = board.state[row][col];
      const char = board.words[row][col];
      if (state === "⬛") {
        wd.confirmCount(char);
        // if char isn't in the global not list add it to the not list for that position
        if (!wd.inGlobalNotList(char)) {
          wd.word[col].not(char);
        }
        continue;
      }
      // If this isn't the first time this letter has occured in this row
      if (occured.has(char)) {
        wd.incrementCount(char);
      } else if (!wd.countConfirmed(char)) {
        occured.add(char);
        wd.setCount(char, 1);
      }
      if (state === "🟩") {
        wd.word[col].value = char;
      }
      else {	// if (state === "🟨")
        wd.word[col].not(char);
      }
    }
  }

  let exp = "";
  for (let pos = 0; pos < wd.word.length; ++pos) {
    exp += wd.word[pos].value ? wd.word[pos].value : `[^${[...wd.lettersNotAt(pos)].join(" ")}]`;
  }
  return (word: string) => {
    if (new RegExp(exp).test(word)) {
      const chars = word.split("");
      for (const e of wd.letterCounts) {
        const occurences = countOccurences(chars, e[0]);
        if (!occurences || (e[1][1] && occurences !== e[1][0])) return false;
      }
      return true;
    }
    return false;
  };
}

function countOccurences<T>(arr: T[], val: T) {
  return arr.reduce((count, v) => v === val ? count + 1 : count, 0);
}

// word: the actual secret word
// guess: the current guess entered by the user
export function getState(word: string, guess: string): LetterState[] {
  // ORIGINAL
  console.log(word);
  const secret_word_char_array = word.split("");
  const result = Array<LetterState>(5).fill("⬛");
  // Check if the character is correct, and should be marked green.
  for (let i = 0; i < word.length; ++i) {
    if (secret_word_char_array[i] === guess.charAt(i)) {
      result[i] = "🟩";
      // Set to $ to prevent duplicate letters from being marked as yellow
      // later, if it's already been marked green here.
      secret_word_char_array[i] = "$";
    }
  }
  // Check for a correct letter in the wrong position
  for (let i = 0; i < word.length; ++i) {
    const pos = secret_word_char_array.indexOf(guess[i]);
    if (result[i] !== "🟩" && pos >= 0) {
      secret_word_char_array[pos] = "$";
      result[i] = "🟨";
    }
  }
  return result;
  // const result = Array<LetterState>(5).fill("🟩");
  // return result;
}

export function contractNum(n: number) {
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

export const keys = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

// This function returns a random seed used to select the secret word,
// based on the current date and time.
export function newSeed() {
  const now = Date.now();
  return now - (now % ms.SECOND);
}

export const modeData: ModeData = {
  default: GameMode.infinite,
  modes: [
    {
      name: "Daily",
      unit: ms.DAY,
      start: 1642370400000,	// 17/01/2022 UTC+2
      seed: newSeed(),
      historical: false,
      streak: true,
      useTimeZone: true,
    },
    {
      name: "Hourly",
      unit: ms.HOUR,
      start: 1642528800000,	// 18/01/2022 8:00pm UTC+2
      seed: newSeed(),
      historical: false,
      icon: "m50,7h100v33c0,40 -35,40 -35,60c0,20 35,20 35,60v33h-100v-33c0,-40 35,-40 35,-60c0,-20 -35,-20 -35,-60z",
      streak: true,
    },
    {
      name: "Infinite",
      unit: ms.SECOND,
      start: 1642428600000,	// 17/01/2022 4:10:00pm UTC+2
      seed: newSeed(),
      historical: false,
      icon: "m7,100c0,-50 68,-50 93,0c25,50 93,50 93,0c0,-50 -68,-50 -93,0c-25,50 -93,50 -93,0z",
    },
    // {
    // 	name: "Minutely",
    // 	unit: ms.MINUTE,
    // 	start: 1642528800000,	// 18/01/2022 8:00pm
    // 	seed: newSeed(GameMode.minutely),
    // 	historical: false,
    // 	icon: "m7,200v-200l93,100l93,-100v200",
    // 	streak: true,
    // },
  ]
};

export function getWordNumber(mode: GameMode) {
  return Math.round((modeData.modes[mode].seed - modeData.modes[mode].start) / modeData.modes[mode].unit) + 1;
}

export function seededRandomInt(min: number, max: number, seed: number) {
  const rng = seedrandom(`${seed}`);
  return Math.floor(min + (max - min) * rng());
}

export const DELAY_INCREMENT = 200;

export const PRAISE = [
  "Genius",
  "Magnificent",
  "Impressive",
  "Splendid",
  "Great",
  "Phew",
];

export function createNewGame(mode: GameMode): GameState {
  return {
    active: true,
    guesses: 0,
    time: modeData.modes[mode].seed,
    wordNumber: getWordNumber(mode),
    validHard: true,
    board: {
      words: Array(ROWS).fill(""),
      state: Array.from({ length: ROWS }, () => (Array(COLS).fill("🔳")))
    },
  };
}

export function createDefaultSettings(): Settings {
  return {
    hard: new Array(modeData.modes.length).map(() => false),
    dark: true,
    colorblind: false,
    tutorial: 3,
  };
}

export function createDefaultStats(mode: GameMode): Stats {
  const stats = {
    played: 0,
    lastGame: 0,
    guesses: {
      fail: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    }
  };
  if (!modeData.modes[mode].streak) return stats;
  return {
    ...stats,
    streak: 0,
    maxStreak: 0,
  };
};

export function createLetterStates(): { [key: string]: LetterState; } {
  return {
    a: "🔳",
    b: "🔳",
    c: "🔳",
    d: "🔳",
    e: "🔳",
    f: "🔳",
    g: "🔳",
    h: "🔳",
    i: "🔳",
    j: "🔳",
    k: "🔳",
    l: "🔳",
    m: "🔳",
    n: "🔳",
    o: "🔳",
    p: "🔳",
    q: "🔳",
    r: "🔳",
    s: "🔳",
    t: "🔳",
    u: "🔳",
    v: "🔳",
    w: "🔳",
    x: "🔳",
    y: "🔳",
    z: "🔳",
  };
}

export function timeRemaining(m: Mode) {
  if (m.useTimeZone) {
    return m.unit - (Date.now() - (m.seed + new Date().getTimezoneOffset() * ms.MINUTE));
  }
  return m.unit - (Date.now() - m.seed);
}

export function failed(s: GameState) {
  return !(s.active || (s.guesses > 0 && s.board.state[s.guesses - 1].join("") === "🟩".repeat(COLS)));
}
