import React from "react";

export type Noop = () => void;

export type Observer<T> = {
  next: (value: T) => void;
};

export type Subscription = {
  unsubscribe: Noop;
};

export type Subject<T> = {
  readonly observers: Observer<T>[];
  subscribe: (value: Observer<T>) => Subscription;
  unsubscribe: Noop;
} & Observer<T>;

type Props<T> = {
  disabled?: boolean;
  subject: Subject<T>;
  next: (value: T) => void;
};

export function useSubscribe<T>(props: Props<T>) {
  const _props = React.useRef(props);
  _props.current = props;

  React.useEffect(() => {
    const subscription =
      !props.disabled &&
      _props.current.subject &&
      _props.current.subject.subscribe({
        next: _props.current.next,
      });

    return () => {
      subscription && subscription.unsubscribe();
    };
  }, [props.disabled]);
}
