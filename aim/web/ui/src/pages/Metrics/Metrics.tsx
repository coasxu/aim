import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import Table from 'components/Table/Table';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import ResizePanel from 'components/ResizePanel/ResizePanel';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Grouping from 'components/Grouping/Grouping';
import ProgressBar from 'components/ProgressBar/ProgressBar';

import pageTitlesEnum from 'config/pageTitles/pageTitles';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';
import GroupingPopovers, {
  GroupNameEnum,
} from 'config/grouping/GroupingPopovers';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import {
  IllustrationsEnum,
  Request_Illustrations,
} from 'config/illustrationConfig/illustrationConfig';

import { AppNameEnum } from 'services/models/explorer';

import { ILine } from 'types/components/LineChart/LineChart';
import { IMetricProps } from 'types/pages/metrics/Metrics';

import { ChartTypeEnum } from 'utils/d3';

import MetricsBar from './components/MetricsBar/MetricsBar';
import Controls from './components/Controls/Controls';
import SelectForm from './components/SelectForm/SelectForm';

import './Metrics.scss';

function Metrics(
  props: IMetricProps,
): React.FunctionComponentElement<React.ReactNode> {
  const [isProgressBarVisible, setIsProgressBarVisible] =
    React.useState<boolean>(false);
  const chartProps: any[] = React.useMemo(() => {
    return (props.lineChartData || []).map(
      (chartData: ILine[], index: number) => ({
        axesScaleType: props.axesScaleType,
        curveInterpolation: props.curveInterpolation,
        ignoreOutliers: props.ignoreOutliers,
        highlightMode: props.highlightMode,
        aggregatedData: props.aggregatedData?.filter(
          (data) => data.chartIndex === index,
        ),
        zoom: props.zoom,
        chartTitle: props.chartTitleData[index],
        aggregationConfig: props.aggregationConfig,
        alignmentConfig: props.alignmentConfig,
        onZoomChange: props.onZoomChange,
      }),
    );
  }, [
    props.lineChartData,
    props.axesScaleType,
    props.curveInterpolation,
    props.ignoreOutliers,
    props.highlightMode,
    props.zoom,
    props.chartTitleData,
    props.aggregatedData,
    props.aggregationConfig,
    props.alignmentConfig,
    props.onZoomChange,
  ]);

  return (
    <ErrorBoundary>
      <div ref={props.wrapperElemRef} className='Metrics__container'>
        <section className='Metrics__section'>
          <div className='Metrics__section__appBarContainer Metrics__fullHeight'>
            <MetricsBar
              disabled={isProgressBarVisible}
              onBookmarkCreate={props.onBookmarkCreate}
              onBookmarkUpdate={props.onBookmarkUpdate}
              onResetConfigData={props.onResetConfigData}
              liveUpdateConfig={props.liveUpdateConfig}
              onLiveUpdateConfigChange={props.onLiveUpdateConfigChange}
              title={pageTitlesEnum.METRICS_EXPLORER}
            />
            <div className='Metrics__SelectForm__Grouping__container'>
              <SelectForm
                requestIsPending={
                  props.requestStatus === RequestStatusEnum.Pending
                }
                isDisabled={isProgressBarVisible}
                selectFormData={props.selectFormData}
                selectedMetricsData={props.selectedMetricsData}
                onMetricsSelectChange={props.onMetricsSelectChange}
                onSelectRunQueryChange={props.onSelectRunQueryChange}
                onSelectAdvancedQueryChange={props.onSelectAdvancedQueryChange}
                toggleSelectAdvancedMode={props.toggleSelectAdvancedMode}
                onSearchQueryCopy={props.onSearchQueryCopy}
              />
              <Grouping
                groupingPopovers={GroupingPopovers.filter(
                  (p) =>
                    p.groupName === GroupNameEnum.COLOR ||
                    p.groupName === GroupNameEnum.STROKE ||
                    p.groupName === GroupNameEnum.CHART,
                )}
                isDisabled={isProgressBarVisible}
                groupingData={props.groupingData}
                groupingSelectOptions={props.groupingSelectOptions}
                onGroupingSelectChange={props.onGroupingSelectChange}
                onGroupingModeChange={props.onGroupingModeChange}
                onGroupingPaletteChange={props.onGroupingPaletteChange}
                onGroupingReset={props.onGroupingReset}
                onGroupingApplyChange={props.onGroupingApplyChange}
                onGroupingPersistenceChange={props.onGroupingPersistenceChange}
                onShuffleChange={props.onShuffleChange}
              />
            </div>
            <div className='Metrics__visualization'>
              <ProgressBar
                progress={props.requestProgress}
                pendingStatus={
                  props.requestStatus === RequestStatusEnum.Pending
                }
                processing={false}
                setIsProgressBarVisible={setIsProgressBarVisible}
              />
              {_.isEmpty(props.tableData) && _.isEmpty(props.lineChartData) ? (
                <IllustrationBlock
                  size='xLarge'
                  page='metrics'
                  type={
                    props.selectFormData.options?.length
                      ? Request_Illustrations[props.requestStatus]
                      : IllustrationsEnum.EmptyData
                  }
                />
              ) : (
                <>
                  <div
                    ref={props.chartElemRef}
                    className={classNames('Metrics__chart__container', {
                      fullHeight: props.resizeMode === ResizeModeEnum.Hide,
                      hide: props.resizeMode === ResizeModeEnum.MaxHeight,
                    })}
                  >
                    {props.resizeMode === ResizeModeEnum.MaxHeight ? null : (
                      <ChartPanel
                        key={props.lineChartData?.length}
                        ref={props.chartPanelRef}
                        selectOptions={props.groupingSelectOptions}
                        chartPanelOffsetHeight={props.chartPanelOffsetHeight}
                        panelResizing={props.panelResizing}
                        chartType={ChartTypeEnum.LineChart}
                        data={props.lineChartData}
                        focusedState={props.focusedState}
                        tooltip={props.tooltip}
                        alignmentConfig={props.alignmentConfig}
                        zoom={props.zoom}
                        onActivePointChange={props.onActivePointChange}
                        chartProps={chartProps}
                        resizeMode={props.resizeMode}
                        controls={
                          <Controls
                            data={props.lineChartData}
                            chartType={ChartTypeEnum.LineChart}
                            chartProps={chartProps}
                            selectOptions={props.groupingSelectOptions}
                            tooltip={props.tooltip}
                            smoothingAlgorithm={props.smoothingAlgorithm}
                            smoothingFactor={props.smoothingFactor}
                            curveInterpolation={props.curveInterpolation}
                            densityType={props.densityType}
                            ignoreOutliers={props.ignoreOutliers}
                            zoom={props.zoom}
                            highlightMode={props.highlightMode}
                            aggregationConfig={props.aggregationConfig}
                            axesScaleType={props.axesScaleType}
                            alignmentConfig={props.alignmentConfig}
                            onChangeTooltip={props.onChangeTooltip}
                            onIgnoreOutliersChange={
                              props.onIgnoreOutliersChange
                            }
                            onZoomChange={props.onZoomChange}
                            onHighlightModeChange={props.onHighlightModeChange}
                            onAxesScaleTypeChange={props.onAxesScaleTypeChange}
                            onSmoothingChange={props.onSmoothingChange}
                            onAggregationConfigChange={
                              props.onAggregationConfigChange
                            }
                            onDensityTypeChange={props.onDensityTypeChange}
                            onAlignmentTypeChange={props.onAlignmentTypeChange}
                            onAlignmentMetricChange={
                              props.onAlignmentMetricChange
                            }
                            selectFormOptions={props.selectFormData.options}
                          />
                        }
                      />
                    )}
                  </div>
                  <ResizePanel
                    className='Metrics__ResizePanel'
                    panelResizing={props.panelResizing}
                    resizeElemRef={props.resizeElemRef}
                    resizeMode={props.resizeMode}
                    onTableResizeModeChange={props.onTableResizeModeChange}
                  />
                  <div
                    ref={props.tableElemRef}
                    className={classNames('Metrics__table__container', {
                      fullHeight: props.resizeMode === ResizeModeEnum.MaxHeight,
                      hide: props.resizeMode === ResizeModeEnum.Hide,
                    })}
                  >
                    {props.resizeMode === ResizeModeEnum.Hide ? null : (
                      <ErrorBoundary>
                        <Table
                          // deletable
                          custom
                          ref={props.tableRef}
                          data={props.tableData}
                          columns={props.tableColumns}
                          // Table options
                          multiSelect
                          topHeader
                          groups={!Array.isArray(props.tableData)}
                          rowHeight={props.tableRowHeight}
                          rowHeightMode={
                            props.tableRowHeight === RowHeightSize.sm
                              ? 'small'
                              : props.tableRowHeight === RowHeightSize.md
                              ? 'medium'
                              : 'large'
                          }
                          sortOptions={props.groupingSelectOptions}
                          sortFields={props.sortFields}
                          hiddenRows={props.hiddenMetrics}
                          hiddenColumns={props.hiddenColumns}
                          resizeMode={props.resizeMode}
                          columnsWidths={props.columnsWidths}
                          selectedRows={props.selectedRows}
                          hideSystemMetrics={props.hideSystemMetrics}
                          appName={AppNameEnum.METRICS}
                          hiddenChartRows={props.lineChartData?.length === 0}
                          columnsOrder={props.columnsOrder}
                          sameValueColumns={props?.sameValueColumns!}
                          // Table actions
                          onSort={props.onSortChange}
                          onSortReset={props.onSortReset}
                          onExport={props.onExportTableData}
                          onManageColumns={props.onColumnsOrderChange}
                          onColumnsVisibilityChange={
                            props.onColumnsVisibilityChange
                          }
                          onTableDiffShow={props.onTableDiffShow}
                          onRowHeightChange={props.onRowHeightChange}
                          onRowsChange={props.onMetricVisibilityChange}
                          onRowHover={props.onTableRowHover}
                          onRowClick={props.onTableRowClick}
                          onTableResizeModeChange={
                            props.onTableResizeModeChange
                          }
                          updateColumnsWidths={props.updateColumnsWidths}
                          onRowSelect={props.onRowSelect}
                          archiveRuns={props.archiveRuns}
                          deleteRuns={props.deleteRuns}
                          focusedState={props.focusedState}
                        />
                      </ErrorBoundary>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
        {props.notifyData?.length > 0 && (
          <NotificationContainer
            handleClose={props.onNotificationDelete}
            data={props.notifyData}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(Metrics);
