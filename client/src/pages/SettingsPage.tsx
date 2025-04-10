import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Switch,
  Text,
  useColorMode,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { FaChevronRight, FaTrash } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

const SettingsPage: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAuth();
  const toast = useToast();
  const bgSecondary = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  // Create mutation for theme update
  const themeUpdateMutation = useMutation({
    mutationFn: async (theme: string) => {
      const res = await apiRequest("POST", "/api/theme", { theme });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleColorMode();
    const newTheme = colorMode === "light" ? "dark" : "light";
    
    themeUpdateMutation.mutate(newTheme, {
      onSuccess: () => {
        toast({
          title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`,
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "bottom",
        });
      },
    });
  };

  // Mock functions for future implementation
  const handleChangePassword = () => {
    toast({
      title: "Feature coming soon",
      description: "Password change functionality will be available in a future update.",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "bottom",
    });
  };

  const handleManageNotifications = () => {
    toast({
      title: "Feature coming soon",
      description: "Notification preferences will be available in a future update.",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "bottom",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Feature coming soon",
      description: "Account deletion will be available in a future update.",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "bottom",
    });
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header title="Settings" showBackButton />
      
      <Container maxW="md" py={8} flex="1">
        <VStack spacing={6} align="stretch">
          <Box
            bg={bgSecondary}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Box p={4}>
              <Heading size="md" mb={4}>Appearance</Heading>
              
              <Flex justify="space-between" align="center" py={2}>
                <Box>
                  <Text fontWeight="medium">Dark Mode</Text>
                  <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                    Switch between light and dark themes
                  </Text>
                </Box>
                <Switch
                  isChecked={colorMode === "dark"}
                  onChange={handleThemeToggle}
                  colorScheme="primary"
                  size="lg"
                />
              </Flex>
              
              <Text fontSize="sm" mt={2} color={useColorModeValue("gray.600", "gray.400")}>
                Current theme: {colorMode === "dark" ? "Dark" : "Light"}
              </Text>
            </Box>

            <Divider borderColor={borderColor} />

            <Box p={4}>
              <Heading size="md" mb={4}>Account</Heading>
              
              <VStack spacing={2} align="stretch">
                <Button
                  justifyContent="space-between"
                  variant="ghost"
                  py={2}
                  onClick={handleChangePassword}
                  rightIcon={<FaChevronRight />}
                  fontWeight="medium"
                >
                  Change Password
                </Button>
                
                <Button
                  justifyContent="space-between"
                  variant="ghost"
                  py={2}
                  onClick={handleManageNotifications}
                  rightIcon={<FaChevronRight />}
                  fontWeight="medium"
                >
                  Notification Preferences
                </Button>
                
                <Button
                  justifyContent="space-between"
                  variant="ghost"
                  py={2}
                  onClick={handleDeleteAccount}
                  rightIcon={<FaTrash />}
                  colorScheme="red"
                  fontWeight="medium"
                >
                  Delete Account
                </Button>
              </VStack>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default SettingsPage;
