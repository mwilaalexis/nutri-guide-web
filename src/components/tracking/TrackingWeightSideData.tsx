import type { WeightSideData } from "../../utils/weightSideData";

type Props = {
  data: WeightSideData;
};

export default function TrackingWeightSideData({ data }: Props) {
  return (
    <aside className="tracking-side-data" aria-label="Résumé poids">
      <h3 className="tracking-side-data__title">Résumé</h3>
      <ul className="tracking-side-data__list">
        {data.stats.map((item) => (
          <li
            key={item.label}
            className={`tracking-side-data__item tracking-side-data__item--${item.tone ?? "default"}`}
          >
            <span className="tracking-side-data__label">{item.label}</span>
            <span className="tracking-side-data__value">{item.value}</span>
            {item.hint ? <span className="tracking-side-data__hint">{item.hint}</span> : null}
          </li>
        ))}
      </ul>
      {!data.hasData ? (
        <p className="tracking-side-data__empty">Enregistrez une première pesée pour remplir ce panneau.</p>
      ) : null}
    </aside>
  );
}
