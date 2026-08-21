// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar, AvatarStatusDot} from '@astryxdesign/core/Avatar';
import {Stack} from '@astryxdesign/core/Layout';

export default function AvatarShowcase() {
  return (
    <Stack direction="horizontal" gap={4} vAlign="center">
      <Avatar
        src="/template-assets/DATA-Ana-Thomas.png"
        name="Ana Thomas"
        size="lg"
        status={<AvatarStatusDot variant="success" label="Online" />}
      />
      <Avatar src="/template-assets/DATA-Drew-Young.png" name="Drew Young" size="lg" />
      <Avatar
        src="/template-assets/DATA-Nam-Tran.png"
        name="Nam Tran"
        size="lg"
        status={<AvatarStatusDot variant="error" label="Busy" />}
      />
    </Stack>
  );
}
