import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Group, Rect, Circle, Ellipse, Text, Line, Path } from 'react-konva';
import { Transformer } from 'react-konva';
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

const REAL_DEFAULTS = {
  stage_w_m: 7.28,
  stage_h_m: 2.40,
  buffet_w_m: 4.28,
  divider_len_m: 1.225,
  arch_span_m: 2.49,
  backdrop_len_m: 4.60,
  light_scale: 1.5,
  plant_radius_m: 0.35,
};

const parseProps = (p) => {
  if (!p) return {};
  if (typeof p === 'string') {
    try { return JSON.parse(p); } catch { return {}; }
  }
  return { ...p };
};

const getMeterValue = (props, name, fallback = undefined) => {
  if (!props) return fallback;
  if (props[`${name}_m`] !== undefined) return props[`${name}_m`];
  if (props[name] !== undefined) return props[name];
  const lower = name.toLowerCase();
  if (props[lower] !== undefined) return props[lower];
  return fallback;
};

const getAnyProp = (props, name, fallback = undefined) => {
  if (!props) return fallback;
  if (props[name] !== undefined) return props[name];
  const lower = name.toLowerCase();
  if (props[lower] !== undefined) return props[lower];
  const camel = name.charAt(0).toLowerCase() + name.slice(1);
  if (props[camel] !== undefined) return props[camel];
  return fallback;
};

function VenueCanvas({ venue, venueRealWidthMeters = null, venueRealAreaMeters = null }) {
  const stageRef = useRef();
  const trRef = useRef();
  const groupRefs = useRef({});

  const [predefinedLayout, setPredefinedLayout] = useState(null);

  const predefKey = `predef-layout-${venue ?? 'default'}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(predefKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setPredefinedLayout(parsed);
      } else {
        setPredefinedLayout(null);
      }
    } catch (err) {
      console.warn('Failed to read predefined layout from localStorage', err);
      setPredefinedLayout(null);
    }
  }, [predefKey, venue]);

  const handleResetLayout = () => {
    setSelectedId(null);
    if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer() && trRef.current.getLayer().batchDraw();
    }

    setPlaced([]);
  };

  const handleSavePredefinedLayout = () => {
    const payload = JSON.parse(JSON.stringify(placed || []));
    setPredefinedLayout(payload);
    try {
      localStorage.setItem(predefKey, JSON.stringify(payload));
      window.alert('Layout saved as predefined for this venue.');
    } catch (err) {
      console.error('Failed to save predefined layout', err);
      window.alert('Failed to save layout locally.');
    }
  };

  const handleLoadPredefinedLayout = () => {
    if (!predefinedLayout || !Array.isArray(predefinedLayout)) {
      window.alert('No predefined layout saved for this venue.');
      return;
    }

    setSelectedId(null);
    if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer() && trRef.current.getLayer().batchDraw();
    }

    setPlaced(JSON.parse(JSON.stringify(predefinedLayout)));
  };

  const [deleteHover, setDeleteHover] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [placed, setPlaced] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [editingLabel, setEditingLabel] = useState(null);
  const editingRef = useRef(null);

  const [gridEnabled, setGridEnabled] = useState(true);
  const [gridSizeMeters, setGridSizeMeters] = useState(0.5);

  const venueConfig = (() => {
    if (venue === 'pavilion') return { originalWidth: 2733, originalHeight: 1556, baseScale: BASE_SCALE };
    if (venue === 'aircon-room') return { originalWidth: 1559, originalHeight: 610, baseScale: BASE_SCALE * 2 };
    if (venue === 'poolside') return { originalWidth: 1500, originalHeight: 1200, baseScale: BASE_SCALE * 1.3 };
    return { originalWidth: 1000, originalHeight: 800, baseScale: BASE_SCALE };
  })();

  const displayedImagePxWidth = venueConfig.originalWidth * venueConfig.baseScale;
  const displayedImagePxHeight = venueConfig.originalHeight * venueConfig.baseScale;

  const computePxPerMeter = () => {
    if (venueRealWidthMeters && venueRealWidthMeters > 0) return displayedImagePxWidth / venueRealWidthMeters;
    if (venueRealAreaMeters && venueRealAreaMeters > 0) {
      const pixelArea = displayedImagePxWidth * displayedImagePxHeight;
      return Math.sqrt(pixelArea / venueRealAreaMeters);
    }
    return 20;
  };

  const pxPerMeter = computePxPerMeter();

  const snapMeters = (m) => {
    if (!gridEnabled || !gridSizeMeters || gridSizeMeters <= 0) return m;
    return Math.round(m / gridSizeMeters) * gridSizeMeters;
  };

  const metersToPx = (m) => m*pxPerMeter;
  const pxToMeters = (px) => px / pxPerMeter;

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const scaleBy = 1.05;
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - stagePos.x) / oldScale, y: (pointer.y - stagePos.y) / oldScale };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStageScale(newScale);
    const newPos = { x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale };
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

    const xOnStage = (clientX - rect.left - (stage.x() || 0)) / (stage.scaleX() || 1);
    const yOnStage = (clientY - rect.top - (stage.y() || 0)) / (stage.scaleY() || 1);

    const x_m_raw = xOnStage / pxPerMeter;
    const y_m_raw = yOnStage / pxPerMeter;

    const x_m = gridEnabled ? snapMeters(x_m_raw) : x_m_raw;
    const y_m = gridEnabled ? snapMeters(y_m_raw) : y_m_raw;

    const parsedProps = parseProps(obj.object_props);

    const placedObj = {
      id: `p-${Date.now()}`,
      object_type: obj.object_type,
      object_props: parsedProps,
      object_name: obj.object_name,
      x_m, y_m,
      rotation: obj.default_rotation ?? 0,
      scale: obj.default_scale ?? 1,
      z_index: obj.z_index ?? 1,
    };

    setPlaced(prev => [...prev, placedObj]);
    setSelectedId(placedObj.id);

    setTimeout(() => {
      const node = groupRefs.current[placedObj.id];
      if (node && trRef.current) {
        trRef.current.nodes([node]);
        trRef.current.getLayer() && trRef.current.getLayer().batchDraw();
      }
    }, 50);
  };


  const handleDragOver = (e) => e.preventDefault();

  const handlePlacedDragEnd = (id, e) => {
    const node = e.target;
    const abs = node.getAbsolutePosition();
    const stage = stageRef.current;
    const stageScaleNow = stage ? stage.scaleX() : 1;
    const stageX = stage ? (stage.x() || 0) : 0;
    const stageY = stage ? (stage.y() || 0) : 0;

    const x_stage_px = (abs.x - stageX) / stageScaleNow;
    const y_stage_px = (abs.y - stageY) / stageScaleNow;

    const newX_m_raw = pxToMeters(x_stage_px);
    const newY_m_raw = pxToMeters(y_stage_px);

    const newX_m = gridEnabled ? snapMeters(newX_m_raw) : newX_m_raw;
    const newY_m = gridEnabled ? snapMeters(newY_m_raw) : newY_m_raw;

    if (gridEnabled) {
      const snappedX_px = metersToPx(newX_m);
      const snappedY_px = metersToPx(newY_m);

      node.position({ x: snappedX_px, y: snappedY_px });
      node.getLayer() && node.getLayer().batchDraw();
    }

    setPlaced(prev => prev.map(p => p.id === id ? { ...p, x_m: newX_m, y_m: newY_m } : p));
  };


  const handleTransformEnd = (id, e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const avgScale = (scaleX + scaleY) / 2;
    node.scaleX(1);
    node.scaleY(1);

    const abs = node.getAbsolutePosition();
    const stage = stageRef.current;
    const stageScaleNow = stage ? stage.scaleX() : 1;
    const stageX = stage ? (stage.x() || 0) : 0;
    const stageY = stage ? (stage.y() || 0) : 0;
    
    const x_stage_px = (abs.x - stageX) / stageScaleNow;
    const y_stage_px = (abs.y - stageY) / stageScaleNow;
    
    const newX_m_raw = pxToMeters(x_stage_px);
    const newY_m_raw = pxToMeters(y_stage_px);

    const newX_m = gridEnabled ? snapMeters(newX_m_raw) : newX_m_raw;
    const newY_m = gridEnabled ? snapMeters(newY_m_raw) : newY_m_raw;

    if (gridEnabled) {
      const snappedX_px = metersToPx(newX_m);
      const snappedY_px = metersToPx(newY_m);

      node.position({ x: snappedX_px, y: snappedY_px });
      node.getLayer() && node.getLayer().batchDraw();
    }

    setPlaced(prev => prev.map(p => p.id === id ? {
      ...p,
      rotation: node.rotation(),
      scale: (p.scale ?? 1) * avgScale,
      x_m: newX_m,
      y_m: newY_m,
    } : p));
  };


  useEffect(() => {
    if (!trRef.current) return;
    if (!selectedId) {
      trRef.current.nodes([]);
      trRef.current.getLayer() && trRef.current.getLayer().batchDraw();
      return;
    }
    const node = groupRefs.current[selectedId];
    if (node) {
      trRef.current.nodes([node]);
      trRef.current.getLayer() && trRef.current.getLayer().batchDraw();
    }
  }, [selectedId, placed]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'Delete') && selectedId) {
        setPlaced(prev => prev.filter(p => p.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const renderPreviewByType = (typeRaw = '', propsRaw = {}, pxPerMeterLocal = pxPerMeter, scaleForObject = 1) => {
    const type = (typeRaw || '').toString().replace(/[^a-z0-9]/gi, '').toLowerCase();
    const props = parseProps(propsRaw);

    const chairWpx = (getMeterValue(props, 'chair_w', CHAIR_W_DEFAULT_M) ?? CHAIR_W_DEFAULT_M) * pxPerMeterLocal * scaleForObject;
    const chairHpx = (getMeterValue(props, 'chair_h', CHAIR_H_DEFAULT_M) ?? CHAIR_H_DEFAULT_M) * pxPerMeterLocal * scaleForObject;

    const labelText = (props.label !== undefined && props.label !== null && props.label !== '') ? props.label : null;
    const fontSize = Math.max(8, 11 * scaleForObject);

    switch (type) {
      case 'chair': {
        return (
          <Group>
            <Rect x={0} y={0} width={chairWpx} height={chairHpx} offset={{ x: chairWpx/2, y: chairHpx/2 }} {...shared} />
            {labelText && <Text text={labelText} x={-30} y={chairHpx/2 + 6} width={60} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}
          </Group>
        );
      }
      case 'singleroundtable': {
        const r_px = (getMeterValue(props, 'radius', 0.75) || 0.75) * pxPerMeterLocal * scaleForObject;
        return (
          <Group>
            <Circle x={0} y={0} radius={r_px} {...shared} />
            {labelText && <Text text={labelText} x={-r_px} y={r_px + 8} width={r_px*2} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}
          </Group>
        );
      }
      case 'roundtable': {
        const r_px = (getMeterValue(props, 'radius', 0.75) || 0.75) * pxPerMeterLocal * scaleForObject;
        const count = props.count ?? 6;
        const chairDistance = r_px + Math.max(chairHpx, chairWpx) / 2 + 5;
        return (
          <Group>
            <Circle x={0} y={0} radius={r_px} {...shared} />
            {[...Array(count)].map((_, i) => {
              const a = (2 * Math.PI / count) * i;
              const cx = Math.cos(a) * chairDistance;
              const cy = Math.sin(a) * chairDistance;
              const rot = (a * 180) / Math.PI + 90;
              return <Rect key={i} x={cx} y={cy} width={chairWpx} height={chairHpx} offset={{ x: chairWpx/2, y: chairHpx/2 }} rotation={rot} cornerRadius={3} {...shared} />;
            })}
            {labelText && <Text text={labelText} x={-r_px} y={r_px + 8} width={r_px * 2} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}
          </Group>
        );
      }
      case 'recttable': {
        const w_px = (getMeterValue(props, 'w', 1.5) ?? 1.5) * pxPerMeterLocal * scaleForObject;
        const h_px = (getMeterValue(props, 'h', 0.75) ?? 0.75) * pxPerMeterLocal * scaleForObject;
        const topBottom = getAnyProp(props, 'topBottom', props.topbottom ?? 0) ?? 0;
        const sides = getAnyProp(props, 'sides', 0) ?? 0;
        const chairs = [];
        if (topBottom > 0) {
          const gapTB = w_px / (topBottom + 1);
          for (let i = 0; i < topBottom; i++) {
            const cx = -w_px / 2 + gapTB * (i + 1);
            chairs.push(
              <Rect key={`t${i}`} x={cx} y={-h_px/2 - chairHpx/2} width={chairWpx} height={chairHpx} offset={{ x: chairWpx/2, y: chairHpx/2 }} {...shared} cornerRadius={3} />,
              <Rect key={`b${i}`} x={cx} y={h_px/2 + chairHpx/2} width={chairWpx} height={chairHpx} offset={{ x: chairWpx/2, y: chairHpx/2 }} rotation={180} {...shared} cornerRadius={3} />
            );
          }
        }
        if (sides > 0) {
          const gapS = h_px / (sides + 1);
          for (let i = 0; i < sides; i++) {
            const cy = -h_px/2 + gapS * (i+1);
            chairs.push(
              <Rect key={`l${i}`} x={-w_px/2 - chairWpx/2} y={cy} width={chairHpx} height={chairWpx} offset={{ x: chairHpx/2, y: chairWpx/2 }} rotation={270} {...shared} cornerRadius={3} />,
              <Rect key={`r${i}`} x={w_px/2 + chairWpx/2} y={cy} width={chairHpx} height={chairWpx} offset={{ x: chairHpx/2, y: chairWpx/2 }} rotation={90} {...shared} cornerRadius={3} />
            );
          }
        }
        return (
          <Group>
            <Rect x={-w_px/2} y={-h_px/2} width={w_px} height={h_px} {...shared} />
            {chairs}
            {labelText && <Text text={labelText} x={-w_px/2} y={h_px/2 + 8} width={w_px} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}
          </Group>
        );
      }
      case 'squaretable': {
        const w_px = (getMeterValue(props, 'w', 1.2) ?? 1.2) * pxPerMeterLocal * scaleForObject;
        const half = w_px / 2;
        return (
          <Group>
            <Rect x={-half} y={-half} width={w_px} height={w_px} {...shared} />
            <Rect x={0} y={-half - chairHpx / 2} width={chairWpx} height={chairHpx} offset={{ x: chairWpx / 2, y: chairHpx / 2 }} {...shared} cornerRadius={3} />
            <Rect x={0} y={half + chairHpx / 2} width={chairWpx} height={chairHpx} offset={{ x: chairWpx / 2, y: chairHpx / 2 }} rotation={180} {...shared} cornerRadius={3} />
            <Rect x={-half - chairWpx / 2} y={0} width={chairHpx} height={chairWpx} offset={{ x: chairHpx / 2, y: chairWpx / 2 }} rotation={270} {...shared} cornerRadius={3} />
            <Rect x={half + chairWpx / 2} y={0} width={chairHpx} height={chairWpx} offset={{ x: chairHpx / 2, y: chairWpx / 2 }} rotation={90} {...shared} cornerRadius={3} />
            {labelText && <Text text={labelText} x={-half} y={half + 8} width={w_px} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}
          </Group>
        );
      }
      case 'ovaltable': {
        const rx_px = (getMeterValue(props, 'rx', 1.0) ?? 1.0) * pxPerMeterLocal * scaleForObject;
        const ry_px = (getMeterValue(props, 'ry', 0.5) ?? 0.5) * pxPerMeterLocal * scaleForObject;
        const count = props.count ?? 8;
        const chairDistanceX = rx_px + Math.max(chairWpx, chairHpx) / 2 + 5;
        const chairDistanceY = ry_px + Math.max(chairWpx, chairHpx) / 2 + 5;
        return (
          <Group>
            <Ellipse x={0} y={0} radiusX={rx_px} radiusY={ry_px} {...shared} />
            {[...Array(count)].map((_, i) => {
              const a = (2 * Math.PI / count) * i;
              const cx = Math.cos(a) * chairDistanceX;
              const cy = Math.sin(a) * chairDistanceY;
              const rot = (a * 180) / Math.PI + 90;
              return <Rect key={i} x={cx} y={cy} width={chairWpx} height={chairHpx} offset={{ x: chairWpx/2, y: chairHpx/2 }} rotation={rot} cornerRadius={3} {...shared} />;
            })}
            {labelText && <Text text={labelText} x={-rx_px} y={ry_px + 8} width={rx_px * 2} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}
          </Group>
        );
      }
      case 'buffettable': {
        const w_px = (getMeterValue(props, 'w', REAL_DEFAULTS.buffet_w_m) ?? REAL_DEFAULTS.buffet_w_m) * pxPerMeterLocal * scaleForObject;
        const h_px = (getMeterValue(props, 'h', 0.5) ?? 0.5) * pxPerMeterLocal * scaleForObject;
        const count = props.count ?? 6;
        const spacing = w_px / (count + 1);
        return (
          <Group>
            <Rect x={-w_px/2} y={-h_px/2} width={w_px} height={h_px} {...shared} cornerRadius={5} />
            {[...Array(count)].map((_,i)=>(<Circle key={i} x={-w_px/2 + spacing*(i+1)} y={0} radius={Math.max(3, spacing*0.12)} {...shared} />))}
            {labelText && <Text text={labelText} x={-w_px/2} y={h_px/2 + 8} width={w_px} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}
          </Group>
        );
      }
      case 'plant': {
        const r_px = (getMeterValue(props, 'radius', REAL_DEFAULTS.plant_radius_m) ?? REAL_DEFAULTS.plant_radius_m) * pxPerMeterLocal * scaleForObject;
        const petals = props.petals ?? 6;
        return (
          <Group>
            <Circle x={0} y={0} radius={r_px} {...shared}/>
            {[...Array(petals)].map((_,i)=>{const a=(2*Math.PI/petals)*i; return <Circle key={i} x={Math.cos(a)*(r_px*0.6)} y={Math.sin(a)*(r_px*0.6)} radius={Math.max(2, r_px*0.15)} {...shared}/>;})}
            {labelText && <Text text={labelText} x={-r_px} y={r_px + 8} width={r_px*2} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}
          </Group>
        );
      }
      case 'divider': {
        const len_px = (getMeterValue(props, 'length', REAL_DEFAULTS.divider_len_m) ?? REAL_DEFAULTS.divider_len_m) * pxPerMeterLocal;
        return (
          <Group>
            <Line points={[-len_px/2,0,len_px/2,0]} stroke="#000" strokeWidth={2} dash={props.dash ?? [10,5]} />
            {labelText && <Text text={labelText} x={-len_px} y={len_px - 30} width={len_px*2} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}  
          </Group>
        );
      }
      case 'arch':
      case 'arches': {
        const rx_val = (getMeterValue(props, 'rx', (REAL_DEFAULTS.arch_span_m/2)) ?? (REAL_DEFAULTS.arch_span_m/2)) * pxPerMeterLocal;
        const ry_val = (getMeterValue(props, 'ry', (REAL_DEFAULTS.arch_span_m/2)) ?? (REAL_DEFAULTS.arch_span_m/2)) * pxPerMeterLocal;
        return (
          <Group>
            <Path data={`M${-rx_val} 0 A${rx_val} ${ry_val} 0 0 1 ${rx_val} 0`} {...shared} />
            {labelText && <Text text={labelText} x={-rx_val} y={ry_val - 30} width={rx_val * 2} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}  
          </Group>
        );
      }
      case 'stage':
      case 'stageoutline': {
        const w_px = (getMeterValue(props, 'w', REAL_DEFAULTS.stage_w_m) ?? REAL_DEFAULTS.stage_w_m) * pxPerMeterLocal * scaleForObject;
        const h_px = (getMeterValue(props, 'h', REAL_DEFAULTS.stage_h_m) ?? REAL_DEFAULTS.stage_h_m) * pxPerMeterLocal * scaleForObject;
        return (
          <Group>
            <Rect x={-w_px/2} y={-h_px/2} width={w_px} height={h_px} {...shared}/>
            <Text text={props.label ?? 'STAGE'} x={-Math.min(20, w_px/2 - 10)} y={-h_px/2 + 2} fontSize={Math.max(8, h_px*0.2)} fill="#000" listening={false} />
          </Group>
        );
      }
      case 'backdrop':
      case 'backdropline': {
        const len_px = (getMeterValue(props, 'length', REAL_DEFAULTS.backdrop_len_m) ?? REAL_DEFAULTS.backdrop_len_m) * pxPerMeterLocal;
        return (
          <Group>
            <Line points={[-len_px/2,0,len_px/2,0]} {...shared} />
            {labelText && <Text text={labelText} x={-len_px} y={len_px - 130} width={len_px * 2} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}  
          </Group>
        );
      }
      case 'light':
      case 'lightoutline': {
        const r_m = (getMeterValue(props, 'radius', 0.05) ?? 0.05) * REAL_DEFAULTS.light_scale;
        const r_px = r_m * pxPerMeterLocal;
        return (
          <Group>
            <Circle x={0} y={0} radius={r_px} {...shared} />
            {labelText && <Text text={labelText} x={-r_px -7} y={r_px + 3} width={r_px * 5} align="center" fontSize={fontSize} fontFamily="Lora" listening={false} />}  
          </Group>
        );
      }
      case 'fan':
      case 'fanoutline':
        return(
          <Group>
            <Line points={[-10,0,0,-10,10,0,0,10,-10,0]} closed {...shared} />
            {labelText && <Text text={labelText} x={-25} y={15} width={50} align="center" fontSize={10} fontFamily="Lora" listening={false} />}  
          </Group>
        );
      default:
        return (
          <Group>
            <Rect x={-25} y={-15} width={50} height={30} {...shared} />
            <Text text={props.label ?? typeRaw} x={-25} y={-6} width={50} align="center" fontSize={8} fill="#000" listening={false} />
          </Group>
        );
    }
  };

  const renderGrid = () => {
    if(!gridEnabled) return null;
    const gridMeters = gridSizeMeters > 0 ? gridSizeMeters : 0.5;
    const gridPx = gridMeters * pxPerMeter;
    if (gridPx <= 2) {
      const dots = [];
      const step = Math.max(2, Math.round(gridPx));

      const wCount = Math.ceil(CANVAS_WIDTH / step) + 4;
      const hCount = Math.ceil(CANVAS_HEIGHT / step) + 4;
      for (let i = -2; i <= wCount; i++) {
        for(let j = -2; j <= hCount; j++) {
          const x = i * step;
          const y = j * step;
          dots.push(<Rect key={`dot-${i}-${j}`} x={x} y={y} width={1} height={1} fill="#ddd" listening={false} />);
        }
      }
      return <Group>{dots}</Group>
    } else {
      const lines = [];
      const big = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) * 10;
      const vCount = Math.ceil(CANVAS_WIDTH / gridPx) + 4;
      for (let i = -2; i <= vCount; i++) {
        const x = i * gridPx;
        lines.push(<Line key={`v-${i}`} points={[x, -big, x, big]} stroke="#e9e9e9" strokeWidth={1} listening={false} />);
      }
      const hCount = Math.ceil(CANVAS_HEIGHT / gridPx) + 4;
      for (let j = -2; j <= hCount; j++) {
        const y = j * gridPx;
        lines.push(<Line key={`h-${j}`} points={[-big, y, big, y]} stroke="#e9e9e9" strokeWidth={1} listening={false} />);
      }
      lines.push(<Line key="axis-x" points={[0, 0, CANVAS_WIDTH, 0]} stroke="#f0f0f0" strokeWidth={1} listening={false} />);
      lines.push(<Line key="axis-y" points={[0, 0, 0, CANVAS_HEIGHT]} stroke="#f0f0f0" strokeWidth={1} listening={false} />);
      return <Group>{lines}</Group>;
    }
  }

  const handleStageDragEnd = (e) => {
    const target = e.target;
    const stageNode = stageRef.current;
    if (!stageNode) return;
    const isStage = target === stageNode || (typeof target.getClassName === 'function' && target.getClassName() === 'Stage');
    if (isStage) {
      setStagePos({ x: stageNode.x(), y: stageNode.y() });
    }
  };

  const openLabelEditor = (id) => {
    if (editingLabel && editingLabel.id === id) return;
    const node = groupRefs.current[id];
    const stage = stageRef.current;
    if (!node || !stage) return;

    try {
      const box = node.getClientRect({ relativeTo: stage });
      const padding = 6;
      let bx = box.x + box.width + padding + 6;
      let by = box.y - 10;
      const inputW = 200, inputH = 28;
      const clampX = Math.min(Math.max(10, bx), CANVAS_WIDTH - inputW - 10);
      const clampY = Math.min(Math.max(10, by), CANVAS_HEIGHT - inputH - 10);

      const currentLabel = ( ( (node.attrs && node.attrs.object_props) ? node.attrs.object_props.label : null) )
        || (() => {
          const p = placed.find(pp => pp.id === id);
          const currentLabel = p ? (p.object_props && p.object_props.label) ?? '' : '';
        })() || '';

      setEditingLabel({ id, text: currentLabel, left: clampX, top: clampY });

      setTimeout(() => {
        if (editingRef.current) editingRef.current.focus();
        if (editingRef.current) editingRef.current.select();
      }, 30);
    } catch (err) {
    }
  };

  const saveEditingLabel = () => {
    if (!editingLabel) return;
    const { id, text } = editingLabel;
    setPlaced(prev => prev.map(p => p.id === id ? { ...p, object_props: { ...(p.object_props || {}), label: text === '' ? undefined : text } } : p));
    setEditingLabel(null);
  };

  const cancelEditingLabel = () => {
    setEditingLabel(null);
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
        onClick={(e) => { e.cancelBubble = true; setSelectedId(p.id); }}
        onTap={(e) => { e.cancelBubble = true; setSelectedId(p.id); }}
        onDblClick={(e) => { e.cancelBubble = true; openLabelEditor(p.id); }}
        onDblTap={(e) => { e.cancelBubble = true; openLabelEditor(p.id); }}
        onDragEnd={(e) => handlePlacedDragEnd(p.id, e)}
        onTransformEnd={(e) => handleTransformEnd(p.id, e)}
        ref={(node) => { if (node) groupRefs.current[p.id] = node; else delete groupRefs.current[p.id]; }}
      >
        {renderPreviewByType(p.object_type, p.object_props || {}, pxPerMeter, scaleForObject)}
      </Group>
    );
  };

  const placedSorted = [...placed].sort((a, b) => (a.z_index ?? 0) - (b.z_index ?? 0));

  const renderDeleteButton = () => {
    if (!selectedId) return null;
    const node = groupRefs.current[selectedId];
    const stage = stageRef.current;
    if (!node || !trRef.current || !stage) return null;
    try {
      const box = node.getClientRect({ relativeTo: stage });
      const padding = 6;
      let bx = box.x + box.width + padding + 6;
      let by = box.y - 10;
      const btnSize = 20;
      const btnW = btnSize, btnH = btnSize;
      const clampX = Math.min(Math.max(10, bx), CANVAS_WIDTH - btnW - 10);
      const clampY = Math.min(Math.max(10, by), CANVAS_HEIGHT - btnH - 10);

      const onEnter = () => {
        setDeleteHover(true);
        const c = stageRef.current && stageRef.current.container();
        if (c) c.style.cursor = 'pointer';
      };
      const onLeave = () => {
        setDeleteHover(false);
        const c = stageRef.current && stageRef.current.container();
        if (c) c.style.cursor = 'default';
      };

      return (
        <Group
          x={clampX}
          y={clampY}
          onClick={() => { setPlaced(prev => prev.filter(p => p.id !== selectedId)); setSelectedId(null); }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <Circle
            x={btnSize / 2}
            y={btnSize / 2}
            radius={btnSize / 2}
            fill="#ff4d4f"
            stroke="#c0392b"
            strokeWidth={1}
            shadowBlur={6}
            scaleX={deleteHover ? 1.06 : 1}
            scaleY={deleteHover ? 1.06 : 1}
          />
          <Text
            x={btnSize / 2 - 5}
            y={btnSize / 2 - 6}
            text={"✕"}
            fontSize={12}
            fill="#fff"
            listening={false}
          />
        </Group>
      );
    } catch (err) {
      return null;
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, border: '1px solid #ddd', background: '#f7f7f7', position: 'relative' }}
    >
      <div style={{
        position: 'absolute', left: 10, top: 10, zIndex: 9999, background: 'rgba(255,255,255,0.95)',
        padding: 8, borderRadius: 6, boxShadow: '0 6px 12px rgba(0,0,0,0.08)', fontSize: 13
      }}>
        <label style={{display: 'flex', alignItems:'center', gap:8}}>
          <input type="checkbox" checked={gridEnabled} onChange={(e)=>setGridEnabled(e.target.checked)} />
          <span style={{fontSize:12}}>Grid</span>
        </label>
        <div style={{marginTop: 6, display: 'flex', gap: 6, alignItems: 'center'}}>
          <input type="number" step="0.1" min="0.1" value={gridSizeMeters} onChange={(e)=>setGridSizeMeters(parseFloat(e.target.value)||0.1)} style={{width: 70, padding: 4}} />
          <span style={{fontSize: 12}}>m</span>
        </div>

      </div>

      <div style={{ position: "absolute", top: 100, left: 10, display: "flex", flexDirection: "column", gap: "10px", zIndex: 1000 }}>
        <button onClick={handleResetLayout} style={{ background: "#ff4e4eff", color: "#fff", padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)", fontFamily: 'Lora, serif', fontWeight: 800 }}>Reset Layout</button>

        <button onClick={handleSavePredefinedLayout} style={{ background: "#ffe066", color: "#000", padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)", fontFamily: 'Lora, serif', fontWeight: 800 }}>Save as Predefined</button>
      </div>

      {editingLabel && (
        <input
          ref={editingRef}
          value={editingLabel.text}
          onChange={(e) => setEditingLabel({ ...editingLabel, text: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { saveEditingLabel(); }
            if (e.key === 'Escape') { cancelEditingLabel(); }
          }}
          onBlur={() => saveEditingLabel()}
          style={{
            position: 'absolute',
            left: editingLabel.left,
            top: editingLabel.top,
            width: 200,
            height: 28,
            padding: '4px 8px',
            zIndex: 9999,
            borderRadius: 6,
            border: '1px solid #ccc',
            boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
            fontSize: 12,
          }}
        />
      )}

      <Stage
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        draggable
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onDragEnd={handleStageDragEnd}
        onWheel={handleWheel}
        ref={stageRef}
      >
        <Layer>
          {renderGrid()}
          {venue === 'pavilion' && <VenueImageLayout imagePath={pavilionImg} originalWidth={2733} originalHeight={1556} baseScale={BASE_SCALE} />}
          {venue === 'aircon-room' && <VenueImageLayout imagePath={airconImg} originalWidth={1559} originalHeight={610} baseScale={BASE_SCALE * 2} />}
          {venue === 'poolside' && <VenueImageLayout imagePath={poolsideImg} originalWidth={1500} originalHeight={1200} baseScale={BASE_SCALE * 1.3} />}
          {venue === 'outside' && <OutsideVenueLayout />}

          {placedSorted.map(p => renderPlaced(p))}

          <Transformer ref={trRef} rotateEnabled={true} enabledAnchors={['top-left','top-right','bottom-left','bottom-right']} anchorSize={8} keepRatio={false} />

          {renderDeleteButton()}
        </Layer>
      </Stage>
    </div>
  );
}

export default VenueCanvas;
