import { MachineConfig, send, Action, assign } from "xstate";
import { LEMMAS } from "./wordbank"

function say(text: string): Action<SDSContext, SDSEvent> {
  return send((_context: SDSContext) => ({ type: "SPEAK", value: text }));
}

let listOfUsedWords: string[] = []

const findWord = (context: SDSContext, entity: string) => {
  // lowercase the utterance and remove tailing "."
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  if (u.split(' ').length > 1) {
    return "You breached the rules of the game. You lose!";
  }
  if (listOfUsedWords.length > 0) {
    let lastWord = listOfUsedWords[listOfUsedWords.length - 1];
  let lastLetter = lastWord[lastWord.length - 1];
  let firstLetter = u[0];
  if (firstLetter !== lastLetter) {
    return "You breached the rules of the game. You lose!";
  }
};
  listOfUsedWords.push(u)
  console.log(listOfUsedWords)
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
          entry: say("Hello, welcome to the Word Chain Game. The rules are simple - you give me a word and I respond with a word that starts with the last letter of your word. And then you do the same! You start."),
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
            value: `${context.title}`,
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
            value: `${context.title}`,
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
