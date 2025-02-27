import { useEffect, useState, useCallback } from "react";
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
  startOfMonth,
  addDays,
} from "date-fns";
import {
  Calendar,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import themes from "../utils/theme";
import {
  fetchGitHubContributions,
  fetchContributionDetails,
  Contribution,
  ContributionDetails,
} from "../utils/github";
import ContributionCalendarHeader from "./ContributionCalendarHeader";
import ContributionCalendarFooter from "./ContributionCalendarFooter";
import { throttle, debounce } from "lodash";

const ContributionCalendar = ({ username, token }) => {
  const navigate = useNavigate();
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
  const [selectedTheme, setSelectedTheme] = useState<string>("galaxy");
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [highlightedCell, setHighlightedCell] = useState<string | null>(null);
  const [pinnedTooltip, setPinnedTooltip] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    date: string;
    formattedDate: string;
    contributionCount: number;
    details: ContributionDetails | null;
    isLoading: boolean;
  } | null>(null);

  const handleLogout = () => {
    navigate("/login");
  };

  useEffect(() => {
    setIsLoading(true);
    // Reset all selections when year changes
    setSelectedLevel(null);
    setSelectedCell(null);
    setActiveTooltip(null);
    setHighlightedCell(null);
    setPinnedTooltip(null);
    setSelectedDayDetails(null);

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

  // Fetch details when a day is selected
  useEffect(() => {
    if (selectedDayDetails && selectedDayDetails.isLoading) {
      fetchContributionDetails(username, token, selectedDayDetails.date)
        .then((details) => {
          setSelectedDayDetails((prev) =>
            prev
              ? {
                  ...prev,
                  details,
                  isLoading: false,
                }
              : null
          );
        })
        .catch(() => {
          setSelectedDayDetails((prev) =>
            prev
              ? {
                  ...prev,
                  details: {
                    commits: 0,
                    pullRequests: 0,
                    mergeRequests: 0,
                    pushes: 0,
                    branchesContributed: 0,
                  },
                  isLoading: false,
                }
              : null
          );
        });
    }
  }, [selectedDayDetails, username, token]);

  const getContributionLevel = (count: number) => {
    const theme = themes[selectedTheme];
    if (count === 0) return theme.noContributions;
    if (count <= 2) return theme.low;
    if (count <= 4) return theme.moderate;
    if (count <= 6) return theme.high;
    return theme.veryHigh;
  };

  const getContributionLevelName = (count: number): string => {
    if (count === 0) return "noContributions";
    if (count <= 2) return "low";
    if (count <= 4) return "moderate";
    if (count <= 6) return "high";
    return "veryHigh";
  };

  const handleLevelClick = (level: string) => {
    if (selectedLevel === level) {
      setSelectedLevel(null);
    } else {
      setSelectedLevel(level);
    }
  };

  const getTotalContributions = () => {
    return contributions.reduce((sum, day) => sum + day.count, 0);
  };

  const getMonths = () => {
    const weeks = getWeeks();
    if (weeks.length === 0) return [];

    // Find the first day of each month and its position
    const monthPositions = new Map();

    // Iterate through all weeks and days
    weeks.forEach((week, weekIndex) => {
      const daysInWeek = getDaysInWeek(week);

      daysInWeek.forEach((day) => {
        // If this is the first day of a month
        if (day.getDate() === 1) {
          const monthKey = day.getMonth();
          if (!monthPositions.has(monthKey)) {
            monthPositions.set(monthKey, {
              label: format(day, "MMM"),
              position: weekIndex,
            });
          }
        }
      });
    });

    // Convert to array and sort by position
    return Array.from(monthPositions.values()).sort(
      (a, b) => a.position - b.position
    );
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
      end: addDays(weekStart, 6),
    });
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
    if (day >= 11 && day <= 13) return "th";
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

  const handleTooltipClick = (date: string) => {
    if (pinnedTooltip === date) {
      setPinnedTooltip(null);
      setActiveTooltip(null);
      setHighlightedCell(null);
    } else if (!pinnedTooltip) {
      setActiveTooltip(activeTooltip === date ? null : date);
    }
  };

  const handleTooltipMouseEnter = (date: string) => {
    if (!pinnedTooltip) {
      setActiveTooltip(date);
    }
  };

  const handleTooltipMouseLeave = () => {
    if (!pinnedTooltip) {
      setActiveTooltip(null);
    }
  };

  const handleDoubleClick = (date: string) => {
    if (pinnedTooltip === date) {
      setPinnedTooltip(null);
      setHighlightedCell(null);
      setActiveTooltip(null);
    } else {
      setPinnedTooltip(date);
      setHighlightedCell(date);
      setActiveTooltip(date);
    }
  };

  // Throttled mouse handlers
  const throttledMouseEnter = useCallback(
    throttle((dateStr: string) => {
      if (!selectedCell) {
        setActiveTooltip(dateStr);
      }
    }, 100),
    [selectedCell]
  );

  const throttledMouseLeave = useCallback(
    throttle(() => {
      if (!selectedCell) {
        setActiveTooltip(null);
      }
    }, 100),
    [selectedCell]
  );

  // Debounced click handlers
  const debouncedCalendarCellClick = useCallback(
    debounce((dateStr: string, day: Date, count: number) => {
      if (selectedCell === dateStr) {
        setSelectedCell(null);
        setActiveTooltip(null);
        setSelectedDayDetails(null);
      } else {
        setSelectedCell(dateStr);
        setActiveTooltip(dateStr);
        setSelectedDayDetails({
          date: dateStr,
          formattedDate: format(day, "MMMM d, yyyy"),
          contributionCount: count,
          details: null,
          isLoading: true,
        });
      }
      setSelectedLevel(null);
    }, 200),
    [selectedCell]
  );

  const debouncedLevelClick = useCallback(
    debounce((level: string) => {
      if (selectedLevel === level) {
        setSelectedLevel(null);
      } else {
        setSelectedLevel(level);
      }
      setSelectedCell(null);
      setActiveTooltip(null);
      setSelectedDayDetails(null);
    }, 200),
    [selectedLevel]
  );

  useEffect(() => {
    return () => {
      throttledMouseEnter.cancel();
      throttledMouseLeave.cancel();
      debouncedCalendarCellClick.cancel();
      debouncedLevelClick.cancel();
    };
  }, [
    throttledMouseEnter,
    throttledMouseLeave,
    debouncedCalendarCellClick,
    debouncedLevelClick,
  ]);

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

  const months = getMonths();
  const weeks = getWeeks();

  return (
    <>
      <ContributionCalendarHeader
        username={username}
        handleLogout={handleLogout}
      />
      <Card className="p-6 animate-fadeIn max-w-full overflow-hidden">
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
                <div className="h-5" />
                <div className="grid grid-rows-7 gap-1 text-xs text-neutral">
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
                {/* Month labels with proper alignment to month start */}
                <div className="h-5 relative">
                  {months.map((month, i) => (
                    <div
                      key={i}
                      className="absolute text-xs text-neutral"
                      style={{
                        left: `${(month.position / (weeks.length - 1)) * 100}%`,
                      }}
                    >
                      {month.label}
                    </div>
                  ))}
                </div>
                <div className="relative contribution-grid">
                  <TooltipProvider>
                    <div className="grid grid-flow-col gap-1">
                      {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-rows-7 gap-1">
                          {getDaysInWeek(week).map((day, dayIndex) => {
                            const dateStr = format(day, "yyyy-MM-dd");
                            const contributionCount =
                              getContributionForDate(day);
                            const currentLevel =
                              getContributionLevelName(contributionCount);
                            const isLevelHighlighted =
                              selectedLevel === currentLevel;
                            const isCellHighlighted = selectedCell === dateStr;
                            const shouldFade =
                              (selectedLevel && !isLevelHighlighted) ||
                              (selectedCell && !isCellHighlighted);

                            return (
                              <Tooltip
                                key={`${weekIndex}-${dayIndex}`}
                                open={
                                  isCellHighlighted || activeTooltip === dateStr
                                }
                              >
                                <TooltipTrigger
                                  onClick={() =>
                                    debouncedCalendarCellClick(
                                      dateStr,
                                      day,
                                      contributionCount
                                    )
                                  }
                                  onMouseEnter={() =>
                                    throttledMouseEnter(dateStr)
                                  }
                                  onMouseLeave={throttledMouseLeave}
                                  className="relative"
                                >
                                  <div
                                    className={`w-4 h-4 rounded-sm transition-all duration-200`}
                                    style={{
                                      backgroundColor:
                                        getContributionLevel(contributionCount),
                                      opacity: shouldFade ? "0.3" : "1",
                                      transform:
                                        isLevelHighlighted || isCellHighlighted
                                          ? "scale(1.1)"
                                          : "scale(1)",
                                      border: isCellHighlighted
                                        ? "2px solid black"
                                        : "none",
                                    }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="z-[100]">
                                  <div className="text-sm">
                                    <div>{format(day, "MMMM d, yyyy")}</div>
                                    <div>
                                      {contributionCount} contribution
                                      {contributionCount !== 1 ? "s" : ""}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          {/* Selected day contribution details */}
          {selectedDayDetails && (
            <div className="p-4 bg-accent rounded-md">
              <h3 className="font-medium text-lg">
                {selectedDayDetails.formattedDate}
              </h3>

              {selectedDayDetails.isLoading ? (
                <div className="animate-pulse space-y-2 mt-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : selectedDayDetails.contributionCount === 0 ? (
                <p className="text-muted-foreground mt-1">
                  No activity on this day
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  <p className="font-medium">
                    {selectedDayDetails.contributionCount} total contribution
                    {selectedDayDetails.contributionCount !== 1 ? "s" : ""}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <GitCommit className="h-4 w-4" />
                      <span>
                        {selectedDayDetails.details?.commits || 0} commits
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="h-4 w-4" />
                      <span>
                        {selectedDayDetails.details?.pullRequests || 0} pull
                        requests
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitMerge className="h-4 w-4" />
                      <span>
                        {selectedDayDetails.details?.mergeRequests || 0} merge
                        requests
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      <span>
                        {selectedDayDetails.details?.branchesContributed || 0}{" "}
                        branches
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center text-sm">
              Last contributed on: {getLastContributionDate(contributions)}
            </div>
            <div className="flex items-center justify-end space-x-2 text-sm">
              <span className="text-neutral">Less</span>
              <div className="flex space-x-1">
                {["noContributions", "low", "moderate", "high", "veryHigh"].map(
                  (level) => (
                    <div
                      key={level}
                      className={`w-4 h-4 rounded-sm cursor-pointer transition-all duration-200`}
                      style={{
                        backgroundColor: themes[selectedTheme][level],
                        transform:
                          selectedLevel === level ? "scale(1.1)" : "scale(1)",
                        opacity:
                          selectedLevel && selectedLevel !== level
                            ? "0.3"
                            : "1",
                        boxShadow:
                          selectedLevel === level
                            ? "0 0 0 2px rgba(0,0,0,0.1)"
                            : "none",
                      }}
                      onClick={() => debouncedLevelClick(level)}
                    />
                  )
                )}
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
