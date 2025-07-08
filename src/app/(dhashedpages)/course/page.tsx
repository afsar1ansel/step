"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useDropzone } from "react-dropzone";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Switch,
  HStack,
  useToast,
  Box,
  Image,
  Center,
  Spinner,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const CourseMaster = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [rowData, setRowData] = useState<any[]>([]);
  const toast = useToast();

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Dropzone for image upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    },
  });

  useEffect(() => {
    fetcherData();
  }, []);

  async function fetcherData() {
    const tok = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${baseUrl}/masters/courses/get-all-courses/${tok}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      console.log(responseData);
      setRowData(responseData);
    } catch {
      (error: Error) => {
        console.error("Error fetching data:", error);
      };
    }
  }

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "Sl. No",
      field: "id",
      maxWidth: 80,
      filter: false,
      suppressAutoSize: true,
    },
    {
      headerName: "Course Name",
      field: "course_name",
      minWidth: 180,
    },
    {
      headerName: "Course Image",
      field: "course_image",
      cellRenderer: (params: any) => (
        <Button
          variant="link"
          colorScheme="blue"
          onClick={() => fetchImage(params.value)}
        >
          View Image
        </Button>
      ),
    },
    {
      headerName: "Course Created By",
      field: "created_admin_user_id",
      cellRenderer: (params: any) => {
        return params.value == 1 ? "Admin" : "Sub Admin";
      },
    },
    {
      field: "status",
      headerName: "Access",
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
            onChange={(event) => handleToggle(params.data)}
            defaultChecked={params.data.status}
          />
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
            >
              Edit
            </Button>
          </HStack>
        );
      },
    },
  ]);

  // Modal states
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();
  const {
    isOpen: isImageModalOpen,
    onOpen: onImageModalOpen,
    onClose: onImageModalClose,
  } = useDisclosure();

  // Form states
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [courseName, setCourseName] = useState("");
  const [editRowId, setEditRowId] = useState("");

  const fetchImage = async (imageName: string) => {
    console.log(imageName);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/masters/courses/course-image/view/${token}/${imageName}`,
        {
          method: "GET",
        }
      );
      console.log(response);
      setCurrentImageUrl(response.url);
      onImageModalOpen();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (data: any) => {
    setEditRowId(data.id);
    setCourseName(data.course_name);
    setCurrentCourse(data);
    onEditModalOpen();
  };

  const handleToggle = async (data: any) => {
    console.log(data.id);
    try {
      const token = localStorage.getItem("token") ?? "";
      const status = data.status ? 0 : 1;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/courses/change-course-status/${status}/${data.id}/${token}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error toggling course status:", error);
    }
  };

  const handleAddCourse = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("courseName", courseName);
      form.append("token", localStorage.getItem("token") ?? "");
      if (selectedImage) {
        form.append("courseImage", selectedImage);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/courses/add`,
        {
          method: "POST",
          body: form,
        }
      );
      const responseData = await response.json();
      console.log(responseData);
      fetcherData();

      if (responseData.errFlag == 0) {
        toast({
          title: "Course added successfully.",
          description: responseData.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        onAddModalClose();
      } else {
        toast({
          title: "Error adding course.",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error adding course:", error);
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const handleUpdateCourse = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("courseName", courseName);
      form.append("courseId", editRowId);
      form.append("token", localStorage.getItem("token") ?? "");
      if (selectedImage) {
        form.append("courseImage", selectedImage);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/courses/update-course`,
        {
          method: "POST",
          body: form,
        }
      );
      const responseData = await response.json();
      console.log(responseData);
      fetcherData();

      if (responseData.errFlag == 0) {
        toast({
          title: "Course updated successfully.",
          description: responseData.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        onEditModalClose();
      } else {
        toast({
          title: "Error updating course.",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error updating course:", error);
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setCourseName("");
    setSelectedImage(null);
    setPreview(null);
    setCurrentCourse(null);
  };

  return (
    <div style={{ width: "80vw", height: "60vh", maxWidth: "1250px" }}>
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Course Data</p>
        <Button onClick={onAddModalOpen} colorScheme="green">
          Add Course
        </Button>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={5}
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

      {/* Add Course Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Course Name</FormLabel>
              <Input
                placeholder="Enter Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />

              <FormLabel mt={4}>Course Image</FormLabel>
              <Box
                {...getRootProps()}
                border="2px dashed"
                borderColor={isDragActive ? "green.500" : "gray.300"}
                borderRadius="md"
                p={4}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: "green.400" }}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : (
                  <p>Drag & drop an image here, or click to select</p>
                )}
              </Box>

              {preview && (
                <Box mt={4}>
                  <Image
                    src={preview}
                    alt="Preview"
                    maxH="200px"
                    mx="auto"
                    borderRadius="md"
                  />
                  <Button
                    size="sm"
                    mt={2}
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                      setPreview(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </Box>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleAddCourse}
              isLoading={loading}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Course Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Course Name</FormLabel>
              <Input
                placeholder="Enter Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />

              <FormLabel mt={4}>Course Image</FormLabel>
              <Box
                {...getRootProps()}
                border="2px dashed"
                borderColor={isDragActive ? "green.500" : "gray.300"}
                borderRadius="md"
                p={4}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: "green.400" }}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : (
                  <p>Drag & drop an image here, or click to select</p>
                )}
              </Box>

              {preview && (
                <Box mt={4}>
                  <Image
                    src={preview}
                    alt="Preview"
                    maxH="200px"
                    mx="auto"
                    borderRadius="md"
                  />
                  <Button
                    size="sm"
                    mt={2}
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                      setPreview(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </Box>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleUpdateCourse}
              isLoading={loading}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Course Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center>
              {currentImageUrl && (
                <Image
                  src={currentImageUrl}
                  alt="Course Image"
                  maxH="70vh"
                  maxW="100%"
                  objectFit="contain"
                  borderRadius="md"
                />
              )}
            </Center>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onImageModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Loading Spinner - Only show when loading AND a modal is open */}
      {(isAddModalOpen || isEditModalOpen) && loading && (
        <Center
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex="modal"
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

export default CourseMaster;
