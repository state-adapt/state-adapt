import { runCli } from './cli';

describe('report CLI', () => {
  it('documents its invocation', () => {
    expect(runCli(['--help']).output).toContain('Usage: state-adapt-spaghetti-report');
  });
});
