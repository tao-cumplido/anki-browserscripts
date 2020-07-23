export function trimLines(input: string) {
   return input
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .join('\n');
}
