import React from 'react';
import { registerPlugin } from '@iot-app-kit/core';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import Dashboard, { DashboardProperties } from '../../src/components/dashboard';
import { DashboardClientConfiguration } from '../../src/types';
import { DEFAULT_REGION } from '~/msw/constants';
import { useWorker } from '~/msw/useWorker';

/**
 * Data is mocked by the service worker started above.
 * No need for real credentials, but the region must match.
 */
const clientConfiguration: DashboardClientConfiguration = {
  awsCredentials: {
    accessKeyId: '',
    secretAccessKey: '',
  },
  awsRegion: DEFAULT_REGION,
};

const displaySettings = {
  numColumns: 100,
  numRows: 100,
};

const viewport = { duration: '5m' };

const emptyDashboardConfiguration: DashboardProperties = {
  clientConfiguration,
  dashboardConfiguration: {
    displaySettings,
    viewport,
    widgets: [],
  },
  onSave: async (dashboard) => {
    window.localStorage.setItem('dashboard', JSON.stringify(dashboard));
    Promise.resolve();
  },
};

const widgetDashboardConfiguration = {
  clientConfiguration,
  dashboardConfiguration: {
    displaySettings,
    viewport,
    widgets: [
      {
        type: 'iot-line-chart',
        id: 'some id',
        height: 15,
        width: 27,
        x: 5,
        y: 5,
        z: 0,
        properties: {},
      },
    ],
  },
  onSave: () => Promise.resolve(),
};

registerPlugin('metricsRecorder', {
  provider: () => ({
    record: (...args) => console.log('record metric:', ...args),
  }),
});

export default {
  title: 'Dashboard/Mocked data',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
  },
  // Applies to all stories under Mocked data
  decorators: [
    (Story) => {
      useWorker();
      return <Story />;
    },
  ],
} as ComponentMeta<typeof Dashboard>;

export const Empty: ComponentStory<typeof Dashboard> = () => <Dashboard {...emptyDashboardConfiguration} />;

export const SingleWidget: ComponentStory<typeof Dashboard> = () => <Dashboard {...widgetDashboardConfiguration} />;
