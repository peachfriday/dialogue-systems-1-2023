/// <reference types="react-scripts" />

declare module "react-speech-kit";
declare module "web-speech-cognitive-services/lib/SpeechServices/TextToSpeech";
declare module "web-speech-cognitive-services/lib/SpeechServices/SpeechToText";

interface Hypothesis {
  utterance: string;
  confidence: number;
}

interface MySpeechSynthesisUtterance extends SpeechSynthesisUtterance {
  new (s: string);
}

interface MySpeechRecognition extends SpeechRecognition {
  new (s: string);
}

interface Parameters {
  ttsVoice: string;
  ttsLexicon: string;
  asrLanguage: string;
  azureKey: string;
  azureNLUKey: string;
  azureNLUUrl: string;
  azureNLUprojectName: string;
  azureNLUdeploymentName: string;
}

interface ChatInput {
  past_user_inputs: string[];
  generated_responses: string[];
  text: string;
}

interface SDSContext {
  justsaid: any;
  parameters: Parameters;
  asr: SpeechRecognition;
  tts: SpeechSynthesis;
  voice: SpeechSynthesisVoice;
  ttsUtterance: MySpeechSynthesisUtterance;
  recResult: Hypothesis[];
  nluResult: any;
  ttsAgenda: string;
  azureAuthorizationToken: string;
  audioCtx: any;

  type: any;
  hour: any;
  day: any;
  binary_yes: any;
  binary_no: any;
  create_meeting: any;
  information: any;
  title: any;
  topic: string;
  topic: string;
  justsaid: any;
  count: number;
  saidday: any;
  saidappointment: any;
  saidhour: any;
  count2: number;
  count3: number;
  count4: number;
  count5: number;
  count6: number;
  count7: number;
  count8: number;
  count9: number;
  count10: number;
}

type SDSEvent =
  | { type: "TTS_READY" }
  | { type: "TTS_ERROR" }
  | { type: "CLICK" }
  | { type: "SELECT"; value: any }
  | { type: "STARTSPEECH" }
  | { type: "RECOGNISED" }
  | { type: "ASRRESULT"; value: Hypothesis[] }
  | { type: "ENDSPEECH" }
  | { type: "LISTEN" }
  | { type: "TIMEOUT" }
  | { type: "NOINPUT" }
  | { type: "SPEAK"; value: string };
