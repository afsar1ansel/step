"use client";

import React, { useState, useRef } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  Center,
  Spinner,
  Box,
  Text,
  Input,
  VStack,
  Icon,
} from "@chakra-ui/react";

import { LuArrowUpDown } from "react-icons/lu";
import { FiUpload } from "react-icons/fi";

const AdminUsers = () => {
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [loading, setLoading] = useState(false); // For loading bot list
  const [isUploading, setIsUploading] = useState(false); // For CSV upload status
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  // --- Assume you will fetch bot profiles and store them in a state ---
  // Example: const [bots, setBots] = useState([]);
  // For this example, we'll assume the list is empty to show the placeholder.
  const bots: any[] = [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file only.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("token", localStorage.getItem("token") || "");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${baseUrl}/api/admin/game/upload-bots-csv`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      console.log(result);

      if (!response.ok) throw new Error(result.message || "Upload failed");

      toast({
        title: "Upload Successful",
        description: "Bot profiles have been successfully uploaded.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onAddModalClose();
      // Optionally refresh bot list here: fetchBots();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred during upload.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Box w="100%" h="auto" p={{ base: 4, md: 8 }}>
      {/* Main Content Area */}
      <VStack spacing={6} textAlign="center">
        <Text fontSize={{ base: "xl", md: "3xl" }} fontWeight="bold">
          Bot Profiles Management
        </Text>
        <Text color="gray.600" maxW="2xl">
          Here you can manage all the bot profiles used within the game. To add
          new bots in bulk, please upload a CSV file with the required columns
          and data.
        </Text>
        <Button
          onClick={onAddModalOpen}
          colorScheme="green"
          size="lg"
          leftIcon={<FiUpload />}
        >
          Add New BOT
        </Button>
      </VStack>

      <Box mt={12}>
        {/* Conditional rendering for the bot list */}
        {bots.length === 0 && !loading ? (
          <Center
            p={10}
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="md"
            bg="gray.50"
          >
            <Text color="gray.500">
              No bot profiles found. Upload a CSV to get started!
            </Text>
          </Center>
        ) : (
          <Box>{/* Your bot list/table component will go here */}</Box>
        )}
      </Box>

      {/* Upload Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Bot Profiles CSV</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>CSV File</FormLabel>
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                p={6}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: "green.400", bg: "gray.50" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Input
                  type="file"
                  accept=".csv"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <VStack spacing={3}>
                  {selectedFile ? (
                    <Text fontWeight="bold" color="green.600">
                      {selectedFile.name}
                    </Text>
                  ) : (
                    <>
                      <Icon as={LuArrowUpDown} boxSize={8} color="gray.400" />
                      <Text color="gray.500">
                        Click to select or drag and drop
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        CSV files only
                      </Text>
                    </>
                  )}
                </VStack>
              </Box>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={onAddModalClose}
              isDisabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading..."
              isDisabled={!selectedFile}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Loading Overlay for fetching bot list */}
      {loading && (
        <Center
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg="rgba(255, 255, 255, 0.7)"
          zIndex={10}
        >
          <Spinner
            size="xl"
            color="blue.500"
            thickness="4px"
            emptyColor="gray.200"
            speed="0.65s"
          />
        </Center>
      )}
    </Box>
  );
};

export default AdminUsers;
