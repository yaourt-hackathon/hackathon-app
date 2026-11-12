import { Alert } from '@heroui/react';

export function BandeauFactice({ factice }: { factice: boolean }) {
  if (!factice) return null;
  return (
    <Alert status="warning" role="status" className="mb-6">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Données factices</Alert.Title>
        <Alert.Description>
          Le pipeline de l'équipe data n'a pas encore tourné.
        </Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
