export function BandeauFactice({ factice }: { factice: boolean }) {
  if (!factice) return null;
  return (
    <p
      role="status"
      className="mb-6 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      Données factices : le pipeline de l'équipe data n'a pas encore tourné.
    </p>
  );
}
