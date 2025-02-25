import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { Card } from "./ui/card";

const ContributionCalendarHeader = ({ username, handleLogout }) => {
  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium hidden sm:inline">Logged in as:</span>
          <span className="text-primary">{username}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </Card>
  );
};

export default ContributionCalendarHeader;
