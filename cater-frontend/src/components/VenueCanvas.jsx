import React, { useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import VenueImageLayout from './VenueImageLayout';
import pavilionImg from '../assets/Pavilion.svg';
import airconImg from '../assets/Aircon.svg';
import poolsideImg from '../assets/Poolside.svg';
import OutsideVenueLayout from './OutsideVenueLayout';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 400;
const BASE_SCALE = 0.15;

function VenueCanvas({ venue }) {
  const stageRef = useRef();
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = stageScale;
    const pointer = stageRef.current.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStagePos(newPos);
  };

  return (
    <Stage
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      draggable
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePos.x}
      y={stagePos.y}
      onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
      onWheel={handleWheel}
      ref={stageRef}
      style={{ border: '1px solid #ddd', background: '#f7f7f7' }}
    >
      <Layer>
        {venue === 'pavilion' && (
          <VenueImageLayout
            imagePath={pavilionImg}
            originalWidth={2733}
            originalHeight={1556}
            baseScale={BASE_SCALE}
          />
        )}
        {venue === 'aircon-room' && (
          <VenueImageLayout
            imagePath={airconImg}
            originalWidth={1559}
            originalHeight={610}
            baseScale={BASE_SCALE}
          />
        )}
        {venue === 'poolside' && (
          <VenueImageLayout
            imagePath={poolsideImg}
            originalWidth={1500}
            originalHeight={1200}
            baseScale={BASE_SCALE}
          />
        )}
        {venue === 'outside' && <OutsideVenueLayout />}
      </Layer>
    </Stage>
  );
}

export default VenueCanvas;
