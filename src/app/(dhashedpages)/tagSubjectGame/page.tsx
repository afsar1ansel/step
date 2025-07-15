"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState, useRef, useMemo } from "react";
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
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { Spinner, Center } from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Level {
  id: number;
  level_name: string;
  description: string;
  priority: number;
  status: number;
  course_id: number;
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
  priority: number;
  level_description: string;
  subjects_tagged: number[];
  status: number;
}

const LevelSubjectManagement = () => {
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_GAME_URL;
  const [token, setToken] = useState<string | null>(null);

  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mappings, setMappings] = useState<LevelSubjectMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedMapping, setSelectedMapping] =
    useState<LevelSubjectMapping | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [canMapLevel, setCanMapLevel] = useState(true);
  const [previousLevelError, setPreviousLevelError] = useState("");

  const {
    isOpen: isMappingModalOpen,
    onOpen: onMappingModalOpen,
    onClose: onMappingModalClose,
  } = useDisclosure();

  // Get token on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // Fetch levels from API
  const fetchLevels = async () => {
    if (!token) {
      console.log("No token available for fetchLevels");
      return;
    }

    try {
      console.log("Fetching levels with token:", token);
      const response = await fetch(
        `${baseUrl}/admin/game/levels/get-all/${token}`
      );

      console.log("Levels response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch levels: ${response.status}`);
      }

      const data = await response.json();
      console.log("Levels API response:", data);

      if (data.errFlag === 0) {
        console.log("Setting levels:", data.data);
        setLevels(data.data || []);
        return data.data || [];
      } else {
        throw new Error(data.message || "Failed to fetch levels");
      }
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast({
        title: "Error",
        description: "Failed to fetch levels",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return [];
    }
  };

  // Fetch subjects from API
  const fetchSubjects = async () => {
    if (!token) {
      console.log("No token available for fetchSubjects");
      return;
    }

    try {
      console.log("Fetching subjects with token:", token);
      const response = await fetch(
        `${baseUrl}/admin/game/subjects/get-all/${token}`
      );

      console.log("Subjects response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch subjects: ${response.status}`);
      }

      const data = await response.json();
      console.log("Subjects API response:", data);

      if (data.errFlag === 0) {
        console.log("Setting subjects:", data.data);
        setSubjects(data.data || []);
        return data.data || [];
      } else {
        throw new Error(data.message || "Failed to fetch subjects");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return [];
    }
  };

  // Fetch mappings from API
  const fetchMappings = async () => {
    if (!token) {
      console.log("No token available for fetchMappings");
      return;
    }

    try {
      console.log("Fetching mappings with token:", token);
      const response = await fetch(
        `${baseUrl}/admin/game/mappings/get-all/${token}`
      );

      console.log("Mappings response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch mappings: ${response.status}`);
      }

      const data = await response.json();
      console.log("Mappings API response:", data);

      if (data.errFlag === 0) {
        console.log("Setting mappings:", data.data);
        setMappings(data.data || []);
        return data.data || [];
      } else {
        throw new Error(data.message || "Failed to fetch mappings");
      }
    } catch (error) {
      console.error("Error fetching mappings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch level-subject mappings",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return [];
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    if (!token) {
      console.log("No token available for fetchAllData");
      return;
    }

    setLoading(true);
    try {
      console.log("Starting to fetch all data with token:", token);

      // Fetch all data in parallel
      const [levelsData, subjectsData, mappingsData] = await Promise.all([
        fetchLevels(),
        fetchSubjects(),
        fetchMappings(),
      ]);

      console.log("All data fetched successfully");
      console.log(
        "Final state - Levels:",
        levelsData?.length,
        "Subjects:",
        subjectsData?.length,
        "Mappings:",
        mappingsData?.length
      );
    } catch (error) {
      console.error("Error in fetchAllData:", error);
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
    console.log("useEffect triggered. Token:", token);
    if (token) {
      console.log("Token available, fetching data...");
      fetchAllData();
    }
  }, [token]);

  // Debug state changes
  useEffect(() => {
    console.log("Levels state updated:", levels?.length || 0, levels);
  }, [levels]);

  useEffect(() => {
    console.log("Subjects state updated:", subjects?.length || 0);
  }, [subjects]);

  useEffect(() => {
    console.log("Mappings state updated:", mappings?.length || 0);
  }, [mappings]);

  // Add this temporary debug section
  useEffect(() => {
    console.log("=== MAPPINGS DEBUG ===");
    console.log("Raw mappings data:", mappings);
    mappings.forEach((mapping, index) => {
      console.log(`Mapping ${index}:`, {
        level_id: mapping.level_id,
        level_name: mapping.level_name,
        subjects_tagged: mapping.subjects_tagged,
        subjects_tagged_type: typeof mapping.subjects_tagged,
        subjects_tagged_length: mapping.subjects_tagged?.length,
      });
    });
    console.log("=== END DEBUG ===");
  }, [mappings]);

  // Add this debug useEffect after your existing ones:
  useEffect(() => {
    console.log("=== SUBJECTS DEBUG ===");
    console.log("Subjects length:", subjects.length);
    console.log("First few subjects:", subjects.slice(0, 3));
    if (subjects.length > 0) {
      console.log("Subject structure:", {
        keys: Object.keys(subjects[0]),
        sample: subjects[0],
      });
    }
    console.log("=== END SUBJECTS DEBUG ===");
  }, [subjects]);

  // Get subjects from previous priority level
  const getPreviousLevelSubjects = (currentPriority: number): number[] => {
    if (currentPriority <= 1) return [];

    const previousMapping = mappings.find(
      (mapping) =>
        mapping.priority === currentPriority - 1 && mapping.status === 1
    );

    return previousMapping ? previousMapping.subjects_tagged : [];
  };

  // Replace the checkPreviousLevel function:
  const checkPreviousLevel = async (priority: number) => {
    // For priority 1, always allow mapping without checking previous level
    if (!token || priority <= 1) {
      setCanMapLevel(true);
      setPreviousLevelError("");
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/admin/game/check-previous-level/${priority}/${token}`
      );
      const data = await response.json();

      if (data.errFlag === 0) {
        const canMap = data.data.canMap;
        setCanMapLevel(canMap);
        if (!canMap) {
          setPreviousLevelError(
            `Please enable mappings for Priority ${priority - 1} level first`
          );
        } else {
          setPreviousLevelError("");
        }
      }
    } catch (error) {
      console.error("Error checking previous level:", error);
      // For priority 1, don't block mapping even if API fails
      if (priority === 1) {
        setCanMapLevel(true);
        setPreviousLevelError("");
      } else {
        setCanMapLevel(false);
        setPreviousLevelError("Error checking previous level requirements");
      }
    }
  };

  const handleAddMapping = () => {
    setSelectedMapping(null);
    setSelectedLevel(null);
    setSelectedSubjects([]);
    setCanMapLevel(true);
    setPreviousLevelError("");
    onMappingModalOpen();
  };

  // Fixed handleEditMapping without infinite loop
  const handleEditMapping = (mapping: LevelSubjectMapping) => {
    console.log("Edit mapping clicked:", mapping);
    console.log("Current levels state:", levels?.length || 0);
    console.log("Current subjects state:", subjects?.length || 0);
    console.log("Current mappings state:", mappings?.length || 0);

    // If no data is loaded, show error and return
    if (!levels || levels.length === 0 || !subjects || subjects.length === 0) {
      toast({
        title: "Error",
        description:
          "Data not loaded yet. Please wait for the page to load completely and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Find level in the levels array
    const level = levels.find((l) => l.id === mapping.level_id);

    if (!level) {
      console.error(
        "Level not found. Level ID:",
        mapping.level_id,
        "Available levels:",
        levels.map((l) => `${l.id}:${l.level_name}`)
      );
      toast({
        title: "Error",
        description: `Level with ID ${mapping.level_id} not found. Please refresh the page and try again.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    console.log("Found level:", level);
    setSelectedMapping(mapping);
    setSelectedLevel(level);
    setSelectedSubjects([...mapping.subjects_tagged]); // Create a copy
    setCanMapLevel(true);
    setPreviousLevelError("");
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

  // Get available levels for new mapping
  const getAvailableLevels = () => {
    if (!levels || levels.length === 0) return [];

    return levels.filter((level) => {
      // Check if this level has an ACTIVE mapping (status === 1)
      const hasActiveMapping = mappings.some(
        (mapping) => mapping.level_id === level.id && mapping.status === 1
      );
      // Level is available if it has NO active mapping
      return !hasActiveMapping;
    });
  };

  // Handle level selection change
  const handleLevelChange = async (levelId: number) => {
    const level = levels.find((l) => l.id === levelId);
    setSelectedLevel(level || null);

    if (level) {
      // Only check previous level if priority > 1
      if (level.priority > 1) {
        await checkPreviousLevel(level.priority);
      } else {
        // For priority 1, always allow mapping
        setCanMapLevel(true);
        setPreviousLevelError("");
      }

      if (selectedMapping) {
        // If editing existing mapping, keep the current subjects
        setSelectedSubjects([...selectedMapping.subjects_tagged]);
      } else {
        // If creating new mapping, start with previous level subjects (only if priority > 1)
        if (level.priority > 1) {
          const previousSubjects = getPreviousLevelSubjects(level.priority);
          setSelectedSubjects([...previousSubjects]);
        } else {
          // For priority 1, start with empty selection
          setSelectedSubjects([]);
        }
      }
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

    if (!canMapLevel) {
      toast({
        title: "Error",
        description: previousLevelError,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedSubjects.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one subject",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("token", token!);
      formData.append("levelId", selectedLevel.id.toString());
      formData.append("subjectIds", selectedSubjects.join(","));

      const response = await fetch(
        `${baseUrl}/admin/game/map-subjects-to-level`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.errFlag === 0) {
        let actionType = "created";

        // Check if we're updating an existing disabled mapping
        const existingMapping = mappings.find(
          (mapping) => mapping.level_id === selectedLevel.id
        );

        if (existingMapping) {
          actionType = existingMapping.status === 0 ? "re-enabled" : "updated";
        }

        toast({
          title: "Success",
          description:
            data.message || `Subject mapping ${actionType} successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Refresh mappings to get the latest data
        await fetchMappings();
        onMappingModalClose();
      } else {
        throw new Error(data.message || "Failed to save mapping");
      }
    } catch (error) {
      console.error("Error saving mapping:", error);
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
    levelId: number,
    currentStatus: number
  ) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

    try {
      const response = await fetch(
        `${baseUrl}/admin/game/change-mapping-status/${levelId}/${newStatus}/${token}`,
        { method: "GET" }
      );

      const data = await response.json();

      if (data.errFlag === 0) {
        toast({
          title: "Success",
          description: data.message || "Mapping status updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Refresh mappings to ensure consistency
        await fetchMappings();
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "S.No.",
        maxWidth: 80,
        filter: false,
        valueGetter: (params: any) => {
          const startIndex =
            params.api.paginationGetCurrentPage() *
            params.api.paginationGetPageSize();
          return startIndex + params.node.rowIndex + 1;
        },
        cellStyle: { textAlign: "center" } as any,
      },
      {
        headerName: "Level Name",
        field: "level_name",
        cellStyle: { display: "flex", alignItems: "center" } as any,
        flex: 1,
      },
      {
        headerName: "Priority",
        field: "priority",
        maxWidth: 100,
        cellStyle: { textAlign: "center" } as any,
        filter: false,
      },
      {
        headerName: "Subjects",
        field: "subjects_tagged",
        flex: 3,
        valueFormatter: (params: any) => {
          const subjectIds = params.value || [];
          if (!subjectIds || subjectIds.length === 0) {
            return "No subjects tagged";
          }
          return `${subjectIds.length} subject(s) tagged`;
        },
        cellRenderer: (params: any) => {
          const subjectIds = params.value || [];

          if (!subjectIds || subjectIds.length === 0) {
            return (
              <Badge colorScheme="gray" display="flex" alignItems="center">
                No subjects tagged
              </Badge>
            );
          }

          console.log("=== CELL RENDERER DEBUG ===");
          console.log("Subject IDs to find:", subjectIds);
          console.log("Subjects array length:", subjects.length);
          console.log("Current subjects:", subjects);

          return (
            <HStack wrap="wrap" spacing={1} align="center">
              {subjectIds.map((subjectId: number) => {
                const numericSubjectId = Number(subjectId);

                const subject = subjects.find(
                  (s) => Number(s.subject_id) === numericSubjectId
                );

                console.log(
                  `Looking for subject ID ${numericSubjectId}:`,
                  subject
                );

                if (subject) {
                  return (
                    <Badge
                      key={subjectId}
                      colorScheme="teal"
                      size="xs"
                      px={2}
                      py={0.5}
                      lineHeight="normal"
                      fontSize="xs"
                      display="inline-flex"
                      alignItems="center"
                    >
                      {subject.subject_name}
                    </Badge>
                  );
                } else {
                  return (
                    <Badge
                      key={subjectId}
                      colorScheme="red"
                      size="xs"
                      px={2}
                      py={0.5}
                      lineHeight="normal"
                      fontSize="xs"
                      display="inline-flex"
                      alignItems="center"
                    >
                      Subject ID: {subjectId}
                    </Badge>
                  );
                }
              })}
            </HStack>
          );
        },
        cellStyle: { display: "flex", alignItems: "center" } as any,
      },
      {
        headerName: "Status",
        field: "status",
        maxWidth: 120,
        filter: false,
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
              isChecked={params.value === 1}
              onChange={() =>
                handleToggleMappingStatus(params.data.level_id, params.value)
              }
            />
          </div>
        ),
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        } as any,
      },
      {
        headerName: "Actions",
        field: "actions",
        maxWidth: 150,
        filter: false,
        cellRenderer: (params: any) => (
          <HStack spacing={2} align="center">
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
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        } as any,
      },
    ],
    [subjects, handleEditMapping, handleToggleMappingStatus]
  ); // Dependencies

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
        <HStack spacing={3}>
          {/* <Text fontSize="sm" color="gray.600">
            L:{levels?.length || 0} | S:{subjects?.length || 0} | M:
            {mappings?.length || 0}
          </Text>
          <Button
            colorScheme="blue"
            size="sm"
            variant="outline"
            onClick={fetchAllData}
            isLoading={loading}
          >
            Refresh
          </Button> */}
          <Button colorScheme="green" size="sm" onClick={handleAddMapping}>
            Add New Mapping
          </Button>
        </HStack>
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

        {/* Only render grid when we have valid data and columns */}
        {!loading &&
          columnDefs &&
          columnDefs.length > 0 &&
          Array.isArray(mappings) && (
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
              getRowHeight={(params: any) => {
                if (
                  params.data?.subjects_tagged &&
                  params.data.subjects_tagged.length > 8
                ) {
                  return 80;
                } else if (
                  params.data?.subjects_tagged &&
                  params.data.subjects_tagged.length > 4
                ) {
                  return 60;
                }
                return 50;
              }}
              suppressCellFocus={true}
              suppressColumnVirtualisation={true}
              // Add error handling
              onGridReady={(params) => {
                console.log("Grid ready:", params);
              }}
              onFirstDataRendered={(params) => {
                console.log("First data rendered:", params);
              }}
              // Re-render grid when subjects data changes
              key={`grid-${subjects.length}-${mappings.length}-${Date.now()}`}
            />
          )}

        {/* Show message if no data */}
        {!loading && (!mappings || mappings.length === 0) && (
          <Center h="200px">
            <Text color="gray.500">No level-subject mappings found</Text>
          </Center>
        )}
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
          setCanMapLevel(true);
          setPreviousLevelError("");
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
                  isDisabled={!!selectedMapping}
                >
                  {(selectedMapping ? levels : getAvailableLevels()).map(
                    (level) => (
                      <option key={level.id} value={level.id}>
                        {level.level_name} (Priority: {level.priority})
                      </option>
                    )
                  )}
                </Select>
                {!selectedMapping && getAvailableLevels().length === 0 && (
                  <Text fontSize="sm" color="orange.600" mt={2}>
                    All levels already have active mappings. Use Edit to modify
                    existing mappings.
                  </Text>
                )}
              </FormControl>

              {previousLevelError && !canMapLevel && (
                <Alert status="warning">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Cannot Map Level!</AlertTitle>
                    <AlertDescription>{previousLevelError}</AlertDescription>
                  </Box>
                </Alert>
              )}

              {selectedLevel && (
                <>
                  <Box>
                    <Text fontWeight="semibold">Level Description:</Text>
                    <Text>{selectedLevel.description}</Text>
                    <Text fontWeight="semibold" mt={2}>
                      Priority:
                    </Text>
                    <Text>{selectedLevel.priority}</Text>

                    {!selectedMapping && selectedLevel.priority > 1 && (
                      <Box mt={2} p={2} bg="blue.50" borderRadius="md">
                        <Text
                          fontSize="sm"
                          color="blue.600"
                          fontWeight="semibold"
                        >
                          Previous Level Subjects (Priority{" "}
                          {selectedLevel.priority - 1}):
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          {getPreviousLevelSubjects(selectedLevel.priority)
                            .length > 0
                            ? `${
                                getPreviousLevelSubjects(selectedLevel.priority)
                                  .length
                              } subjects pre-selected from previous level`
                            : "No subjects from previous level"}
                        </Text>
                      </Box>
                    )}
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
                        {subjects.map((subject) => {
                          const isFromPreviousLevel =
                            !selectedMapping &&
                            selectedLevel &&
                            selectedLevel.priority > 1 &&
                            getPreviousLevelSubjects(
                              selectedLevel.priority
                            ).includes(subject.subject_id);

                          return (
                            <Box key={subject.subject_id} w="100%">
                              <Checkbox
                                isChecked={selectedSubjects.includes(
                                  subject.subject_id
                                )}
                                onChange={() =>
                                  toggleSubjectSelection(subject.subject_id)
                                }
                                isDisabled={!canMapLevel}
                              >
                                <HStack spacing={2}>
                                  <Text>
                                    {subject.subject_name} (
                                    {subject.course_name})
                                  </Text>
                                  {isFromPreviousLevel && (
                                    <Badge colorScheme="blue" size="sm">
                                      From Previous Level
                                    </Badge>
                                  )}
                                </HStack>
                              </Checkbox>
                            </Box>
                          );
                        })}
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
              isDisabled={
                !selectedLevel || selectedSubjects.length === 0 || !canMapLevel
              }
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
