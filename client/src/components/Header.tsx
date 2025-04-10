import React from "react";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation } from "wouter";
import UserMenu from "./UserMenu";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title = "PERN App", showBackButton = false }) => {
  const [, setLocation] = useLocation();
  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  const handleBack = () => {
    window.history.back();
  };
  
  return (
    <Box 
      as="header" 
      py={3} 
      px={4} 
      position="sticky" 
      top={0} 
      zIndex={10}
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={3}>
          {showBackButton && (
            <IconButton
              aria-label="Go back"
              icon={<FaArrowLeft />}
              variant="ghost"
              onClick={handleBack}
              size="sm"
            />
          )}
          <Heading size="lg" fontWeight="bold">{title}</Heading>
        </Flex>
        
        <UserMenu />
      </Flex>
    </Box>
  );
};

export default Header;
