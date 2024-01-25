import React, { useState } from 'react';
import { getPlugin } from '@iot-app-kit/core';

import './widget.css';
import { useClients } from '../dashboard/clientContext';
import { useDispatch } from 'react-redux';
import {
  colorBackgroundButtonNormalDefault,
  colorBackgroundButtonPrimaryDefault,
  spaceStaticL,
  spaceStaticXl,
  spaceStaticXs,
  spaceStaticXxs,
} from '@cloudscape-design/design-tokens';
import { CSVDownloadButton } from '../csvDownloadButton';
import { StyledSiteWiseQueryConfig } from '~/customization/widgets/types';
import { Box, Button, ButtonProps } from '@cloudscape-design/components';
import {
  CancelableEventHandler,
  ClickDetail,
} from '@cloudscape-design/components/internal/events';
import ConfirmDeleteModal from '../confirmDeleteModal';
import { onChangeDashboardGridEnabledAction } from '~/store/actions';
import { useDeleteWidgets } from '~/hooks/useDeleteWidgets';
import { DashboardWidget } from '~/types';

type DeletableTileActionProps = {
  handleDelete: CancelableEventHandler<ClickDetail>;
};

const DeletableTileAction = ({
  handleDelete,
  variant,
}: DeletableTileActionProps & ButtonProps) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onMouseDown={handleMouseDown}>
      <Button
        onClick={handleDelete}
        ariaLabel='delete widget'
        variant={variant ?? 'icon'}
        iconName='close'
      />
    </div>
  );
};

type WidgetActionsProps = {
  widget: DashboardWidget;
  isSelected: boolean;
  selectedStyle: object;
};

const WidgetActions = ({
  widget,
  isSelected,
  selectedStyle,
}: WidgetActionsProps) => {
  const dispatch = useDispatch();
  const { onDelete } = useDeleteWidgets();
  const metricsRecorder = getPlugin('metricsRecorder');
  const [visible, setVisible] = useState(false);
  const { iotSiteWiseClient } = useClients();

  const handleCloseModal = () => {
    dispatch(onChangeDashboardGridEnabledAction({ enabled: true }));
    setVisible(false);
  };

  const handleSubmit = () => {
    const widgetType = widget.type;
    onDelete(widget);
    dispatch(onChangeDashboardGridEnabledAction({ enabled: true }));
    setVisible(false);

    metricsRecorder?.record({
      contexts: {
        widgetType,
      },
      metricName: 'DashboardWidgetDelete',
      metricValue: 1,
    });
  };

  const handleDelete: CancelableEventHandler<ClickDetail> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(onChangeDashboardGridEnabledAction({ enabled: false }));
    setVisible(true);
  };

  return (
    <div
      className='tile-button-container'
      style={
        isSelected
          ? {
              ...selectedStyle,
              padding: `${spaceStaticXxs} ${spaceStaticXs}`,
              height: `${spaceStaticXl}`,
              borderRadius: `${spaceStaticXxs}`,
              border: `2px solid ${colorBackgroundButtonPrimaryDefault}`,
              backgroundColor: `${colorBackgroundButtonNormalDefault}`,
            }
          : {
              padding: `${spaceStaticXxs} ${spaceStaticXs}`,
              height: `${spaceStaticXl}`,
              right: `${spaceStaticL}`,
              borderRadius: `${spaceStaticXxs}`,
              border: `2px solid ${colorBackgroundButtonPrimaryDefault}`,
              backgroundColor: `${colorBackgroundButtonNormalDefault}`,
            }
      }
    >
      {widget.type !== 'text' && iotSiteWiseClient && (
        <CSVDownloadButton
          variant='inline-icon'
          fileName={`${widget.properties.title ?? widget.type}`}
          client={iotSiteWiseClient}
          widgetType={widget.type}
          queryConfig={
            widget.properties.queryConfig as StyledSiteWiseQueryConfig
          }
        />
      )}
      <DeletableTileAction variant='inline-icon' handleDelete={handleDelete} />
      <ConfirmDeleteModal
        visible={visible}
        headerTitle='Delete selected widget?'
        cancelTitle='Cancel'
        submitTitle='Delete'
        description={
          <Box>
            <Box variant='p'>
              Are you sure you want to delete the selected widget? You'll lose
              all the progress you made to the widget
            </Box>
            <Box variant='p' padding={{ top: 'm' }}>
              You cannot undo this action.
            </Box>
          </Box>
        }
        handleDismiss={handleCloseModal}
        handleCancel={handleCloseModal}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default WidgetActions;
