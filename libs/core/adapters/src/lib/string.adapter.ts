import { createAdapter } from '@state-adapt/core';

export const stringAdapter = createAdapter<string>()({
  concat: (str, str2) => str + str2,
});
