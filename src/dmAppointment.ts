import { text } from "stream/consumers";
import { MachineConfig, send, Action, assign } from "xstate";

function say(text: string): Action<SDSContext, SDSEvent> {
  return send((_context: SDSContext) => ({ type: "SPEAK", value: text }));
}

const getEntity = (context: SDSContext, entity: string) => {
  console.log("nluResult");
  console.log(context.nluResult);
  // lowercase the utterance and remove tailing "."
      return context.nluResult.prediction.intents[0].category;
};

const getText = (context: SDSContext, entity: string) => {
  console.log("nluResult");
  console.log(context.nluResult);
  // lowercase the utterance and remove tailing "."
      return context.nluResult.prediction.entities[0].text;
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
            cond: (context) => getEntity(context) === "create a meeting",
          },
          {
            target: "celebrity_info",
            cond: (context) => getEntity(context) === "who is x",
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        prompt: {
          entry: say("Hi Anika. Would you like to create a meeting or ask a celebrity question?"),
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
            cond: (context) => getEntity(context) === "appointment type",
            actions: assign({
              type: (context) => getText(context, "type"),
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
        id:"celebrity_info",
        initial: "prompt",
        on: {
          RECOGNISED: [
            {
              target: ".information",
              actions: assign({type:
                context => {return context.recResult[0].utterance},
              }),
            },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".prompt",
        },
        states: {
          information: {
            invoke: {
              id: 'getInformation',
              src: (context, event) => kbRequest(context.type),
              onDone: [{
                target: 'success',
                cond: (context, event) => event.data.Abstract !== "",
                actions: assign({ information: (context, event) => event.data })
              },
              {
                target: 'failure',
              },
            ],
              onError: {
                target: 'failure',
              }
            }
          },
          success: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `Here's what I found: ${context.information.Abstract}`
            })),
            on: {ENDSPEECH: "#want_meet"},
          },
          failure: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `Sorry, I don't know who that is. Tell me something I know.`
            })),
            on: {ENDSPEECH: "ask"},
          },
          prompt: {
            entry: say("What celebrity do you have in mind?"),
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
    want_meet: {
      id:"want_meet",  
      initial: "prompt",
        on: {
          RECOGNISED: [
            {
              target: "assign_meeting_title",
              cond: (context) => getEntity(context) === "positive",
            },
            {
              target: "hello",
              cond: (context) => getEntity(context) === "negative",
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
    assign_meeting_title: {
      entry: [
        say("Okay."),
        assign((context) => ({type: `meeting with ${context.type}`}))
      ],
      on: { ENDSPEECH: "date_info" },
      },
    date_info: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "day_info",
            cond: (context) => getEntity(context) === "date time",
            actions: assign({
              day: (context) => getText(context, "day"),
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
            cond: (context) => getEntity(context) === "positive",
          },
          {
            target: "whole_day_no",
            cond: (context) => getEntity(context) === "negative",
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
    whole_day_no: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "meeting_time",
            cond: (context) => getEntity(context) === "time",
            actions: assign({
              hour: (context) => getText(context, "hour"),
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
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "success",
            cond: (context) => getEntity(context) === "positive",
          },
          {
            target: "welcome",
            cond: (context) => getEntity(context) === "negative",
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
            value: `OK, do you want me to create a meeting titled ${context.type} on ${context.day} at ${context.hour}?`,
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
    whole_day_yes: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "success",
            cond: (context) => getEntity(context) === "positive",
          },
          {
            target: "welcome",
            cond: (context) => getEntity(context) === "negative",
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
            value: `OK, do you want me to create a meeting titled ${context.type} on ${context.day} for the whole day?`,
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
