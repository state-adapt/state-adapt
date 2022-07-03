declare module '*.md' {
  const content: string;
  export default content;
}

declare module 'raw-loader!*' {
  const content: string;
  export default content;
}

declare module '!!raw-loader!*' {
  const contents: string;
  export default contents;
}
