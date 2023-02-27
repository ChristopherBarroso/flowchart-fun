import { Trans } from "@lingui/macro";
import * as Tabs from "@radix-ui/react-tabs";
import throttle from "lodash.throttle";
import { editor } from "monaco-editor";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery } from "react-query";
import { useParams, useRouteMatch } from "react-router-dom";

import { ClearTextButton } from "../components/ClearTextButton";
import EditorError from "../components/EditorError";
import { EditorOptions } from "../components/EditorOptions";
import { EditorWrapper } from "../components/EditorWrapper";
import { EditWrapper } from "../components/EditWrapper";
import Main from "../components/Main";
import { EditLayoutTab } from "../components/Tabs/EditLayoutTab";
import { EditMetaTab } from "../components/Tabs/EditMetaTab";
import { EditStyleTab } from "../components/Tabs/EditStyleTab";
import { TextEditor } from "../components/TextEditor";
import { getDoc, setDoc, subscribeToDoc } from "../lib/docHelpers";
import { docToString } from "../lib/docToString";
import { getDefaultChart } from "../lib/getDefaultChart";
import { titleToLocalStorageKey } from "../lib/helpers";
import { useIsValidSponsor } from "../lib/hooks";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { Doc } from "../lib/useDoc";
import { useTrackLastChart } from "../lib/useLastChart";
import { Type } from "../slang";
import styles from "./Edit.module.css";

const Edit = memo(function Edit() {
  const isValidSponsor = useIsValidSponsor();
  const { workspace = "" } = useParams<{ workspace?: string }>();
  const editorRef = useRef<null | editor.IStandaloneCodeEditor>(null);

  useQuery(["edit", workspace], () => loadWorkspace(workspace), {
    enabled: typeof workspace === "string",
    suspense: false,
    staleTime: 0,
  });

  const storeDoc = useMemo(() => {
    return throttle(
      (doc: Doc) => {
        const docString = docToString(doc);
        if (docString === getDefaultChart()) return;
        const key = titleToLocalStorageKey(workspace);
        localStorage.setItem(key, docString);
      },
      1000,
      { trailing: true }
    );
  }, [workspace]);

  useEffect(() => subscribeToDoc(storeDoc), [storeDoc]);

  const onChange = useCallback(
    (value) => setDoc({ text: value ?? "" }, "Edit/text"),
    []
  );

  const { url } = useRouteMatch();
  useTrackLastChart(url);

  const text = getDoc().text;

  return (
    <EditWrapper>
      <Main>
        <EditorWrapper>
          <Tabs.Root defaultValue="Document" className={styles.Tabs}>
            <Tabs.List className={styles.TabsList}>
              <Tabs.Trigger value="Document" data-testid="Editor Tab: Document">
                <Type>
                  <Trans>Document</Trans>
                </Type>
              </Tabs.Trigger>
              <Tabs.Trigger value="Layout" data-testid="Editor Tab: Layout">
                <Type>
                  <Trans>Layout</Trans>
                </Type>
              </Tabs.Trigger>
              <Tabs.Trigger value="Style" data-testid="Editor Tab: Style">
                <Type>
                  <Trans>Style</Trans>
                </Type>
              </Tabs.Trigger>
              {isValidSponsor && (
                <Tabs.Trigger
                  value="Advanced"
                  data-testid="Editor Tab: Advanced"
                >
                  <Type>
                    <Trans>Advanced</Trans>
                  </Type>
                </Tabs.Trigger>
              )}
            </Tabs.List>
            <Tabs.Content value="Document">
              <EditorOptions>
                <TextEditor
                  editorRef={editorRef}
                  value={text}
                  onChange={onChange}
                />
              </EditorOptions>
            </Tabs.Content>
            <Tabs.Content value="Layout">
              <EditLayoutTab />
            </Tabs.Content>
            <Tabs.Content value="Style">
              <EditStyleTab />
            </Tabs.Content>
            {isValidSponsor && (
              <Tabs.Content value="Advanced">
                <EditMetaTab />
              </Tabs.Content>
            )}
          </Tabs.Root>
        </EditorWrapper>
        <ClearTextButton
          handleClear={() => {
            setDoc({ text: "", meta: {} }, "Edit/clear");
            if (editorRef.current) {
              editorRef.current.focus();
            }
          }}
        />
        <EditorError />
      </Main>
    </EditWrapper>
  );
});

export default Edit;

/**
 * Load the workspace into our zustand store
 */
function loadWorkspace(workspace: string) {
  const key = titleToLocalStorageKey(workspace);
  let workspaceText = localStorage.getItem(key);
  if (!workspaceText) {
    workspaceText = getDefaultChart();
  }

  prepareChart(workspaceText, {
    id: workspace,
    title: workspace,
    isHosted: false,
  });
  return workspaceText;
}
