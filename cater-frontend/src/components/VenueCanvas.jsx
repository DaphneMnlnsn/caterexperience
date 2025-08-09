import React, { useRef, useState } from 'react';
import { Stage, Layer, Group, Rect, Circle, Ellipse, Text, Line } from 'react-konva';
import VenueImageLayout from './VenueImageLayout';
import pavilionImg from '../assets/Pavilion.svg';
import airconImg from '../assets/Aircon.svg';
import poolsideImg from '../assets/Poolside.svg';
import OutsideVenueLayout from './OutsideVenueLayout';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 400;
const BASE_SCALE = 0.25;
const shared = { stroke: '#000', strokeWidth: 1.5, fill: 'transparent' };
const CHAIR_W_DEFAULT_M = 0.45;
const CHAIR_H_DEFAULT_M = 0.45;

function VenueCanvas({ venue, venueRealWidthMeters = null, venueRealAreaMeters = null }) {
  const stageRef = useRef();
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const [placed, setPlaced] = useState([]);

  const venueConfig = (() => {
    if (venue === 'pavilion') {
      return { originalWidth: 2733, originalHeight: 1556, baseScale: BASE_SCALE };
    }
    if (venue === 'aircon-room') {
      return { originalWidth: 1559, originalHeight: 610, baseScale: BASE_SCALE * 2 };
    }
    if (venue === 'poolside') {
      return { originalWidth: 1500, originalHeight: 1200, baseScale: BASE_SCALE * 1.3 };
    }
    return { originalWidth: 1000, originalHeight: 800, baseScale: BASE_SCALE };
  })();

  const displayedImagePxWidth = venueConfig.originalWidth * venueConfig.baseScale;
  const displayedImagePxHeight = venueConfig.originalHeight * venueConfig.baseScale;

  const computePxPerMeter = () => {
    if (venueRealWidthMeters && venueRealWidthMeters > 0) {
      return displayedImagePxWidth / venueRealWidthMeters;
    }
    if (venueRealAreaMeters && venueRealAreaMeters > 0) {
      const pixelArea = displayedImagePxWidth * displayedImagePxHeight;
      return Math.sqrt(pixelArea / venueRealAreaMeters);
    }
    return 20;
  };

  const pxPerMeter = computePxPerMeter();

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = stageScale;
    const pointer = stageRef.current.getPointerPosition();
    if (!pointer) return;

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

  const handleDrop = (e) => {
    e.preventDefault();
    const json = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (!json) return;
    let obj;
    try { obj = JSON.parse(json); } catch (err) { return; }

    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.container().getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const xOnStage = (clientX - rect.left - stage.x()) / stage.scaleX();
    const yOnStage = (clientY - rect.top - stage.y()) / stage.scaleY();

    const x_m = xOnStage / pxPerMeter;
    const y_m = yOnStage / pxPerMeter;

    const placedObj = {
      id: `p-${Date.now()}`,
      object_type: obj.object_type,
      object_props: obj.object_props || {},
      object_name: obj.object_name,
      x_m,
      y_m,
      rotation: obj.default_rotation ?? 0,
      scale: obj.default_scale ?? 1,
      z_index: obj.z_index ?? 1,
    };

    setPlaced(prev => [...prev, placedObj]);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handlePlacedDragEnd = (id, e) => {
    const node = e.target;
    const newX_px = node.x();
    const newY_px = node.y();
    const newX_m = newX_px / pxPerMeter;
    const newY_m = newY_px / pxPerMeter;
    setPlaced(prev => prev.map(p => p.id === id ? { ...p, x_m: newX_m, y_m: newY_m } : p));
  };

  const renderPreviewByType = (typeRaw = '', props = {}, pxPerMeterLocal = 20, scaleForObject = 1) => {
    const type = (typeRaw || '').toString().replace(/[^a-z0-9]/gi, '').toLowerCase();

    const chairWpx = (props.chair_w_m ?? CHAIR_W_DEFAULT_M) * pxPerMeterLocal * scaleForObject;
    const chairHpx = (props.chair_h_m ?? CHAIR_H_DEFAULT_M) * pxPerMeterLocal * scaleForObject;

    switch (type) {
      case 'chair': {
        return (
          <Rect
            x={0}
            y={0}
            width={chairWpx}
            height={chairHpx}
            cornerRadius={3}
            {...shared}
            offset={{ x: chairWpx / 2, y: chairHpx / 2 }}
          />
        );
      }

      case 'singleroundtable':
      case 'singleroundtable': {
        const r_px = (props.radius_m ?? 0.75) * pxPerMeterLocal * scaleForObject;
        return <Circle x={0} y={0} radius={r_px} {...shared} />;
      }

      case 'roundtable': {
        const r_px = (props.radius_m ?? 0.75) * pxPerMeterLocal * scaleForObject;
        const count = props.count ?? 6;
        const chairDistance = r_px + Math.max(chairHpx, chairWpx) / 2 + 5;
        return (
          <Group>
            <Circle x={0} y={0} radius={r_px} {...shared} />
            {[...Array(count)].map((_, i) => {
              const angle = (2 * Math.PI / count) * i;
              const cx = Math.cos(angle) * chairDistance;
              const cy = Math.sin(angle) * chairDistance;
              const rot = (angle * 180) / Math.PI + 90;
              return (
                <Rect
                  key={i}
                  x={cx}
                  y={cy}
                  width={chairWpx}
                  height={chairHpx}
                  offset={{ x: chairWpx / 2, y: chairHpx / 2 }}
                  rotation={rot}
                  cornerRadius={3}
                  {...shared}
                />
              );
            })}
          </Group>
        );
      }

      case 'recttable': {
        const w_px = (props.w_m ?? 1.5) * pxPerMeterLocal * scaleForObject;
        const h_px = (props.h_m ?? 0.75) * pxPerMeterLocal * scaleForObject;
        const topBottom = props.topBottom ?? props.topbottom ?? 0;
        const sides = props.sides ?? 0;

        const chairs = [];
        if (topBottom > 0) {
          const gapTB = w_px / (topBottom + 1);
          for (let i = 0; i < topBottom; i++) {
            const cx = -w_px / 2 + gapTB * (i + 1);
            chairs.push(
              <Rect key={`t${i}`} x={cx} y={-h_px / 2 - chairHpx / 2}
                    width={chairWpx} height={chairHpx} offset={{ x: chairWpx/2, y: chairHpx/2 }} {...shared} cornerRadius={3} />,
              <Rect key={`b${i}`} x={cx} y={h_px / 2 + chairHpx / 2}
                    width={chairWpx} height={chairHpx} offset={{ x: chairWpx/2, y: chairHpx/2 }} rotation={180} {...shared} cornerRadius={3} />
            );
          }
        }
        if (sides > 0) {
          const gapS = h_px / (sides + 1);
          for (let i = 0; i < sides; i++) {
            const cy = -h_px / 2 + gapS * (i + 1);
            chairs.push(
              <Rect key={`l${i}`} x={-w_px / 2 - chairWpx / 2} y={cy}
                    width={chairHpx} height={chairWpx} offset={{ x: chairHpx/2, y: chairWpx/2 }} rotation={270} {...shared} cornerRadius={3} />,
              <Rect key={`r${i}`} x={w_px / 2 + chairWpx / 2} y={cy}
                    width={chairHpx} height={chairWpx} offset={{ x: chairHpx/2, y: chairWpx/2 }} rotation={90} {...shared} cornerRadius={3} />
            );
          }
        }

        return (
          <Group>
            <Rect x={-w_px/2} y={-h_px/2} width={w_px} height={h_px} cornerRadius={3} {...shared} />
            {chairs}
          </Group>
        );
      }

      case 'squaretable': {
        const w_px = (props.w_m ?? 1.2) * pxPerMeterLocal * scaleForObject;
        const half = w_px / 2;
        return (
          <Group>
            <Rect x={-half} y={-half} width={w_px} height={w_px} {...shared} />
            <Rect x={0} y={-half - chairHpx/2} width={chairWpx} height={chairHpx} offset={{ x: chairWpx/2, y: chairHpx/2 }} {...shared} cornerRadius={3} />
            <Rect x={0} y={half + chairHpx/2} width={chairWpx} height={chairHpx} offset={{ x: chairWpx/2, y: chairHpx/2 }} rotation={180} {...shared} cornerRadius={3} />
            <Rect x={-half - chairWpx/2} y={0} width={chairHpx} height={chairWpx} offset={{ x: chairHpx/2, y: chairWpx/2 }} rotation={270} {...shared} cornerRadius={3} />
            <Rect x={half + chairWpx/2} y={0} width={chairHpx} height={chairWpx} offset={{ x: chairHpx/2, y: chairWpx/2 }} rotation={90} {...shared} cornerRadius={3} />
          </Group>
        );
      }

      case 'ovaltable': {
        const rx_px = (props.rx_m ?? 1.0) * pxPerMeterLocal * scaleForObject;
        const ry_px = (props.ry_m ?? 0.5) * pxPerMeterLocal * scaleForObject;
        const count = props.count ?? 8;
        const chairDistanceX = rx_px + Math.max(chairWpx, chairHpx) / 2 + 5;
        const chairDistanceY = ry_px + Math.max(chairWpx, chairHpx) / 2 + 5;

        return (
          <Group>
            <Ellipse x={0} y={0} radiusX={rx_px} radiusY={ry_px} {...shared} />
            {[...Array(count)].map((_, i) => {
              const angle = (2 * Math.PI / count) * i;
              const cx = Math.cos(angle) * chairDistanceX;
              const cy = Math.sin(angle) * chairDistanceY;
              const rot = (angle * 180) / Math.PI + 90;
              return <Rect key={i} x={cx} y={cy} width={chairWpx} height={chairHpx} offset={{ x: chairWpx/2, y: chairHpx/2 }} rotation={rot} cornerRadius={3} {...shared} />;
            })}
          </Group>
        );
      }

      case 'buffettable': {
        const w_px = (props.w_m ?? 2.0) * pxPerMeterLocal * scaleForObject;
        const h_px = (props.h_m ?? 0.5) * pxPerMeterLocal * scaleForObject;
        const count = props.count ?? 6;
        const spacing = w_px / (count + 1);
        return (
          <Group>
            <Rect x={-w_px/2} y={-h_px/2} width={w_px} height={h_px} {...shared} cornerRadius={5} />
            {[...Array(count)].map((_, i) => <Circle key={i} x={-w_px/2 + spacing*(i+1)} y={0} radius={Math.max(3, spacing*0.12)} {...shared} />)}
          </Group>
        );
      }

      case 'plant': {
        const r_px = (props.radius_m ?? 0.25) * pxPerMeterLocal * scaleForObject;
        const petals = props.petals ?? 6;
        return (
          <Group>
            <Circle x={0} y={0} radius={r_px} {...shared} />
            {[...Array(petals)].map((_, i) => {
              const a = (2 * Math.PI / petals) * i;
              return <Circle key={i} x={Math.cos(a) * (r_px * 0.6)} y={Math.sin(a) * (r_px * 0.6)} radius={Math.max(2, r_px*0.15)} {...shared} />;
            })}
          </Group>
        );
      }

      case 'divider':
        return <Line points={[-(props.length_m ?? 2)*pxPerMeterLocal/2, 0, (props.length_m ?? 2)*pxPerMeterLocal/2, 0]} stroke="#000" strokeWidth={2} dash={props.dash ?? [10,5]} />;

      case 'stage':
      case 'stageoutline': {
        const w_px = (props.w_m ?? 4) * pxPerMeterLocal * scaleForObject;
        const h_px = (props.h_m ?? 1) * pxPerMeterLocal * scaleForObject;
        return (
          <Group>
            <Rect x={-w_px/2} y={-h_px/2} width={w_px} height={h_px} {...shared} />
            <Text text={props.label ?? 'STAGE'} x={-20} y={-h_px/2 + 2} fontSize={Math.max(8, h_px*0.25)} fill="#000" />
          </Group>
        );
      }

      case 'backdrop':
      case 'backdropline':
        return <Line points={[-(props.length_m ?? 2)*pxPerMeterLocal/2, 0, (props.length_m ?? 2)*pxPerMeterLocal/2, 0]} {...shared} />;

      case 'light':
      case 'lightoutline':
        return <Circle x={0} y={0} radius={(props.radius_m ?? 0.05) * pxPerMeterLocal} {...shared} />;

      case 'fan':
      case 'fanoutline':
        return <Group><Line points={[-10,0,0,-10,10,0,0,10,-10,0]} closed {...shared} /></Group>;

      default:
        return (
          <Group>
            <Rect x={-25} y={-15} width={50} height={30} {...shared} />
            <Text text={props.label ?? typeRaw} x={-20} y={-6} fontSize={8} fill="#000" />
          </Group>
        );
    }
  };

  const renderPlaced = (p) => {
    const x_px = p.x_m * pxPerMeter;
    const y_px = p.y_m * pxPerMeter;
    const scaleForObject = p.scale ?? 1;

    return (
      <Group
        key={p.id}
        x={x_px}
        y={y_px}
        rotation={p.rotation}
        draggable
        onDragEnd={(e) => handlePlacedDragEnd(p.id, e)}
      >
        {renderPreviewByType(p.object_type, p.object_props || {}, pxPerMeter, scaleForObject)}
      </Group>
    );
  };

  const placedSorted = [...placed].sort((a, b) => (a.z_index ?? 0) - (b.z_index ?? 0));

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, border: '1px solid #ddd', background: '#f7f7f7' }}
    >
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
      >
        <Layer>
          {venue === 'pavilion' && (
            <VenueImageLayout imagePath={pavilionImg} originalWidth={2733} originalHeight={1556} baseScale={BASE_SCALE} />
          )}
          {venue === 'aircon-room' && (
            <VenueImageLayout imagePath={airconImg} originalWidth={1559} originalHeight={610} baseScale={BASE_SCALE * 2} />
          )}
          {venue === 'poolside' && (
            <VenueImageLayout imagePath={poolsideImg} originalWidth={1500} originalHeight={1200} baseScale={BASE_SCALE * 1.3} />
          )}
          {venue === 'outside' && <OutsideVenueLayout />}

          {placedSorted.map(p => renderPlaced(p))}
        </Layer>
      </Stage>
    </div>
  );
}

export default VenueCanvas;
