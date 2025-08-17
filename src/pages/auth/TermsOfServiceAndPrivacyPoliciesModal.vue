<script setup lang="ts">
import { ref, reactive, computed, type PropType } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  modalContentKey: String as PropType<'terms' | 'privacy'>
});


const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

const modalTitle = computed(() => {
  return props.modalContentKey === 'terms' ? 'Termos de Serviço' : 'Política de Privacidade';
});

const modalContent = computed(() => {
  return props.modalContentKey === 'terms' ? termsOfServiceContent : privacyPolicyContent;
});

const termsOfServiceContent = `
  <h2>Termos de Serviço para o RH</h2>
  <p>Bem-vindo ao nosso RH! Estes Termos de Serviço regem o uso do nosso software.</p>

  <h3>1. Aceitação dos Termos</h3>
  <p>Ao acessar ou usar nosso Sistema, você concorda em cumprir e estar vinculado a estes Termos.</p>

  <h3>2. Uso do Sistema</h3>
  <ul>
    <li>O Sistema é destinado exclusivamente para a gestão de clínicas e práticas de saúde.</li>
    <li>Você é responsável por manter a confidencialidade de suas credenciais de login.</li>
    <li>Não utilize o Sistema para fins ilegais ou não autorizados.</li>
    <li>A inserção de dados falsos ou enganosos é estritamente proibida.</li>
  </ul>

  <h3>3. Propriedade Intelectual</h3>
  <p>Todo o conteúdo, recursos e funcionalidades do Sistema são de propriedade exclusiva da [Nome da Sua Empresa/Sistema] e protegidos por leis de direitos autorais e marcas registradas.</p>

  <h3>4. Limitação de Responsabilidade</h3>
  <p>O Sistema é fornecido "no estado em que se encontra", sem garantias de qualquer tipo. Não nos responsabilizamos por quaisquer danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso ou da incapacidade de usar o Sistema.</p>
  <p>Este sistema NÃO substitui o aconselhamento ou diagnóstico médico profissional. Ele é uma ferramenta de gestão e não deve ser usado para fornecer orientação médica direta a pacientes.</p>

  <h3>5. Rescisão</h3>
  <p>Podemos rescindir ou suspender seu acesso ao Sistema imediatamente, sem aviso prévio, por qualquer motivo, incluindo, sem limitação, a violação destes Termos.</p>

  <h3>6. Lei Aplicável</h3>
  <p>Estes Termos serão regidos e interpretados de acordo com as leis do Brasil.</p>

  <h3>7. Contato</h3>
  <p>Para quaisquer dúvidas sobre estes Termos, entre em contato conosco em suporte@rh.com.br.</p>
`;

const privacyPolicyContent = `
  <h2>Política de Privacidade do Sistema da RH</h2>
  <p>Sua privacidade é de extrema importância para nós. Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais e as informações de seus pacientes dentro do nosso Sistema da RH.</p>

  <h3>1. Informações Coletadas</h3>
  <ul>
    <li><strong>Dados da Clínica/Usuário:</strong> Nome da clínica, CNPJ, endereço, informações de contato do administrador, dados de login.</li>
    <li><strong>Dados de Pacientes:</strong> Nome, data de nascimento, gênero, informações de contato, histórico médico, registros de consultas, diagnósticos (sensíveis).</li>
    <li><strong>Dados de Uso:</strong> Informações sobre como você interage com o Sistema (logs de acesso, recursos utilizados), para melhoria do serviço.</li>
  </ul>

  <h3>2. Como Usamos Suas Informações</h3>
  <p>Utilizamos as informações coletadas para:</p>
  <ul>
    <li>Fornecer e manter o funcionamento do RH.</li>
    <li>Processar e gerenciar agendamentos e registros de pacientes.</li>
    <li>Melhorar e personalizar sua experiência no Sistema.</li>
    <li>Garantir a segurança e integridade dos dados.</li>
    <li>Cumprir obrigações legais e regulatórias (ex: LGPD, regulamentações de saúde).</li>
  </ul>

  <h3>3. Compartilhamento de Informações</h3>
  <p>Nós NÃO vendemos, alugamos ou trocamos suas informações pessoais ou dados de pacientes com terceiros.</p>
  <p>Podemos compartilhar informações apenas sob as seguintes circunstâncias:</p>
  <ul>
    <li>Com seu consentimento explícito.</li>
    <li>Para processadores de dados terceirizados que nos auxiliam na operação do Sistema (ex: provedores de hospedagem, serviços de e-mail), sob rigorosos acordos de confidencialidade e segurança.</li>
    <li>Quando exigido por lei ou ordem judicial.</li>
  </ul>

  <h3>4. Segurança dos Dados</h3>
  <p>Implementamos medidas de segurança técnicas e organizacionais robustas para proteger seus dados e os dados de seus pacientes contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia, controle de acesso e auditorias de segurança.</p>
  <p>Dados sensíveis de saúde são tratados com o mais alto nível de confidencialidade e em conformidade com as leis de privacidade de dados aplicáveis.</p>

  <h3>5. Seus Direitos</h3>
  <p>Você tem o direito de acessar, corrigir, atualizar ou solicitar a exclusão de suas informações pessoais e dos dados de pacientes que você gerencia no Sistema, sujeito às obrigações legais de retenção de dados.</p>

  <h3>6. Retenção de Dados</h3>
  <p>Retemos as informações pelo tempo necessário para fornecer os serviços e cumprir nossas obrigações legais.</p>

  <h3>7. Alterações nesta Política</h3>
  <p>Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova Política nesta página.</p>

  <h3>8. Contato</h3>
  <p>Para dúvidas sobre esta Política de Privacidade ou sobre suas informações, entre em contato conosco em suporte@rh.com.br.</p>
`;
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="800">
    <v-card>
      <v-card-title class="headline">{{ modalTitle }}</v-card-title>
      <v-card-text>
        <div v-html="modalContent" class="modal-content-scroll"></div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="close">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.modal-content-scroll {
  max-height: 70vh; /* Ajuste a altura conforme necessário */
  overflow-y: auto;
  padding-right: 16px; /* Espaço para a barra de rolagem */
}

/* Estilos básicos para o conteúdo HTML dentro do modal */
.modal-content-scroll h2 {
  font-size: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.modal-content-scroll h3 {
  font-size: 1.25rem;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}

.modal-content-scroll p {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.modal-content-scroll ul {
  margin-bottom: 0.75rem;
  padding-left: 20px;
}
</style>