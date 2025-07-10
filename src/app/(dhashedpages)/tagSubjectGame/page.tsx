"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
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
  status: number; // Added status field
}

const LevelSubjectManagement = () => {
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = localStorage.getItem("token");

  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mappings, setMappings] = useState<LevelSubjectMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [autoTagEnabled, setAutoTagEnabled] = useState(true);

  const {
    isOpen: isMappingModalOpen,
    onOpen: onMappingModalOpen,
    onClose: onMappingModalClose,
  } = useDisclosure();

  // Fetch levels from API
  const fetchLevels = async () => {
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

  // Fetch mappings (using dummy data for now)
  const fetchMappings = async () => {
    try {
      // Simulate API call with dummy data
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Using dummy data with status field
      const dummyMappings: LevelSubjectMapping[] = [
        
      ];

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
    fetchAllData();
  }, []);

  const handleAddMapping = () => {
    setSelectedLevel(null);
    setSelectedSubjects([]);
    onMappingModalOpen();
  };

  const handleEditMapping = (mapping: LevelSubjectMapping) => {
    const level = levels.find((l) => l.id === mapping.level_id);
    setSelectedLevel(level || null);
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

  // Get subjects from lower levels
  const getSubjectsFromLowerLevels = (levelId: number): number[] => {
    const currentLevelIndex = levels.findIndex((l) => l.id === levelId);
    if (currentLevelIndex <= 0) return [];

    const lowerLevelSubjects = new Set<number>();

    // Get all subjects from levels below the current one
    for (let i = 0; i < currentLevelIndex; i++) {
      const lowerLevel = levels[i];
      const mapping = mappings.find((m) => m.level_id === lowerLevel.id);
      if (mapping) {
        mapping.subjects_tagged.forEach((subjectId) =>
          lowerLevelSubjects.add(subjectId)
        );
      }
    }

    return Array.from(lowerLevelSubjects);
  };

  // Handle level selection change
  const handleLevelChange = (levelId: number) => {
    const level = levels.find((l) => l.id === levelId);
    setSelectedLevel(level || null);

    // Find existing mappings for this level
    const levelMapping = mappings.find((m) => m.level_id === levelId);

    // Get subjects from lower levels if auto-tag is enabled
    const lowerLevelSubjects = autoTagEnabled
      ? getSubjectsFromLowerLevels(levelId)
      : [];

    // Combine existing mappings with lower level subjects
    const combinedSubjects = Array.from(
      new Set([...(levelMapping?.subjects_tagged || []), ...lowerLevelSubjects])
    );

    setSelectedSubjects(combinedSubjects);
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
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update existing mapping or create new one
      const newMappings = [...mappings];
      const existingIndex = newMappings.findIndex(
        (m) => m.level_id === selectedLevel.id
      );

      if (existingIndex >= 0) {
        newMappings[existingIndex] = {
          ...newMappings[existingIndex],
          subjects_tagged: [...selectedSubjects],
        };
      } else {
        newMappings.push({
          id: Date.now(),
          level_id: selectedLevel.id,
          level_name: selectedLevel.level_name,
          subjects_tagged: [...selectedSubjects],
          status: 1, // Default status for new mappings
        });
      }

      // If auto-tag is enabled, propagate subjects to higher levels
      if (autoTagEnabled) {
        const currentLevelIndex = levels.findIndex(
          (l) => l.id === selectedLevel.id
        );
        if (currentLevelIndex >= 0) {
          for (let i = currentLevelIndex + 1; i < levels.length; i++) {
            const higherLevel = levels[i];
            const higherLevelIndex = newMappings.findIndex(
              (m) => m.level_id === higherLevel.id
            );

            if (higherLevelIndex >= 0) {
              // Merge existing subjects with new ones (avoid duplicates)
              const mergedSubjects = Array.from(
                new Set([
                  ...newMappings[higherLevelIndex].subjects_tagged,
                  ...selectedSubjects,
                ])
              );

              newMappings[higherLevelIndex] = {
                ...newMappings[higherLevelIndex],
                subjects_tagged: [...mergedSubjects],
              };
            } else {
              newMappings.push({
                id: Date.now() + i,
                level_id: higherLevel.id,
                level_name: higherLevel.level_name,
                subjects_tagged: [...selectedSubjects],
                status: 1, // Default status for new mappings
              });
            }
          }
        }
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

      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={mappings} // Now showing mappings data instead of levels
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
          setSelectedSubjects([]);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedLevel
              ? `Edit Subjects for ${selectedLevel.level_name}`
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
                    <Text fontWeight="bold">Description:</Text>
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

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Auto-tag to higher levels</FormLabel>
                    <Switch
                      isChecked={autoTagEnabled}
                      onChange={() => setAutoTagEnabled(!autoTagEnabled)}
                      colorScheme="green"
                    />
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

      {loading && (
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

export default LevelSubjectManagement;
