export default function EmptyState({ title, description, action, icon }) {
  return (
    <div className="neu-in flex flex-col items-center px-6 py-14 text-center">
      {icon ? <span className="text-indigo">{icon}</span> : null}
      <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
