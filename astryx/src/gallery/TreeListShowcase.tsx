// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TreeList} from '@astryxdesign/core/TreeList';

const noop = () => {};

export default function TreeListShowcase() {
  return (
    <TreeList
      items={[
        {
          id: 'src',
          label: 'src',
          isExpanded: true,
          children: [
            {id: 'app', label: 'App.tsx', onClick: noop},
            {id: 'index', label: 'index.tsx', onClick: noop},
          ],
        },
        {id: 'pkg', label: 'package.json', onClick: noop},
      ]}
    />
  );
}
