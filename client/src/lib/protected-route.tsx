import { useAuth } from "@/hooks/use-auth";
import { Spinner, Flex } from "@chakra-ui/react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.FC<any>;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <Flex justifyContent="center" alignItems="center" minHeight="100vh">
          <Spinner size="xl" color="primary.500" thickness="4px" />
        </Flex>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
