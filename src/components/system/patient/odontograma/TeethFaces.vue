<script setup lang="ts">
type Face = 'esquerda' | 'direita' | 'superior' | 'inferior' | 'frontal';

interface Annotation {
  tooth: number
  face: Face
  color: string
  category: string
  note: string
  createdAt: Date
}

const props = defineProps<{
  selectedFaces: Record<Face, boolean>
  tooth: string
  selectedTooth: { tooth: string | null; face: Face | null }
  annotations: Annotation[]
}>()

const emit = defineEmits<{
  (e: 'face-clicked', face: Face): void
}>()

function emitFace(face: Face) {
  emit('face-clicked', face)
}

function getFaceColor(face: Face) {
  const isSelected = props.selectedTooth.tooth === props.tooth && props.selectedTooth.face === face
  if (isSelected) return 'bg-blue-lighten-2'

  const annotation = props.annotations.find(a => a.tooth === Number(props.tooth) && a.face === face)
  if (annotation) return `bg-${annotation.color}`

  return 'bg-white'
}

function faceClass(face: Face) {
  return ['rounded-sm', 'border', getFaceColor(face)]
}
</script>

<template>
  <div class="elevation-5 teeth-face">
    <div :class="faceClass('esquerda')" class="teeth-face-left" @click.stop="emitFace('esquerda')"/>
    <div style="justify-items: center">
      <div :class="faceClass('superior')" class="teeth-face-up" @click.stop="emitFace('superior')"/>
      <div :class="faceClass('frontal')" class="teeth-face-middle" @click.stop="emitFace('frontal')"/>
      <div :class="faceClass('inferior')" class="teeth-face-bottom" @click.stop="emitFace('inferior')"/>
    </div>
    <div :class="faceClass('direita')" class="teeth-face-right" @click.stop="emitFace('direita')"/>
  </div>
</template>

<style scoped>
.teeth-face {
  border: 1px solid transparent;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.teeth-face-left {
  width: 6px;
  height: 22px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-right: 2px;
}

.teeth-face-up {
  width: 22px;
  height: 6px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-bottom: 5px;
}

.teeth-face-middle {
  width: 15px;
  height: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 5px;
}

.teeth-face-bottom {
  width: 22px;
  height: 6px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

.teeth-face-right {
  width: 6px;
  height: 22px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-left: 2px;
}

.teeth-face-left:hover,
.teeth-face-up:hover,
.teeth-face-middle:hover,
.teeth-face-bottom:hover,
.teeth-face-right:hover {
  transform: scale(1.3);
  cursor: pointer;
  z-index: 1;
}

.teeth-face-left,
.teeth-face-up,
.teeth-face-middle,
.teeth-face-bottom,
.teeth-face-right {
  transition: transform 0.2s ease;
}
</style>