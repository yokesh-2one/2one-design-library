// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
export default function CheckboxListShowcase() {
  const [value, setValue] = useState<string[]>(['email']);
  return (
    <CheckboxList
      label="Notification preferences"
      description="Choose how you would like to be notified"
      value={value}
      onChange={setValue}
      hasDividers>
      <CheckboxListItem label="Email" value="email" />
      <CheckboxListItem label="Push notification" value="push" />
      <CheckboxListItem label="SMS" value="sms" />
    </CheckboxList>
  );
}
