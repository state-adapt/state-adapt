import { createAdapter } from '@state-adapt/core';

export const stringAdapter = createAdapter<string>()({
  concat: (str, str2) => str + str2,
  lowercase: str => str.toLowerCase(),
  uppercase: str => str.toUpperCase(),
  selectors: {
    lowercase: str => str.toLowerCase(),
    uppercase: str => str.toUpperCase(),
  },
});

export const baseStringAdapter = createAdapter<string>()({ selectors: {} });
