import * as d3 from 'd3';

import { IDrawAreaArgs } from 'types/utils/d3/drawArea';

import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';
import { toTextEllipsis } from 'utils/helper';

import { CircleEnum } from './index';

function drawArea(args: IDrawAreaArgs): void {
  const {
    index,
    nameKey,
    parentRef,
    visAreaRef,
    svgNodeRef,
    bgRectNodeRef,
    visBoxRef,
    plotNodeRef,
    axesNodeRef,
    plotBoxRef,
    linesNodeRef,
    attributesNodeRef,
    chartTitle = {},
  } = args;

  if (!parentRef?.current || !visAreaRef?.current) {
    return;
  }

  const parent = d3.select(parentRef.current);
  const visArea = d3.select(visAreaRef.current);

  const parentRect = parent.node().getBoundingClientRect();
  const { width, height } = parentRect;
  const { margin } = visBoxRef.current;

  // set visual box dimensions
  visBoxRef.current = {
    ...visBoxRef.current,
    width,
    height,
  };

  // set plot box dimensions
  plotBoxRef.current = {
    ...plotBoxRef.current,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const offsetWidth =
    width - margin.left - margin.right >= 0
      ? width - margin.left - margin.right
      : 0;

  const offsetHeight =
    height - margin.top - margin.bottom >= 0
      ? height - margin.top - margin.bottom
      : 0;

  visArea.style('width', `${width}px`).style('height', `${height}px`);

  svgNodeRef.current = visArea
    .append('svg')
    .attr('id', `${nameKey}-svg-area-${index}`)
    .attr('width', `${width}px`)
    .attr('height', `${height}px`)
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .style('fill', 'transparent');

  bgRectNodeRef.current = svgNodeRef.current
    .append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr('class', 'backgroundRect')
    .attr('width', offsetWidth)
    .attr('height', offsetHeight)
    .style('fill', 'transparent');

  plotNodeRef.current = svgNodeRef.current
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  axesNodeRef.current = plotNodeRef.current.append('g').attr('class', 'Axes');
  linesNodeRef.current = plotNodeRef.current.append('g').attr('class', 'Lines');

  linesNodeRef.current
    .append('clipPath')
    .attr('id', `${nameKey}-lines-rect-clip-${index}`)
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', offsetWidth)
    .attr('height', offsetHeight);

  attributesNodeRef.current = plotNodeRef.current
    .append('g')
    .attr('class', 'Attributes');

  attributesNodeRef.current
    .append('clipPath')
    .attr('id', `${nameKey}-circles-rect-clip-${index}`)
    .append('rect')
    .attr('x', -CircleEnum.Radius)
    .attr('y', -CircleEnum.Radius)
    .attr('width', offsetWidth + 2 * CircleEnum.Radius)
    .attr('height', offsetHeight + 2 * CircleEnum.Radius);

  const keys = Object.keys(chartTitle);
  const titleText = keys
    ? `${keys
        .map(
          (key) =>
            `${key}=${
              isSystemMetric(chartTitle[key])
                ? formatSystemMetricName(chartTitle[key])
                : chartTitle[key]
            }`,
        )
        .join(', ')}`
    : '';
  const titleStyle = {
    x: margin.left / 6,
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
  };
  const textEllipsis = toTextEllipsis({
    text: titleText,
    width: titleStyle.x + offsetWidth,
    fontSize: `${titleStyle.fontSize}px`,
    fontFamily: titleStyle.fontFamily,
    fontWeight: titleStyle.fontWeight,
  });
  if (titleText) {
    const titleGroup = svgNodeRef.current
      .append('g')
      .attr('transform', `translate(${titleStyle.x}, 3)`)
      .attr('font-size', `${titleStyle.fontSize}px`)
      .attr('font-weight', titleStyle.fontWeight)
      .attr('font-family', titleStyle.fontFamily);

    titleGroup
      .append('text')
      .attr('x', 0)
      .attr('y', 12)
      .attr('fill', '#484f56')
      .style('outline', '0.8px solid #dee6f3')
      .style('border-radius', '1px')
      .style('white-space', 'pre')
      .text(`  ${index + 1}  `);

    titleGroup
      .append('text')
      .attr('x', titleStyle.x + 39)
      .attr('y', 12)
      .attr('fill', '#484f56')
      .text(textEllipsis)
      .append('svg:title')
      .text(titleText);
  }
}

export default drawArea;
