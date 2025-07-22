// app/admin/currency-config/page.tsx
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

interface CurrencyConfig {
  id: number;
  currencyName: string;
  currencyMin: number;
  currencyMax: number;
  signupAllocation: number;
  spentPerGame: number;
  winnerBuyback: number;
  lowBalanceThreshold: number;
  rechargeAmount: number;
  rechargeQuantity: number;
  referralAward: number;
}

export default function CurrencyConfigPage() {
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_GAME_URL;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [config, setConfig] = useState<CurrencyConfig>({
    id: 0,
    currencyName: "",
    currencyMin: 0,
    currencyMax: 0,
    signupAllocation: 0,
    spentPerGame: 0,
    winnerBuyback: 0,
    lowBalanceThreshold: 0,
    rechargeAmount: 0,
    rechargeQuantity: 0,
    referralAward: 0,
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
        `${baseUrl}/admin/game/get-currency-config/${token}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Fetched config:", data);

      // Map API response to state
      setConfig({
        id: data.id,
        currencyName: data.currency_name,
        currencyMin: data.currency_min,
        currencyMax: data.currency_max,
        signupAllocation: data.currency_allocated_at_signup,
        spentPerGame: data.currency_spent_per_game,
        winnerBuyback: data.winners_currency_buy_back,
        lowBalanceThreshold: data.player_drop_level_to_prompt_buy,
        rechargeAmount: data.recharge_rupees,
        rechargeQuantity: data.recharge_currency,
        referralAward: data.referral_signup_reward,
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
      [name]: name === "currencyName" ? value : Number(value),
    }));
  };

  const validateConfig = () => {
    if (config.currencyMin < 0) {
      throw new Error("Currency Min cannot be negative");
    }

    if (config.currencyMax <= config.currencyMin) {
      throw new Error("Currency Max must be greater than Min");
    }

    if (config.winnerBuyback > config.spentPerGame) {
      throw new Error("Winner buyback cannot exceed spent per game");
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
      formData.append("currencyName", config.currencyName);
      formData.append("currencyMin", config.currencyMin.toString());
      formData.append("currencyMax", config.currencyMax.toString());
      formData.append(
        "currencyAllocatedAtSignup",
        config.signupAllocation.toString()
      );
      formData.append("currencySpentPerGame", config.spentPerGame.toString());
      formData.append(
        "winnersCurrencyBuyBack",
        config.winnerBuyback.toString()
      );
      formData.append(
        "playerDropLevelToPromptBuy",
        config.lowBalanceThreshold.toString()
      );
      formData.append("rechargeRupees", config.rechargeAmount.toString());
      formData.append("rechargeCurrency", config.rechargeQuantity.toString());
      formData.append("referralSignupReward", config.referralAward.toString());
      console.log(Object.fromEntries(formData.entries()));

      const response = await fetch(
        `${baseUrl}/admin/game/save-currency-config`,
        {
          method: "POST",
          body: formData,
        }
      );
      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save configuration");
      }

      toast({
        title: "Success",
        description: "Currency configuration updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh config after update
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
      onOpen(); // Open confirmation modal
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
          <Heading size="md">Currency Configuration</Heading>
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
              <FormLabel>Currency Name</FormLabel>
              <Input
                name="currencyName"
                value={config.currencyName}
                onChange={handleChange}
                bg="white"
                borderColor="gray.300"
              />
            </FormControl>

            <HStack spacing={6} align="start">
              <FormControl flex={1}>
                <FormLabel>Currency Min (ml)</FormLabel>
                <Input
                  type="number"
                  name="currencyMin"
                  value={config.currencyMin}
                  onChange={handleChange}
                  min={0}
                  bg="white"
                  borderColor="gray.300"
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Currency Max (ml)</FormLabel>
                <Input
                  type="number"
                  name="currencyMax"
                  value={config.currencyMax}
                  onChange={handleChange}
                  min={config.currencyMin + 1}
                  bg="white"
                  borderColor="gray.300"
                />
              </FormControl>
            </HStack>

            <HStack spacing={6} align="start">
              <FormControl flex={1}>
                <FormLabel>Allocated at Signup (ml)</FormLabel>
                <Input
                  type="number"
                  name="signupAllocation"
                  value={config.signupAllocation}
                  onChange={handleChange}
                  min={0}
                  max={config.currencyMax}
                  bg="white"
                  borderColor="gray.300"
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Spent Per Game (ml)</FormLabel>
                <Input
                  type="number"
                  name="spentPerGame"
                  value={config.spentPerGame}
                  onChange={handleChange}
                  min={1}
                  bg="white"
                  borderColor="gray.300"
                />
              </FormControl>
            </HStack>

            <HStack spacing={6} align="start">
              <FormControl flex={1}>
                <FormLabel>Winner Buyback (ml)</FormLabel>
                <Input
                  type="number"
                  name="winnerBuyback"
                  value={config.winnerBuyback}
                  onChange={handleChange}
                  min={0}
                  max={config.spentPerGame}
                  bg="white"
                  borderColor="gray.300"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Cannot exceed Spent Per Game
                </Text>
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Low Balance Threshold (ml)</FormLabel>
                <Input
                  type="number"
                  name="lowBalanceThreshold"
                  value={config.lowBalanceThreshold}
                  onChange={handleChange}
                  min={1}
                  bg="white"
                  borderColor="gray.300"
                />
              </FormControl>
            </HStack>

            <HStack spacing={6} align="start">
              <FormControl flex={1}>
                <FormLabel>Recharge Amount (₹)</FormLabel>
                <Input
                  type="number"
                  name="rechargeAmount"
                  value={config.rechargeAmount}
                  onChange={handleChange}
                  min={1}
                  bg="white"
                  borderColor="gray.300"
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Recharge Quantity (ml)</FormLabel>
                <Input
                  type="number"
                  name="rechargeQuantity"
                  value={config.rechargeQuantity}
                  onChange={handleChange}
                  min={1}
                  bg="white"
                  borderColor="gray.300"
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Referral Signup Award (ml)</FormLabel>
              <Input
                type="number"
                name="referralAward"
                value={config.referralAward}
                onChange={handleChange}
                min={0}
                bg="white"
                borderColor="gray.300"
              />
            </FormControl>
          </VStack>
        </Box>
      </Box>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Configuration Changes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Are you sure you want to update the currency configuration?
            </Text>
            <Text fontWeight="bold">
              Changing these settings will affect all players immediately.
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
