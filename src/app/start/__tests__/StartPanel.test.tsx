import { describe, it, expect, afterEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithinWorkspace } from "@/testing-utils/render";
import TimeCoursePanel from "@/app/simulation/TimeCoursePanel";
import StartPanel from "../StartPanel";
import { resetMockFiles, setMockFile } from "@/testing-utils/mockFileSystem";
import { getNewProjectData, type ProjectData } from "@/features/projectData";

afterEach(() => {
  resetMockFiles();
});

const getProjectDataWithName = (name: string): ProjectData => {
  const data = getNewProjectData();
  data.metadata.name = name;
  return data;
};

describe("selecting project", () => {
  it("should enable simulation", async () => {
    setMockFile("1", getProjectDataWithName("test"));

    await renderWithinWorkspace(
      <>
        <TimeCoursePanel visible />
        <StartPanel />
      </>,
      { shouldStubActiveFile: false },
    );

    expect(screen.queryByText("Simulate")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("test"));

    expect(screen.getByText("Simulate")).toBeInTheDocument();
  });
});

describe("creating a project", () => {
  it("should enable simulation", async () => {
    await renderWithinWorkspace(
      <>
        <TimeCoursePanel visible />
        <StartPanel />
      </>,
      { shouldStubActiveFile: false },
    );

    expect(screen.queryByText("Simulate")).not.toBeInTheDocument();

    // eslint-disable-next-line
    const myProjects = screen.getByText("My Projects").parentElement!;

    await userEvent.click(within(myProjects).getByText("New Project"));

    expect(screen.getByText("Simulate")).toBeInTheDocument();
  });
});
