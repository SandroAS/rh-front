<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useColaboradoresStore, type Marco } from '@/stores/colaborators.store' // Caminho correto para o store
import { useRoute } from 'vue-router';

const colaboradoresStore = useColaboradoresStore();
const route = useRoute();

// Marcos é um computed que retorna o array de marcos do store
const marcos = computed<Marco[]>(() => {
  // Garante que route.params.id seja uma string e que exista
  const colaboradorId = Array.isArray(route.params.uuid) ? route.params.uuid[0] : route.params.uuid;
  if (!colaboradorId) return []; // Retorna um array vazio se o ID não estiver disponível
  return colaboradoresStore.getMarcosByColaborador(colaboradorId);
});

const roadmapRef = ref<HTMLElement>();
const svgWidth = ref(1400);
const svgHeight = ref(500);

// Caminho da estrada com curvas suaves (formato S mais amplo)
const roadPath = computed(() => {
  return `M 80 250
          Q 250 150, 400 200
          Q 550 250, 700 180
          Q 850 110, 1000 160
          Q 1150 210, 1320 220`;
});

// Processar marcos para posicionamento na estrada
const processedMarcos = computed(() => {
  // AQUI ESTÁ A CORREÇÃO: acesse o valor do computed `marcos` com `.value`
  const sortedMarcos = [...marcos.value].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Pontos ao longo da curva da estrada - coordenadas precisas
  const roadPoints = [
    { x: 120, y: 240 },   // Início
    { x: 320, y: 175 },   // Primeira curva
    { x: 520, y: 225 },   // Meio-início
    { x: 720, y: 165 },   // Meio
    { x: 920, y: 135 },   // Segunda curva
    { x: 1120, y: 185 },  // Terceira curva
    { x: 1280, y: 215 }   // Final
  ];

  return sortedMarcos.map((marco, index) => {
    // Distribuir marcos ao longo dos pontos disponíveis
    // Garante que o índice não ultrapasse o tamanho de roadPoints
    const pointIndex = Math.min(index, roadPoints.length - 1);
    const point = roadPoints[pointIndex];

    // Determinar se o marco foi completado (baseado na data)
    const completed = new Date(marco.date) <= new Date();

    return {
      ...marco,
      x: point.x,
      y: point.y,
      completed
    };
  });
});

// Função para calcular posição dos cards com alternância
const getCardPosition = (marco: { x: number; y: number }, index: number) => { // Tipagem para 'marco'
  const svgRect = { width: svgWidth.value, height: svgHeight.value }; // Usar valores reativos
  const cardWidth = 280; // Definido em px
  const cardHeight = 150; // Altura estimada do card para cálculo
  const spacing = 40; // Espaçamento entre o ponto do marco e o card

  // Calcular posição percentual baseada no SVG para o 'left'
  // Ajuste para centralizar o card no ponto X do marco
  const leftPx = marco.x - (cardWidth / 2);
  const leftPercent = (leftPx / svgRect.width) * 100;

  // Alternar posição: índices pares ficam acima, ímpares ficam abaixo
  const isAbove = index % 2 === 0;

  let topPx: number;
  let bottomPx: number;

  if (isAbove) {
    // Posiciona o card acima do marco, com um espaçamento
    topPx = marco.y - cardHeight - spacing;
    // Garante que o card não saia do topo da SVG
    topPx = Math.max(topPx, 20); // Mínimo de 20px do topo
    bottomPx = NaN; // Não usar bottom
  } else {
    // Posiciona o card abaixo do marco, com um espaçamento
    topPx = marco.y + spacing;
    // Garante que o card não saia da base da SVG
    topPx = Math.min(topPx, svgRect.height - cardHeight - 20); // Máximo de 20px da base
    bottomPx = NaN; // Não usar bottom
  }

  return {
    left: `${marco.x - 30}px`,
    top: isAbove ? `${(topPx / svgRect.height) * 100}%` : 'auto',
    bottom: !isAbove ? `${((svgRect.height - (topPx + cardHeight)) / svgRect.height) * 100}%` : 'auto', // Ajuste para bottom
    transform: 'none'
  };
};

const getMarcoColor = (type: string, completed: boolean) => {
  if (!completed) return '#BDBDBD'

  switch (type) {
    case 'admissao': return '#4CAF50'
    case 'onboarding': return '#2196F3'
    case 'treinamento': return '#FF9800'
    case 'meta': return '#9C27B0'
    case 'promocao': return '#F44336'
    case 'feedback': return '#00BCD4'
    default: return '#757575'
  }
}

const formatDate = (dateString: string) => {
  // Use new Date(dateString) para garantir que seja um objeto Date válido
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
}

onMounted(() => {
  const updateSize = () => {
    if (roadmapRef.value) {
      const containerWidth = roadmapRef.value.offsetWidth
      // svgWidth.value = Math.max(containerWidth, 1400) // Original
      // Manter um mínimo fixo para o SVG, mas permitir que ele seja maior que o container
      // Se o container for menor que 1400px, o overflow-x do roadmap-wrapper vai ativar.
      svgWidth.value = 1400;
      // Poderia ajustar a escala do SVG para ser responsiva, mas o `viewBox` já ajuda com isso.
      // O `min-width: 1400px` no CSS do `roadmap-svg` já força a barra de rolagem.
    }
  }

  updateSize()
  window.addEventListener('resize', updateSize)

  // Limpar o listener quando o componente for desmontado
  return () => {
    window.removeEventListener('resize', updateSize)
  }
})
</script>

<template>
  <div class="roadmap-container">
    <div class="roadmap-wrapper" ref="roadmapRef">
      <svg
        class="roadmap-svg"
        :width="svgWidth"
        :height="svgHeight"
        viewBox="0 0 1400 500"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="100%" style="stop-color:#1976D2;stop-opacity:1" />
          </linearGradient>

          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/>
          </filter>
        </defs>

        <path
          :d="roadPath"
          fill="none"
          stroke="url(#roadGradient)"
          stroke-width="80"
          stroke-linecap="round"
          opacity="0.9"
          filter="url(#shadow)"
        />

        <path
          :d="roadPath"
          fill="none"
          stroke="white"
          stroke-width="4"
          stroke-dasharray="20,15"
          stroke-linecap="round"
          opacity="0.9"
        />

        <g v-for="(marco, index) in processedMarcos" :key="marco.id">
          <circle
            :cx="marco.x"
            :cy="marco.y"
            :r="marco.completed ? 30 : 25"
            :fill="getMarcoColor(marco.type, marco.completed)"
            :stroke-width="marco.completed ? 5 : 3"
            class="marco-circle"
            :class="{ 'marco-completed': marco.completed, 'marco-pending': !marco.completed }"
            filter="url(#shadow)"
          />

          <text
            :x="marco.x"
            :y="marco.y + 8"
            text-anchor="middle"
            :font-size="marco.completed ? 24 : 20"
            class="marco-icon"
            fill="white"
            font-weight="bold"
          >
            {{ marco.icon }}
          </text>
        </g>
      </svg>

      <div class="marcos-info">
        <div
          v-for="(marco, index) in processedMarcos"
          :key="`info-${marco.id}`"
          class="marco-card"
          :class="{ 'marco-card-above': index % 2 === 0, 'marco-card-below': index % 2 === 1 }"
          :style="getCardPosition(marco, index)"
        >
          <v-card
            :color="marco.completed ? 'success' : 'grey-lighten-4'"
            :variant="marco.completed ? 'tonal' : 'outlined'"
            class="marco-info-card"
            elevation="4"
          >
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <span class="text-h5 mr-3">{{ marco.icon }}</span>
                <div class="flex-grow-1">
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ marco.title }}
                  </div>
                  <div class="d-flex">
                    <div class="text-caption text-grey-darken-1 mr-2">
                      {{ formatDate(marco.date) }}
                    </div>
                    <v-chip
                      v-if="marco.completed"
                      size="x-small"
                      color="success"
                    >
                      Concluído
                    </v-chip>
                    <v-chip
                      v-else
                      size="x-small"
                      color="grey"
                    >
                      Pendente
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
          <div class="line-marco" :style="{'bottom': (index % 2 === 0 ? (-96) : 67) +'px'}"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roadmap-container {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.roadmap-wrapper {
  position: relative;
  width: 100%;
  overflow-x: auto; /* Permite rolagem horizontal se o SVG for maior que o container */
  overflow-y: none; /* Permite que os cards de info saiam da área do wrapper se necessário */
}

.roadmap-svg {
  min-width: 1400px; /* Define a largura mínima do SVG para ativar a rolagem */
  width: 100%; /* Permite que o SVG se estenda se o container for maior que min-width */
  height: 100%;
}

.marco-completed {
  animation: pulse 2s infinite;
}

.marco-pending {
  opacity: 0.7;
}

.marco-icon {
  pointer-events: none;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.marcos-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Permite interagir com os cards, mas não com o div wrapper */
}

.marco-card {
  position: absolute;
  width: 280px;
  pointer-events: all; /* Permite interagir com o card em si */
  z-index: 10;
}

/* Estilos específicos para cards acima e abaixo */
.marco-card-above {
  /* Cards acima da estrada */
}

.marco-card-below {
  /* Cards abaixo da estrada */
}

.marco-info-card {
  backdrop-filter: blur(10px);
  border: 0px solid transparent;
  transition: all 0.3s ease;
}

.marco-info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.line-marco {
  position: absolute;
  height: 95px;
  width: 1px;
  background-color: #ccc;
  left: 30px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .roadmap-container {
    padding: 20px;
    min-height: 500px;
  }

  .marco-card {
    width: 220px; /* Reduz a largura do card para telas menores */
  }

  .roadmap-svg {
    min-width: 1000px; /* Reduz o min-width do SVG para rolagem em telas menores */
  }

  .roadmap-wrapper {
    height: 400px;
  }
}

@media (max-width: 480px) {
  .roadmap-container {
    padding: 16px;
  }

  .marco-card {
    width: 200px; /* Ainda mais estreito para celulares */
  }
}
</style>