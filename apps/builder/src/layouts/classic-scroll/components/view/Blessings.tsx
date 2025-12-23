import { getDefaultAssetUrl } from '../../../../services/defaultAssetService';

function Blessings() {
  return (
    <>
      <div className="blessing-icon ganesh">
        <img src={getDefaultAssetUrl('icons', null, 'Ganesh.jpeg')} alt="Shri Ganesh" className="ganesh-img" />
      </div>

      <div className="ganesh-slok">
        <span className="ganesh-symbol">🕉</span>
        <span className="ganesh-text">
          Vakratunda Mahakaya Suryakoti Samaprabha<br />
          Nirvighnam Kuru Me Deva Sarva Karyeshu Sarvada
        </span>
        <span className="ganesh-symbol">🕉</span>
      </div>

      <div className="blessing-icon kalash">
        <img src={getDefaultAssetUrl('icons', null, 'Kalash.png')} alt="Shubh Kalash" className="kalash-img" />
      </div>
    </>
  );
}

export default Blessings;

