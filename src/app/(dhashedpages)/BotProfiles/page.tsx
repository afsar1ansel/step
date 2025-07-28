"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { FiUpload } from "react-icons/fi";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  useDisclosure,
  useToast,
  Spinner,
  Center,
  Text,
  Box,
  Icon,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const Bots = () => {
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_GAME_URL;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/admin/game/get-all-bots/${token}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      console.log(data);
      setRowData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bot data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  const [rowData, setRowData] = useState<any[]>();

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "Sl. No",
      maxWidth: 80,
      filter: false,
      suppressAutoSize: true,
      cellRenderer: (params: any) => {
        return params.node.rowIndex + 1;
      },
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Bot Name",
      field: "bot_name",
      minWidth: 180,
    },
    {
      headerName: "Gender",
      field: "gender",
      filter: false,

      maxWidth: 120,
    },
    {
      headerName: "College Name",
      field: "college_name",
      minWidth: 250,
    },
    {
      headerName: "Difficulty Group",
      field: "difficulty_group",
      filter: false,
    },
    {
      headerName: "Accuracy",
      field: "accuracy_percent",
      filter: false,

      cellRenderer: (params: any) => `${params.value}%`,
      cellStyle: { textAlign: "center" },
    },
    {
      field: "status",
      headerName: "Status",
      filter: false,
      maxWidth: 150,
      cellRenderer: (params: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Switch
            colorScheme="green"
            onChange={() => handleToggle(params.data)}
            defaultChecked={params.value === 1}
            isDisabled={toggleLoadingId === params.data.id}
          >
            {toggleLoadingId === params.data.id && <Spinner size="xs" />}
          </Switch>
        </div>
      ),
    },
    {
      headerName: "Creation date",
      field: "created_date",
    },
    {
      headerName: "Actions",
      filter: false,
      cellRenderer: (params: any) => {
        return (
          <HStack spacing={2}>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => handleEdit(params.data)}
              variant="outline"
              isDisabled={editBtnLoadingId === params.data.id}
            >
              {editBtnLoadingId === params.data.id ? (
                <HStack>
                  <Spinner size="xs" /> <span>Loading...</span>
                </HStack>
              ) : (
                "Edit"
              )}
            </Button>
          </HStack>
        );
      },
    },
  ]);

  // State for button/action loading indicators
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);
  const [uploadBtnLoading, setUploadBtnLoading] = useState(false);
  const [editBtnLoadingId, setEditBtnLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Toggle function for the status switch
  const handleToggle = async (data: any) => {
    setToggleLoadingId(data.id);
    try {
      const token = localStorage.getItem("token") ?? "";
      const status = data.status === 1 ? 0 : 1;
      const response = await fetch(
        `${baseUrl}/admin/game/change-bot-status/${data.id}/${status}/${token}`,
        {
          method: "GET",
        }
      );

      console.log(
        `${baseUrl}/admin/game/change-bot-status/${data.id}/${status}/${token}`
      );
      const responseData = await response.json();
      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: "Bot status updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchData();
      } else {
        throw new Error(responseData.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling bot status:", error);
      toast({
        title: "Error",
        description: "Could not update bot status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setToggleLoadingId(null);
    }
  };

  // State and handlers for Upload CSV Modal
  const {
    isOpen: isUploadModalOpen,
    onOpen: onUploadModalOpen,
    onClose: onUploadModalClose,
  } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State and handlers for Edit Bot Modal
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  // Form state for editing
  const [botId, setBotId] = useState("");
  const [botName, setBotName] = useState("");
  const [gender, setGender] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [difficultyGroup, setDifficultyGroup] = useState("");
  const [accuracyPercent, setAccuracyPercent] = useState<number>(0);

  const resetForm = () => {
    setBotId("");
    setBotName("");
    setGender("");
    setCollegeName("");
    setDifficultyGroup("");
    setAccuracyPercent(0);
  };

  const handleCsvUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploadBtnLoading(true);
    try {
      const token = localStorage.getItem("token") ?? "";
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("token", token);

      const response = await fetch(`${baseUrl}/admin/game/upload-bots-csv`, {
        method: "POST",
        body: formData,
      });
      const responseData = await response.json();

      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: "Bots uploaded successfully from CSV.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchData();
        onUploadModalClose();
        setSelectedFile(null);
      } else {
        toast({
          title: "Upload Failed",
          description: responseData.message || "Could not upload the file.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during the upload.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadBtnLoading(false);
    }
  };

  const handleEdit = (data: any) => {
    setEditBtnLoadingId(data.id);
    setBotId(data.id);
    setBotName(data.bot_name);
    setGender(data.gender);
    setCollegeName(data.college_name);
    setDifficultyGroup(data.difficulty_group);
    setAccuracyPercent(parseInt(data.accuracy_percent, 10) || 0);
    onEditModalOpen();
    setTimeout(() => setEditBtnLoadingId(null), 500);
  };

  const handleUpdateBot = async () => {
    setLoading(true);
    try {
      // token, botId, name, gender, college, difficulty, accuracy;
      const token = localStorage.getItem("token") ?? "";

      const form = new FormData();
      form.append("botId", botId);
      form.append("name", botName);
      form.append("gender", gender);
      form.append("college", collegeName);
      form.append("difficulty", difficultyGroup);
      form.append("accuracy", accuracyPercent.toString());
      form.append("token", token);

      const response = await fetch(`${baseUrl}/admin/game/update-bot-profile`, {
        method: "POST",
        body: form,
      });
      const responseData = await response.json();

      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: "Bot updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchData();
        resetForm();
        onEditModalClose();
      } else {
        toast({
          title: "Error",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", height: "auto", position: "relative" }}>
      <div
        style={{
          height: "60px",
          width: "100%",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px 10px 0px 0px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Manage Bots</p>
        <Button
          onClick={onUploadModalOpen}
          colorScheme="green"
          isDisabled={uploadBtnLoading}
        >
          {uploadBtnLoading ? (
            <HStack>
              <Spinner size="xs" /> <span>Uploading...</span>
            </HStack>
          ) : (
            "Upload Bots (CSV)"
          )}
        </Button>
      </div>
      <div
        className="ag-theme-quartz"
        style={{ height: "auto", width: "100%" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={false}
          defaultColDef={{
            sortable: true,
            filter: true,
            floatingFilter: true,
            resizable: true,
            flex: 1,
            filterParams: {
              debounceMs: 0,
              buttons: ["reset"],
            },
          }}
          domLayout="autoHeight"
          suppressCellFocus={true}
        />
      </div>

      {/* Upload CSV Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          onUploadModalClose();
          setSelectedFile(null);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Bots via CSV</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>CSV File</FormLabel>

              <Box
              w={"200px"}
              minH={"200px"}
                // borderWidth="2px"
                // borderStyle="dashed"
                // borderColor="gray.300"
                // borderRadius="md"
                border={"2px dashed gray.300"}
                p={6}
                textAlign="center"
                // _hover={{ borderColor: "gray.500" }}
                cursor="pointer"
                as="label"
                htmlFor="csv-upload-input"
              >
                <Center flexDirection="column" gap={2}>
                  <Icon as={FiUpload} boxSize={8} color="gray.500" />
                  <Text fontSize="sm" color="gray.500">
                    {selectedFile
                      ? "Replace file"
                      : "Click to upload or drag CSV here"}
                  </Text>
                  {selectedFile && (
                    <Text fontSize="sm" mt={2} color="green.600">
                      ✅ {selectedFile.name}
                    </Text>
                  )}
                </Center>
              </Box>

              <Input
                type="file"
                id="csv-upload-input"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                }}
                display="none"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={() => {
                onUploadModalClose();
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleCsvUpload}
              isLoading={uploadBtnLoading}
              isDisabled={!selectedFile || uploadBtnLoading}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Bot Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          onEditModalClose();
          resetForm();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Bot</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Bot Name</FormLabel>
              <Input
                placeholder="Enter Bot Name"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Gender</FormLabel>
              <Select
                placeholder="Select gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Girl">Girl</option>
                <option value="Boy">Boy</option>
              </Select>
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>College Name</FormLabel>
              <Input
                placeholder="Enter College Name"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Difficulty Group</FormLabel>
              <Input
                placeholder="e.g., Group 1"
                value={difficultyGroup}
                onChange={(e) => setDifficultyGroup(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Accuracy Percent</FormLabel>
              <Input
                type="number"
                placeholder="Enter Accuracy (0-100)"
                value={accuracyPercent}
                onChange={(e) =>
                  setAccuracyPercent(parseInt(e.target.value, 10) || 0)
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleUpdateBot}
              isLoading={loading}
              isDisabled={loading}
            >
              {loading ? (
                <HStack>
                  <Spinner size="xs" /> <span>Updating...</span>
                </HStack>
              ) : (
                "Update"
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {loading && !rowData && (
        <Center
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
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
    </div>
  );
};

export default Bots;
