import React from "react";
import "@fontsource/inter";
import "./App.css";

import {
  Box,
  ChakraProvider,
  Flex,
  Spacer,
  Text,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Container,
  Heading,
  HStack,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { useConversation, AudioDeviceConfig, ConversationConfig } from "vocode";
import MicrophoneIcon from "./components/MicrophoneIcon";
import AudioVisualization from "./components/AudioVisualization";
import { isMobile } from "react-device-detect";

import {
  ChatGPTAgentConfig,
  DeepgramTranscriberConfig,
  AzureSynthesizerConfig,
  VocodeConfig,
} from "vocode";

const Conversation = ({
  config,
}: {
  config: Omit<ConversationConfig, "audioDeviceConfig">;
}) => {
  const [audioDeviceConfig, setAudioDeviceConfig] =
    React.useState<AudioDeviceConfig>({});
  const [inputDevices, setInputDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = React.useState<MediaDeviceInfo[]>(
    []
  );
  const { status, start, stop, analyserNode } = useConversation(
    Object.assign(config, { audioDeviceConfig })
  );

  React.useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setInputDevices(
          devices.filter(
            (device) => device.deviceId && device.kind === "audioinput"
          )
        );
        setOutputDevices(
          devices.filter(
            (device) => device.deviceId && device.kind === "audiooutput"
          )
        );
      })
      .catch((err) => {
        console.error(err);
      });
  });

  return (
    <>
      {analyserNode && <AudioVisualization analyser={analyserNode} />}
      <Button
        variant="link"
        disabled={["connecting", "error"].includes(status)}
        onClick={status === "connected" ? stop : start}
        position={"absolute"}
        top={"45%"}
        left={"50%"}
        transform={"translate(-50%, -50%)"}
      >
        <Box boxSize={75}>
          <MicrophoneIcon color={"#ddfafa"} muted={status !== "connected"} />
        </Box>
      </Button>
      <Box boxSize={50} />
      {status === "connecting" && (
        <Box
          position={"absolute"}
          top="57.5%"
          left="50%"
          transform={"translate(-50%, -50%)"}
          padding={5}
        >
          <Spinner color="#FFFFFF" />
        </Box>
      )}
      {!isMobile && (
        <HStack width="96%" position="absolute" top={"10%"} left="2%">
          {inputDevices.length > 0 && (
            <Select
              color={"#FFFFFF"}
              disabled={["connecting", "connected"].includes(status)}
              onChange={(event) =>
                setAudioDeviceConfig({
                  ...audioDeviceConfig,
                  inputDeviceId: event.target.value,
                })
              }
              value={audioDeviceConfig.inputDeviceId}
            >
              {inputDevices.map((device, i) => {
                return (
                  <option key={i} value={device.deviceId}>
                    {device.label}
                  </option>
                );
              })}
            </Select>
          )}
          {outputDevices.length > 0 && (
            <Select
              color={"#FFFFFF"}
              disabled
              onChange={(event) =>
                setAudioDeviceConfig({
                  ...audioDeviceConfig,
                  outputDeviceId: event.target.value,
                })
              }
              value={audioDeviceConfig.outputDeviceId}
            >
              {outputDevices.map((device, i) => {
                return (
                  <option key={i} value={device.deviceId}>
                    {device.label}
                  </option>
                );
              })}
            </Select>
          )}
        </HStack>
      )}
    </>
  );
};

const App = () => {
  const [formValues, setFormValues] = React.useState({
    position: "",
    company: "",
    questions: "",
  });

  const [startInterview, setStartInterview] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStartInterview(true);
  };

  const transcriberConfig: DeepgramTranscriberConfig = {
    type: "transcriber_deepgram",
    chunkSize: 2048,
    endpointingConfig: {
      type: "endpointing_punctuation_based",
    },
    samplingRate: 16000,
    audioEncoding: "linear16",
  };

  const synthesizerConfig: AzureSynthesizerConfig = {
    type: "synthesizer_azure",
    shouldEncodeAsWav: true,
    voiceName: "en-US-SteffanNeural",
    samplingRate: 16000,
    audioEncoding: "linear16",
  };

  const vocodeConfig: VocodeConfig = {
    apiKey: process.env.REACT_APP_VOCODE_API_KEY || "",
  };

  const agentConfig: ChatGPTAgentConfig = {
    type: "agent_chat_gpt",
    initialMessage: { type: "message_base", text: "Hello! Are you ready to begin your case interview?" },
    promptPreamble: `As an expert case interviewer at ${formValues.company}, engage with the user who is applying for the ${formValues.position}. You communicate in a natural, conversational manner, making the interviewer feel comfortable, and closely mimic the style of a real-life case interviewer from major consulting companies such as McKinsey, Boston Consulting Group, and Bain.
    Be aware that you are being used to communicate with people in real time, and the person you are interviewing will hear your text, while their spoken responses will be transcribed for you. Conduct a detailed case interview with the following components:
    1. Introduce the case scenario in a friendly and engaging way, including the client's industry, company size, and market dynamics.
    2. Present the client's specific problem or challenge that they are seeking to address.
    3. Describe any relevant data, facts, or constraints related to the case.
    4. Ask the interviewee to analyze the situation, develop a structured approach, and provide recommendations to solve the client's problem. Encourage them to think out loud, ask clarifying questions, and discuss their thought process throughout the case.
    5. After every ${formValues.questions} questions, provide feedback and constructive criticism on the interviewee's performance in a supportive manner, focusing on their problem-solving approach, communication skills, and recommendations.
    6. Provide prompts or hints if the interviewee requires redirection or gets stuck, while maintaining a positive and encouraging tone.
    7. Conclude the case by summarizing the interviewee's recommendations and discussing any additional insights or considerations, ensuring the interviewer feels valued and appreciated for their efforts.
    8. When you are done giving feedback, say "goodbye" to end the conversation.`,
    endConversationOnGoodbye: true,
    generateResponses: true,
    cutOffResponse: {},
    modelName: "gpt-4",
  };

  return (
    <ChakraProvider>
      {startInterview ? (
        <Conversation
          config={{
            transcriberConfig,
            agentConfig,
            synthesizerConfig,
            vocodeConfig,
          }}
        />
      ) : (
        <VStack padding={10} alignItems="center" w="100%">
          <Heading as="h1" size="xl" mb={4}>
            TJ's AI Interview Assistant
          </Heading>
          <Text fontSize="lg" textAlign="center" mb={8}>
            This application helps you practice case interviews by having a conversation with an AI. Fill out the form below with the position, company, and the number of questions before the AI provides feedback.
          </Text>
          <Container centerContent className="form-container">
            <form onSubmit={handleSubmit}>
              <FormControl id="position" isRequired mb={4}>
                <FormLabel>Position</FormLabel>
                <Input
                  type="text"
                  name="position"
                  value={formValues.position}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl id="company" isRequired mb={4}>
                <FormLabel>Company</FormLabel>
                <Input
                  type="text"
                  name="company"
                  value={formValues.company}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl id="questions" isRequired mb={4}>
                <FormLabel>Number of Questions</FormLabel>
                <Input
                  type="text"
                  name="questions"
                  value={formValues.questions}
                  onChange={handleChange}
                />
              </FormControl>
              <Flex justifyContent="center" mt={4}>
              <Button type="submit" colorScheme="blue" mt={4}>
                Next
              </Button>
              </Flex>
            </form>
          </Container>
        </VStack>
      )}
    </ChakraProvider>
  );
};

export default App;