import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "/logo.png";

const Login = ({ setUsername, setToken }) => {
  const [username, setUsernameLocal] = useState("");
  const [token, setTokenLocal] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const verifyGitHubCredentials = async (username: string, token: string) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid GitHub token");
          return false;
        }
        if (response.status === 404) {
          setError("GitHub username not found");
          return false;
        }
        setError("Failed to verify credentials");
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
    if (!username || !token) {
      setError("Both fields are required.");
      return;
    }
    const isValid = await verifyGitHubCredentials(username, token);
    if (isValid) {
      setUsername(username);
      setToken(token);
      navigate(`/calendar/gh/${username}`);
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
            <label htmlFor="username" className="block text-sm font-medium">
              GitHub Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsernameLocal(e.target.value)}
              className="mt-1"
            />
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
