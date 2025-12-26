import { EvaluationType } from '@/types/evaluationApplication/evaluation-application.type';

export default (type: EvaluationType) => {
  switch (type) {
    case EvaluationType.PEER: return 'Por Pares';
    case EvaluationType.SELF: return 'Autoavaliação';
    case EvaluationType.LEADER: return 'Por Líder';
    case EvaluationType.SUBORDINATE: return 'Por Subordinado';
    default: return type;
  }
};