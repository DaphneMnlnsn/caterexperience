import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Line, Circle, Rect, Ellipse, Text, Path, Group } from 'react-konva';
import './ObjectPalette.css';

const shared = { stroke: '#000', strokeWidth: 1.5, fill: 'transparent' };
const CHAIR_W = 15, CHAIR_H = 20;

const AutoScaler = ({ children, canvasWidth = 100, canvasHeight = 100 }) => {
  const groupRef = useRef();
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!groupRef.current) return;
      const box = groupRef.current.getClientRect();
      const padding = 10;
      const maxW = canvasWidth - 2 * padding;
      const maxH = canvasHeight - 2 * padding;
      const scaleX = maxW / box.width;
      const scaleY = maxH / box.height;
      const rawScale = Math.min(scaleX, scaleY);
      const clamped = Math.max(0.6, Math.min(rawScale, 1));
      setScale({ x: clamped, y: clamped });
      setOffset({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
    });
    return () => cancelAnimationFrame(id);
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
  const gapTB = w / (topBottom + 1);
  for (let i = 0; i < topBottom; i++) {
    const cx = -w/2 + gapTB * (i+1);
    chairs.push(
      <Chair key={`t${i}`} rot={0} x={cx} y={-h/2 - CHAIR_H/2} />,
      <Chair key={`b${i}`} rot={180} x={cx} y={h/2 + CHAIR_H/2} />
    );
  }
  const gapS = h / (sides + 1);
  for (let i = 0; i < sides; i++) {
    const cy = -h/2 + gapS * (i+1);
    chairs.push(
      <Chair key={`l${i}`} rot={270} x={-w/2 - CHAIR_H/2} y={cy} />,
      <Chair key={`r${i}`} rot={90} x={w/2 + CHAIR_H/2} y={cy} />
    );
  }
  return chairs;
};

const RectTablePreview = ({ topBottom, sides }) => (
  <Group>
    <RectTable w={60} h={30} />
    {ChairsAroundRect({ w:60, h:30, topBottom, sides })}
  </Group>
);

const RoundTablePreview = ({ count }) => (
  <Group>
    <Circle x={0} y={0} radius={30} {...shared} />
    {[...Array(count)].map((_,i)=>{
      const angle = (2*Math.PI/count)*i;
      return <Chair key={i} rot={angle*180/Math.PI + 90}
                    x={Math.cos(angle)*(30+13)}
                    y={Math.sin(angle)*(30+13)} />;
    })}
  </Group>
);

const SingleRoundTablePreview = () => (
  <Group>
    <Circle x={0} y={0} radius={30} {...shared} />
  </Group>
);

const OvalTablePreview = ({ count }) => (
  <Group>
    <Ellipse x={0} y={0} radiusX={40} radiusY={20} {...shared} />
    {[...Array(count)].map((_,i)=>{
      const angle = (2*Math.PI/count)*i;
      return <Chair key={i} rot={angle*180/Math.PI + 90}
                    x={Math.cos(angle)*(40+13)}
                    y={Math.sin(angle)*(20+13)} />;
    })}
  </Group>
);

const SquareTablePreview = () => (
  <Group>
    <RectTable w={40} h={40} />
    <Chair rot={0} x={0} y={-20-CHAIR_H/2} />
    <Chair rot={180} x={0} y={20+CHAIR_H/2} />
    <Chair rot={270} x={-20-CHAIR_H/2} y={0} />
    <Chair rot={90} x={20+CHAIR_H/2} y={0} />
  </Group>
);

const BuffetTablePreview = () => (
  <Group>
    <Rect x={-60} y={-10} width={120} height={20} {...shared} cornerRadius={5} />
    {[...Array(6)].map((_,i)=>(
      <Circle key={i} x={-60 + 20 + i*20} y={0} radius={6} {...shared} />
    ))}
  </Group>
);

const PlantPreview = () => (
  <Group>
    <Circle x={0} y={0} radius={10} {...shared} />
    {[...Array(6)].map((_,i)=>{
      const a=(2*Math.PI/6)*i; return <Circle key={i}
        x={Math.cos(a)*6} y={Math.sin(a)*6} radius={3} {...shared}/>;
    })}
  </Group>
);

const DividerPreview = () => (
  <Group>
    <Line points={[-50,0,50,0]} stroke="#000" strokeWidth={2} dash={[10,5]} />
  </Group>
);

const ArchPreview = () => (
  <Group>
    <Path data="M-50 0 A50 50 0 0 1 50 0" {...shared} />
  </Group>
);

const StagePreview = () => (
  <Group>
    <Rect x={-40} y={-10} width={80} height={20} {...shared} />
    <Text text="STAGE" x={-20} y={-8} fontSize={10} fill="#000" />
  </Group>
);

const BackdropPreview = () => (
  <Group>
    <Line points={[-40,0,40,0]} {...shared} />
  </Group>
);

const LightPreview = () => (
  <Circle x={0} y={0} radius={5} {...shared} />
);

const FanPreview = () => (
  <Group>
    <Line points={[-10,0,0,-10,10,0,0,10,-10,0]} closed {...shared} />
  </Group>
);

const paletteItems = [
  { name:'Chair', comp:<Chair/> },
  { name:'Single Round Table', comp:<SingleRoundTablePreview/> },
  { name:'Round Table (6)', comp:<RoundTablePreview count={6}/> },
  { name:'Round Table (8)', comp:<RoundTablePreview count={8}/> },
  { name:'Square Table', comp:<SquareTablePreview/> },
  { name:'Rect Table', comp:<RectTablePreview topBottom={4} sides={1}/> },
  { name:'Oval Table (8)', comp:<OvalTablePreview count={8}/> },
  { name:'Buffet Table', comp:<BuffetTablePreview/> },
  { name:'Plant', comp:<PlantPreview/> },
  { name:'Divider', comp:<DividerPreview/> },
  { name:'Arch', comp:<ArchPreview/> },
  { name:'Stage', comp:<StagePreview/> },
  { name:'Backdrop', comp:<BackdropPreview/> },
  { name:'Light', comp:<LightPreview/> },
  { name:'Fan', comp:<FanPreview/> },
];

const ObjectPalette = ({ onSelect }) => (
  <div className="palette-grid">
    {paletteItems.map(({name,comp})=>(
      <div key={name} className="palette-cell" onClick={()=>onSelect(name)}>
        <Stage width={100} height={100}>
          <Layer>
            <AutoScaler canvasWidth={100} canvasHeight={100}>{comp}</AutoScaler>
          </Layer>
        </Stage>
        <div className="palette-label">{name}</div>
      </div>
    ))}
  </div>
);

export default ObjectPalette;
