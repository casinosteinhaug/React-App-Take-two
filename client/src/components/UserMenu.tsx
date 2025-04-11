import React, { useRef } from "react";
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
  Divider,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Avatar from "./Avatar";

const UserMenu: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  
  const handleProfileClick = () => {
    onClose();
    setLocation("/profile");
  };
  
  const handleSettingsClick = () => {
    onClose();
    setLocation("/settings");
  };
  
  const handleLogout = () => {
    onClose();
    logoutMutation.mutate();
  };
  
  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom-end"
      initialFocusRef={initialFocusRef}
    >
      <PopoverTrigger>
        <Box>
          <Avatar 
            user={user} 
            size="md" 
            cursor="pointer"
            _hover={{ 
              transform: "scale(1.05)",
              transition: "all 0.2s ease"
            }}
          />
        </Box>
      </PopoverTrigger>
      <PopoverContent 
        width="200px" 
        border="1px solid"
        borderColor={borderColor}
        _focus={{ outline: "none" }}
        bg={useColorModeValue("white", "gray.800")}
        shadow="md"
      >
        <PopoverBody p={0}>
          <VStack spacing={0} align="stretch">
            <Button
              ref={initialFocusRef}
              leftIcon={<FaUser />}
              onClick={handleProfileClick}
              variant="ghost"
              justifyContent="flex-start"
              borderRadius={0}
              py={6}
              width="100%"
              _hover={{ bg: hoverBg }}
            >
              Profile
            </Button>
            
            <Button
              leftIcon={<FaCog />}
              onClick={handleSettingsClick}
              variant="ghost"
              justifyContent="flex-start"
              borderRadius={0}
              py={6}
              width="100%"
              _hover={{ bg: hoverBg }}
            >
              Settings
            </Button>
            
            <Divider borderColor={borderColor} />
            
            <Button
              leftIcon={<FaSignOutAlt />}
              onClick={handleLogout}
              variant="ghost"
              justifyContent="flex-start"
              borderRadius={0}
              py={6}
              width="100%"
              color="red.500"
              _hover={{ bg: hoverBg }}
              isLoading={logoutMutation.isPending}
            >
              Logout
            </Button>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default UserMenu;