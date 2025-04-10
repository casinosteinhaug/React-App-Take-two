import React from "react";
import {
  useToast as useChakraToast,
  ToastId,
  UseToastOptions,
} from "@chakra-ui/react";

// This is just a wrapper around Chakra's useToast that provides
// some default options to match our design
export const useToast = () => {
  const toast = useChakraToast();
  
  const showToast = (
    options: UseToastOptions
  ): ToastId => {
    return toast({
      position: "bottom",
      duration: 3000,
      isClosable: true,
      ...options,
    });
  };
  
  return {
    showToast,
    toast,
  };
};

export default useToast;
