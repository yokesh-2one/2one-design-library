// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Collapsible, CollapsibleGroup} from '@astryxdesign/core/Collapsible';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Layout';

export default function CollapsibleShowcase() {
  return (
    <Card width={360}>
      <CollapsibleGroup type="single" defaultValue="notifications">
        <VStack gap={4}>
          <Collapsible trigger="General settings" value="general">
            <Text type="body" color="secondary">Display name, language and time zone.</Text>
          </Collapsible>
          <Collapsible trigger="Notifications" value="notifications">
            <Text type="body" color="secondary">Choose which notifications you receive.</Text>
          </Collapsible>
        </VStack>
      </CollapsibleGroup>
    </Card>
  );
}
