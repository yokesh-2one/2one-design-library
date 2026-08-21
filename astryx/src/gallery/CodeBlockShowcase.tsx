// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {CodeBlock} from '@astryxdesign/core/CodeBlock';

const code = `export function greet(name: string) {
  return \`Hello, \${name}!\`;
}`;

export default function CodeBlockShowcase() {
  return (
    <CodeBlock
      code={code}
      language="typescript"
      title="useUser.ts"
      hasLineNumbers
      hasCopyButton
    />
  );
}
