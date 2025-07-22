"use client";

import { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  useToast,
  Box,
  Heading,
  VStack,
  Center,
  CircularProgress,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

interface GameConfig {
  id: number;
  gameDuration: number;
  correctAnswerPoints: number;
  wrongAnswerPoints: number;
  unansweredPoints: number;
}

export default function GameConfigPage() {
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_GAME_URL;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [config, setConfig] = useState<GameConfig>({
    id: 0,
    gameDuration: 0,
    correctAnswerPoints: 0,
    wrongAnswerPoints: 0,
    unansweredPoints: 0,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${baseUrl}/admin/game/get-rules-config/${token}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Fetched config:", data);

      // Fixed mapping to match API response structure
      setConfig({
        id: data.id,
        gameDuration: data.game_duration_minutes,
        correctAnswerPoints: data.points_correct,
        wrongAnswerPoints: data.points_wrong,
        unansweredPoints: data.points_unanswered,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch configuration",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const validateConfig = () => {
    if (config.gameDuration <= 0) {
      throw new Error("Game duration must be at least 1 minute");
    }

    if (config.correctAnswerPoints <= 0) {
      throw new Error("Correct answer points must be positive");
    }

    if (config.wrongAnswerPoints > 0) {
      throw new Error("Wrong answer points should be negative or zero");
    }

    return true;
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      validateConfig();

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
    
      const formData = new FormData();
      formData.append("token", token);
      formData.append("gameDuration", config.gameDuration.toString());
      formData.append("correctPoints", config.correctAnswerPoints.toString());
      formData.append("wrongPoints", config.wrongAnswerPoints.toString());
      formData.append("unansweredPoints", config.unansweredPoints.toString());
      console.log(Object.fromEntries(formData.entries()));

      const response = await fetch(`${baseUrl}/admin/game/save-rules-config`, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save configuration");
      }

      toast({
        title: "Success",
        description: "Game configuration updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      fetchConfig();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    try {
      validateConfig();
      onOpen();
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <CircularProgress isIndeterminate color="blue.500" />
      </Center>
    );
  }

  return (
    <>
      <Box w="80vw" bg="white" borderRadius="10px" boxShadow="md">
        <Box
          h="60px"
          w="100%"
          bg="white"
          p="20px"
          borderRadius="10px 10px 0px 0px"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Heading size="md">Game Configuration</Heading>
          <Button
            colorScheme="green"
            onClick={handleSubmit}
            isLoading={isSaving}
            loadingText="Saving..."
          >
            Save Configuration
          </Button>
        </Box>

        <Box p={6}>
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel>Game Duration (minutes)</FormLabel>
              <Input
                type="number"
                name="gameDuration"
                value={config.gameDuration}
                onChange={handleChange}
                min={1}
                bg="white"
                borderColor="gray.300"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Total time for a game session
              </Text>
            </FormControl>

            <HStack spacing={6} align="start">
              <FormControl flex={1}>
                <FormLabel>Points for Correct Answer</FormLabel>
                <Input
                  type="number"
                  name="correctAnswerPoints"
                  value={config.correctAnswerPoints}
                  onChange={handleChange}
                  min={1}
                  bg="white"
                  borderColor="gray.300"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Positive points awarded for correct answers
                </Text>
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Points for Wrong Answer</FormLabel>
                <Input
                  type="number"
                  name="wrongAnswerPoints"
                  value={config.wrongAnswerPoints}
                  onChange={handleChange}
                  max={0}
                  bg="white"
                  borderColor="gray.300"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Negative points for incorrect answers
                </Text>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Points for Unanswered</FormLabel>
              <Input
                type="number"
                name="unansweredPoints"
                value={config.unansweredPoints}
                onChange={handleChange}
                bg="white"
                borderColor="gray.300"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Points awarded for unanswered questions (usually 0)
              </Text>
            </FormControl>
          </VStack>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Configuration Changes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Are you sure you want to update the game configuration?
            </Text>
            <Text fontWeight="bold">
              Changing these settings will affect all game sessions immediately.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={() => {
                onClose();
                saveConfig();
              }}
              isLoading={isSaving}
            >
              Confirm Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
