import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as ts from 'typescript';

import { analyzeFile, analyzeProject } from './spaghetti-analysis';
import { CommandRecognizer } from './recognizers';

describe('spaghetti call-graph', () => {
  it('terminates recursive graphs while retaining reachable direct commands once per path', () => {
    const result = analyzeFile(`function left() { window.left = 1; right(); }
function right() { window.right = 1; left(); }`);
    const left = result.functions.find(fn => fn.name === 'left');
    const right = result.functions.find(fn => fn.name === 'right');

    expect(left?.commands.map(command => command.resource)).toEqual(['window', 'window']);
    expect(right?.commands.map(command => command.resource)).toEqual([
      'window',
      'window',
    ]);
    expect(left?.commands.map(command => command.originFunction)).toEqual([
      left?.functionId,
      right?.functionId,
    ]);
    expect(right?.commands.map(command => command.originFunction)).toEqual([
      right?.functionId,
      left?.functionId,
    ]);
  });

  it('uses general discarded-call detection before API-specific recognizers', () => {
    const result = analyzeFile(`
import { store } from '@state-adapt/core';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
function mutate() {
  const values = [];
  const map = new Map();
  const element = document.body;
  const count = signal(0);
  const subject = new Subject();
  const [value, setValue] = useState(0);
  const [state, reactDispatch] = useReducer(reducer, {});
  const dispatch = useDispatch();
  values.push(value);
  map.set('key', value);
  element.setAttribute('data-value', String(value));
  store.update(value);
  count.set(value);
  subject.next(value);
  setValue(value);
  component.setState({ value });
  reactDispatch({ type: 'change' });
  dispatch({ type: 'change' });
  store.dispatch({ type: 'change' });
}`);
    const commands = result.functions.find(fn => fn.name === 'mutate')?.commands ?? [];

    expect(commands).toHaveLength(11);
    expect(commands.every(command => command.kind === 'discarded-call')).toBe(true);
    expect(commands.every(command => !command.recognizer && !command.api)).toBe(true);
  });

  it('uses general detection for awaited and syntax-wrapped discarded calls', () => {
    const commands = analyzeFile(`const subject = new Subject();
async function emit() {
  await (subject.next(1));
  (subject.next(2)) as void;
}`).functions.find(fn => fn.name === 'emit')?.commands;

    expect(commands).toHaveLength(2);
    expect(commands?.every(command => command.kind === 'discarded-call')).toBe(true);
    expect(commands?.every(command => !command.recognizer && !command.api)).toBe(true);
  });

  it('does not recognize void-only mutation APIs in value contexts', () => {
    const commands = analyzeFile(`
import { store } from '@state-adapt/core';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { useReducer, useState } from 'react';
function mutate() {
  const element = document.body;
  const count = signal(0);
  const subject = new Subject();
  const [value, setValue] = useState(0);
  const [state, reactDispatch] = useReducer(reducer, {});
  return [
    element.setAttribute('data-value', String(value)),
    element.remove(),
    element.classList.add('active'),
    store.update(value),
    count.set(value),
    subject.next(value),
    setValue(value),
    component.setState({ value }),
    reactDispatch({ type: 'change' }),
  ];
}`).functions.find(fn => fn.name === 'mutate')?.commands;

    expect(commands).toEqual([]);
  });

  it('recognizes mutation APIs with usable return values in value contexts', () => {
    const commands = analyzeFile(`
import { useDispatch } from 'react-redux';
function mutate() {
  const values = [];
  const map = new Map();
  const element = document.body;
  const replacement = document.createElement('div');
  const dispatch = useDispatch();
  return [
    values.push(1),
    values.pop(),
    map.set('key', 1),
    map.delete('key'),
    element.appendChild(replacement),
    element.removeChild(replacement),
    element.insertAdjacentElement('beforeend', replacement),
    element.toggleAttribute('hidden'),
    element.classList.replace('old', 'new'),
    element.classList.toggle('active'),
    dispatch({ type: 'change' }),
    store.dispatch({ type: 'change' }),
  ];
}`).functions.find(fn => fn.name === 'mutate')?.commands;

    expect(commands?.map(command => command.recognizer)).toEqual([
      'javascript',
      'javascript',
      'javascript',
      'javascript',
      'dom',
      'dom',
      'dom',
      'dom',
      'dom',
      'dom',
      'redux',
      'redux',
    ]);
    expect(commands?.every(command => command.kind === 'api-command')).toBe(true);
  });

  it('limits built-in fallback APIs to the audited value-returning methods', () => {
    const apis = analyzeFile(`
function mutate() {
  const values = [];
  const map = new Map();
  const set = new Set();
  const element = document.body;
  const replacement = document.createElement('div');
  const dispatch = useDispatch();
  return [
    values.copyWithin(0, 1),
    values.fill(1),
    values.pop(),
    values.push(1),
    values.reverse(),
    values.shift(),
    values.sort(),
    values.splice(0, 1),
    values.unshift(1),
    set.add(1),
    map.delete('key'),
    map.set('key', 1),
    element.appendChild(replacement),
    element.insertAdjacentElement('beforeend', replacement),
    element.removeChild(replacement),
    element.replaceChild(replacement, element.firstChild),
    element.toggleAttribute('hidden'),
    element.classList.replace('old', 'new'),
    element.classList.toggle('active'),
    dispatch({ type: 'hook' }),
    store.dispatch({ type: 'store' }),
  ];
}`)
      .functions.find(fn => fn.name === 'mutate')
      ?.commands.map(command => command.api);

    expect(apis).toEqual([
      'Array.copyWithin',
      'Array.fill',
      'Array.pop',
      'Array.push',
      'Array.reverse',
      'Array.shift',
      'Array.sort',
      'Array.splice',
      'Array.unshift',
      'Map/Set.add',
      'Map/Set.delete',
      'Map/Set.set',
      'DOM.appendChild',
      'DOM.insertAdjacentElement',
      'DOM.removeChild',
      'DOM.replaceChild',
      'DOM.toggleAttribute',
      'DOMTokenList.replace',
      'DOMTokenList.toggle',
      'Redux.dispatch',
      'Redux.dispatch',
    ]);
  });
});
