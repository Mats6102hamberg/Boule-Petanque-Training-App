import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Path, Circle, Group, useValue, runTiming } from '@shopify/react-native-skia';
import { colors } from '../../styles/colors';

/**
 * Virtual Trajectory Overlay
 * 
 * AR Enhancement: Visar virtuell bana för idealt kast
 * Overlay på kamerabild för att hjälpa användaren sikta
 */
const VirtualTrajectory = ({ 
  startPoint, 
  targetPoint, 
  throwType = 'pointing',
  showIdealPath = true,
  showPreviousBest = false,
  previousBestPath = null,
}) => {
  const [trajectoryPath, setTrajectoryPath] = useState('');
  const [animationProgress, setAnimationProgress] = useState(0);
  const opacity = useValue(0);

  useEffect(() => {
    if (showIdealPath) {
      calculateTrajectory();
      animateTrajectory();
    }
  }, [startPoint, targetPoint, throwType, showIdealPath]);

  const calculateTrajectory = () => {
    if (!startPoint || !targetPoint) return;

    // Beräkna parabolbana baserat på kasttyp
    const points = [];
    const steps = 50;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = calculatePointOnTrajectory(t, startPoint, targetPoint, throwType);
      points.push(point);
    }

    // Skapa SVG path
    const pathData = points.map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    }).join(' ');

    setTrajectoryPath(pathData);
  };

  const calculatePointOnTrajectory = (t, start, target, type) => {
    // Interpolera mellan start och mål
    const x = start.x + (target.x - start.x) * t;
    
    // Beräkna y baserat på kasttyp
    let y;
    switch (type) {
      case 'pointing':
        // Låg parabel för pointing
        y = start.y + (target.y - start.y) * t - Math.sin(t * Math.PI) * 50;
        break;
      case 'shooting':
        // Högre parabel för shooting
        y = start.y + (target.y - start.y) * t - Math.sin(t * Math.PI) * 100;
        break;
      case 'rolling':
        // Nästan rak linje för rolling
        y = start.y + (target.y - start.y) * t - Math.sin(t * Math.PI) * 20;
        break;
      default:
        y = start.y + (target.y - start.y) * t;
    }

    return { x, y };
  };

  const animateTrajectory = () => {
    runTiming(opacity, 1, {
      duration: 500,
    });
  };

  if (!showIdealPath || !startPoint || !targetPoint) {
    return null;
  }

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group opacity={opacity}>
        {/* Ideal trajectory path */}
        <Path
          path={trajectoryPath}
          color={colors.primary}
          style="stroke"
          strokeWidth={3}
          strokeCap="round"
          strokeJoin="round"
        >
          {/* Dashed line effect */}
          <DashPathEffect intervals={[10, 10]} />
        </Path>

        {/* Start point */}
        <Circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={8}
          color={colors.primary}
        />

        {/* Target point (cochonnet) */}
        <Circle
          cx={targetPoint.x}
          cy={targetPoint.y}
          r={12}
          color="#FF6B6B"
          opacity={0.7}
        />

        {/* Target area circle */}
        <Circle
          cx={targetPoint.x}
          cy={targetPoint.y}
          r={30}
          color={colors.success}
          style="stroke"
          strokeWidth={2}
          opacity={0.5}
        />

        {/* Previous best path (if available) */}
        {showPreviousBest && previousBestPath && (
          <Path
            path={previousBestPath}
            color="#FFD700"
            style="stroke"
            strokeWidth={2}
            strokeCap="round"
            opacity={0.5}
          >
            <DashPathEffect intervals={[5, 5]} />
          </Path>
        )}

        {/* Landing zone indicator */}
        <Circle
          cx={targetPoint.x}
          cy={targetPoint.y}
          r={50}
          color={colors.warning}
          style="stroke"
          strokeWidth={1}
          opacity={0.3}
        />
      </Group>
    </Canvas>
  );
};

/**
 * AR Measurement Overlay
 * Visar mätningar i AR
 */
export const ARMeasurementOverlay = ({ measurements }) => {
  if (!measurements || measurements.length === 0) {
    return null;
  }

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {measurements.map((measurement, index) => (
        <Group key={index}>
          {/* Measurement line */}
          <Path
            path={`M ${measurement.from.x} ${measurement.from.y} L ${measurement.to.x} ${measurement.to.y}`}
            color={colors.info}
            style="stroke"
            strokeWidth={2}
          />
          
          {/* Distance label background */}
          <Rect
            x={measurement.labelPosition.x - 30}
            y={measurement.labelPosition.y - 15}
            width={60}
            height={30}
            color="rgba(0, 0, 0, 0.7)"
            rx={4}
          />
          
          {/* Distance text would go here (requires Text component) */}
        </Group>
      ))}
    </Canvas>
  );
};

/**
 * 3D Ground Plane Visualization
 * Visar spelplan i 3D med AR
 */
export const GroundPlaneVisualization = ({ planeDetected, planeCorners }) => {
  if (!planeDetected || !planeCorners) {
    return null;
  }

  const planePath = `
    M ${planeCorners[0].x} ${planeCorners[0].y}
    L ${planeCorners[1].x} ${planeCorners[1].y}
    L ${planeCorners[2].x} ${planeCorners[2].y}
    L ${planeCorners[3].x} ${planeCorners[3].y}
    Z
  `;

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group>
        {/* Ground plane */}
        <Path
          path={planePath}
          color={colors.primary}
          opacity={0.2}
        />
        
        {/* Grid lines */}
        <Path
          path={planePath}
          color={colors.primary}
          style="stroke"
          strokeWidth={2}
          opacity={0.5}
        />
        
        {/* Corner markers */}
        {planeCorners.map((corner, index) => (
          <Circle
            key={index}
            cx={corner.x}
            cy={corner.y}
            r={6}
            color={colors.primary}
          />
        ))}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  // Styles if needed
});

export default VirtualTrajectory;
