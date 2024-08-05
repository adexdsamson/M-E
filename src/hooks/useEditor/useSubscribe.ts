/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { distinctUntilChanged, Subject } from "rxjs";

interface Props<T> {
  subject: T;
  next?: (value: T) => void;
  disabled?: boolean;
}

function useSubscribe<T>(props: Props<T>) {
  const subject = new Subject<T>();

  useEffect(() => {
    if (!props.disabled) return;
    
    const subscription = subject
      .pipe(distinctUntilChanged())
      .subscribe(props?.next);

    return () => subscription.unsubscribe();
  }, [subject, props.disabled]);

  useEffect(() => {
    subject.next(props.subject);
  }, [props.subject]);
}

export default useSubscribe;
