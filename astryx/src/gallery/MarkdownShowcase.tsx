// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Markdown} from '@astryxdesign/core/Markdown';
import {Center} from '@astryxdesign/core/Center';

const content = [
  '## Markdown',
  'Renders **bold**, *italic* and [links](https://example.com).',
  '- Mapped to the Astryx type scale',
].join('\n');

export default function MarkdownShowcase() {
  return (
    <Center width={300}>
      <Markdown>{content}</Markdown>
    </Center>
  );
}
