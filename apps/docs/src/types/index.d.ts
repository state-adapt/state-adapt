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

declare module 'jsdoc-loader!*' {
  const content: string;
  export default content;
}

declare module '!!jsdoc-loader!*' {
  const contents: string;
  export default contents;
}

declare module '!!md-loader!*' {
  const contents: string;
  export default contents;
}

declare module '!!snippet-loader!*' {
  const contents: string;
  export default contents;
}
