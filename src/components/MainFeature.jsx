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
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [showNodePanel, setShowNodePanel] = useState(true)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)
  const [showJsonPanel, setShowJsonPanel] = useState(false)
  const [isAddingConnection, setIsAddingConnection] = useState(false)
  const [temporaryConnection, setTemporaryConnection] = useState(null)
  const [hoveredPort, setHoveredPort] = useState(null)
  const [validTargetPorts, setValidTargetPorts] = useState([])
  
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
        targetPortId: conn.targetHandle,
        label: conn.label || ''
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
    } else if (isAddingConnection && connectingFrom) {
      // Update temporary connection while drawing
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - canvasRect.left - position.x) / scale
      const y = (e.clientY - canvasRect.top - position.y) / scale
      
      setTemporaryConnection({
        sourceX: connectingFrom.x,
        sourceY: connectingFrom.y,
        targetX: x,
        targetY: y
      })

      // Find valid target ports based on current mouse position
      findValidTargetPorts(x, y)
    }
  }
  
  const handleMouseUp = (e) => {
    setIsDragging(false)
    if (isAddingConnection) {
      // If not over a valid port, cancel the connection
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - canvasRect.left - position.x) / scale
      const y = (e.clientY - canvasRect.top - position.y) / scale
      
      // Check if we released over a valid port
      const portElement = document.elementFromPoint(e.clientX, e.clientY)
      if (portElement && portElement.dataset && portElement.dataset.portType === 'input') {
        const nodeId = portElement.dataset.nodeId
        const portId = portElement.dataset.portId
        completeConnection(nodeId, portId)
      } else {
        cancelConnection()
      }
    }
  }

  // Find valid target ports based on mouse position
  const findValidTargetPorts = (x, y) => {
    if (!connectingFrom) return
    
    // Find possible target nodes (exclude the source node)
    const targetNodes = nodes.filter(node => node.id !== connectingFrom.nodeId)
    const validPorts = []
    
    targetNodes.forEach(node => {
      if (node.inputs && node.inputs.length) {
        node.inputs.forEach(input => {
          // Check if there's already a connection to this input
          const alreadyConnected = connections.some(
            conn => conn.target === node.id && conn.targetHandle === input
          )
          
          if (!alreadyConnected) {
            validPorts.push({
              nodeId: node.id,
              portId: input,
              position: getPortPosition(node, input, true)
            })
          }
        })
      }
    })
    
    setValidTargetPorts(validPorts)
  }
  
  // Complete the connection process
  const completeConnection = (targetNodeId, targetPortId) => {
    if (!connectingFrom) return
    
    const sourceNode = nodes.find(n => n.id === connectingFrom.nodeId)
    const targetNode = nodes.find(n => n.id === targetNodeId)
    
    if (sourceNode && targetNode) {
      const sourcePort = connectingFrom.portId
      const targetPort = targetPortId
      
      // Default connection label
      const defaultLabel = `${sourcePort} → ${targetPort}`
      
      // Show a dialog to add a connection label
      const label = prompt('Enter connection label:', defaultLabel)
      
      if (label !== null) {
        const newConnection = {
          id: `conn-${Date.now()}`,
          source: connectingFrom.nodeId,
          sourceHandle: connectingFrom.portId,
          target: targetNodeId,
          targetHandle: targetPortId,
          label: label || defaultLabel
        }
        
        setConnections(prev => [...prev, newConnection])
        setSelectedConnection(newConnection)
        setSelectedNode(null)
      }
    }
    
    // Reset connection state
    cancelConnection()
  }
  
  // Cancel the current connection process
  const cancelConnection = () => {
    setConnectingFrom(null)
    setIsAddingConnection(false)
    setTemporaryConnection(null)
    setValidTargetPorts([])
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
    setSelectedConnection(null)
    
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
  
  // Calculate port position
  const getPortPosition = (node, portId, isInput) => {
    if (!node) return { x: 0, y: 0 }
    
    let portIndex, portY
    if (isInput) {
      portIndex = node.inputs.findIndex(p => p === portId)
      portY = 40 + (portIndex * 24) // Increased spacing for larger ports
    } else {
      portIndex = node.outputs.findIndex(p => p === portId)
      portY = 80 + (portIndex * 24) // Increased spacing for larger ports
    }
    
    const x = isInput ? node.position.x : node.position.x + 200
    const y = node.position.y + portY
    
    return { x, y }
  }
  
  // Calculate point on bezier curve
  const getPointOnCurve = (startX, startY, endX, endY, t) => {
    const dx = Math.abs(endX - startX)
    // Adjust control point offset based on distance between points
    const controlPointOffset = Math.min(Math.max(80, dx / 2), 150)
    const cp1x = startX + controlPointOffset
    const cp1y = startY
    const cp2x = endX - controlPointOffset
    const cp2y = endY
    
    // Cubic bezier formula
    const x = (1-t)*(1-t)*(1-t)*startX + 3*(1-t)*(1-t)*t*cp1x + 3*(1-t)*t*t*cp2x + t*t*t*endX
    const y = (1-t)*(1-t)*(1-t)*startY + 3*(1-t)*(1-t)*t*cp1y + 3*(1-t)*t*t*cp2y + t*t*t*endY
    
    return { x, y }
  }
  
  // Handle port hover
  const handlePortMouseEnter = (e, nodeId, portId, isInput) => {
    setHoveredPort({ nodeId, portId, isInput })
  }
  
  const handlePortMouseLeave = () => {
    setHoveredPort(null)
  }
  
  // Handle port click for connection creation
  const handlePortMouseDown = (e, nodeId, portId, isInput) => {
    e.stopPropagation()
    
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    
    if (isInput) {
      // If connecting to an input port, check if there's already a connection
      const existingConnection = connections.find(
        conn => conn.target === nodeId && conn.targetHandle === portId
      )
      
      if (existingConnection) {
        // Select the existing connection
        setSelectedConnection(existingConnection)
        setSelectedNode(null)
        return
      }
      
      if (connectingFrom) {
        // Complete the connection
        completeConnection(nodeId, portId)
      }
    } else {
      // Start connecting from an output port
      const portPosition = getPortPosition(node, portId, false)
      setConnectingFrom({ 
        nodeId, 
        portId,
        x: portPosition.x,
        y: portPosition.y
      })
      setIsAddingConnection(true)
      
      // Initialize temporary connection
      setTemporaryConnection({
        sourceX: portPosition.x,
        sourceY: portPosition.y,
        targetX: portPosition.x + 50,
        targetY: portPosition.y
      })
      
      // Find valid target ports
      findValidTargetPorts(portPosition.x + 50, portPosition.y)
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
  
  // Delete selected connection
  const deleteSelectedConnection = () => {
    if (!selectedConnection) return
    
    setConnections(prev => prev.filter(conn => conn.id !== selectedConnection.id))
    setSelectedConnection(null)
  }
  
  // Edit connection label
  const editConnectionLabel = () => {
    if (!selectedConnection) return
    
    const newLabel = prompt('Enter connection label:', selectedConnection.label || '')
    
    if (newLabel !== null) {
      setConnections(prev => prev.map(conn => {
        if (conn.id === selectedConnection.id) {
          return {
            ...conn,
            label: newLabel
          }
        }
        return conn
      }))
      
      setSelectedConnection(prev => ({
        ...prev,
        label: newLabel
      }))
    }
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
  
  // Handle canvas click to deselect
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null)
      setSelectedConnection(null)
      
      // Cancel connection if active
      if (isAddingConnection) {
        cancelConnection()
      }
    }
  }
  
  // Handle connection click
  const handleConnectionClick = (e, connectionId) => {
    e.stopPropagation()
    
    const connection = connections.find(conn => conn.id === connectionId)
    if (connection) {
      setSelectedConnection(connection)
      setSelectedNode(null)
    }
  }
  
  // Check if a port is valid for connection
  const isPortValid = (nodeId, portId) => {
    if (!validTargetPorts.length) return false
    return validTargetPorts.some(
      port => port.nodeId === nodeId && port.portId === portId
    )
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
                setSelectedConnection(null)
              }}
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-surface-800 p-3 text-sm">
          {/* Input ports */}
          <div className="mb-2">
            {node.inputs && node.inputs.map(input => {
              const isValidTarget = isAddingConnection && isPortValid(node.id, input)
              const isHovered = hoveredPort && hoveredPort.nodeId === node.id && 
                            hoveredPort.portId === input && hoveredPort.isInput
              
              return (
                <div key={input} className="flex items-center gap-2 mb-2 relative">
                  <div 
                    className={`port port-input
                      ${isHovered ? 'port-hover' : ''}
                      ${isValidTarget ? 'port-valid' : ''}
                      ${isAddingConnection && connectingFrom ? 'animate-pulse' : ''}
                    `}
                    data-node-id={node.id}
                    data-port-id={input}
                    data-port-type="input"
                    onMouseEnter={(e) => handlePortMouseEnter(e, node.id, input, true)}
                    onMouseLeave={handlePortMouseLeave}
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, input, true)}
                  />
                  <span className="text-xs text-surface-600 dark:text-surface-400">{input}</span>
                </div>
              )
            })}
          </div>
          
          {/* Output ports */}
          <div>
            {node.outputs && node.outputs.map(output => {
              const isConnecting = connectingFrom && 
                                connectingFrom.nodeId === node.id && 
                                connectingFrom.portId === output
              const isHovered = hoveredPort && hoveredPort.nodeId === node.id && 
                            hoveredPort.portId === output && !hoveredPort.isInput
              
              return (
                <div key={output} className="flex items-center justify-end gap-2 mb-2 relative">
                  <span className="text-xs text-surface-600 dark:text-surface-400">{output}</span>
                  <div 
                    className={`port port-output
                      ${isHovered ? 'port-hover' : ''}
                      ${isConnecting ? 'port-active' : ''}
                    `}
                    data-node-id={node.id}
                    data-port-id={output}
                    data-port-type="output"
                    onMouseEnter={(e) => handlePortMouseEnter(e, node.id, output, false)}
                    onMouseLeave={handlePortMouseLeave}
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, output, false)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
  
  // Render connections between nodes
  const renderConnections = () => {
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {connections.map(connection => {
          const sourceNode = nodes.find(n => n.id === connection.source)
          const targetNode = nodes.find(n => n.id === connection.target)
          
          if (!sourceNode || !targetNode) return null
          
          // Get port positions
          const sourcePort = getPortPosition(sourceNode, connection.sourceHandle, false)
          const targetPort = getPortPosition(targetNode, connection.targetHandle, true)
          
          const sourceX = sourcePort.x
          const sourceY = sourcePort.y
          const targetX = targetPort.x
          const targetY = targetPort.y
          
          // Calculate control points for the bezier curve
          const dx = Math.abs(targetX - sourceX)
          const controlPointOffset = Math.min(Math.max(80, dx / 2), 150)
          const sourceControlX = sourceX + controlPointOffset
          const targetControlX = targetX - controlPointOffset
          
          // Calculate path for the connector
          const path = `M ${sourceX} ${sourceY} C ${sourceControlX} ${sourceY}, ${targetControlX} ${targetY}, ${targetX} ${targetY}`
          
          // Get midpoint for label
          const midPoint = getPointOnCurve(sourceX, sourceY, targetX, targetY, 0.5)
          
          // Check if this connection is selected
          const isSelected = selectedConnection?.id === connection.id
          
          return (
            <g 
              key={connection.id} 
              onClick={(e) => handleConnectionClick(e, connection.id)}
              className="cursor-pointer"
              style={{ pointerEvents: 'all' }}
            >
              {/* Invisible wider path for easier selection */}
              <path
                d={path}
                stroke="transparent"
                strokeWidth="15" // Wider hit area for easier selection
                fill="none"
              />
              
              {/* Visible path */}
              <path
                d={path}
                stroke={isSelected ? '#ffffff' : 'currentColor'}
                strokeWidth={isSelected ? '3' : '2'}
                fill="none"
                className={`connection-path ${isSelected ? 'text-primary-light' : 'text-primary'}`}
              />
              
              {/* Source and target dots */}
              <circle cx={sourceX} cy={sourceY} r="4" fill="currentColor" className="text-primary" />
              <circle cx={targetX} cy={targetY} r="4" fill="currentColor" className="text-primary" />
              
              {/* Connection label */}
              {connection.label && (
                <foreignObject
                  x={midPoint.x - 60}
                  y={midPoint.y - 15}
                  width="120"
                  height="30"
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="flex items-center justify-center h-full">
                    <div className={`connection-label ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                      {connection.label}
                    </div>
                  </div>
                </foreignObject>
              )}
            </g>
          )
        })}
        
        {/* Render temporary connection while drawing */}
        {isAddingConnection && temporaryConnection && (
          <g>
            <path
              d={`M ${temporaryConnection.sourceX} ${temporaryConnection.sourceY} C ${temporaryConnection.sourceX + 100} ${temporaryConnection.sourceY}, ${temporaryConnection.targetX - 100} ${temporaryConnection.targetY}, ${temporaryConnection.targetX} ${temporaryConnection.targetY}`}
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              className="text-primary connection-line-creating"
            />
            <circle 
              cx={temporaryConnection.sourceX} 
              cy={temporaryConnection.sourceY} 
              r="4" 
              fill="currentColor" 
              className="text-primary" 
            />
            <circle 
              cx={temporaryConnection.targetX} 
              cy={temporaryConnection.targetY} 
              r="4" 
              fill="currentColor" 
              className="text-primary animate-ping" 
            />
          </g>
        )}
        
        {/* Highlight valid target ports */}
        {isAddingConnection && validTargetPorts.length > 0 && (
          <g>
            {validTargetPorts.map((port, idx) => (
              <circle
                key={idx}
                cx={port.position.x}
                cy={port.position.y}
                r="6"
                className="fill-none stroke-green-500 stroke-2 animate-pulse"
              />
            ))}
          </g>
        )}
      </svg>
    )
  }
  
  // Properties panel for selected node
  const renderPropertiesPanel = () => {
    if (selectedConnection) {
      return (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-white">
              <ArrowRight size={16} />
            </div>
            <h3 className="font-medium">Connection Properties</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Connection Label
              </label>
              <input
                type="text"
                value={selectedConnection.label || ''}
                onChange={(e) => {
                  const newLabel = e.target.value
                  setConnections(prev => prev.map(conn => {
                    if (conn.id === selectedConnection.id) {
                      return { ...conn, label: newLabel }
                    }
                    return conn
                  }))
                  setSelectedConnection(prev => ({ ...prev, label: newLabel }))
                }}
                className="input text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                From
              </label>
              <div className="text-sm p-2 bg-surface-50 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700">
                {selectedConnection.source} ({selectedConnection.sourceHandle})
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                To
              </label>
              <div className="text-sm p-2 bg-surface-50 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700">
                {selectedConnection.target} ({selectedConnection.targetHandle})
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={deleteSelectedConnection}
              className="btn btn-outline text-sm inline-flex items-center gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={16} />
              Delete
            </button>
            
            <button
              onClick={() => setSelectedConnection(null)}
              className="btn btn-outline text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )
    }
    
    if (!selectedNode) {
      return (
        <div className="p-4 text-center text-surface-500">
          <p>Select a node or connection to edit properties</p>
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

  // Add keyboard escape handler to cancel connection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAddingConnection) {
        cancelConnection()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAddingConnection])
  
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
        {/* Connection mode indicator */}
        {isAddingConnection && (
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-20 bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <span className="animate-pulse">●</span>
              <span>Creating connection from {connectingFrom?.portId} - Click on an input port to connect or press ESC to cancel</span>
            </div>
          </div>
        )}
      
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
          onClick={handleCanvasClick}
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