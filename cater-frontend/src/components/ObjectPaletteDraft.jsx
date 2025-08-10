import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { Stage, Layer, Line, Circle, Rect, Ellipse, Text, Path, Group } from 'react-konva';
import './ObjectPalette.css';
import axiosClient from '../axiosClient';

const shared = { stroke: '#000', strokeWidth: 1.5, fill: 'transparent' };
const CHAIR_W = 15, CHAIR_H = 20;

const AutoScaler = ({ children, canvasWidth = 100, canvasHeight = 100 }) => {
  const groupRef = useRef();
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    let raf = requestAnimationFrame(() => {
      const g = groupRef.current;
      if (!g) return;

      const box = g.getClientRect({ relativeTo: g.getStage() });
      const boxWidth = box.width || 1;
      const boxHeight = box.height || 1;

      const padding = 10;
      const maxW = Math.max(1, canvasWidth - 2 * padding);
      const maxH = Math.max(1, canvasHeight - 2 * padding);

      const scaleX = maxW / boxWidth;
      const scaleY = maxH / boxHeight;
      const rawScale = Math.min(scaleX, scaleY);
      const clamped = Math.max(0.6, Math.min(rawScale || 1, 1));

      const boxCenterStage = { x: box.x + boxWidth / 2, y: box.y + boxHeight / 2 };

      const absPos = g.getAbsolutePosition();

      const localCenter = { x: boxCenterStage.x - absPos.x, y: boxCenterStage.y - absPos.y };

      setScale({ x: clamped, y: clamped });
      setOffset(localCenter);
    });

    return () => cancelAnimationFrame(raf);
  }, [children, canvasWidth, canvasHeight]);

  return (
    <Group ref={groupRef} scale={scale} x={canvasWidth / 2} y={canvasHeight / 2} offset={offset}>
      {children}
    </Group>
  );
};

const Chair = ({ rot = 0, x = 0, y = 0 }) => (
  <Rect x={x} y={y} width={CHAIR_W} height={CHAIR_H} cornerRadius={3} {...shared}
        offset={{ x: CHAIR_W / 2, y: CHAIR_H / 2 }} rotation={rot} />
);

const RectTable = ({ w, h }) => (
  <Rect x={-w/2} y={-h/2} width={w} height={h} cornerRadius={3} {...shared} />
);

const ChairsAroundRect = ({ w, h, topBottom = 0, sides = 0 }) => {
  const chairs = [];
  const gapTB = w / (topBottom + 1 || 1);
  for (let i = 0; i < topBottom; i++) {
    const cx = -w/2 + gapTB * (i + 1);
    chairs.push(
      <Chair key={`t${i}`} rot={0} x={cx} y={-h/2 - CHAIR_H/2} />,
      <Chair key={`b${i}`} rot={180} x={cx} y={h/2 + CHAIR_H/2} />
    );
  }
  const gapS = h / (sides + 1 || 1);
  for (let i = 0; i < sides; i++) {
    const cy = -h/2 + gapS * (i + 1);
    chairs.push(
      <Chair key={`l${i}`} rot={270} x={-w/2 - CHAIR_H/2} y={cy} />,
      <Chair key={`r${i}`} rot={90} x={w/2 + CHAIR_H/2} y={cy} />
    );
  }
  return chairs;
};

const RectTablePreview = ({ topBottom = 0, sides = 0, props = {} }) => {
  const w = props.w ?? 60;
  const h = props.h ?? 30;
  return (
    <Group>
      <RectTable w={w} h={h} />
      {ChairsAroundRect({ w, h, topBottom, sides })}
    </Group>
  );
};

const RoundTablePreview = ({ count = 6, props = {} }) => {
  const r = props.radius ?? 30;
  return (
    <Group>
      <Circle x={0} y={0} radius={r} {...shared} />
      {[...Array(count)].map((_, i) => {
        const angle = (2 * Math.PI / count) * i;
        return (
          <Chair key={i} rot={(angle * 180) / Math.PI + 90}
                 x={Math.cos(angle) * (r + 13)}
                 y={Math.sin(angle) * (r + 13)} />
        );
      })}
    </Group>
  );
};

const SingleRoundTablePreview = ({ props = {} }) => {
  const r = props.radius ?? 30;
  return <Group><Circle x={0} y={0} radius={r} {...shared} /></Group>;
};

const OvalTablePreview = ({ count = 8, props = {} }) => {
  const rx = props.rx ?? 40;
  const ry = props.ry ?? 20;
  return (
    <Group>
      <Ellipse x={0} y={0} radiusX={rx} radiusY={ry} {...shared} />
      {[...Array(count)].map((_, i) => {
        const angle = (2 * Math.PI / count) * i;
        return <Chair key={i} rot={(angle * 180) / Math.PI + 90}
                     x={Math.cos(angle) * (rx + 13)} y={Math.sin(angle) * (ry + 13)} />;
      })}
    </Group>
  );
};

const SquareTablePreview = ({ props = {} }) => {
  const w = props.w ?? 40;
  const h = props.h ?? 40;
  return (
    <Group>
      <RectTable w={w} h={h} />
      <Chair rot={0} x={0} y={-h/2 - CHAIR_H/2} />
      <Chair rot={180} x={0} y={h/2 + CHAIR_H/2} />
      <Chair rot={270} x={-w/2 - CHAIR_H/2} y={0} />
      <Chair rot={90} x={w/2 + CHAIR_H/2} y={0} />
    </Group>
  );
};

const BuffetTablePreview = ({ props = {} }) => {
  const w = props.w ?? 120;
  const h = props.h ?? 20;
  const count = props.count ?? 6;
  const spacing = props.circleSpacing ?? 20;
  return (
    <Group>
      <Rect x={-w/2} y={-h/2} width={w} height={h} {...shared} cornerRadius={5} />
      {[...Array(count)].map((_, i) => (
        <Circle key={i} x={-w/2 + spacing + i * spacing} y={0} radius={6} {...shared} />
      ))}
    </Group>
  );
};

const PlantPreview = ({ props = {} }) => {
  const r = props.radius ?? 10;
  const petals = props.petals ?? 6;
  return (
    <Group>
      <Circle x={0} y={0} radius={r} {...shared} />
      {[...Array(petals)].map((_, i) => {
        const a = (2 * Math.PI / petals) * i;
        return <Circle key={i} x={Math.cos(a) * (r * 0.6)} y={Math.sin(a) * (r * 0.6)} radius={3} {...shared} />;
      })}
    </Group>
  );
};

const DividerPreview = ({ props = {} }) => {
  const len = props.length ?? 100;
  return <Group><Line points={[-len/2, 0, len/2, 0]} stroke="#000" strokeWidth={2} dash={props.dash ?? [10,5]} /></Group>;
};

const ArchPreview = ({ props = {} }) => {
  const rx = props.rx ?? 50;
  return <Group><Path data={`M${-rx} 0 A${rx} ${rx} 0 0 1 ${rx} 0`} {...shared} /></Group>;
};

const StagePreview = ({ props = {} }) => {
  const w = props.w ?? 80;
  const h = props.h ?? 20;
  return (
    <Group>
      <Rect x={-w/2} y={-h/2} width={w} height={h} {...shared} />
      <Text text={props.label ?? 'STAGE'} x={-20} y={-h/2 + 2} fontSize={10} fill="#000" />
    </Group>
  );
};

const BackdropPreview = ({ props = {} }) => {
  const len = props.length ?? 80;
  return <Group><Line points={[-len/2, 0, len/2, 0]} {...shared} /></Group>;
};

const LightPreview = ({ props = {} }) => <Circle x={0} y={0} radius={props.radius ?? 5} {...shared} />;
const FanPreview = ({ props = {} }) => <Group><Line points={[-10,0,0,-10,10,0,0,10,-10,0]} closed {...shared} /></Group>;

const renderPreviewFromServer = (obj) => {
  const rawType = (obj.object_type || '').toString();
  const type = rawType.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const props = typeof obj.object_props === 'string' ? (() => {
    try { return JSON.parse(obj.object_props); } catch (e) { return {}; }
  })() : (obj.object_props || {});

  switch (type) {
    case 'chair': return <Chair />;
    case 'singleroundtable': return <SingleRoundTablePreview props={props} />;
    case 'roundtable': return <RoundTablePreview count={props.count ?? 6} props={props} />;
    case 'recttable': return <RectTablePreview topBottom={props.topBottom ?? props.topbottom ?? 0} sides={props.sides ?? 0} props={props} />;
    case 'squaretable': return <SquareTablePreview props={props} />;
    case 'ovaltable': return <OvalTablePreview count={props.count ?? 8} props={props} />;
    case 'buffettable': return <BuffetTablePreview props={props} />;
    case 'plant': return <PlantPreview props={props} />;
    case 'divider': return <DividerPreview props={props} />;
    case 'arch': case 'arches': return <ArchPreview props={props} />;
    case 'stageoutline': case 'stage': return <StagePreview props={props} />;
    case 'backdropline': case 'backdrop': return <BackdropPreview props={props} />;
    case 'lightoutline': case 'light': return <LightPreview props={props} />;
    case 'fanoutline': case 'fan': return <FanPreview props={props} />;
    default:
      return (
        <Group>
          <Rect x={-25} y={-15} width={50} height={30} {...shared} />
          <Text text={obj.object_name ?? obj.object_type} x={-20} y={-6} fontSize={8} fill="#000" />
        </Group>
      );
  }
};

const ObjectPalette = ({ onSelect, apiBase = '/objects' }) => {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axiosClient.get(apiBase)
      .then(res => {
        if (!mounted) return;
        setItems(res.data);
      })
      .catch(error => {
        if (!mounted) return;
        setErr(error.response?.data?.message || error.message || 'Failed to fetch objects');
        setItems([]);
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [apiBase]);

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (loading) return <div className="palette-loading">Loading objects…</div>;
  if (err) return <div className="palette-error">Error loading objects: {err}</div>;
  if (!items || items.length === 0) return <div className="palette-empty">No objects found.</div>;

  return (
    <div className="palette-grid">
      {items.map((it) => {
        const key = `obj-${it.object_id ?? it.object_name}`;
        const preview = renderPreviewFromServer(it);
        return (
          <div
            className="palette-cell"
            key={key}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, it)}
            onClick={() => onSelect && onSelect(it)}
            title="Drag to canvas"
          >
            <Stage width={100} height={100}>
              <Layer>
                <AutoScaler canvasWidth={100} canvasHeight={100}>
                  {preview}
                </AutoScaler>
              </Layer>
            </Stage>
            <div className="palette-label">{it.object_name}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ObjectPalette;