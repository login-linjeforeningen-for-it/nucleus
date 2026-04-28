import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import Space from '@components/shared/utils'
import { updateCourseNotes } from '@utils/course/course'
import NotesHeader from './notesHeader'
import NotesEditor, { Mode } from './notesEditor'

type ReadOnlyProps = {
    courseId: number
    text: string
    onSaved?: (notes: string) => void
}

function normalizeNotes(text: string) {
    return text.replace(/<br><\/br>/g, '\n').replace(/<br>/g, '\n')
}

export default function ReadOnly({ courseId, text, onSaved }: ReadOnlyProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login, token } = useSelector((state: ReduxState) => state.login)
    const [draft, setDraft] = useState(normalizeNotes(text))
    const [savedText, setSavedText] = useState(normalizeNotes(text))
    const [mode, setMode] = useState<Mode>(text.trim().length ? 'preview' : 'edit')
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    useEffect(() => {
        const normalized = normalizeNotes(text)
        setDraft(normalized)
        setSavedText(normalized)
    }, [text])

    const dirty = (draft !== savedText) && savedText.trim().length > 0
    const trimmedDraft = draft.trim()
    const canSave = login && trimmedDraft.length > 0 && dirty && !saving

    const emptyText = lang
        ? 'Det finnes ingen notater enda. Start med et kort sammendrag, lenker eller markdown.'
        : 'There are no notes yet. Start with a short summary, links, or markdown.'
    const saveLabel = saving
        ? (lang ? 'Lagrer...' : 'Saving...')
        : (lang ? 'Lagre' : 'Save')
    const resetLabel = lang ? 'Tilbakestill' : 'Reset'
    const editLabel = lang ? 'Rediger' : 'Edit'
    const previewLabel = lang ? 'Forhåndsvisning' : 'Preview'
    const title = lang ? 'Notater' : 'Notes'
    const subtitle = lang
        ? 'Skriv og finpuss notatene dine direkte på mobilen.'
        : 'Write and refine your notes directly on mobile.'
    const stats = login
        ? dirty
            ? (lang ? 'Ikke lagret' : 'Unsaved')
            : (lang ? 'Synkronisert' : 'Synced')
        : (lang ? 'Kun lokal redigering' : 'Local editing only')
    const wordCount = trimmedDraft.length
        ? String(trimmedDraft.split(/\s+/).filter(Boolean).length)
        : '0'

    async function handleSave() {
        if (!canSave) {
            if (!login) {
                setStatus(lang ? 'Du må logge inn for å lagre.' : 'You need to log in to save.')
            } else if (!trimmedDraft.length) {
                setStatus(lang ? 'Notatet kan ikke være tomt.' : 'Notes cannot be empty.')
            }

            return
        }

        setSaving(true)
        setStatus(null)
        const result = await updateCourseNotes(courseId, draft, token)
        setSaving(false)

        if (!result.ok) {
            setStatus(result.error || (lang ? 'Kunne ikke lagre notatene.' : 'Could not save notes.'))
            return
        }

        setSavedText(draft)
        setStatus(lang ? 'Notatene ble lagret.' : 'Notes saved.')
        setMode('preview')
        onSaved?.(draft)
    }

    function handleReset() {
        setDraft(savedText)
        setStatus(null)
    }

    return (
        <View>
            <Space height={12} />
            <View style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: theme.greyTransparentBorder,
                backgroundColor: '#ffffff08',
                overflow: 'hidden',
            }}>
                <NotesHeader
                    title={title}
                    subtitle={subtitle}
                    stats={stats}
                    wordCount={wordCount}
                    lang={lang}
                    theme={theme}
                />
                <NotesEditor
                    mode={mode}
                    setMode={setMode}
                    draft={draft}
                    setDraft={setDraft}
                    setStatus={setStatus}
                    trimmedDraft={trimmedDraft}
                    dirty={dirty}
                    saving={saving}
                    canSave={canSave}
                    status={status}
                    emptyText={emptyText}
                    editLabel={editLabel}
                    previewLabel={previewLabel}
                    resetLabel={resetLabel}
                    saveLabel={saveLabel}
                    lang={lang}
                    theme={theme}
                    onReset={handleReset}
                    onSave={handleSave}
                />
            </View>
            <Space height={120} />
        </View>
    )
}
