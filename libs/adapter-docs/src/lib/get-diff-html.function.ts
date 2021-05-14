import * as jdp from 'jsondiffpatch';
type ValueDiff = [any] | [any, any] | [any, 0, 0];

export function getDiffHtml(obj1: any, obj2: any) {
  return getDeltaJson(jdp.diff(obj1, obj2) as jdp.Delta);
}

function toJson(val: any): string {
  return JSON.stringify(val, null, '\t');
}

function getTabs(n: number) {
  return new Array(n).fill('    ').join('');
}

function getDeltaJson(val: jdp.Delta, indent = 0): string {
  const isArray = Array.isArray(val);
  const isDiffOfArray = val._t === 'a';
  const isDiff = isArray || isDiffOfArray;
  if (!isDiff) return getObjectDeltaJson(val, indent);
  return isDiffOfArray
    ? getArrayDiffString(val as any, indent)
    : getValueDiffString(val as ValueDiff);
}

function getObjectDeltaJson(val: jdp.Delta, indent: number) {
  return (
    Object.entries(val).reduce(
      (objStr, [key, value]) =>
        `${objStr}\n${getTabs(indent + 1)}${key}: ${getDeltaJson(
          value,
          indent + 1,
        )},`,
      '{',
    ) + `\n${getTabs(indent)}}`
  );
}

function getArrayDiffString(val: jdp.Delta, indent: number) {
  return (
    Object.entries(val)
      .filter(([key, value]) => key !== '_t' && value !== 'a')
      .reduce((arrStr, [key, value]) => {
        const keyNumber = key.replace(/_/, '');

        const isMoved = value[0] === '' && value[2] === 3;
        const movedKey = isMoved ? getDiffArrow(+keyNumber, +value[1]) : '';
        const movedValue = ''; // Doesn't show what the element was

        const isAdded = key === keyNumber;
        const addedKey = isAdded ? getAdded(+keyNumber) : '';
        const addedValue = isAdded ? getAdded(value[0]) : '';

        const isRemoved = key !== keyNumber && !isMoved;
        const removedKey = isRemoved ? getRemoved(+keyNumber) : '';
        const removedValue = isRemoved ? getRemoved(value[0]) : '';

        const keyStr = movedKey + addedKey + removedKey;
        const valueStr = movedValue + addedValue + removedValue;
        const separator = valueStr ? ': ' : '';
        return `${arrStr}\n${getTabs(
          indent + 1,
        )}${keyStr}${separator}${valueStr},`;
      }, `[`) + `\n${getTabs(indent)}]`
  );
}

function wrapSpanClass(val: any, className: string) {
  return `<span class="${className}">${toJson(val)}</span>`;
}

function getDiffArrow(val1: any, val2: any) {
  return `${getRemoved(val1)} => ${getAdded(val2)}`;
}

function getRemoved(val: any) {
  return wrapSpanClass(val, 'removed');
}

function getAdded(val: any) {
  return wrapSpanClass(val, 'added');
}

const lengthTypes = {
  1: (val: ValueDiff) => getAdded(val[0]),
  2: (val: ValueDiff) => getDiffArrow(val[0], val[1]),
  3: (val: ValueDiff) => getRemoved(val[0]),
};

function getValueDiffString(val: ValueDiff) {
  return lengthTypes[val.length](val);
}
