// https://chatgpt.com/share/6940fe1b-68ec-800e-a511-133276cb0dcc

export function mdCodeDirectiveOffsetPlugin() {
  return {
    name: 'code-directive-offset',
    enforce: 'pre' as const,

    transform(code: string, id: string) {
      if (!id.endsWith('.md')) return null;

      const lines = code.split('\n');
      const newLines: string[] = [];

      let inFence = false;
      let fencePrefix = '';
      let fenceMarker = '';

      let i = 0;
      while (i < lines.length) {
        const line = lines[i];

        // Enter / exit code fence
        if (!inFence) {
          const m = line.match(/^(\s*)(```+)(.*)$/);
          if (m) {
            inFence = true;
            fencePrefix = m[1]!;
            fenceMarker = m[2]!;
            newLines.push(line);
            i++;
            continue;
          }

          // Outside fence: just pass through
          newLines.push(line);
          i++;
          continue;
        } else {
          // Inside fence: detect closing fence
          if (line.startsWith(fencePrefix + fenceMarker)) {
            inFence = false;
            newLines.push(line);
            i++;
            continue;
          }
        }

        // We're inside a fence here.

        // Directive line like: // [!code -- 2]
        const match = line.match(/^\s*\/\/\s*\[!code\s+([+-]{2})\s+(\d+)\s*\]\s*$/);

        if (!match) {
          // Normal code line inside fence
          newLines.push(line);
          i++;
          continue;
        }

        const [, kind, rangeStr] = match;
        const count = Number(rangeStr);
        if (!Number.isFinite(count) || count <= 0) {
          // Bad range: just drop the directive line
          i++;
          continue;
        }

        // Apply to the next `count` lines
        let processed = 0;
        for (let k = 1; k <= count; k++) {
          const targetIndex = i + k;
          if (targetIndex >= lines.length) break;

          const targetLine = lines[targetIndex];

          // Don't cross the closing fence
          if (targetLine.startsWith(fencePrefix + fenceMarker)) {
            break;
          }

          if (!targetLine.trim()) {
            // Empty line: keep it empty (or you could choose to skip)
            newLines.push(targetLine);
          } else {
            newLines.push(`${targetLine} // [!code ${kind}]`);
          }

          processed++;
        }

        // Skip directive line + the lines we just processed
        i += processed + 1;
      }

      return {
        code: newLines.join('\n'),
        map: null,
      };
    },
  };
}
