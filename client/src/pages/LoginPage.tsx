import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import { useAuth } from "@/hooks/use-auth";
import ResetPasswordModal from "@/components/ResetPasswordModal";

const LoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { loginMutation, registerMutation, user } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleRegisterPasswordVisibility = () => setShowRegisterPassword(!showRegisterPassword);
  
  const bgColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.900", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Flex minH="100vh" direction="column" bg={bgColor} color={textColor}>
      <Container maxW="md" py={12} px={6} flex="1">
        <Stack spacing={8}>
          <Stack align="center" textAlign="center">
            <Heading fontSize="2xl" fontWeight="bold">Welcome to PERN App</Heading>
            <Text color={useColorModeValue("gray.600", "gray.400")}>
              Sign in to your account or create a new one
            </Text>
          </Stack>
          
          <Box rounded="lg" bg={bgColor} boxShadow="sm" p={8} borderWidth="1px" borderColor={borderColor}>
            <Tabs isFitted variant="enclosed" index={tabIndex} onChange={setTabIndex}>
              <TabList mb="1em">
                <Tab>Login</Tab>
                <Tab>Register</Tab>
              </TabList>
              
              <TabPanels>
                {/* Login Panel */}
                <TabPanel px={0}>
                  <form onSubmit={handleLoginSubmit}>
                    <Stack spacing={4}>
                      <FormControl id="login-username" isRequired>
                        <FormLabel>Username or Email</FormLabel>
                        <Input 
                          type="text" 
                          name="username"
                          value={loginForm.username}
                          onChange={handleLoginChange}
                          placeholder="Your username or email"
                        />
                      </FormControl>
                      
                      <FormControl id="login-password" isRequired>
                        <Flex justify="space-between" align="center" mb={2}>
                          <FormLabel mb={0}>Password</FormLabel>
                          <Link 
                            color="secondary.500" 
                            fontSize="sm"
                            onClick={() => setIsResetModalOpen(true)}
                            _hover={{ textDecoration: "underline" }}
                          >
                            Forgot password?
                          </Link>
                        </Flex>
                        <InputGroup>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={loginForm.password}
                            onChange={handleLoginChange}
                            placeholder="••••••••"
                          />
                          <InputRightElement>
                            <Button
                              variant="ghost"
                              onClick={togglePasswordVisibility}
                              tabIndex={-1}
                              size="sm"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                      
                      <Button
                        bg="primary.500"
                        color="white"
                        _hover={{ bg: "primary.600" }}
                        type="submit"
                        isLoading={loginMutation.isPending}
                        mt={4}
                        mb={4}
                        w="100%"
                      >
                        Log In
                      </Button>
                      
                      <Text textAlign="center" fontSize="sm" color={useColorModeValue("gray.600", "gray.400")} mb={4}>
                        or continue with
                      </Text>
                      
                      <Flex justify="center" gap={4}>
                        <Button 
                          leftIcon={<FaGoogle />} 
                          colorScheme="red" 
                          variant="outline"
                          flex="1"
                          isDisabled
                          title="Coming soon"
                        >
                          Google
                        </Button>
                        <Button 
                          leftIcon={<FaFacebook />} 
                          colorScheme="facebook" 
                          variant="outline"
                          flex="1"
                          isDisabled
                          title="Coming soon"
                        >
                          Facebook
                        </Button>
                        <Button 
                          leftIcon={<FaGithub />} 
                          colorScheme="gray" 
                          variant="outline"
                          flex="1"
                          isDisabled
                          title="Coming soon"
                        >
                          GitHub
                        </Button>
                      </Flex>
                    </Stack>
                  </form>
                </TabPanel>
                
                {/* Register Panel */}
                <TabPanel px={0}>
                  <form onSubmit={handleRegisterSubmit}>
                    <Stack spacing={4}>
                      <FormControl id="register-name" isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input 
                          type="text" 
                          name="name"
                          value={registerForm.name}
                          onChange={handleRegisterChange}
                          placeholder="Your full name"
                        />
                      </FormControl>
                      
                      <FormControl id="register-username" isRequired>
                        <FormLabel>Username</FormLabel>
                        <Input 
                          type="text" 
                          name="username"
                          value={registerForm.username}
                          onChange={handleRegisterChange}
                          placeholder="Choose a username"
                        />
                      </FormControl>
                      
                      <FormControl id="register-email" isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input 
                          type="email" 
                          name="email"
                          value={registerForm.email}
                          onChange={handleRegisterChange}
                          placeholder="Your email address"
                        />
                      </FormControl>
                      
                      <FormControl id="register-password" isRequired>
                        <FormLabel>Password</FormLabel>
                        <InputGroup>
                          <Input 
                            type={showRegisterPassword ? "text" : "password"}
                            name="password"
                            value={registerForm.password}
                            onChange={handleRegisterChange}
                            placeholder="Create a password"
                          />
                          <InputRightElement>
                            <Button
                              variant="ghost"
                              onClick={toggleRegisterPasswordVisibility}
                              tabIndex={-1}
                              size="sm"
                              aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                            >
                              {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                      
                      <Button
                        bg="primary.500"
                        color="white"
                        _hover={{ bg: "primary.600" }}
                        type="submit"
                        isLoading={registerMutation.isPending}
                        mt={4}
                      >
                        Sign Up
                      </Button>
                    </Stack>
                  </form>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Stack>
      </Container>
      
      <ResetPasswordModal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
      />
    </Flex>
  );
};

export default LoginPage;
