// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const USERS = [
  {
    name: 'Alex Daniels',
    key: 'alex',
  },
  {
    name: 'Ann Smith',
    key: 'ann',
  },
  {
    name: 'Carol Davis',
    key: 'carol',
  },
  {
    name: 'Gina Wilson',
    key: 'gina',
  },
  {
    name: 'Eve Park',
    key: 'eve',
  },
];

export default function AvatarGroupShowcase() {
  return (
    <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => (
        <Avatar key={u.key} name={u.name} />
      ))}
      <AvatarGroupOverflow count={USERS.length - 3} />
    </AvatarGroup>
  );
}
