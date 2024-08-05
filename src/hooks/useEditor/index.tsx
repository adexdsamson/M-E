import { KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  AtomicBlockUtils,
  CompositeDecorator,
  convertToRaw,
  DefaultDraftBlockRenderMap,
  DraftBlockRenderMap,
  DraftDecorator,
  DraftEditorCommand,
  DraftStyleMap,
  Editor,
  EditorProps,
  EditorState,
  RawDraftContentState,
} from "draft-js";
import { createPluginHooks } from "./pluginHooks";
import { Map } from "immutable";
import { AriaProps, EditorPlugin } from "./types";
import resolveDecorators from "./resolveDecorators";
import useSubscribe from "./useSubscribe";

interface GetSetEditorState {
  setEditorState(editorState: EditorState): void; // a function to update the EditorState
  getEditorState(): EditorState; // a function to get the current EditorState
}

interface PluginFunctions extends GetSetEditorState {
  getPlugins(): EditorPlugin[]; // a function returning a list of all the plugins
  getProps(): unknown; // a function returning a list of all the props pass into the Editor
  getReadOnly(): boolean; // a function returning of the Editor is set to readOnly
  setReadOnly(readOnly: boolean): void; // a function which allows to set the Editor to readOnly
  getEditorRef(): EditorRef; // a function to get the editor reference
}

interface EditorRef {
  refs?: { editor: HTMLElement };
  editor: HTMLElement;
}

export type ContentData = { type: string; text: string; index: number };

export interface PluginEditorProps extends Omit<EditorProps, "keyBindingFn"> {
  plugins?: EditorPlugin[];
  defaultKeyBindings?: boolean;
  defaultKeyCommands?: boolean;
  defaultBlockRenderMap?: boolean;

  keyBindingFn?(
    event: KeyboardEvent
  ): DraftEditorCommand | string | null | undefined;
  decorators?: Array<CompositeDecorator | DraftDecorator>;
}

// should be DraftDecoratorType but it is not accessible and does not habe decorators or _decorators
interface DecoratorType {
  decorators?: Immutable.List<string>;
  _decorators?: string[];
}

const getDecoratorLength = (obj?: DecoratorType): number | undefined => {
  if (obj?.decorators != null) {
    return obj.decorators?.size;
  } else if (obj?._decorators != null) {
    return obj._decorators?.length;
  }
  return undefined;
};

export const useEditor = (props: PluginEditorProps) => {
  const editorRef = useRef<Editor | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  const {
    editorState,
    onChange,
    plugins = [],
    handleKeyCommand,
    keyBindingFn,
    defaultKeyBindings = true,
    defaultKeyCommands = true,
    defaultBlockRenderMap = true,
    customStyleMap = {},
  } = props;

  /**
   * The `focusEditor` function is used to focus on a specific editor element in a TypeScript React
   * application.
   */
  const focusEditor = () => {
    editorRef.current?.focus();
  };

  /**
   * The `blur` function is used to remove focus from a specific editor element.
   */
  const blur = (): void => {
    if (editorRef.current) {
      editorRef.current.blur();
    }
  };

  /**
   * The function `getPlugins` returns a copy of an array of `EditorPlugin` objects.
   */
  const getPlugins = (): EditorPlugin[] => [...plugins!];

  /**
   * The function `getProps` returns a copy of the `props` object as `PluginEditorProps`.
   */
  const getProps = (): PluginEditorProps => ({ ...props });

  /**
   * The function `getReadOnly` returns a boolean value based on the `readOnly` prop or variable.
   */
  const getReadOnly = (): boolean => props.readOnly || readOnly;

  /**
   * The function `getEditorRef` returns the current editor reference as an `EditorRef` type.
   */
  const getEditorRef = (): EditorRef =>
    editorRef.current as unknown as EditorRef;

  /**
   * The function `getEditorState` returns the current `EditorState` from the `props` in a TypeScript
   * React component.
   */
  const getEditorState = (): EditorState => props.editorState ?? editorState;

  /**
   * The function `getPluginMethods` returns an object containing various plugin methods for a
   * TypeScript React application.
   */
  const getPluginMethods = (): PluginFunctions => ({
    getPlugins,
    getProps,
    setEditorState: onChange,
    getEditorState,
    getReadOnly,
    setReadOnly,
    getEditorRef,
  });

  /**
   * The function `createPluginHooks` creates plugin hooks for a TypeScript React editor.
   * @returns A partial object of type `EditorProps` is being returned.
   */
  const createPluginHook = (): Partial<EditorProps> => {
    const allPlugins = [props, ...resolvePlugins()] as EditorPlugin[];
    return createPluginHooks(allPlugins, getPluginMethods());
  };

  /**
   * The function `resolvePlugins` returns an array of editor plugins based on certain conditions.
   * @returns An array of EditorPlugin objects is being returned.
   */
  const resolvePlugins = (): EditorPlugin[] => {
    const plugins = getPlugins();
    if (defaultKeyBindings) {
      plugins.push({ keyBindingFn });
    }
    if (defaultKeyCommands) {
      plugins.push({ handleKeyCommand });
    }
    return plugins;
  };

  /**
   * The function `resolveCustomStyleMap` merges custom style maps from plugins and props into a single
   * DraftStyleMap.
   * @returns The function `resolveCustomStyleMap` returns a merged DraftStyleMap object that combines
   * custom style maps from plugins and a custom style map from props.
   */
  const resolveCustomStyleMap = (): DraftStyleMap => {
    const customStyleMap = props
      .plugins!.filter((plug) => plug.customStyleMap !== undefined)
      .map((plug) => plug.customStyleMap) as DraftStyleMap[];
    return customStyleMap.concat([props.customStyleMap!]).reduce<DraftStyleMap>(
      (styles, style) => ({
        ...styles,
        ...style,
      }),
      {}
    );
  };

/**
 * The function `contentModifier` takes in raw draft content and filters out empty blocks to create an
 * array of content data objects.
 * @param {RawDraftContentState} content - The `contentModifier` function takes in a parameter
 * `content` of type `RawDraftContentState`. This function filters out blocks with empty text (" ")
 * from the `content` and then creates an array of `ContentData` objects containing the type, text, and
 * index of each non-empty block
 * @returns The `contentModifier` function returns an array of `ContentData` objects, where each object
 * contains the properties `type` set to "block", `text` set to the text content of the block, and
 * `index` set to the index of the block in the original content state.
 */
  const contentModifier = (content: RawDraftContentState): ContentData[] => {
    const contentState = content.blocks?.filter((item) => item.text !== " ");

    const allContent: ContentData[] = [];

    contentState.forEach((block, index) => {
      allContent.push({ type: "block", text: block.text, index });
    });

    return allContent;
  };

/**
 * The `convertToString` function takes an array of `ContentData` objects, extracts the `text` property
 * from each object, and concatenates them into a single plaintext string.
 * @param {ContentData[]} content - ContentData array containing text data
 * @returns The `convertToString` function returns a string that is the concatenation of the `text`
 * property of each item in the `content` array, separated by a space.
 */
  const convertToString = (content: ContentData[]) => {
    if (!content) return;

    const plaintext = content.map((item) => item.text).join(" ");

    return plaintext;
  };

  /**
   * The function `resolveBlockRenderMap` merges block render maps from plugins, default settings, and
   * props in TypeScript React.
   * @returns The function `resolveBlockRenderMap` returns a `DraftBlockRenderMap` object that is
   * created by merging block render maps from various sources, including plugins, default block render
   * map, and custom block render map provided as props.
   */
  const resolveBlockRenderMap = (): DraftBlockRenderMap => {
    let blockRenderMap = props
      .plugins!.filter((plug) => plug.blockRenderMap !== undefined)
      .reduce(
        (maps, plug) => maps.merge(plug.blockRenderMap!),
        Map({})
      ) as DraftBlockRenderMap;
    if (defaultBlockRenderMap) {
      blockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);
    }
    if (props.blockRenderMap) {
      blockRenderMap = blockRenderMap.merge(props.blockRenderMap);
    }
    return blockRenderMap;
  };


 /**
  * The `getRawText` function in TypeScript React retrieves raw text content from an editor state,
  * optionally applying a modifier function before converting it to a string.
  * @param [modifier] - The `modifier` parameter is a function that takes two arguments: `content`,
  * which is of type `RawDraftContentState`, and `allContent`, which is an array of `ContentData`
  * objects. The function is optional and can be used to modify the content before converting it to a
  * string
  * @returns The `getRawText` function returns a string representation of the content data after
  * applying any specified modifier function. If no modifier function is provided, it applies a default
  * `contentModifier` function to the content data before converting it to a string.
  */
  const getRawText = (
    modifier?: (content: RawDraftContentState, allContent: ContentData[]) => ContentData[]
  ) => {
    if (!editorState) return;

    const currentContentState = editorState.getCurrentContent();

    let allContent: ContentData[];
    const content = convertToRaw(currentContentState);

    if (modifier) {
      allContent = modifier(content, contentModifier(content));
    } else {
      allContent = contentModifier(content);
    }

    return convertToString(allContent);
  };

  /**
   * The function `resolveAccessibilityProps` iterates through plugins to gather and merge accessibility
   * props, prioritizing certain values.
   * @returns The `resolveAccessibilityProps` function returns an object of AriaProps that is built by
   * iterating over plugins, checking for the presence of `getAccessibilityProps` function in each
   * plugin, and merging the accessibility props obtained from each plugin into the final
   * `accessibilityProps` object.
   */
  const resolveAccessibilityProps = (): AriaProps => {
    let accessibilityProps: AriaProps = {};
    resolvePlugins().forEach((plugin) => {
      if (typeof plugin.getAccessibilityProps !== "function") {
        return;
      }
      const props = plugin.getAccessibilityProps();
      const popupProps: AriaProps = {};

      if (accessibilityProps.ariaHasPopup === undefined) {
        popupProps.ariaHasPopup = props.ariaHasPopup;
      } else if (props.ariaHasPopup === "true") {
        popupProps.ariaHasPopup = "true";
      }

      if (accessibilityProps.ariaExpanded === undefined) {
        popupProps.ariaExpanded = props.ariaExpanded;
      } else if (props.ariaExpanded === true) {
        popupProps.ariaExpanded = true;
      }

      accessibilityProps = {
        ...accessibilityProps,
        ...props,
        ...popupProps,
      };
    });

    return accessibilityProps;
  };

  /**
   * The `insertImage` function in TypeScript React inserts an image with a base64 source into the
   * editor state.
   * @param {string} base64 - Base64 is a binary-to-text encoding scheme that represents binary data in
   * an ASCII string format. In the context of your `insertImage` function, the `base64` parameter is a
   * string that represents an image encoded in base64 format. This string will be used as the source
   * (`src`)
   */
  const insertImage = (base64: string, extraData?: Record<string, unknown>) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "IMAGE",
      "IMMUTABLE",
      { ...(extraData ?? {}), src: base64 }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const state = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      " "
    );

    onChange(
      EditorState.forceSelection(
        state,
        state.getCurrentContent().getSelectionAfter()
      )
    );
  };

  useEffect(() => {
    const decorator = resolveDecorators(props, getEditorState, onChange);

    const editorState = EditorState.set(props.editorState, { decorator });
    onChange(EditorState.moveSelectionToEnd(editorState));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useSubscribe<EditorState>({
    subject: props.editorState,
    next: (nextState) => {
      const state = props.editorState;
      const currDec = state.getDecorator();
      const nextDec = nextState.getDecorator();

      console.log("check check");

      if (!currDec || currDec === nextDec) {
        return;
      }

      if (
        getDecoratorLength(currDec as DecoratorType) ===
        getDecoratorLength(nextDec as DecoratorType)
      ) {
        return;
      }

      const editorState = EditorState.set(nextState, {
        decorator: currDec,
      });
      onChange(EditorState.moveSelectionToEnd(editorState));
    },
    disabled: !props.editorState,
  });

  // useEffect(() => {
  //   const state = props.editorState || editorState;
  //   const next = props;
  //   const currDec = state.getDecorator();
  //   const nextDec = next.editorState.getDecorator();

  //   if (!currDec || currDec === nextDec) {
  //     return;
  //   }

  //   if (
  //     getDecoratorLength(currDec as DecoratorType) ===
  //     getDecoratorLength(nextDec as DecoratorType)
  //   ) {
  //     return;
  //   }

  //   const editorState = EditorState.set(next.editorState, {
  //     decorator: currDec,
  //   });
  //   onChange(EditorState.moveSelectionToEnd(editorState));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [props.editorState, editorState]);

  useEffect(() => {
    resolvePlugins().forEach((plugin) => {
      if (plugin.initialize) {
        plugin.initialize(getPluginMethods());
      }
    });

    return () => {
      resolvePlugins().forEach((plugin) => {
        if (plugin.willUnmount) {
          plugin.willUnmount({
            getEditorState,
            setEditorState: onChange,
          });
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pluginHooks = createPluginHook();
  const customStyle = resolveCustomStyleMap();
  const accessibilityProps = resolveAccessibilityProps();
  const blockRenderMap = resolveBlockRenderMap();

  return {
    ...accessibilityProps,
    ...pluginHooks,
    customStyleMap: { ...customStyleMap, ...customStyle },
    blockRenderMap,
    getRawText,
    blur,
    focusEditor,
    insertImage,
    editorRef
  };
};
