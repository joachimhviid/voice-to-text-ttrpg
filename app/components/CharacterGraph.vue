<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { CharacterNode, CharacterEdge, SimulationNode } from '#shared/types/graph'

const props = defineProps<{
  edges: CharacterEdge[]
  nodes: CharacterNode[]
}>()

const router = useRouter()
const containerWidth = ref(800)
const containerHeight = ref(400)
const containerRef = ref<HTMLElement | null>(null)

// Initialize node positions based on props
const simulationNodes = ref<SimulationNode[]>([])

// Placeholder data logic
const displayNodes = computed<CharacterNode[]>(() => {
  if (props.nodes.length > 0) return props.nodes

  // Return placeholder nodes if none exist
  return [
    { id: 1, imageUrl: '/CharDefaults/1ham.png', name: 'Alice' },
    { id: 2, imageUrl: '/CharDefaults/2ham.png', name: 'Bob' },
    { id: 3, imageUrl: '/CharDefaults/3ham.png', name: 'Charlie' },
    { id: 4, imageUrl: '/CharDefaults/4ham.png', name: 'Diana' },
  ]
})

const displayEdges = computed<CharacterEdge[]>(() => {
  if (props.nodes.length > 0) return props.edges

  // Return placeholder edges if no nodes exist
  return [
    { character1Id: 1, character2Id: 2, id: 1, score: 80 },
    { character1Id: 2, character2Id: 3, id: 2, score: -50 },
    { character1Id: 1, character2Id: 4, id: 3, score: 20 },
    { character1Id: 3, character2Id: 4, id: 4, score: -90 },
    { character1Id: 1, character2Id: 3, id: 5, score: 60 },
  ]
})

// When props change, re-initialize the simulation nodes
watch(
  () => displayNodes.value,
  (newNodes) => {
    simulationNodes.value = newNodes.map((node, i) => ({
      ...node,
      vx: 0,
      vy: 0,
      // Start them in a random circle
      x: containerWidth.value / 2 + Math.cos(i) * 100,
      y: containerHeight.value / 2 + Math.sin(i) * 100,
    }))
  },
  { immediate: true },
)

// Helper to get a node by ID
const getNode = (id: number) => simulationNodes.value.find((n) => n.id === id)

// Animation loop
let animationFrameId: number
const tick = () => {
  const alpha = 0.1 // cooling factor

  // Apply repulsive force between all nodes
  for (let i = 0; i < simulationNodes.value.length; i++) {
    for (let j = i + 1; j < simulationNodes.value.length; j++) {
      const n1 = simulationNodes.value[i]
      const n2 = simulationNodes.value[j]

      if (!n1 || !n2) continue

      const dx = n2.x - n1.x
      const dy = n2.y - n1.y
      let dist = Math.sqrt(dx * dx + dy * dy)
      if (dist === 0) dist = 0.01 // avoid division by zero

      // Repulsion: push apart
      const force = 5000 / (dist * dist)
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force

      n1.vx -= fx * alpha
      n1.vy -= fy * alpha
      n2.vx += fx * alpha
      n2.vy += fy * alpha
    }
  }

  // Apply attractive force for connected nodes
  displayEdges.value.forEach((edge) => {
    const n1 = getNode(edge.character1Id)
    const n2 = getNode(edge.character2Id)
    if (!n1 || !n2) return

    const dx = n2.x - n1.x
    const dy = n2.y - n1.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Ideal distance
    const idealDist = 200
    // Attraction based on distance from ideal
    const force = (dist - idealDist) * 0.01

    const fx = (dx / dist) * force
    const fy = (dy / dist) * force

    n1.vx += fx * alpha
    n1.vy += fy * alpha
    n2.vx -= fx * alpha
    n2.vy -= fy * alpha
  })

  // Apply center gravity
  simulationNodes.value.forEach((node) => {
    const cx = containerWidth.value / 2
    const cy = containerHeight.value / 2
    node.vx += (cx - node.x) * 0.005 * alpha
    node.vy += (cy - node.y) * 0.005 * alpha
  })

  // Apply velocity to position and add friction
  simulationNodes.value.forEach((node) => {
    node.x += node.vx
    node.y += node.vy
    node.vx *= 0.9 // friction
    node.vy *= 0.9

    // Keep in bounds
    node.x = Math.max(50, Math.min(containerWidth.value - 50, node.x))
    node.y = Math.max(50, Math.min(containerHeight.value - 50, node.y))
  })

  animationFrameId = requestAnimationFrame(tick)
}

onMounted(() => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
    containerHeight.value = containerRef.value.clientHeight
  }
  animationFrameId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
})

// --- Drawing Helpers ---

const getLineColor = (score: number) => {
  if (score < 0) {
    const intensity = Math.abs(score) / 100
    return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})` // Red
  } else if (score > 0) {
    const intensity = score / 100
    return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})` // Green
  }
  return 'rgba(156, 163, 175, 0.5)' // Gray
}

const getLineThickness = (score: number) => {
  return 1 + (Math.abs(score) / 100) * 4
}

// Navigation
const handleNodeClick = (node: CharacterNode) => {
  // Only navigate if it's a real character with a wiki ID
  if (node.wikiId) {
    router.push(`/wiki/${node.wikiId}`)
  } else if (props.nodes.length === 0) {
    // If it's placeholder data, maybe show an alert or just do nothing
    console.log('Clicked a placeholder character')
  }
}
</script>

<template>
  <div class="mb-4">
    <div v-if="props.nodes.length === 0" class="mb-2 text-sm text-yellow-400 italic">
      Showing placeholder data. Add characters to this wiki to see the actual graph.
    </div>

    <div
      ref="containerRef"
      class="relative h-[400px] w-full overflow-hidden rounded-md border border-gray-600 bg-gray-800"
      :class="{ 'opacity-50': props.nodes.length === 0 }"
    >
      <!-- Draw Edges (Lines) -->
      <svg class="pointer-events-none absolute inset-0 h-full w-full">
        <line
          v-for="edge in displayEdges"
          :key="edge.id"
          :x1="getNode(edge.character1Id)?.x || 0"
          :y1="getNode(edge.character1Id)?.y || 0"
          :x2="getNode(edge.character2Id)?.x || 0"
          :y2="getNode(edge.character2Id)?.y || 0"
          :stroke="getLineColor(edge.score)"
          :stroke-width="getLineThickness(edge.score)"
        />
        <!-- Draw Labels on lines -->
        <text
          v-for="edge in displayEdges"
          :key="`label-${edge.id}`"
          :x="((getNode(edge.character1Id)?.x || 0) + (getNode(edge.character2Id)?.x || 0)) / 2"
          :y="((getNode(edge.character1Id)?.y || 0) + (getNode(edge.character2Id)?.y || 0)) / 2"
          fill="white"
          font-size="12"
          text-anchor="middle"
          dominant-baseline="middle"
          class="font-bold drop-shadow-md select-none"
        >
          {{ edge.score }}
        </text>
      </svg>

      <!-- Draw Nodes (Characters) -->
      <template v-if="simulationNodes.length > 0">
        <div
          v-for="node in simulationNodes"
          :key="node.id"
          class="group absolute flex -translate-x-1/2 -translate-y-1/2 transform cursor-pointer flex-col items-center"
          :style="{ left: `${node.x}px`, top: `${node.y}px` }"
          :title="!node.wikiId ? 'This character doesn\'t have a page yet' : ''"
          @click="handleNodeClick(node)"
        >
          <img
            :src="node.imageUrl"
            :alt="node.name"
            class="h-12 w-12 rounded-full border-2 border-gray-500 object-cover shadow-lg transition-colors group-hover:border-blue-400"
            draggable="false"
          />
          <span
            class="mt-1 rounded bg-gray-700/80 px-2 py-0.5 text-xs font-medium whitespace-nowrap shadow-md backdrop-blur-sm"
          >
            {{ node.name }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
