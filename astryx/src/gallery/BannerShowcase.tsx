// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Banner} from '@astryxdesign/core/Banner';
import {Stack} from '@astryxdesign/core/Layout';

export default function BannerShowcase() {
  return (
    <Stack direction="vertical" gap={3} style={{maxWidth: 420}}>
      <Banner status="info" title="A new software update is available." />
      <Banner status="error" title="Payment failed. Update your billing." />
    </Stack>
  );
}
