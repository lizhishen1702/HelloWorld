<script setup>
const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click-node'])

function handleClick() {
  emit('click-node', props.node)
}

function handleChildClick(child) {
  emit('click-node', child)
}
</script>

<template>
  <div class="tree-node">
    <div class="tree-node-label" @click="handleClick">
      <span class="toggle">
        <span :class="['arrow', { expanded: node.expanded }]"></span>
      </span>
      <span class="icon folder" />
      <span>{{ node.name }}</span>
    </div>
    <ul v-if="node.expanded && node.children && node.children.length" class="tree-children">
      <li v-for="child in node.children" :key="child.path">
        <FileTreeNode :node="child" @click-node="handleChildClick" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tree-node-label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}

.tree-node-label:hover {
  background: #e5e7eb;
}

.tree-children {
  list-style: none;
  margin: 0;
  padding-left: 16px;
}

.toggle {
  display: inline-block;
  width: 14px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow {
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 6px solid #6b7280; /* 小三角，默认向右 */
  transition: transform 0.15s ease;
}

.arrow.expanded {
  transform: rotate(90deg); /* 展开时向下 */
}

.icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon.folder::before {
  content: '📁';
}
</style>

