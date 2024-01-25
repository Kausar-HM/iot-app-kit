import React, { useCallback, useEffect, useState } from 'react';
import {
  gestureable,
  idable,
} from '../internalDashboard/gestures/determineTargetGestures';
import DynamicWidgetComponent from './dynamicWidget';

import './widget.css';
import type { SiteWiseQuery } from '@iot-app-kit/source-iotsitewise';
import type { DashboardMessages } from '~/messages';
import type { DashboardWidget } from '~/types';
import { useSelector } from 'react-redux';
import { DashboardState } from '~/store/state';
import WidgetActions from './widgetActions';

export type WidgetProps = {
  readOnly: boolean;
  query?: SiteWiseQuery;
  isSelected: boolean;
  cellSize: number;
  widget: DashboardWidget;
  messageOverrides: DashboardMessages;
};

/**
 *
 * Component used to position a widget on the dashboard and
 * mark it with the handles required to capture gestures
 *
 */
const WidgetComponent: React.FC<WidgetProps> = ({
  cellSize,
  widget,
  messageOverrides,
  readOnly,
}) => {
  const { x, y, z, width, height } = widget;
  const isReadOnly = useSelector((state: DashboardState) => state.readOnly);
  const [hover, setHover] = useState(false);
  // const selectedWidgets = useSelector(
  //   (state: DashboardState) => state.selectedWidgets
  // );
  const enableActionButtons = !isReadOnly && hover;

  // const toggleActionButtons = useCallback(() => {
  //   if (selectedWidgets && selectedWidgets.find((w) => w.id === widget.id))
  //     setHover(true);
  //   else setHover(false);
  // }, [selectedWidgets, widget.id]);

  // useEffect(() => {
  //   toggleActionButtons();
  // }, [toggleActionButtons]);

  return (
    <div
      {...gestureable('widget')}
      {...idable(widget.id)}
      className={`widget ${readOnly ? 'widget-readonly' : 'widget-editable'}`}
      style={{
        zIndex: z.toString(),
        top: `${cellSize * y}px`,
        left: `${cellSize * x}px`,
        width: `${cellSize * width}px`,
        height: `${cellSize * height}px`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {enableActionButtons && <WidgetActions widget={widget} />}
      <DynamicWidgetComponent
        widget={widget}
        widgetsMessages={messageOverrides.widgets}
      />
    </div>
  );
};

export default WidgetComponent;
