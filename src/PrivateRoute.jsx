import React, { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { hasRole, hasAnyRole, normalizeRoles, getDashboardRoute, hasPermission, ROUTE_ACCESS } from "./config/roles";
import { getUser, getToken, getRoles } from "./utils/apiService";

/**
 * PrivateRoute - Enhanced route protection with role-based access control
 *
 * @param {Object} props
 * @param {string} props.role - Single required role (optional)
 * @param {string[]} props.roles - Multiple allowed roles (optional)
 * @param {string} props.permission - Required permission (optional)
 * @param {boolean} props.requireAll - If true, user must have all specified roles
 * @param {React.ReactNode} props.children - Child components to render
 * @param {React.ReactNode} props.fallback - Custom fallback for unauthorized access
 */
const PrivateRoute = ({
  role,
  roles,
  permission: _permission,
  requireAll = false,
  children,
  fallback,
}) => {
  const location = useLocation();

  // Get auth data from storage
  const authData = useMemo(() => {
    const token = getToken();
    const user = getUser();
    const userRoles = getRoles();

    return {
      token,
      user,
      userRoles: normalizeRoles(userRoles),
      isAuthenticated: !!(token && user),
    };
  }, []);

  const { userRoles, isAuthenticated } = authData;

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    // Save the intended destination for redirect after login
    return (
      <Navigate
        to="/LandingPage"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Check role requirements
  let hasAccess = true;

  // Check single role
  if (role) {
    hasAccess = hasRole(userRoles, role);
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    if (requireAll) {
      // Must have ALL specified roles
      hasAccess = roles.every(r => hasRole(userRoles, r));
    } else {
      // Must have ANY of the specified roles
      hasAccess = hasAnyRole(userRoles, roles);
    }
  }

  // Check route-level access (uses ROUTE_ACCESS config)
  const routeConfig = ROUTE_ACCESS[location.pathname];
  if (routeConfig && routeConfig.roles) {
    hasAccess = hasAccess && hasAnyRole(userRoles, routeConfig.roles);
  }

  // Access denied - show fallback or redirect
  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    // Default access denied UI
    return (
      <AccessDenied
        userRoles={userRoles}
        requiredRole={role}
        requiredRoles={roles}
      />
    );
  }

  // Access granted - render children or outlet
  return children ? children : <Outlet />;
};

/**
 * AccessDenied - Component shown when user lacks required permissions
 */
const AccessDenied = ({ userRoles, requiredRole, requiredRoles }) => {
  const dashboardRoute = getDashboardRoute(userRoles);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        p: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: "center",
          maxWidth: 500,
          borderRadius: 4,
        }}
      >
        <LockIcon sx={{ fontSize: 80, color: "#e53935", mb: 3 }} />

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Access Denied
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You do not have permission to access this page.
          {requiredRole && (
            <Typography component="span" sx={{ display: "block", mt: 1 }}>
              Required role: <strong>{requiredRole}</strong>
            </Typography>
          )}
          {requiredRoles && requiredRoles.length > 0 && (
            <Typography component="span" sx={{ display: "block", mt: 1 }}>
              Required roles: <strong>{requiredRoles.join(", ")}</strong>
            </Typography>
          )}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            href={dashboardRoute}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => window.history.back()}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

/**
 * RequirePermission - HOC to check specific permissions
 */
export const RequirePermission = ({ permission, children, fallback }) => {
  const userRoles = useMemo(() => {
    return normalizeRoles(getRoles());
  }, []);

  const hasAccess = useMemo(() => {
    return hasPermission(userRoles, permission);
  }, [userRoles, permission]);

  if (!hasAccess) {
    return fallback || null;
  }

  return children;
};

/**
 * withRoleProtection - HOC to add role protection to any component
 */
export const withRoleProtection = (Component, requiredRoles) => {
  return function ProtectedComponent(props) {
    return (
      <PrivateRoute roles={requiredRoles}>
        <Component {...props} />
      </PrivateRoute>
    );
  };
};

export default PrivateRoute;
