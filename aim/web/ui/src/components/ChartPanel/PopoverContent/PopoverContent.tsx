import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import _ from 'lodash-es';

import { Divider, Link, Paper } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { PathEnum } from 'config/enums/routesEnum';

import { IPopoverContentProps } from 'types/components/ChartPanel/PopoverContent';

import contextToString from 'utils/contextToString';
import {
  formatValueByAlignment,
  getKeyByAlignment,
} from 'utils/formatByAlignment';
import { AlignmentOptionsEnum, ChartTypeEnum } from 'utils/d3';
import { formatValue } from 'utils/formatValue';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import getValueByField from 'utils/getValueByField';

import './PopoverContent.scss';

const PopoverContent = React.forwardRef(function PopoverContent(
  props: IPopoverContentProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    tooltipContent,
    focusedState,
    chartType,
    alignmentConfig,
    selectOptions,
  } = props;
  const {
    selectedProps = {},
    groupConfig = {},
    name = '',
    context = {},
    run,
  } = tooltipContent || {};
  function renderPopoverHeader(): React.ReactNode {
    switch (chartType) {
      case ChartTypeEnum.LineChart: {
        return (
          <ErrorBoundary>
            <div className='PopoverContent__box'>
              <div className='PopoverContent__valueContainer'>
                <Text>Y: </Text>
                <span className='PopoverContent__headerValue'>
                  <Text weight={400}>
                    {isSystemMetric(name) ? formatSystemMetricName(name) : name}
                  </Text>
                  <Text className='PopoverContent__contextValue'>
                    {contextToString(context)}
                  </Text>
                  <Text component='p' className='PopoverContent__axisValue'>
                    {formatValue(focusedState?.yValue)}
                  </Text>
                </span>
              </div>
              <div className='PopoverContent__valueContainer'>
                <Text>X: </Text>
                <span className='PopoverContent__headerValue'>
                  <Text weight={400}>{getKeyByAlignment(alignmentConfig)}</Text>
                  {alignmentConfig?.type ===
                    AlignmentOptionsEnum.CUSTOM_METRIC && (
                    <Text className='PopoverContent__contextValue'>
                      {contextToString(context)}
                    </Text>
                  )}
                  <Text component='p' className='PopoverContent__axisValue'>
                    {formatValueByAlignment({
                      xAxisTickValue: (focusedState?.xValue as number) ?? null,
                      type: alignmentConfig?.type,
                    })}
                  </Text>
                </span>
              </div>
            </div>
          </ErrorBoundary>
        );
      }
      case ChartTypeEnum.HighPlot: {
        const [metric, context] = (
          (focusedState?.xValue as string) || ''
        )?.split('-');
        return (
          <ErrorBoundary>
            <div className='PopoverContent__box'>
              <div className='PopoverContent__value'>
                <strong>
                  {isSystemMetric(metric)
                    ? formatSystemMetricName(metric)
                    : metric ?? '--'}
                </strong>{' '}
                {context || null}
              </div>
              <div className='PopoverContent__value'>
                Value: {formatValue(focusedState?.yValue)}
              </div>
            </div>
          </ErrorBoundary>
        );
      }
      case ChartTypeEnum.ImageSet: {
        const {
          step = '',
          index = '',
          caption = '',
          images_name = '',
        } = tooltipContent;
        return (
          <ErrorBoundary>
            <div className='PopoverContent__box PopoverContent__imageSetBox'>
              <strong>{caption}</strong>
              <div className='PopoverContent__value'>
                <strong>{images_name}</strong>
                <Text className='PopoverContent__contextValue'>
                  {contextToString(context)}
                </Text>
              </div>
              <div className='PopoverContent__value'>
                Step: <strong>{step}</strong>
                <Text className='PopoverContent__contextValue'>
                  Index: <strong>{index}</strong>
                </Text>
              </div>
            </div>
          </ErrorBoundary>
        );
      }
      case ChartTypeEnum.ScatterPlot: {
        return (
          <ErrorBoundary>
            <div className='PopoverContent__box'>
              <div className='PopoverContent__valueContainer'>
                <Text>Y: </Text>
                <span className='PopoverContent__headerValue'>
                  <Text component='p' className='PopoverContent__axisValue'>
                    {formatValue(focusedState?.yValue)}
                  </Text>
                </span>
              </div>
              <div className='PopoverContent__valueContainer'>
                <Text>X: </Text>
                <span className='PopoverContent__headerValue'>
                  <Text component='p' className='PopoverContent__axisValue'>
                    {formatValue(focusedState?.xValue)}
                  </Text>
                </span>
              </div>
            </div>
          </ErrorBoundary>
        );
      }
      default:
        return null;
    }
  }

  return (
    <ErrorBoundary>
      <Paper
        ref={ref}
        className='PopoverContent__container'
        style={{ pointerEvents: focusedState?.active ? 'auto' : 'none' }}
        elevation={0}
      >
        <div className='PopoverContent'>
          {renderPopoverHeader()}
          {_.isEmpty(selectedProps) ? null : (
            <ErrorBoundary>
              <div>
                <Divider />
                <div className='PopoverContent__box'>
                  {Object.keys(selectedProps).map((paramKey) => (
                    <div key={paramKey} className='PopoverContent__value'>
                      <Text size={12} tint={50}>
                        {`${getValueByField(selectOptions, paramKey)}: `}
                      </Text>
                      <Text size={12}>
                        {formatValue(selectedProps[paramKey])}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </ErrorBoundary>
          )}
          {_.isEmpty(groupConfig) ? null : (
            <ErrorBoundary>
              <div>
                <Divider />
                <div className='PopoverContent__box'>
                  <div className='PopoverContent__subtitle1'>Group Config</div>
                  {Object.keys(groupConfig).map((groupConfigKey: string) =>
                    _.isEmpty(groupConfig[groupConfigKey]) ? null : (
                      <React.Fragment key={groupConfigKey}>
                        <div className='PopoverContent__subtitle2'>
                          {groupConfigKey}
                        </div>
                        {Object.keys(groupConfig[groupConfigKey]).map(
                          (item) => {
                            let val = isSystemMetric(
                              groupConfig[groupConfigKey][item],
                            )
                              ? formatSystemMetricName(
                                  groupConfig[groupConfigKey][item],
                                )
                              : groupConfig[groupConfigKey][item];
                            return (
                              <div key={item} className='PopoverContent__value'>
                                <Text size={12} tint={50}>{`${item}: `}</Text>
                                <Text size={12}>{formatValue(val)}</Text>
                              </div>
                            );
                          },
                        )}
                      </React.Fragment>
                    ),
                  )}
                </div>
              </div>
            </ErrorBoundary>
          )}
          {focusedState?.active && run?.hash ? (
            <ErrorBoundary>
              <div>
                <Divider />
                <div className='PopoverContent__box'>
                  <Link
                    to={PathEnum.Run_Detail.replace(':runHash', run?.hash)}
                    component={RouteLink}
                    className='PopoverContent__runDetails'
                    underline='none'
                  >
                    <Icon name='link' />
                    <div>Run Details</div>
                  </Link>
                </div>
              </div>
              <div>
                <Divider />
                <div className='PopoverContent__box'>
                  <ErrorBoundary>
                    <AttachedTagsList runHash={run?.hash} />
                  </ErrorBoundary>
                </div>
              </div>
            </ErrorBoundary>
          ) : null}
        </div>
      </Paper>
    </ErrorBoundary>
  );
});

export default React.memo(PopoverContent);
