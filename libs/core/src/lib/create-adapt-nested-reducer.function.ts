export function createAdaptNestedReducer(
  adaptReducer: (state: any, action: any) => any,
) {
  return (state: { adapt: any }, action: any) => {
    const newState = adaptReducer(state?.adapt, action);
    if (newState === state) {
      return state;
    }
    return {
      ...state,
      adapt: newState,
    };
  };
}
