'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  BackgroundVariant, 
  useReactFlow,
  Panel,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

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
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 0 }}>
      <ReactFlow>
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
