import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const rawInput = readFileSync(0, 'utf8').trim();
const input = rawInput.length > 0 ? JSON.parse(rawInput) : null;
const eventName = input?.hook_event_name;

if (eventName === 'SessionStart' || eventName === 'SubagentStart') {
  const standardPath = fileURLToPath(
    new URL('../standards/technical-communication.md', import.meta.url),
  );
  const standard = readFileSync(standardPath, 'utf8').trim();

  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: eventName,
        additionalContext: standard,
      },
    })}\n`,
  );
}
