import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  colors: {
    primary: {
      50: "#E6F5F5",
      100: "#C0E5E4",
      200: "#97D4D3",
      300: "#6DC3C1",
      400: "#4DB6B4",
      500: "#319795", // primary teal from design
      600: "#2C8987",
      700: "#257876",
      800: "#1E6766",
      900: "#144949",
    },
    secondary: {
      50: "#E6F4FB",
      100: "#C0E1F5",
      200: "#97CEEE",
      300: "#6DBAE6",
      400: "#4CAAE0",
      500: "#3182CE", // secondary blue from design
      600: "#2C74B9",
      700: "#25659F",
      800: "#1E5686",
      900: "#143B5E",
    },
    accent: {
      50: "#F2ECF9",
      100: "#DECDEF",
      200: "#C9ACE5",
      300: "#B38CDA",
      400: "#A373D1",
      500: "#805AD5", // accent purple from design
      600: "#7451C0",
      700: "#6448A6",
      800: "#533E8C",
      900: "#382B61",
    }
  },
  fonts: {
    body: "'Inter', sans-serif",
    heading: "'Inter', sans-serif",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "500",
        borderRadius: "md",
      },
      variants: {
        solid: {
          bg: "primary.500",
          color: "white",
          _hover: {
            bg: "primary.600",
          },
        },
        outline: {
          border: "1px solid",
          borderColor: "primary.500",
          color: "primary.500",
        },
        ghost: {
          color: "primary.500",
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "md",
        },
      },
      variants: {
        outline: {
          field: {
            borderColor: "gray.300",
            _dark: {
              borderColor: "whiteAlpha.300",
            },
            _focus: {
              borderColor: "primary.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-primary-500)",
            },
          }
        }
      }
    },
    Avatar: {
      baseStyle: {
        container: {
          bg: "primary.500",
          color: "white",
        },
      },
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "white",
        color: props.colorMode === "dark" ? "white" : "gray.900",
      },
    }),
  },
});

export default theme;
