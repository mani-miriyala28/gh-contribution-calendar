import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "/logo.png";

const Login = ({ setUsername, setToken }) => {
  const [identifier, setIdentifier] = useState("");
  const [token, setTokenLocal] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getIdentifierType = (value) => {
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Phone regex (supports formats like: +1234567890, 123-456-7890, (123) 456-7890)

    //const phoneRegex = /^\+?[\d\s()-]{10,}$/;

    // GitHub username regex (alphanumeric with single hyphens)
    const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

    if (emailRegex.test(value)) return "email";
    //if (phoneRegex.test(value)) return "phone";
    if (usernameRegex.test(value)) return "username";
    return "invalid";
  };

  const verifyGitHubCredentials = async (identifier: string, token: string) => {
    try {
      const identifierType = getIdentifierType(identifier);

      // First, verify the token by getting the authenticated user
      const authResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!authResponse.ok) {
        if (authResponse.status === 401) {
          setError("Invalid GitHub token");
          return false;
        }
        setError("Failed to verify credentials");
        return false;
      }

      const authData = await authResponse.json();
      console.log("authResponse", authData, authResponse);

      // Check if the provided identifier matches the token owner's details
      switch (identifierType) {
        case "email":
          if (authData.email !== identifier) {
            setError("Email does not match the token owner");
            return false;
          }
          break;
        case "username":
          if (authData.login.toLowerCase() !== identifier.toLowerCase()) {
            setError("Username does not match the token owner");
            return false;
          }
          break;
        // case "phone":
        //   setError("Phone verification not supported with GitHub directly");
        //   return false;
        case "invalid":
          setError("Invalid identifier format");
          return false;
      }

      return true;
    } catch (error) {
      setError("Network error occurred");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !token) {
      setError("Both fields are required.");
      return;
    }

    const identifierType = getIdentifierType(identifier);
    if (identifierType === "invalid") {
      setError("Please enter a valid email, phone number, or GitHub username");
      return;
    }

    const isValid = await verifyGitHubCredentials(identifier, token);
    if (isValid) {
      setUsername(identifier);
      setToken(token);
      navigate(`/calendar/gh/${identifier}`);
    }
  };

  const getIdentifierPlaceholder = () => {
    if (!identifier) return "Enter email or GitHub username";
    const type = getIdentifierType(identifier);
    switch (type) {
      case "email":
        return "Email address detected";
      // case "phone":
      //   return "Phone number detected";
      case "username":
        return "GitHub username detected";
      default:
        return "Invalid format";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <img src={logo} alt="Logo" className="h-16 mb-4" />
      <Card className="p-6 w-full max-w-md space-y-4">
        <h2 className="text-2xl font-semibold text-center">Login</h2>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium">
              Email / GitHub Username
            </label>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1"
              placeholder={getIdentifierPlaceholder()}
            />
            {identifier && (
              <span className="text-xs text-muted-foreground mt-1 block">
                {getIdentifierPlaceholder()}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="token" className="block text-sm font-medium">
              GitHub Personal Access Token
            </label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setTokenLocal(e.target.value)}
              className="mt-1"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Token must have 'repo' and 'user:email' scopes
            </div>
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Card>
      <footer className="mt-4 text-center text-sm text-neutral">
        Designed and developed by Mani Babu
      </footer>
    </div>
  );
};

export default Login;
