import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import AssessmentTimelinePage from "./page";
import { AssessmentTimelineClient, formatDuration } from "./client";

// Mock next/navigation
const mockNotFound = vi.fn();
vi.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound();
    throw new Error("NOT_FOUND");
  },
}));

// Mock admin check
vi.mock("@/lib/admin", () => ({
  requireAdmin: vi.fn(),
}));

// Mock the database
vi.mock("@/server/db", () => ({
  db: {
    assessment: {
      findUnique: vi.fn(),
    },
  },
}));

// Import after mock to get the mocked version
import { db } from "@/server/db";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockAssessment = {
  id: "assess-1",
  userId: "user-1",
  scenarioId: "scenario-1",
  status: "COMPLETED" as const,
  startedAt: new Date("2024-01-15T10:00:00Z"),
  completedAt: new Date("2024-01-15T11:30:00Z"),
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-01-15T11:30:00Z"),
  user: { id: "user-1", name: "John Doe", email: "john@example.com" },
  scenario: { id: "scenario-1", name: "Frontend Developer" },
  logs: [
    {
      id: "log-1",
      eventType: "STARTED" as const,
      timestamp: new Date("2024-01-15T10:00:00Z"),
      durationMs: null,
      metadata: null,
    },
    {
      id: "log-2",
      eventType: "PROMPT_SENT" as const,
      timestamp: new Date("2024-01-15T10:00:05Z"),
      durationMs: 5000,
      metadata: null,
    },
    {
      id: "log-3",
      eventType: "RESPONSE_RECEIVED" as const,
      timestamp: new Date("2024-01-15T10:00:07Z"),
      durationMs: 2000,
      metadata: null,
    },
    {
      id: "log-4",
      eventType: "COMPLETED" as const,
      timestamp: new Date("2024-01-15T11:30:00Z"),
      durationMs: 5400000,
      metadata: null,
    },
  ],
  apiCalls: [
    {
      id: "api-1",
      requestTimestamp: new Date("2024-01-15T10:00:06Z"),
      responseTimestamp: new Date("2024-01-15T10:00:07Z"),
      durationMs: 1000,
      modelVersion: "gemini-3-flash-preview",
      statusCode: 200,
      errorMessage: null,
      stackTrace: null,
      promptTokens: 100,
      responseTokens: 50,
    },
  ],
  recordings: [
    {
      id: "rec-1",
      type: "screen",
      storageUrl: "https://storage.example.com/video.webm",
      startTime: new Date("2024-01-15T10:00:00Z"),
      endTime: new Date("2024-01-15T11:30:00Z"),
    },
  ],
};

const mockAssessmentWithError = {
  ...mockAssessment,
  id: "assess-2",
  status: "WORKING" as const,
  completedAt: null,
  logs: [
    {
      id: "log-1",
      eventType: "STARTED" as const,
      timestamp: new Date("2024-01-16T09:00:00Z"),
      durationMs: null,
      metadata: null,
    },
    {
      id: "log-2",
      eventType: "ERROR" as const,
      timestamp: new Date("2024-01-16T09:30:00Z"),
      durationMs: 1800000,
      metadata: { error: "Connection timeout" },
    },
  ],
  apiCalls: [
    {
      id: "api-2",
      requestTimestamp: new Date("2024-01-16T09:10:00Z"),
      responseTimestamp: null,
      durationMs: null,
      modelVersion: "gemini-3-flash-preview",
      statusCode: null,
      errorMessage: "Connection timeout",
      stackTrace: "Error: Connection timeout\n  at fetchData (api.js:42)",
      promptTokens: null,
      responseTokens: null,
    },
  ],
  recordings: [],
};

describe("AssessmentTimelinePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches assessment with correct includes", async () => {
    (db.assessment.findUnique as Mock).mockResolvedValue(mockAssessment);

    await AssessmentTimelinePage({
      params: Promise.resolve({ id: "assess-1" }),
    });

    expect(db.assessment.findUnique).toHaveBeenCalledWith({
      where: { id: "assess-1" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        scenario: { select: { id: true, name: true } },
        logs: {
          orderBy: { timestamp: "asc" },
          select: {
            id: true,
            eventType: true,
            timestamp: true,
            durationMs: true,
            metadata: true,
          },
        },
        apiCalls: {
          orderBy: { requestTimestamp: "asc" },
          select: {
            id: true,
            requestTimestamp: true,
            responseTimestamp: true,
            durationMs: true,
            modelVersion: true,
            statusCode: true,
            errorMessage: true,
            stackTrace: true,
            promptTokens: true,
            responseTokens: true,
          },
        },
        recordings: {
          select: {
            id: true,
            type: true,
            storageUrl: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });
  });

  it("calls notFound when assessment does not exist", async () => {
    (db.assessment.findUnique as Mock).mockResolvedValue(null);

    await expect(
      AssessmentTimelinePage({
        params: Promise.resolve({ id: "nonexistent" }),
      })
    ).rejects.toThrow("NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalled();
  });

  it("serializes dates to strings", async () => {
    (db.assessment.findUnique as Mock).mockResolvedValue(mockAssessment);

    const result = await AssessmentTimelinePage({
      params: Promise.resolve({ id: "assess-1" }),
    });

    const assessment = result.props.assessment;
    expect(typeof assessment.createdAt).toBe("string");
    expect(typeof assessment.startedAt).toBe("string");
    expect(typeof assessment.logs[0].timestamp).toBe("string");
    expect(typeof assessment.apiCalls[0].requestTimestamp).toBe("string");
    expect(typeof assessment.recordings[0].startTime).toBe("string");
  });
});

describe("AssessmentTimelineClient", () => {
  const serializedAssessment = {
    ...mockAssessment,
    startedAt: mockAssessment.startedAt.toISOString(),
    completedAt: mockAssessment.completedAt?.toISOString() ?? null,
    createdAt: mockAssessment.createdAt.toISOString(),
    updatedAt: mockAssessment.updatedAt.toISOString(),
    logs: mockAssessment.logs.map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    })),
    apiCalls: mockAssessment.apiCalls.map((call) => ({
      ...call,
      requestTimestamp: call.requestTimestamp.toISOString(),
      responseTimestamp: call.responseTimestamp?.toISOString() ?? null,
    })),
    recordings: mockAssessment.recordings.map((rec) => ({
      ...rec,
      startTime: rec.startTime.toISOString(),
      endTime: rec.endTime?.toISOString() ?? null,
    })),
  };

  const serializedErrorAssessment = {
    ...mockAssessmentWithError,
    startedAt: mockAssessmentWithError.startedAt.toISOString(),
    completedAt: null,
    createdAt: mockAssessmentWithError.createdAt.toISOString(),
    updatedAt: mockAssessmentWithError.updatedAt.toISOString(),
    logs: mockAssessmentWithError.logs.map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    })),
    apiCalls: mockAssessmentWithError.apiCalls.map((call) => ({
      ...call,
      requestTimestamp: call.requestTimestamp.toISOString(),
      responseTimestamp: null,
    })),
    recordings: [],
  };

  describe("Page Header", () => {
    it("renders the page title", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      expect(screen.getByText("Assessment Timeline")).toBeInTheDocument();
    });

    it("renders back link to assessments list", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      const backLink = screen.getByTestId("back-link");
      expect(backLink).toHaveAttribute("href", "/admin/assessments");
    });
  });

  describe("Candidate Info Section", () => {
    it("displays candidate name", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      expect(screen.getByTestId("candidate-name")).toHaveTextContent("John Doe");
    });

    it("displays candidate email", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      expect(screen.getByTestId("candidate-email")).toHaveTextContent(
        "john@example.com"
      );
    });

    it("displays completion date", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      const completionDate = screen.getByTestId("completion-date");
      expect(completionDate).toBeInTheDocument();
      expect(completionDate).not.toHaveTextContent("In Progress");
    });

    it("shows 'In Progress' when not completed", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );
      expect(screen.getByTestId("completion-date")).toHaveTextContent(
        "In Progress"
      );
    });

    it("shows 'Anonymous' when name is null", () => {
      const anonymousAssessment = {
        ...serializedAssessment,
        user: { ...serializedAssessment.user, name: null },
      };
      render(<AssessmentTimelineClient assessment={anonymousAssessment} />);
      expect(screen.getByTestId("candidate-name")).toHaveTextContent(
        "Anonymous"
      );
    });
  });

  describe("Total Duration Card", () => {
    it("displays total duration prominently", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      expect(screen.getByTestId("total-duration")).toHaveTextContent("90m");
    });

    it("shows 'In Progress' when no completion time", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );
      expect(screen.getByTestId("total-duration")).toHaveTextContent(
        "In Progress"
      );
    });

    it("displays status badge", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      expect(screen.getByTestId("status-badge")).toHaveTextContent("COMPLETED");
    });

    it("shows error indicator when assessment has errors", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );
      expect(screen.getByText("HAS ERRORS")).toBeInTheDocument();
    });

    it("has red styling when assessment has errors", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );
      const card = screen.getByTestId("total-duration-card");
      expect(card).toHaveClass("border-red-500");
    });
  });

  describe("Video Recording Link", () => {
    it("displays video recording link when recording exists", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      expect(screen.getByTestId("video-recording-link")).toBeInTheDocument();
    });

    it("has correct recording URL", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      const button = screen.getByTestId("view-recording-button");
      expect(button).toHaveAttribute(
        "href",
        "https://storage.example.com/video.webm"
      );
    });

    it("does not display recording link when no recording", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );
      expect(
        screen.queryByTestId("video-recording-link")
      ).not.toBeInTheDocument();
    });
  });

  describe("Assessment Info Section", () => {
    it("displays assessment ID", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      const info = screen.getByTestId("assessment-info");
      expect(within(info).getByText("assess-1")).toBeInTheDocument();
    });

    it("displays scenario name", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      const info = screen.getByTestId("assessment-info");
      expect(within(info).getByText("Frontend Developer")).toBeInTheDocument();
    });

    it("displays event count", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      const info = screen.getByTestId("assessment-info");
      // 4 logs + 1 API call = 5 events
      expect(within(info).getByText("5 total")).toBeInTheDocument();
    });
  });

  describe("Timeline Events", () => {
    it("renders all timeline events", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      const timeline = screen.getByTestId("timeline");
      // 4 logs + 1 API call = 5 events
      expect(within(timeline).getByText("Assessment Started")).toBeInTheDocument();
      expect(within(timeline).getByText("Prompt Sent")).toBeInTheDocument();
      expect(within(timeline).getByText("Response Received")).toBeInTheDocument();
      expect(within(timeline).getByText("Assessment Completed")).toBeInTheDocument();
      expect(within(timeline).getByText("API Call")).toBeInTheDocument();
    });

    it("displays event times", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      // Events should have time displayed
      const event = screen.getByTestId("timeline-event-log-1");
      expect(event).toBeInTheDocument();
    });

    it("shows duration between events", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      // Duration markers should appear between events
      const durationMarker = screen.getByTestId("duration-marker-log-2");
      expect(durationMarker).toBeInTheDocument();
      expect(durationMarker).toHaveTextContent("+5.0s");
    });

    it("displays API call model version", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      expect(
        screen.getByText("Model: gemini-3-flash-preview")
      ).toBeInTheDocument();
    });

    it("displays API call token count", () => {
      render(<AssessmentTimelineClient assessment={serializedAssessment} />);
      // 100 + 50 = 150 tokens
      expect(screen.getByText("Tokens: 150")).toBeInTheDocument();
    });

    it("shows empty state when no events", () => {
      const emptyAssessment = {
        ...serializedAssessment,
        logs: [],
        apiCalls: [],
      };
      render(<AssessmentTimelineClient assessment={emptyAssessment} />);
      expect(
        screen.getByText("No events recorded for this assessment")
      ).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("highlights error events in red", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );
      // Check the error event container has red styling
      const errorEvent = screen.getByTestId("timeline-event-log-2");
      const redDiv = errorEvent.querySelector('[class*="bg-red-50"]');
      expect(redDiv).toBeInTheDocument();
    });

    it("shows error label in event title", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );
      // The ERROR event should show "Error" as its label
      const timeline = screen.getByTestId("timeline");
      expect(within(timeline).getAllByText("Error").length).toBeGreaterThan(0);
    });

    it("expands error details when clicked", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );

      // Click on the error log event (which has metadata)
      const errorEvent = screen.getByTestId("timeline-event-log-2");
      const clickableDiv = errorEvent.querySelector('[class*="cursor-pointer"]');
      expect(clickableDiv).toBeInTheDocument();
      fireEvent.click(clickableDiv!);

      // Error details should be visible
      expect(screen.getByTestId("error-details-log-2")).toBeInTheDocument();
    });

    it("displays error message in expanded view", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );

      // Click to expand the API call error (which has errorMessage)
      const apiCallEvent = screen.getByTestId("timeline-event-api-2");
      const clickableDiv = apiCallEvent.querySelector('[class*="cursor-pointer"]');
      fireEvent.click(clickableDiv!);

      expect(screen.getByText("Connection timeout")).toBeInTheDocument();
    });

    it("displays stack trace in expanded view", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );

      // Click to expand the API call error
      const apiCallEvent = screen.getByTestId("timeline-event-api-2");
      const clickableDiv = apiCallEvent.querySelector('[class*="cursor-pointer"]');
      fireEvent.click(clickableDiv!);

      expect(
        screen.getByText(/Error: Connection timeout/)
      ).toBeInTheDocument();
    });

    it("collapses error details when clicked again", () => {
      render(
        <AssessmentTimelineClient assessment={serializedErrorAssessment} />
      );

      const apiCallEvent = screen.getByTestId("timeline-event-api-2");
      const clickableDiv = apiCallEvent.querySelector('[class*="cursor-pointer"]');
      fireEvent.click(clickableDiv!);
      expect(screen.getByTestId("error-details-api-2")).toBeInTheDocument();

      fireEvent.click(clickableDiv!);
      expect(
        screen.queryByTestId("error-details-api-2")
      ).not.toBeInTheDocument();
    });

    it("highlights long durations in amber", () => {
      // Create an assessment with a long gap between events (>30 seconds)
      const longDurationAssessment = {
        ...serializedAssessment,
        logs: [
          {
            id: "log-1",
            eventType: "STARTED" as const,
            timestamp: "2024-01-15T10:00:00.000Z",
            durationMs: null,
            metadata: null,
          },
          {
            id: "log-2",
            eventType: "COMPLETED" as const,
            timestamp: "2024-01-15T10:01:00.000Z", // 60 seconds later
            durationMs: 60000,
            metadata: null,
          },
        ],
        apiCalls: [],
      };

      render(
        <AssessmentTimelineClient assessment={longDurationAssessment} />
      );

      const durationMarker = screen.getByTestId("duration-marker-log-2");
      expect(durationMarker.querySelector("span")).toHaveClass("border-amber-500");
    });
  });
});

describe("formatDuration utility", () => {
  it("formats milliseconds", () => {
    expect(formatDuration(500)).toBe("500ms");
    expect(formatDuration(999)).toBe("999ms");
  });

  it("formats seconds", () => {
    expect(formatDuration(1000)).toBe("1.0s");
    expect(formatDuration(2500)).toBe("2.5s");
    expect(formatDuration(59999)).toBe("60.0s");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(60000)).toBe("1m");
    expect(formatDuration(90000)).toBe("1m 30s");
    expect(formatDuration(3600000)).toBe("60m");
    expect(formatDuration(5400000)).toBe("90m");
  });
});
