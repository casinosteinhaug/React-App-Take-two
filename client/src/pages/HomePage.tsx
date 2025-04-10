import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const bgSecondary = useColorModeValue("gray.50", "gray.800");
  
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      
      <Container maxW="md" py={8} flex="1">
        <Heading size="lg" mb={4}>Home Dashboard</Heading>
        <Box bg={bgSecondary} p={6} borderRadius="lg" boxShadow="sm">
          <Text mb={4}>Welcome back, <Text as="span" fontWeight="semibold">{user?.name || user?.username}</Text>!</Text>
          <Text color={useColorModeValue("gray.600", "gray.400")}>You are now successfully logged in.</Text>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
