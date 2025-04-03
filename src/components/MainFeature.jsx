import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Minus, LayoutGrid, Download, Settings, X, 
  ChevronRight, ChevronDown, Move, Trash2, Edit3, 
  Save, Code, Cpu, Database, FileText, Workflow, 
  Brain, Zap, ArrowRight
} from 'lucide-react'

const MainFeature = () => {
  // Canvas state
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [showNodePanel, setShowNodePanel] = useState(true)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)
  const [showJsonPanel, setShowJsonPanel] = useState(false)
  
  const canvasRef = useRef(null)
  
  // Node types with their configurations
  const nodeTypes = [
    {
      type: 'agent',
      label: 'AI Agent',
      icon: <Cpu size={18} />,
      color: 'bg-blue-500',
      inputs: ['memory', 'tools', 'retriever'],
      outputs: ['response'],
      properties: [
        { name: 'name', type: 'text', label: 'Agent Name', default: 'New Agent' },
        { name: 'model', type: 'select', label: 'Model', 
          options: ['gpt-4', 'gpt-3.5-turbo', 'claude-2', 'llama-2'], 
          default: 'gpt-4' },
        { name: 'temperature', type: 'range', label: 'Temperature', 
          min: 0, max: 1, step: 0.1, default: 0.7 },
        { name: 'systemPrompt', type: 'textarea', label: 'System Prompt', 
          default: 'You are a helpful assistant.' }
      ]
    },
    {
      type: 'memory',
      label: 'Memory',
      icon: <Brain size={18} />,
      color: 'bg-purple-500',
      inputs: [],
      outputs: ['context'],
      properties: [
        { name: 'type', type: 'select', label: 'Memory Type', 
          options: ['buffer', 'conversation', 'vector'], default: 'conversation' },
        { name: 'maxTokens', type: 'number', label: 'Max Tokens', default: 2000 }
      ]
    },
    {
      type: 'retriever',
      label: 'Retriever',
      icon: <Database size={18} />,
      color: 'bg-green-500',
      inputs: ['query'],
      outputs: ['documents'],
      properties: [
        { name: 'type', type: 'select', label: 'Retriever Type', 
          options: ['similarity', 'mmr', 'contextual'], default: 'similarity' },
        { name: 'topK', type: 'number', label: 'Top K Results', default: 5 }
      ]
    },
    {
      type: 'documentLoader',
      label: 'Document Loader',
      icon: <FileText size={18} />,
      color: 'bg-yellow-500',
      inputs: [],
      outputs: ['documents'],
      properties: [
        { name: 'source', type: 'select', label: 'Source Type', 
          options: ['file', 'url', 'database'], default: 'file' },
        { name: 'format', type: 'select', label: 'Format', 
          options: ['pdf', 'txt', 'html', 'json'], default: 'pdf' }
      ]
    },
    {
      type: 'vectorStore',
      label: 'Vector Store',
      icon: <Database size={18} />,
      color: 'bg-red-500',
      inputs: ['documents'],
      outputs: ['vectors'],
      properties: [
        { name: 'type', type: 'select', label: 'Store Type', 
          options: ['pinecone', 'chroma', 'faiss', 'milvus'], default: 'chroma' },
        { name: 'dimensions', type: 'number', label: 'Dimensions', default: 1536 }
      ]
    },
    {
      type: 'outputTransformer',
      label: 'Output Transformer',
      icon: <Zap size={18} />,
      color: 'bg-indigo-500',
      inputs: ['input'],
      outputs: ['output'],
      properties: [
        { name: 'operation', type: 'select', label: 'Operation', 
          options: ['format', 'filter', 'extract', 'summarize'], default: 'format' },
        { name: 'template', type: 'textarea', label: 'Template', 
          default: '{{ input }}' }
      ]
    },
    {
      type: 'tool',
      label: 'Tool',
      icon: <Workflow size={18} />,
      color: 'bg-teal-500',
      inputs: ['parameters'],
      outputs: ['result'],
      properties: [
        { name: 'name', type: 'text', label: 'Tool Name', default: 'New Tool' },
        { name: 'type', type: 'select', label: 'Tool Type', 
          options: ['web-search', 'calculator', 'weather', 'custom'], default: 'web-search' },
        { name: 'description', type: 'textarea', label: 'Description', 
          default: 'A tool that performs a specific function.' }
      ]
    }
  ]
  
  // Generate JSON configuration from nodes and connections
  const generateJson = () => {
    const workflow = {
      id: 'workflow-1',
      name: 'My Agent Workflow',
      nodes: nodes.map(node => {
        const { id, type, position, data, label } = node
        return {
          id,
          type,
          position,
          data,
          label
        }
      }),
      connections: connections.map(conn => ({
        id: conn.id,
        sourceNodeId: conn.source,
        sourcePortId: conn.sourceHandle,
        targetNodeId: conn.target,
        targetPortId: conn.targetHandle
      }))
    }
    
    return JSON.stringify(workflow, null, 2)
  }
  
  // Handle canvas zoom
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2))
  }
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5))
  }
  
  const handleResetView = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }
  
  // Handle canvas drag
  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      
      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }))
      
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  // Add node to canvas
  const addNode = (type) => {
    const nodeType = nodeTypes.find(nt => nt.type === type)
    if (!nodeType) return
    
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeType.type,
      label: nodeType.label,
      position: {
        x: -position.x / scale + (canvasRef.current?.clientWidth / 2 / scale) - 100,
        y: -position.y / scale + (canvasRef.current?.clientHeight / 2 / scale) - 75
      },
      data: {
        ...nodeType.properties.reduce((acc, prop) => {
          acc[prop.name] = prop.default
          return acc
        }, {})
      },
      inputs: nodeType.inputs,
      outputs: nodeType.outputs,
      color: nodeType.color
    }
    
    setNodes(prev => [...prev, newNode])
    setSelectedNode(newNode)
  }
  
  // Handle node drag
  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation()
    
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    
    setSelectedNode(node)
    
    const startX = e.clientX
    const startY = e.clientY
    const startNodeX = node.position.x
    const startNodeY = node.position.y
    
    const handleNodeMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / scale
      const dy = (moveEvent.clientY - startY) / scale
      
      setNodes(prev => prev.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            position: {
              x: startNodeX + dx,
              y: startNodeY + dy
            }
          }
        }
        return n
      }))
    }
    
    const handleNodeUp = () => {
      document.removeEventListener('mousemove', handleNodeMove)
      document.removeEventListener('mouseup', handleNodeUp)
    }
    
    document.addEventListener('mousemove', handleNodeMove)
    document.addEventListener('mouseup', handleNodeUp)
  }
  
  // Handle connection creation
  const handlePortMouseDown = (e, nodeId, portId, isInput) => {
    e.stopPropagation()
    
    if (isInput) {
      // If connecting to an input port, check if there's already a connection
      const existingConnection = connections.find(
        conn => conn.target === nodeId && conn.targetHandle === portId
      )
      
      if (existingConnection) {
        // Remove the existing connection
        setConnections(prev => 
          prev.filter(conn => 
            !(conn.target === nodeId && conn.targetHandle === portId)
          )
        )
      }
      
      if (connectingFrom) {
        // Create a new connection
        const newConnection = {
          id: `conn-${Date.now()}`,
          source: connectingFrom.nodeId,
          sourceHandle: connectingFrom.portId,
          target: nodeId,
          targetHandle: portId
        }
        
        setConnections(prev => [...prev, newConnection])
        setConnectingFrom(null)
      }
    } else {
      // Start connecting from an output port
      setConnectingFrom({ nodeId, portId })
    }
  }
  
  // Delete selected node
  const deleteSelectedNode = () => {
    if (!selectedNode) return
    
    setNodes(prev => prev.filter(n => n.id !== selectedNode.id))
    setConnections(prev => 
      prev.filter(conn => 
        conn.source !== selectedNode.id && conn.target !== selectedNode.id
      )
    )
    setSelectedNode(null)
  }
  
  // Update node properties
  const updateNodeProperty = (property, value) => {
    if (!selectedNode) return
    
    setNodes(prev => prev.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            [property]: value
          }
        }
      }
      return node
    }))
    
    setSelectedNode(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [property]: value
      }
    }))
  }
  
  // Auto layout nodes
  const autoLayoutNodes = () => {
    if (nodes.length === 0) return
    
    // Simple grid layout
    const columns = Math.ceil(Math.sqrt(nodes.length))
    const nodeWidth = 200
    const nodeHeight = 150
    const padding = 50
    
    const newNodes = nodes.map((node, index) => {
      const col = index % columns
      const row = Math.floor(index / columns)
      
      return {
        ...node,
        position: {
          x: col * (nodeWidth + padding),
          y: row * (nodeHeight + padding)
        }
      }
    })
    
    setNodes(newNodes)
  }
  
  // Download JSON configuration
  const downloadJson = () => {
    const json = generateJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'agent-workflow.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  // Render node on canvas
  const renderNode = (node) => {
    const nodeType = nodeTypes.find(nt => nt.type === node.type)
    if (!nodeType) return null
    
    const isSelected = selectedNode?.id === node.id
    
    return (
      <div
        key={node.id}
        className={`absolute ${node.color} rounded-lg shadow-lg overflow-hidden transition-shadow ${
          isSelected ? 'ring-2 ring-white dark:ring-surface-900 shadow-xl' : ''
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          width: '200px',
          zIndex: isSelected ? 10 : 1
        }}
        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
      >
        <div className="bg-black bg-opacity-20 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            {nodeType.icon}
            <span className="font-medium">{node.data.name || node.label}</span>
          </div>
          <div className="flex items-center">
            <button 
              className="text-white opacity-70 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedNode(node)
              }}
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-surface-800 p-3 text-sm">
          {/* Input ports */}
          <div className="mb-2">
            {node.inputs && node.inputs.map(input => (
              <div key={input} className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 bg-surface-300 dark:bg-surface-600 rounded-full cursor-pointer hover:bg-primary"
                  onMouseDown={(e) => handlePortMouseDown(e, node.id, input, true)}
                />
                <span className="text-xs text-surface-600 dark:text-surface-400">{input}</span>
              </div>
            ))}
          </div>
          
          {/* Output ports */}
          <div>
            {node.outputs && node.outputs.map(output => (
              <div key={output} className="flex items-center justify-end gap-2 mb-1">
                <span className="text-xs text-surface-600 dark:text-surface-400">{output}</span>
                <div 
                  className="w-3 h-3 bg-surface-300 dark:bg-surface-600 rounded-full cursor-pointer hover:bg-primary"
                  onMouseDown={(e) => handlePortMouseDown(e, node.id, output, false)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  // Render connections between nodes
  const renderConnections = () => {
    return connections.map(connection => {
      const sourceNode = nodes.find(n => n.id === connection.source)
      const targetNode = nodes.find(n => n.id === connection.target)
      
      if (!sourceNode || !targetNode) return null
      
      // Find output port position on source node
      const sourcePortIndex = sourceNode.outputs.findIndex(p => p === connection.sourceHandle)
      const sourcePortY = 80 + (sourcePortIndex * 20)
      
      // Find input port position on target node
      const targetPortIndex = targetNode.inputs.findIndex(p => p === connection.targetHandle)
      const targetPortY = 40 + (targetPortIndex * 20)
      
      const sourceX = sourceNode.position.x + 200
      const sourceY = sourceNode.position.y + sourcePortY
      const targetX = targetNode.position.x
      const targetY = targetNode.position.y + targetPortY
      
      // Calculate control points for the bezier curve
      const controlPointOffset = 50
      const sourceControlX = sourceX + controlPointOffset
      const targetControlX = targetX - controlPointOffset
      
      return (
        <svg
          key={connection.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <path
            d={`M ${sourceX} ${sourceY} C ${sourceControlX} ${sourceY}, ${targetControlX} ${targetY}, ${targetX} ${targetY}`}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-primary"
          />
          <circle cx={sourceX} cy={sourceY} r="3" fill="currentColor" className="text-primary" />
          <circle cx={targetX} cy={targetY} r="3" fill="currentColor" className="text-primary" />
        </svg>
      )
    })
  }
  
  // Properties panel for selected node
  const renderPropertiesPanel = () => {
    if (!selectedNode) {
      return (
        <div className="p-4 text-center text-surface-500">
          <p>Select a node to edit its properties</p>
        </div>
      )
    }
    
    const nodeType = nodeTypes.find(nt => nt.type === selectedNode.type)
    if (!nodeType) return null
    
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-6 h-6 rounded-md ${selectedNode.color} flex items-center justify-center text-white`}>
            {nodeType.icon}
          </div>
          <h3 className="font-medium">{nodeType.label} Properties</h3>
        </div>
        
        <div className="space-y-4">
          {nodeType.properties.map(prop => (
            <div key={prop.name} className="space-y-1">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                {prop.label}
              </label>
              
              {prop.type === 'text' && (
                <input
                  type="text"
                  value={selectedNode.data[prop.name] || ''}
                  onChange={(e) => updateNodeProperty(prop.name, e.target.value)}
                  className="input text-sm"
                />
              )}
              
              {prop.type === 'number' && (
                <input
                  type="number"
                  value={selectedNode.data[prop.name] || 0}
                  onChange={(e) => updateNodeProperty(prop.name, Number(e.target.value))}
                  className="input text-sm"
                />
              )}
              
              {prop.type === 'select' && (
                <select
                  value={selectedNode.data[prop.name] || ''}
                  onChange={(e) => updateNodeProperty(prop.name, e.target.value)}
                  className="input text-sm"
                >
                  {prop.options.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
              
              {prop.type === 'range' && (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={prop.min}
                    max={prop.max}
                    step={prop.step}
                    value={selectedNode.data[prop.name] || 0}
                    onChange={(e) => updateNodeProperty(prop.name, Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-surface-500">
                    {selectedNode.data[prop.name]}
                  </span>
                </div>
              )}
              
              {prop.type === 'textarea' && (
                <textarea
                  value={selectedNode.data[prop.name] || ''}
                  onChange={(e) => updateNodeProperty(prop.name, e.target.value)}
                  rows={3}
                  className="input text-sm"
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between">
          <button
            onClick={deleteSelectedNode}
            className="btn btn-outline text-sm inline-flex items-center gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 size={16} />
            Delete
          </button>
          
          <button
            onClick={() => setSelectedNode(null)}
            className="btn btn-outline text-sm"
          >
            Done
          </button>
        </div>
      </div>
    )
  }
  
  // JSON output panel
  const renderJsonPanel = () => {
    const json = generateJson()
    
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">JSON Configuration</h3>
          
          <button
            onClick={downloadJson}
            className="btn btn-outline text-sm inline-flex items-center gap-1"
          >
            <Download size={16} />
            Download
          </button>
        </div>
        
        <pre className="bg-surface-100 dark:bg-surface-800 p-3 rounded-lg text-xs overflow-auto max-h-[500px] border border-surface-200 dark:border-surface-700">
          {json}
        </pre>
      </div>
    )
  }
  
  return (
    <div className="flex h-[calc(100vh-140px)]">
      {/* Node palette */}
      <AnimatePresence initial={false}>
        {showNodePanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 flex flex-col h-full overflow-hidden"
          >
            <div className="p-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
              <h3 className="font-medium">Components</h3>
              <button
                onClick={() => setShowNodePanel(false)}
                className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-3 space-y-2">
              {nodeTypes.map(nodeType => (
                <motion.div
                  key={nodeType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${nodeType.color} rounded-lg p-3 text-white cursor-pointer shadow-sm hover:shadow`}
                  onClick={() => addNode(nodeType.type)}
                >
                  <div className="flex items-center gap-2">
                    {nodeType.icon}
                    <span className="font-medium">{nodeType.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Canvas */}
      <div className="flex-grow relative overflow-hidden bg-surface-100 dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700">
        {/* Canvas controls */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          {!showNodePanel && (
            <button
              onClick={() => setShowNodePanel(true)}
              className="btn btn-outline bg-white dark:bg-surface-700 text-sm p-2"
              title="Show components"
            >
              <ChevronRight size={18} />
            </button>
          )}
          
          <div className="bg-white dark:bg-surface-700 rounded-lg shadow-sm flex items-center p-1">
            <button
              onClick={handleZoomOut}
              className="p-1 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100"
              title="Zoom out"
            >
              <Minus size={18} />
            </button>
            
            <div className="px-2 text-sm text-surface-600 dark:text-surface-400">
              {Math.round(scale * 100)}%
            </div>
            
            <button
              onClick={handleZoomIn}
              className="p-1 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100"
              title="Zoom in"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <button
            onClick={handleResetView}
            className="btn btn-outline bg-white dark:bg-surface-700 text-sm p-2"
            title="Reset view"
          >
            <Move size={18} />
          </button>
          
          <button
            onClick={autoLayoutNodes}
            className="btn btn-outline bg-white dark:bg-surface-700 text-sm p-2"
            title="Auto layout"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
        
        {/* Canvas area */}
        <div
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="relative w-full h-full"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Grid background */}
            <div
              className="absolute inset-0 bg-surface-100 dark:bg-surface-800"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Connections */}
            {renderConnections()}
            
            {/* Nodes */}
            {nodes.map(renderNode)}
          </div>
        </div>
        
        {/* JSON button */}
        <div className="absolute bottom-3 left-3 z-10">
          <button
            onClick={() => setShowJsonPanel(!showJsonPanel)}
            className={`btn ${showJsonPanel ? 'btn-primary' : 'btn-outline bg-white dark:bg-surface-700'} text-sm inline-flex items-center gap-1`}
            title="Show JSON"
          >
            <Code size={16} />
            {showJsonPanel ? 'Hide' : 'Show'} JSON
          </button>
        </div>
      </div>
      
      {/* Properties/JSON panel */}
      <AnimatePresence initial={false}>
        {(showPropertiesPanel || showJsonPanel) && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-surface-800 h-full overflow-hidden flex flex-col"
          >
            <div className="border-b border-surface-200 dark:border-surface-700">
              <div className="flex">
                <button
                  onClick={() => {
                    setShowPropertiesPanel(true)
                    setShowJsonPanel(false)
                  }}
                  className={`flex-1 py-3 px-4 text-sm font-medium ${
                    showPropertiesPanel
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-surface-600 dark:text-surface-400'
                  }`}
                >
                  Properties
                </button>
                
                <button
                  onClick={() => {
                    setShowPropertiesPanel(false)
                    setShowJsonPanel(true)
                  }}
                  className={`flex-1 py-3 px-4 text-sm font-medium ${
                    showJsonPanel
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-surface-600 dark:text-surface-400'
                  }`}
                >
                  JSON
                </button>
                
                <button
                  onClick={() => {
                    setShowPropertiesPanel(false)
                    setShowJsonPanel(false)
                  }}
                  className="p-3 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto">
              {showPropertiesPanel && renderPropertiesPanel()}
              {showJsonPanel && renderJsonPanel()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature