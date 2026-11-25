import { PiEarFill, PiCheckCircleFill } from 'react-icons/pi';
import DashboardCard from './DashboardCard';
import WaveBars from './charts/WaveBars';
import './HealthCards.css';

function AudioCard({ data }) {
  return (
    <DashboardCard
      icon={<PiEarFill />}
      iconColor="#0AD6D6"
      title="Níveis dos Fones de Ouvido"
      time={data.time}
      className="card-audio"
    >
      <div className="audio-body">
        <p className="audio-body__label">{data.exposureLabel}</p>
        <p className="audio-body__status">
          <PiCheckCircleFill className="audio-body__status-icon" aria-hidden="true" />
          {data.status}
        </p>
      </div>
      <WaveBars data={data.levels} color="#0AD6D6" />
    </DashboardCard>
  );
}

export default AudioCard;
