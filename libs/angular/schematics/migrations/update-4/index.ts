import { Rule } from '@angular-devkit/schematics';

export default function updateToV4(): Rule {
  return tree => {
    // Add StateAdapt 4 codemods here.
    return tree;
  };
}
