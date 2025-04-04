import React from 'react'
import Tooltip from './Tooltip'
import { 
  Minus, Plus, Move, Undo, Redo, Save, 
  Share2, ZoomIn, ZoomOut, LayoutGrid, 
  Maximize, Download
} from 'lucide-react'

const WorkspaceControls = ({ 
  scale, 
  handleZoomIn, 
  handleZoomOut, 
  handleResetView,
  autoLayoutNodes,
  downloadJson
}) => {
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
      <div className="workspace-control-group">
        <Tooltip content="Zoom out" position="right">
          <button
            onClick={handleZoomOut}
            className="workspace-control"
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </button>
        </Tooltip>
        
        <div className="px-2 text-xs font-medium text-surface-600 dark:text-surface-400 min-w-[40px] text-center">
          {Math.round(scale * 100)}%
        </div>
        
        <Tooltip content="Zoom in" position="right">
          <button
            onClick={handleZoomIn}
            className="workspace-control"
            aria-label="Zoom in"
          >
            <Plus size={16} />
          </button>
        </Tooltip>
      </div>
      
      <div className="workspace-control-group">
        <Tooltip content="Reset view" position="right">
          <button
            onClick={handleResetView}
            className="workspace-control"
            aria-label="Reset view"
          >
            <Move size={16} />
          </button>
        </Tooltip>
        
        <Tooltip content="Auto layout" position="right">
          <button
            onClick={autoLayoutNodes}
            className="workspace-control"
            aria-label="Auto layout"
          >
            <LayoutGrid size={16} />
          </button>
        </Tooltip>
      </div>
      
      <div className="workspace-control-group">
        <Tooltip content="Undo" position="right">
          <button
            className="workspace-control"
            aria-label="Undo"
            disabled
          >
            <Undo size={16} className="opacity-50" />
          </button>
        </Tooltip>
        
        <Tooltip content="Redo" position="right">
          <button
            className="workspace-control"
            aria-label="Redo"
            disabled
          >
            <Redo size={16} className="opacity-50" />
          </button>
        </Tooltip>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Tooltip content="Download JSON" position="right">
          <button
            onClick={downloadJson}
            className="workspace-action-btn"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </Tooltip>
        
        <Tooltip content="Save workflow" position="right">
          <button className="workspace-action-btn text-primary">
            <Save size={14} />
            <span>Save</span>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default WorkspaceControls