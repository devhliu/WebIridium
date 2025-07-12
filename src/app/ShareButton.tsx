import { useState } from "react";
import { useAtomValue } from "jotai";

import {
  nameAtom,
  timeCourseParametersAtom,
} from "@/globals/workspace/settings";
import { simulationResultAtom } from "@/globals/workspace/simulation";
import { editorContentAtom } from "@/globals/workspace/model";

import { getShareUrlFragment, type ShareWorkspaceData } from "@/features/share";

import Button from "@/components/Button";
import ShareIcon from "@/assets/icons/ShareIcon.svg?react";
import ShareDialog from "./ShareDialog";
import { useToast } from "@/components/Toast";

const ShareButton = () => {
  const workspaceName = useAtomValue(nameAtom);
  const editorContent = useAtomValue(editorContentAtom);
  const timeCourseParameters = useAtomValue(timeCourseParametersAtom);
  const simulationResult = useAtomValue(simulationResultAtom);

  const { toast } = useToast();

  const [computing, setComputing] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const handleClick = async () => {
    setComputing(true);

    const data: ShareWorkspaceData = {
      version: 0,
      name: workspaceName,
      code: editorContent,
      simulation:
        simulationResult?.type === "steadyState"
          ? {
              type: "steadyState",
              parameters: null,
            }
          : {
              type: "timeCourse",
              parameters: timeCourseParameters,
            },
    };
    const result = await getShareUrlFragment(data);

    if (result.type === "error") {
      toast({
        type: "error",
        title: "Error when getting share data",
        description: result.message,
      });
    } else {
      setUrl(`${location.origin}#${encodeURIComponent(result.fragment)}`);
    }

    setComputing(false);
  };

  return (
    <>
      <Button
        style="ghostText"
        onClick={handleClick}
        disabled={Boolean(url) || computing}
      >
        <ShareIcon width="1.25em" height="1.25em" />
      </Button>
      {url && <ShareDialog url={url} onClose={() => setUrl(null)} />}
    </>
  );
};

export default ShareButton;
