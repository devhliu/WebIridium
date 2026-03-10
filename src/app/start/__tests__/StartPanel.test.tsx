import { describe, it, expect, afterEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithinWorkspace } from "@/testing-utils/render";
import TimeCoursePanel from "@/app/simulation/TimeCoursePanel";
import StartPanel from "../StartPanel";
import AppMenubar from "@/app/AppMenubar";
import {
  removeMockFile,
  resetMockFiles,
  setMockFile,
} from "@/testing-utils/mockFileSystem";
import { getNewProjectData, type ProjectData } from "@/features/savedData";
import {
  resetWorkerResponseDelay,
  setWorkerResponseDelay,
} from "@/testing-utils/mockWorker";
import { getToastHistory } from "@/testing-utils/mockToast";

afterEach(() => {
  resetMockFiles();
  resetWorkerResponseDelay();
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

  it("should show project name in menubar", async () => {
    setMockFile("1", getProjectDataWithName("test"));

    await renderWithinWorkspace(
      <>
        <AppMenubar />
        <TimeCoursePanel visible />
        <StartPanel />
      </>,
      { shouldStubActiveFile: false },
    );

    const menubar = screen.getByTestId("app-menubar");
    expect(screen.queryByText("Simulate")).not.toBeInTheDocument();
    expect(within(menubar).queryByText("test")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("test"));

    expect(within(menubar).getByText("test")).toBeInTheDocument();
  });

  it("should open the first selected one", async () => {
    setMockFile("1", getProjectDataWithName("test1"));
    setMockFile("2", getProjectDataWithName("test2"));
    setMockFile("3", getProjectDataWithName("test3"));

    await renderWithinWorkspace(
      <>
        <AppMenubar />
        <TimeCoursePanel visible />
        <StartPanel />
      </>,
      { shouldStubActiveFile: false },
    );

    const menubar = screen.getByTestId("app-menubar");
    expect(screen.queryByText("Simulate")).not.toBeInTheDocument();
    expect(within(menubar).queryByText("test1")).not.toBeInTheDocument();

    setWorkerResponseDelay(50);

    await userEvent.click(screen.getByText("test1"));
    await userEvent.click(screen.getByText("test2"));
    await userEvent.click(screen.getByText("test3"));

    await waitFor(() => {
      expect(within(menubar).getByText("test1")).toBeInTheDocument();
    });
  });

  it("should have a reasonable error message if the file no longer exists", async () => {
    setMockFile("1", getProjectDataWithName("test"));

    await renderWithinWorkspace(
      <>
        <TimeCoursePanel visible />
        <StartPanel />
      </>,
      { shouldStubActiveFile: false },
    );

    removeMockFile("1");

    await userEvent.click(screen.getByText("test"));

    const toastHistory = getToastHistory();
    expect(toastHistory).toHaveLength(1);
    expect(toastHistory[0].description).toMatch(/deleted/i);
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

  it("should show project name in menubar", async () => {
    await renderWithinWorkspace(
      <>
        <AppMenubar />
        <TimeCoursePanel visible />
        <StartPanel />
      </>,
      { shouldStubActiveFile: false },
    );

    const menubar = screen.getByTestId("app-menubar");
    expect(screen.queryByText("Simulate")).not.toBeInTheDocument();
    expect(within(menubar).queryByText("test")).not.toBeInTheDocument();

    // eslint-disable-next-line
    const myProjects = screen.getByText("My Projects").parentElement!;
    await userEvent.click(within(myProjects).getByText("New Project"));

    const defaultName = getNewProjectData().metadata.name;
    expect(within(menubar).getByText(defaultName)).toBeInTheDocument();
  });

  it("should not create if opening a project", async () => {
    setMockFile("1", getProjectDataWithName("test"));

    await renderWithinWorkspace(
      <>
        <AppMenubar />
        <TimeCoursePanel visible />
        <StartPanel />
      </>,
      { shouldStubActiveFile: false },
    );

    const menubar = screen.getByTestId("app-menubar");
    expect(screen.queryByText("Simulate")).not.toBeInTheDocument();
    expect(within(menubar).queryByText("test")).not.toBeInTheDocument();

    setWorkerResponseDelay(50);

    await userEvent.click(screen.getByText("test"));

    // eslint-disable-next-line
    const myProjects = screen.getByText("My Projects").parentElement!;
    await userEvent.click(within(myProjects).getByText("New Project"));

    await waitFor(() => {
      expect(within(menubar).getByText("test")).toBeInTheDocument();
    });
  });
});

describe("deleting", () => {
  it("should remove an item from the list", async () => {
    setMockFile("1", getProjectDataWithName("test"));

    await renderWithinWorkspace(
      <>
        <TimeCoursePanel visible />
        <StartPanel />
      </>,
      { shouldStubActiveFile: false },
    );

    expect(screen.getByText("test")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("More"));
    await userEvent.click(screen.getByText("Delete"));

    expect(screen.queryByText("test")).not.toBeInTheDocument();
  });

  it("should not do anything if opening a file", async () => {
    setMockFile("1", getProjectDataWithName("test"));

    await renderWithinWorkspace(
      <>
        <TimeCoursePanel visible />
        <StartPanel />
      </>,
      { shouldStubActiveFile: false },
    );

    expect(screen.getByText("test")).toBeInTheDocument();

    await userEvent.click(screen.getByText("test"));

    await userEvent.click(screen.getByLabelText("More"));

    setWorkerResponseDelay(100);
    await userEvent.click(screen.getByText("Delete"));

    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
