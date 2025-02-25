import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  format,
  subYears,
  eachWeekOfInterval,
  eachDayOfInterval,
  addWeeks,
} from "date-fns";
import { Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import themes from "../utils/theme";
import { fetchGitHubContributions, Contribution } from "../utils/github";
import ContributionCalendarHeader from "./ContributionCalendarHeader";
import ContributionCalendarFooter from "./ContributionCalendarFooter";

const ContributionCalendar = ({ username, token }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear any stored credentials if needed
    navigate("/login");
  };
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: subYears(new Date(), 1),
    endDate: new Date(),
  });
  const [selectedButton, setSelectedButton] = useState<string>("lastYear");
  const [selectedTheme, setSelectedTheme] = useState<string>("classic");

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading contributions data for the selected year
    setTimeout(() => {
      fetchGitHubContributions(
        username,
        token,
        selectedYear.startDate,
        selectedYear.endDate
      ).then((Data) => {
        setContributions(Data);
        setIsLoading(false);
      });
    }, 1000);
  }, [selectedYear, username, token]);

  const getContributionLevel = (count: number) => {
    const theme = themes[selectedTheme];
    if (count === 0) return theme.noContributions;
    if (count <= 1) return theme.low;
    if (count <= 3) return theme.moderate;
    if (count <= 6) return theme.high;
    return theme.veryHigh;
  };

  const getTotalContributions = () => {
    return contributions.reduce((sum, day) => sum + day.count, 0);
  };

  const getMonths = () => {
    const months = [];
    const start = selectedYear.startDate;
    const end = selectedYear.endDate;
    let current = start;

    while (current <= end) {
      months.push(format(current, "MMM"));
      current = addWeeks(current, 4); // Move to the next month
    }

    return months;
  };

  const getContributionForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return contributions.find((c) => c.date === dateStr)?.count || 0;
  };

  const getWeeks = () => {
    const start = selectedYear.startDate;
    const end = selectedYear.endDate;
    return eachWeekOfInterval({ start, end });
  };

  const getDaysInWeek = (weekStart: Date) => {
    return eachDayOfInterval({
      start: weekStart,
      end: addWeeks(weekStart, 1),
    }).slice(0, 7);
  };

  const handleYearChange = (startDate: Date, endDate: Date) => {
    setSelectedYear({ startDate, endDate });
  };

  const getLastContributionDate = (contributionsData: Contribution[]) => {
    let lastContributionDate = null;

    for (let i = 0; i < contributionsData.length; i++) {
      if (contributionsData[i].count > 0) {
        lastContributionDate = contributionsData[i].date;
      }
    }

    return formatDate(lastContributionDate);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No contributions found";
    const date = new Date(dateString);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const daySuffix = getDaySuffix(day);

    return `${month} ${day}${daySuffix}, ${year}`;
  };

  const getDaySuffix = (day: number) => {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 w-full animate-fadeIn">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-flow-col gap-1 overflow-x-auto">
            {Array.from({ length: 53 }).map((_, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-4 h-4 bg-gray-200 rounded-sm animate-pulse"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <ContributionCalendarHeader
        username={username}
        handleLogout={handleLogout}
      />
      <Card className="p-6 animate-fadeIn max-w-full">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold hidden sm:inline">
                Contribution Calendar
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedButton === "lastYear" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastYear = subYears(today, 1);
                  handleYearChange(lastYear, today);
                  setSelectedButton("lastYear");
                }}
              >
                Last Year
              </Button>
              {[2025, 2024, 2023, 2022].map((year) => (
                <Button
                  key={year}
                  variant={
                    selectedButton === year.toString() ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    handleYearChange(
                      new Date(year, 0, 1),
                      new Date(year, 11, 31)
                    );
                    setSelectedButton(year.toString());
                  }}
                >
                  {year}
                </Button>
              ))}
            </div>
            <div>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="border rounded p-1"
              >
                {Object.keys(themes).map((theme) => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center text-lg font-semibold">
            {getTotalContributions()} contributions in {selectedButton}
          </div>

          <div className="space-y-2 overflow-x-auto">
            <div className="flex min-w-[1000px]">
              <div className="w-16">
                <div className="h-3" /> {/* Spacer for alignment */}
                <div className="grid grid-rows-7 gap-1 text-xs text-neutral pt-3">
                  <div>SUN</div>
                  <div className="invisible">MON</div>
                  <div>TUE</div>
                  <div className="invisible">WED</div>
                  <div>THU</div>
                  <div className="invisible">FRI</div>
                  <div>SAT</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-neutral mb-2">
                  {getMonths().map((month) => (
                    <div key={month}>{month}</div>
                  ))}
                </div>
                <div className="relative">
                  <TooltipProvider>
                    <div className="grid grid-flow-col gap-1">
                      {getWeeks().map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-rows-7 gap-1">
                          {getDaysInWeek(week).map((day, dayIndex) => (
                            <Tooltip key={`${weekIndex}-${dayIndex}`}>
                              <TooltipTrigger>
                                <div
                                  className={`w-4 h-4 rounded-sm transition-colors duration-200`}
                                  style={{
                                    backgroundColor: getContributionLevel(
                                      getContributionForDate(day)
                                    ),
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <div>{format(day, "MMMM d, yyyy")}</div>
                                  <div>
                                    {getContributionForDate(day)} contribution
                                    {getContributionForDate(day) !== 1
                                      ? "s"
                                      : ""}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center text-sm">
              Last contributed on: {getLastContributionDate(contributions)}
            </div>
            <div className="flex items-center justify-end space-x-2 text-sm">
              <span className="text-neutral">Less</span>
              <div className="flex space-x-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-4 h-4 rounded-sm`}
                    style={{ backgroundColor: getContributionLevel(level) }}
                  />
                ))}
              </div>
              <span className="text-neutral">More</span>
            </div>
          </div>
        </div>
      </Card>
      <ContributionCalendarFooter />
    </>
  );
};

export default ContributionCalendar;
