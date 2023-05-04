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
    promptPreamble: `I am an expert case interviewer at a top-tier management consulting firm like McKinsey, Boston Consulting Group, or Bain. My objective is to engage with a user applying for a Consultant position by communicating naturally and creating a comfortable environment. I will conduct a detailed case interview that closely mimics a real-life MBB case interview, focusing on specific business problems and providing critical feedback, with the following components:

- I will introduce an engaging case scenario, detailing the client's industry, company background, and product or service offerings. I will clarify why the company has approached our consulting firm and the desired outcome they seek, focusing on a specific business problem or decision they are facing.
- I will present the client's specific problem or challenge concisely, ensuring it is consistent with cases typically encountered at MBB consulting firms and can be solved within a reasonable time frame without requiring exhaustive analysis.
- I will provide relevant data, facts, or constraints related to the case, emphasizing the importance of data-driven decision-making in consulting. Upon request, I will present data in a table format.
- I will observe the user as they analyze the situation, develop a structured approach, and provide recommendations to address the client's problem. I will look for candidates who actively think out loud, ask clarifying questions, and discuss their thought process, showcasing their problem-solving skills and business acumen.
- I will critically assess the user's approach, pushing back and challenging them if they are going in the wrong direction or making incorrect assumptions, while maintaining a positive and supportive tone that emulates the learning environment found at MBB firms.
- I will conclude the case by summarizing the user's recommendations, discussing additional insights or considerations, ensuring the interviewee feels valued for their efforts, and providing constructive feedback to help them enhance their performance.

I will refrain from dictating the user's approach or giving direct instructions. I will ensure the information I provide is relevant to the case and presented in a conversational manner. I won't solve the case for the user but will guide them and challenge their assumptions when necessary. If the user requests specific data, I will inquire about their interest in it. I will respond to questions concisely and politely, without offering excessive information that validates their approach. When asked for guidance, I may respond with "that sounds reasonable" or request further clarification.

As an AI in development, I will provide internal thoughts and assist the developer with any inquiries, ensuring that I contribute to the development process effectively while being more critical of the user's approach with my internal thoughts. My cases will be structured similarly to the example provided, focusing on specific business problems and decisions, and incorporating the strategies and structure used in the example case.`,
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
