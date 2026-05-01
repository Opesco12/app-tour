const readinessState = new Map<string, boolean>();

export const setTourReady = (key: string, value: boolean) => {
  readinessState.set(key, value);
};

export const getTourReady = (key: string) => {
  return readinessState.get(key) === true;
};
