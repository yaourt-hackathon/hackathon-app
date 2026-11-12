import {
  Alert,
  Button,
  Label,
  TextArea,
  TextField,
  toast,
} from '@heroui/react';
import { useRef, useState } from 'react';
import {
  separerSource,
  surligner,
  texteACopier,
} from '@/features/tournee/appel';
import { libelleOrigine } from '@/features/tournee/libelles';
import { copier } from '@/features/tournee/presse-papiers';
import type { AppelClient } from '@/features/tournee/tournee';
import { motsInterdits } from '@/features/tournee/vocabulaire';

// Story 6 ★ : le fait (et sa source), puis la question. Le commercial peut les
// retoucher pour cet appel ; rien n'est enregistré (pas un CRM). À monter avec
// `key={compte_id}` : changer de client repart du texte d'origine.
export function PhraseAppel({ appel }: { appel: AppelClient }) {
  const [fait, setFait] = useState(appel.fait);
  const [question, setQuestion] = useState(appel.question);
  const [edition, setEdition] = useState(false);
  const modifie = fait !== appel.fait || question !== appel.question;
  // « Rétablir » disparaît une fois cliqué : le focus revient à « Modifier »
  const boutonEdition = useRef<HTMLButtonElement>(null);
  const aEviter = motsInterdits(`${fait} ${question}`);
  const { phrase, source } = separerSource(fait);
  // Les ingrédients en cause, mis en avant dans la phrase (maquette v6)
  const termes = [
    ...new Set((appel.produits ?? []).flatMap((p) => p.elements_directs)),
  ];

  async function copierPhrase() {
    if (await copier(texteACopier(fait, question))) {
      toast.success('Phrase copiée', {
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
    <div className="flex shrink-0 flex-col gap-3.5 rounded-2xl border border-accent bg-surface p-5">
      {edition ? (
        <div className="flex flex-col gap-4">
          <TextField value={fait} onChange={setFait}>
            <Label>Le fait</Label>
            {/* Ouvert par « Modifier » : on écrit tout de suite */}
            <TextArea rows={4} autoFocus />
          </TextField>
          <TextField value={question} onChange={setQuestion}>
            <Label>La question</Label>
            <TextArea rows={2} />
          </TextField>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 text-base leading-6">
          <p data-texte="fait">
            {surligner(phrase, termes).map((m, i) =>
              m.enAvant ? (
                <mark key={i} className="bg-transparent text-accent">
                  {m.texte}
                </mark>
              ) : (
                m.texte
              ),
            )}
            {source && (
              <span className="mt-1 block text-xs leading-4 text-muted">
                Source : {source}
              </span>
            )}
          </p>
          <p data-texte="question">{question}</p>
        </div>
      )}

      {/* Région annoncée : l'avertissement et « Modifié » sont lus au lecteur
          d'écran (Alert de HeroUI n'en est pas une) */}
      <div role="status" className="flex flex-col gap-3 empty:hidden">
        {aEviter.length > 0 && (
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                À éviter : « {aEviter.join(' », « ')} ». Une étiquette publique
                ne donne pas les concentrations : dites « exposition probable ».
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
        {modifie && (
          <p className="text-xs text-muted">
            Modifié pour cet appel, rien n'est enregistré.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <p className="min-w-40 flex-1 text-xs text-muted">
          {libelleOrigine[appel.origine_textes]}
        </p>
        {modifie && (
          <Button size="sm" variant="ghost" onPress={retablir}>
            Rétablir le texte
          </Button>
        )}
        <Button
          ref={boutonEdition}
          size="sm"
          variant="secondary"
          onPress={() => setEdition(!edition)}
        >
          {edition ? 'Terminer' : 'Modifier'}
        </Button>
        <Button size="sm" variant="primary" onPress={() => void copierPhrase()}>
          Copier la phrase
        </Button>
      </div>
    </div>
  );
}
