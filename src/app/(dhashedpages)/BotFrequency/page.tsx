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

interface BotConfig {
  maxGlobal: number;
  maxPerUser: number;
  resetDays: number;
}

export default function BotFrequencyConfigPage() {
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_GAME_URL;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [config, setConfig] = useState<BotConfig>({
    maxGlobal: 0,
    maxPerUser: 0,
    resetDays: 0,
  });

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line
  }, []);

  async function fetchConfig() {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${baseUrl}/admin/game/get-bot-config/${token}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.errFlag)
        throw new Error(data.message || "Failed to fetch config");

      setConfig({
        maxGlobal: data.max_global_assignments ?? 0,
        maxPerUser: data.max_per_user_assignments ?? 0,
        resetDays: data.reset_duration_days ?? 0,
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
    if (config.maxGlobal <= 0) {
      throw new Error("Max global assignments must be greater than 0");
    }
    if (config.maxPerUser <= 0) {
      throw new Error("Max per user assignments must be greater than 0");
    }
    if (config.resetDays <= 0) {
      throw new Error("Reset duration (days) must be greater than 0");
    }
    return true;
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      validateConfig();

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const formData = new FormData();
      formData.append("token", token);
      formData.append("maxGlobal", config.maxGlobal.toString());
      formData.append("maxPerUser", config.maxPerUser.toString());
      formData.append("resetDays", config.resetDays.toString());

      const response = await fetch(`${baseUrl}/admin/game/save-bot-config`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.errFlag) {
        throw new Error(data.message || "Failed to save configuration");
      }

      toast({
        title: "Success",
        description: "Bot assignment configuration updated successfully",
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
          <Heading size="md">Bot Assignment Frequency Configuration</Heading>
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
              <FormLabel>Max Global Assignments</FormLabel>
              <Input
                type="number"
                name="maxGlobal"
                value={config.maxGlobal}
                onChange={handleChange}
                min={1}
                bg="white"
                borderColor="gray.300"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Maximum number of bot assignments allowed globally.
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Max Assignments Per User</FormLabel>
              <Input
                type="number"
                name="maxPerUser"
                value={config.maxPerUser}
                onChange={handleChange}
                min={1}
                bg="white"
                borderColor="gray.300"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Maximum number of bot assignments allowed per user.
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Reset Duration (days)</FormLabel>
              <Input
                type="number"
                name="resetDays"
                value={config.resetDays}
                onChange={handleChange}
                min={1}
                bg="white"
                borderColor="gray.300"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Number of days after which the assignment count resets.
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
              Are you sure you want to update the bot assignment configuration?
            </Text>
            <Text fontWeight="bold">
              Changing these settings will affect all bot assignments
              immediately.
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
