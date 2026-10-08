export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p>
          &copy; 2026. Inventario. Dev{" "}
          <a
            href="https://portfolio.aux8n.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Bernardo Morales
          </a>
          . Todos Los Derechos Reservados.
        </p>
      </div>
    </footer>
  );
}
