"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState, useRef } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  useDisclosure,
  useToast,
  Checkbox,
  VStack,
  Box,
  Text,
  Select,
} from "@chakra-ui/react";
import { Spinner, Center } from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Level {
  id: number;
  level_name: string;
  description: string;
  status: number;
  created_admin_user_id: number;
  created_date: string;
}

interface Subject {
  subject_id: number;
  subject_name: string;
  course_id: number;
  course_name: string;
  subject_status: number;
}

interface LevelSubjectMapping {
  id: number;
  level_id: number;
  level_name: string;
  subjects_tagged: number[];
  status: number;
}

const LevelSubjectManagement = () => {
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [token, setToken] = useState<string | null>(null);

  const [levels, setLevels] = useState<Level[]>([]);
  const levelsRef = useRef<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mappings, setMappings] = useState<LevelSubjectMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedMapping, setSelectedMapping] =
    useState<LevelSubjectMapping | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [autoTagEnabled, setAutoTagEnabled] = useState(true);

  const {
    isOpen: isMappingModalOpen,
    onOpen: onMappingModalOpen,
    onClose: onMappingModalClose,
  } = useDisclosure();

  // Update ref when levels change
  useEffect(() => {
    levelsRef.current = levels;
  }, [levels]);

  // Get token on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // Fetch levels from API
  const fetchLevels = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${baseUrl}/admin/game/get-all-levels/${token}`
      );
      if (!response.ok) throw new Error("Failed to fetch levels");
      const data = await response.json();
      setLevels(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch levels",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch subjects from API
  const fetchSubjects = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${baseUrl}/masters/subjects/get-all-subjects/${token}`
      );
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch mappings
  const fetchMappings = async () => {
    if (!token) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const dummyMappings: LevelSubjectMapping[] = [];
      setMappings(dummyMappings);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch level-subject mappings",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      await Promise.all([fetchLevels(), fetchSubjects(), fetchMappings()]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const handleAddMapping = () => {
    setSelectedMapping(null);
    setSelectedLevel(null);
    setSelectedSubjects([]);
    onMappingModalOpen();
  };

  const handleEditMapping = (mapping: LevelSubjectMapping) => {
    // Use ref to get current levels instead of state
    const currentLevels = levelsRef.current;
    const level = currentLevels.find((l) => l.id === mapping.level_id);

    if (!level) {
      toast({
        title: "Error",
        description: "Level not found in current data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSelectedMapping(mapping);
    setSelectedLevel(level);
    setSelectedSubjects(mapping.subjects_tagged);
    onMappingModalOpen();
  };

  const toggleSubjectSelection = (subjectId: number) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  // Get subjects from previous level only
  const getSubjectsFromPreviousLevels = (levelId: number): number[] => {
    const currentLevelIndex = levels.findIndex((l) => l.id === levelId);
    if (currentLevelIndex <= 0) return [];

    const previousLevels = levels.slice(0, currentLevelIndex);
    const previousSubjects = new Set<number>();

    previousLevels.forEach((level) => {
      const mapping = mappings.find((m) => m.level_id === level.id);
      if (mapping) {
        mapping.subjects_tagged.forEach((subjectId) =>
          previousSubjects.add(subjectId)
        );
      }
    });

    return Array.from(previousSubjects);
  };

  // Handle level selection change
  const handleLevelChange = (levelId: number) => {
    const currentLevels = levelsRef.current;
    const level = currentLevels.find((l) => l.id === levelId);
    setSelectedLevel(level || null);

    if (selectedMapping) {
      setSelectedSubjects(selectedMapping.subjects_tagged);
    } else {
      const previousLevelSubjects = getSubjectsFromPreviousLevels(levelId);
      setSelectedSubjects(previousLevelSubjects);
    }
  };

  // Save mapping
  const handleSaveMapping = async () => {
    if (!selectedLevel) {
      toast({
        title: "Error",
        description: "Please select a level first",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newMappings = [...mappings];
      const existingIndex = newMappings.findIndex(
        (m) => m.level_id === selectedLevel.id
      );

      if (existingIndex >= 0) {
        newMappings[existingIndex] = {
          ...newMappings[existingIndex],
          level_name: selectedLevel.level_name,
          subjects_tagged: [...selectedSubjects],
        };
      } else {
        newMappings.push({
          id: Date.now(),
          level_id: selectedLevel.id,
          level_name: selectedLevel.level_name,
          subjects_tagged: [...selectedSubjects],
          status: 1,
        });
      }

      setMappings(newMappings);

      toast({
        title: "Success",
        description: "Subject mapping updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onMappingModalClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the mapping",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle mapping status
  const handleToggleMappingStatus = async (
    mappingId: number,
    currentStatus: number
  ) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newStatus = currentStatus === 1 ? 0 : 1;

      setMappings((prev) =>
        prev.map((mapping) =>
          mapping.id === mappingId ? { ...mapping, status: newStatus } : mapping
        )
      );

      toast({
        title: "Success",
        description: "Mapping status updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubjectNames = (subjectIds: number[]) => {
      if (subjectIds.length === 0) return "No subjects tagged";
      console.log("subjectIds", subjectIds);
      console.log("subjects", subjects);

    return subjects
      .filter((subject) => subjectIds.includes(subject.subject_id))
      .map((subject) => subject.subject_name)
      .join(", ");
  };

  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "Sl. No",
      field: "id",
      maxWidth: 80,
      filter: false,
      suppressAutoSize: true,
      cellRenderer: (params: any) => params.node.rowIndex + 1,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Level Name",
      field: "level_name",
    },
    {
      headerName: "Subjects",
      field: "subjects_tagged",
      flex: 3,
      cellRenderer: (params: any) => getSubjectNames(params.value),
    },
    {
      headerName: "Status",
      field: "status",
      maxWidth: 120,
      cellRenderer: (params: any) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Switch
            colorScheme="green"
            isChecked={params.value === 1}
            onChange={() =>
              handleToggleMappingStatus(params.data.id, params.value)
            }
          />
        </div>
      ),
    },
    {
      headerName: "Actions",
      field: "actions",
      maxWidth: 150,
      cellRenderer: (params: any) => (
        <HStack spacing={2}>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={() => handleEditMapping(params.data)}
            variant="outline"
          >
            Edit
          </Button>
        </HStack>
      ),
    },
  ]);

  return (
    <div style={{ width: "80vw", height: "60vh" }}>
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>
          Level-Subject Management
        </p>
        <Button colorScheme="green" size="sm" onClick={handleAddMapping}>
          Add New Mapping
        </Button>
      </div>

      <div style={{ height: "100%", width: "100%", position: "relative" }}>
        {loading && (
          <Center
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="whiteAlpha.700"
            zIndex={10}
          >
            <Spinner size="xl" />
          </Center>
        )}
        <AgGridReact
          rowData={mappings}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[5, 10, 20, 30]}
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

      {/* Mapping Modal */}
      <Modal
        isOpen={isMappingModalOpen}
        onClose={onMappingModalClose}
        size="xl"
        onCloseComplete={() => {
          setSelectedLevel(null);
          setSelectedMapping(null);
          setSelectedSubjects([]);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedMapping
              ? `Edit Subjects for ${selectedMapping.level_name}`
              : "Add New Level-Subject Mapping"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Select Level</FormLabel>
                <Select
                  placeholder="Select a level"
                  value={selectedLevel?.id || ""}
                  onChange={(e) => handleLevelChange(parseInt(e.target.value))}
                >
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.level_name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {selectedLevel && (
                <>
                  <Box>
                    <Text>Level Description:</Text>
                    <Text>{selectedLevel.description}</Text>
                  </Box>

                  <FormControl>
                    <FormLabel>Select Subjects</FormLabel>
                    <Box
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      p={4}
                      maxH="300px"
                      overflowY="auto"
                    >
                      <VStack align="start" spacing={2}>
                        {subjects.map((subject) => (
                          <Checkbox
                            key={subject.subject_id}
                            isChecked={selectedSubjects.includes(
                              subject.subject_id
                            )}
                            onChange={() =>
                              toggleSubjectSelection(subject.subject_id)
                            }
                          >
                            {subject.subject_name} ({subject.course_name})
                          </Checkbox>
                        ))}
                      </VStack>
                    </Box>
                  </FormControl>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onMappingModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSaveMapping}
              isLoading={loading}
              isDisabled={!selectedLevel || selectedSubjects.length === 0}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default LevelSubjectManagement;
