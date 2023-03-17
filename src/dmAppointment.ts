import { MachineConfig, send, Action, assign } from "xstate";
import { LEMMAS } from "./wordbank"

function say(text: string): Action<SDSContext, SDSEvent> {
  return send((_context: SDSContext) => ({ type: "SPEAK", value: text }));
}

interface Grammar {
  [index: string]: {
    intent: string;
    entities: {
      [index: string]: string;
    };
  };
}

const grammar: Grammar = {
  lecture: {
    intent: "None",
    entities: { title: "Dialogue systems lecture" },
  },
  lunch: {
    intent: "None",
    entities: { title: "Lunch at the canteen" },
  },
  "on friday": {
    intent: "None",
    entities: { day: "Friday" },
  },
  "at ten": {
    intent: "None",
    entities: { time: "10:00" },
  },
};

const getEntity = (context: SDSContext, entity: string) => {
  // lowercase the utterance and remove tailing "."
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  if (u in grammar) {
    if (entity in grammar[u].entities) {
      return grammar[u].entities[entity];
    }
  }
  return false;
};

let listOfUsedWords: string[] = []

const findWord = (context: SDSContext, entity: string) => {
  // lowercase the utterance and remove tailing "."
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  listOfUsedWords.push(u)
  let psi = u.substr(u.length - 1) // the last letter of the word provided by user
  let siupsiup = LEMMAS.filter((k) => k[0] === psi) // retrieves words from lemmas that start with the letter in psi
  const randIndex = Math.floor(Math.random() * siupsiup.length); // gives a random index among the retrieved words
  const word = siupsiup[randIndex];
  let unusedWords = LEMMAS.filter(word => !listOfUsedWords.includes(word))
  if (listOfUsedWords.includes(word))
  {
    if (!((unusedWords.filter(word => word.startsWith(psi))).length === 0)) {
    let word1 = unusedWords[Math.floor(Math.random() * unusedWords.length)]
    listOfUsedWords.push(word1)
    return word1
  }
  return "I cannot think of anything else. You win."
}
  else {
    listOfUsedWords.push(word)
    return word
  }
};

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: "idle",
  states: {
    idle: {
      on: {
        CLICK: "init",
      },
    },
    init: {
      on: {
        TTS_READY: "welcome",
        CLICK: "welcome",
      },
    },
    welcome: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "giveword",
            cond: (context) => !!findWord(context, "title"),
            actions: assign({
              title: (context) => findWord(context, "title"),
            }),
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("Hello, welcome to the Word Chain Game. The rules are simple - you give me a word and I respond with a word that starts with the last letter of your word. And then you do the same! The starting word is: lunch"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    giveword: {
      id: "giveword",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "giveword2",
            cond: (context) => !!findWord(context, "title"),
            actions: assign({
              title: (context) => findWord(context, "title"),
            }),
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `The word is: ${context.title}`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    giveword2: {
      id: "giveword",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "giveword",
            cond: (context) => !!findWord(context, "title"),
            actions: assign({
              title: (context) => findWord(context, "title"),
            }),
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `The word is: ${context.title}`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
  },
};

const kbRequest = (text: string) =>
  fetch(
    new Request(
      `https://cors.eu.org/https://api.duckduckgo.com/?q=${text}&format=json&skip_disambig=1`
    )
  ).then((data) => data.json());
