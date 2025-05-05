"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import {
  Box,
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
  Switch,
  useDisclosure,
  useToast,
  Image,
  Text,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";

ModuleRegistry.registerModules([AllCommunityModule]);

const BannerMaster = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const toast = useToast();

  const [rowData, setRowData] = useState<any[]>([]);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentBannerId, setCurrentBannerId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // State for image modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State for selected image

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const [columnDefs] = useState<ColDef[]>([
    { headerName: "ID", field: "id", maxWidth: 80 , filter: false },
    { headerName: "Title", field: "banner_title", minWidth: 200 },
    {
      headerName: "Image",
      field: "banner_image_name",
      filter: false,
      cellRenderer: (params: any) => (
        <Button
          variant="link"
          colorScheme="blue"
          onClick={() => handleViewImage(params.value)}
        >
          View Banner
        </Button>
            ),
            minWidth: 150,
          },
          {
            headerName: "Date & Time",
            valueGetter: (params) => {
        const date = params.data.created_date.split(" ")[1]; // Extract the date part
        const month = params.data.created_date.split(" ")[2]; // Extract the month part
        const year = params.data.created_date.split(" ")[3]; // Extract the year part
        return `${date} ${month} ${year} ${params.data.created_time}`;
            },
            minWidth: 200,
          },
          {
            headerName: "Status",
            field: "status",
            filter: false,
            cellRenderer: (params: any) => (
        <Switch
          isChecked={params.value === 1}
          onChange={() => handleToggleStatus(params.data)}
          colorScheme="green"
        />
            ),
            maxWidth: 150,
          },
          {
            headerName: "Actions",
            filter: false,
            cellRenderer: (params: any) => (
        <div>
          <Button
            size="sm"
            colorScheme="blue"
            variant={"outline"}
            onClick={() => handleEdit(params.data)}
            style={{ marginRight: "10px" }}
          >
            Edit
          </Button>
        </div>
      ),
      maxWidth: 150,
    },
  ]);

  // Fetch banners data
  useEffect(() => {
    fetchBanners();
  }, [token, baseUrl]);

  const fetchBanners = () => {
    if (token) {
      fetch(`${baseUrl}/masters/ad-banners/get-all/${token}`)
        .then((response) => response.json())
        .then((data) => setRowData(data))
        .catch((error) => console.error("Error fetching banners:", error));
    }
  };

  const handleAddBanner = () => {
    resetForm();
    setIsEditMode(false);
    onModalOpen();
  };

  const handleEdit = (data: any) => {
    setIsEditMode(true);
    setCurrentBannerId(data.id);
    setBannerTitle(data.banner_title);
    setPreviewImage(
      `${baseUrl}/masters/ad-banners/display/${token}/${data.banner_image_name}`
    );
    onModalOpen();
  };

  const handleAddOrUpdateBanner = () => {
    if (!bannerTitle || (!bannerImage && !isEditMode)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields and upload an image.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("token", token || "");
    formData.append("bannerTitle", bannerTitle);
    if (bannerImage) formData.append("bannerImage", bannerImage);

    if (isEditMode) {
      formData.append("bannerId", String(currentBannerId));
      fetch(`${baseUrl}/masters/ad-banners/update`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.errFlag === 0) {
            toast({
              title: "Success",
              description: data.message,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            fetchBanners();
            resetForm();
            onModalClose();
          } else {
            toast({
              title: "Error",
              description: data.message,
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch((error) => {
          console.error("Error updating banner:", error);
          toast({
            title: "Error",
            description: "An error occurred while updating the banner.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    } else {
      fetch(`${baseUrl}/masters/ad-banners/add`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.errFlag === 0) {
            toast({
              title: "Success",
              description: data.message,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            fetchBanners();
            resetForm();
            onModalClose();
          } else {
            toast({
              title: "Error",
              description: data.message,
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        })
        .catch((error) => {
          console.error("Error adding banner:", error);
          toast({
            title: "Error",
            description: "An error occurred while adding the banner.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };

  const handleToggleStatus = (data: any) => {
    const newStatus = data.status === 1 ? 0 : 1;
    fetch(
      `${baseUrl}/masters/ad-banners/change-status/${newStatus}/${data.id}/${token}`,
      { method: "GET" }
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.errFlag === 0) {
          toast({
            title: "Success",
            description: "Status updated successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          fetchBanners();
        } else {
          toast({
            title: "Error",
            description: result.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        toast({
          title: "Error",
          description: "An error occurred while updating the status.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const resetForm = () => {
    setBannerTitle("");
    setBannerImage(null);
    setPreviewImage(null);
    setIsEditMode(false);
    setCurrentBannerId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleViewImage = (imageName: string) => {
    setSelectedImage(
      `${baseUrl}/masters/ad-banners/display/${token}/${imageName}`
    );
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setBannerImage(file);
        setPreviewImage(URL.createObjectURL(file));
      }
    },
    accept: { "image/*": [] },
  });

  return (
    <div style={{ width: "80vw", height: "60vh", }}>
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Banner Master</p>
        <Button onClick={handleAddBanner} colorScheme="green">
          Add Banner
        </Button>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={5}
          defaultColDef={{
            sortable: true,
            filter: true,
            floatingFilter: true,
            resizable: true,
            flex: 1,
          }}
        />
      </div>

      {/* Add/Edit Banner Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditMode ? "Edit Banner" : "Add New Banner"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Banner Title</FormLabel>
              <Input
                placeholder="Enter Banner Title"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Banner Image</FormLabel>
              <Box
                {...getRootProps()}
                border="2px dashed"
                borderColor={isDragActive ? "green.500" : "gray.300"}
                borderRadius="md"
                p={5}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: "green.400" }}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <Text>Drop the image here...</Text>
                ) : (
                  <Text>Drag & drop an image here, or click to select</Text>
                )}
              </Box>
              {previewImage && (
                <Box mt={4} textAlign="start">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    borderRadius="md"
                    boxSize="200px"
                    objectFit="cover"
                    mx="auto"
                  />
                  <Button
                    mt={4}
                    size="sm"
                    colorScheme="red"
                    onClick={() => {
                      setBannerImage(null);
                      setPreviewImage(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </Box>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddOrUpdateBanner}>
              {isEditMode ? "Update" : "Add"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image Modal */}
      <Modal isOpen={isImageModalOpen} onClose={closeImageModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>View Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Banner"
                borderRadius="md"
                boxSize="100%"
                objectFit="contain"
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" onClick={closeImageModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default BannerMaster;
