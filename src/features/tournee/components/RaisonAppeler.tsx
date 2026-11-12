import {
  Alert,
  Button,
  Card,
  Label,
  Link as LienExterne,
  TextArea,
  TextField,
  toast,
} from '@heroui/react';
import { useRef, useState } from 'react';
import { texteACopier } from '@/features/tournee/appel';
import { libelleOrigine } from '@/features/tournee/libelles';
import { copier } from '@/features/tournee/presse-papiers';
import type { AppelClient } from '@/features/tournee/tournee';
import { motsInterdits } from '@/features/tournee/vocabulaire';
import type { Evenement } from '@/lib/data-api/generated';

// Story 6 ★ : le fait, sa source, la question. Le commercial peut les
// retoucher pour cet appel ; rien n'est enregistré (pas un CRM). À monter avec
// `key={compte_id}` : changer de client repart du texte d'origine.
export function RaisonAppeler({
  appel,
  evenement,
}: {
  appel: AppelClient;
  evenement: Evenement;
}) {
  const [fait, setFait] = useState(appel.fait);
  const [question, setQuestion] = useState(appel.question);
  const [edition, setEdition] = useState(false);
  const modifie = fait !== appel.fait || question !== appel.question;
  // « Rétablir » disparaît une fois cliqué : le focus revient à « Modifier »
  const boutonEdition = useRef<HTMLButtonElement>(null);
  const aEviter = motsInterdits(`${fait} ${question}`);

  async function copierRaison() {
    if (await copier(texteACopier(fait, question))) {
      toast.success("Raison d'appeler copiée", {
        description: 'Le fait et la question sont dans le presse-papiers.',
      });
    } else {
      toast.danger('Copie impossible', {
        description: 'Sélectionnez le texte et copiez-le à la main.',
      });
    }
  }

  function retablir() {
    setFait(appel.fait);
    setQuestion(appel.question);
    boutonEdition.current?.focus();
  }

  return (
    // section : un nom accessible ne se pose pas sur le div de Card
    <section aria-labelledby="raison">
      <Card>
        <Card.Header>
          <h2 id="raison" className="text-xl font-semibold">
            La raison d'appeler
          </h2>
          <Card.Description>
            {libelleOrigine[appel.origine_textes]}
          </Card.Description>
        </Card.Header>
        <Card.Content className="gap-4">
          {edition ? (
            <>
              <TextField value={fait} onChange={setFait}>
                <Label>Le fait</Label>
                {/* Ouvert par « Modifier » : on écrit tout de suite */}
                <TextArea rows={4} autoFocus />
              </TextField>
              <TextField value={question} onChange={setQuestion}>
                <Label>La question</Label>
                <TextArea rows={2} />
              </TextField>
            </>
          ) : (
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-sm text-muted">Le fait</dt>
                <dd data-texte="fait">{fait}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">La question</dt>
                <dd data-texte="question" className="text-lg font-medium">
                  {question}
                </dd>
              </div>
            </dl>
          )}
          {/* Région annoncée : l'avertissement et « Modifié » sont lus au
            lecteur d'écran (Alert de HeroUI n'en est pas une) */}
          <div role="status" className="flex flex-col gap-4">
            {aEviter.length > 0 && (
              <Alert status="warning">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>
                    À éviter : « {aEviter.join(' », « ')} ». Une étiquette
                    publique ne donne pas les concentrations : dites «
                    exposition probable ».
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            )}
            <p className="text-sm text-muted">
              {modifie && "Modifié pour cet appel, rien n'est enregistré."}
            </p>
          </div>
        </Card.Content>
        <Card.Footer className="flex flex-wrap gap-2">
          <Button variant="primary" onPress={() => void copierRaison()}>
            Copier
          </Button>
          <Button
            ref={boutonEdition}
            variant="secondary"
            onPress={() => setEdition(!edition)}
          >
            {edition ? 'Terminer' : 'Modifier'}
          </Button>
          {modifie && (
            <Button variant="tertiary" onPress={retablir}>
              Rétablir le texte
            </Button>
          )}
          {evenement.source_url && (
            <LienExterne
              href={evenement.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ms-auto self-center"
            >
              Ouvrir la source
              <LienExterne.Icon aria-hidden="true" />
            </LienExterne>
          )}
        </Card.Footer>
      </Card>
    </section>
  );
}
