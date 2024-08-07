/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Creates a composite decorator based on the provided plugins
 */

import { CompositeDecorator, DraftDecorator, EditorState } from "draft-js";
import { List } from "immutable";
import { ReactElement } from "react";

export default function createCompositeDecorator(
  decorators: Immutable.List<DraftDecorator>,
  getEditorState: () => EditorState,
  setEditorState: (state: EditorState) => void
): CompositeDecorator {
  const convertedDecorators = List(decorators)
    .map((decorator) => {
      const Component = decorator!.component as any;

      const DecoratedComponent = (
        props: Record<string, unknown>
      ): ReactElement => (
        <Component
          {...props}
          getEditorState={getEditorState}
          setEditorState={setEditorState}
        />
      );
      return {
        ...decorator,
        component: DecoratedComponent,
      };
    })
    .toJS();

  return new CompositeDecorator(convertedDecorators);
}
