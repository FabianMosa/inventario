/**
 * Cabecera de página consistente: título, descripción opcional y zona de acciones (CTAs) alineada en desktop.
 */
export function PageHeader({ title, description, actions = null }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="ui-page-title">{title}</h1>
        {description ? <p className="ui-page-desc">{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{actions}</div>
      ) : null}
    </div>
  );
}
