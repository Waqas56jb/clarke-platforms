import { useEffect, useRef } from 'react';
import { drawChart } from '../utils/drawChart';

const RANGES = ['1D', '1W', '1M', '1Y'];

export default function PriceChart() {
  const canvasRef = useRef(null);
  useEffect(() => drawChart(canvasRef.current), []);
  return (
    <div className="panel chartpanel" id="charts">
      <div className="chart-head">
        <div>
          <h3>CC / GBP — PRICE CHART</h3>
          <div className="muted">Illustrative chart • no live market feed</div>
        </div>
        <div className="tabs">
          {RANGES.map((r, i) => (
            <button key={r} className={i === 0 ? 'selected' : undefined}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <canvas id="chart" ref={canvasRef} width="800" height="300"></canvas>
      <div className="muted">A live chart will require a deployed exchange and verified trade data.</div>
    </div>
  );
}
