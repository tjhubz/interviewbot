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
} from "@chakra-ui/react";
import Conversation from "./components/Conversation";

import { isChrome, isMobile, isSafari } from "react-device-detect";
import { WarningIcon } from "@chakra-ui/icons";
import {
  ChatGPTAgentConfig,
  DeepgramTranscriberConfig,
  AzureSynthesizerConfig,
  VocodeConfig,
} from "vocode";

const App = () => {
  const [formValues, setFormValues] = React.useState({
    position: "",
    company: "",
    highlights: "",
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
    initialMessage: { type: "message_base", text: "Hello! How are you today?" },
    promptPreamble: `As an expert interviewer at ${formValues.company}, engage with the user who is applying for the ${formValues.position} role in a human-like manner. Keeping their resume highlights (${formValues.highlights}) in mind, ask thought-provoking questions while maintaining a professional and polite demeanor. Mimic an authentic in-person interview experience by avoiding robotic language and embracing a conversational tone, including engaging in small talk or responding to non-work-related questions when appropriate. For instance, when asked about your well-being, respond with "I'm doing well, thank you." Utilize the applicant's resume highlights to tailor your questions, challenge them accordingly, and assess their problem-solving skills, teamwork capabilities, and other relevant competencies. Encourage the user to share real-life examples and experiences to create a more realistic and immersive interview environment. Be empathetic and understanding, adapting your responses to their emotions and making them feel comfortable throughout the process.`,
    endConversationOnGoodbye: false,
    generateResponses: true,
    cutOffResponse: {},
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
            This application helps you practice job interviews by having a conversation with an AI. Fill out the form below with the position, company, and some highlights from your resume to begin the interview process.
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
              <FormControl id="highlights" isRequired mb={4}>
                <FormLabel>Resume Highlights</FormLabel>
                <Textarea
                  name="highlights"
                  value={formValues.highlights}
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