import { useAlerts } from '@/components/alert/useAlerts';
import { useRequest } from '@/hooks/RequestContext';

interface ActionButtonsProps {
  recordId: number;
}

export default function ActionButtons({ recordId }: ActionButtonsProps) {
  return <div>ActionButtons for record {recordId}</div>;
}
