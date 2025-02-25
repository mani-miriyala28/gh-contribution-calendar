import { useParams } from "react-router-dom";
import ContributionCalendar from "@/components/ContributionCalendar";

const Index = ({ token }) => {
  const { username } = useParams();

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold text-center">
          GitHub Contribution Calendar
        </h1>
        <ContributionCalendar username={username} token={token} />
      </div>
    </div>
  );
};

export default Index;
