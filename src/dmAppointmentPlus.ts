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
    entities: { day: "Tuesday" },
  },
  "on wednesday": {
    intent: "None",
    entities: { day: "Wednesday" },
  },
  "on thursday": {
    intent: "None",
    entities: { day: "Thursday" },
  },
  "on saturday": {
    intent: "None",
    entities: { day: "Saturday" },
  },
  "on sunday": {
    intent: "None",
    entities: { day: "Sunday" },
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
  "4": {
    intent: "None",
    entities: { hour: "4 pm" },
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
  "ask a celebrity question" : {
    intent: "None",
    entities: {type: "meeting with Zac Efron"}
  },
  "meeting with Zac Efron" : {
    intent: "None",
    entities: {type: "meeting with Zac Efron"}
  },
  "meeting with Ashley Tisdale" : {
    intent: "None",
    entities: {type: "meeting with Ashley Tisdale"},
  },
  "meeting with Vanessa Hudgens" : {
    intent: "None",
    entities: {type: "meeting with Vanessa Hudgens"},
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

const getHelp = (context: SDSContext, entity: string) => {
  console.log("nluResult");
  console.log(context.nluResult);
  // lowercase the utterance and remove tailing "."
      return context.nluResult.prediction.intents[0].category;
};

const getEntity2 = (context: SDSContext, entity: string) => {
  // lowercase the utterance and remove tailing "."
  let u = context.recResult[0].utterance.toLowerCase().replace(/.$/g, "");
  let threshold = 0.80
  if (threshold < context.recResult[0].confidence) {
  if (u in grammar) {
    if (entity in grammar[u].entities) {
      return grammar[u].entities[entity];
    }
  }
} else {
  return false;
}
};


export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: "idle",
  id: "init",
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
      id: "hello",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "welcome",
            cond: (context) => !!getEntity2(context, "create_meeting"),
            actions: assign({
              type: (context) => getEntity2(context, "create_meeting"),
            }),
          },
          {
            target: "celebrity_info",
            cond: (context) => !!getEntity2(context, "type"),
            actions: assign({
              type: (context) => getEntity2(context, "type"),
            }),
          },
          {
            target: ".help_message",
            cond: (context) => getHelp(context) === "help",
          },
          {
            target: "celebrity_info",
            cond: (context) => !!getEntity(context, "binary_yes") && (context.justsaid) === 'Ask a celebrity question.'
          },
          {
            target: "welcome",
            cond: (context) => !!getEntity(context, "binary_yes") && (context.justsaid) === 'Create a meeting.'
          },
          {
            target: "#hello",
            cond: (context) => !!getEntity(context, "binary_no"),
          },
          {
            target: ".meant",
            cond: (context) => getEntity2(context) === false,
            actions: assign({
              justsaid:(context: { recResult: { utterance: any; }[]; }) => context.recResult[0].utterance,
            }),
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".noinput",
      },
      states: {
        noinput: {
        entry: say("No response recorded."),
        on: { ENDSPEECH: "prompt" },
      },
        prompt: {
          initial: "choice",
          id: "p",
          states: {
            choice: {
              always: [
                {target: "p2.hist",
                cond: (context) => context.count === 2,
              },
              {target: "p3.hist",
                cond: (context) => context.count === 3,
              },
              {target: "p4.hist",
              cond: (context) => context.count === 4,
            },
            {target: "p5.hist",
            cond: (context) => context.count === 5,
          },
              "p1",
            ],
              },
      p1: {
        entry: [assign({ count: 2 })],
      initial: "prompt",
      states: {
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "Hi Anika. Would you like to create a meeting or ask a celebrity question?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
      },
      },
      p2: {
        entry: [assign({ count: 3 })],
        initial: "prompt",
      states: {
        hist: { type: "history" },
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "Are you there?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
            },
          },
          p3: {
            entry: [assign({ count: 4 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "Are you there?",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p4: {
            entry: [assign({ count: 5 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "This is your last chance to respond.",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p5: {
          entry: [assign({ count: 0 })],
          initial: "prompt",
          states: {
          hist: { type: "history" },
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "The system is shutting down.",
            }),
            on: { ENDSPEECH: "#init" },
        },
        },
        },
        },
      },
        help_message: {
          entry: say("You are being returned to the previous block."),
          on: { ENDSPEECH: "prompt" },
        },
        meant: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Did you mean ${context.justsaid}`,
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
    welcome: {
      id: "welcome",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "info",
            cond: (context) => !!getEntity2(context, "type"),
            actions: assign({
              type: (context) => getEntity2(context, "type"),
            }),
          },
          {
            target: ".help_message",
            cond: (context) => getHelp(context) === "help",
          },
          {
            target: "info",
            cond: (context) => !!getEntity(context, "binary_yes"),
          },
          {
            target: "#welcome",
            cond: (context) => !!getEntity(context, "binary_no"),
          },
          {
            target: ".meant",
            cond: (context) => getEntity2(context) === false,
            actions: assign({
              justsaid:(context: { recResult: { utterance: any; }[]; }) => context.recResult[0].utterance,
            }),
          },
          {
            target: "init",
            cond: (context) => context.count === 2,
          },
          ".noinput",
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".noinput",
      },
      states: {
        noinput: {
        entry: say("No response recorded."),
        on: { ENDSPEECH: "prompt" },
      },
        prompt: {
          initial: "choice",
          id: "p",
          states: {
            choice: {
              always: [
                {target: "p2.hist",
                cond: (context) => context.count2 === 2,
              },
              {target: "p3.hist",
                cond: (context) => context.count2 === 3,
              },
              {target: "p4.hist",
              cond: (context) => context.count2 === 4,
            },
            {target: "p5.hist",
            cond: (context) => context.count2 === 5,
          },
              "p1",
            ],
              },
      p1: {
        entry: [assign({ count2: 2 })],
      initial: "prompt",
      states: {
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "Let's create a meeting! What is it about?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
      },
      },
      p2: {
        entry: [assign({ count2: 3 })],
        initial: "prompt",
      states: {
        hist: { type: "history" },
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "Are you there?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
            },
          },
          p3: {
            entry: [assign({ count2: 4 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "Are you there?",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p4: {
            entry: [assign({ count2: 5 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "This is your last chance to respond.",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p5: {
          entry: [assign({ count2: 0 })],
          initial: "prompt",
          states: {
          hist: { type: "history" },
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "The system is shutting down.",
            }),
            on: { ENDSPEECH: "#init" },
        },
        },
        },
        },
      },
        help_message: {
          entry: say("You are being returned to the previous block."),
          on: { ENDSPEECH: "#hello" },
        },
        meant: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Did you mean ${context.justsaid}`,
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
    info: {
        entry: send((context) => ({
          type: "SPEAK",
          value: `OK, ${context.justsaid}`,
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
              target: ".help_message",
              cond: (context) => getHelp(context) === "help",
            },
            {
              target: ".information",
              cond: (context) => !!getEntity(context, "binary_yes"),
            },
            {
              target: "#celebrity_info",
              cond: (context) => !!getEntity(context, "binary_no"),
            },
            {
              target: ".meant",
              cond: (context) => getEntity2(context) === false,
              actions: assign({
                justsaid:(context: { recResult: { utterance: any; }[]; }) => context.recResult[0].utterance,
              }),
            },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
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
          noinput: {
            entry: say("No response recorded."),
            on: { ENDSPEECH: "prompt" },
          },
            prompt: {
              initial: "choice",
              id: "p",
              states: {
                choice: {
                  always: [
                    {target: "p2.hist",
                    cond: (context) => context.count10 === 2,
                  },
                  {target: "p3.hist",
                    cond: (context) => context.count10 === 3,
                  },
                  {target: "p4.hist",
                  cond: (context) => context.count10 === 4,
                },
                {target: "p5.hist",
                cond: (context) => context.count10 === 5,
              },
                  "p1",
                ],
                  },
          p1: {
            entry: [assign({ count10: 2 })],
          initial: "prompt",
          states: {
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "What celebrity do you have in mind?",
              }),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
          },
          },
          p2: {
            entry: [assign({ count10: 3 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "Are you there?",
              }),
              on: { ENDSPEECH: "ask" },
            },
            ask: {
              entry: send("LISTEN"),
            },
                },
              },
              p3: {
                entry: [assign({ count10: 4 })],
                initial: "prompt",
              states: {
                hist: { type: "history" },
                prompt: {
                  entry: send({
                    type: "SPEAK",
                    value: "Are you there?",
                  }),
                  on: { ENDSPEECH: "ask" },
                },
              ask: {
              entry: send("LISTEN"),
              },
              },
              },
              p4: {
                entry: [assign({ count10: 5 })],
                initial: "prompt",
              states: {
                hist: { type: "history" },
                prompt: {
                  entry: send({
                    type: "SPEAK",
                    value: "This is your last chance to respond.",
                  }),
                  on: { ENDSPEECH: "ask" },
                },
              ask: {
              entry: send("LISTEN"),
              },
              },
              },
              p5: {
              entry: [assign({ count10: 0 })],
              initial: "prompt",
              states: {
              hist: { type: "history" },
              prompt: {
                entry: send({
                  type: "SPEAK",
                  value: "The system is shutting down.",
                }),
                on: { ENDSPEECH: "#init" },
            },
            },
            },
            },
          },
          help_message: {
            entry: say("You are being returned to the previous block."),
            on: { ENDSPEECH: "#celebrity_info" },
          },
          meant: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `Did you mean ${context.justsaid}`,
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
    want_meet: {
      id:"want_meet",  
      initial: "prompt",
        on: {
          RECOGNISED: [
            {
              target: "assign_meeting_title",
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
              target: ".meant",
              cond: (context) => getEntity2(context) === false,
              actions: assign({
                justsaid:(context: { recResult: { utterance: any; }[]; }) => context.recResult[0].utterance,
              }),
            },
          {
            target: "assign_meeting_title",
            cond: (context) => !!getEntity(context, "binary_yes") && (context.justsaid) === 'Yes.'
          },
          {
            target: "#want_meet",
            cond: (context) => !!getEntity(context, "binary_no") && (context.justsaid) === 'No.'
          },
            {
              target: ".help_message",
              cond: (context) => getHelp(context) === "help",
            },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },
        states: {
          noinput: {
          entry: say("No response recorded."),
          on: { ENDSPEECH: "prompt" },
        },
          prompt: {
            initial: "choice",
            id: "p",
            states: {
              choice: {
                always: [
                  {target: "p2.hist",
                  cond: (context) => context.count3 === 2,
                },
                {target: "p3.hist",
                  cond: (context) => context.count3 === 3,
                },
                {target: "p4.hist",
                cond: (context) => context.count3 === 4,
              },
              {target: "p5.hist",
              cond: (context) => context.count3 === 5,
            },
                "p1",
              ],
                },
        p1: {
          entry: [assign({ count3: 2 })],
        initial: "prompt",
        states: {
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "Do you want to meet them?",
            }),
            on: { ENDSPEECH: "ask" },
          },
          ask: {
            entry: send("LISTEN"),
          },
        },
        },
        p2: {
          entry: [assign({ count3: 3 })],
          initial: "prompt",
        states: {
          hist: { type: "history" },
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "Are you there?",
            }),
            on: { ENDSPEECH: "ask" },
          },
          ask: {
            entry: send("LISTEN"),
          },
              },
            },
            p3: {
              entry: [assign({ count3: 4 })],
              initial: "prompt",
            states: {
              hist: { type: "history" },
              prompt: {
                entry: send({
                  type: "SPEAK",
                  value: "Are you there?",
                }),
                on: { ENDSPEECH: "ask" },
              },
            ask: {
            entry: send("LISTEN"),
            },
            },
            },
            p4: {
              entry: [assign({ count3: 5 })],
              initial: "prompt",
            states: {
              hist: { type: "history" },
              prompt: {
                entry: send({
                  type: "SPEAK",
                  value: "This is your last chance to respond.",
                }),
                on: { ENDSPEECH: "ask" },
              },
            ask: {
            entry: send("LISTEN"),
            },
            },
            },
            p5: {
            entry: [assign({ count3: 0 })],
            initial: "prompt",
            states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "The system is shutting down.",
              }),
              on: { ENDSPEECH: "#init" },
          },
          },
          },
          },
        },
          help_message: {
            entry: say("You are being returned to the previous block."),
            on: { ENDSPEECH: "#celebrity_info" },
          },
          meant: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `Did you mean ${context.justsaid}`,
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
    assign_meeting_title: {
      entry: [
        say("Okay."),
        assign((context) => ({type: `meeting with ${context.type}`}))
      ],
      on: { ENDSPEECH: "date_info_celeb" },
      },
    date_info_celeb: {
        id: "date_info",
        initial: "prompt",
        on: {
          RECOGNISED: [
            {
              target: "day_info",
              cond: (context) => !!getEntity2(context, "day"),
              actions: assign({
                day: (context) => getEntity2(context, "day"),
              }),
            },
            {
              target: ".help_message",
              cond: (context) => getHelp(context) === "help",
            },
            {
            target: "day_info",
            cond: (context) => !!getEntity(context, "binary_yes"),
          },
          {
            target: "#date_info",
            cond: (context) => !!getEntity(context, "binary_no"),
          },
          {
            target: ".meant",
            cond: (context) => getEntity2(context) === false,
            actions: assign({
              saidday:(context: { recResult: { utterance: any; }[]; }) => context.recResult[0].utterance,
            }),
          },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },
        states: {
          noinput: {
          entry: say("No response recorded."),
          on: { ENDSPEECH: "prompt" },
        },
          prompt: {
            initial: "choice",
            id: "p",
            states: {
              choice: {
                always: [
                  {target: "p2.hist",
                  cond: (context) => context.count4 === 2,
                },
                {target: "p3.hist",
                  cond: (context) => context.count4 === 3,
                },
                {target: "p4.hist",
                cond: (context) => context.count4 === 4,
              },
              {target: "p5.hist",
              cond: (context) => context.count4 === 5,
            },
                "p1",
              ],
                },
        p1: {
          entry: [assign({ count4: 2 })],
        initial: "prompt",
        states: {
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "On which day is it?",
            }),
            on: { ENDSPEECH: "ask" },
          },
          ask: {
            entry: send("LISTEN"),
          },
        },
        },
        p2: {
          entry: [assign({ count4: 3 })],
          initial: "prompt",
        states: {
          hist: { type: "history" },
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "Are you there?",
            }),
            on: { ENDSPEECH: "ask" },
          },
          ask: {
            entry: send("LISTEN"),
          },
              },
            },
            p3: {
              entry: [assign({ count4: 4 })],
              initial: "prompt",
            states: {
              hist: { type: "history" },
              prompt: {
                entry: send({
                  type: "SPEAK",
                  value: "Are you there?",
                }),
                on: { ENDSPEECH: "ask" },
              },
            ask: {
            entry: send("LISTEN"),
            },
            },
            },
            p4: {
              entry: [assign({ count4: 5 })],
              initial: "prompt",
            states: {
              hist: { type: "history" },
              prompt: {
                entry: send({
                  type: "SPEAK",
                  value: "This is your last chance to respond.",
                }),
                on: { ENDSPEECH: "ask" },
              },
            ask: {
            entry: send("LISTEN"),
            },
            },
            },
            p5: {
            entry: [assign({ count4: 0 })],
            initial: "prompt",
            states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "The system is shutting down.",
              }),
              on: { ENDSPEECH: "#init" },
          },
          },
          },
          },
        },
          help_message: {
            entry: say("You are being returned to the previous block."),
            on: { ENDSPEECH: "#want_meet" },
          },
          meant: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `Did you mean ${context.saidday}`,
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
    date_info: {
      id: "date_info",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "day_info",
            cond: (context) => !!getEntity2(context, "day"),
            actions: assign({
              day: (context) => getEntity2(context, "day"),
            }),
          },
          {
            target: ".help_message",
            cond: (context) => getHelp(context) === "help",
          },
          {
            target: "day_info",
            cond: (context) => !!getEntity(context, "binary_yes"),
          },
          {
            target: "#date_info",
            cond: (context) => !!getEntity(context, "binary_no"),
          },
          {
            target: ".meant",
            cond: (context) => getEntity2(context) === false,
            actions: assign({
              saidday:(context: { recResult: { utterance: any; }[]; }) => context.recResult[0].utterance,
            }),
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".noinput",
      },
      states: {
        noinput: {
        entry: say("No response recorded."),
        on: { ENDSPEECH: "prompt" },
      },
        prompt: {
          initial: "choice",
          id: "p",
          states: {
            choice: {
              always: [
                {target: "p2.hist",
                cond: (context) => context.count5 === 2,
              },
              {target: "p3.hist",
                cond: (context) => context.count5 === 3,
              },
              {target: "p4.hist",
              cond: (context) => context.count5 === 4,
            },
            {target: "p5.hist",
            cond: (context) => context.count5 === 5,
          },
              "p1",
            ],
              },
      p1: {
        entry: [assign({ count5: 2 })],
      initial: "prompt",
      states: {
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "On which day is it?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
      },
      },
      p2: {
        entry: [assign({ count5: 3 })],
        initial: "prompt",
      states: {
        hist: { type: "history" },
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "Are you there?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
            },
          },
          p3: {
            entry: [assign({ count5: 4 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "Are you there?",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p4: {
            entry: [assign({ count5: 5 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "This is your last chance to respond.",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p5: {
          entry: [assign({ count5: 0 })],
          initial: "prompt",
          states: {
          hist: { type: "history" },
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "The system is shutting down.",
            }),
            on: { ENDSPEECH: "#init" },
        },
        },
        },
        },
      },
        help_message: {
          entry: say("You are being returned to the previous block."),
          on: { ENDSPEECH: "#welcome" },
        },
        meant: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Did you mean ${context.saidday}`,
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
    day_info: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, ${context.saidday}`,
      })),
      on: { ENDSPEECH: "duration_info" },
    },
    duration_info: {
      id: "duration_info",
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
            target: ".help_message",
            cond: (context) => getHelp(context) === "help",
          },
          {
            target: ".meant",
            cond: (context) => getEntity2(context) === false,
            actions: assign({
              justsaid:(context: { recResult: { utterance: any; }[]; }) => context.recResult[0].utterance,
            }),
          },
          {
            target: "whole_day_yes",
            cond: (context) => !!getEntity(context, "binary_yes") && (context.justsaid) === 'Yes.'
          },
          {
            target: "whole_day_no",
            cond: (context) => !!getEntity(context, "binary_no") && (context.justsaid) === 'No.'
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".noinput",
      },
      states: {
        noinput: {
        entry: say("No response recorded."),
        on: { ENDSPEECH: "prompt" },
      },
        prompt: {
          initial: "choice",
          id: "p",
          states: {
            choice: {
              always: [
                {target: "p2.hist",
                cond: (context) => context.count6 === 2,
              },
              {target: "p3.hist",
                cond: (context) => context.count6 === 3,
              },
              {target: "p4.hist",
              cond: (context) => context.count6 === 4,
            },
            {target: "p5.hist",
            cond: (context) => context.count6 === 5,
          },
              "p1",
            ],
              },
      p1: {
        entry: [assign({ count6: 2 })],
      initial: "prompt",
      states: {
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "Will it take the whole day?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
      },
      },
      p2: {
        entry: [assign({ count6: 3 })],
        initial: "prompt",
      states: {
        hist: { type: "history" },
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "Are you there?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
            },
          },
          p3: {
            entry: [assign({ count6: 4 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "Are you there?",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p4: {
            entry: [assign({ count6: 5 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "This is your last chance to respond.",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p5: {
          entry: [assign({ count6: 0 })],
          initial: "prompt",
          states: {
          hist: { type: "history" },
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "The system is shutting down.",
            }),
            on: { ENDSPEECH: "#init" },
        },
        },
        },
        },
      },
        help_message: {
          entry: say("You are being returned to the previous block."),
          on: { ENDSPEECH: "#date_info" },
        },
        meant: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Did you mean ${context.justsaid}`,
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
            target: ".help_message",
            cond: (context) => getHelp(context) === "help",
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".noinput",
      },
      states: {
        noinput: {
        entry: say("No response recorded."),
        on: { ENDSPEECH: "prompt" },
      },
        prompt: {
          initial: "choice",
          id: "p",
          states: {
            choice: {
              always: [
                {target: "p2.hist",
                cond: (context) => context.count7 === 2,
              },
              {target: "p3.hist",
                cond: (context) => context.count7 === 3,
              },
              {target: "p4.hist",
              cond: (context) => context.count7 === 4,
            },
            {target: "p5.hist",
            cond: (context) => context.count7 === 5,
          },
              "p1",
            ],
              },
      p1: {
        entry: [assign({ count7: 2 })],
      initial: "prompt",
      states: {
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `OK, do you want me to create a meeting titled ${context.justsaid} on ${context.saidday} for the whole day?`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
      },
      },
      p2: {
        entry: [assign({ count7: 3 })],
        initial: "prompt",
      states: {
        hist: { type: "history" },
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "Are you there?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
            },
          },
          p3: {
            entry: [assign({ count7: 4 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "Are you there?",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p4: {
            entry: [assign({ count7: 5 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "This is your last chance to respond.",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p5: {
          entry: [assign({ count7: 0 })],
          initial: "prompt",
          states: {
          hist: { type: "history" },
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "The system is shutting down.",
            }),
            on: { ENDSPEECH: "#init" },
        },
        },
        },
        },
      },
        help_message: {
          entry: say("You are being returned to the previous block."),
          on: { ENDSPEECH: "#duration_info" },
        },
        meant: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Did you mean ${context.justsaid}`,
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
    whole_day_no: {
      id: "whole_day_no",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "meeting_time",
            cond: (context) => !!getEntity2(context, "hour"),
            actions: assign({
              hour: (context) => getEntity2(context, "hour"),
            }),
          },
          {
            target: "meeting_time",
            cond: (context) => !!getEntity(context, "binary_yes"),
          },
          {
            target: "#whole_day_no",
            cond: (context) => !!getEntity(context, "binary_no"),
          },
          {
            target: ".meant",
            cond: (context) => getEntity2(context) === false,
            actions: assign({
              saidhour:(context: { recResult: { utterance: any; }[]; }) => context.recResult[0].utterance,
            }),
          },
          {
            target: ".help_message",
            cond: (context) => getHelp(context) === "help",
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".noinput",
      },
      states: {
        noinput: {
        entry: say("No response recorded."),
        on: { ENDSPEECH: "prompt" },
      },
        prompt: {
          initial: "choice",
          id: "p",
          states: {
            choice: {
              always: [
                {target: "p2.hist",
                cond: (context) => context.count8 === 2,
              },
              {target: "p3.hist",
                cond: (context) => context.count8 === 3,
              },
              {target: "p4.hist",
              cond: (context) => context.count8 === 4,
            },
            {target: "p5.hist",
            cond: (context) => context.count8 === 5,
          },
              "p1",
            ],
              },
      p1: {
        entry: [assign({ count8: 2 })],
      initial: "prompt",
      states: {
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `What time is your meeting?`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
      },
      },
      p2: {
        entry: [assign({ count8: 3 })],
        initial: "prompt",
      states: {
        hist: { type: "history" },
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "Are you there?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
            },
          },
          p3: {
            entry: [assign({ count8: 4 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "Are you there?",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p4: {
            entry: [assign({ count8: 5 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "This is your last chance to respond.",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p5: {
          entry: [assign({ count8: 0 })],
          initial: "prompt",
          states: {
          hist: { type: "history" },
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "The system is shutting down.",
            }),
            on: { ENDSPEECH: "#init" },
        },
        },
        },
        },
      },
        help_message: {
          entry: say("You are being returned to the previous block."),
          on: { ENDSPEECH: "#duration_info" },
        },
        meant: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Did you mean ${context.saidhour}`,
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
    meeting_time: {
      id: "meeting_time",
      initial: "prompt",
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
            target: "hello",
            cond: (context) => !!getEntity(context, "binary_no"),
            actions: assign({
              title: (context) => getEntity(context, "binary_no"),
            }),
          },
          {
            target: ".help_message",
            cond: (context) => getHelp(context) === "help",
          },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".noinput",
      },
      states: {
        noinput: {
        entry: say("No response recorded."),
        on: { ENDSPEECH: "prompt" },
      },
        prompt: {
          initial: "choice",
          id: "p",
          states: {
            choice: {
              always: [
                {target: "p2.hist",
                cond: (context) => context.count9 === 2,
              },
              {target: "p3.hist",
                cond: (context) => context.count9 === 3,
              },
              {target: "p4.hist",
              cond: (context) => context.count9 === 4,
            },
            {target: "p5.hist",
            cond: (context) => context.count9 === 5,
          },
              "p1",
            ],
              },
      p1: {
        entry: [assign({ count9: 2 })],
      initial: "prompt",
      states: {
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `OK, do you want me to create a meeting titled ${context.justsaid} on ${context.saidday} at ${context.saidhour}?`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
      },
      },
      p2: {
        entry: [assign({ count9: 3 })],
        initial: "prompt",
      states: {
        hist: { type: "history" },
        prompt: {
          entry: send({
            type: "SPEAK",
            value: "Are you there?",
          }),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
            },
          },
          p3: {
            entry: [assign({ count9: 4 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "Are you there?",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p4: {
            entry: [assign({ count9: 5 })],
            initial: "prompt",
          states: {
            hist: { type: "history" },
            prompt: {
              entry: send({
                type: "SPEAK",
                value: "This is your last chance to respond.",
              }),
              on: { ENDSPEECH: "ask" },
            },
          ask: {
          entry: send("LISTEN"),
          },
          },
          },
          p5: {
          entry: [assign({ count9: 0 })],
          initial: "prompt",
          states: {
          hist: { type: "history" },
          prompt: {
            entry: send({
              type: "SPEAK",
              value: "The system is shutting down.",
            }),
            on: { ENDSPEECH: "#init" },
        },
        },
        },
        },
      },
        help_message: {
          entry: say("You are being returned to the previous block."),
          on: { ENDSPEECH: "#whole_day_no" },
        },
        meant: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Did you mean ${context.justsaid}`,
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