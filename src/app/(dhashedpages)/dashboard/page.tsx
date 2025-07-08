// import Image from "next/image";

"use client";
import styles from "./page.module.css";

import { TbDeviceAnalytics } from "react-icons/tb";
import { RiUser3Line } from "react-icons/ri";
import { IoMdPaper } from "react-icons/io";
import { VscFileSymlinkDirectory } from "react-icons/vsc";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
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
  useToast,
  Box,
  Image,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/app-users/get-all-app-users/${token}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setRowData(data);
      console.log(data);
      if (data.message === "Invalid token") {
        toast({
          title: "Error",
          description: data.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        window.location.href = "/auth/login";
      } 
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const [rowData, setRowData] = useState<any[]>();

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "Sl. No",
      field: "id",
      maxWidth: 80,
      filter: false,
      suppressAutoSize: true,
      cellRenderer: (params: any) => {
        return params.node.rowIndex + 1;
      },
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Name",
      field: "app_user_name",
      // minWidth: 180,
    },
    // {
    //   headerName: "Doctor Image",
    //   field: "doctor_profile_pic",
    //   cellRenderer: (params: any) => (
    //     <Button
    //       variant="link"
    //       colorScheme="blue"
    //       onClick={() => fetchImage(params.value)}
    //     >
    //       View Image
    //     </Button>
    //   ),
    // },
    {
      headerName: "Email",
      field: "app_user_email",
    },
    {
      headerName: "Mobile",
      field: "app_user_mobile",
    },
    {
      headerName: "College",
      field: "college",
    },
    {
      field: "status",
      headerName: "Status",
      cellStyle: { textAlign: "center" },
      filter: false,
      maxWidth: 150,
      cellRenderer: (params: any) => (
        // console.log(params.value),
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
            defaultChecked={params.value === 1 ? true : false}
          />
        </div>
      ),
    },
    {
      headerName: "Creation date",
      field: "created_date",
    },
    // {
    //   headerName: "Actions",
    //   filter: false,
    //   cellRenderer: (params: any) => {
    //     return (
    //       <HStack spacing={2}>
    //         <Button
    //           // leftIcon={<EditIcon />}
    //           colorScheme="blue"
    //           size="sm"
    //           onClick={() => handleEdit(params.data)}
    //           variant="outline"
    //         >
    //           Edit
    //         </Button>
    //         {/* <Button
    //              // leftIcon={<DeleteIcon />}
    //              colorScheme="red"
    //              size="sm"
    //              onClick={() => handleDelete(params.data)}
    //              variant="outline"
    //            >
    //              Delete
    //            </Button> */}
    //       </HStack>
    //     );
    //   },
    // },
  ]);

  // const fetchImage = async (id: any) => {
  //   // console.log(id);
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch(`${baseUrl}//${token}/${id}`, {
  //       method: "GET",
  //     });
  //     setCurrentImageUrl(response.url); // Set the image URL to state
  //     onImageModalOpen();

  //     // console.log(response.url);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  //toggle function for switch button
  const handleToggle = async (data: any) => {
    console.log(data);
    setLoading(true);
    try {
      const token = localStorage.getItem("token") ?? "";
      const status = data.status == 1 ? 0 : 1;
      console.log(status);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/app-users/update-app-user-status/${status}/${data.id}/${token}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error toggling course status:", error);
    }
    setLoading(false);
  };

  // State for Add Subject Modal
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  // State for Edit Subject Modal
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  // Add this with your other modal states
  const {
    isOpen: isImageModalOpen,
    onOpen: onImageModalOpen,
    onClose: onImageModalClose,
  } = useDisclosure();

  // Add state to store the image URL
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [name, setname] = useState("");
  const [doctorEducation, setdoctorEducation] = useState("");
  const [docExperience, setdocExperience] = useState("");
  const [userId, setuserId] = useState("");
  const [doctorPracticeProfession, setdoctorPracticeProfession] = useState<any>(
    []
  );
  const [loading, setLoading] = useState(false);

  const handleEdit = (data: any) => {
    // console.log(data);
    setname(data.doctor_full_name);
    setdoctorEducation(data.doctor_education);
    setdocExperience(data.years_of_experience);
    setdoctorPracticeProfession(data.doctor_practice_profession);
    setuserId(data.id);
    onEditModalOpen(); // Open Edit Modal
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev?.filter((subject) => subject.id !== data.id));
  };

  const handleAddSubject = async () => {
    // console.log(name, doctorEducation, role , doctorPracticeProfession);
    setLoading(true);
    try {
      const token = localStorage.getItem("token") ?? "";
      const form = new FormData();
      form.append("doctorName", name);
      form.append("doctorEducation", doctorEducation);
      form.append("doctorPracticeProfession", doctorPracticeProfession);
      form.append("yearsOfExperience", docExperience);
      form.append("token", token);
      if (selectedImage) {
        form.append("doctorProfilePic", selectedImage);
      }
      console.log(Object.fromEntries(form.entries()));

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
        method: "POST",
        body: form,
      });
      const responseData = await response.json();
      console.log(responseData);
      fetchData();

      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: "Subject added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchData();
        resetForm();
        onAddModalClose();
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
    }

    setLoading(false);
  };

  const handleUpdateSubject = async () => {
    try {
      const token = localStorage.getItem("token") ?? "";
      const form = new FormData();
      form.append("doctorName", name);
      form.append("doctorEducation", doctorEducation);
      form.append("doctorPracticeProfession", doctorPracticeProfession);
      form.append("yearsOfExperience", docExperience);
      form.append("doctorId", userId);
      form.append("token", token);
      if (selectedImage) {
        form.append("doctorProfilePic", selectedImage);
      }
      console.log(Object.fromEntries(form.entries()));

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
        method: "POST",
        body: form,
      });
      const responseData = await response.json();
      console.log(responseData);
      fetchData();
      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: "Subject updated successfully",
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
        resetForm();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resetForm = () => {
    setname("");
    setdoctorEducation("");
    setdocExperience("");
    setdoctorPracticeProfession("");
    setSelectedImage(null);
    setPreview(null);
  };

  return (
    <div className={styles.page}>
      {/* <div className={styles.hello}>
        <h3>👋 Hello, Admin</h3>
        <p>Here is all your analytics overview</p>
      </div> */}

      <div className={styles.statesContainer}>
        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>TOTAL Downloads</p>
            <h2>3990</h2>
            {/* <p className={styles.measure}>↑ 3.5% Increase</p> */}
          </div>
          <div className={styles.stateIcon}>
            <RiUser3Line />
          </div>
        </div>

        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>Subcriptions</p>
            <h2>110</h2>
            {/* <p className={styles.measure}>20 Unpaid , 90 paid</p> */}
          </div>
          <div className={styles.stateIcon}>
            <TbDeviceAnalytics />
          </div>
        </div>

        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>Revenue</p>
            <h2>300</h2>
            <p className={styles.measure}>₹ 2400 </p>
          </div>
          <div className={styles.stateIcon}>
            <IoMdPaper />
          </div>
        </div>

        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>Avg. daily login</p>
            <h2>1460</h2>
            {/* <p className={styles.measure}>1000 under Course, 450 under misc</p> */}
          </div>
          <div className={styles.stateIcon}>
            <VscFileSymlinkDirectory />
          </div>
        </div>
      </div>

      <div style={{ width: "95%", height: "60vh" }}>
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
          <p style={{ fontSize: "16px", fontWeight: "600" }}>App Users</p>
          {/* <Button onClick={onAddModalOpen} colorScheme="green">
                     Add New User
                   </Button> */}
        </div>
        <div style={{ height: "100%", width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            // paginationPageSize={10}
            paginationPageSize={5}
            paginationPageSizeSelector={[5, 10, 20, 30]}
            // paginationAutoPageSize={true}
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

        {/* Add Subject Modal */}
        <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="Enter Doctor's Name"
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                />

                <FormLabel>Doctor Education</FormLabel>
                <Input
                  placeholder="Enter Doctor Education"
                  value={doctorEducation}
                  onChange={(e) => setdoctorEducation(e.target.value)}
                />

                <FormLabel>Doctor Profession</FormLabel>
                <Input
                  placeholder="Enter Doctor Practice Profession"
                  value={doctorPracticeProfession}
                  onChange={(e) => setdoctorPracticeProfession(e.target.value)}
                />

                <FormLabel>Experience Year</FormLabel>
                <Input
                  placeholder="Enter Experience Year"
                  value={docExperience}
                  onChange={(e) => setdocExperience(e.target.value)}
                />

                {/* Add input fields for doctor image  */}
                <FormLabel mt={4}>Doctor Image</FormLabel>
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
              <Button colorScheme="green" onClick={handleAddSubject}>
                Add
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Subject Modal */}
        <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Doctor Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="Enter Doctor's Name"
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                />

                <FormLabel>Doctor Education</FormLabel>
                <Input
                  placeholder="Enter Doctor Education"
                  value={doctorEducation}
                  onChange={(e) => setdoctorEducation(e.target.value)}
                />

                <FormLabel>Doctor Profession</FormLabel>
                <Input
                  placeholder="Enter Doctor Practice Profession"
                  value={doctorPracticeProfession}
                  onChange={(e) => setdoctorPracticeProfession(e.target.value)}
                />

                <FormLabel>Experience Year</FormLabel>
                <Input
                  placeholder="Enter Experience Year"
                  value={docExperience}
                  onChange={(e) => setdocExperience(e.target.value)}
                />

                {/* Add input fields for doctor image  */}
                <FormLabel mt={4}>Doctor Image</FormLabel>
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
              <Button colorScheme="green" onClick={handleUpdateSubject}>
                Update
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Image Viewer Modal */}
        <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Doctor Profile Image</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Center>
                {currentImageUrl && (
                  <Image
                    src={currentImageUrl}
                    alt="Doctor Profile"
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
    </div>
  );
}
