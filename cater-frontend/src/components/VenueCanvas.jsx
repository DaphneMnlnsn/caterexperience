import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Stage, Layer, Group, Rect, Circle, Ellipse, Text, Line, Path } from 'react-konva';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import VenueImageLayout from './VenueImageLayout';
import pavilionImg from '../assets/Pavilion.svg';
import airconImg from '../assets/Aircon.svg';
import poolsideImg from '../assets/Poolside.svg';
import OutsideVenueLayout from './OutsideVenueLayout';
import axiosClient from '../axiosClient';
import Swal from 'sweetalert2';

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

function VenueCanvas(props, ref) {
  const { setupId, templateId, isClient, isWaiter, venueRealWidthMeters = null, venueRealAreaMeters = null } = props;
  const stageRef = useRef();
  const trRef = useRef();
  const groupRefs = useRef({});

  const [predefinedLayout, setPredefinedLayout] = useState(null);
  const [layoutType, setLayoutType] = useState(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [templateNotes, setTemplateNotes] = useState(null);

  const predefKey = `predef-layout-${layoutType ?? 'default'}`;

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
  }, [predefKey, layoutType]);

  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.canvas-container');
      if (container) {
        setStageSize({ width: container.offsetWidth, height: container.offsetHeight });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResetLayout = () => {
    setSelectedId(null);
    if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer() && trRef.current.getLayer().batchDraw();
    }
    setPlaced([]);
  };

  const handleSavePredefinedLayout = async () => {
    if (!placed || placed.length === 0) {
      Swal.fire('Nothing to save', 'There are no placed objects to save as a predefined layout.', 'info');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: templateId ? 'Update predefined layout' : 'Save predefined layout',
      html:
        `<input id="swal-layout-name" class="swal2-input" placeholder="Layout name" value="${templateName || ''}">` +
        `<textarea id="swal-layout-notes" class="swal2-textarea" placeholder="Notes (optional)" style="height:80px">${templateNotes || ''}</textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: templateId ? 'Update' : 'Save',
      preConfirm: () => {
        const nameEl = document.getElementById('swal-layout-name');
        const notesEl = document.getElementById('swal-layout-notes');
        const name = nameEl ? nameEl.value.trim() : '';
        const notes = notesEl ? notesEl.value.trim() : '';
        if (!name) {
          Swal.showValidationMessage('Please enter a layout name');
          return false;
        }
        return { name, notes };
      }
    });

    if (!formValues) return;

    const placementsPayload = placed
      .map(p => {
        const objectId = p.object_id ?? (p.object_props && p.object_props.object_id) ?? null;
        if (!objectId) return null;
        const object_props = p.object_props && Object.keys(p.object_props || {}).length ? p.object_props : null;

        return {
          object_id: objectId,
          x_position: Number(p.x_m ?? 0),
          y_position: Number(p.y_m ?? 0),
          rotation: Number(p.rotation ?? 0),
          status: p.status ?? 'active',
          object_props,
        };
      })
      .filter(Boolean);

    if (placementsPayload.length === 0) {
      Swal.fire('Invalid layout', 'No valid objects with `object_id` found to save.', 'warning');
      return;
    }

    const payload = {
      template_name: formValues.name,
      layout_type: layoutType ?? null,
      notes: formValues.notes ?? null,
      placements: placementsPayload
    };

    setSavingTemplate(true);
    try {
      let res;
      if (templateId) {
        res = await axiosClient.put(`/templates/${templateId}`, payload);
      } else {
        res = await axiosClient.post('/templates', payload);
      }

      const localPlacements = JSON.parse(JSON.stringify(placementsPayload));
      setPredefinedLayout(localPlacements);
      try { localStorage.setItem(predefKey, JSON.stringify(localPlacements)); } catch (err) {}

      setSavingTemplate(false);
      Swal.fire('Success', templateId ? 'Template updated successfully.' : 'Template saved successfully.', 'success');

      return res;
    } catch (err) {
      setSavingTemplate(false);
      console.error('Failed to save template', err);
      const serverMsg = err?.response?.data?.error ?? err?.response?.data?.message ?? null;
      Swal.fire('Error', `Failed to save template`, 'error');
      throw err;
    }
  };

  const [deleteHover, setDeleteHover] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [placed, setPlaced] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedObjectFromPalette, setSelectedObjectFromPalette] = useState(null);

  const [editingLabel, setEditingLabel] = useState(null);
  const editingRef = useRef(null);

  const [gridEnabled, setGridEnabled] = useState(true);
  const [gridSizeMeters, setGridSizeMeters] = useState(0.5);

  useEffect(() => {
    if(!templateId)
    {
          if (!setupId) return;

          axiosClient.get(`/setups/setup/${setupId}`)
            .then(res => {
              const data = res.data;
              const layoutTypeFromServer = data.layout_type ?? (data.setup && data.setup.layout_type) ?? data.layoutType;
              setLayoutType(layoutTypeFromServer);

              const placementsRaw = (data.setup && data.setup.placements) ?? data.placements ?? data.setup_placements ?? null;
              if (Array.isArray(placementsRaw)) {
                const mapped = placementsRaw.map(pl => ({
                  id: pl.placement_id ? `p-${pl.placement_id}` : `p-local-${Date.now() + Math.random()}`,
                  placement_id: pl.placement_id ?? null,
                  object_id: pl.object_id ?? (pl.object && pl.object.object_id) ?? (pl.object && pl.object.id) ?? null,
                  object_type: (pl.object && pl.object.object_type) ?? pl.object_type ?? pl.type ?? 'unknown',
                  object_name: (pl.object && pl.object.object_name) ?? pl.object_name ?? null,
                  object_props: pl.object_props ? (typeof pl.object_props === 'string' ? JSON.parse(pl.object_props) : pl.object_props) : (pl.object && pl.object.object_props) ?? {},
                  x_m: (pl.x_position ?? pl.x_m ?? pl.x) * 1,
                  y_m: (pl.y_position ?? pl.y_m ?? pl.y) * 1,
                  rotation: pl.rotation ?? 0,
                  status: pl.status ?? 'active',
                }));
                setPlaced(mapped);
              } else {
                setPlaced([]);
              }
            })
            .catch(err => {
              console.error("Error fetching setup", err);
              setLayoutType('outside');
              setPlaced([]);
            })
    }
    else{
        if (!setupId) return;

        axiosClient.get(`/templates/${templateId}`)
        .then(res => {
          const data = res.data.template;
          setTemplateName(data.template_name);
          setTemplateNotes(data.notes);

          const placementsRaw =
            (data.template && data.template.placements) ??
            data.placements ??
            data.template_placements ??
            null;

          if (!Array.isArray(placementsRaw)) {
            setPlaced([]);
            return;
          }

          const mapped = placementsRaw.map(pl => ({
            id: pl.placement_id
              ? `p-${pl.placement_id}`
              : `p-local-${Date.now() + Math.random()}`,
            placement_id: pl.placement_id ?? null,
            object_id:
              pl.object_id ??
              (pl.object && pl.object.object_id) ??
              (pl.object && pl.object.id) ??
              null,
            object_type:
              (pl.object && pl.object.object_type) ??
              pl.object_type ??
              pl.type ??
              'unknown',
            object_name:
              (pl.object && pl.object.object_name) ??
              pl.object_name ??
              null,
            object_props: pl.object_props
              ? typeof pl.object_props === 'string'
                ? JSON.parse(pl.object_props)
                : pl.object_props
              : (pl.object && pl.object.object_props) ?? {},
            x_m: (pl.x_position ?? pl.x_m ?? pl.x) * 1,
            y_m: (pl.y_position ?? pl.y_m ?? pl.y) * 1,
            rotation: pl.rotation ?? 0,
            status: pl.status ?? 'active',
          }));

          setSelectedId(null);
          if (trRef.current) {
            trRef.current.nodes([]);
            trRef.current.getLayer()?.batchDraw();
          }

          setPlaced(mapped);
        })
        .catch(err => {
          console.error("Error fetching template layout", err);
          setPlaced([]);
        });
  }}, [setupId, templateId]);
  
  const venueConfig = (() => {
    if (layoutType === 'Pavilion') return { originalWidth: 2733, originalHeight: 1556, baseScale: BASE_SCALE };
    if (layoutType === 'Airconditioned Room') return { originalWidth: 1559, originalHeight: 610, baseScale: BASE_SCALE * 2 };
    if (layoutType === 'Poolside') return { originalWidth: 1500, originalHeight: 1200, baseScale: BASE_SCALE * 1.3 };
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
      object_id: obj.object_id ?? obj.objectId ?? obj.objectId_ ?? null,
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

    setPlaced(prev =>
      prev.map(p => {
        if (p.id !== id) return p;

        const type = p.object_type?.toLowerCase?.() ?? '';
        const resizableTypes = ['divider', 'backdrop', 'arch', 'placeholder'];

        if (resizableTypes.includes(type)) {
          const newW_m = p.object_props?.w
            ? (p.object_props.w * scaleX)
            : (node.width() * scaleX / pxPerMeter);
          const newH_m = p.object_props?.h
            ? (p.object_props.h * scaleY)
            : (node.height() * scaleY / pxPerMeter);

          const updatedProps = {
            ...p.object_props,
            w: newW_m,
            h: newH_m,
          };

          return {
            ...p,
            rotation: node.rotation(),
            object_props: updatedProps,
            x_m: newX_m,
            y_m: newY_m,
          };
        }

        return {
          ...p,
          rotation: node.rotation(),
          scale: (p.scale ?? 1) * avgScale,
          x_m: newX_m,
          y_m: newY_m,
        };
      })
    );
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
        const len_px = (getMeterValue(props, 'length', REAL_DEFAULTS.divider_len_m) ?? REAL_DEFAULTS.divider_len_m) * pxPerMeterLocal * scaleForObject;
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
      case 'placeholder': {
        const w_m = getMeterValue(props, 'w', 1.0);
        const h_m = getMeterValue(props, 'h', 1.0);
        const w_px = w_m * pxPerMeterLocal * scaleForObject;
        const h_px = h_m * pxPerMeterLocal * scaleForObject;

        return (
          <Group>
            <Rect
              x={-w_px / 2}
              y={-h_px / 2}
              width={w_px}
              height={h_px}
              stroke="#888"
              dash={[6, 3]}
              strokeWidth={2}
              fill="rgba(200,200,200,0.15)"
              cornerRadius={5}
            />
            <Text
              text={props.label ?? 'TBD'}
              x={-w_px / 2}
              y={h_px / 2 + 6}
              width={w_px}
              align="center"
              fontSize={12}
              fill="#555"
              listening={false}
            />
          </Group>
        );
      }
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

  const handleCanvasClick = (e) => {
    if (!selectedObjectFromPalette) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const newX_m = pxToMeters(pointerPos.x);
    const newY_m = pxToMeters(pointerPos.y);

    setPlaced(prev => [
      ...prev,
      {
        id: Date.now(),
        object_type: selectedObjectFromPalette.object_type,
        object_name: selectedObjectFromPalette.object_name,
        object_props: selectedObjectFromPalette.object_props,
        x_m: newX_m,
        y_m: newY_m,
        rotation: 0,
        scale: 1,
      },
    ]);

    setSelectedObjectFromPalette(null);
  };

  const handleStageDragEnd = (e) => {
    const target = e.target;
    const stageNode = stageRef.current;
    if (!stageNode) return;
    const isStage = target === stageNode || (typeof target.getClassName === 'function' && target.getClassName() === 'Stage');
    if (isStage) {
      setStagePos({ x: stageNode.x(), y: stageNode.y() });
    }
  };

  const handleSave = async () => {
    if (!setupId) {
      window.alert('No setup selected');
      return;
    }

    const payload = {
      placements: placed.map(p => {
        return {
          ...(p.placement_id ? { placement_id: p.placement_id } : {}),
          object_id: p.object_id ?? (p.object_props && p.object_props.object_id) ?? null,
          x_position: typeof p.x_m === 'number' ? p.x_m : parseFloat(p.x_m || 0),
          y_position: typeof p.y_m === 'number' ? p.y_m : parseFloat(p.y_m || 0),
          rotation: p.rotation ?? 0,
          object_props: p.object_props && Object.keys(p.object_props || {}).length ? p.object_props : null,
          status: p.status ?? 'active',
        };
      })
    };

    try {
      const res = await axiosClient.put(`/setups/${setupId}`, payload);

      const updatedSetup = res.data.setup ?? res.data;

      const placementsRaw = (updatedSetup && updatedSetup.placements) ?? res.data.placements ?? null;
      if (Array.isArray(placementsRaw)) {
        const mapped = placementsRaw.map(pl => ({
          id: pl.placement_id ? `p-${pl.placement_id}` : `p-local-${Date.now() + Math.random()}`,
          placement_id: pl.placement_id ?? null,
          object_id: pl.object_id ?? (pl.object && pl.object.object_id) ?? null,
          object_type: (pl.object && pl.object.object_type) ?? pl.object_type ?? 'unknown',
          object_name: (pl.object && pl.object.object_name) ?? pl.object_name ?? null,
          object_props: pl.object_props ? (typeof pl.object_props === 'string' ? JSON.parse(pl.object_props) : pl.object_props) : (pl.object && pl.object.object_props) ?? {},
          x_m: pl.x_position ?? pl.x_m ?? pl.x,
          y_m: pl.y_position ?? pl.y_m ?? pl.y,
          rotation: pl.rotation ?? 0,
          status: pl.status ?? 'active',
        }));
        setPlaced(mapped);
      }

      Swal.fire('Saved!', 'Layout has been saved.', 'success');
      return res;
    } catch (err) {
      console.error('Failed to save layout', err);
      window.alert('Failed to save layout.');
      throw err;
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

  useImperativeHandle(ref, () => ({
    save: handleSave,
    setSelectedObjectFromPalette,
    getPlaced: () => placed,
  }), [handleSave, placed]);

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

  const normalizedType = layoutType?.trim().toLowerCase();

  const downloadDataUrl = (dataUrl, fileName = 'layout.png') => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportFullPNG = async (fileName = 'layout-full.png', pixelRatio = 2) => {
    const stage = stageRef.current;
    if (!stage) return;

    const prevScaleX = stage.scaleX();
    const prevScaleY = stage.scaleY();
    const prevPos = { x: stage.x(), y: stage.y() };

    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();

    const prevGrid = gridEnabled;
    setGridEnabled(false);
    await new Promise(resolve => requestAnimationFrame(resolve));

    const bgLayer = new Konva.Layer({ listening: false, name: '__export_bg_layer' });
    const bgRect = new Konva.Rect({
      x: 0, y: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      fill: '#ffffff',
      listening: false
    });
    bgLayer.add(bgRect);
    stage.add(bgLayer);
    bgLayer.moveToBottom();
    stage.batchDraw();

    try {
      const dataUrl = stage.toDataURL({
        x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
        pixelRatio, mimeType: 'image/png'
      });
      downloadDataUrl(dataUrl, fileName);
      return dataUrl;
    } finally {
      try { bgLayer.destroy(); } catch (e) {}
      setGridEnabled(prevGrid);
      stage.scale({ x: prevScaleX, y: prevScaleY });
      stage.position(prevPos);
      stage.batchDraw();
    }
  };

  const handleApproveSetup = () => {
    Swal.fire({
      title: 'Approve this venue setup?',
      text: 'Once approved, it will be finalized.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosClient.put(`/setups/approve/${setupId}`)
          .then(() => {
            Swal.fire('Approved!', 'The venue setup has been approved.', 'success');
          })
          .catch((err) => {
            console.error(err.response?.data || err.message);
            Swal.fire('Error', 'Could not approve the setup.', 'error');
          });
      }
    });
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, border: '1px solid #ddd', background: '#f7f7f7', position: 'relative' }}
    >
      <div style={{
        position: 'absolute', left: 10, top: 10, zIndex: 1000, background: 'rgba(255,255,255,0.95)',
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
        {(!isWaiter && !isClient) && (
          <>
            <button onClick={handleResetLayout} style={{ background: "#ff4e4eff", color: "#fff", padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)", fontFamily: 'Lora, serif', fontWeight: 800 }}>Reset Layout</button>
            <button
              onClick={handleSavePredefinedLayout}
              style={{
                background: "#f9ebb4ff",
                color: "#000",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                cursor: savingTemplate ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                fontFamily: 'Lora, serif',
                fontWeight: 800,
                opacity: savingTemplate ? 0.7 : 1
              }}
              disabled={savingTemplate}
            >
              {savingTemplate ? 'Saving...' : 'Save as Predefined'}
            </button>
            <button onClick={() => exportFullPNG()} 
            style={{
                background: "#f7ea7a",
                color: "#000",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                cursor: savingTemplate ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                fontFamily: 'Lora, serif',
                fontWeight: 800,
                opacity: savingTemplate ? 0.7 : 1
              }}>
              Export PNG (full)</button>
          </>
        )}
        {isClient && (
          <button onClick={() => handleApproveSetup()} 
          style={{
              background: "#f7ea7a",
              color: "#000",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: savingTemplate ? "not-allowed" : "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              fontFamily: 'Lora, serif',
              fontWeight: 800,
              opacity: savingTemplate ? 0.7 : 1
            }}>
            Approve Setup</button>
        )}
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
        width={stageSize.width}
        height={stageSize.height}
        draggable
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onTouchStart={handleCanvasClick}
        onDragEnd={handleStageDragEnd}
        onWheel={handleWheel}
        ref={stageRef}
      >
        <Layer>
          {renderGrid()}
          {normalizedType === 'pavilion' && (
            <VenueImageLayout imagePath={pavilionImg} originalWidth={2733} originalHeight={1556} baseScale={BASE_SCALE} />
          )}
          {normalizedType === 'airconditioned room' && (
            <VenueImageLayout imagePath={airconImg} originalWidth={1559} originalHeight={610} baseScale={BASE_SCALE * 2} />
          )}
          {normalizedType === 'poolside' && (
            <VenueImageLayout imagePath={poolsideImg} originalWidth={1500} originalHeight={1200} baseScale={BASE_SCALE * 1.3} />
          )}
          {normalizedType === 'custom venue' && (
            <OutsideVenueLayout />
          )}

          {placedSorted.map(p => renderPlaced(p))}

          <Transformer ref={trRef} rotateEnabled={true} enabledAnchors={['top-left','top-right','bottom-left','bottom-right']} anchorSize={8} keepRatio={false} />

          {renderDeleteButton()}
        </Layer>
      </Stage>
    </div>
  );
}

export default forwardRef(VenueCanvas);