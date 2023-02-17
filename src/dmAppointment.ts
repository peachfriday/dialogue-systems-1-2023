import { text } from "stream/consumers";
import { MachineConfig, send, Action, assign } from "xstate";

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
    entities: { type: "Dialogue systems lecture" },
  },
  lunch: {
    intent: "None",
    entities: { type: "Lunch at the canteen" },
  },
  hairdressers: {
    intent: "None",
    entities: { type: "Haircut at the hairdressers" },
  },
  doctor: {
    intent: "None",
    entities: { type: "doctor's appointment" },
  },
  nails: {
    intent: "None",
    entities: { type: "manicure appointment" },
  },
  "meeting with friends": {
    intent: "None",
    entities: { type: "meeting with friends" },
  },
  "dinner with parents": {
    intent: "None",
    entities: { type: "dinner with parents" },
  },
  "date at the cinema": {
    intent: "None",
    entities: { type: "date at the cinema" },
  },
  "on friday": {
    intent: "None",
    entities: { day: "Friday" },
  },
  "on monday": {
    intent: "None",
    entities: { day: "Monday" },
  },
  "on tuesday": {
    intent: "None",
    entities: { day: "Friday" },
  },
  "on wednesday": {
    intent: "None",
    entities: { day: "Friday" },
  },
  "on thursday": {
    intent: "None",
    entities: { day: "Friday" },
  },
  "on saturday": {
    intent: "None",
    entities: { day: "Friday" },
  },
  "on sunday": {
    intent: "None",
    entities: { day: "Friday" },
  },
  "at 9": {
    intent: "None",
    entities: { hour: "9" },
  },
  "at 10": {
    intent: "None",
    entities: { hour: "10" },
  },
  "at 1": {
    intent: "None",
    entities: { hour: "1" },
  },
  "at 2": {
    intent: "None",
    entities: { hour: "2" },
  },
  "at 3": {
    intent: "None",
    entities: { hour: "3" },
  },
  "at 4": {
    intent: "None",
    entities: { hour: "4" },
  },
  "at 5": {
    intent: "None",
    entities: { hour: "5" },
  },
  "at 6": {
    intent: "None",
    entities: { hour: "6" },
  },
  "at 7": {
    intent: "None",
    entities: { hour: "7" },
  },
  "at 8": {
    intent: "None",
    entities: { hour: "8" },
  },
  "at 11": {
    intent: "None",
    entities: { hour: "11" },
  },
  "at 12": {
    intent: "None",
    entities: { hour: "12" },
  },
  "yes": {
    intent: "None",
    entities: {binary_yes: "Let's proceed."}  
  },
  "yes please": {
    intent: "None",
    entities: {binary_yes: "Let's proceed."}  
  },
  "no thank you": {
    intent: "None",
    entities: {binary_yes: "Let's proceed."}  
  },
  "no" : {
    intent: "None",
    entities: {binary_no: "Let's go back."}
  },
  "create a meeting" : {
    intent: "None",
    entities: {create_meeting: "create a meeting"}
  },
  "I want to create a meeting" : {
    intent: "None",
    entities: {create_meeting: "create a meeting"}
  },
  "who is ashley tisdale" : {
    intent: "None",
    entities: {type: "meeting with Ashley Tisdale"}
  },
  "who is vanessa hudgens" : {
    intent: "None",
    entities: {type: "meeting with Vanessa Hudgens"}
  },
  "who is zac efron" : {
    intent: "None",
    entities: {type: "meeting with Zac Efron"}
  },
};

const getEntity = (context: SDSContext, entity: string) => {
  // lowercase the utterance and remove tailing "."
  let u = context.recResult[0].utterance.toLowerCase().replace(/.$/g, "");
  if (u in grammar) {
    if (entity in grammar[u].entities) {
      return grammar[u].entities[entity];
    }
  }
  return false;
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
        TTS_READY: "hello",
        CLICK: "hello",
      },
    },
    hello: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "welcome",
            cond: (context) => !!getEntity(context, "create_meeting"),
            actions: assign({
              type: (context) => getEntity(context, "create_meeting"),
            }),
          },
          {
            target: "celebrity_info",
            cond: (context) => !!getEntity(context, "type"),
            actions: assign({
              type: (context) => getEntity(context, "type"),
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
          entry: say("Hi Anika. Would you like to create a meeting or ask a who-is question?"),
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
    welcome: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "info",
            cond: (context) => !!getEntity(context, "type"),
            actions: assign({
              type: (context) => getEntity(context, "type"),
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
          entry: say("Let's create a meeting. What is it about?"),
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
    info: {
        entry: send((context) => ({
          type: "SPEAK",
          value: `OK, ${context.type}`,
        })),
        on: { ENDSPEECH: "date_info" },
      },
    celebrity_info: {
        entry: send((context) => ({
          type: "SPEAK",
          value: `Zac Efron is an actor.`,
        })),
        on: { ENDSPEECH: "want_meet" },
      },
    want_meet: {
        initial: "prompt",
        on: {
          RECOGNISED: [
            {
              target: "date_info",
              cond: (context) => !!getEntity(context, "binary_yes"),
              actions: assign({
                title: (context) => getEntity(context, "binary_yes"),
              }),
            },
            {
              target: "hello",
              cond: (context) => !!getEntity(context, "binary_no"),
              actions: assign({
                title: (context) => getEntity(context, "binary_no"),
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
            entry: say("Do you want to meet them?"),
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
    date_info: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "day_info",
            cond: (context) => !!getEntity(context, "day"),
            actions: assign({
              day: (context) => getEntity(context, "day"),
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
          entry: say("On which day is it?"),
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
    day_info: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, ${context.day}`,
      })),
      on: { ENDSPEECH: "duration_info" },
    },
    duration_info: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "whole_day_yes",
            cond: (context) => !!getEntity(context, "binary_yes"),
            actions: assign({
              title: (context) => getEntity(context, "binary_yes"),
            }),
          },
          {
            target: "whole_day_no",
            cond: (context) => !!getEntity(context, "binary_no"),
            actions: assign({
              title: (context) => getEntity(context, "binary_no"),
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
          entry: say("Will it take the whole day?"),
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
    whole_day_yes: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, do you want me to create a meeting titled ${context.type} on ${context.day} for the whole day?`,
      })),
      on: { ENDSPEECH: "created_meeting" },
    },
    whole_day_no: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "meeting_time",
            cond: (context) => !!getEntity(context, "hour"),
            actions: assign({
              hour: (context) => getEntity(context, "hour"),
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
          entry: say("What time is your meeting?"),
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
    meeting_time: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, do you want me to create a meeting titled ${context.type} on ${context.day} at ${context.hour}`,
      })),
      on: { ENDSPEECH: "created_meeting" },
    },
    created_meeting: {
      initial: "ask",
      on: {
        RECOGNISED: [
          {
            target: "success",
            cond: (context) => !!getEntity(context, "binary_yes"),
            actions: assign({
              title: (context) => getEntity(context, "binary_yes"),
            }),
          },
          {
            target: "welcome",
            cond: (context) => !!getEntity(context, "binary_no"),
            actions: assign({
              title: (context) => getEntity(context, "binary_no"),
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
          entry: say("This is a test"),
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
    success: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, your meeting has been created`,
      })),
    },
  },
};

const kbRequest = (text: string) =>
  fetch(
    new Request(
      `https://cors.eu.org/https://api.duckduckgo.com/?q=${text}&format=json&skip_disambig=1`
    )
  ).then((data) => data.json());
