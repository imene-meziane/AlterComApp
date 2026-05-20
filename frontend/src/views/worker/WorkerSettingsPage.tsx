import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Volume2 } from 'lucide-react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { speakText } from '../../services/speech';
import { User } from '../../types/models';

export function WorkerSettingsPage(): React.ReactElement {
  const { token, user, refreshProfile } = useAuth();
  const [speechRate, setSpeechRate] = useState(user?.preferences.speechRate || 0.95);
  const [speechVolume, setSpeechVolume] = useState(user?.preferences.speechVolume || 1);
  const [showSearch, setShowSearch] = useState(Boolean(user?.preferences.showSearch));
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    setSpeechRate(user.preferences.speechRate);
    setSpeechVolume(user.preferences.speechVolume);
    setShowSearch(user.preferences.showSearch);
  }, [user]);

  async function saveSettings(): Promise<void> {
    if (!user) {
      return;
    }

    setIsSaving(true);
    setFeedback('');

    try {
      await api.put<User>(
        `/users/${user.id}`,
        {
          preferences: {
            ...user.preferences,
            speechRate,
            speechVolume,
            showSearch
          }
        },
        token
      );
      await refreshProfile(token);
      setFeedback('Reglages enregistres.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Enregistrement impossible.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) {
    return <ScreenLoader message="Preparation des reglages..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Regle la voix et l affichage utile sans alourdir la navigation."
        eyebrow="Reglages"
        title="Voix et affichage"
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-6" tone="soft">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-sky text-brand">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <Badge>Lecture vocale</Badge>
              <p className="mt-2 text-xl font-black text-ink">Regler la voix</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <div className="flex items-center justify-between text-sm font-extrabold text-ink">
                <span>Vitesse</span>
                <span>{speechRate.toFixed(2)}</span>
              </div>
              <input
                className="w-full accent-brand"
                max="1.4"
                min="0.6"
                onChange={event => setSpeechRate(Number(event.target.value))}
                step="0.05"
                type="range"
                value={speechRate}
              />
            </label>

            <label className="block space-y-2">
              <div className="flex items-center justify-between text-sm font-extrabold text-ink">
                <span>Volume</span>
                <span>{speechVolume.toFixed(2)}</span>
              </div>
              <input
                className="w-full accent-brand"
                max="1"
                min="0.2"
                onChange={event => setSpeechVolume(Number(event.target.value))}
                step="0.05"
                type="range"
                value={speechVolume}
              />
            </label>
          </div>

          <Button
            iconLeft={<Volume2 className="h-4 w-4" />}
            onClick={() =>
              speakText(`Bonjour ${user.firstName}. Ton message est pret.`, {
                rate: speechRate,
                volume: speechVolume
              })
            }
            variant="secondary"
          >
            Ecouter un exemple
          </Button>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-5" tone="soft">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <Badge>Navigation</Badge>
                <p className="mt-2 text-xl font-black text-ink">Recherche et reperes</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-muted">Recherche dans les pictogrammes</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: false, label: 'Simple', hint: 'Naviguer avec les categories.' },
                  { value: true, label: 'Visible', hint: 'Afficher le champ de recherche.' }
                ].map(option => (
                  <button
                    className={`rounded-[24px] p-4 text-left ring-1 transition ${
                      showSearch === option.value
                        ? 'bg-ink text-white ring-ink'
                        : 'bg-white/90 text-ink ring-slate-200 hover:bg-white'
                    }`}
                    key={option.label}
                    onClick={() => setShowSearch(option.value)}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <span className="text-sm font-black">{option.label}</span>
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        showSearch === option.value ? 'text-white/80' : 'text-muted'
                      }`}
                    >
                      {option.hint}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Mode
                </p>
                <p className="mt-2 text-base font-black text-ink">
                  {user.preferences.displayMode === 'simplified' ? 'Simplifie' : 'Complet'}
                </p>
              </div>

              <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Atelier
                </p>
                <p className="mt-2 text-base font-black text-ink">
                  {user.assignedWorkshop?.name || 'Aucun atelier'}
                </p>
              </div>
            </div>

            <Button
              disabled={isSaving}
              iconLeft={<SlidersHorizontal className="h-4 w-4" />}
              onClick={saveSettings}
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </Card>

          {feedback ? (
            <Card className="text-sm font-bold text-muted" tone="soft">
              {feedback}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
