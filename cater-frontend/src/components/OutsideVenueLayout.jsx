import React from 'react';
import { Group, Rect, Text } from 'react-konva';

function OutsideVenueLayout() {
  const padding = 40;
  const width = 1000 - padding * 2;
  const height = 400 - padding * 2;

  return (
    <Group>
      <Rect
        x={padding}
        y={padding}
        width={width}
        height={height}
        stroke="#999"
        strokeWidth={2}
        dash={[10, 5]}
      />
      <Text
        x={padding}
        y={padding + height / 2 - 10}
        width={width}
        align="center"
        text="Outside Venue"
        fontSize={16}
        fontStyle="italic"
        fill="#666"
      />
    </Group>
  );
}

export default OutsideVenueLayout;
