'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background, 
  BackgroundVariant, 
  useReactFlow,
  Panel,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

const workflowConfig = {
  workflowId: 'WD6dd9a5ebf788477a94b314625e100dc8',
  phoneNumberId: 'PN1lNZ0Si4',
  name: 'SONA AI WORKFLOW TEST',
  status: 'live',
  lastEditedAt: '2025-11-07T...',
  nodes: [
    {
      id: 'incoming-call',
      type: 'incomingCall',
      label: 'Incoming call',
      description: 'When a call comes in',
      position: { x: 0, y: 0 }
    },
    {
      id: 'ring-users',
      type: 'ringUsers',
      config: { strategy: 'allAtOnce', duration: 5 },
      position: { x: 0, y: 150 }
    },
    {
      id: 'sona',
      type: 'sona',
      config: { aiEnabled: true },
      position: { x: 0, y: 300 }
    },
    {
      id: 'voicemail',
      type: 'voicemail',
      config: { message: 'Send caller to voicemail' },
      position: { x: 0, y: 450 }
    }
  ],
  edges: [
    { source: 'incoming-call', target: 'ring-users', label: 'If call is missed' },
    { source: 'ring-users', target: 'sona', label: 'Fallback' },
    { source: 'sona', target: 'voicemail', label: 'Fallback' }
  ],
  settings: {
    layout: 'vertical',
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    snapToGrid: true,
    defaultEdgeType: 'smoothstep'
  }
} as const;

function ZoomAndHistoryPanel() {
  const { zoomIn, zoomOut, getZoom, undo, redo } = useReactFlow();
  const [zoom, setZoom] = useState(() => Math.round(getZoom() * 100));

  const handleZoomIn = useCallback(() => {
    zoomIn();
    setZoom(Math.round(getZoom() * 100));
  }, [zoomIn, getZoom]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
    setZoom(Math.round(getZoom() * 100));
  }, [zoomOut, getZoom]);

  // Update zoom display when zoom changes
  useEffect(() => {
    const interval = setInterval(() => {
      setZoom(Math.round(getZoom() * 100));
    }, 100);
    return () => clearInterval(interval);
  }, [getZoom]);

  return (
    <Panel position="bottom-left" className="react-flow__panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={undo}
          style={{
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          Undo
        </button>
        <button
          onClick={redo}
          style={{
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          Redo
        </button>
        <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={handleZoomOut}
            style={{
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            −
          </button>
          <span style={{ minWidth: '50px', textAlign: 'center', fontSize: '14px' }}>
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            style={{
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            +
          </button>
        </div>
      </div>
    </Panel>
  );
}

function WorkflowBuilderContent() {
  const defaultNodes = useMemo(
    () =>
      workflowConfig.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.label ?? node.id,
          description: node.description ?? '',
          config: node.config ?? {}
        }
      })),
    []
  );

  const defaultEdges = useMemo(
    () =>
      workflowConfig.edges.map((edge, index) => ({
        id: `edge-${edge.source}-${edge.target}-${index}`,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: workflowConfig.settings.defaultEdgeType
      })),
    []
  );

  const defaultViewport = useMemo(
    () => ({
      x: workflowConfig.settings.pan.x,
      y: workflowConfig.settings.pan.y,
      zoom: workflowConfig.settings.zoom
    }),
    []
  );

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 0 }}>
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        defaultViewport={defaultViewport}
        snapToGrid={workflowConfig.settings.snapToGrid}
        defaultEdgeOptions={{ type: workflowConfig.settings.defaultEdgeType }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#91919a"
        />
        <ZoomAndHistoryPanel />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent />
    </ReactFlowProvider>
  );
}
