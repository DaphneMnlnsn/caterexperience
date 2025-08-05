import React from 'react';
import { Image as KonvaImage, Group } from 'react-konva';
import useImage from 'use-image';

function VenueImageLayout({ imagePath, originalWidth, originalHeight, baseScale }) {
  const [image] = useImage(imagePath);
  const width = originalWidth * baseScale;
  const height = originalHeight * baseScale;
  const startX = (1000 - width) / 2;
  const startY = 0;

  return (
    <Group>
      <KonvaImage
        image={image}
        x={startX}
        y={startY}
        width={width}
        height={height}
      />
    </Group>
  );
}

export default VenueImageLayout;
